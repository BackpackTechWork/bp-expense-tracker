import { UserManagement } from "@/components/admin/user-management";

export default async function UsersPage() {
    return (
        <div className="space-y-6 bg-white p-6 rounded-lg shadow-sm">
            <div className="flex items-center justify-between">
                <h1 className="text-3xl font-bold text-gray-900">
                    User Management
                </h1>
                <p className="text-sm text-gray-500">
                    Manage user accounts and permissions
                </p>
            </div>

            <UserManagement />
        </div>
    );
}
