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

// Build query parameters
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

// Fetch expenses
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

// Fetch recent expenses
export function useRecentExpenses(limit: number = 5) {
    return useQuery({
        queryKey: queryKeys.expenses.list({ limit }),
        queryFn: () => fetchExpenses({ limit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
    });
}

// Fetch expenses for a specific user (admin use)
export function useUserExpenses(userId: string, limit: number = 10) {
    return useQuery({
        queryKey: queryKeys.expenses.list({ userId, limit }),
        queryFn: () => fetchExpenses({ filters: { userId }, limit }),
        staleTime: 2 * 60 * 1000, // 2 minutes
        enabled: !!userId,
    });
}

// Generic mutation functions
async function createExpense(formData: FormData) {
    return apiRequest("/api/expenses", {
        method: "POST",
        body: formData,
    });
}

async function updateExpense({ id, data }: { id: string; data: FormData }) {
    return apiRequest(`/api/expenses/${id}`, {
        method: "PATCH",
        body: data,
    });
}

async function deleteExpense(id: string) {
    return apiRequest(`/api/expenses/${id}`, {
        method: "DELETE",
    });
}

// Generic query invalidation function
function invalidateExpenseQueries(queryClient: any, expenseId?: string) {
    queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
    queryClient.invalidateQueries({ queryKey: queryKeys.analytics.all });

    if (expenseId) {
        queryClient.removeQueries({
            queryKey: queryKeys.expenses.detail(expenseId),
        });
    }
}

// Hooks
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
