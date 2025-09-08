import { create } from "zustand"
import { persist } from "zustand/middleware"

interface Expense {
  id: string
  amount: number
  description: string | null
  note: string | null
  date: Date
  categoryId: string
  category: {
    id: string
    name: string
    color: string
    icon: string | null
  }
}

interface Budget {
  id: string
  amount: number
  period: string
  startDate: Date
  endDate: Date
  categoryId: string | null
  category?: {
    name: string
    color: string
  }
}

interface SavingsGoal {
  id: string
  name: string
  targetAmount: number
  currentAmount: number
  targetDate: Date | null
}

interface ExpenseStore {
  expenses: Expense[]
  budgets: Budget[]
  savingsGoals: SavingsGoal[]
  selectedPeriod: "daily" | "weekly" | "monthly"
  selectedCategory: string | null

  // Actions
  setExpenses: (expenses: Expense[]) => void
  addExpense: (expense: Expense) => void
  updateExpense: (id: string, expense: Partial<Expense>) => void
  deleteExpense: (id: string) => void

  setBudgets: (budgets: Budget[]) => void
  addBudget: (budget: Budget) => void
  updateBudget: (id: string, budget: Partial<Budget>) => void
  deleteBudget: (id: string) => void

  setSavingsGoals: (goals: SavingsGoal[]) => void
  addSavingsGoal: (goal: SavingsGoal) => void
  updateSavingsGoal: (id: string, goal: Partial<SavingsGoal>) => void
  deleteSavingsGoal: (id: string) => void

  setSelectedPeriod: (period: "daily" | "weekly" | "monthly") => void
  setSelectedCategory: (categoryId: string | null) => void
}

export const useExpenseStore = create<ExpenseStore>()(
  persist(
    (set) => ({
      expenses: [],
      budgets: [],
      savingsGoals: [],
      selectedPeriod: "monthly",
      selectedCategory: null,

      setExpenses: (expenses) => set({ expenses }),
      addExpense: (expense) => set((state) => ({ expenses: [expense, ...state.expenses] })),
      updateExpense: (id, updatedExpense) =>
        set((state) => ({
          expenses: state.expenses.map((expense) => (expense.id === id ? { ...expense, ...updatedExpense } : expense)),
        })),
      deleteExpense: (id) =>
        set((state) => ({
          expenses: state.expenses.filter((expense) => expense.id !== id),
        })),

      setBudgets: (budgets) => set({ budgets }),
      addBudget: (budget) => set((state) => ({ budgets: [...state.budgets, budget] })),
      updateBudget: (id, updatedBudget) =>
        set((state) => ({
          budgets: state.budgets.map((budget) => (budget.id === id ? { ...budget, ...updatedBudget } : budget)),
        })),
      deleteBudget: (id) =>
        set((state) => ({
          budgets: state.budgets.filter((budget) => budget.id !== id),
        })),

      setSavingsGoals: (goals) => set({ savingsGoals: goals }),
      addSavingsGoal: (goal) => set((state) => ({ savingsGoals: [...state.savingsGoals, goal] })),
      updateSavingsGoal: (id, updatedGoal) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.map((goal) => (goal.id === id ? { ...goal, ...updatedGoal } : goal)),
        })),
      deleteSavingsGoal: (id) =>
        set((state) => ({
          savingsGoals: state.savingsGoals.filter((goal) => goal.id !== id),
        })),

      setSelectedPeriod: (period) => set({ selectedPeriod: period }),
      setSelectedCategory: (categoryId) => set({ selectedCategory: categoryId }),
    }),
    {
      name: "expense-store",
    },
  ),
)
