import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import {
    expenseSchema,
    dateRangeSchema,
    paginationSchema,
} from "@/lib/validations";
import { handleApiError, AppError } from "@/lib/error-handler";
import {
    authenticateRequest,
    buildExpenseWhereClause,
    logExpenseActivity,
} from "@/lib/expense-utils";

export async function GET(request: NextRequest) {
    try {
        const { session, userId } = await authenticateRequest(request);
        const { searchParams } = new URL(request.url);

        const { page, limit } = paginationSchema.parse({
            page: searchParams.get("page") || "1",
            limit: searchParams.get("limit") || "10",
        });

        const categoryId = searchParams.get("categoryId");
        const startDate = searchParams.get("startDate");
        const endDate = searchParams.get("endDate");
        const targetUserId = searchParams.get("userId");

        if (startDate || endDate) {
            dateRangeSchema.parse({
                startDate: startDate || undefined,
                endDate: endDate || undefined,
            });
        }

        const where = buildExpenseWhereClause(userId, {
            categoryId,
            startDate,
            endDate,
            targetUserId:
                targetUserId && session.user.role === "ADMIN"
                    ? targetUserId
                    : undefined,
        });

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
        ]);

        return NextResponse.json({
            success: true,
            data: expenses,
            pagination: {
                page,
                limit,
                total,
                pages: Math.ceil(total / limit),
            },
        });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function POST(request: NextRequest) {
    try {
        const { userId } = await authenticateRequest(request);
        const formData = await request.formData();

        const expenseData = {
            amount: Number.parseFloat(formData.get("amount") as string),
            description: formData.get("description") as string,
            categoryId: formData.get("categoryId") as string,
            date: new Date(formData.get("date") as string),
        };

        const validatedData = expenseSchema.parse(expenseData);
        const note = formData.get("note") as string;
        const receiptFile = formData.get("receipt") as File | null;

        // Handle receipt upload
        let receiptUrl = null;
        if (receiptFile && receiptFile.size > 0) {
            const allowedTypes = [
                "image/jpeg",
                "image/png",
                "image/webp",
                "application/pdf",
            ];
            const maxSize = 5 * 1024 * 1024; // 5MB

            if (!allowedTypes.includes(receiptFile.type)) {
                throw new AppError(
                    "Invalid file type. Only JPEG, PNG, WebP, and PDF files are allowed.",
                    400,
                    "INVALID_FILE_TYPE"
                );
            }

            if (receiptFile.size > maxSize) {
                throw new AppError(
                    "File size too large. Maximum size is 5MB.",
                    400,
                    "FILE_TOO_LARGE"
                );
            }

            receiptUrl = `/uploads/${Date.now()}-${receiptFile.name}`;
        }

        // Verify category exists
        const category = await prisma.category.findUnique({
            where: { id: validatedData.categoryId },
        });

        if (!category) {
            throw new AppError("Category not found", 404, "CATEGORY_NOT_FOUND");
        }

        const expense = await prisma.expense.create({
            data: {
                amount: validatedData.amount,
                description: validatedData.description,
                note: note || null,
                categoryId: validatedData.categoryId,
                date: validatedData.date,
                receiptUrl,
                userId,
            },
            include: { category: true },
        });

        await logExpenseActivity(
            userId,
            "EXPENSE_CREATED",
            `Created expense: ${validatedData.description} - $${validatedData.amount}`
        );

        return NextResponse.json(
            { success: true, data: expense },
            { status: 201 }
        );
    } catch (error) {
        return handleApiError(error);
    }
}
