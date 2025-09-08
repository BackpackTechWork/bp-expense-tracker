"use client";

import { TotalAmountCard } from "@/components/user/total-amount-card";
import { FilterSection } from "@/components/user/filter-section";
import { ActiveFilterChips } from "@/components/user/active-filter-chips";
import { ExpenseGroupCard } from "@/components/user/expense-group-card";
import { ExpenseEmptyState } from "@/components/user/expense-empty-state";
import {
    type GroupedExpenseFilters,
    type GroupedExpensesResponse,
} from "@/hooks/use-grouped-expenses";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
}

interface GroupedExpensesViewProps {
    data?: GroupedExpensesResponse;
    categories: Category[];
    filters: GroupedExpenseFilters;
    onFiltersChange: (filters: GroupedExpenseFilters) => void;
}

export function GroupedExpensesView({
    data,
    categories,
    filters,
    onFiltersChange,
}: GroupedExpensesViewProps) {
    const handleGroupByChange = (groupBy: "day" | "week" | "month") => {
        onFiltersChange({ ...filters, groupBy });
    };

    const handleCategoryChange = (categoryId: string) => {
        onFiltersChange({
            ...filters,
            categoryId: categoryId === "all" ? undefined : categoryId,
        });
    };

    const handleDateRangeChange = (startDate?: string, endDate?: string) => {
        onFiltersChange({
            ...filters,
            startDate,
            endDate,
        });
    };

    const clearFilters = () => {
        onFiltersChange({
            groupBy: filters.groupBy,
        });
    };

    const removeFilter = (filterType: "category" | "startDate" | "endDate") => {
        switch (filterType) {
            case "category":
                onFiltersChange({
                    ...filters,
                    categoryId: undefined,
                });
                break;
            case "startDate":
                onFiltersChange({
                    ...filters,
                    startDate: undefined,
                });
                break;
            case "endDate":
                onFiltersChange({
                    ...filters,
                    endDate: undefined,
                });
                break;
        }
    };

    return (
        <div className="space-y-6">
            {/* Total Amount Card */}
            <TotalAmountCard
                totalAmount={data?.totalAmount || 0}
                totalExpenses={data?.totalExpenses || 0}
            />

            {/* Filters */}
            <FilterSection
                groupBy={filters.groupBy || "day"}
                categoryId={filters.categoryId}
                startDate={filters.startDate}
                endDate={filters.endDate}
                categories={categories}
                onGroupByChange={handleGroupByChange}
                onCategoryChange={handleCategoryChange}
                onDateRangeChange={handleDateRangeChange}
                onClearFilters={clearFilters}
            />

            {/* Active Filter Chips */}
            <ActiveFilterChips
                categoryId={filters.categoryId}
                startDate={filters.startDate}
                endDate={filters.endDate}
                categories={categories}
                onRemoveFilter={removeFilter}
            />

            {/* Expenses Groups */}
            <div className="space-y-6">
                {data?.groups && data.groups.length > 0 ? (
                    data.groups.map((group) => (
                        <ExpenseGroupCard key={group.period} group={group} />
                    ))
                ) : (
                    <ExpenseEmptyState />
                )}
            </div>
        </div>
    );
}
