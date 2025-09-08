"use client";

import { AnalyticsOverview } from "@/components/user/analytics-overview";
import { ExpenseCharts } from "@/components/user/expense-charts";
import { CategoryBreakdown } from "@/components/user/category-breakdown";
import { SpendingTrends } from "@/components/user/spending-trends";
import { useAnalyticsData } from "@/hooks/use-analytics";
import { Loader } from "@/components/ui/loader";

export default function AnalyticsPage() {
    const { data, isLoading, error } = useAnalyticsData();

    if (isLoading) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="flex items-center justify-center h-64">
                    <Loader />
                </div>
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                <div className="text-center">
                    <h2 className="text-xl font-semibold text-red-600">
                        Error loading analytics
                    </h2>
                    <p className="text-gray-600 mt-2">
                        {error?.message || "Failed to load analytics data"}
                    </p>
                </div>
            </div>
        );
    }

    const { stats, categoryData, categories, last6MonthsData, dailyData } =
        data;

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
