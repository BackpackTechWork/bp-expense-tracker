import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { redirect } from "next/navigation";
import { ExportOptions } from "@/components/user/export-options";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { FileText, TrendingUp, Calendar, DollarSign } from "lucide-react";
import { RecentExpenses } from "@/components/user/recent-expenses";

async function getReportData(userId: string) {
    const [categories, totalExpenses] = await Promise.all([
        prisma.category.findMany({
            orderBy: { name: "asc" },
        }),
        prisma.expense.aggregate({
            where: { userId },
            _sum: { amount: true },
            _count: true,
        }),
    ]);

    return { categories, totalExpenses };
}

export default async function ReportsPage() {
    const session = await auth();
    if (!session?.user?.id) redirect("/auth/signin");

    const { categories, totalExpenses } = await getReportData(
        session.user.id
    );

    return (
        <div className="space-y-6">
            <div>
                <h1 className="text-2xl font-bold text-slate-900">
                    Reports & Export
                </h1>
                <p className="text-slate-600 mt-1">
                    Generate and export your expense reports
                </p>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Total Expenses
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    $
                                    {totalExpenses._sum.amount?.toFixed(2) ||
                                        "0.00"}
                                </p>
                            </div>
                            <DollarSign className="h-8 w-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Total Transactions
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {totalExpenses._count || 0}
                                </p>
                            </div>
                            <TrendingUp className="h-8 w-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-slate-600">
                                    Categories
                                </p>
                                <p className="text-2xl font-bold text-slate-900">
                                    {categories.length}
                                </p>
                            </div>
                            <FileText className="h-8 w-8 text-purple-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Export Options */}
                <ExportOptions categories={categories} />

                {/* Recent Expenses */}
                <RecentExpenses limit={5} />
            </div>
        </div>
    );
}
