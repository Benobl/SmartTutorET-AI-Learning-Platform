"use client"

import { Search, Bell, User, LogOut, Settings, CreditCard, ChevronDown, Menu } from "lucide-react"
import { Input } from "@/components/ui/input"
import {
    DropdownMenu,
    DropdownMenuContent,
    DropdownMenuItem,
    DropdownMenuLabel,
    DropdownMenuSeparator,
    DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Button } from "@/components/ui/button"
import { useSidebar } from "@/components/ui/sidebar"
import { useState, useEffect } from "react"
import { cn } from "@/lib/utils"
import Image from "next/image"
import Link from "next/link"

interface DashboardNavbarProps {
    className?: string
}

export function DashboardNavbar({ className }: DashboardNavbarProps) {
    const { toggleSidebar, isMobile } = useSidebar()
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isMounted, setIsMounted] = useState(false)

    useEffect(() => {
        setIsMounted(true)
        // Get user from auth-utils
        const { getCurrentUser } = require("@/lib/auth-utils")
        setUser(getCurrentUser())
    }, [])

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "A"
    const fullName = user ? `${user.firstName} ${user.lastName}` : "Authenticated User"
    const email = user ? user.email : "user@example.com"

    return (
        <header className={cn(
            "sticky top-0 h-16 border-b border-border bg-background/80 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-300",
            className
        )}>
            <div className="flex items-center gap-4 flex-1">
                {/* Mobile Menu Trigger & Logo */}
                {isMobile && (
                    <div className="flex items-center gap-3">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={toggleSidebar}
                            className="text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl"
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-card flex items-center justify-center shadow-lg border border-border shrink-0 overflow-hidden">
                                <Image src="/logo.png" alt="Logo" width={32} height={32} />
                            </div>
                        </Link>
                    </div>
                )}

                {/* Global Search Bar */}
                <div className={cn(
                    "relative group transition-all duration-300 max-w-md w-full",
                    isSearchFocused ? "max-w-xl" : "max-w-[12rem] sm:max-w-xs"
                )}>
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        isSearchFocused ? "text-sky-500" : "text-muted-foreground"
                    )} />
                    <Input
                        placeholder="Search for students, courses, lessons..."
                        className="bg-muted/50 border-border text-foreground placeholder:text-muted-foreground pl-10 h-10 rounded-xl focus:ring-sky-500/20 focus:bg-card focus:border-sky-300 transition-all border shadow-none"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-muted-foreground hover:text-foreground hover:bg-accent rounded-xl">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-background" />
                </Button>

                {isMounted && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 pl-1 pr-2 py-1 gap-2 rounded-xl hover:bg-accent text-muted-foreground hover:text-foreground transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    {initials}
                                </div>
                                <span className="text-sm font-bold hidden md:inline-block">{fullName}</span>
                                <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-card border-border text-foreground rounded-xl p-2 shadow-2xl backdrop-blur-xl bg-card/90">
                            <DropdownMenuLabel className="font-normal p-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none">{fullName}</p>
                                    <p className="text-xs leading-none text-muted-foreground">{email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-border" />
                            <DropdownMenuItem className="rounded-lg focus:bg-accent focus:text-foreground flex items-center gap-2 py-2 cursor-pointer font-medium">
                                <User className="w-4 h-4 text-muted-foreground" />
                                <span>My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span>Subscription</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium">
                                <Settings className="w-4 h-4 text-slate-400" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem className="rounded-lg focus:bg-red-50 focus:text-red-600 flex items-center gap-2 py-2 cursor-pointer text-red-600 font-medium">
                                <LogOut className="w-4 h-4" />
                                <span>Log out</span>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>
    )
}
