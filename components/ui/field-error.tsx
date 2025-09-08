import { AlertCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface FieldErrorProps {
    message: string;
    className?: string;
}

export function FieldError({ message, className }: FieldErrorProps) {
    if (!message) return null;

    return (
        <Alert variant="destructive" className={`mt-2 ${className}`}>
            <AlertCircle className="h-4 w-4" />
            <AlertDescription className="text-sm">{message}</AlertDescription>
        </Alert>
    );
}
