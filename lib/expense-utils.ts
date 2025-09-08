import { NextRequest } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { AppError } from "@/lib/error-handler";
import { ensureSessionUser } from "@/lib/auth-utils";

export interface AuthenticatedRequest {
    session: NonNullable<Awaited<ReturnType<typeof auth>>>;
    userId: string;
}

export async function authenticateRequest(
    request: NextRequest
): Promise<AuthenticatedRequest> {
    const session = await auth();

    if (!session) {
        throw new AppError("Unauthorized", 401, "UNAUTHORIZED");
    }

    await ensureSessionUser(session);

    return {
        session,
        userId: session.user.id,
    };
}

export async function findExpenseById(id: string, userId: string) {
    const expense = await prisma.expense.findFirst({
        where: { id, userId },
        include: { category: true },
    });

    if (!expense) {
        throw new AppError("Expense not found", 404, "EXPENSE_NOT_FOUND");
    }

    return expense;
}

export async function logExpenseActivity(
    userId: string,
    action: string,
    details: string
) {
    try {
        await prisma.activityLog.create({
            data: { userId, action, details },
        });
    } catch (error) {
        console.error("Failed to log activity:", error);
    }
}

export function buildExpenseWhereClause(
    userId: string,
    filters: {
        categoryId?: string | null;
        startDate?: string | null;
        endDate?: string | null;
        targetUserId?: string;
    }
) {
    const where: any = {
        userId: filters.targetUserId || userId,
    };

    if (filters.categoryId) {
        where.categoryId = filters.categoryId;
    }

    if (filters.startDate && filters.endDate) {
        where.date = {
            gte: new Date(filters.startDate),
            lte: new Date(filters.endDate),
        };
    }

    return where;
}
