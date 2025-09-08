"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { useActiveBudgets } from "@/hooks/use-budgets";
import { useAnalyticsOverview } from "@/hooks/use-analytics";

interface Budget {
    id: string;
    amount: number;
    period: string;
    category?: {
        name: string;
        color: string;
    };
}

interface BudgetProgressProps {}

export function BudgetProgress({}: BudgetProgressProps) {
    const {
        data: budgets = [],
        isLoading: budgetsLoading,
        error: budgetsError,
    } = useActiveBudgets();
    const { data: analytics, isLoading: analyticsLoading } =
        useAnalyticsOverview({ period: "month" });

    const isLoading = budgetsLoading || analyticsLoading;
    const getBudgetProgress = (budget: Budget) => {
        const spent = analytics?.periodTotal || 0;
        const percentage = (spent / budget.amount) * 100;
        return { spent, percentage: Math.min(percentage, 100) };
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader>
                <CardTitle className="text-lg font-semibold">
                    Budget Progress
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 2 }).map((_, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="h-4 w-24 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-4 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                    <div className="h-2 w-full bg-gray-200 rounded animate-pulse" />
                                    <div className="flex justify-between">
                                        <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        <div className="h-3 w-20 bg-gray-200 rounded animate-pulse" />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : budgetsError ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                                Failed to load budgets
                            </p>
                        </div>
                    ) : budgets.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">No budgets set</p>
                            <p className="text-sm text-gray-400">
                                Set budgets to track your spending
                            </p>
                        </div>
                    ) : (
                        budgets.map((budget: Budget) => {
                            const { spent, percentage } =
                                getBudgetProgress(budget);
                            const isOverBudget = percentage >= 100;

                            return (
                                <div key={budget.id} className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <div className="flex items-center space-x-2">
                                            <span className="font-medium">
                                                {budget.category
                                                    ? budget.category.name
                                                    : "Overall Budget"}
                                            </span>
                                            {budget.category && (
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            budget.category
                                                                .color,
                                                    }}
                                                    className="text-white text-xs"
                                                >
                                                    {budget.category.name}
                                                </Badge>
                                            )}
                                        </div>
                                        <span
                                            className={`text-sm font-medium ${
                                                isOverBudget
                                                    ? "text-red-600"
                                                    : "text-gray-600"
                                            }`}
                                        >
                                            ${spent.toFixed(2)} / $
                                            {budget.amount.toFixed(2)}
                                        </span>
                                    </div>
                                    <Progress
                                        value={percentage}
                                        className={`h-2 ${
                                            isOverBudget
                                                ? "bg-red-100"
                                                : "bg-gray-200"
                                        }`}
                                    />
                                    <div className="flex justify-between text-xs text-gray-500">
                                        <span>
                                            {percentage.toFixed(1)}% used
                                        </span>
                                        <span>
                                            $
                                            {(budget.amount - spent).toFixed(2)}{" "}
                                            remaining
                                        </span>
                                    </div>
                                </div>
                            );
                        })
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
