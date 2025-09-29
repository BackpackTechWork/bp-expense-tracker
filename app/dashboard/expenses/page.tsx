"use client";

import { useState } from "react";
import { type GroupedExpenseFilters } from "@/hooks/use-grouped-expenses";
import { useCategories } from "@/hooks/use-categories";
import { GroupedExpensesView } from "@/components/user/grouped-expenses-view";
import { Loader } from "@/components/ui/loader";
import Link from "next/link";
import { Plus } from "lucide-react";

export default function ExpensesPage() {
    const [filters, setFilters] = useState<GroupedExpenseFilters>({
        groupBy: "day",
    });

    const { data: categories, isLoading: isLoadingCategories } =
        useCategories();

    if (isLoadingCategories) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 pb-20 md:pb-6">
                <div className="space-y-6">
                    <div className="flex items-center justify-between">
                        <div className="flex flex-col space-y-2">
                            <h1 className="text-3xl font-bold text-gray-900">
                                Expenses Overview
                            </h1>
                            <p className="text-gray-600 text-lg">
                                View your expenses grouped by day, week, or
                                month
                            </p>
                        </div>
                        <Link
                            href="/dashboard/add"
                            className=" bg-[#DC143C] hover:bg-[#B91C1C] text-white rounded-full p-3 shadow-lg transition-colors flex items-center gap-2"
                        >
                            <Plus className="h-6 w-6" />
                            Add Expense
                        </Link>
                    </div>

                    <GroupedExpensesView
                        categories={categories || []}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </div>
            </div>
        </div>
    );
}
