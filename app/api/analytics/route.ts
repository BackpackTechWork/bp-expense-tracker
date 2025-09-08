import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";

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
        const userId = session.user.id;

        const now = new Date();
        const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
        const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);
        const startOfLastMonth = new Date(
            now.getFullYear(),
            now.getMonth() - 1,
            1
        );
        const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

        const [
            currentMonthExpenses,
            lastMonthExpenses,
            categoryData,
            last6MonthsData,
            dailyData,
        ] = await Promise.all([
            prisma.expense.findMany({
                where: {
                    userId,
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                include: { category: true },
            }),

            prisma.expense.findMany({
                where: {
                    userId,
                    date: { gte: startOfLastMonth, lte: endOfLastMonth },
                },
            }),

            prisma.expense.groupBy({
                by: ["categoryId"],
                where: {
                    userId,
                    date: {
                        gte: new Date(now.getFullYear(), now.getMonth() - 2, 1),
                    },
                },
                _sum: { amount: true },
                _count: true,
            }),

            prisma.expense.findMany({
                where: {
                    userId,
                    date: {
                        gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
                    },
                },
                include: { category: true },
            }),

            prisma.expense.findMany({
                where: {
                    userId,
                    date: { gte: startOfMonth, lte: endOfMonth },
                },
                include: { category: true },
                orderBy: { date: "asc" },
            }),
        ]);

        const categoryIds = categoryData.map((item) => item.categoryId);
        const categories = await prisma.category.findMany({
            where: { id: { in: categoryIds } },
        });

        const currentMonthTotal = currentMonthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const lastMonthTotal = lastMonthExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );
        const monthlyChange =
            lastMonthTotal > 0
                ? ((currentMonthTotal - lastMonthTotal) / lastMonthTotal) * 100
                : 0;

        const stats = {
            currentMonthTotal,
            lastMonthTotal,
            monthlyChange,
            totalTransactions: currentMonthExpenses.length,
            averageTransaction:
                currentMonthExpenses.length > 0
                    ? currentMonthTotal / currentMonthExpenses.length
                    : 0,
        };

        return NextResponse.json({
            success: true,
            data: {
                stats,
                categoryData,
                categories,
                last6MonthsData,
                dailyData,
            },
        });
    } catch (error) {
        console.error("Error fetching analytics data:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
