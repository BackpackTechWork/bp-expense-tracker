import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { expenseUpdateSchema } from "@/lib/validations";
import { handleApiError, AppError } from "@/lib/error-handler";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session) {
            throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
        }

        const body = await request.json();
        const validatedData = expenseUpdateSchema.parse({
            ...body,
            id: params.id,
        });

        // Check if expense exists and belongs to user
        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingExpense) {
            throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
        }

        const expense = await prisma.expense.update({
            where: { id: params.id },
            data: {
                ...validatedData,
                id: undefined, // Remove id from update data
            },
            include: {
                category: true,
            },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "EXPENSE_UPDATED",
                details: `Updated expense: ${expense.description} - $${expense.amount}`,
            },
        });

        return NextResponse.json({ expense });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();

        if (!session) {
            throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
        }

        // Check if expense exists and belongs to user
        const existingExpense = await prisma.expense.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingExpense) {
            throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
        }

        await prisma.expense.delete({
            where: { id: params.id },
        });

        // Log activity
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: "EXPENSE_DELETED",
                details: `Deleted expense: ${existingExpense.description} - $${existingExpense.amount}`,
            },
        });

        return NextResponse.json({ message: "Expense deleted successfully" });
    } catch (error) {
        return handleApiError(error);
    }
}
