import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";
import { spendingTrendsQuerySchema } from "@/lib/validations/analytics";
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
            months: searchParams.get("months") || "6",
        };

        const validatedParams = spendingTrendsQuerySchema.parse(queryParams);

        const now = new Date();
        const startDate = new Date(
            now.getFullYear(),
            now.getMonth() - validatedParams.months,
            1
        );

        // Get expenses for the period
        const expenses = await prisma.expense.findMany({
            where: {
                userId: session.user.id,
                date: {
                    gte: startDate,
                },
            },
            include: {
                category: true,
            },
            orderBy: {
                date: "asc",
            },
        });

        // Group expenses by period
        const trendsData = expenses.reduce((acc, expense) => {
            const date = new Date(expense.date);
            let key: string;

            switch (validatedParams.period) {
                case "week":
                    // Group by week
                    const weekStart = new Date(date);
                    weekStart.setDate(date.getDate() - date.getDay());
                    key = weekStart.toISOString().split("T")[0];
                    break;
                case "month":
                    // Group by month
                    key = `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;
                    break;
                case "year":
                    // Group by year
                    key = date.getFullYear().toString();
                    break;
                default:
                    key = `${date.getFullYear()}-${String(
                        date.getMonth() + 1
                    ).padStart(2, "0")}`;
            }

            if (!acc[key]) {
                acc[key] = {
                    period: key,
                    total: 0,
                    count: 0,
                    categories: {} as Record<string, number>,
                };
            }

            acc[key].total += expense.amount;
            acc[key].count += 1;
            acc[key].categories[expense.category.name] =
                (acc[key].categories[expense.category.name] || 0) +
                expense.amount;

            return acc;
        }, {} as Record<string, any>);

        // Convert to array and sort by period
        const trends = Object.values(trendsData).sort((a: any, b: any) =>
            a.period.localeCompare(b.period)
        );

        return NextResponse.json({
            success: true,
            data: {
                trends,
                period: validatedParams.period,
                months: validatedParams.months,
            },
        });
    } catch (error) {
        console.error("Error fetching spending trends:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
