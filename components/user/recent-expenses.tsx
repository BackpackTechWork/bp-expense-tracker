"use client";

import Link from "next/link";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Plus, ArrowRight, Loader2 } from "lucide-react";
import { format } from "date-fns";
import { useRecentExpenses } from "@/hooks/use-expenses";

interface Expense {
    id: string;
    amount: number;
    description: string | null;
    date: string | Date;
    category: {
        name: string;
        color: string;
        icon: string | null;
    };
}

interface RecentExpensesProps {
    limit?: number;
}

export function RecentExpenses({ limit = 5 }: RecentExpensesProps) {
    const { data: expenses = [], isLoading, error } = useRecentExpenses(limit);
    return (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader className="flex flex-row items-center justify-between">
                <CardTitle className="text-lg font-semibold">
                    Recent Expenses
                </CardTitle>
                <Button
                    asChild
                    size="sm"
                    className="bg-[#DC143C] hover:bg-[#F75270]"
                >
                    <Link href="/dashboard/add">
                        <Plus className="h-4 w-4 mr-1" />
                        Add
                    </Link>
                </Button>
            </CardHeader>
            <CardContent>
                <div className="space-y-4">
                    {isLoading ? (
                        <div className="space-y-3">
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="h-8 w-8 bg-gray-200 rounded animate-pulse" />
                                        <div>
                                            <div className="h-4 w-24 bg-gray-200 rounded animate-pulse mb-2" />
                                            <div className="h-3 w-16 bg-gray-200 rounded animate-pulse" />
                                        </div>
                                    </div>
                                    <div className="h-6 w-12 bg-gray-200 rounded animate-pulse" />
                                </div>
                            ))}
                        </div>
                    ) : error ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                                Failed to load recent expenses
                            </p>
                        </div>
                    ) : expenses.length === 0 ? (
                        <div className="text-center py-8">
                            <p className="text-gray-500 mb-4">
                                No expenses yet
                            </p>
                            <Button
                                asChild
                                className="bg-[#DC143C] hover:bg-[#F75270]"
                            >
                                <Link href="/dashboard/add">
                                    <Plus className="h-4 w-4 mr-2" />
                                    Add Your First Expense
                                </Link>
                            </Button>
                        </div>
                    ) : (
                        <>
                            {expenses.map((expense: Expense) => (
                                <div
                                    key={expense.id}
                                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"
                                >
                                    <div className="flex items-center space-x-3">
                                        <div className="text-2xl">
                                            {expense.category.icon || "📦"}
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {expense.description ||
                                                    "No description"}
                                            </p>
                                            <div className="flex items-center space-x-2">
                                                <Badge
                                                    style={{
                                                        backgroundColor:
                                                            expense.category
                                                                .color,
                                                    }}
                                                    className="text-white text-xs"
                                                >
                                                    {expense.category.name}
                                                </Badge>
                                                <span className="text-sm text-gray-500">
                                                    {format(
                                                        new Date(expense.date),
                                                        "MMM dd"
                                                    )}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="text-lg font-semibold text-gray-900">
                                        ${expense.amount.toFixed(2)}
                                    </div>
                                </div>
                            ))}
                            <Button
                                variant="outline"
                                asChild
                                className="w-full bg-transparent"
                            >
                                <Link href="/dashboard/expenses">
                                    View All Expenses
                                    <ArrowRight className="h-4 w-4 ml-2" />
                                </Link>
                            </Button>
                        </>
                    )}
                </div>
            </CardContent>
        </Card>
    );
}
