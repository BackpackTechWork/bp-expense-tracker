"use client";

import { useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useSession, signOut } from "next-auth/react";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { cn } from "@/lib/utils";
import {
    Home,
    Plus,
    BarChart3,
    Target,
    Settings,
    LogOut,
    Shield,
    List,
} from "lucide-react";

const navigation = [
    {
        name: "Dashboard",
        href: "/dashboard",
        icon: Home,
        shortName: "Dashboard",
    },
    {
        name: "Expenses",
        href: "/dashboard/expenses",
        icon: List,
        shortName: "Expenses",
    },
    {
        name: "Analytics",
        href: "/dashboard/analytics",
        icon: BarChart3,
        shortName: "Analytic",
    },
    {
        name: "Goals",
        href: "/dashboard/goals",
        icon: Target,
        shortName: "Goal",
    },
];

export function UserNavigation() {
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
    const pathname = usePathname();
    const { data: session } = useSession();

    return (
        <>
            {/* Desktop Header */}
            <header className="hidden md:block bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center space-x-6">
                            <Link
                                href="/dashboard"
                                className="text-xl font-bold text-[#DC143C] whitespace-nowrap"
                            >
                                ExpenseTracker
                            </Link>
                            <nav className="flex space-x-1">
                                {navigation.map((item) => {
                                    const isActive = pathname === item.href;
                                    return (
                                        <Link
                                            key={item.name}
                                            href={item.href}
                                            className={cn(
                                                "flex items-center px-3 py-2 text-sm font-medium rounded-lg transition-colors whitespace-nowrap",
                                                isActive
                                                    ? "bg-[#DC143C] text-white"
                                                    : "text-gray-700 hover:bg-[#F7CAC9] hover:text-[#DC143C]"
                                            )}
                                        >
                                            <item.icon className="mr-1.5 h-4 w-4" />
                                            {item.name}
                                        </Link>
                                    );
                                })}
                            </nav>
                        </div>

                        <DropdownMenu>
                            <DropdownMenuTrigger asChild>
                                <Button
                                    variant="ghost"
                                    className="relative h-8 w-8 rounded-full"
                                >
                                    <Avatar className="h-8 w-8">
                                        <AvatarImage
                                            src={session?.user?.image || ""}
                                            alt={session?.user?.name || ""}
                                        />
                                        <AvatarFallback className="bg-[#DC143C] text-white">
                                            {session?.user?.name?.charAt(0) ||
                                                session?.user?.email?.charAt(
                                                    0
                                                ) ||
                                                "U"}
                                        </AvatarFallback>
                                    </Avatar>
                                </Button>
                            </DropdownMenuTrigger>
                            <DropdownMenuContent
                                className="w-56"
                                align="end"
                                forceMount
                            >
                                <div className="flex items-center justify-start gap-2 p-2">
                                    <div className="flex flex-col space-y-1 leading-none">
                                        {session?.user?.name && (
                                            <p className="font-medium">
                                                {session.user.name}
                                            </p>
                                        )}
                                        {session?.user?.email && (
                                            <p className="w-[200px] truncate text-sm text-muted-foreground">
                                                {session.user.email}
                                            </p>
                                        )}
                                    </div>
                                </div>
                                <DropdownMenuSeparator />
                                {(session?.user as any)?.role === "ADMIN" && (
                                    <DropdownMenuItem asChild>
                                        <Link href="/admin">
                                            <Shield className="mr-2 h-4 w-4" />
                                            Admin Dashboard
                                        </Link>
                                    </DropdownMenuItem>
                                )}
                                <DropdownMenuItem asChild>
                                    <Link href="/dashboard/settings">
                                        <Settings className="mr-2 h-4 w-4" />
                                        Settings
                                    </Link>
                                </DropdownMenuItem>
                                <DropdownMenuSeparator />
                                <DropdownMenuItem
                                    onClick={() =>
                                        signOut({ callbackUrl: "/" })
                                    }
                                >
                                    <LogOut className="mr-2 h-4 w-4" />
                                    Sign out
                                </DropdownMenuItem>
                            </DropdownMenuContent>
                        </DropdownMenu>
                    </div>
                </div>
            </header>

            {/* Mobile Bottom Navigation */}
            <nav className="md:hidden fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 shadow-lg">
                <div className="grid grid-cols-4 h-16">
                    {navigation.map((item, index) => {
                        const isActive = pathname === item.href;
                        return (
                            <Link
                                key={item.name}
                                href={item.href}
                                className={cn(
                                    "flex flex-col items-center justify-center space-y-1 text-xs font-medium transition-colors",
                                    isActive
                                        ? "text-[#DC143C] bg-[#FDEBD0]"
                                        : "text-gray-600 hover:text-[#DC143C]"
                                )}
                            >
                                <item.icon className="h-5 w-5" />
                                <span>{item.shortName}</span>
                            </Link>
                        );
                    })}
                </div>

                {/* Floating Add Button */}
                <Link
                    href="/dashboard/add"
                    className="absolute top-0 left-1/2 transform -translate-x-1/2 -translate-y-1/2 bg-[#DC143C] hover:bg-[#B91C1C] text-white rounded-full p-3 shadow-lg transition-colors z-10"
                >
                    <Plus className="h-6 w-6" />
                </Link>
            </nav>

            {/* Mobile Header */}
            <header className="md:hidden bg-white/90 backdrop-blur-sm border-b border-white/20 sticky top-0 z-40">
                <div className="flex justify-between items-center h-14 px-4">
                    <Link
                        href="/dashboard"
                        className="text-lg font-bold text-[#DC143C]"
                    >
                        ExpenseTracker
                    </Link>
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button
                                variant="ghost"
                                className="relative h-8 w-8 rounded-full"
                            >
                                <Avatar className="h-8 w-8">
                                    <AvatarImage
                                        src={session?.user?.image || ""}
                                        alt={session?.user?.name || ""}
                                    />
                                    <AvatarFallback className="bg-[#DC143C] text-white">
                                        {session?.user?.name?.charAt(0) ||
                                            session?.user?.email?.charAt(0) ||
                                            "U"}
                                    </AvatarFallback>
                                </Avatar>
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent
                            className="w-56"
                            align="end"
                            forceMount
                        >
                            <div className="flex items-center justify-start gap-2 p-2">
                                <div className="flex flex-col space-y-1 leading-none">
                                    {session?.user?.name && (
                                        <p className="font-medium">
                                            {session.user.name}
                                        </p>
                                    )}
                                    {session?.user?.email && (
                                        <p className="w-[200px] truncate text-sm text-muted-foreground">
                                            {session.user.email}
                                        </p>
                                    )}
                                </div>
                            </div>
                            <DropdownMenuSeparator />
                            {(session?.user as any)?.role === "ADMIN" && (
                                <DropdownMenuItem asChild>
                                    <Link href="/admin">
                                        <Shield className="mr-2 h-4 w-4" />
                                        Admin Dashboard
                                    </Link>
                                </DropdownMenuItem>
                            )}
                            <DropdownMenuItem asChild>
                                <Link href="/dashboard/settings">
                                    <Settings className="mr-2 h-4 w-4" />
                                    Settings
                                </Link>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator />
                            <DropdownMenuItem
                                onClick={() => signOut({ callbackUrl: "/" })}
                            >
                                <LogOut className="mr-2 h-4 w-4" />
                                Sign out
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                </div>
            </header>
        </>
    );
}
