import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { banUserSchema } from "@/lib/validations/user";

export async function PATCH(
    request: NextRequest,
    { params }: { params: { userId: string } }
) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();
        const { userId } = params;

        // Validate input with Zod
        const validationResult = banUserSchema.safeParse(body);
        if (!validationResult.success) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Validation failed",
                    errors: validationResult.error.errors,
                },
                { status: 400 }
            );
        }

        const { banned } = validationResult.data;

        // Prevent banning admin users
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        if (targetUser.role === "ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot ban admin users",
                },
                { status: 400 }
            );
        }

        // Update user ban status
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: banned },
        });

        // Log the action (only if session user exists in database)
        try {
            const sessionUser = await prisma.user.findUnique({
                where: { id: session.user.id },
            });

            if (sessionUser) {
                await prisma.activityLog.create({
                    data: {
                        userId: session.user.id,
                        action: banned ? "USER_BANNED" : "USER_UNBANNED",
                        details: `${banned ? "Banned" : "Unbanned"} user ${
                            targetUser.email
                        }`,
                    },
                });
            }
        } catch (logError) {
            // Don't fail ban operation if logging fails
            console.error("Failed to log ban operation:", logError);
        }

        return NextResponse.json({
            success: true,
            message: `User ${banned ? "banned" : "unbanned"} successfully`,
        });
    } catch (error) {
        console.error("Error updating user ban status:", error);
        return NextResponse.json(
            {
                success: false,
                message:
                    error instanceof Error
                        ? error.message
                        : "Internal server error",
            },
            { status: 500 }
        );
    }
}
