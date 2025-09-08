import { z } from "zod";

export const budgetSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z
        .number()
        .positive("Budget amount must be greater than 0")
        .max(999999.99, "Budget amount is too large"),
    period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]),
});

export const budgetQuerySchema = z.object({
    categoryId: z
        .string()
        .optional()
        .nullable()
        .transform((val) => {
            if (!val || val === "null" || val === "undefined") return undefined;
            return val;
        }),
    period: z.enum(["DAILY", "WEEKLY", "MONTHLY", "YEARLY"]).optional(),
    isActive: z
        .string()
        .optional()
        .transform((val) => {
            if (val === undefined) return undefined;
            return val === "true";
        }),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
export type BudgetQuery = z.infer<typeof budgetQuerySchema>;
