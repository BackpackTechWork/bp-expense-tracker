import { z } from "zod";

export const createUserSchema = z.object({
    name: z.string().min(1, "Name is required").max(100, "Name too long"),
    email: z.string().email("Invalid email address"),
    role: z.enum(["USER", "ADMIN"]).default("USER"),
});

export const updateUserSchema = z.object({
    name: z
        .string()
        .min(1, "Name is required")
        .max(100, "Name too long")
        .optional(),
    email: z.string().email("Invalid email address").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isActive: z.boolean().optional(),
});

export const userUpdateSchema = z.object({
    name: z
        .string()
        .min(2, "Name must be at least 2 characters")
        .max(50, "Name must be less than 50 characters")
        .optional(),
    email: z.string().email("Please enter a valid email address").optional(),
    role: z.enum(["USER", "ADMIN"]).optional(),
    isBanned: z.boolean().optional(),
});

export const banUserSchema = z.object({
    banned: z.boolean(),
});

export type CreateUserInput = z.infer<typeof createUserSchema>;
export type UpdateUserInput = z.infer<typeof updateUserSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type BanUserInput = z.infer<typeof banUserSchema>;
