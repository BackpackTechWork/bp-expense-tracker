import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface BudgetFilters {
    categoryId?: string;
    period?: "DAILY" | "WEEKLY" | "MONTHLY" | "YEARLY";
    isActive?: boolean;
}

interface BudgetsParams {
    filters?: BudgetFilters;
}

// Fetch budgets
async function fetchBudgets(params: BudgetsParams = {}) {
    const searchParams = new URLSearchParams();

    if (params.filters?.categoryId)
        searchParams.set("categoryId", params.filters.categoryId);
    if (params.filters?.period)
        searchParams.set("period", params.filters.period);
    if (params.filters?.isActive !== undefined)
        searchParams.set("isActive", params.filters.isActive.toString());

    const response = await fetch(`/api/budgets?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch budgets");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to fetch budgets");
    }

    return data.data;
}

export function useBudgets(params: BudgetsParams = {}) {
    return useQuery({
        queryKey: queryKeys.budgets.list(params.filters),
        queryFn: () => fetchBudgets(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Fetch active budgets for current period
export function useActiveBudgets() {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0);

    return useQuery({
        queryKey: queryKeys.budgets.list({ isActive: true }),
        queryFn: () =>
            fetchBudgets({
                filters: {
                    isActive: true,
                    period: "MONTHLY", // Default to monthly for dashboard
                },
            }),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Create budget mutation
async function createBudget(data: any) {
    const response = await fetch("/api/budgets", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to create budget");
    }

    return response.json();
}

export function useCreateBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: createBudget,
        onSuccess: () => {
            // Invalidate and refetch budgets queries
            queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
        },
    });
}

// Update budget mutation
async function updateBudget({ id, data }: { id: string; data: any }) {
    const response = await fetch(`/api/budgets/${id}`, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(data),
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to update budget");
    }

    return response.json();
}

export function useUpdateBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: updateBudget,
        onSuccess: (_, variables) => {
            // Invalidate and refetch budgets queries
            queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
            queryClient.invalidateQueries({
                queryKey: queryKeys.budgets.detail(variables.id),
            });
        },
    });
}

// Delete budget mutation
async function deleteBudget(id: string) {
    const response = await fetch(`/api/budgets/${id}`, {
        method: "DELETE",
    });

    if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || "Failed to delete budget");
    }

    return response.json();
}

export function useDeleteBudget() {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: deleteBudget,
        onSuccess: (_, id) => {
            // Invalidate and refetch budgets queries
            queryClient.invalidateQueries({ queryKey: queryKeys.budgets.all });
            queryClient.removeQueries({
                queryKey: queryKeys.budgets.detail(id),
            });
        },
    });
}
