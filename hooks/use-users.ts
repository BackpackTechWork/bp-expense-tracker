"use client";

import { useQuery, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import type {
    User,
    UserFilters,
    PaginationParams,
    UsersResponse,
} from "@/lib/types/user";

interface UseUsersParams {
    filters: UserFilters;
    pagination: PaginationParams;
}

const fetchUsers = async (params: UseUsersParams): Promise<UsersResponse> => {
    const searchParams = new URLSearchParams();
    searchParams.set("page", params.pagination.page.toString());
    searchParams.set("pageSize", params.pagination.pageSize.toString());

    if (params.filters.search)
        searchParams.set("search", params.filters.search);
    if (params.filters.role && params.filters.role !== "all")
        searchParams.set("role", params.filters.role);
    if (params.filters.status && params.filters.status !== "all")
        searchParams.set("status", params.filters.status);

    const response = await fetch(`/api/admin/users?${searchParams.toString()}`);

    if (!response.ok) {
        throw new Error("Failed to fetch users");
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Failed to fetch users");
    }

    return result.data;
};

export function useUsers(params: UseUsersParams) {
    const queryClient = useQueryClient();

    const query = useQuery({
        queryKey: queryKeys.users.list(params.filters, params.pagination),
        queryFn: () => fetchUsers(params),
        staleTime: 30 * 1000, // 30 seconds - shorter for user data
    });

    const invalidateUsers = () => {
        queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
    };

    const refetchUsers = () => {
        queryClient.refetchQueries({ queryKey: queryKeys.users.all });
    };

    return {
        ...query,
        invalidateUsers,
        refetchUsers,
        // Computed states for easier use
        isError: query.isError,
        isSuccess: query.isSuccess,
        isPending: query.isPending,
        isFetching: query.isFetching,
        error: query.error,
    };
}
