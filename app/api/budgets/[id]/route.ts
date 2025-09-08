import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ensureSessionUser } from "@/lib/auth-utils";
import { budgetSchema } from "@/lib/validations/budget";
import { z } from "zod";

const budgetUpdateSchema = budgetSchema.partial();

export async function PATCH(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureSessionUser(session);

        const body = await request.json();
        const validatedData = budgetUpdateSchema.parse(body);

        // Check if budget exists and belongs to user
        const existingBudget = await prisma.budget.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingBudget) {
            return NextResponse.json(
                { success: false, message: "Budget not found" },
                { status: 404 }
            );
        }

        const budget = await prisma.budget.update({
            where: { id: params.id },
            data: validatedData,
            include: {
                category: true,
            },
        });

        return NextResponse.json({ success: true, data: budget });
    } catch (error) {
        if (error instanceof z.ZodError) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation error",
                    errors: error.errors,
                },
                { status: 400 }
            );
        }
        console.error("Error updating budget:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}

export async function DELETE(
    request: NextRequest,
    { params }: { params: { id: string } }
) {
    try {
        const session = await auth();
        if (!session) {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        await ensureSessionUser(session);

        // Check if budget exists and belongs to user
        const existingBudget = await prisma.budget.findFirst({
            where: {
                id: params.id,
                userId: session.user.id,
            },
        });

        if (!existingBudget) {
            return NextResponse.json(
                { success: false, message: "Budget not found" },
                { status: 404 }
            );
        }

        await prisma.budget.delete({
            where: { id: params.id },
        });

        return NextResponse.json({
            success: true,
            message: "Budget deleted successfully",
        });
    } catch (error) {
        console.error("Error deleting budget:", error);
        return NextResponse.json(
            { success: false, message: "Internal server error" },
            { status: 500 }
        );
    }
}
