import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createCategorySchema } from "@/lib/validations/category";
import { ensureSessionUser } from "@/lib/auth-utils";
import { z } from "zod";

export async function GET() {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Ensure session user exists in database
        await ensureSessionUser(session);

        const categories = await prisma.category.findMany({
            orderBy: { name: "asc" },
        });

        return NextResponse.json({
            success: true,
            data: categories,
        });
    } catch (error) {
        console.error("Error fetching categories:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 }
        );
    }
}

export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        // Ensure session user exists in database
        await ensureSessionUser(session);

        const body = await request.json();
        const validatedData = createCategorySchema.parse(body);

        // Check if category already exists
        const existingCategory = await prisma.category.findUnique({
            where: { name: validatedData.name },
        });

        if (existingCategory) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Category with this name already exists",
                },
                { status: 400 }
            );
        }

        const category = await prisma.category.create({
            data: {
                name: validatedData.name,
                color: validatedData.color || "#DC143C",
                icon: validatedData.icon,
            },
        });

        return NextResponse.json({
            success: true,
            data: category,
        });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: error.errors,
                },
                { status: 400 }
            );
        }

        console.error("Error creating category:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 }
        );
    }
}
