"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from "recharts"
import { format, subDays } from "date-fns"

interface UserActivityChartProps {
  data: Array<{
    createdAt: Date
    _count: {
      id: number
    }
  }>
}

export function UserActivityChart({ data }: UserActivityChartProps) {
  // Create chart data for last 7 days
  const chartData = Array.from({ length: 7 }, (_, i) => {
    const date = subDays(new Date(), 6 - i)
    const dayData = data.find((d) => format(new Date(d.createdAt), "yyyy-MM-dd") === format(date, "yyyy-MM-dd"))

    return {
      date: format(date, "MMM dd"),
      registrations: dayData?._count.id || 0,
    }
  })

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg font-semibold">User Registrations (Last 7 Days)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="date" />
            <YAxis />
            <Tooltip />
            <Bar dataKey="registrations" fill="#DC143C" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  )
}
