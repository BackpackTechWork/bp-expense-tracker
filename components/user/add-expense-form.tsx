"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { queryKeys } from "@/lib/query-keys";
import { useCategories } from "@/hooks/use-categories";
import { CreateCategoryModal } from "@/components/user/create-category-modal";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { FieldError } from "@/components/ui/field-error";
import { ValidationSummary } from "@/components/ui/validation-summary";
import { Loader2, Upload, X, Plus } from "lucide-react";
import { useExpenseStore } from "@/lib/store";
import { expenseSchema, type ExpenseInput } from "@/lib/validations";
import { cn } from "@/lib/utils";

interface AddExpenseFormProps {
    categories?: any[];
}

type ExpenseFormData = {
    amount: number;
    description: string;
    note: string;
    categoryId: string;
    date: string;
    receiptUrl: string;
};

export function AddExpenseForm({
    categories: propCategories,
}: AddExpenseFormProps) {
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [error, setError] = useState("");

    const router = useRouter();
    const queryClient = useQueryClient();
    const addExpense = useExpenseStore((state) => state.addExpense);

    const form = useForm<ExpenseFormData>({
        resolver: zodResolver(expenseSchema),
        defaultValues: {
            amount: 0,
            description: "",
            note: "",
            categoryId: "",
            date: new Date().toISOString().split("T")[0],
            receiptUrl: "",
        },
    });

    const {
        data: categories = propCategories || [],
        isLoading: categoriesLoading,
    } = useCategories();

    const createExpenseMutation = useMutation({
        mutationFn: async (data: ExpenseInput & { receipt?: File }) => {
            const formData = new FormData();
            formData.append("amount", data.amount.toString());
            formData.append("categoryId", data.categoryId);
            formData.append(
                "date",
                data.date instanceof Date
                    ? data.date.toISOString().split("T")[0]
                    : data.date
            );

            if (data.description) {
                formData.append("description", data.description);
            }
            if (data.note) {
                formData.append("note", data.note);
            }
            if (data.receipt) {
                formData.append("receipt", data.receipt);
            }

            const response = await fetch("/api/expenses", {
                method: "POST",
                body: formData,
            });

            if (!response.ok) {
                throw new Error("Failed to create expense");
            }

            return response.json();
        },
        onSuccess: (data) => {
            addExpense(data.expense);
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
            form.reset();
            setReceiptFile(null);
            router.push("/dashboard");
        },
        onError: (error) => {
            setError("Failed to create expense. Please try again.");
        },
    });

    const onSubmit = (data: ExpenseFormData) => {
        setError("");
        const expenseData: ExpenseInput = {
            ...data,
            date: new Date(data.date),
        };
        createExpenseMutation.mutate({
            ...expenseData,
            receipt: receiptFile || undefined,
        });
    };

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            if (file.size > 5 * 1024 * 1024) {
                setError("File size must be less than 5MB");
                return;
            }
            setReceiptFile(file);
        }
    };

    const removeFile = () => {
        setReceiptFile(null);
    };

    return (
        <Card className="bg-white/80 backdrop-blur-sm border-white/20">
            <CardHeader>
                <CardTitle className="text-xl font-semibold text-[#DC143C]">
                    New Expense
                </CardTitle>
                <div className="mt-2 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                    <p className="text-sm text-blue-800">
                        <span className="font-medium">Required fields:</span>{" "}
                        Amount, Category, and Date
                    </p>
                    <p className="text-xs text-blue-600 mt-1">
                        Description, Note, and Receipt are optional
                    </p>
                </div>
            </CardHeader>
            <CardContent>
                {error && (
                    <Alert variant="destructive" className="mb-6">
                        <AlertDescription>{error}</AlertDescription>
                    </Alert>
                )}

                <ValidationSummary
                    errors={Object.values(form.formState.errors).map(
                        (error) => error?.message || ""
                    )}
                />

                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-6"
                >
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="space-y-2">
                            <Label
                                htmlFor="amount"
                                className="text-sm font-medium"
                            >
                                Amount <span className="text-red-500">*</span>
                            </Label>
                            <Input
                                id="amount"
                                type="number"
                                step="0.01"
                                placeholder="0.00"
                                {...form.register("amount", {
                                    valueAsNumber: true,
                                })}
                                className={
                                    form.formState.errors.amount
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }
                            />
                            <FieldError
                                message={
                                    form.formState.errors.amount?.message || ""
                                }
                            />
                        </div>

                        <div className="space-y-2">
                            <Label
                                htmlFor="category"
                                className="text-sm font-medium"
                            >
                                Category <span className="text-red-500">*</span>
                            </Label>
                            <div className="flex gap-2">
                                <div className="flex-1">
                                    <Select
                                        value={form.watch("categoryId")}
                                        onValueChange={(value) =>
                                            form.setValue("categoryId", value)
                                        }
                                    >
                                        <SelectTrigger
                                            className={cn(
                                                form.formState.errors.categoryId
                                                    ? "border-red-500 focus:border-red-500"
                                                    : "",
                                                "w-full"
                                            )}
                                        >
                                            <SelectValue
                                                placeholder={
                                                    categoriesLoading
                                                        ? "Loading categories..."
                                                        : "Select category"
                                                }
                                            />
                                        </SelectTrigger>
                                        <SelectContent>
                                            {categories.map((category) => (
                                                <SelectItem
                                                    key={category.id}
                                                    value={category.id}
                                                >
                                                    <div className="flex items-center space-x-2">
                                                        <span>
                                                            {category.icon ||
                                                                "📦"}
                                                        </span>
                                                        <span>
                                                            {category.name}
                                                        </span>
                                                    </div>
                                                </SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                                <CreateCategoryModal
                                    onCategoryCreated={(newCategory) => {
                                        form.setValue(
                                            "categoryId",
                                            newCategory.id
                                        );
                                    }}
                                >
                                    <Button
                                        variant="outline"
                                        size="sm"
                                        type="button"
                                        className="px-3"
                                    >
                                        <Plus className="h-4 w-4" />
                                    </Button>
                                </CreateCategoryModal>
                            </div>
                            <FieldError
                                message={
                                    form.formState.errors.categoryId?.message ||
                                    ""
                                }
                            />
                        </div>
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="description"
                            className="text-sm font-medium"
                        >
                            Description{" "}
                            <span className="text-gray-500 text-xs">
                                (optional)
                            </span>
                        </Label>
                        <Input
                            id="description"
                            placeholder="What did you spend on?"
                            {...form.register("description")}
                            className={
                                form.formState.errors.description
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError
                            message={
                                form.formState.errors.description?.message || ""
                            }
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            {...form.register("date")}
                            className={
                                form.formState.errors.date
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError
                            message={form.formState.errors.date?.message || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="note" className="text-sm font-medium">
                            Note{" "}
                            <span className="text-gray-500 text-xs">
                                (optional)
                            </span>
                        </Label>
                        <Textarea
                            id="note"
                            placeholder="Additional notes (optional)"
                            {...form.register("note")}
                            rows={3}
                            className={
                                form.formState.errors.note
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError
                            message={form.formState.errors.note?.message || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label
                            htmlFor="receipt"
                            className="text-sm font-medium"
                        >
                            Receipt{" "}
                            <span className="text-gray-500 text-xs">
                                (optional)
                            </span>
                        </Label>
                        <div className="flex items-center space-x-4">
                            <Input
                                id="receipt"
                                type="file"
                                accept="image/*"
                                onChange={handleFileChange}
                                className="hidden"
                            />
                            <Button
                                type="button"
                                variant="outline"
                                onClick={() =>
                                    document.getElementById("receipt")?.click()
                                }
                            >
                                <Upload className="h-4 w-4 mr-2" />
                                Upload Receipt
                            </Button>
                            {receiptFile && (
                                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                                    <span className="text-sm text-gray-700">
                                        {receiptFile.name}
                                    </span>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        size="sm"
                                        onClick={removeFile}
                                    >
                                        <X className="h-4 w-4" />
                                    </Button>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="flex space-x-4">
                        <Button
                            type="submit"
                            className="flex-1 bg-[#DC143C] hover:bg-[#F75270]"
                            disabled={createExpenseMutation.isPending}
                        >
                            {createExpenseMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Add Expense
                        </Button>
                        <Button
                            type="button"
                            variant="outline"
                            onClick={() => router.back()}
                        >
                            Cancel
                        </Button>
                    </div>
                </form>
            </CardContent>
        </Card>
    );
}
