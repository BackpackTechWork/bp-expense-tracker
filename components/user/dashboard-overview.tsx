import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { DollarSign, Receipt, TrendingUp, PieChart } from "lucide-react"

interface DashboardOverviewProps {
  stats: {
    monthlyTotal: number
    totalExpenses: number
    totalAmount: number
    categoryTotals: Record<string, number>
  }
}

export function DashboardOverview({ stats }: DashboardOverviewProps) {
  const topCategory = Object.entries(stats.categoryTotals).sort(([, a], [, b]) => b - a)[0]

  const overviewCards = [
    {
      title: "This Month",
      value: `$${stats.monthlyTotal.toFixed(2)}`,
      icon: DollarSign,
      color: "text-[#DC143C]",
      bgColor: "bg-[#FDEBD0]",
    },
    {
      title: "Total Expenses",
      value: stats.totalExpenses.toString(),
      icon: Receipt,
      color: "text-[#F75270]",
      bgColor: "bg-[#F7CAC9]",
    },
    {
      title: "All Time Total",
      value: `$${stats.totalAmount.toFixed(2)}`,
      icon: TrendingUp,
      color: "text-green-600",
      bgColor: "bg-green-50",
    },
    {
      title: "Top Category",
      value: topCategory ? topCategory[0] : "None",
      icon: PieChart,
      color: "text-blue-600",
      bgColor: "bg-blue-50",
    },
  ]

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {overviewCards.map((card) => (
        <Card key={card.title} className="bg-white/80 backdrop-blur-sm border-white/20">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium text-gray-600">{card.title}</CardTitle>
            <div className={`p-2 rounded-lg ${card.bgColor}`}>
              <card.icon className={`h-5 w-5 ${card.color}`} />
            </div>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-900">{card.value}</div>
          </CardContent>
        </Card>
      ))}
    </div>
  )
}
