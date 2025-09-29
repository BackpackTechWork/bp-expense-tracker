import { z } from "zod";

export const createCategorySchema = z.object({
    name: z
        .string()
        .min(1, "Category name is required")
        .max(50, "Category name must be less than 50 characters")
        .trim()
        .refine((name) => name.length > 0, "Category name cannot be empty"),
    color: z
        .string()
        .regex(
            /^#[0-9A-F]{6}$/i,
            "Color must be a valid hex color (e.g., #DC143C)"
        )
        .optional()
        .default("#DC143C"),
    icon: z
        .string()
        .max(10, "Icon must be less than 10 characters")
        .optional()
        .nullable()
        .or(z.literal("")),
});

export const updateCategorySchema = createCategorySchema.partial();

export type CreateCategoryData = z.infer<typeof createCategorySchema>;
export type UpdateCategoryData = z.infer<typeof updateCategorySchema>;
