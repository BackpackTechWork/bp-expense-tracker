"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    DollarSign,
    Receipt,
    TrendingUp,
    PieChart,
    Loader2,
} from "lucide-react";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

interface DashboardOverviewProps {
    period?: "week" | "month" | "year" | "all";
}

export function DashboardOverview({
    period = "month",
}: DashboardOverviewProps) {
    const { data: stats, isLoading, error } = useAnalyticsOverview({ period });

    if (isLoading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {Array.from({ length: 4 }).map((_, i) => (
                    <Card
                        key={i}
                        className="bg-white/80 backdrop-blur-sm border-white/20"
                    >
                        <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                            <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                            <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                        </CardHeader>
                        <CardContent>
                            <div className="h-8 w-16 bg-gray-200 rounded animate-pulse" />
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error || !stats) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <Card className="bg-white/80 backdrop-blur-sm border-white/20">
                    <CardContent className="p-6">
                        <div className="text-center text-gray-500">
                            Failed to load analytics
                        </div>
                    </CardContent>
                </Card>
            </div>
        );
    }

    const topCategory = Object.entries(stats.categoryTotals).sort(
        ([, a], [, b]) => b - a
    )[0];

    const getPeriodTitle = () => {
        switch (period) {
            case "week":
                return "This Week";
            case "month":
                return "This Month";
            case "year":
                return "This Year";
            case "all":
                return "All Time";
            default:
                return "This Month";
        }
    };

    const overviewCards = [
        {
            title: getPeriodTitle(),
            value: `$${stats.periodTotal.toFixed(2)}`,
            icon: DollarSign,
            color: "text-[#DC143C]",
            bgColor: "bg-[#FDEBD0]",
        },
        {
            title: "Total Expenses",
            value: stats.totalExpenses.toString(),
            icon: Receipt,
            color: "text-[#F75270]",
            bgColor: "bg-[#F7CAC9]",
        },
        {
            title: "All Time Total",
            value: `$${stats.totalAmount.toFixed(2)}`,
            icon: TrendingUp,
            color: "text-green-600",
            bgColor: "bg-green-50",
        },
        {
            title: "Top Category",
            value: stats.topCategory,
            icon: PieChart,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
    ];

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {overviewCards.map((card) => (
                <Card
                    key={card.title}
                    className="bg-white/80 backdrop-blur-sm border-white/20"
                >
                    <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                        <CardTitle className="text-sm font-medium text-gray-600">
                            {card.title}
                        </CardTitle>
                        <div className={`p-2 rounded-lg ${card.bgColor}`}>
                            <card.icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                    </CardHeader>
                    <CardContent>
                        <div className="text-2xl font-bold text-gray-900">
                            {card.value}
                        </div>
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
