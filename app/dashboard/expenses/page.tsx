"use client";

import { useState } from "react";
import {
    useGroupedExpenses,
    type GroupedExpenseFilters,
} from "@/hooks/use-grouped-expenses";
import { useCategories } from "@/hooks/use-categories";
import { GroupedExpensesView } from "@/components/user/grouped-expenses-view";
import { Loader } from "@/components/ui/loader";

export default function ExpensesPage() {
    const [filters, setFilters] = useState<GroupedExpenseFilters>({
        groupBy: "day",
    });

    const { data: groupedExpenses, isLoading: isLoadingExpenses } =
        useGroupedExpenses(filters);
    const { data: categories, isLoading: isLoadingCategories } =
        useCategories();

    if (isLoadingExpenses || isLoadingCategories) {
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
                    <div className="flex flex-col space-y-2">
                        <h1 className="text-3xl font-bold text-gray-900">
                            Expenses Overview
                        </h1>
                        <p className="text-gray-600 text-lg">
                            View your expenses grouped by day, week, or month
                        </p>
                    </div>

                    <GroupedExpensesView
                        data={groupedExpenses}
                        categories={categories || []}
                        filters={filters}
                        onFiltersChange={setFilters}
                    />
                </div>
            </div>
        </div>
    );
}
