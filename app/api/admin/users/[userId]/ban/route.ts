import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";

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

        const { banned } = await request.json();
        const { userId } = params;

        // Prevent banning admin users
        const targetUser = await prisma.user.findUnique({
            where: { id: userId },
        });

        if (!targetUser) {
            return NextResponse.json(
                { message: "User not found" },
                { status: 404 }
            );
        }

        if (targetUser.role === "ADMIN") {
            return NextResponse.json(
                { message: "Cannot ban admin users" },
                { status: 400 }
            );
        }

        // Update user ban status
        await prisma.user.update({
            where: { id: userId },
            data: { isBanned: banned },
        });

        // Log the action
        await prisma.activityLog.create({
            data: {
                userId: session.user.id,
                action: banned ? "USER_BANNED" : "USER_UNBANNED",
                details: `${banned ? "Banned" : "Unbanned"} user ${
                    targetUser.email
                }`,
            },
        });

        return NextResponse.json({ success: true });
    } catch (error) {
        console.error("Error updating user ban status:", error);
        return NextResponse.json(
            { message: "Internal server error" },
            { status: 500 }
        );
    }
}
