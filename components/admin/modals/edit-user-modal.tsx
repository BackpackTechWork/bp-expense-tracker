"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";
import { UserForm } from "@/components/admin/user-form";
import { useUpdateUser } from "@/hooks/use-user-mutations";

interface User {
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

interface EditUserModalProps {
    user: User | null;
    isOpen: boolean;
    onOpenChange: (open: boolean) => void;
}

export function EditUserModal({
    user,
    isOpen,
    onOpenChange,
}: EditUserModalProps) {
    const updateUserMutation = useUpdateUser();

    const handleEditUser = async (formData: any) => {
        if (!user) return;

        updateUserMutation.mutate(
            { userId: user.id, userData: formData },
            {
                onSuccess: () => {
                    onOpenChange(false);
                },
            }
        );
    };

    if (!user) return null;

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Edit User</DialogTitle>
                    <DialogDescription>
                        Update user information and settings
                    </DialogDescription>
                </DialogHeader>
                <UserForm
                    mode="edit"
                    initialData={{
                        name: user.name || "",
                        email: user.email,
                        role: user.role as "USER" | "ADMIN",
                        isActive: user.isActive,
                    }}
                    onSubmit={handleEditUser}
                    onCancel={() => onOpenChange(false)}
                    isLoading={updateUserMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
