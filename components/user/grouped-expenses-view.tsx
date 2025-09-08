"use client";

import { useCallback } from "react";
import { TotalAmountCard } from "@/components/user/total-amount-card";
import { FilterSection } from "@/components/user/filter-section";
import { ActiveFilterChips } from "@/components/user/active-filter-chips";
import { ExpenseGroupCard } from "@/components/user/expense-group-card";
import { ExpenseEmptyState } from "@/components/user/expense-empty-state";
import { Button } from "@/components/ui/button";
import { Loader } from "@/components/ui/loader";
import {
    useInfiniteGroupedExpenses,
    type GroupedExpenseFilters,
    type GroupedExpense,
} from "@/hooks/use-grouped-expenses";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
}

interface GroupedExpensesViewProps {
    categories: Category[];
    filters: GroupedExpenseFilters;
    onFiltersChange: (filters: GroupedExpenseFilters) => void;
}

export function GroupedExpensesView({
    categories,
    filters,
    onFiltersChange,
}: GroupedExpensesViewProps) {
    const {
        data: infiniteData,
        isLoading,
        isFetchingNextPage,
        hasNextPage,
        fetchNextPage,
        isError,
        error,
    } = useInfiniteGroupedExpenses({
        ...filters,
        limit: 10,
    });

    const allGroups: GroupedExpense[] =
        infiniteData?.pages.flatMap((page) => page.groups) ?? [];

    const totalAmount = infiniteData?.pages[0]?.totalAmount ?? 0;
    const totalExpenses = infiniteData?.pages[0]?.totalExpenses ?? 0;

    const handleObserver = useCallback(
        (entries: IntersectionObserverEntry[]) => {
            const [target] = entries;
            if (target.isIntersecting && hasNextPage && !isFetchingNextPage) {
                fetchNextPage();
            }
        },
        [hasNextPage, isFetchingNextPage, fetchNextPage]
    );

    const observerRef = useCallback(
        (node: HTMLDivElement | null) => {
            if (node) {
                const observer = new IntersectionObserver(handleObserver, {
                    threshold: 0.1,
                });
                observer.observe(node);
                return () => observer.disconnect();
            }
        },
        [handleObserver]
    );
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

    if (isLoading) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <Loader />
            </div>
        );
    }

    if (isError) {
        return (
            <div className="flex items-center justify-center min-h-[400px]">
                <div className="text-center">
                    <p className="text-red-600 mb-4">Error loading expenses</p>
                    <p className="text-sm text-gray-600">
                        {error?.message || "Something went wrong"}
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            <TotalAmountCard
                totalAmount={totalAmount}
                totalExpenses={totalExpenses}
            />

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

            <ActiveFilterChips
                categoryId={filters.categoryId}
                startDate={filters.startDate}
                endDate={filters.endDate}
                categories={categories}
                onRemoveFilter={removeFilter}
            />

            <div className="space-y-6">
                {allGroups.length > 0 ? (
                    <>
                        {allGroups.map((group) => (
                            <ExpenseGroupCard
                                key={group.period}
                                group={group}
                            />
                        ))}

                        {hasNextPage && (
                            <div
                                ref={observerRef}
                                className="flex justify-center py-8"
                            >
                                <div className="flex flex-col items-center space-y-4">
                                    {isFetchingNextPage ? (
                                        <div className="flex items-center space-x-2">
                                            <Loader />
                                            <span className="text-gray-600">
                                                Loading more expenses...
                                            </span>
                                        </div>
                                    ) : (
                                        <Button
                                            onClick={() => fetchNextPage()}
                                            variant="outline"
                                            className="px-8"
                                        >
                                            Load More
                                        </Button>
                                    )}
                                </div>
                            </div>
                        )}
                    </>
                ) : (
                    <ExpenseEmptyState />
                )}
            </div>
        </div>
    );
}
