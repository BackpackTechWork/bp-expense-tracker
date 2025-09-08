import { ZodError } from "zod";
import { NextResponse } from "next/server";

export class AppError extends Error {
    constructor(
        public message: string,
        public statusCode = 500,
        public code?: string
    ) {
        super(message);
        this.name = "AppError";
    }
}

export function handleApiError(error: unknown) {
    console.error("API Error:", error);

    if (error instanceof ZodError) {
        return NextResponse.json(
            {
                error: "Validation failed",
                details: error.errors.map((err) => ({
                    field: err.path.join("."),
                    message: err.message,
                })),
            },
            { status: 400 }
        );
    }

    if (error instanceof AppError) {
        return NextResponse.json(
            {
                error: error.message,
                code: error.code,
            },
            { status: error.statusCode }
        );
    }

    if (error instanceof Error) {
        return NextResponse.json(
            {
                error: error.message,
            },
            { status: 500 }
        );
    }

    return NextResponse.json(
        {
            error: "An unexpected error occurred",
        },
        { status: 500 }
    );
}

export function validateRequest<T>(schema: any, data: unknown): T {
    try {
        return schema.parse(data);
    } catch (error) {
        if (error instanceof ZodError) {
            throw new AppError(
                `Validation failed: ${error.errors
                    .map((e) => e.message)
                    .join(", ")}`,
                400,
                "VALIDATION_ERROR"
            );
        }
        throw error;
    }
}
