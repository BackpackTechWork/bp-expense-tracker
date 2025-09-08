import { z } from "zod"

// User validation schemas
export const signUpSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50, "Name must be less than 50 characters"),
  email: z.string().email("Please enter a valid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .regex(
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/,
      "Password must contain at least one uppercase letter, one lowercase letter, and one number",
    ),
})

export const signInSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

// Expense validation schemas
export const expenseSchema = z.object({
  amount: z.number().positive("Amount must be greater than 0").max(999999.99, "Amount is too large"),
  description: z.string().min(1, "Description is required").max(200, "Description must be less than 200 characters"),
  categoryId: z.string().min(1, "Category is required"),
  date: z.date(),
  receiptUrl: z.string().url().optional().or(z.literal("")),
})

export const expenseUpdateSchema = expenseSchema.partial().extend({
  id: z.string().min(1, "Expense ID is required"),
})

// Budget validation schemas
export const budgetSchema = z.object({
  categoryId: z.string().min(1, "Category is required"),
  amount: z.number().positive("Budget amount must be greater than 0").max(999999.99, "Budget amount is too large"),
  period: z.enum(["MONTHLY", "WEEKLY", "YEARLY"]),
})

// Savings goal validation schemas
export const savingsGoalSchema = z.object({
  name: z.string().min(1, "Goal name is required").max(100, "Goal name must be less than 100 characters"),
  targetAmount: z
    .number()
    .positive("Target amount must be greater than 0")
    .max(999999.99, "Target amount is too large"),
  currentAmount: z.number().min(0, "Current amount cannot be negative").max(999999.99, "Current amount is too large"),
  targetDate: z.date().min(new Date(), "Target date must be in the future"),
})

// Admin validation schemas
export const userUpdateSchema = z.object({
  name: z
    .string()
    .min(2, "Name must be at least 2 characters")
    .max(50, "Name must be less than 50 characters")
    .optional(),
  email: z.string().email("Please enter a valid email address").optional(),
  role: z.enum(["USER", "ADMIN"]).optional(),
  isBanned: z.boolean().optional(),
})

// Query validation schemas
export const dateRangeSchema = z.object({
  startDate: z.string().datetime().optional(),
  endDate: z.string().datetime().optional(),
  period: z.enum(["week", "month", "year", "all"]).optional(),
})

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
})

// Type exports
export type SignUpInput = z.infer<typeof signUpSchema>
export type SignInInput = z.infer<typeof signInSchema>
export type ExpenseInput = z.infer<typeof expenseSchema>
export type ExpenseUpdateInput = z.infer<typeof expenseUpdateSchema>
export type BudgetInput = z.infer<typeof budgetSchema>
export type SavingsGoalInput = z.infer<typeof savingsGoalSchema>
export type UserUpdateInput = z.infer<typeof userUpdateSchema>
export type DateRangeInput = z.infer<typeof dateRangeSchema>
export type PaginationInput = z.infer<typeof paginationSchema>
