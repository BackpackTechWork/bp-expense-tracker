"use client";

import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { formatCurrency } from "@/lib/currency-utils";

interface TotalAmountCardProps {
    totalAmount: number;
    totalExpenses: number;
}

export function TotalAmountCard({
    totalAmount,
    totalExpenses,
}: TotalAmountCardProps) {
    return (
        <Card className="bg-gradient-to-r from-[#DC143C] to-[#FF6B6B] text-white shadow-lg">
            <CardContent className="p-8">
                <div className="flex items-center justify-between">
                    <div>
                        <p className="text-white/90 text-base font-medium mb-2">
                            Total Expenses
                        </p>
                        <p className="text-4xl font-bold mb-2">
                            {formatCurrency(totalAmount)}
                        </p>
                        <p className="text-white/80 text-sm">
                            {totalExpenses} transactions
                        </p>
                    </div>
                    <DollarSign className="h-16 w-16 text-white/20" />
                </div>
            </CardContent>
        </Card>
    );
}
