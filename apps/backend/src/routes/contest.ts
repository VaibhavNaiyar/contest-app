import { Router } from "express";
import { userMiddleware } from "../middleware/user";
import { client } from "@repo/db";
import { PaginationSchema } from "../types";
import { getNotionPage } from "../notion";

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

// leaderboard must be before /:contestId — otherwise "leaderboard" gets matched as a contestId
router.get("/leaderboard/:contestId", async (req, res) => {
    const { contestId } = req.params;

    const leaderboard = await client.leaderBoard.findMany({
        where: { contestId },
        orderBy: { rank: "asc" },
        select: {
            rank: true,
            totalPoints: true,
            user: { select: { id: true, email: true } }
        }
    });

    res.json({ leaderboard });
})

// returns contest details + all challenges ordered by index
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

// returns challenge detail + problem content from Notion
router.get("/:contestId/:challengeId", userMiddleware, async (req, res) => {
    const { contestId, challengeId } = req.params;

    const mapping = await client.contestToChallengeMapping.findFirst({
        where: { contestId, challengeId },
        select: {
            index: true,
            challenge: {
                select: {
                    id: true,
                    title: true,
                    maxPoints: true,
                    notionDocId: true
                }
            }
        }
    });

    if (!mapping) {
        res.status(404).json({ message: "Challenge not found in this contest" });
        return;
    }

    const content = await getNotionPage(mapping.challenge.notionDocId);

    res.json({
        challenge: {
            id: mapping.challenge.id,
            title: mapping.challenge.title,
            maxPoints: mapping.challenge.maxPoints,
            content
        }
    });
})

router.post("/submit/:challengeId", userMiddleware, (req, res) => {
    // Phase 3 — OpenAI judging
})

export default router;
