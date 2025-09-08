"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
} from "recharts";
import { format } from "date-fns";
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

interface SpendingTrendsProps {
    monthlyData: Expense[];
}

export function SpendingTrends({ monthlyData }: SpendingTrendsProps) {
    const monthlyTotals = monthlyData.reduce((acc, expense) => {
        const monthKey = format(new Date(expense.date), "yyyy-MM");
        acc[monthKey] = (acc[monthKey] || 0) + expense.amount;
        return acc;
    }, {} as Record<string, number>);

    const chartData = [];
    const now = new Date();

    for (let i = 5; i >= 0; i--) {
        const date = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const monthKey = format(date, "yyyy-MM");
        const monthName = format(date, "MMM yyyy");

        chartData.push({
            month: monthName,
            amount: monthlyTotals[monthKey] || 0,
        });
    }

    const CustomTooltip = ({ active, payload, label }: any) => {
        if (active && payload && payload.length) {
            return (
                <div className="bg-white p-3 border rounded-lg shadow-lg">
                    <p className="font-medium">{label}</p>
                    <p className="text-sm text-gray-600">
                        {formatCurrency(payload[0].value)}
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
                    Spending Trends
                </CardTitle>
                <p className="text-sm text-gray-600">Last 6 months</p>
            </CardHeader>
            <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                    <LineChart data={chartData}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="month" fontSize={12} />
                        <YAxis fontSize={12} />
                        <Tooltip content={<CustomTooltip />} />
                        <Line
                            type="monotone"
                            dataKey="amount"
                            stroke="#DC143C"
                            strokeWidth={3}
                            dot={{ fill: "#DC143C", strokeWidth: 2, r: 4 }}
                            activeDot={{
                                r: 6,
                                stroke: "#DC143C",
                                strokeWidth: 2,
                            }}
                        />
                    </LineChart>
                </ResponsiveContainer>
            </CardContent>
        </Card>
    );
}
