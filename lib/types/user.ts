/**
 * Shared types for user-related data structures
 * This prevents duplication across different files
 */

export interface User {
    id: string;
    name: string | null;
    email: string;
    role: string;
    isActive: boolean;
    isBanned: boolean;
    lastLoginAt: Date | null;
    createdAt: Date;
    _count: {
        expenses: number;
        activityLogs: number;
    };
}

export interface UserFilters {
    search?: string;
    role?: string;
    status?: string;
}

export interface PaginationParams {
    page: number;
    pageSize: number;
}

export interface UsersResponse {
    users: User[];
    pagination: {
        currentPage: number;
        totalPages: number;
        totalUsers: number;
        pageSize: number;
        hasNextPage: boolean;
        hasPreviousPage: boolean;
    };
}

export interface CreateUserData {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
}

export interface UpdateUserData {
    name?: string;
    email?: string;
    role?: "USER" | "ADMIN";
    isActive?: boolean;
}

export interface BanUserData {
    banned: boolean;
}
