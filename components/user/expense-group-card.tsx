"use client";

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ExpenseCard } from "@/components/user/expense-card";
import { formatCurrency } from "@/lib/currency-utils";

interface Expense {
    id: string;
    amount: number;
    description: string | null;
    note: string | null;
    date: Date | string;
    category: {
        id: string;
        name: string;
        color: string;
        icon: string | null;
    };
    receiptUrl?: string | null;
}

interface ExpenseGroup {
    period: string;
    periodLabel: string;
    totalAmount: number;
    expenseCount: number;
    expenses: Expense[];
}

interface ExpenseGroupCardProps {
    group: ExpenseGroup;
}

export function ExpenseGroupCard({ group }: ExpenseGroupCardProps) {
    return (
        <Card className="shadow-sm">
            <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-xl font-semibold">
                        {group.periodLabel}
                    </CardTitle>
                    <div className="text-right">
                        <p className="text-xl font-bold text-[#DC143C]">
                            {formatCurrency(group.totalAmount)}
                        </p>
                        <p className="text-sm text-gray-500">
                            {group.expenseCount} transactions
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                <div className="space-y-3">
                    {group.expenses.map((expense) => (
                        <ExpenseCard key={expense.id} expense={expense} />
                    ))}
                </div>
            </CardContent>
        </Card>
    );
}
