"use client";

import { cn } from "@/lib/utils";

interface LoaderProps {
    size?: "sm" | "md" | "lg";
    className?: string;
    text?: string;
}

export function Loader({ size = "md", className, text }: LoaderProps) {
    const sizeClasses = {
        sm: "h-4 w-4",
        md: "h-8 w-8",
        lg: "h-12 w-12",
    };

    return (
        <div
            className={cn(
                "flex flex-col items-center justify-center space-y-4",
                className
            )}
        >
            <div className="relative">
                <div
                    className={cn(
                        "animate-spin rounded-full border-2 border-gray-200",
                        sizeClasses[size]
                    )}
                >
                    <div className="absolute inset-0 rounded-full border-2 border-transparent border-t-[#DC143C]"></div>
                </div>
            </div>
            {text && (
                <p className="text-sm text-[#DC143C] animate-pulse">{text}</p>
            )}
        </div>
    );
}

export function PageLoader({ text = "Loading..." }: { text?: string }) {
    return (
        <div className="flex items-center justify-center min-h-[400px]">
            <Loader size="lg" text={text} />
        </div>
    );
}

export function InlineLoader({ text }: { text?: string }) {
    return (
        <div className="flex items-center justify-center py-8">
            <Loader size="md" text={text} />
        </div>
    );
}
