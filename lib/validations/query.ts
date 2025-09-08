import { z } from "zod";

export const dateRangeSchema = z.object({
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    period: z.enum(["week", "month", "year", "all"]).optional(),
});

export const paginationSchema = z.object({
    page: z
        .string()
        .transform((val) => Number.parseInt(val, 10))
        .pipe(z.number().min(1))
        .optional()
        .default("1"),
    limit: z
        .string()
        .transform((val) => Number.parseInt(val, 10))
        .pipe(z.number().min(1).max(100))
        .optional()
        .default("10"),
});

export type DateRangeInput = z.infer<typeof dateRangeSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
