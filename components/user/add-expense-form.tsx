"use client";

import type React from "react";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useMutation, useQueryClient } from "@tanstack/react-query";
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

interface AddExpenseFormProps {
    categories?: any[]; // Keep for backward compatibility, but we'll use React Query
}

export function AddExpenseForm({
    categories: propCategories,
}: AddExpenseFormProps) {
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState(new Date().toISOString().split("T")[0]);
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const router = useRouter();
    const queryClient = useQueryClient();
    const addExpense = useExpenseStore((state) => state.addExpense);

    // Use React Query to fetch categories, fallback to props for backward compatibility
    const {
        data: categories = propCategories || [],
        isLoading: categoriesLoading,
    } = useCategories();

    const createExpenseMutation = useMutation({
        mutationFn: async (data: FormData) => {
            const response = await fetch("/api/expenses", {
                method: "POST",
                body: data,
            });

            if (!response.ok) {
                throw new Error("Failed to create expense");
            }

            return response.json();
        },
        onSuccess: (data) => {
            addExpense(data.expense);
            queryClient.invalidateQueries({ queryKey: queryKeys.expenses.all });
            router.push("/dashboard");
        },
        onError: (error) => {
            setError("Failed to create expense. Please try again.");
        },
    });

    const validateForm = () => {
        const errors: Record<string, string> = {};
        const validationErrors: string[] = [];

        // Required fields validation
        if (!amount || amount.trim() === "") {
            errors.amount = "Amount is required";
            validationErrors.push("Amount is required");
        } else if (isNaN(Number(amount)) || Number(amount) <= 0) {
            errors.amount = "Amount must be a positive number";
            validationErrors.push("Amount must be a positive number");
        }

        if (!categoryId || categoryId.trim() === "") {
            errors.categoryId = "Category is required";
            validationErrors.push("Category is required");
        }

        if (!date || date.trim() === "") {
            errors.date = "Date is required";
            validationErrors.push("Date is required");
        } else {
            const selectedDate = new Date(date);
            const minDate = new Date("1900-01-01");
            if (isNaN(selectedDate.getTime()) || selectedDate < minDate) {
                errors.date = "Please select a valid date";
                validationErrors.push("Please select a valid date");
            }
        }

        // Optional field validation
        if (description && description.length > 200) {
            errors.description = "Description must be less than 200 characters";
            validationErrors.push(
                "Description must be less than 200 characters"
            );
        }

        if (note && note.length > 500) {
            errors.note = "Note must be less than 500 characters";
            validationErrors.push("Note must be less than 500 characters");
        }

        setFieldErrors(errors);
        return validationErrors;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError("");
        setFieldErrors({});

        const validationErrors = validateForm();

        if (validationErrors.length > 0) {
            return;
        }

        const formData = new FormData();
        formData.append("amount", amount);
        if (description.trim()) {
            formData.append("description", description);
        }
        if (note.trim()) {
            formData.append("note", note);
        }
        formData.append("categoryId", categoryId);
        formData.append("date", date);

        if (receiptFile) {
            formData.append("receipt", receiptFile);
        }

        createExpenseMutation.mutate(formData);
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

                <ValidationSummary errors={Object.values(fieldErrors)} />

                <form onSubmit={handleSubmit} className="space-y-6">
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
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                className={
                                    fieldErrors.amount
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }
                            />
                            <FieldError message={fieldErrors.amount} />
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
                                        value={categoryId}
                                        onValueChange={setCategoryId}
                                    >
                                        <SelectTrigger
                                            className={
                                                fieldErrors.categoryId
                                                    ? "border-red-500 focus:border-red-500"
                                                    : ""
                                            }
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
                                        setCategoryId(newCategory.id);
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
                            <FieldError message={fieldErrors.categoryId} />
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
                            value={description}
                            onChange={(e) => setDescription(e.target.value)}
                            className={
                                fieldErrors.description
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError message={fieldErrors.description} />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="date" className="text-sm font-medium">
                            Date <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="date"
                            type="date"
                            value={date}
                            onChange={(e) => setDate(e.target.value)}
                            className={
                                fieldErrors.date
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError message={fieldErrors.date} />
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
                            value={note}
                            onChange={(e) => setNote(e.target.value)}
                            rows={3}
                            className={
                                fieldErrors.note
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError message={fieldErrors.note} />
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
