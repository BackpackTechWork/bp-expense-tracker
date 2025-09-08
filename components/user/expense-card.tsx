"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Tag } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency-utils";
import { ExpenseDetailModal } from "./expense-detail-modal";

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

interface ExpenseCardProps {
    expense: Expense;
    onClick?: () => void;
    className?: string;
}

export function ExpenseCard({ expense, onClick, className }: ExpenseCardProps) {
    const [showDetails, setShowDetails] = useState(false);

    const formatDate = (date: Date | string) => {
        return format(new Date(date), "MMM dd, yyyy");
    };

    const handleCardClick = () => {
        if (onClick) {
            onClick();
        } else {
            setShowDetails(true);
        }
    };

    return (
        <>
            <Card
                className={cn(
                    "cursor-pointer transition-all duration-200 hover:shadow-md hover:scale-[1.02] border-l-4",
                    className
                )}
                style={{ borderLeftColor: expense.category.color }}
                onClick={handleCardClick}
            >
                <CardContent className="p-3">
                    <div className="flex items-center space-x-3">
                        {/* Category Icon/Color */}
                        <div
                            className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                            style={{
                                backgroundColor: expense.category.color,
                            }}
                        >
                            {expense.category.icon ? (
                                <span className="text-lg">
                                    {expense.category.icon}
                                </span>
                            ) : (
                                <Tag className="h-5 w-5" />
                            )}
                        </div>

                        {/* Expense Details */}
                        <div className="flex-1 min-w-0">
                            <div className="flex items-center justify-between mb-1">
                                <h3 className="font-semibold text-gray-900 truncate">
                                    {expense.description || "No description"}
                                </h3>
                                <p className="text-lg font-bold text-gray-900 ml-2">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>

                            <div className="flex items-center justify-between">
                                <Badge
                                    variant="secondary"
                                    className="text-xs"
                                    style={{
                                        backgroundColor: `${expense.category.color}20`,
                                        color: expense.category.color,
                                        border: `1px solid ${expense.category.color}30`,
                                    }}
                                >
                                    {expense.category.name}
                                </Badge>

                                <span className="text-xs text-gray-500">
                                    {formatDate(new Date(expense.date))}
                                </span>
                            </div>
                        </div>
                    </div>
                </CardContent>
            </Card>

            <ExpenseDetailModal
                expense={expense}
                isOpen={showDetails}
                onOpenChange={setShowDetails}
            />
        </>
    );
}
