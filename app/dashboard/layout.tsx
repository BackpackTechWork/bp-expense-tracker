import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { UserNavigation } from "@/components/user/user-navigation";
import { InstallPrompt } from "@/components/pwa/install-prompt";
import { OfflineIndicator } from "@/components/pwa/offline-indicator";
import { PushNotifications } from "@/components/pwa/push-notifications";
import { SyncIndicator } from "@/components/pwa/sync-indicator";

export default async function DashboardLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session) {
        redirect("/auth/signin");
    }

    if (session.user.role === "ADMIN") {
        redirect("/admin");
    }

    return (
        <div className="min-h-screen bg-gradient-to-br from-[#FDEBD0] to-[#F7CAC9]">
            <UserNavigation />
            <main className="pb-20 md:pb-6">{children}</main>

            <OfflineIndicator />
            <InstallPrompt />
            <PushNotifications />
            <SyncIndicator />
        </div>
    );
}
