import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { AdminStats } from "@/components/admin/admin-stats"
import { RecentActivity } from "@/components/admin/recent-activity"
import { UserActivityChart } from "@/components/admin/user-activity-chart"

export default async function AdminDashboard() {
  const session = await getServerSession(authOptions)

  // Get dashboard stats
  const [totalUsers, activeUsers, bannedUsers, totalExpenses] = await Promise.all([
    prisma.user.count(),
    prisma.user.count({
      where: {
        lastLoginAt: {
          gte: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000), // Last 30 days
        },
      },
    }),
    prisma.user.count({ where: { isBanned: true } }),
    prisma.expense.count(),
  ])

  // Get recent activity
  const recentActivity = await prisma.activityLog.findMany({
    take: 10,
    orderBy: { createdAt: "desc" },
    include: {
      user: {
        select: { name: true, email: true },
      },
    },
  })

  // Get user registration data for chart (last 7 days)
  const sevenDaysAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000)
  const userRegistrations = await prisma.user.groupBy({
    by: ["createdAt"],
    where: {
      createdAt: {
        gte: sevenDaysAgo,
      },
    },
    _count: {
      id: true,
    },
  })

  const stats = {
    totalUsers,
    activeUsers,
    bannedUsers,
    totalExpenses,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
        <p className="text-sm text-gray-500">Welcome back, {session?.user?.name}</p>
      </div>

      <AdminStats stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <UserActivityChart data={userRegistrations} />
        <RecentActivity activities={recentActivity} />
      </div>
    </div>
  )
}
