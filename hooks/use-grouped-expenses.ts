import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface GroupedExpenseFilters {
    groupBy?: "day" | "week" | "month";
    startDate?: string;
    endDate?: string;
    categoryId?: string;
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
    groupBy: "day" | "week" | "month";
    filters: {
        startDate?: string;
        endDate?: string;
        categoryId?: string;
    };
}

async function fetchGroupedExpenses(
    filters: GroupedExpenseFilters = {}
): Promise<GroupedExpensesResponse> {
    const searchParams = new URLSearchParams();

    if (filters.groupBy) searchParams.set("groupBy", filters.groupBy);
    if (filters.startDate) searchParams.set("startDate", filters.startDate);
    if (filters.endDate) searchParams.set("endDate", filters.endDate);
    if (filters.categoryId) searchParams.set("categoryId", filters.categoryId);

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

export type { GroupedExpense, GroupedExpenseFilters, GroupedExpensesResponse };
