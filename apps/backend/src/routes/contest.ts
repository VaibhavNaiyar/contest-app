import { Router } from "express";
import { userMiddleware } from "../middleware/user";
import { client } from "@repo/db";
import { PaginationSchema, SubmitSchema } from "../types";
import { getNotionPage, blocksToText } from "../notion";
import { judgeSubmission } from "../openai";

const router: Router = Router();

router.get("/active", async (req, res) => {
    const { success, data } = PaginationSchema.safeParse(req.query);
    if (!success) {
        res.status(411).json({ message: "Invalid pagination params" });
        return;
    }

    const now = new Date();
    const contests = await client.contest.findMany({
        where: {
            startTime: { lte: now },
            endTime: { gte: now }
        },
        orderBy: { startTime: "desc" },
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        select: { id: true, title: true, startTime: true, endTime: true }
    });

    res.json({ contests });
})

router.get("/finished", async (req, res) => {
    const { success, data } = PaginationSchema.safeParse(req.query);
    if (!success) {
        res.status(411).json({ message: "Invalid pagination params" });
        return;
    }

    const now = new Date();
    const contests = await client.contest.findMany({
        where: {
            endTime: { lt: now }
        },
        orderBy: { startTime: "desc" },
        skip: (data.page - 1) * data.limit,
        take: data.limit,
        select: { id: true, title: true, startTime: true, endTime: true }
    });

    res.json({ contests });
})

// must be before /:contestId — "leaderboard" would otherwise match as a contestId
router.get("/leaderboard/:contestId", async (req, res) => {
    const { contestId } = req.params;

    const entries = await client.leaderBoard.findMany({
        where: { contestId },
        orderBy: { totalPoints: "desc" },
        select: {
            totalPoints: true,
            user: { select: { id: true, email: true } }
        }
    });

    // rank is derived from position — no need to store it
    const leaderboard = entries.map((entry, index) => ({
        rank: index + 1,
        totalPoints: entry.totalPoints,
        user: entry.user
    }));

    res.json({ leaderboard });
})

router.get("/:contestId", userMiddleware, async (req, res) => {
    const { contestId } = req.params;

    const contest = await client.contest.findUnique({
        where: { id: contestId },
        select: {
            id: true,
            title: true,
            startTime: true,
            endTime: true,
            contestToChallengeMapping: {
                orderBy: { index: "asc" },
                select: {
                    index: true,
                    challenge: {
                        select: { id: true, title: true, maxPoints: true }
                    }
                }
            }
        }
    });

    if (!contest) {
        res.status(404).json({ message: "Contest not found" });
        return;
    }

    res.json({ contest });
})

router.get("/:contestId/:challengeId", userMiddleware, async (req, res) => {
    const { contestId, challengeId } = req.params;

    const mapping = await client.contestToChallengeMapping.findFirst({
        where: { contestId, challengeId },
        select: {
            index: true,
            challenge: {
                select: { id: true, title: true, maxPoints: true, notionDocId: true }
            }
        }
    });

    if (!mapping) {
        res.status(404).json({ message: "Challenge not found in this contest" });
        return;
    }

    const blocks = await getNotionPage(mapping.challenge.notionDocId);

    res.json({
        challenge: {
            id: mapping.challenge.id,
            title: mapping.challenge.title,
            maxPoints: mapping.challenge.maxPoints,
            content: blocks
        }
    });
})

router.post("/submit/:challengeId", userMiddleware, async (req, res) => {
    const { challengeId } = req.params;
    const userId = req.userId!;

    const { success, data } = SubmitSchema.safeParse(req.body);
    if (!success) {
        res.status(411).json({ message: "Invalid submission" });
        return;
    }

    const { contestId, code } = data;

    // verify challenge exists in this contest
    const mapping = await client.contestToChallengeMapping.findFirst({
        where: { contestId, challengeId },
        select: {
            id: true,
            challenge: {
                select: { maxPoints: true, notionDocId: true, title: true }
            }
        }
    });

    if (!mapping) {
        res.status(404).json({ message: "Challenge not found in this contest" });
        return;
    }

    // rate limit: max 20 submissions per user per challenge per contest
    const submissionCount = await client.contestSubmission.count({
        where: { userId, contestToChallengeMappingID: mapping.id }
    });

    if (submissionCount >= 20) {
        res.status(429).json({ message: "Max 20 submissions reached for this challenge" });
        return;
    }

    // fetch problem description from Notion and convert to plain text
    const blocks = await getNotionPage(mapping.challenge.notionDocId);
    const problemDescription = blocksToText(blocks as any[]);

    // judge with OpenAI
    const result = await judgeSubmission(problemDescription, code, mapping.challenge.maxPoints);

    // store in both submission tables
    await client.$transaction([
        client.contestSubmission.create({
            data: {
                submission: code,
                contestToChallengeMappingID: mapping.id,
                userId,
                points: result.points
            }
        }),
        client.submission.create({
            data: {
                submission: code,
                userId,
                challengeId,
                points: result.points
            }
        })
    ]);

    // update leaderboard with user's new total (best score per challenge)
    await updateLeaderboard(contestId, userId);

    res.json({
        correct: result.correct,
        points: result.points,
        feedback: result.feedback
    });
})

async function updateLeaderboard(contestId: string, userId: string) {
    // get all this user's contest submissions for this contest
    const submissions = await client.contestSubmission.findMany({
        where: {
            userId,
            contestToChallengeMapping: { contestId }
        },
        select: { contestToChallengeMappingID: true, points: true }
    });

    // keep only the best score per challenge
    const bestPerChallenge = new Map<string, number>();
    for (const sub of submissions) {
        const current = bestPerChallenge.get(sub.contestToChallengeMappingID) ?? 0;
        if (sub.points > current) {
            bestPerChallenge.set(sub.contestToChallengeMappingID, sub.points);
        }
    }

    const totalPoints = [...bestPerChallenge.values()].reduce((sum, p) => sum + p, 0);

    await client.leaderBoard.upsert({
        where: { contestId_userId: { contestId, userId } },
        create: { contestId, userId, totalPoints },
        update: { totalPoints }
    });
}

export default router;
