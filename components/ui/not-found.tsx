"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Home, ArrowLeft, Search } from "lucide-react";
import { useRouter } from "next/navigation";
import { cn } from "@/lib/utils";

interface NotFoundProps {
    title?: string;
    description?: string;
    showBackButton?: boolean;
    showHomeButton?: boolean;
    className?: string;
    icon?: React.ReactNode;
}

export function NotFound({
    title = "Page Not Found",
    description = "The page you're looking for doesn't exist or has been moved.",
    showBackButton = true,
    showHomeButton = true,
    className,
    icon,
}: NotFoundProps) {
    const router = useRouter();

    return (
        <div
            className={cn(
                "flex items-center justify-center min-h-[400px] p-4",
                className
            )}
        >
            <Card className="w-full max-w-md text-center">
                <CardHeader>
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-gray-100">
                        {icon || <Search className="h-8 w-8 text-gray-400" />}
                    </div>
                    <CardTitle className="text-2xl font-bold text-gray-900">
                        {title}
                    </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                    <p className="text-gray-600">{description}</p>

                    <div className="flex flex-col sm:flex-row gap-2 justify-center">
                        {showBackButton && (
                            <Button
                                variant="outline"
                                onClick={() => router.back()}
                                className="flex items-center gap-2"
                            >
                                <ArrowLeft className="h-4 w-4" />
                                Go Back
                            </Button>
                        )}

                        {showHomeButton && (
                            <Button
                                onClick={() => router.push("/dashboard")}
                                className="flex items-center gap-2"
                            >
                                <Home className="h-4 w-4" />
                                Go Home
                            </Button>
                        )}
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}

export function PageNotFound() {
    return <NotFound />;
}

export function UserNotFound() {
    return (
        <NotFound
            title="User Not Found"
            description="The user you're looking for doesn't exist or has been removed."
            icon={<Search className="h-8 w-8 text-gray-400" />}
        />
    );
}

export function ExpenseNotFound() {
    return (
        <NotFound
            title="Expense Not Found"
            description="The expense you're looking for doesn't exist or has been deleted."
            icon={<Search className="h-8 w-8 text-gray-400" />}
        />
    );
}
