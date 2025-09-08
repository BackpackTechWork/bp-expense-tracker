"use client";

import { useState, useEffect } from "react";
import { format } from "date-fns";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { queryKeys } from "@/lib/query-keys";
import { useCategories } from "@/hooks/use-categories";
import { useUpdateExpense, useDeleteExpense } from "@/hooks/use-expenses";
import { useToast } from "@/hooks/use-toast";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";
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
import {
    Calendar,
    DollarSign,
    Tag,
    FileText,
    Edit,
    Trash2,
    Save,
    X,
    Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency } from "@/lib/currency-utils";

interface Expense {
    id: string;
    amount: number;
    description: string | null;
    note: string | null;
    date: Date | string;
    category: {
        id: string;
        name: string;
        color: string;
        icon: string | null;
    };
    receiptUrl?: string | null;
}

interface ExpenseDetailModalProps {
    expense: Expense | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

type ModalMode = "view" | "edit";

export function ExpenseDetailModal({
    expense,
    isOpen,
    onOpenChange,
}: ExpenseDetailModalProps) {
    const [mode, setMode] = useState<ModalMode>("view");
    const [showDeleteDialog, setShowDeleteDialog] = useState(false);

    // Edit form state
    const [amount, setAmount] = useState("");
    const [description, setDescription] = useState("");
    const [note, setNote] = useState("");
    const [categoryId, setCategoryId] = useState("");
    const [date, setDate] = useState("");
    const [receiptFile, setReceiptFile] = useState<File | null>(null);
    const [error, setError] = useState("");
    const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});

    const queryClient = useQueryClient();
    const { toast } = useToast();
    const updateExpenseMutation = useUpdateExpense();
    const deleteExpenseMutation = useDeleteExpense();

    const { data: categories = [] } = useCategories();

    useEffect(() => {
        if (expense) {
            setAmount(expense.amount.toString());
            setDescription(expense.description || "");
            setNote(expense.note || "");
            setCategoryId(expense.category.id);
            setDate(new Date(expense.date).toISOString().split("T")[0]);
            setReceiptFile(null);
            setError("");
            setFieldErrors({});
            setMode("view");
        }
    }, [expense]);

    const formatDate = (date: Date | string) => {
        return format(new Date(date), "MMM dd, yyyy");
    };

    const validateForm = () => {
        const errors: Record<string, string> = {};

        if (!amount || Number.parseFloat(amount) <= 0) {
            errors.amount = "Amount must be greater than 0";
        }

        if (!categoryId) {
            errors.categoryId = "Category is required";
        }

        if (!date) {
            errors.date = "Date is required";
        }

        setFieldErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleEdit = () => {
        setMode("edit");
    };

    const handleCancel = () => {
        if (expense) {
            setAmount(expense.amount.toString());
            setDescription(expense.description || "");
            setNote(expense.note || "");
            setCategoryId(expense.category.id);
            setDate(new Date(expense.date).toISOString().split("T")[0]);
            setReceiptFile(null);
            setError("");
            setFieldErrors({});
        }
        setMode("view");
    };

    const handleSave = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!expense || !validateForm()) {
            return;
        }

        try {
            const updateData = {
                amount: Number.parseFloat(amount),
                description: description || null,
                note: note || null,
                categoryId,
                date: date, // Send as string, schema will handle conversion
            };

            updateExpenseMutation.mutate(
                { id: expense.id, data: updateData },
                {
                    onSuccess: () => {
                        toast({
                            title: "Success",
                            description: "Expense updated successfully",
                        });
                        setMode("view");
                    },
                    onError: (error: Error) => {
                        setError(error.message || "Failed to update expense");
                    },
                }
            );
        } catch (error) {
            setError("Failed to update expense. Please try again.");
        }
    };

    const handleDelete = () => {
        if (!expense) return;

        deleteExpenseMutation.mutate(expense.id, {
            onSuccess: () => {
                toast({
                    title: "Success",
                    description: "Expense deleted successfully",
                });
                setShowDeleteDialog(false);
                onOpenChange(false);
            },
            onError: (error: Error) => {
                toast({
                    title: "Error",
                    description: error.message || "Failed to delete expense",
                    variant: "destructive",
                });
            },
        });
    };

    const handleReceiptChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf",
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(file.type)) {
                setError(
                    "Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed."
                );
                return;
            }

            if (file.size > maxSize) {
                setError("File size too large. Maximum size is 5MB.");
                return;
            }

            setReceiptFile(file);
            setError("");
        }
    };

    const removeReceipt = () => {
        setReceiptFile(null);
    };

    if (!expense) return null;

    return (
        <>
            <Dialog open={isOpen} onOpenChange={onOpenChange}>
                <DialogContent className="max-w-2xl">
                    <DialogHeader>
                        <DialogTitle className="flex items-center space-x-2">
                            <div
                                className="w-8 h-8 rounded-full flex items-center justify-center text-white"
                                style={{
                                    backgroundColor: expense.category.color,
                                }}
                            >
                                {expense.category.icon ? (
                                    <span className="text-sm">
                                        {expense.category.icon}
                                    </span>
                                ) : (
                                    <Tag className="h-4 w-4" />
                                )}
                            </div>
                            <span>
                                {mode === "view"
                                    ? "Expense Details"
                                    : "Edit Expense"}
                            </span>
                        </DialogTitle>
                    </DialogHeader>

                    {mode === "view" ? (
                        // View Mode
                        <div className="space-y-6">
                            {/* Amount */}
                            <div className="text-center">
                                <p className="text-4xl font-bold text-[#DC143C] mb-2">
                                    {formatCurrency(expense.amount)}
                                </p>
                                <p className="text-gray-600">
                                    {formatDate(new Date(expense.date))}
                                </p>
                            </div>

                            {/* Details Grid */}
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                {/* Description */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <FileText className="h-4 w-4" />
                                        <span>Description</span>
                                    </h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {expense.description ||
                                            "No description provided"}
                                    </p>
                                </div>

                                {/* Category */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <Tag className="h-4 w-4" />
                                        <span>Category</span>
                                    </h4>
                                    <div className="flex items-center space-x-2">
                                        <div
                                            className="w-4 h-4 rounded-full"
                                            style={{
                                                backgroundColor:
                                                    expense.category.color,
                                            }}
                                        />
                                        <span className="text-gray-700">
                                            {expense.category.name}
                                        </span>
                                    </div>
                                </div>

                                {/* Date */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <Calendar className="h-4 w-4" />
                                        <span>Date</span>
                                    </h4>
                                    <p className="text-gray-700">
                                        {formatDate(new Date(expense.date))}
                                    </p>
                                </div>

                                {/* Amount */}
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900 flex items-center space-x-2">
                                        <DollarSign className="h-4 w-4" />
                                        <span>Amount</span>
                                    </h4>
                                    <p className="text-gray-700 font-semibold">
                                        {formatCurrency(expense.amount)}
                                    </p>
                                </div>
                            </div>

                            {/* Note */}
                            {expense.note && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">
                                        Note
                                    </h4>
                                    <p className="text-gray-700 bg-gray-50 p-3 rounded-lg">
                                        {expense.note}
                                    </p>
                                </div>
                            )}

                            {/* Receipt */}
                            {expense.receiptUrl && (
                                <div className="space-y-2">
                                    <h4 className="font-semibold text-gray-900">
                                        Receipt
                                    </h4>
                                    <div className="bg-gray-50 p-3 rounded-lg">
                                        <a
                                            href={expense.receiptUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-[#DC143C] hover:underline"
                                        >
                                            View Receipt
                                        </a>
                                    </div>
                                </div>
                            )}

                            {/* Action Buttons */}
                            <div className="flex justify-end space-x-2 pt-4 border-t">
                                <Button variant="outline" onClick={handleEdit}>
                                    <Edit className="h-4 w-4 mr-2" />
                                    Edit
                                </Button>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowDeleteDialog(true)}
                                    className="text-red-600 hover:text-red-700 hover:bg-red-50"
                                >
                                    <Trash2 className="h-4 w-4 mr-2" />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    ) : (
                        // Edit Mode
                        <form onSubmit={handleSave} className="space-y-4">
                            {error && (
                                <Alert variant="destructive">
                                    <AlertDescription>{error}</AlertDescription>
                                </Alert>
                            )}

                            <div className="space-y-2">
                                <Label htmlFor="amount">Amount *</Label>
                                <Input
                                    id="amount"
                                    type="number"
                                    step="0.01"
                                    min="0"
                                    value={amount}
                                    onChange={(e) => setAmount(e.target.value)}
                                    placeholder="0.00"
                                />
                                <FieldError message={fieldErrors.amount} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="description">Description</Label>
                                <Input
                                    id="description"
                                    value={description}
                                    onChange={(e) =>
                                        setDescription(e.target.value)
                                    }
                                    placeholder="Enter expense description"
                                />
                                <FieldError message={fieldErrors.description} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="note">Note</Label>
                                <Textarea
                                    id="note"
                                    value={note}
                                    onChange={(e) => setNote(e.target.value)}
                                    placeholder="Additional notes (optional)"
                                    rows={3}
                                />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="category">Category *</Label>
                                <Select
                                    value={categoryId}
                                    onValueChange={setCategoryId}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select category" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        {categories.map((category) => (
                                            <SelectItem
                                                key={category.id}
                                                value={category.id}
                                            >
                                                {category.icon} {category.name}
                                            </SelectItem>
                                        ))}
                                    </SelectContent>
                                </Select>
                                <FieldError message={fieldErrors.categoryId} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="date">Date *</Label>
                                <Input
                                    id="date"
                                    type="date"
                                    value={date}
                                    onChange={(e) => setDate(e.target.value)}
                                />
                                <FieldError message={fieldErrors.date} />
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="receipt">Receipt</Label>
                                <div className="flex items-center space-x-2">
                                    <Input
                                        id="receipt"
                                        type="file"
                                        accept="image/*,.pdf"
                                        onChange={handleReceiptChange}
                                        className="flex-1"
                                    />
                                </div>
                                {receiptFile && (
                                    <div className="flex items-center justify-between bg-gray-50 p-2 rounded">
                                        <span className="text-sm text-gray-600">
                                            {receiptFile.name}
                                        </span>
                                        <Button
                                            type="button"
                                            variant="ghost"
                                            size="sm"
                                            onClick={removeReceipt}
                                        >
                                            <X className="h-4 w-4" />
                                        </Button>
                                    </div>
                                )}
                                {expense.receiptUrl && !receiptFile && (
                                    <p className="text-sm text-gray-500">
                                        Current receipt:{" "}
                                        {expense.receiptUrl.split("/").pop()}
                                    </p>
                                )}
                            </div>

                            <div className="flex justify-end space-x-2 pt-4">
                                <Button
                                    type="button"
                                    variant="outline"
                                    onClick={handleCancel}
                                >
                                    <X className="h-4 w-4 mr-2" />
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    disabled={updateExpenseMutation.isPending}
                                    className="bg-[#DC143C] hover:bg-[#F75270]"
                                >
                                    {updateExpenseMutation.isPending && (
                                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                    )}
                                    <Save className="h-4 w-4 mr-2" />
                                    Save Changes
                                </Button>
                            </div>
                        </form>
                    )}
                </DialogContent>
            </Dialog>

            {/* Delete Confirmation Dialog */}
            <AlertDialog
                open={showDeleteDialog}
                onOpenChange={setShowDeleteDialog}
            >
                <AlertDialogContent>
                    <AlertDialogHeader>
                        <AlertDialogTitle>Delete Expense</AlertDialogTitle>
                        <AlertDialogDescription>
                            Are you sure you want to delete this expense? This
                            action cannot be undone.
                        </AlertDialogDescription>
                    </AlertDialogHeader>

                    <div className="bg-gray-50 p-4 rounded-lg">
                        <div className="space-y-2">
                            <div className="flex justify-between">
                                <span className="font-medium">
                                    Description:
                                </span>
                                <span>
                                    {expense.description || "No description"}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Amount:</span>
                                <span>{formatCurrency(expense.amount)}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Category:</span>
                                <span>{expense.category.name}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="font-medium">Date:</span>
                                <span>
                                    {new Date(
                                        expense.date
                                    ).toLocaleDateString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    <AlertDialogFooter>
                        <AlertDialogCancel>Cancel</AlertDialogCancel>
                        <AlertDialogAction
                            onClick={handleDelete}
                            disabled={deleteExpenseMutation.isPending}
                            className="bg-red-600 hover:bg-red-700"
                        >
                            {deleteExpenseMutation.isPending && (
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                            )}
                            Delete
                        </AlertDialogAction>
                    </AlertDialogFooter>
                </AlertDialogContent>
            </AlertDialog>
        </>
    );
}
