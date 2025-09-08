"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Search, Filter, ChevronLeft, ChevronRight, Edit, Trash2 } from "lucide-react"
import { format } from "date-fns"

interface Expense {
  id: string
  amount: number
  description: string | null
  note: string | null
  date: Date
  receiptUrl: string | null
  category: {
    id: string
    name: string
    color: string
    icon: string | null
  }
}

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface ExpenseListProps {
  expenses: Expense[]
  categories: Category[]
  pagination: {
    page: number
    limit: number
    total: number
    pages: number
  }
  searchParams: {
    page?: string
    category?: string
    startDate?: string
    endDate?: string
    search?: string
  }
}

export function ExpenseList({ expenses, categories, pagination, searchParams }: ExpenseListProps) {
  const router = useRouter()
  const [search, setSearch] = useState(searchParams.search || "")
  const [selectedCategory, setSelectedCategory] = useState(searchParams.category || "all")
  const [startDate, setStartDate] = useState(searchParams.startDate || "")
  const [endDate, setEndDate] = useState(searchParams.endDate || "")

  const handleFilter = () => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    params.set("page", "1")

    router.push(`/dashboard/expenses?${params.toString()}`)
  }

  const handleClearFilters = () => {
    setSearch("")
    setSelectedCategory("all")
    setStartDate("")
    setEndDate("")
    router.push("/dashboard/expenses")
  }

  const handlePageChange = (newPage: number) => {
    const params = new URLSearchParams()
    if (search) params.set("search", search)
    if (selectedCategory !== "all") params.set("category", selectedCategory)
    if (startDate) params.set("startDate", startDate)
    if (endDate) params.set("endDate", endDate)
    params.set("page", newPage.toString())

    router.push(`/dashboard/expenses?${params.toString()}`)
  }

  const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

  return (
    <div className="space-y-6">
      {/* Filters */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="h-5 w-5" />
            <span>Filters</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
              <Input
                placeholder="Search expenses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={selectedCategory} onValueChange={setSelectedCategory}>
              <SelectTrigger>
                <SelectValue placeholder="All categories" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All categories</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    <div className="flex items-center space-x-2">
                      <span>{category.icon || "📦"}</span>
                      <span>{category.name}</span>
                    </div>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>

            <Input
              type="date"
              placeholder="Start date"
              value={startDate}
              onChange={(e) => setStartDate(e.target.value)}
            />

            <Input type="date" placeholder="End date" value={endDate} onChange={(e) => setEndDate(e.target.value)} />

            <div className="flex space-x-2">
              <Button onClick={handleFilter} className="bg-[#DC143C] hover:bg-[#F75270]">
                Apply
              </Button>
              <Button variant="outline" onClick={handleClearFilters}>
                Clear
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Results */}
      <Card className="bg-white/80 backdrop-blur-sm border-white/20">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle>
              Expenses ({pagination.total})
              {totalAmount > 0 && (
                <span className="ml-2 text-lg font-normal text-gray-600">Total: ${totalAmount.toFixed(2)}</span>
              )}
            </CardTitle>
            <Button asChild className="bg-[#DC143C] hover:bg-[#F75270]">
              <Link href="/dashboard/add">Add Expense</Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          {expenses.length === 0 ? (
            <div className="text-center py-8">
              <p className="text-gray-500 mb-4">No expenses found</p>
              <Button asChild className="bg-[#DC143C] hover:bg-[#F75270]">
                <Link href="/dashboard/add">Add Your First Expense</Link>
              </Button>
            </div>
          ) : (
            <>
              <div className="overflow-x-auto">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Date</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead>Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((expense) => (
                      <TableRow key={expense.id}>
                        <TableCell>{format(new Date(expense.date), "MMM dd, yyyy")}</TableCell>
                        <TableCell>
                          <div>
                            <p className="font-medium">{expense.description || "No description"}</p>
                            {expense.note && <p className="text-sm text-gray-500">{expense.note}</p>}
                          </div>
                        </TableCell>
                        <TableCell>
                          <Badge style={{ backgroundColor: expense.category.color }} className="text-white">
                            {expense.category.icon} {expense.category.name}
                          </Badge>
                        </TableCell>
                        <TableCell className="text-right font-medium">${expense.amount.toFixed(2)}</TableCell>
                        <TableCell>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm">
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>

              {/* Pagination */}
              {pagination.pages > 1 && (
                <div className="flex items-center justify-between mt-6">
                  <p className="text-sm text-gray-600">
                    Showing {(pagination.page - 1) * pagination.limit + 1} to{" "}
                    {Math.min(pagination.page * pagination.limit, pagination.total)} of {pagination.total} results
                  </p>
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page - 1)}
                      disabled={pagination.page <= 1}
                    >
                      <ChevronLeft className="h-4 w-4" />
                      Previous
                    </Button>
                    <span className="text-sm">
                      Page {pagination.page} of {pagination.pages}
                    </span>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handlePageChange(pagination.page + 1)}
                      disabled={pagination.page >= pagination.pages}
                    >
                      Next
                      <ChevronRight className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>
    </div>
  )
}
