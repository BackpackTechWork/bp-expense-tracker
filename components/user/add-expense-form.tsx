"use client"

import type React from "react"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { useMutation, useQueryClient } from "@tanstack/react-query"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Alert, AlertDescription } from "@/components/ui/alert"
import { Loader2, Upload, X } from "lucide-react"
import { useExpenseStore } from "@/lib/store"

interface Category {
  id: string
  name: string
  color: string
  icon: string | null
}

interface AddExpenseFormProps {
  categories: Category[]
}

export function AddExpenseForm({ categories }: AddExpenseFormProps) {
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [note, setNote] = useState("")
  const [categoryId, setCategoryId] = useState("")
  const [date, setDate] = useState(new Date().toISOString().split("T")[0])
  const [receiptFile, setReceiptFile] = useState<File | null>(null)
  const [error, setError] = useState("")

  const router = useRouter()
  const queryClient = useQueryClient()
  const addExpense = useExpenseStore((state) => state.addExpense)

  const createExpenseMutation = useMutation({
    mutationFn: async (data: FormData) => {
      const response = await fetch("/api/expenses", {
        method: "POST",
        body: data,
      })

      if (!response.ok) {
        throw new Error("Failed to create expense")
      }

      return response.json()
    },
    onSuccess: (data) => {
      addExpense(data.expense)
      queryClient.invalidateQueries({ queryKey: ["expenses"] })
      router.push("/dashboard")
    },
    onError: (error) => {
      setError("Failed to create expense. Please try again.")
    },
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")

    if (!amount || !categoryId) {
      setError("Please fill in all required fields")
      return
    }

    const formData = new FormData()
    formData.append("amount", amount)
    formData.append("description", description)
    formData.append("note", note)
    formData.append("categoryId", categoryId)
    formData.append("date", date)

    if (receiptFile) {
      formData.append("receipt", receiptFile)
    }

    createExpenseMutation.mutate(formData)
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setError("File size must be less than 5MB")
        return
      }
      setReceiptFile(file)
    }
  }

  const removeFile = () => {
    setReceiptFile(null)
  }

  return (
    <Card className="bg-white/80 backdrop-blur-sm border-white/20">
      <CardHeader>
        <CardTitle className="text-xl font-semibold text-[#DC143C]">New Expense</CardTitle>
      </CardHeader>
      <CardContent>
        {error && (
          <Alert variant="destructive" className="mb-6">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="amount">Amount *</Label>
              <Input
                id="amount"
                type="number"
                step="0.01"
                placeholder="0.00"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                required
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="category">Category *</Label>
              <Select value={categoryId} onValueChange={setCategoryId} required>
                <SelectTrigger>
                  <SelectValue placeholder="Select category" />
                </SelectTrigger>
                <SelectContent>
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
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="description">Description</Label>
            <Input
              id="description"
              placeholder="What did you spend on?"
              value={description}
              onChange={(e) => setDescription(e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="date">Date</Label>
            <Input id="date" type="date" value={date} onChange={(e) => setDate(e.target.value)} />
          </div>

          <div className="space-y-2">
            <Label htmlFor="note">Note</Label>
            <Textarea
              id="note"
              placeholder="Additional notes (optional)"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="receipt">Receipt (optional)</Label>
            <div className="flex items-center space-x-4">
              <Input id="receipt" type="file" accept="image/*" onChange={handleFileChange} className="hidden" />
              <Button type="button" variant="outline" onClick={() => document.getElementById("receipt")?.click()}>
                <Upload className="h-4 w-4 mr-2" />
                Upload Receipt
              </Button>
              {receiptFile && (
                <div className="flex items-center space-x-2 bg-gray-100 px-3 py-2 rounded-lg">
                  <span className="text-sm text-gray-700">{receiptFile.name}</span>
                  <Button type="button" variant="ghost" size="sm" onClick={removeFile}>
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              )}
            </div>
          </div>

          <div className="flex space-x-4">
            <Button
              type="submit"
              className="flex-1 bg-[#DC143C] hover:bg-[#F75270]"
              disabled={createExpenseMutation.isPending}
            >
              {createExpenseMutation.isPending && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
              Add Expense
            </Button>
            <Button type="button" variant="outline" onClick={() => router.back()}>
              Cancel
            </Button>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
