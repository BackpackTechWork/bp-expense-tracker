export const QUERY_KEYS = {
    USERS: "users" as const,
    USER_DETAILS: "user-details" as const,
    EXPENSES: "expenses" as const,
    EXPENSE_DETAILS: "expense-details" as const,
    EXPENSE_CATEGORIES: "expense-categories" as const,
    BUDGETS: "budgets" as const,
    BUDGET_DETAILS: "budget-details" as const,
    ANALYTICS: "analytics" as const,
    SPENDING_TRENDS: "spending-trends" as const,
    CATEGORY_BREAKDOWN: "category-breakdown" as const,
    REPORTS: "reports" as const,
    ACTIVITY_LOGS: "activity-logs" as const,
} as const;

export const queryKeys = {
    users: {
        all: [QUERY_KEYS.USERS] as const,
        lists: () => [...queryKeys.users.all, "list"] as const,
        list: (filters: Record<string, any>, pagination: Record<string, any>) =>
            [...queryKeys.users.lists(), { filters, pagination }] as const,
        details: () => [...queryKeys.users.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.users.details(), id] as const,
    },
    expenses: {
        all: [QUERY_KEYS.EXPENSES] as const,
        lists: () => [...queryKeys.expenses.all, "list"] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.expenses.lists(), { filters }] as const,
        details: () => [...queryKeys.expenses.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.expenses.details(), id] as const,
        categories: () => [QUERY_KEYS.EXPENSE_CATEGORIES] as const,
    },
    budgets: {
        all: [QUERY_KEYS.BUDGETS] as const,
        lists: () => [...queryKeys.budgets.all, "list"] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.budgets.lists(), { filters }] as const,
        details: () => [...queryKeys.budgets.all, "detail"] as const,
        detail: (id: string) => [...queryKeys.budgets.details(), id] as const,
    },
    analytics: {
        all: [QUERY_KEYS.ANALYTICS] as const,
        overview: () => [...queryKeys.analytics.all, "overview"] as const,
        spendingTrends: (period?: string) =>
            [
                ...queryKeys.analytics.all,
                "spending-trends",
                { period },
            ] as const,
        categoryBreakdown: (period?: string) =>
            [
                ...queryKeys.analytics.all,
                "category-breakdown",
                { period },
            ] as const,
    },
    reports: {
        all: [QUERY_KEYS.REPORTS] as const,
        list: () => [...queryKeys.reports.all, "list"] as const,
        detail: (id: string) =>
            [...queryKeys.reports.all, "detail", id] as const,
    },
    activityLogs: {
        all: [QUERY_KEYS.ACTIVITY_LOGS] as const,
        lists: () => [...queryKeys.activityLogs.all, "list"] as const,
        list: (filters?: Record<string, any>) =>
            [...queryKeys.activityLogs.lists(), { filters }] as const,
    },
} as const;

export type QueryKey = typeof queryKeys;
export type UserQueryKey = typeof queryKeys.users;
export type ExpenseQueryKey = typeof queryKeys.expenses;
export type BudgetQueryKey = typeof queryKeys.budgets;
export type AnalyticsQueryKey = typeof queryKeys.analytics;
export type ReportQueryKey = typeof queryKeys.reports;
export type ActivityLogQueryKey = typeof queryKeys.activityLogs;
