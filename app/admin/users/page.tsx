import { prisma } from "@/lib/prisma"
import { UserManagement } from "@/components/admin/user-management"

export default async function UsersPage() {
  const users = await prisma.user.findMany({
    orderBy: { createdAt: "desc" },
    include: {
      _count: {
        select: {
          expenses: true,
          activityLogs: true,
        },
      },
    },
  })

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
        <p className="text-sm text-gray-500">Manage user accounts and permissions</p>
      </div>

      <UserManagement users={users} />
    </div>
  )
}
