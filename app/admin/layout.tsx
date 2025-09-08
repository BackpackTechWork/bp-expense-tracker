import type React from "react";
import { redirect } from "next/navigation";
import { auth } from "@/auth";
import { AdminSidebar } from "@/components/admin/admin-sidebar";

export default async function AdminLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const session = await auth();

    if (!session || session.user.role !== "ADMIN") {
        redirect("/auth/signin");
    }

    return (
        <div className="flex h-screen bg-white min-h-screen light">
            <AdminSidebar />
            <main className="flex-1 overflow-y-auto bg-gray-50 min-h-screen">
                <div className="p-6 bg-gray-50 min-h-full">{children}</div>
            </main>
        </div>
    );
}
