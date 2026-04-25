import { z } from "zod";

export const generateResponseSchema = z.object({
    body: z.object({
        studentQuery: z.string().min(1, "Query is required").max(1000, "Query too long"),
        performanceData: z.record(z.any()).optional(),
        conversationHistory: z.array(
            z.object({
                role: z.enum(["user", "assistant"]),
                content: z.string().min(1)
            })
        ).optional(),
    }),
});
