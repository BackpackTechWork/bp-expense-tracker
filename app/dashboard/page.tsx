import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { DashboardOverview } from "@/components/user/dashboard-overview"
import { RecentExpenses } from "@/components/user/recent-expenses"
import { BudgetProgress } from "@/components/user/budget-progress"

export default async function DashboardPage() {
  const session = await getServerSession(authOptions)
  const userId = session!.user.id

  // Get current month data
  const now = new Date()
  const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1)
  const endOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0)

  const [monthlyExpenses, recentExpenses, budgets, totalExpenses] = await Promise.all([
    prisma.expense.findMany({
      where: {
        userId,
        date: {
          gte: startOfMonth,
          lte: endOfMonth,
        },
      },
      include: {
        category: true,
      },
    }),
    prisma.expense.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: {
        category: true,
      },
    }),
    prisma.budget.findMany({
      where: {
        userId,
        startDate: { lte: endOfMonth },
        endDate: { gte: startOfMonth },
      },
      include: {
        category: true,
      },
    }),
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  const monthlyTotal = monthlyExpenses.reduce((sum, expense) => sum + expense.amount, 0)
  const categoryTotals = monthlyExpenses.reduce(
    (acc, expense) => {
      const categoryName = expense.category.name
      acc[categoryName] = (acc[categoryName] || 0) + expense.amount
      return acc
    },
    {} as Record<string, number>,
  )

  const stats = {
    monthlyTotal,
    totalExpenses: totalExpenses._count || 0,
    totalAmount: totalExpenses._sum.amount || 0,
    categoryTotals,
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
          <p className="text-gray-600">Welcome back, {session?.user?.name}</p>
        </div>
      </div>

      <DashboardOverview stats={stats} />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentExpenses expenses={recentExpenses} />
        <BudgetProgress budgets={budgets} monthlyExpenses={monthlyExpenses} />
      </div>
    </div>
  )
}
