"use client";

import { useState } from "react";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { UserForm } from "@/components/admin/user-form";
import { Plus } from "lucide-react";
import { useCreateUser } from "@/hooks/use-user-mutations";

interface CreateUserModalProps {
    children?: React.ReactNode;
}

export function CreateUserModal({ children }: CreateUserModalProps) {
    const [isOpen, setIsOpen] = useState(false);
    const createUserMutation = useCreateUser();

    const handleCreateUser = async (formData: any) => {
        createUserMutation.mutate(formData, {
            onSuccess: () => {
                setIsOpen(false);
            },
        });
    };

    return (
        <Dialog open={isOpen} onOpenChange={setIsOpen}>
            <DialogTrigger asChild>
                {children || (
                    <Button>
                        <Plus className="h-4 w-4 mr-2" />
                        Create User
                    </Button>
                )}
            </DialogTrigger>
            <DialogContent>
                <DialogHeader>
                    <DialogTitle>Create New User</DialogTitle>
                    <DialogDescription>
                        Create a new user account with default password:
                        password123
                    </DialogDescription>
                </DialogHeader>
                <UserForm
                    mode="create"
                    onSubmit={handleCreateUser}
                    onCancel={() => setIsOpen(false)}
                    isLoading={createUserMutation.isPending}
                />
            </DialogContent>
        </Dialog>
    );
}
