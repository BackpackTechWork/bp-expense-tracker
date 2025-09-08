"use client";

import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
    AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import { KeyRound } from "lucide-react";
import { useResetPassword } from "@/hooks/use-user-mutations";

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

interface ResetPasswordModalProps {
    user: User;
    disabled?: boolean;
}

export function ResetPasswordModal({
    user,
    disabled = false,
}: ResetPasswordModalProps) {
    const resetPasswordMutation = useResetPassword();

    const handleResetPassword = () => {
        resetPasswordMutation.mutate(user.id);
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant="outline"
                    size="sm"
                    disabled={disabled || resetPasswordMutation.isPending}
                >
                    <KeyRound className="h-4 w-4" />
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>Reset Password</AlertDialogTitle>
                    <AlertDialogDescription>
                        Are you sure you want to reset the password for{" "}
                        {user.name || user.email}? The password will be set to:
                        password123
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleResetPassword}
                        className="bg-blue-600 hover:bg-blue-700"
                    >
                        Reset Password
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
