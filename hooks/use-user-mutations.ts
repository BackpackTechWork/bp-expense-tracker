"use client";

import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";
import type {
    CreateUserData,
    UpdateUserData,
    BanUserData,
} from "@/lib/types/user";

// Create user mutation
export function useCreateUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (userData: CreateUserData) => {
            const response = await fetch("/api/admin/users", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create user");
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            toast({
                title: "✅ Success",
                description:
                    "User created successfully! Default password: password123",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message || "Failed to create user",
                variant: "destructive",
            });
        },
    });
}

// Update user mutation
export function useUpdateUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            userId,
            userData,
        }: {
            userId: string;
            userData: UpdateUserData;
        }) => {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(userData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update user");
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            toast({
                title: "✅ Success",
                description: "User updated successfully",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message || "Failed to update user",
                variant: "destructive",
            });
        },
    });
}

// Ban user mutation
export function useBanUser() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async ({
            userId,
            banned,
        }: {
            userId: string;
            banned: boolean;
        }) => {
            const response = await fetch(`/api/admin/users/${userId}/ban`, {
                method: "PATCH",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ banned }),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to update user");
            }

            return data;
        },
        onSuccess: (_, { banned }) => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            toast({
                title: "✅ Success",
                description: `User ${
                    banned ? "banned" : "unbanned"
                } successfully`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message || "Failed to update user",
                variant: "destructive",
            });
        },
    });
}

// Reset password mutation
export function useResetPassword() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (userId: string) => {
            const response = await fetch(`/api/admin/users/${userId}`, {
                method: "PUT",
                headers: {
                    "Content-Type": "application/json",
                },
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to reset password");
            }

            return data;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: queryKeys.users.all });
            toast({
                title: "✅ Success",
                description: "Password reset successfully to: password123",
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message || "Failed to reset password",
                variant: "destructive",
            });
        },
    });
}
