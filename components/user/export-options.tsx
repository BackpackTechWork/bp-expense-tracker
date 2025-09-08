"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Checkbox } from "@/components/ui/checkbox"
import { Download, Mail, Calendar, Filter } from "lucide-react"
import { toast } from "sonner"

interface Category {
  id: string
  name: string
}

interface ExportOptionsProps {
  categories: Category[]
}

export function ExportOptions({ categories }: ExportOptionsProps) {
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [email, setEmail] = useState("")
  const [isGenerating, setIsGenerating] = useState(false)
  const [isSending, setIsSending] = useState(false)

  const handleCategoryChange = (categoryId: string, checked: boolean) => {
    if (checked) {
      setSelectedCategories([...selectedCategories, categoryId])
    } else {
      setSelectedCategories(selectedCategories.filter((id) => id !== categoryId))
    }
  }

  const generatePDF = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates")
      return
    }

    setIsGenerating(true)
    try {
      const response = await fetch("/api/reports/generate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          categories: selectedCategories,
        }),
      })

      if (!response.ok) throw new Error("Failed to generate report")

      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement("a")
      a.href = url
      a.download = `expense-report-${Date.now()}.pdf`
      document.body.appendChild(a)
      a.click()
      window.URL.revokeObjectURL(url)
      document.body.removeChild(a)

      toast.success("Report downloaded successfully")
    } catch (error) {
      toast.error("Failed to generate report")
    } finally {
      setIsGenerating(false)
    }
  }

  const emailReport = async () => {
    if (!startDate || !endDate) {
      toast.error("Please select start and end dates")
      return
    }

    setIsSending(true)
    try {
      const response = await fetch("/api/reports/email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          startDate,
          endDate,
          categories: selectedCategories,
          email,
        }),
      })

      if (!response.ok) throw new Error("Failed to send report")

      toast.success("Report sent successfully")
      setEmail("")
    } catch (error) {
      toast.error("Failed to send report")
    } finally {
      setIsSending(false)
    }
  }

  const setQuickRange = (range: string) => {
    const today = new Date()
    const start = new Date()

    switch (range) {
      case "week":
        start.setDate(today.getDate() - 7)
        break
      case "month":
        start.setMonth(today.getMonth() - 1)
        break
      case "quarter":
        start.setMonth(today.getMonth() - 3)
        break
      case "year":
        start.setFullYear(today.getFullYear() - 1)
        break
    }

    setStartDate(start.toISOString().split("T")[0])
    setEndDate(today.toISOString().split("T")[0])
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Download className="h-5 w-5" />
          Export Reports
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Quick Date Ranges */}
        <div>
          <Label className="text-sm font-medium mb-2 block">Quick Ranges</Label>
          <div className="flex flex-wrap gap-2">
            {[
              { label: "Last Week", value: "week" },
              { label: "Last Month", value: "month" },
              { label: "Last Quarter", value: "quarter" },
              { label: "Last Year", value: "year" },
            ].map((range) => (
              <Button
                key={range.value}
                variant="outline"
                size="sm"
                onClick={() => setQuickRange(range.value)}
                className="text-xs"
              >
                <Calendar className="h-3 w-3 mr-1" />
                {range.label}
              </Button>
            ))}
          </div>
        </div>

        {/* Custom Date Range */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <Label htmlFor="startDate">Start Date</Label>
            <Input id="startDate" type="date" value={startDate} onChange={(e) => setStartDate(e.target.value)} />
          </div>
          <div>
            <Label htmlFor="endDate">End Date</Label>
            <Input id="endDate" type="date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />
          </div>
        </div>

        {/* Category Filter */}
        <div>
          <Label className="text-sm font-medium mb-2 block flex items-center gap-2">
            <Filter className="h-4 w-4" />
            Filter by Categories (optional)
          </Label>
          <div className="grid grid-cols-2 gap-2 max-h-32 overflow-y-auto">
            {categories.map((category) => (
              <div key={category.id} className="flex items-center space-x-2">
                <Checkbox
                  id={category.id}
                  checked={selectedCategories.includes(category.id)}
                  onCheckedChange={(checked) => handleCategoryChange(category.id, checked as boolean)}
                />
                <Label htmlFor={category.id} className="text-sm">
                  {category.name}
                </Label>
              </div>
            ))}
          </div>
        </div>

        {/* Export Actions */}
        <div className="space-y-4">
          <Button onClick={generatePDF} disabled={isGenerating} className="w-full bg-blue-600 hover:bg-blue-700">
            <Download className="h-4 w-4 mr-2" />
            {isGenerating ? "Generating..." : "Download PDF Report"}
          </Button>

          <div className="space-y-2">
            <Label htmlFor="email">Email Report (optional)</Label>
            <div className="flex gap-2">
              <Input
                id="email"
                type="email"
                placeholder="Enter email address"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
              <Button onClick={emailReport} disabled={isSending} variant="outline" className="shrink-0 bg-transparent">
                <Mail className="h-4 w-4 mr-2" />
                {isSending ? "Sending..." : "Send"}
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
