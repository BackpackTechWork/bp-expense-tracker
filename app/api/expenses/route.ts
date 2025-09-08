import { type NextRequest, NextResponse } from "next/server"
import { getServerSession } from "next-auth"
import { authOptions } from "@/lib/auth"
import { prisma } from "@/lib/prisma"
import { expenseSchema, dateRangeSchema, paginationSchema } from "@/lib/validations"
import { handleApiError, AppError } from "@/lib/error-handler"

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    const { searchParams } = new URL(request.url)

    const { page, limit } = paginationSchema.parse({
      page: searchParams.get("page"),
      limit: searchParams.get("limit"),
    })

    const categoryId = searchParams.get("categoryId")
    const startDate = searchParams.get("startDate")
    const endDate = searchParams.get("endDate")

    if (startDate || endDate) {
      dateRangeSchema.parse({ startDate, endDate })
    }

    const where: any = {
      userId: session.user.id,
    }

    if (categoryId) {
      where.categoryId = categoryId
    }

    if (startDate && endDate) {
      where.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      }
    }

    const [expenses, total] = await Promise.all([
      prisma.expense.findMany({
        where,
        include: {
          category: true,
        },
        orderBy: { date: "desc" },
        skip: (page - 1) * limit,
        take: limit,
      }),
      prisma.expense.count({ where }),
    ])

    return NextResponse.json({
      expenses,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    return handleApiError(error)
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions)

    if (!session) {
      throw new AppError("Unauthorized", 401, "UNAUTHORIZED")
    }

    const formData = await request.formData()

    const expenseData = {
      amount: Number.parseFloat(formData.get("amount") as string),
      description: formData.get("description") as string,
      categoryId: formData.get("categoryId") as string,
      date: new Date(formData.get("date") as string),
      receiptUrl: "", // Will be set after file upload
    }

    const validatedData = expenseSchema.parse(expenseData)

    const note = formData.get("note") as string
    const receiptFile = formData.get("receipt") as File | null

    let receiptUrl = null

    // Handle receipt upload (you would implement actual file upload here)
    if (receiptFile && receiptFile.size > 0) {
      const allowedTypes = ["image/jpeg", "image/png", "image/webp", "application/pdf"]
      const maxSize = 5 * 1024 * 1024 // 5MB

      if (!allowedTypes.includes(receiptFile.type)) {
        throw new AppError(
          "Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.",
          400,
          "INVALID_FILE_TYPE",
        )
      }

      if (receiptFile.size > maxSize) {
        throw new AppError("File size too large. Maximum size is 5MB.", 400, "FILE_TOO_LARGE")
      }

      // For now, we'll just store the filename
      // In production, you'd upload to a service like Vercel Blob or AWS S3
      receiptUrl = `/uploads/${Date.now()}-${receiptFile.name}`
    }

    const expense = await prisma.expense.create({
      data: {
        amount: validatedData.amount,
        description: validatedData.description,
        note: note || null,
        categoryId: validatedData.categoryId,
        date: validatedData.date,
        receiptUrl,
        userId: session.user.id,
      },
      include: {
        category: true,
      },
    })

    // Log activity
    await prisma.activityLog.create({
      data: {
        userId: session.user.id,
        action: "EXPENSE_CREATED",
        details: `Created expense: ${validatedData.description} - $${validatedData.amount}`,
      },
    })

    return NextResponse.json({ expense }, { status: 201 })
  } catch (error) {
    return handleApiError(error)
  }
}
