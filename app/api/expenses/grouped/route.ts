import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { handleApiError, AppError } from "@/lib/error-handler";
import {
    authenticateRequest,
    buildExpenseWhereClause,
} from "@/lib/expense-utils";
import { z } from "zod";

const groupedExpensesSchema = z.object({
    groupBy: z.enum(["day", "week", "month"]).default("day"),
    startDate: z.string().datetime().optional(),
    endDate: z.string().datetime().optional(),
    categoryId: z.string().optional(),
});

type GroupedExpensesParams = z.infer<typeof groupedExpensesSchema>;

interface GroupedExpense {
    period: string;
    periodLabel: string;
    totalAmount: number;
    expenseCount: number;
    expenses: Array<{
        id: string;
        amount: number;
        description: string | null;
        note: string | null;
        date: Date;
        category: {
            id: string;
            name: string;
            color: string;
            icon: string | null;
        };
    }>;
}

function formatPeriodLabel(
    date: Date,
    groupBy: "day" | "week" | "month"
): string {
    switch (groupBy) {
        case "day":
            return date.toLocaleDateString("en-US", {
                weekday: "short",
                month: "short",
                day: "numeric",
                year: "numeric",
            });
        case "week":
            const startOfWeek = new Date(date);
            const day = startOfWeek.getDay();
            const diff = startOfWeek.getDate() - day + (day === 0 ? -6 : 1);
            startOfWeek.setDate(diff);

            const endOfWeek = new Date(startOfWeek);
            endOfWeek.setDate(startOfWeek.getDate() + 6);

            return `${startOfWeek.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
            })} - ${endOfWeek.toLocaleDateString("en-US", {
                month: "short",
                day: "numeric",
                year: "numeric",
            })}`;
        case "month":
            return date.toLocaleDateString("en-US", {
                month: "long",
                year: "numeric",
            });
        default:
            return date.toLocaleDateString();
    }
}

function getGroupByClause(groupBy: "day" | "week" | "month") {
    switch (groupBy) {
        case "day":
            return {
                year: {
                    year: { $dateToString: { format: "%Y", date: "$date" } },
                },
                month: {
                    month: { $dateToString: { format: "%m", date: "$date" } },
                },
                day: {
                    day: { $dateToString: { format: "%d", date: "$date" } },
                },
            };
        case "week":
            return {
                year: {
                    year: { $dateToString: { format: "%Y", date: "$date" } },
                },
                week: {
                    week: { $dateToString: { format: "%U", date: "$date" } },
                },
            };
        case "month":
            return {
                year: {
                    year: { $dateToString: { format: "%Y", date: "$date" } },
                },
                month: {
                    month: { $dateToString: { format: "%m", date: "$date" } },
                },
            };
    }
}

export async function GET(request: NextRequest) {
    try {
        const { session, userId } = await authenticateRequest(request);
        const { searchParams } = new URL(request.url);

        const params = groupedExpensesSchema.parse({
            groupBy: searchParams.get("groupBy") || "day",
            startDate: searchParams.get("startDate") || undefined,
            endDate: searchParams.get("endDate") || undefined,
            categoryId: searchParams.get("categoryId") || undefined,
        });

        const where = buildExpenseWhereClause(userId, {
            categoryId: params.categoryId,
            startDate: params.startDate,
            endDate: params.endDate,
        });

        // Get all expenses with category information
        const expenses = await prisma.expense.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: { date: "desc" },
        });

        // Group expenses by the specified period
        const groupedExpenses = new Map<string, GroupedExpense>();

        expenses.forEach((expense) => {
            let periodKey: string;
            let periodDate: Date;

            switch (params.groupBy) {
                case "day":
                    periodDate = new Date(expense.date);
                    periodDate.setHours(0, 0, 0, 0);
                    periodKey = periodDate.toISOString().split("T")[0];
                    break;
                case "week":
                    periodDate = new Date(expense.date);
                    const day = periodDate.getDay();
                    const diff =
                        periodDate.getDate() - day + (day === 0 ? -6 : 1);
                    periodDate.setDate(diff);
                    periodDate.setHours(0, 0, 0, 0);
                    periodKey = periodDate.toISOString().split("T")[0];
                    break;
                case "month":
                    periodDate = new Date(expense.date);
                    periodDate.setDate(1);
                    periodDate.setHours(0, 0, 0, 0);
                    periodKey = `${periodDate.getFullYear()}-${String(
                        periodDate.getMonth() + 1
                    ).padStart(2, "0")}`;
                    break;
            }

            if (!groupedExpenses.has(periodKey)) {
                groupedExpenses.set(periodKey, {
                    period: periodKey,
                    periodLabel: formatPeriodLabel(periodDate, params.groupBy),
                    totalAmount: 0,
                    expenseCount: 0,
                    expenses: [],
                });
            }

            const group = groupedExpenses.get(periodKey)!;
            group.totalAmount += expense.amount;
            group.expenseCount += 1;
            group.expenses.push({
                id: expense.id,
                amount: expense.amount,
                description: expense.description,
                note: expense.note,
                date: expense.date,
                category: {
                    id: expense.category.id,
                    name: expense.category.name,
                    color: expense.category.color,
                    icon: expense.category.icon,
                },
            });
        });

        // Convert to array and sort by period (newest first)
        const result = Array.from(groupedExpenses.values()).sort((a, b) => {
            return new Date(b.period).getTime() - new Date(a.period).getTime();
        });

        // Calculate total amount across all groups
        const totalAmount = result.reduce(
            (sum, group) => sum + group.totalAmount,
            0
        );

        return NextResponse.json({
            success: true,
            data: {
                groups: result,
                totalAmount,
                totalExpenses: expenses.length,
                groupBy: params.groupBy,
                filters: {
                    startDate: params.startDate,
                    endDate: params.endDate,
                    categoryId: params.categoryId,
                },
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}
