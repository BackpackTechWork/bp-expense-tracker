import { AlertTriangle, CheckCircle } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ValidationSummaryProps {
    errors: string[];
    className?: string;
}

export function ValidationSummary({
    errors,
    className,
}: ValidationSummaryProps) {
    if (errors.length === 0) return null;

    return (
        <Alert variant="destructive" className={`mb-6 ${className}`}>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
                <div className="space-y-1">
                    <p className="font-medium">
                        Please fix the following issues:
                    </p>
                    <ul className="list-disc list-inside space-y-1 text-sm">
                        {errors.map((error, index) => (
                            <li key={index}>{error}</li>
                        ))}
                    </ul>
                </div>
            </AlertDescription>
        </Alert>
    );
}
