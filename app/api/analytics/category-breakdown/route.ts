import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";
import { categoryBreakdownQuerySchema } from "@/lib/validations/analytics";
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

        const validatedParams = categoryBreakdownQuerySchema.parse(queryParams);

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

        // Get category breakdown data
        const categoryData = await prisma.expense.groupBy({
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
        });

        // Get category details
        const categoryIds = categoryData.map((item) => item.categoryId);
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        // Calculate total for percentage calculation
        const totalAmount = categoryData.reduce(
            (sum, item) => sum + (item._sum.amount || 0),
            0
        );

        // Format data for charts
        const breakdown = categoryData
            .map((item) => {
                const category = categories.find(
                    (cat) => cat.id === item.categoryId
                );
                const amount = item._sum.amount || 0;
                const percentage =
                    totalAmount > 0 ? (amount / totalAmount) * 100 : 0;

                return {
                    categoryId: item.categoryId,
                    categoryName: category?.name || "Unknown",
                    categoryIcon: category?.icon || "📦",
                    categoryColor: category?.color || "#DC143C",
                    amount,
                    count: item._count,
                    percentage: Math.round(percentage * 100) / 100,
                };
            })
            .sort((a, b) => b.amount - a.amount);

        return NextResponse.json({
            success: true,
            data: {
                breakdown,
                totalAmount,
                period: validatedParams.period,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
            },
        });
    } catch (error) {
        console.error("Error fetching category breakdown:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
