import jsPDF from "jspdf"
import "jspdf-autotable"

interface ExpenseData {
  id: string
  description: string
  amount: number
  category: string
  date: string
  receiptUrl?: string
}

interface ReportOptions {
  title: string
  dateRange: string
  expenses: ExpenseData[]
  totalAmount: number
  categoryBreakdown: { category: string; amount: number; percentage: number }[]
}

export function generateExpenseReport(options: ReportOptions): jsPDF {
  const doc = new jsPDF()

  // Header
  doc.setFontSize(20)
  doc.setTextColor(15, 23, 42) // slate-900
  doc.text(options.title, 20, 30)

  doc.setFontSize(12)
  doc.setTextColor(71, 85, 105) // slate-600
  doc.text(`Report Period: ${options.dateRange}`, 20, 45)
  doc.text(`Generated on: ${new Date().toLocaleDateString()}`, 20, 55)

  // Summary section
  doc.setFontSize(16)
  doc.setTextColor(15, 23, 42)
  doc.text("Summary", 20, 75)

  doc.setFontSize(12)
  doc.text(`Total Expenses: $${options.totalAmount.toFixed(2)}`, 20, 90)
  doc.text(`Number of Transactions: ${options.expenses.length}`, 20, 100)

  // Category breakdown
  doc.setFontSize(14)
  doc.text("Category Breakdown", 20, 120)

  const categoryData = options.categoryBreakdown.map((item) => [
    item.category,
    `$${item.amount.toFixed(2)}`,
    `${item.percentage.toFixed(1)}%`,
  ])
  ;(doc as any).autoTable({
    startY: 130,
    head: [["Category", "Amount", "Percentage"]],
    body: categoryData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] }, // blue-500
    styles: { fontSize: 10 },
  })

  // Expense details
  const finalY = (doc as any).lastAutoTable.finalY + 20
  doc.setFontSize(14)
  doc.text("Expense Details", 20, finalY)

  const expenseData = options.expenses.map((expense) => [
    new Date(expense.date).toLocaleDateString(),
    expense.description,
    expense.category,
    `$${expense.amount.toFixed(2)}`,
  ])
  ;(doc as any).autoTable({
    startY: finalY + 10,
    head: [["Date", "Description", "Category", "Amount"]],
    body: expenseData,
    theme: "grid",
    headStyles: { fillColor: [59, 130, 246] },
    styles: { fontSize: 9 },
  })

  return doc
}

export function downloadPDF(doc: jsPDF, filename: string) {
  doc.save(filename)
}
