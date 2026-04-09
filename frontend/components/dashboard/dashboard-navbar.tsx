"use client"

import { Search, Bell, User, LogOut, Settings, CreditCard, ChevronDown } from "lucide-react"
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
import { SidebarTrigger } from "@/components/ui/sidebar"
import { useState } from "react"
import { cn } from "@/lib/utils"

interface DashboardNavbarProps {
    className?: string
}

export function DashboardNavbar({ className }: DashboardNavbarProps) {
    const [isSearchFocused, setIsSearchFocused] = useState(false)

    return (
        <header className={cn(
            "sticky top-0 h-16 border-b border-white/5 bg-white/5 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-300",
            className
        )}>
            <div className="flex items-center gap-4 flex-1">
                <SidebarTrigger className="text-slate-500 hover:text-slate-900 hover:bg-slate-100" />

                {/* Global Search Bar */}
                <div className={cn(
                    "relative group transition-all duration-300 max-w-md w-full",
                    isSearchFocused ? "max-w-xl" : "max-w-[12rem] sm:max-w-xs"
                )}>
                    <Search className={cn(
                        "absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 transition-colors",
                        isSearchFocused ? "text-sky-500" : "text-slate-400"
                    )} />
                    <Input
                        placeholder="Search for students, courses, lessons..."
                        className="bg-slate-100/50 border-slate-200 text-slate-900 placeholder:text-slate-400 pl-10 h-10 rounded-xl focus:ring-sky-500/20 focus:bg-white focus:border-sky-300 transition-all border shadow-none"
                        onFocus={() => setIsSearchFocused(true)}
                        onBlur={() => setIsSearchFocused(false)}
                    />
                </div>
            </div>

            <div className="flex items-center gap-2 md:gap-4">
                {/* Notifications */}
                <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl">
                    <Bell className="w-5 h-5" />
                    <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-sky-500 rounded-full border-2 border-white" />
                </Button>

                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-10 pl-1 pr-2 py-1 gap-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors group">
                            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                SJ
                            </div>
                            <span className="text-sm font-bold hidden md:inline-block">Sarah Jones</span>
                            <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-900 rounded-xl p-2 shadow-2xl backdrop-blur-xl bg-white/90">
                        <DropdownMenuLabel className="font-normal p-2">
                            <div className="flex flex-col space-y-1">
                                <p className="text-sm font-bold leading-none">Sarah Jones</p>
                                <p className="text-xs leading-none text-slate-500">sarah.j@example.com</p>
                            </div>
                        </DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium">
                            <User className="w-4 h-4 text-slate-400" />
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
            </div>
        </header>
    )
}
