import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AnalyticsOverview } from "@/components/user/analytics-overview";
import { ExpenseCharts } from "@/components/user/expense-charts";
import { CategoryBreakdown } from "@/components/user/category-breakdown";
import { SpendingTrends } from "@/components/user/spending-trends";

export default async function AnalyticsPage() {
    const session = await auth();
    const userId = session!.user.id;

    // Get current month data
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    // Get last month for comparison
    const startOfLastMonth = new Date(now.getFullYear(), now.getMonth() - 1, 1);
    const endOfLastMonth = new Date(now.getFullYear(), now.getMonth(), 0);

    const [
        currentMonthExpenses,
        lastMonthExpenses,
        categoryData,
        last6MonthsData,
        dailyData,
    ] = await Promise.all([
        // Current month expenses
        prisma.expense.findMany({
            where: {
                userId,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { category: true },
        }),

        // Last month expenses
        prisma.expense.findMany({
            where: {
                userId,
                date: { gte: startOfLastMonth, lte: endOfLastMonth },
            },
        }),

        // Category breakdown (last 3 months)
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

        // Last 6 months data
        prisma.expense.findMany({
            where: {
                userId,
                date: {
                    gte: new Date(now.getFullYear(), now.getMonth() - 5, 1),
                },
            },
            include: { category: true },
        }),

        // Daily data for current month
        prisma.expense.findMany({
            where: {
                userId,
                date: { gte: startOfMonth, lte: endOfMonth },
            },
            include: { category: true },
            orderBy: { date: "asc" },
        }),
    ]);

    // Get category details for the breakdown
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

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Analytics
                    </h1>
                    <p className="text-gray-600">
                        Insights into your spending patterns
                    </p>
                </div>
            </div>

            <AnalyticsOverview stats={stats} />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <CategoryBreakdown
                    categoryData={categoryData}
                    categories={categories}
                />
                <ExpenseCharts dailyData={dailyData} />
            </div>

            <SpendingTrends monthlyData={last6MonthsData} />
        </div>
    );
}
