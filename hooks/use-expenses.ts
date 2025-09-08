import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface ExpenseFilters {
    categoryId?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
    userId?: string;
}

interface ExpensesParams {
    filters?: ExpenseFilters;
    limit?: number;
    offset?: number;
}

async function apiRequest(url: string, options?: RequestInit) {
    const response = await fetch(url, options);

    if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "API request failed");
    }

    return data.data;
}

function buildSearchParams(params: ExpensesParams): URLSearchParams {
    const searchParams = new URLSearchParams();

    if (params.filters?.categoryId)
        searchParams.set("categoryId", params.filters.categoryId);
    if (params.filters?.startDate)
        searchParams.set("startDate", params.filters.startDate);
    if (params.filters?.endDate)
        searchParams.set("endDate", params.filters.endDate);
    if (params.filters?.search)
        searchParams.set("search", params.filters.search);
    if (params.filters?.userId)
        searchParams.set("userId", params.filters.userId);
    if (params.limit) searchParams.set("limit", params.limit.toString());
    if (params.offset) searchParams.set("offset", params.offset.toString());

    return searchParams;
}

async function fetchExpenses(params: ExpensesParams = {}) {
    const searchParams = buildSearchParams(params);
    return apiRequest(`/api/expenses?${searchParams.toString()}`);
}

export function useExpenses(params: ExpensesParams = {}) {
    return useQuery({
        queryKey: queryKeys.expenses.list(params.filters),
        queryFn: () => fetchExpenses(params),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useRecentExpenses(limit: number = 5) {
    return useQuery({
        queryKey: queryKeys.expenses.list({ limit }),
        queryFn: () => fetchExpenses({ limit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

export function useUserExpenses(userId: string, limit: number = 10) {
    return useQuery({
        queryKey: queryKeys.expenses.list({ userId, limit }),
        queryFn: () => fetchExpenses({ filters: { userId }, limit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!userId,
    });
}

async function createExpense(formData: FormData) {
    return apiRequest("/api/expenses", {
        method: "POST",
        body: formData,
    });
}

async function updateExpense({ id, data }: { id: string; data: any }) {
    return apiRequest(`/api/expenses/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });
}

async function deleteExpense(id: string) {
    return apiRequest(`/api/expenses/${id}`, {
        method: "DELETE",
    });
}

function invalidateExpenseQueries(queryClient: any, expenseId?: string) {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.lists() });

    queryClient.invalidateQueries({ queryKey: ["grouped-expenses"] });
    queryClient.invalidateQueries({ queryKey: ["grouped-expenses-infinite"] });

    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.overview() });
    queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.spendingTrends(),
    });
    queryClient.invalidateQueries({
        queryKey: queryKeys.analytics.categoryBreakdown(),
    });

    queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.budgets.lists() });

    queryClient.invalidateQueries({ queryKey: queryKeys.reports.all });

    if (expenseId) {
        queryClient.removeQueries({
            queryKey: queryKeys.expenses.detail(expenseId),
        });
    }
}

export function useCreateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: createExpense,
        onSuccess: () => invalidateExpenseQueries(queryClient),
    });
}

export function useUpdateExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: updateExpense,
        onSuccess: (_, variables) =>
            invalidateExpenseQueries(queryClient, variables.id),
    });
}

export function useDeleteExpense() {
    const queryClient = useQueryClient();
    return useMutation({
        mutationFn: deleteExpense,
        onSuccess: (_, id) => invalidateExpenseQueries(queryClient, id),
    });
}
