import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";
import { budgetSchema, budgetQuerySchema } from "@/lib/validations/budget";
import { z } from "zod";

export async function GET(request: NextRequest) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureSessionUser(session);

        const { searchParams } = new URL(request.url);
        const queryParams = {
            categoryId: searchParams.get("categoryId"),
            period: searchParams.get("period"),
            isActive: searchParams.get("isActive"),
        };

        const validatedParams = budgetQuerySchema.parse(queryParams);

        // Build where clause
        const where: any = {
            userId: session.user.id,
        };

        if (validatedParams.categoryId) {
            where.categoryId = validatedParams.categoryId;
        }

        if (validatedParams.period) {
            where.period = validatedParams.period;
        }

        if (validatedParams.isActive !== undefined) {
            const now = new Date();
            if (validatedParams.isActive) {
                where.startDate = { lte: now };
                where.endDate = { gte: now };
            } else {
                where.OR = [
                    { startDate: { gt: now } },
                    { endDate: { lt: now } },
                ];
            }
        }

        const budgets = await prisma.budget.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: {
                createdAt: "desc",
            },
        });

        return NextResponse.json({ success: true, data: budgets });
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
        console.error("Error fetching budgets:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
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

        await ensureSessionUser(session);

        const body = await request.json();
        const validatedData = budgetSchema.parse(body);

        // Calculate start and end dates based on period
        const now = new Date();
        let startDate: Date;
        let endDate: Date;

        switch (validatedData.period) {
            case "DAILY":
                startDate = new Date(now);
                startDate.setHours(0, 0, 0, 0); // Start of day
                endDate = new Date(now);
                endDate.setHours(23, 59, 59, 999); // End of day
                break;
            case "WEEKLY":
                startDate = new Date(now);
                startDate.setDate(now.getDate() - now.getDay()); // Start of week
                endDate = new Date(startDate);
                endDate.setDate(startDate.getDate() + 6); // End of week
                break;
            case "MONTHLY":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "YEARLY":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Check if budget already exists for this category and period
        const existingBudget = await prisma.budget.findFirst({
            where: {
                userId: session.user.id,
                categoryId: validatedData.categoryId,
                period: validatedData.period,
                startDate: { lte: endDate },
                endDate: { gte: startDate },
            },
        });

        if (existingBudget) {
            return NextResponse.json(
                {
                    success: false,
                    message:
                        "Budget already exists for this category and period",
                },
                { status: 409 }
            );
        }

        const budget = await prisma.budget.create({
            data: {
                amount: validatedData.amount,
                period: validatedData.period,
                categoryId: validatedData.categoryId,
                userId: session.user.id,
                startDate,
                endDate,
            },
            include: {
                category: true,
            },
        });

        return NextResponse.json(
            { success: true, data: budget },
            { status: 201 }
        );
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
        console.error("Error creating budget:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
