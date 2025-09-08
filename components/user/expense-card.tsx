"use client";

import { useState } from "react";
import { format } from "date-fns";
import { Calendar, DollarSign, Tag, FileText, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
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

    const formatTime = (date: Date | string) => {
        return format(new Date(date), "h:mm a");
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

            {/* Expense Details Modal */}
            <Dialog open={showDetails} onOpenChange={setShowDetails}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{
                                    backgroundColor: expense.category.color,
                                }}
                            >
                                {expense.category.icon ? (
                                    <span className="text-sm">
                                        {expense.category.icon}
                                    </span>
                                ) : (
                                    <Tag className="h-4 w-4" />
                                )}
                            </div>
                            <span>Expense Details</span>
                        </DialogTitle>
                    </DialogHeader>

                    <div className="space-y-6">
                        {/* Amount */}
                        <div className="text-center">
                            <p className="text-4xl font-bold text-[#DC143C] mb-2">
                                {formatCurrency(expense.amount)}
                            </p>
                            <p className="text-gray-600">
                                {formatDate(new Date(expense.date))} at{" "}
                                {formatTime(new Date(expense.date))}
                            </p>
                        </div>

                        {/* Details Grid */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            {/* Description */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <FileText className="h-4 w-4" />
                                    <span>Description</span>
                                </h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {expense.description ||
                                        "No description provided"}
                                </p>
                            </div>

                            {/* Category */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <Tag className="h-4 w-4" />
                                    <span>Category</span>
                                </h4>
                                <div className="flex items-center space-x-2">
                                    <div
                                        className="w-4 h-4 rounded-full"
                                        style={{
                                            backgroundColor:
                                                expense.category.color,
                                        }}
                                    />
                                    <span className="text-gray-700">
                                        {expense.category.name}
                                    </span>
                                </div>
                            </div>

                            {/* Date */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <Calendar className="h-4 w-4" />
                                    <span>Date & Time</span>
                                </h4>
                                <p className="text-gray-700">
                                    {formatDate(new Date(expense.date))} at{" "}
                                    {formatTime(new Date(expense.date))}
                                </p>
                            </div>

                            {/* Amount */}
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                    <DollarSign className="h-4 w-4" />
                                    <span>Amount</span>
                                </h4>
                                <p className="text-gray-700 font-semibold">
                                    {formatCurrency(expense.amount)}
                                </p>
                            </div>
                        </div>

                        {/* Note */}
                        {expense.note && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900">
                                    Note
                                </h4>
                                <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                    {expense.note}
                                </p>
                            </div>
                        )}

                        {/* Receipt */}
                        {expense.receiptUrl && (
                            <div className="space-y-2">
                                <h4 className="font-semibold text-gray-900">
                                    Receipt
                                </h4>
                                <div className="bg-gray-50 p-3 rounded-lg">
                                    <a
                                        href={expense.receiptUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="text-[#DC143C] hover:underline"
                                    >
                                        View Receipt
                                    </a>
                                </div>
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>
        </>
    );
}
