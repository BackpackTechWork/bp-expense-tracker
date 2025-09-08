import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateExpenseReport } from "@/lib/pdf-generator"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startDate, endDate, categories } = await request.json()

    // Fetch expenses for the date range
    const expenses = await prisma.expense.findMany({
      where: {
        userId: session.user.id,
        date: {
          gte: new Date(startDate),
          lte: new Date(endDate),
        },
        ...(categories?.length > 0 && {
          category: { in: categories },
        }),
      },
      include: {
        category: true,
      },
      orderBy: { date: "desc" },
    })

    // Calculate totals and breakdown
    const totalAmount = expenses.reduce((sum, expense) => sum + expense.amount, 0)

    const categoryBreakdown = expenses.reduce(
      (acc, expense) => {
        const categoryName = expense.category.name
        if (!acc[categoryName]) {
          acc[categoryName] = 0
        }
        acc[categoryName] += expense.amount
        return acc
      },
      {} as Record<string, number>,
    )

    const categoryBreakdownArray = Object.entries(categoryBreakdown).map(([category, amount]) => ({
      category,
      amount,
      percentage: (amount / totalAmount) * 100,
    }))

    // Generate PDF
    const reportOptions = {
      title: "Expense Report",
      dateRange: `${new Date(startDate).toLocaleDateString()} - ${new Date(endDate).toLocaleDateString()}`,
      expenses: expenses.map((expense) => ({
        id: expense.id,
        description: expense.description,
        amount: expense.amount,
        category: expense.category.name,
        date: expense.date.toISOString(),
        receiptUrl: expense.receiptUrl,
      })),
      totalAmount,
      categoryBreakdown: categoryBreakdownArray,
    }

    const doc = generateExpenseReport(reportOptions)
    const pdfBuffer = doc.output("arraybuffer")

    return new NextResponse(pdfBuffer, {
      headers: {
        "Content-Type": "application/pdf",
        "Content-Disposition": `attachment; filename="expense-report-${Date.now()}.pdf"`,
      },
    })
  } catch (error) {
    console.error("Error generating report:", error)
    return NextResponse.json({ error: "Failed to generate report" }, { status: 500 })
  }
}
