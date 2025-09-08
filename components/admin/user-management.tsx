"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
    Table,
    TableBody,
    TableCell,
    TableHead,
    TableHeader,
    TableRow,
} from "@/components/ui/table";
import { Eye, Edit } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { useToast } from "@/hooks/use-toast";
import { Loader } from "@/components/ui/loader";
import { Pagination } from "@/components/ui/pagination";
import { FilterBar } from "@/components/ui/filters";
import { ErrorMessage } from "@/components/ui/error-message";
import { useUsers } from "@/hooks/use-users";
import {
    CreateUserModal,
    EditUserModal,
    BanUserModal,
    ResetPasswordModal,
} from "@/components/admin/modals";

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

interface UserManagementProps {
    initialUsers?: User[];
}

export function UserManagement({ initialUsers = [] }: UserManagementProps) {
    const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
    const [editingUser, setEditingUser] = useState<User | null>(null);

    // Local state for pagination and filters
    const [currentPage, setCurrentPage] = useState(1);
    const [pageSize, setPageSize] = useState(10);
    const [filters, setFilters] = useState({
        search: "",
        role: "",
        status: "",
    });

    const router = useRouter();

    // Use React Query to fetch users
    const {
        data,
        isLoading,
        isFetching,
        isError,
        error,
        refetch,
        invalidateUsers,
    } = useUsers({
        filters,
        pagination: { page: currentPage, pageSize },
    });

    // Extract users and pagination from the response
    const users = data?.users || [];
    const pagination = data?.pagination || {
        currentPage: 1,
        totalPages: 1,
        totalUsers: 0,
        pageSize: 10,
        hasNextPage: false,
        hasPreviousPage: false,
    };

    // Helper functions for pagination and filters
    const updateFilters = (newFilters: Partial<typeof filters>) => {
        setFilters((prev) => ({ ...prev, ...newFilters }));
        setCurrentPage(1); // Reset to first page when filters change
    };

    const clearFilters = () => {
        setFilters({ search: "", role: "", status: "" });
        setCurrentPage(1);
    };

    const setPage = (page: number) => {
        setCurrentPage(page);
    };

    const handlePageSizeChange = (newPageSize: number) => {
        setPageSize(newPageSize);
        setCurrentPage(1); // Reset to first page when page size changes
    };

    // Filter options for the filter bar
    const roleOptions = [
        { value: "USER", label: "User" },
        { value: "ADMIN", label: "Admin" },
    ];

    const statusOptions = [
        { value: "active", label: "Active" },
        { value: "inactive", label: "Inactive" },
        { value: "banned", label: "Banned" },
    ];

    const openEditDialog = (user: User) => {
        setEditingUser(user);
        setIsEditDialogOpen(true);
    };

    const getUserStatus = (user: User) => {
        if (user.isBanned) {
            return <Badge variant="destructive">Banned</Badge>;
        }
        if (user.isActive) {
            return (
                <Badge
                    variant="default"
                    className="bg-green-100 text-green-800"
                >
                    Active
                </Badge>
            );
        }
        return <Badge variant="secondary">Inactive</Badge>;
    };

    return (
        <Card>
            <CardHeader>
                <CardTitle className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <span>Users ({pagination.totalUsers})</span>
                        {isFetching && !isLoading && (
                            <div className="flex items-center gap-1 text-sm text-gray-500">
                                <Loader size="sm" />
                                <span>Updating...</span>
                            </div>
                        )}
                    </div>
                    <div className="flex items-center gap-4">
                        <CreateUserModal />
                    </div>
                </CardTitle>
            </CardHeader>

            {/* Filter Bar */}
            <div className="px-6 pb-4">
                <FilterBar
                    searchValue={filters.search}
                    onSearchChange={(value) => updateFilters({ search: value })}
                    searchPlaceholder="Search users by name or email..."
                    filters={[
                        {
                            key: "role",
                            label: "Role",
                            value: filters.role,
                            onChange: (value) =>
                                updateFilters({
                                    role: value === "all" ? "" : value,
                                }),
                            options: roleOptions,
                            placeholder: "Filter by role",
                        },
                        {
                            key: "status",
                            label: "Status",
                            value: filters.status,
                            onChange: (value) =>
                                updateFilters({
                                    status: value === "all" ? "" : value,
                                }),
                            options: statusOptions,
                            placeholder: "Filter by status",
                        },
                    ]}
                    onClearAll={clearFilters}
                    showClearAll={true}
                />
            </div>

            <CardContent>
                {isError ? (
                    <div className="flex flex-col items-center justify-center py-8 space-y-4">
                        <div className="text-center">
                            <h3 className="text-lg font-semibold text-red-600 mb-2">
                                Failed to load users
                            </h3>
                            <ErrorMessage
                                message={
                                    error instanceof Error
                                        ? error.message
                                        : "An unexpected error occurred"
                                }
                                className="text-gray-600 mb-4"
                            />
                            <Button onClick={() => refetch()} variant="outline">
                                Try Again
                            </Button>
                        </div>
                    </div>
                ) : isLoading ? (
                    <div className="flex justify-center py-8">
                        <Loader />
                    </div>
                ) : (
                    <>
                        <div className="overflow-x-auto">
                            <Table>
                                <TableHeader>
                                    <TableRow>
                                        <TableHead>User</TableHead>
                                        <TableHead>Role</TableHead>
                                        <TableHead>Status</TableHead>
                                        <TableHead>Expenses</TableHead>
                                        <TableHead>Last Login</TableHead>
                                        <TableHead>Joined</TableHead>
                                        <TableHead>Actions</TableHead>
                                    </TableRow>
                                </TableHeader>
                                <TableBody>
                                    {users.map((user) => (
                                        <TableRow key={user.id}>
                                            <TableCell>
                                                <div>
                                                    <div className="font-medium">
                                                        {user.name || "No name"}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        {user.email}
                                                    </div>
                                                </div>
                                            </TableCell>
                                            <TableCell>
                                                <Badge
                                                    variant={
                                                        user.role === "ADMIN"
                                                            ? "default"
                                                            : "secondary"
                                                    }
                                                >
                                                    {user.role}
                                                </Badge>
                                            </TableCell>
                                            <TableCell>
                                                {getUserStatus(user)}
                                            </TableCell>
                                            <TableCell>
                                                {user._count.expenses}
                                            </TableCell>
                                            <TableCell>
                                                {user.lastLoginAt ? (
                                                    <span className="text-sm">
                                                        {formatDistanceToNow(
                                                            new Date(
                                                                user.lastLoginAt
                                                            ),
                                                            { addSuffix: true }
                                                        )}
                                                    </span>
                                                ) : (
                                                    <span className="text-sm text-gray-400">
                                                        Never
                                                    </span>
                                                )}
                                            </TableCell>
                                            <TableCell>
                                                <span className="text-sm">
                                                    {formatDistanceToNow(
                                                        new Date(
                                                            user.createdAt
                                                        ),
                                                        { addSuffix: true }
                                                    )}
                                                </span>
                                            </TableCell>
                                            <TableCell>
                                                <div className="flex items-center space-x-2">
                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            router.push(
                                                                `/admin/users/${user.id}`
                                                            )
                                                        }
                                                    >
                                                        <Eye className="h-4 w-4" />
                                                    </Button>

                                                    <Button
                                                        variant="outline"
                                                        size="sm"
                                                        onClick={() =>
                                                            openEditDialog(user)
                                                        }
                                                    >
                                                        <Edit className="h-4 w-4" />
                                                    </Button>

                                                    {user.role !== "ADMIN" && (
                                                        <>
                                                            <ResetPasswordModal
                                                                user={user}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            />
                                                            <BanUserModal
                                                                user={user}
                                                                disabled={
                                                                    isLoading
                                                                }
                                                            />
                                                        </>
                                                    )}
                                                </div>
                                            </TableCell>
                                        </TableRow>
                                    ))}
                                </TableBody>
                            </Table>
                        </div>

                        {/* Pagination */}
                        <div className="px-6 py-4 border-t">
                            <Pagination
                                currentPage={pagination.currentPage}
                                totalPages={pagination.totalPages}
                                totalItems={pagination.totalUsers}
                                pageSize={pagination.pageSize}
                                onPageChange={setPage}
                                onPageSizeChange={handlePageSizeChange}
                                pageSizeOptions={[5, 10, 20, 50]}
                                showPageSizeSelector={true}
                                showItemCount={true}
                            />
                        </div>
                    </>
                )}
            </CardContent>

            {/* Edit User Dialog */}
            <EditUserModal
                user={editingUser}
                isOpen={isEditDialogOpen}
                onOpenChange={(open) => {
                    setIsEditDialogOpen(open);
                    if (!open) {
                        setEditingUser(null);
                    }
                }}
            />
        </Card>
    );
}
