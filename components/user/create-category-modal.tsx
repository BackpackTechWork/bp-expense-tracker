"use client";

import { useState } from "react";
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
    const [formData, setFormData] = useState({
        name: "",
        color: "#DC143C",
        icon: "",
    });
    const [errors, setErrors] = useState<Record<string, string>>({});

    const createCategoryMutation = useCreateCategory();

    const handleInputChange = (field: string, value: string) => {
        setFormData((prev) => ({ ...prev, [field]: value }));
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setErrors({});

        // Validate with Zod
        const validationResult = createCategorySchema.safeParse(formData);

        if (!validationResult.success) {
            const newErrors: Record<string, string> = {};
            validationResult.error.errors.forEach((error) => {
                if (error.path[0]) {
                    newErrors[error.path[0] as string] = error.message;
                }
            });
            setErrors(newErrors);
            return;
        }

        createCategoryMutation.mutate(validationResult.data, {
            onSuccess: (data) => {
                setFormData({ name: "", color: "#DC143C", icon: "" });
                setIsOpen(false);
                onCategoryCreated?.(data);
            },
            onError: (error) => {
                if (error.message.includes("already exists")) {
                    setErrors({
                        name: "Category with this name already exists",
                    });
                } else {
                    setErrors({ general: error.message });
                }
            },
        });
    };

    const handleCancel = () => {
        setFormData({ name: "", color: "#DC143C", icon: "" });
        setErrors({});
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
                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <Label htmlFor="categoryName">Category Name *</Label>
                        <Input
                            id="categoryName"
                            value={formData.name}
                            onChange={(e) =>
                                handleInputChange("name", e.target.value)
                            }
                            placeholder="e.g., Groceries, Entertainment"
                            className={errors.name ? "border-red-500" : ""}
                        />
                        <ErrorMessage message={errors.name} />
                    </div>

                    <div>
                        <Label htmlFor="categoryColor">Color</Label>
                        <div className="flex items-center space-x-2">
                            <Input
                                id="categoryColor"
                                type="color"
                                value={formData.color}
                                onChange={(e) =>
                                    handleInputChange("color", e.target.value)
                                }
                                className="w-16 h-10 p-1 border rounded"
                            />
                            <Input
                                value={formData.color}
                                onChange={(e) =>
                                    handleInputChange("color", e.target.value)
                                }
                                placeholder="#DC143C"
                                className="flex-1"
                            />
                        </div>
                    </div>

                    <div>
                        <Label htmlFor="categoryIcon">Icon (Optional)</Label>
                        <Input
                            id="categoryIcon"
                            value={formData.icon}
                            onChange={(e) =>
                                handleInputChange("icon", e.target.value)
                            }
                            placeholder="e.g., 🛒, 🎬, 🚗"
                        />
                    </div>

                    <ErrorMessage message={errors.general} />

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
