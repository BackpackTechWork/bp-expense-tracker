import { type NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { createUserSchema } from "@/lib/validations/user";
import bcrypt from "bcryptjs";

// Get users with pagination and filtering
export async function GET(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const { searchParams } = new URL(request.url);
        const page = parseInt(searchParams.get("page") || "1");
        const pageSize = parseInt(searchParams.get("pageSize") || "10");
        const search = searchParams.get("search") || "";
        const role = searchParams.get("role") || "";
        const status = searchParams.get("status") || "";

        // Build where clause
        const where: any = {};

        // Search filter
        if (search) {
            where.OR = [
                { name: { contains: search, mode: "insensitive" } },
                { email: { contains: search, mode: "insensitive" } },
            ];
        }

        // Role filter
        if (role) {
            where.role = role;
        }

        // Status filter
        if (status === "active") {
            where.isActive = true;
            where.isBanned = false;
        } else if (status === "inactive") {
            where.isActive = false;
        } else if (status === "banned") {
            where.isBanned = true;
        }

        // Get total count
        const totalUsers = await prisma.user.count({ where });

        // Get users with pagination
        const users = await prisma.user.findMany({
            where,
            orderBy: { createdAt: "desc" },
            skip: (page - 1) * pageSize,
            take: pageSize,
            include: {
                _count: {
                    select: {
                        expenses: true,
                        activityLogs: true,
                    },
                },
            },
        });

        const totalPages = Math.ceil(totalUsers / pageSize);

        return NextResponse.json({
            success: true,
            data: {
                users,
                pagination: {
                    currentPage: page,
                    totalPages,
                    totalUsers,
                    pageSize,
                    hasNextPage: page < totalPages,
                    hasPreviousPage: page > 1,
                },
            },
        });
    } catch (error) {
        console.error("Error fetching users:", error);
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

// Create new user
export async function POST(request: NextRequest) {
    try {
        const session = await auth();

        if (!session || session.user.role !== "ADMIN") {
            return NextResponse.json(
                { message: "Unauthorized" },
                { status: 401 }
            );
        }

        const body = await request.json();

        // Validate input with Zod
        const validationResult = createUserSchema.safeParse(body);
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

        const { name, email, role } = validationResult.data;

        // Check if user already exists
        const existingUser = await prisma.user.findUnique({
            where: { email },
        });

        if (existingUser) {
            return NextResponse.json(
                {
                    success: false,
                    message: "User with this email already exists",
                },
                { status: 400 }
            );
        }

        // Hash default password
        const hashedPassword = await bcrypt.hash("password123", 12);

        // Create user
        const user = await prisma.user.create({
            data: {
                name,
                email,
                password: hashedPassword,
                role: role as "USER" | "ADMIN",
                isActive: true,
                isBanned: false,
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
                        action: "USER_CREATED",
                        details: `Created user ${email} with role ${role}`,
                    },
                });
            }
        } catch (logError) {
            // Don't fail user creation if logging fails
            console.error("Failed to log user creation:", logError);
        }

        return NextResponse.json({
            success: true,
            message: "User created successfully",
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isActive: user.isActive,
                isBanned: user.isBanned,
                createdAt: user.createdAt,
            },
        });
    } catch (error) {
        console.error("Error creating user:", error);
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
