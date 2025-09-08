"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from "recharts"

interface CategoryData {
  categoryId: string
  _sum: { amount: number | null }
  _count: number
}

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface CategoryBreakdownProps {
  categoryData: CategoryData[]
  categories: Category[]
}

export function CategoryBreakdown({ categoryData, categories }: CategoryBreakdownProps) {
  const chartData = categoryData
    .map((item) => {
      const category = categories.find((cat) => cat.id === item.categoryId)
      return {
        name: category?.name || "Unknown",
        value: item._sum.amount || 0,
        color: category?.color || "#DC143C",
        count: item._count,
      }
    })
    .filter((item) => item.value > 0)
    .sort((a, b) => b.value - a.value)

  const total = chartData.reduce((sum, item) => sum + item.value, 0)

  const CustomTooltip = ({ active, payload }: any) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload
      const percentage = ((data.value / total) * 100).toFixed(1)
      return (
        <div className="bg-white p-3 border rounded-lg shadow-lg">
          <p className="font-medium">{data.name}</p>
          <p className="text-sm text-gray-600">
            ${data.value.toFixed(2)} ({percentage}%)
          </p>
          <p className="text-xs text-gray-500">{data.count} transactions</p>
        </div>
      )
    }
    return null
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-lg font-semibold">Spending by Category</CardTitle>
        <p className="text-sm text-gray-600">Last 3 months</p>
      </CardHeader>
      <CardContent>
        {chartData.length === 0 ? (
          <div className="text-center py-8">
            <p className="text-gray-500">No expense data available</p>
          </div>
        ) : (
          <div className="space-y-4">
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={chartData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={120}
                  paddingAngle={2}
                  dataKey="value"
                >
                  {chartData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip content={<CustomTooltip />} />
              </PieChart>
            </ResponsiveContainer>

            <div className="space-y-2">
              {chartData.slice(0, 5).map((item, index) => {
                const percentage = ((item.value / total) * 100).toFixed(1)
                return (
                  <div key={index} className="flex items-center justify-between">
                    <div className="flex items-center space-x-2">
                      <div className="w-3 h-3 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="text-sm font-medium">{item.name}</span>
                    </div>
                    <div className="text-right">
                      <div className="text-sm font-medium">${item.value.toFixed(2)}</div>
                      <div className="text-xs text-gray-500">{percentage}%</div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
