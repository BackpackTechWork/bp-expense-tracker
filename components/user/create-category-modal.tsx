"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Loader } from "@/components/ui/loader";
import { ErrorMessage } from "@/components/ui/error-message";
import { FieldError } from "@/components/ui/field-error";
import { Plus } from "lucide-react";
import { useCreateCategory } from "@/hooks/use-categories";
import {
    createCategorySchema,
    type CreateCategoryData,
} from "@/lib/validations/category";

interface CreateCategoryModalProps {
    children?: React.ReactNode;
    onCategoryCreated?: (category: any) => void;
}

export function CreateCategoryModal({
    children,
    onCategoryCreated,
}: CreateCategoryModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const [error, setError] = useState("");

    const createCategoryMutation = useCreateCategory();

    const form = useForm<CreateCategoryData>({
        resolver: zodResolver(createCategorySchema),
        defaultValues: {
            name: "",
            color: "#DC143C",
            icon: "",
        },
    });

    const onSubmit = (data: CreateCategoryData) => {
        setError("");
        createCategoryMutation.mutate(data, {
            onSuccess: (data) => {
                form.reset();
                setIsOpen(false);
                onCategoryCreated?.(data);
            },
            onError: (error) => {
                if (error.message.includes("already exists")) {
                    form.setError("name", {
                        message: "Category with this name already exists",
                    });
                } else {
                    setError(error.message);
                }
            },
        });
    };

    const handleCancel = () => {
        form.reset();
        setError("");
        setIsOpen(false);
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button variant="outline" size="sm">
                        <Plus className="h-4 w-4 mr-2" />
                        Add Category
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New Category</DialogTitle>
                    <DialogDescription>
                        Add a new expense category to organize your spending
                    </DialogDescription>
                </DialogHeader>
                <form
                    onSubmit={form.handleSubmit(onSubmit)}
                    className="space-y-4"
                >
                    <div className="space-y-2">
                        <Label htmlFor="categoryName text-sm font-medium">
                            Category Name
                            <span className="text-red-500">*</span>
                        </Label>
                        <Input
                            id="categoryName"
                            {...form.register("name")}
                            placeholder="e.g., Groceries, Entertainment"
                            className={
                                form.formState.errors.name
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError
                            message={form.formState.errors.name?.message || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoryColor">Color</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="categoryColor"
                                type="color"
                                {...form.register("color")}
                                className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                                {...form.register("color")}
                                placeholder="#DC143C"
                                className={`flex-1 ${
                                    form.formState.errors.color
                                        ? "border-red-500 focus:border-red-500"
                                        : ""
                                }`}
                            />
                        </div>
                        <FieldError
                            message={form.formState.errors.color?.message || ""}
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="categoryIcon">Icon (Optional)</Label>
                        <Input
                            id="categoryIcon"
                            {...form.register("icon")}
                            placeholder="e.g., 🛒, 🎬, 🚗"
                            className={
                                form.formState.errors.icon
                                    ? "border-red-500 focus:border-red-500"
                                    : ""
                            }
                        />
                        <FieldError
                            message={form.formState.errors.icon?.message || ""}
                        />
                    </div>

                    <ErrorMessage message={error} />

                    <div className="flex justify-end space-x-2 pt-4">
                        <Button
                            type="button"
                            variant="outline"
                            onClick={handleCancel}
                        >
                            Cancel
                        </Button>
                        <Button
                            type="submit"
                            disabled={createCategoryMutation.isPending}
                        >
                            {createCategoryMutation.isPending ? (
                                <Loader size="sm" />
                            ) : (
                                "Create Category"
                            )}
                        </Button>
                    </div>
                </form>
            </DialogContent>
        </Dialog>
    );
}
