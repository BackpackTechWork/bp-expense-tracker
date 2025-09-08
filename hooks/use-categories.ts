"use client";

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryKeys } from "@/lib/query-keys";
import { type CreateCategoryData } from "@/lib/validations/category";

interface Category {
    id: string;
    name: string;
    color: string;
    icon: string | null;
    createdAt: Date;
    updatedAt: Date;
}

const fetchCategories = async (): Promise<Category[]> => {
    const response = await fetch("/api/categories");

    if (!response.ok) {
        throw new Error("Failed to fetch categories");
    }

    const result = await response.json();

    if (!result.success) {
        throw new Error(result.message || "Failed to fetch categories");
    }

    return result.data;
};

export function useCategories() {
    const query = useQuery({
        queryKey: queryKeys.expenses.categories(),
        queryFn: fetchCategories,
        staleTime: 5 * 60 * 1000, // 5 minutes
    });

    return query;
}

export function useCreateCategory() {
    const queryClient = useQueryClient();
    const { toast } = useToast();

    return useMutation({
        mutationFn: async (categoryData: CreateCategoryData) => {
            const response = await fetch("/api/categories", {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(categoryData),
            });

            const data = await response.json();

            if (!response.ok || !data.success) {
                throw new Error(data.message || "Failed to create category");
            }

            return data.data;
        },
        onSuccess: (data) => {
            queryClient.invalidateQueries({
                queryKey: queryKeys.expenses.categories(),
            });
            toast({
                title: "✅ Success",
                description: `Category "${data.name}" created successfully`,
            });
        },
        onError: (error: Error) => {
            toast({
                title: "❌ Error",
                description: error.message || "Failed to create category",
                variant: "destructive",
            });
        },
    });
}
