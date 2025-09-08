"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Loader } from "@/components/ui/loader";
import { ErrorMessage } from "@/components/ui/error-message";
import { createUserSchema, updateUserSchema } from "@/lib/validations/user";
import { z } from "zod";

interface UserFormData {
    name: string;
    email: string;
    role: "USER" | "ADMIN";
    isActive?: boolean;
}

interface UserFormProps {
    initialData?: Partial<UserFormData>;
    mode: "create" | "edit";
    onSubmit: (data: UserFormData) => Promise<void>;
    onCancel: () => void;
    isLoading?: boolean;
    submitButtonText?: string;
}

export function UserForm({
    initialData = {},
    mode,
    onSubmit,
    onCancel,
    isLoading = false,
    submitButtonText,
}: UserFormProps) {
    const [formData, setFormData] = useState<UserFormData>({
        name: initialData.name || "",
        email: initialData.email || "",
        role: initialData.role || "USER",
        isActive: initialData.isActive ?? true,
    });

    const [errors, setErrors] = useState<Record<string, string>>({});

    const handleInputChange = (
        field: keyof UserFormData,
        value: string | boolean
    ) => {
        setFormData((prev) => ({ ...prev, [field]: value }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors((prev) => ({ ...prev, [field]: "" }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        // Clear previous errors
        setErrors({});

        // Validate with Zod
        const schema = mode === "create" ? createUserSchema : updateUserSchema;
        const validationResult = schema.safeParse(formData);

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

        try {
            await onSubmit(formData);
        } catch (error) {
            console.error("Form submission error:", error);
        }
    };

    const getSubmitButtonText = () => {
        if (submitButtonText) return submitButtonText;
        return mode === "create" ? "Create User" : "Update User";
    };

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <Label htmlFor="name">Name</Label>
                <Input
                    id="name"
                    value={formData.name}
                    onChange={(e) => handleInputChange("name", e.target.value)}
                    placeholder="Enter user name"
                    className={errors.name ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.name} />
            </div>

            <div>
                <Label htmlFor="email">Email</Label>
                <Input
                    id="email"
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleInputChange("email", e.target.value)}
                    placeholder="Enter user email"
                    className={errors.email ? "border-red-500" : ""}
                />
                <ErrorMessage message={errors.email} />
            </div>

            <div>
                <Label htmlFor="role">Role</Label>
                <Select
                    value={formData.role}
                    onValueChange={(value: "USER" | "ADMIN") =>
                        handleInputChange("role", value)
                    }
                >
                    <SelectTrigger>
                        <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                        <SelectItem value="USER">User</SelectItem>
                        <SelectItem value="ADMIN">Admin</SelectItem>
                    </SelectContent>
                </Select>
                <ErrorMessage message={errors.role} />
            </div>

            {mode === "edit" && (
                <div className="flex items-center space-x-2">
                    <input
                        type="checkbox"
                        id="isActive"
                        checked={formData.isActive}
                        onChange={(e) =>
                            handleInputChange("isActive", e.target.checked)
                        }
                        className="rounded"
                    />
                    <Label htmlFor="isActive">Active</Label>
                </div>
            )}

            <div className="flex justify-end space-x-2 pt-4">
                <Button type="button" variant="outline" onClick={onCancel}>
                    Cancel
                </Button>
                <Button type="submit" disabled={isLoading}>
                    {isLoading ? <Loader size="sm" /> : getSubmitButtonText()}
                </Button>
            </div>
        </form>
    );
}
