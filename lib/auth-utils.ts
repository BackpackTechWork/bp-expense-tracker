import { prisma } from "@/lib/prisma";
import type { Session } from "next-auth";

/**
 * Ensures the session user exists in the database and returns the correct user record.
 * This handles cases where the session user ID doesn't match the database user ID
 * (common when database is reset but session persists).
 */
export async function ensureSessionUser(session: Session | null) {
    if (!session?.user) {
        throw new Error("No session found");
    }

    // First try to find user by ID
    let user = await prisma.user.findUnique({
        where: { id: session.user.id },
    });

    // If not found by ID, try to find by email (common issue with session/db mismatch)
    if (!user && session.user.email) {
        console.warn("User not found by ID, trying to find by email:", {
            sessionUserId: session.user.id,
            sessionUserEmail: session.user.email,
        });

        user = await prisma.user.findUnique({
            where: { email: session.user.email },
        });

        if (user) {
            console.log("Found user by email, updating session user ID:", {
                oldId: session.user.id,
                newId: user.id,
            });
            // Update the session user ID to match the database
            session.user.id = user.id;
        }
    }

    if (!user) {
        throw new Error(
            `User not found in database. ID: ${session.user.id}, Email: ${session.user.email}`
        );
    }

    return user;
}
