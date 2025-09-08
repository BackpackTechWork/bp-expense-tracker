"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Plus, Target, Calendar } from "lucide-react"
import { format } from "date-fns"

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date | null
}

interface SavingsGoalsProps {
  goals: SavingsGoal[]
}

export function SavingsGoals({ goals }: SavingsGoalsProps) {
  const [showAddForm, setShowAddForm] = useState(false)

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20">
      <CardHeader className="flex flex-row items-center justify-between">
        <CardTitle className="flex items-center space-x-2">
          <Target className="h-5 w-5 text-[#DC143C]" />
          <span>Savings Goals</span>
        </CardTitle>
        <Button size="sm" className="bg-[#DC143C] hover:bg-[#F75270]" onClick={() => setShowAddForm(true)}>
          <Plus className="h-4 w-4 mr-1" />
          Add Goal
        </Button>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {goals.length === 0 ? (
            <div className="text-center py-8">
              <Target className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-500 mb-4">No savings goals yet</p>
              <Button className="bg-[#DC143C] hover:bg-[#F75270]" onClick={() => setShowAddForm(true)}>
                <Plus className="h-4 w-4 mr-2" />
                Create Your First Goal
              </Button>
            </div>
          ) : (
            goals.map((goal) => {
              const progress = (goal.currentAmount / goal.targetAmount) * 100
              const isCompleted = progress >= 100

              return (
                <div key={goal.id} className="p-4 bg-gray-50 rounded-lg space-y-3">
                  <div className="flex items-center justify-between">
                    <h3 className="font-medium text-gray-900">{goal.name}</h3>
                    {isCompleted && <Badge className="bg-green-100 text-green-800">Completed</Badge>}
                  </div>

                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span>${goal.currentAmount.toFixed(2)}</span>
                      <span>${goal.targetAmount.toFixed(2)}</span>
                    </div>
                    <Progress value={Math.min(progress, 100)} className="h-2" />
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>{progress.toFixed(1)}% complete</span>
                      <span>${(goal.targetAmount - goal.currentAmount).toFixed(2)} remaining</span>
                    </div>
                  </div>

                  {goal.targetDate && (
                    <div className="flex items-center text-sm text-gray-600">
                      <Calendar className="h-4 w-4 mr-1" />
                      Target: {format(new Date(goal.targetDate), "MMM dd, yyyy")}
                    </div>
                  )}
                </div>
              )
            })
          )}
        </div>
      </CardContent>
    </Card>
  )
}
