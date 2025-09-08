import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    TrendingUp,
    TrendingDown,
    DollarSign,
    Receipt,
    BarChart3,
    Target,
} from "lucide-react";
import { formatCurrency } from "@/lib/currency-utils";

interface AnalyticsOverviewProps {
    stats: {
        currentMonthTotal: number;
        lastMonthTotal: number;
        monthlyChange: number;
        totalTransactions: number;
        averageTransaction: number;
    };
}

export function AnalyticsOverview({ stats }: AnalyticsOverviewProps) {
    const isPositiveChange = stats.monthlyChange >= 0;

    const overviewCards = [
        {
            title: "This Month",
            value: formatCurrency(stats.currentMonthTotal),
            change: `${
                isPositiveChange ? "+" : ""
            }${stats.monthlyChange.toFixed(1)}%`,
            changeColor: isPositiveChange ? "text-red-600" : "text-green-600",
            icon: DollarSign,
            color: "text-[#DC143C]",
            bgColor: "bg-[#FDEBD0]",
        },
        {
            title: "Last Month",
            value: formatCurrency(stats.lastMonthTotal),
            icon: BarChart3,
            color: "text-[#F75270]",
            bgColor: "bg-[#F7CAC9]",
        },
        {
            title: "Transactions",
            value: stats.totalTransactions.toString(),
            icon: Receipt,
            color: "text-blue-600",
            bgColor: "bg-blue-50",
        },
        {
            title: "Average",
            value: formatCurrency(stats.averageTransaction),
            icon: Target,
            color: "text-green-600",
            bgColor: "bg-green-50",
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
                        {card.change && (
                            <div
                                className={`flex items-center text-sm ${card.changeColor}`}
                            >
                                {isPositiveChange ? (
                                    <TrendingUp className="h-4 w-4 mr-1" />
                                ) : (
                                    <TrendingDown className="h-4 w-4 mr-1" />
                                )}
                                {card.change} from last month
                            </div>
                        )}
                    </CardContent>
                </Card>
            ))}
        </div>
    );
}
