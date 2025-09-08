import { type NextRequest, NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { expenseUpdateSchema } from "@/lib/validations";
import { handleApiError } from "@/lib/error-handler";
import {
    authenticateRequest,
    findExpenseById,
    logExpenseActivity,
} from "@/lib/expense-utils";

export async function PUT(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await authenticateRequest(request);
        const body = await request.json();
        const validatedData = expenseUpdateSchema.parse({
            ...body,
            id: params.id,
        });

        await findExpenseById(params.id, userId);

        const expense = await prisma.expense.update({
            where: { id: params.id },
            data: { ...validatedData, id: undefined },
            include: { category: true },
        });

        await logExpenseActivity(
            userId,
            "EXPENSE_UPDATED",
            `Updated expense: ${expense.description} - $${expense.amount}`
        );

        return NextResponse.json({ success: true, data: expense });
    } catch (error) {
        return handleApiError(error);
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const { userId } = await authenticateRequest(request);

        const existingExpense = await findExpenseById(params.id, userId);

        await prisma.expense.delete({ where: { id: params.id } });

        await logExpenseActivity(
            userId,
            "EXPENSE_DELETED",
            `Deleted expense: ${existingExpense.description} - $${existingExpense.amount}`
        );

        return NextResponse.json({
            success: true,
            message: "Expense deleted successfully",
        });
    } catch (error) {
        return handleApiError(error);
    }
}
