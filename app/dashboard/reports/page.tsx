import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { redirect } from "next/navigation"
import { ExportOptions } from "@/components/user/export-options"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { FileText, TrendingUp, Calendar, DollarSign } from "lucide-react"

async function getReportData(userId: string) {
  const [categories, recentReports, totalExpenses] = await Promise.all([
    prisma.category.findMany({
      orderBy: { name: "asc" },
    }),
    prisma.expense.findMany({
      where: { userId },
      take: 5,
      orderBy: { createdAt: "desc" },
      include: { category: true },
    }),
    prisma.expense.aggregate({
      where: { userId },
      _sum: { amount: true },
      _count: true,
    }),
  ])

  return { categories, recentReports, totalExpenses }
}

export default async function ReportsPage() {
  const session = await getServerSession(authOptions)
  if (!session?.user?.id) redirect("/auth/signin")

  const { categories, recentReports, totalExpenses } = await getReportData(session.user.id)

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-900">Reports & Export</h1>
        <p className="text-slate-600 mt-1">Generate and export your expense reports</p>
      </div>

      {/* Stats Overview */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Expenses</p>
                <p className="text-2xl font-bold text-slate-900">${totalExpenses._sum.amount?.toFixed(2) || "0.00"}</p>
              </div>
              <DollarSign className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Total Transactions</p>
                <p className="text-2xl font-bold text-slate-900">{totalExpenses._count || 0}</p>
              </div>
              <TrendingUp className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-slate-600">Categories</p>
                <p className="text-2xl font-bold text-slate-900">{categories.length}</p>
              </div>
              <FileText className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Export Options */}
        <ExportOptions categories={categories} />

        {/* Recent Activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Calendar className="h-5 w-5" />
              Recent Expenses
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-3">
              {recentReports.length > 0 ? (
                recentReports.map((expense) => (
                  <div key={expense.id} className="flex items-center justify-between p-3 bg-slate-50 rounded-lg">
                    <div>
                      <p className="font-medium text-slate-900">{expense.description}</p>
                      <p className="text-sm text-slate-600">{expense.category.name}</p>
                    </div>
                    <div className="text-right">
                      <p className="font-medium text-slate-900">${expense.amount.toFixed(2)}</p>
                      <p className="text-sm text-slate-600">{expense.date.toLocaleDateString()}</p>
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-slate-600 text-center py-4">No recent expenses</p>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
