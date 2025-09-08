"use client";

import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface ErrorMessageProps {
    message?: string | ReactNode;
    children?: ReactNode;
    className?: string;
    show?: boolean;
}

export function ErrorMessage({
    message,
    children,
    className,
    show = true,
}: ErrorMessageProps) {
    if (!show) return null;

    const content = children || message;

    if (!content) return null;

    return (
        <p className={cn("text-sm text-red-500 mt-1", className)}>{content}</p>
    );
}
