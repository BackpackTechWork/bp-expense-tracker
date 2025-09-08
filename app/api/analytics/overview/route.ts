import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";
import { analyticsQuerySchema } from "@/lib/validations/analytics";
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
            period: searchParams.get("period") || "month",
            startDate: searchParams.get("startDate"),
            endDate: searchParams.get("endDate"),
        };

        const validatedParams = analyticsQuerySchema.parse(queryParams);

        const now = new Date();
        let startDate: Date;
        let endDate: Date = now;

        // Calculate date range based on period
        switch (validatedParams.period) {
            case "week":
                startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
                break;
            case "month":
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
                break;
            case "year":
                startDate = new Date(now.getFullYear(), 0, 1);
                endDate = new Date(now.getFullYear(), 11, 31);
                break;
            case "all":
                startDate = new Date("1900-01-01");
                break;
            default:
                startDate = new Date(now.getFullYear(), now.getMonth(), 1);
                endDate = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        }

        // Override with custom dates if provided
        if (validatedParams.startDate && validatedParams.startDate !== null) {
            startDate = new Date(validatedParams.startDate);
        }
        if (validatedParams.endDate && validatedParams.endDate !== null) {
            endDate = new Date(validatedParams.endDate);
        }

        // Get expenses for the period
        const [periodExpenses, allExpenses, categoryData] = await Promise.all([
            prisma.expense.findMany({
                where: {
                    userId: session.user.id,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                include: {
                    category: true,
                },
            }),
            prisma.expense.findMany({
                where: {
                    userId: session.user.id,
                },
                include: {
                    category: true,
                },
            }),
            prisma.expense.groupBy({
                by: ["categoryId"],
                where: {
                    userId: session.user.id,
                    date: {
                        gte: startDate,
                        lte: endDate,
                    },
                },
                _sum: { amount: true },
                _count: true,
            }),
        ]);

        // Get category details
        const categoryIds = categoryData.map((item) => item.categoryId);
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        // Calculate stats
        const periodTotal = periodExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const allTimeTotal = allExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const totalTransactions = allExpenses.length;

        // Calculate category totals
        const categoryTotals = categoryData.reduce((acc, item) => {
            const category = categories.find(
                (cat) => cat.id === item.categoryId
            );
            if (category) {
                acc[category.name] = item._sum.amount || 0;
            }
            return acc;
        }, {} as Record<string, number>);

        const topCategory = Object.entries(categoryTotals).sort(
            ([, a], [, b]) => b - a
        )[0];

        const stats = {
            periodTotal,
            totalExpenses: totalTransactions,
            totalAmount: allTimeTotal,
            categoryTotals,
            topCategory: topCategory ? topCategory[0] : "None",
            period: validatedParams.period,
            startDate: startDate.toISOString(),
            endDate: endDate.toISOString(),
        };

        return NextResponse.json({ success: true, data: stats });
    } catch (error) {
        console.error("Error fetching analytics overview:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
