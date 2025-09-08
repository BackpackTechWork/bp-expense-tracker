import { auth } from "@/auth";
import { DashboardOverview } from "@/components/user/dashboard-overview";
import { RecentExpenses } from "@/components/user/recent-expenses";
import { BudgetProgress } from "@/components/user/budget-progress";

export default async function DashboardPage() {
    const session = await auth();

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        Dashboard
                    </h1>
                    <p className="text-gray-600">
                        Welcome back, {session?.user?.name}
                    </p>
                </div>
            </div>

            <DashboardOverview period="month" />

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RecentExpenses limit={5} />
                <BudgetProgress />
            </div>
        </div>
    );
}
