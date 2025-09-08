import { z } from "zod";

export const savingsGoalSchema = z.object({
    name: z
        .string()
        .min(1, "Goal name is required")
        .max(100, "Goal name must be less than 100 characters"),
    targetAmount: z
        .number()
        .positive("Target amount must be greater than 0")
        .max(999999.99, "Target amount is too large"),
    currentAmount: z
        .number()
        .min(0, "Current amount cannot be negative")
        .max(999999.99, "Current amount is too large"),
    targetDate: z.date().min(new Date(), "Target date must be in the future"),
});

export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>;
