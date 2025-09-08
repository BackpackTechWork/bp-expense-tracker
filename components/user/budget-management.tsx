"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, DollarSign } from "lucide-react"

interface Budget {
  id: string
  amount: number
  period: string
  startDate: Date
  endDate: Date
  category?: {
    name: string
    color: string
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface BudgetManagementProps {
  budgets: Budget[]
  categories: Category[]
}

export function BudgetManagement({ budgets, categories }: BudgetManagementProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <DollarSign className="h-5 w-5 text-[#DC143C]" />
          <span>Budgets</span>
        </CardTitle>
        <Button size="sm" className="bg-[#DC143C] hover:bg-[#F75270]" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Budget
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {budgets.length === 0 ? (
            <div className="text-center py-8">
              <DollarSign className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No budgets set</p>
              <Button className="bg-[#DC143C] hover:bg-[#F75270]" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Budget
              </Button>
            </div>
          ) : (
            budgets.map((budget) => (
              <div key={budget.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-2">
                    <h3 className="font-medium text-gray-900">
                      {budget.category ? budget.category.name : "Overall Budget"}
                    </h3>
                    {budget.category && (
                      <Badge style={{ backgroundColor: budget.category.color }} className="text-white text-xs">
                        {budget.category.name}
                      </Badge>
                    )}
                  </div>
                  <Badge variant="outline">{budget.period}</Badge>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>$0.00 spent</span>
                    <span>${budget.amount.toFixed(2)} budget</span>
                  </div>
                  <Progress value={0} className="h-2" />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>0% used</span>
                    <span>${budget.amount.toFixed(2)} remaining</span>
                  </div>
                </div>
              </div>
            ))
          )}
        </div>
      </CardContent>
    </Card>
  )
}
