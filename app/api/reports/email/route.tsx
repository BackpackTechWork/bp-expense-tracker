import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { generateExpenseReport } from "@/lib/pdf-generator"
import nodemailer from "nodemailer"

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)
    if (!session?.user?.id) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
    }

    const { startDate, endDate, categories, email } = await request.json()

    // Fetch expenses (same logic as generate route)
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
    const pdfBuffer = Buffer.from(doc.output("arraybuffer"))

    // Setup email transporter
    const transporter = nodemailer.createTransporter({
      host: process.env.SMTP_HOST,
      port: Number.parseInt(process.env.SMTP_PORT || "587"),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    })

    // Send email with PDF attachment
    await transporter.sendMail({
      from: process.env.SMTP_FROM,
      to: email || session.user.email,
      subject: `Expense Report - ${reportOptions.dateRange}`,
      html: `
        <h2>Your Expense Report</h2>
        <p>Please find your expense report attached for the period: ${reportOptions.dateRange}</p>
        <p><strong>Total Expenses:</strong> $${totalAmount.toFixed(2)}</p>
        <p><strong>Number of Transactions:</strong> ${expenses.length}</p>
        <p>Generated on: ${new Date().toLocaleDateString()}</p>
      `,
      attachments: [
        {
          filename: `expense-report-${Date.now()}.pdf`,
          content: pdfBuffer,
          contentType: "application/pdf",
        },
      ],
    })

    return NextResponse.json({ success: true, message: "Report sent successfully" })
  } catch (error) {
    console.error("Error sending report:", error)
    return NextResponse.json({ error: "Failed to send report" }, { status: 500 })
  }
}
