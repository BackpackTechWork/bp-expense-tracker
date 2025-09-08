"use client";

import { DollarSign } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";

export function ExpenseEmptyState() {
    return (
        <Card className="shadow-sm">
            <CardContent className="p-12 text-center">
                <div className="space-y-4">
                    <div className="w-16 h-16 mx-auto bg-gray-100 rounded-full flex items-center justify-center">
                        <DollarSign className="h-8 w-8 text-gray-400" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            No expenses found
                        </h3>
                        <p className="text-gray-500">
                            No expenses found for the selected filters. Try
                            adjusting your filters or add some expenses.
                        </p>
                    </div>
                </div>
            </CardContent>
        </Card>
    );
}
