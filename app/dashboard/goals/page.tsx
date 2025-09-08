import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { SavingsGoals } from "@/components/user/savings-goals";
import { BudgetManagement } from "@/components/user/budget-management";

export default async function GoalsPage() {
    const session = await auth();
    const userId = session!.user.id;

    const [savingsGoals, budgets, categories] = await Promise.all([
        prisma.savingsGoal.findMany({
            where: { userId },
            orderBy: { createdAt: "desc" },
        }),
        prisma.budget.findMany({
            where: { userId },
            include: { category: true },
            orderBy: { createdAt: "desc" },
        }),
        prisma.category.findMany({
            orderBy: { name: "asc" },
        }),
    ]);

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Goals & Budgets
                    </h1>
                    <p className="text-gray-600">
                        Set and track your financial goals
                    </p>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <BudgetManagement budgets={budgets} categories={categories} />
                <SavingsGoals goals={savingsGoals} />
            </div>
        </div>
    );
}
