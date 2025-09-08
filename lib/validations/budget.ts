import { z } from "zod";

export const budgetSchema = z.object({
    categoryId: z.string().min(1, "Category is required"),
    amount: z
        .number()
        .positive("Budget amount must be greater than 0")
        .max(999999.99, "Budget amount is too large"),
    period: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]),
});

export type BudgetInput = z.infer<typeof budgetSchema>;
