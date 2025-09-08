import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { formatDistanceToNow, format } from "date-fns";

interface UserDetailsProps {
    user: {
        id: string;
        name: string | null;
        email: string;
        role: string;
        isActive: boolean;
        isBanned: boolean;
        lastLoginAt: Date | null;
        createdAt: Date;
        activityLogs: Array<{
            id: string;
            action: string;
            details: string | null;
            createdAt: Date;
        }>;
        _count: {
            expenses: number;
            activityLogs: number;
        };
    };
}

export function UserDetails({ user }: UserDetailsProps) {
    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                    User Details
                </h1>
            </div>

            {/* User Info */}
            <Card>
                <CardHeader>
                    <CardTitle>User Information</CardTitle>
                </CardHeader>
                <CardContent>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Name
                            </label>
                            <p className="text-lg">
                                {user.name || "No name provided"}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Email
                            </label>
                            <p className="text-lg">{user.email}</p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Role
                            </label>
                            <div className="mt-1">
                                <Badge
                                    variant={
                                        user.role === "ADMIN"
                                            ? "default"
                                            : "secondary"
                                    }
                                >
                                    {user.role}
                                </Badge>
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Status
                            </label>
                            <div className="mt-1">
                                {user.isBanned ? (
                                    <Badge variant="destructive">Banned</Badge>
                                ) : user.isActive ? (
                                    <Badge className="bg-green-100 text-green-800">
                                        Active
                                    </Badge>
                                ) : (
                                    <Badge variant="secondary">Inactive</Badge>
                                )}
                            </div>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Last Login
                            </label>
                            <p className="text-lg">
                                {user.lastLoginAt
                                    ? formatDistanceToNow(
                                          new Date(user.lastLoginAt),
                                          { addSuffix: true }
                                      )
                                    : "Never"}
                            </p>
                        </div>
                        <div>
                            <label className="text-sm font-medium text-gray-500">
                                Member Since
                            </label>
                            <p className="text-lg">
                                {format(
                                    new Date(user.createdAt),
                                    "MMM dd, yyyy"
                                )}
                            </p>
                        </div>
                    </div>
                </CardContent>
            </Card>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">
                            Total Expenses
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {user._count.expenses}
                        </p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Total Amount</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">N/A</p>
                    </CardContent>
                </Card>
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Activity Logs</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <p className="text-2xl font-bold">
                            {user._count.activityLogs}
                        </p>
                    </CardContent>
                </Card>
            </div>

            {/* Activity Logs */}
            <Card>
                <CardHeader>
                    <CardTitle>Recent Activity</CardTitle>
                </CardHeader>
                <CardContent>
                    {user.activityLogs.length === 0 ? (
                        <p className="text-center text-gray-500 py-4">
                            No activity logs found
                        </p>
                    ) : (
                        <div className="space-y-3">
                            {user.activityLogs.map((log) => (
                                <div
                                    key={log.id}
                                    className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg"
                                >
                                    <Badge variant="outline">
                                        {log.action}
                                    </Badge>
                                    <div className="flex-1">
                                        {log.details && (
                                            <p className="text-sm text-gray-700">
                                                {log.details}
                                            </p>
                                        )}
                                        <p className="text-xs text-gray-500">
                                            {formatDistanceToNow(
                                                new Date(log.createdAt),
                                                { addSuffix: true }
                                            )}
                                        </p>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
