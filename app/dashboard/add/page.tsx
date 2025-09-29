import { prisma } from "@/lib/prisma";
import { AddExpenseForm } from "@/components/user/add-expense-form";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { ArrowLeft } from "lucide-react";

export default async function AddExpensePage() {
    const categories = await prisma.category.findMany({
        orderBy: { name: "asc" },
    });

    return (
        <div className="max-w-2xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
            <Button asChild variant="outline" className="mb-6">
                <Link href="/expenses" className="flex items-center gap-2">
                    <ArrowLeft className="h-4 w-4 mr-1" />
                    Back
                </Link>
            </Button>
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">
                    Add Expense
                </h1>
                <p className="text-gray-600">Track your spending</p>
            </div>

            <AddExpenseForm categories={categories} />
        </div>
    );
}
