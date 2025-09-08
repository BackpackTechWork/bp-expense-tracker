import { useQuery, useInfiniteQuery } from "@tanstack/react-query";

interface GroupedExpenseFilters {
    groupBy?: "day" | "week" | "month";
    startDate?: string;
    endDate?: string;
    categoryId?: string;
    limit?: number;
}

interface GroupedExpense {
    period: string;
    periodLabel: string;
    totalAmount: number;
    expenseCount: number;
    expenses: Array<{
        id: string;
        amount: number;
        description: string | null;
        note: string | null;
        date: Date;
        category: {
            id: string;
            name: string;
            color: string;
            icon: string | null;
        };
    }>;
}

interface GroupedExpensesResponse {
    groups: GroupedExpense[];
    totalAmount: number;
    totalExpenses: number;
    totalGroups: number;
    hasMore: boolean;
    groupBy: "day" | "week" | "month";
    filters: {
        startDate?: string;
        endDate?: string;
        categoryId?: string;
    };
    pagination: {
        limit: number;
        offset: number;
        hasMore: boolean;
    };
}

async function fetchGroupedExpenses(
    filters: GroupedExpenseFilters = {},
    pageParam: number = 0
): Promise<GroupedExpensesResponse> {
    const searchParams = new URLSearchParams();

    if (filters.groupBy) searchParams.set("groupBy", filters.groupBy);
    if (filters.startDate) searchParams.set("startDate", filters.startDate);
    if (filters.endDate) searchParams.set("endDate", filters.endDate);
    if (filters.categoryId) searchParams.set("categoryId", filters.categoryId);

    const limit = filters.limit || 10;
    const offset = pageParam * limit;

    searchParams.set("limit", limit.toString());
    searchParams.set("offset", offset.toString());

    const response = await fetch(
        `/api/expenses/grouped?${searchParams.toString()}`
    );

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "API request failed");
    }

    return data.data;
}

export function useGroupedExpenses(filters: GroupedExpenseFilters = {}) {
    return useQuery({
        queryKey: ["grouped-expenses", filters],
        queryFn: () => fetchGroupedExpenses(filters),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useInfiniteGroupedExpenses(
    filters: GroupedExpenseFilters = {}
) {
    return useInfiniteQuery({
        queryKey: ["grouped-expenses-infinite", filters],
        queryFn: ({ pageParam = 0 }) =>
            fetchGroupedExpenses(filters, pageParam),
        getNextPageParam: (lastPage, allPages) => {
            if (!lastPage.pagination.hasMore) {
                return undefined;
            }
            return allPages.length;
        },
        initialPageParam: 0,
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export type { GroupedExpense, GroupedExpenseFilters, GroupedExpensesResponse };
