import { useQuery } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";

interface AnalyticsOverviewParams {
    period?: "week" | "month" | "year" | "all";
    startDate?: string;
    endDate?: string;
}

interface SpendingTrendsParams {
    period?: "week" | "month" | "year";
    months?: number;
}

interface CategoryBreakdownParams {
    period?: "week" | "month" | "year" | "all";
    startDate?: string;
    endDate?: string;
}

// Analytics Overview Hook
async function fetchAnalyticsOverview(params: AnalyticsOverviewParams) {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.set("period", params.period);
    if (params.startDate) searchParams.set("startDate", params.startDate);
    if (params.endDate) searchParams.set("endDate", params.endDate);

    const response = await fetch(
        `/api/analytics/overview?${searchParams.toString()}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch analytics overview");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to fetch analytics overview");
    }

    return data.data;
}

export function useAnalyticsOverview(params: AnalyticsOverviewParams = {}) {
    return useQuery({
        queryKey: [...queryKeys.analytics.overview(), params],
        queryFn: () => fetchAnalyticsOverview(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Spending Trends Hook
async function fetchSpendingTrends(params: SpendingTrendsParams) {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.set("period", params.period);
    if (params.months) searchParams.set("months", params.months.toString());

    const response = await fetch(
        `/api/analytics/spending-trends?${searchParams.toString()}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch spending trends");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to fetch spending trends");
    }

    return data.data;
}

export function useSpendingTrends(params: SpendingTrendsParams = {}) {
    return useQuery({
        queryKey: [
            ...queryKeys.analytics.spendingTrends(params.period),
            params,
        ],
        queryFn: () => fetchSpendingTrends(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}

// Category Breakdown Hook
async function fetchCategoryBreakdown(params: CategoryBreakdownParams) {
    const searchParams = new URLSearchParams();

    if (params.period) searchParams.set("period", params.period);
    if (params.startDate) searchParams.set("startDate", params.startDate);
    if (params.endDate) searchParams.set("endDate", params.endDate);

    const response = await fetch(
        `/api/analytics/category-breakdown?${searchParams.toString()}`
    );

    if (!response.ok) {
        throw new Error("Failed to fetch category breakdown");
    }

    const data = await response.json();

    if (!data.success) {
        throw new Error(data.message || "Failed to fetch category breakdown");
    }

    return data.data;
}

export function useCategoryBreakdown(params: CategoryBreakdownParams = {}) {
    return useQuery({
        queryKey: [
            ...queryKeys.analytics.categoryBreakdown(params.period),
            params,
        ],
        queryFn: () => fetchCategoryBreakdown(params),
        staleTime: 5 * 60 * 1000, // 5 minutes
    });
}
