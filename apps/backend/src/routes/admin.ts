import { Router } from "express";
import { adminMiddleware } from "../middleware/admin";
import { client } from "@repo/db";
import { CreateChallengeSchema, CreateContestSchema, LinkChallengeSchema } from "../types";

const router: Router = Router();

router.use(adminMiddleware);

router.post("/contest", async (req, res) => {
    const { success, data } = CreateContestSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({ message: "Invalid contest data" });
        return;
    }

    const contest = await client.contest.create({
        data: {
            title: data.title,
            startTime: new Date(data.startTime)
        }
    });

    res.json({ contestId: contest.id });
})

router.post("/challenge", async (req, res) => {
    const { success, data } = CreateChallengeSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({ message: "Invalid challenge data" });
        return;
    }

    const challenge = await client.challenge.create({
        data: {
            title: data.title,
            notionDocId: data.notionDocId,
            maxPoints: data.maxPoints
        }
    });

    res.json({ challengeId: challenge.id });
})

router.post("/link/:challengeId/:contestId", async (req, res) => {
    const { challengeId, contestId } = req.params;
    const { success, data } = LinkChallengeSchema.safeParse(req.body);

    if (!success) {
        res.status(411).json({ message: "Invalid index" });
        return;
    }

    await client.contestToChallengeMapping.create({
        data: {
            contestId,
            challengeId,
            index: data.index
        }
    });

    res.json({ message: "Challenge linked to contest" });
})

router.delete("/link/:challengeId/:contestId", async (req, res) => {
    const { challengeId, contestId } = req.params;

    await client.contestToChallengeMapping.deleteMany({
        where: {
            contestId,
            challengeId
        }
    });

    res.json({ message: "Challenge unlinked from contest" });
})

export default router;
