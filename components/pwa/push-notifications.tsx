"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Bell, BellOff, X } from "lucide-react"

export function PushNotifications() {
  const [permission, setPermission] = useState<NotificationPermission>("default")
  const [showPrompt, setShowPrompt] = useState(false)

  useEffect(() => {
    if ("Notification" in window) {
      setPermission(Notification.permission)

      // Show prompt if permission is default and user hasn't dismissed
      if (Notification.permission === "default" && !localStorage.getItem("notificationPromptDismissed")) {
        setTimeout(() => setShowPrompt(true), 5000) // Show after 5 seconds
      }
    }
  }, [])

  const requestPermission = async () => {
    if ("Notification" in window) {
      const result = await Notification.requestPermission()
      setPermission(result)
      setShowPrompt(false)

      if (result === "granted") {
        // Register for push notifications
        if ("serviceWorker" in navigator) {
          const registration = await navigator.serviceWorker.ready
          // Here you would typically subscribe to push notifications
          // and send the subscription to your server
          console.log("Push notifications enabled")
        }
      }
    }
  }

  const handleDismiss = () => {
    setShowPrompt(false)
    localStorage.setItem("notificationPromptDismissed", "true")
  }

  if (!showPrompt || permission !== "default") {
    return null
  }

  return (
    <Card className="fixed bottom-20 md:bottom-6 left-4 right-4 md:left-auto md:right-6 md:w-80 z-50 bg-white/95 backdrop-blur-sm border-white/20 shadow-lg">
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg text-[#DC143C]">Stay Updated</CardTitle>
          <Button variant="ghost" size="sm" onClick={handleDismiss}>
            <X className="h-4 w-4" />
          </Button>
        </div>
        <CardDescription>Get notified about spending reminders and budget alerts</CardDescription>
      </CardHeader>
      <CardContent className="pt-0 space-y-2">
        <Button onClick={requestPermission} className="w-full bg-[#DC143C] hover:bg-[#F75270]">
          <Bell className="h-4 w-4 mr-2" />
          Enable Notifications
        </Button>
        <Button variant="outline" onClick={handleDismiss} className="w-full bg-transparent">
          <BellOff className="h-4 w-4 mr-2" />
          Maybe Later
        </Button>
      </CardContent>
    </Card>
  )
}
