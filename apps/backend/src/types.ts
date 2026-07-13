import { z } from "zod";

export const SignupSchema = z.object({
    email: z.email()
})

export const CreateContestSchema = z.object({
    title: z.string().min(1),
    startTime: z.string().datetime()
})

export const CreateChallengeSchema = z.object({
    title: z.string().min(1),
    notionDocId: z.string().min(1),
    maxPoints: z.number().int().positive()
})

export const LinkChallengeSchema = z.object({
    index: z.number().int().nonnegative()
})
