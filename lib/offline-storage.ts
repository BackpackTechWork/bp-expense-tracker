"use client"

interface OfflineExpense {
  id: string
  amount: number
  description: string | null
  note: string | null
  categoryId: string
  date: string
  timestamp: number
}

class OfflineStorage {
  private readonly STORAGE_KEY = "offline-expenses"
  private readonly SYNC_QUEUE_KEY = "sync-queue"

  // Store expense offline
  storeExpense(expense: Omit<OfflineExpense, "id" | "timestamp">): string {
    const offlineExpense: OfflineExpense = {
      ...expense,
      id: `offline-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      timestamp: Date.now(),
    }

    const stored = this.getStoredExpenses()
    stored.push(offlineExpense)
    localStorage.setItem(this.STORAGE_KEY, JSON.stringify(stored))

    // Add to sync queue
    this.addToSyncQueue(offlineExpense)

    return offlineExpense.id
  }

  // Get all stored offline expenses
  getStoredExpenses(): OfflineExpense[] {
    if (typeof window === "undefined") return []

    try {
      const stored = localStorage.getItem(this.STORAGE_KEY)
      return stored ? JSON.parse(stored) : []
    } catch {
      return []
    }
  }

  // Add to sync queue
  private addToSyncQueue(expense: OfflineExpense) {
    const queue = this.getSyncQueue()
    queue.push(expense)
    localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(queue))
  }

  // Get sync queue
  getSyncQueue(): OfflineExpense[] {
    if (typeof window === "undefined") return []

    try {
      const queue = localStorage.getItem(this.SYNC_QUEUE_KEY)
      return queue ? JSON.parse(queue) : []
    } catch {
      return []
    }
  }

  // Sync offline expenses when online
  async syncOfflineExpenses(): Promise<void> {
    const queue = this.getSyncQueue()
    if (queue.length === 0) return

    const synced: string[] = []

    for (const expense of queue) {
      try {
        const formData = new FormData()
        formData.append("amount", expense.amount.toString())
        formData.append("description", expense.description || "")
        formData.append("note", expense.note || "")
        formData.append("categoryId", expense.categoryId)
        formData.append("date", expense.date)

        const response = await fetch("/api/expenses", {
          method: "POST",
          body: formData,
        })

        if (response.ok) {
          synced.push(expense.id)
        }
      } catch (error) {
        console.error("Failed to sync expense:", error)
        break // Stop syncing if there's an error
      }
    }

    // Remove synced expenses from queue and storage
    if (synced.length > 0) {
      const remainingQueue = queue.filter((expense) => !synced.includes(expense.id))
      const remainingStored = this.getStoredExpenses().filter((expense) => !synced.includes(expense.id))

      localStorage.setItem(this.SYNC_QUEUE_KEY, JSON.stringify(remainingQueue))
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(remainingStored))
    }
  }

  // Clear all offline data
  clearOfflineData() {
    localStorage.removeItem(this.STORAGE_KEY)
    localStorage.removeItem(this.SYNC_QUEUE_KEY)
  }

  // Get offline data count
  getOfflineCount(): number {
    return this.getSyncQueue().length
  }
}

export const offlineStorage = new OfflineStorage()
