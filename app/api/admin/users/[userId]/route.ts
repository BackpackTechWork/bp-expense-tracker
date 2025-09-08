import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { updateUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

// Update user
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
        const validationResult = updateUserSchema.safeParse(body);
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

        const { name, email, role, isActive } = validationResult.data;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Prevent modifying admin users (except current admin)
        if (
            existingUser.role === "ADMIN" &&
            existingUser.id !== session.user.id
        ) {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot modify other admin users",
                },
                { status: 400 }
            );
        }

        // Check if email is already taken by another user
        if (email && email !== existingUser.email) {
            const emailExists = await prisma.user.findUnique({
                where: { email },
            });

            if (emailExists) {
                return NextResponse.json(
                    {
                        success: false,
                        message: "Email already taken",
                    },
                    { status: 400 }
                );
            }
        }

        // Update user
        const updatedUser = await prisma.user.update({
            where: { id: userId },
            data: {
                ...(name && { name }),
                ...(email && { email }),
                ...(role && { role: role as "USER" | "ADMIN" }),
                ...(typeof isActive === "boolean" && { isActive }),
            },
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
                        action: "USER_UPDATED",
                        details: `Updated user ${existingUser.email}`,
                    },
                });
            }
        } catch (logError) {
            // Don't fail user update if logging fails
            console.error("Failed to log user update:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "User updated successfully",
            user: {
                id: updatedUser.id,
                name: updatedUser.name,
                email: updatedUser.email,
                role: updatedUser.role,
                isActive: updatedUser.isActive,
                isBanned: updatedUser.isBanned,
                updatedAt: updatedUser.updatedAt,
            },
        });
    } catch (error) {
        console.error("Error updating user:", error);
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

// Reset user password
export async function PUT(
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

        const { userId } = params;

        // Check if user exists
        const existingUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User not found",
                },
                { status: 404 }
            );
        }

        // Prevent resetting admin passwords
        if (existingUser.role === "ADMIN") {
            return NextResponse.json(
                {
                    success: false,
                    message: "Cannot reset admin passwords",
                },
                { status: 400 }
            );
        }

        // Hash default password
        const hashedPassword = await bcrypt.hash("password123", 12);

        // Update password
        await prisma.user.update({
            where: { id: userId },
            data: { password: hashedPassword },
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
                        action: "USER_PASSWORD_RESET",
                        details: `Reset password for user ${existingUser.email}`,
                    },
                });
            }
        } catch (logError) {
            // Don't fail password reset if logging fails
            console.error("Failed to log password reset:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "Password reset successfully",
        });
    } catch (error) {
        console.error("Error resetting password:", error);
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
