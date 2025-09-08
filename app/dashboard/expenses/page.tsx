import { auth } from "@/auth";
import { prisma } from "@/lib/prisma";
import { ExpenseList } from "@/components/user/expense-list";

interface SearchParams {
    page?: string;
    category?: string;
    startDate?: string;
    endDate?: string;
    search?: string;
}

interface ExpenseListPageProps {
    searchParams: SearchParams;
}

export default async function ExpenseListPage({
    searchParams,
}: ExpenseListPageProps) {
    const session = await auth();
    const userId = session!.user.id;

    const page = Number.parseInt(searchParams.page || "1");
    const limit = 10;
    const categoryId = searchParams.category;
    const startDate = searchParams.startDate;
    const endDate = searchParams.endDate;
    const search = searchParams.search;

    const where: any = {
        userId,
    };

    if (categoryId) {
        where.categoryId = categoryId;
    }

    if (startDate && endDate) {
        where.date = {
            gte: new Date(startDate),
            lte: new Date(endDate),
        };
    }

    if (search) {
        where.OR = [
            { description: { contains: search, mode: "insensitive" } },
            { note: { contains: search, mode: "insensitive" } },
        ];
    }

    const [expenses, total, categories] = await Promise.all([
        prisma.expense.findMany({
            where,
            include: {
                category: true,
            },
            orderBy: { date: "desc" },
            skip: (page - 1) * limit,
            take: limit,
        }),
        prisma.expense.count({ where }),
        prisma.category.findMany({
            orderBy: { name: "asc" },
        }),
    ]);

    const pagination = {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
    };

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900">
                        All Expenses
                    </h1>
                    <p className="text-gray-600">
                        Manage and filter your expenses
                    </p>
                </div>
            </div>

            <ExpenseList
                expenses={expenses}
                categories={categories}
                pagination={pagination}
                searchParams={searchParams}
            />
        </div>
    );
}
