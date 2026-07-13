import { z } from "zod";

export const SignupSchema = z.object({
    email: z.email()
})

export const CreateContestSchema = z.object({
    title: z.string().min(1),
    startTime: z.string().datetime(),
    endTime: z.string().datetime()
})

export const CreateChallengeSchema = z.object({
    title: z.string().min(1),
    notionDocId: z.string().min(1),
    maxPoints: z.number().int().positive()
})

export const LinkChallengeSchema = z.object({
    index: z.number().int().nonnegative()
})

export const PaginationSchema = z.object({
    page: z.coerce.number().int().positive().default(1),
    limit: z.coerce.number().int().positive().max(50).default(10)
})

export const SubmitSchema = z.object({
    contestId: z.string().min(1),
    code: z.string().min(1)
})
