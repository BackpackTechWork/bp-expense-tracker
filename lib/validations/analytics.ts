import { z } from "zod";

export const analyticsQuerySchema = z.object({
    period: z
        .enum(["week", "month", "year", "all"])
        .optional()
        .default("month"),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

export const spendingTrendsQuerySchema = z.object({
    period: z.enum(["week", "month", "year"]).optional().default("month"),
    months: z
        .string()
        .transform((val) => {
            const num = parseInt(val, 10);
            return isNaN(num) ? 6 : num;
        })
        .optional()
        .default(6),
});

export const categoryBreakdownQuerySchema = z.object({
    period: z
        .enum(["week", "month", "year", "all"])
        .optional()
        .default("month"),
    startDate: z.string().optional().nullable(),
    endDate: z.string().optional().nullable(),
});

export type AnalyticsQuery = z.infer<typeof analyticsQuerySchema>;
export type SpendingTrendsQuery = z.infer<typeof spendingTrendsQuerySchema>;
export type CategoryBreakdownQuery = z.infer<
    typeof categoryBreakdownQuerySchema
>;
