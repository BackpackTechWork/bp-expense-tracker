import { PrismaClient } from "@prisma/client";

const globalForPrisma = globalThis as unknown as {
    prisma: PrismaClient | undefined;
};

export const prisma =
    globalForPrisma.prisma ??
    new PrismaClient({
        log:
            process.env.NODE_ENV === "development"
                ? ["query", "error", "warn"]
                : ["error"],
        errorFormat: "pretty",
    });

if (process.env.NODE_ENV !== "production") globalForPrisma.prisma = prisma;

export async function testDatabaseConnection() {
    try {
        await prisma.$connect();
        await prisma.$queryRaw`SELECT 1`;
        return { success: true, message: "Database connected successfully" };
    } catch (error) {
        console.error("Database connection failed:", error);
        return {
            success: false,
            message:
                error instanceof Error
                    ? error.message
                    : "Unknown database error",
        };
    }
}

process.on("beforeExit", async () => {
    await prisma.$disconnect();
});
