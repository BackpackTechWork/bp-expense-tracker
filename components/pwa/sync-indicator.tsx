"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { RefreshCw, Upload } from "lucide-react"
import { offlineStorage } from "@/lib/offline-storage"

export function SyncIndicator() {
  const [offlineCount, setOfflineCount] = useState(0)
  const [isSyncing, setIsSyncing] = useState(false)

  useEffect(() => {
    const updateCount = () => {
      setOfflineCount(offlineStorage.getOfflineCount())
    }

    updateCount()

    // Update count periodically
    const interval = setInterval(updateCount, 1000)

    // Sync when coming back online
    const handleOnline = async () => {
      if (offlineStorage.getOfflineCount() > 0) {
        await handleSync()
      }
    }

    window.addEventListener("online", handleOnline)

    return () => {
      clearInterval(interval)
      window.removeEventListener("online", handleOnline)
    }
  }, [])

  const handleSync = async () => {
    if (isSyncing) return

    setIsSyncing(true)
    try {
      await offlineStorage.syncOfflineExpenses()
      setOfflineCount(offlineStorage.getOfflineCount())
    } catch (error) {
      console.error("Sync failed:", error)
    } finally {
      setIsSyncing(false)
    }
  }

  if (offlineCount === 0) {
    return null
  }

  return (
    <div className="fixed bottom-24 md:bottom-10 right-4 z-50">
      <Button onClick={handleSync} disabled={isSyncing} className="bg-[#DC143C] hover:bg-[#F75270] shadow-lg" size="sm">
        {isSyncing ? <RefreshCw className="h-4 w-4 mr-2 animate-spin" /> : <Upload className="h-4 w-4 mr-2" />}
        Sync {offlineCount} items
        <Badge variant="secondary" className="ml-2">
          {offlineCount}
        </Badge>
      </Button>
    </div>
  )
}
