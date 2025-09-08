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
import { Ban, CheckCircle } from "lucide-react";
import { useBanUser } from "@/hooks/use-user-mutations";

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

interface BanUserModalProps {
    user: User;
    disabled?: boolean;
}

export function BanUserModal({ user, disabled = false }: BanUserModalProps) {
    const banUserMutation = useBanUser();

    const handleBanUser = () => {
        banUserMutation.mutate({ userId: user.id, banned: !user.isBanned });
    };

    return (
        <AlertDialog>
            <AlertDialogTrigger asChild>
                <Button
                    variant={user.isBanned ? "default" : "destructive"}
                    size="sm"
                    disabled={disabled || banUserMutation.isPending}
                >
                    {user.isBanned ? (
                        <CheckCircle className="h-4 w-4" />
                    ) : (
                        <Ban className="h-4 w-4" />
                    )}
                </Button>
            </AlertDialogTrigger>
            <AlertDialogContent>
                <AlertDialogHeader>
                    <AlertDialogTitle>
                        {user.isBanned ? "Unban User" : "Ban User"}
                    </AlertDialogTitle>
                    <AlertDialogDescription>
                        {user.isBanned
                            ? `Are you sure you want to unban ${
                                  user.name || user.email
                              }? They will be able to access their account again.`
                            : `Are you sure you want to ban ${
                                  user.name || user.email
                              }? They will not be able to access their account.`}
                    </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                    <AlertDialogCancel>Cancel</AlertDialogCancel>
                    <AlertDialogAction
                        onClick={handleBanUser}
                        className={
                            user.isBanned
                                ? "bg-green-600 hover:bg-green-700"
                                : "bg-red-600 hover:bg-red-700"
                        }
                    >
                        {user.isBanned ? "Unban" : "Ban"}
                    </AlertDialogAction>
                </AlertDialogFooter>
            </AlertDialogContent>
        </AlertDialog>
    );
}
