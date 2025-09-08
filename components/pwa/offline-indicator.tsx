"use client";

import { useState, useEffect } from "react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Wifi, WifiOff } from "lucide-react";

export function OfflineIndicator() {
    const [isOnline, setIsOnline] = useState(true);
    const [showOfflineMessage, setShowOfflineMessage] = useState(false);

    useEffect(() => {
        const handleOnline = () => {
            setIsOnline(true);
            setShowOfflineMessage(false);
        };

        const handleOffline = () => {
            setIsOnline(false);
            setShowOfflineMessage(true);
        };

        // Set initial state
        setIsOnline(navigator.onLine);

        window.addEventListener("online", handleOnline);
        window.addEventListener("offline", handleOffline);

        return () => {
            window.removeEventListener("online", handleOnline);
            window.removeEventListener("offline", handleOffline);
        };
    }, []);

    if (!showOfflineMessage) {
        return null;
    }

    return (
        <Alert className="fixed top-16 md:top-20 left-4 right-4 z-50 bg-yellow-50 border-yellow-200">
            <WifiOff className="h-4 w-4" />
            <AlertDescription className="flex items-center justify-between">
                <span>You&apos;re offline. Some features may be limited.</span>
                {isOnline && (
                    <div className="flex items-center text-green-600">
                        <Wifi className="h-4 w-4 mr-1" />
                        <span className="text-sm">Back online</span>
                    </div>
                )}
            </AlertDescription>
        </Alert>
    );
}
