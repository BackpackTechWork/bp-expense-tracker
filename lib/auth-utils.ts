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

    if (!session?.user?.email) {
        throw new Error("No email found in session");
    }

    const user = await prisma.user.findUnique({
        where: { email: session.user.email as string },
    });

    if (!user) {
        throw new Error(
            `User not found in database. ID: ${session.user.id}, Email: ${session.user.email}`
        );
    }

    session.user.id = user.id;

    return user;
}
