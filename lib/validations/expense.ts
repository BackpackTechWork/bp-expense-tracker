import { z } from "zod";

export const expenseSchema = z.object({
    amount: z
        .number()
        .positive("Amount must be greater than 0")
        .max(999999.99, "Amount is too large"),
    description: z
        .string()
        .max(200, "Description must be less than 200 characters")
        .optional()
        .nullable(),
    note: z
        .string()
        .max(500, "Note must be less than 500 characters")
        .optional()
        .nullable(),
    categoryId: z.string().min(1, "Category is required"),
    date: z.date().min(new Date("1900-01-01"), "Date must be valid"),
    receiptUrl: z.string().url().optional().or(z.literal("")),
});

export const expenseUpdateSchema = expenseSchema.partial().extend({
    id: z.string().min(1, "Expense ID is required"),
});

export type ExpenseInput = z.infer<typeof expenseSchema>;
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>;
