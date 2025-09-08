"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    BarChart,
    Bar,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format, eachDayOfInterval, startOfMonth, endOfMonth } from "date-fns";
import { formatCurrency } from "@/lib/currency-utils";

interface Expense {
    id: string;
    amount: number;
    date: Date;
    category: {
        name: string;
        color: string;
    };
}

interface ExpenseChartsProps {
    dailyData: Expense[];
}

export function ExpenseCharts({ dailyData }: ExpenseChartsProps) {
    const now = new Date();
    const monthStart = startOfMonth(now);
    const monthEnd = endOfMonth(now);

    const days = eachDayOfInterval({ start: monthStart, end: monthEnd });
    const dailyChartData = days.map((day) => {
        const dayExpenses = dailyData.filter(
            (expense) =>
                format(new Date(expense.date), "yyyy-MM-dd") ===
                format(day, "yyyy-MM-dd")
        );
        const total = dayExpenses.reduce(
            (sum, expense) => sum + expense.amount,
            0
        );

        return {
            date: format(day, "MMM dd"),
            amount: total,
            count: dayExpenses.length,
        };
    });

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            const data = payload[0].payload;
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(data.amount)}
                    </p>
                    <p className="text-xs text-gray-500">
                        {data.count} transactions
                    </p>
                </div>
            );
        }
        return null;
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Daily Spending
                </CardTitle>
                <p className="text-sm text-gray-600">This month</p>
            </CardHeader>
            <CardContent>
                {dailyChartData.every((item) => item.amount === 0) ? (
                    <div className="text-center py-8">
                        <p className="text-gray-500">
                            No expense data for this month
                        </p>
                    </div>
                ) : (
                    <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={dailyChartData}>
                            <CartesianGrid strokeDasharray="3 3" />
                            <XAxis
                                dataKey="date"
                                fontSize={12}
                                interval="preserveStartEnd"
                            />
                            <YAxis fontSize={12} />
                            <Tooltip content={<CustomTooltip />} />
                            <Bar
                                dataKey="amount"
                                fill="#DC143C"
                                radius={[4, 4, 0, 0]}
                            />
                        </BarChart>
                    </ResponsiveContainer>
                )}
            </CardContent>
        </Card>
    );
}
