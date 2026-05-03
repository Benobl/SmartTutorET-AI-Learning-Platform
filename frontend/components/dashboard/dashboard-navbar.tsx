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
import { useRouter } from "next/navigation"
import { cn } from "@/lib/utils"
import { logoutUser, getCurrentUser } from "@/lib/auth-utils"
import Image from "next/image"
import Link from "next/link"

interface DashboardNavbarProps {
    className?: string
}

export function DashboardNavbar({ className }: DashboardNavbarProps) {
    const router = useRouter()
    const { toggleSidebar, isMobile } = useSidebar()
    const [isSearchFocused, setIsSearchFocused] = useState(false)
    const [user, setUser] = useState<any>(null)
    const [isMounted, setIsMounted] = useState(false)
    const [invites, setInvites] = useState<any[]>([])

    useEffect(() => {
        setIsMounted(true)
        const currentUser = getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
            const fetchInvites = async () => {
                try {
                    const { inviteApi } = await import("@/lib/api")
                    const res = await inviteApi.getMine()
                    const incoming = (res.data || []).filter((inv: any) => {
                        const inviteeId = (inv.invitee?._id || inv.invitee)?.toString()
                        return (inviteeId === currentUser._id || inviteeId === currentUser.id) && inv.status === "pending"
                    })
                    setInvites(incoming)
                } catch (e) { console.error("Error fetching invites:", e) }
            }
            fetchInvites()

            // Socket Listener
            const { initializeSocket } = require("@/lib/socket")
            const socket = initializeSocket(currentUser._id || currentUser.id)
            socket.on("new-invite", (data: any) => {
                setInvites(prev => [data, ...prev])
                // Optional: trigger a sound or browser notification
            })
            
            socket.on("squad-live-notification", (data: any) => {
                const { toast } = require("@/hooks/use-toast")
                toast({
                    title: "🔴 Live Session Started!",
                    description: data.message || `Live class started in ${data.squadName}!`,
                    action: (
                        <Button variant="default" size="sm" onClick={() => router.push('/dashboard/student/squad')}>
                            Join Now
                        </Button>
                    ),
                    duration: 10000,
                })
            })

            return () => {
                socket.off("new-invite")
                socket.off("squad-live-notification")
            }
        }
    }, [])

    const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
        try {
            const { inviteApi, groupApi } = await import("@/lib/api")
            await inviteApi.respond(inviteId, status)
            setInvites(prev => prev.filter(inv => inv._id !== inviteId))
            if (status === 'accepted') {
                router.push('/dashboard/student/squad')
            }
        } catch (e) { console.error("Error responding to invite:", e) }
    }

    const handleLogout = () => {
        logoutUser()
        router.push("/")
    }

    const handleProfile = () => {
        const role = user?.role || 'student'
        router.push(`/dashboard/${role}/settings`) // Defaulting to settings as profile view
    }

    const handleSettings = () => {
        const role = user?.role || 'student'
        router.push(`/dashboard/${role}/settings`)
    }

    const displayName = user?.fullName || `${user?.firstName || ""} ${user?.lastName || ""}`.trim() || "User"
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase() || "U"
    const fullName = displayName
    const email = user ? user.email : "user@example.com"

    return (
        <header className={cn(
            "sticky top-0 h-16 border-b border-white/5 bg-white/5 backdrop-blur-xl z-50 px-4 md:px-8 flex items-center justify-between transition-all duration-300",
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
                            className="text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl"
                        >
                            <Menu className="w-6 h-6" />
                        </Button>
                        <Link href="/" className="flex items-center gap-2">
                            <div className="w-8 h-8 rounded-lg bg-white flex items-center justify-center shadow-lg border border-slate-100 shrink-0 overflow-hidden">
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
                {/* Notifications & Invites */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            {invites.length > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-amber-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center animate-pulse">
                                    {invites.length}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 text-slate-900 rounded-2xl p-2 shadow-2xl backdrop-blur-xl bg-white/90">
                        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-slate-400 p-2">Squad Invitations</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        {invites.length === 0 ? (
                            <div className="py-8 px-4 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending transmissions...</p>
                            </div>
                        ) : (
                            <div className="max-h-[300px] overflow-y-auto custom-scrollbar space-y-1 p-1">
                                {invites.map((invite: any) => (
                                    <div key={invite._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-amber-100 text-amber-600 flex items-center justify-center font-black text-[10px]">
                                                {invite.inviter?.fullName?.[0] || "U"}
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate italic">{invite.inviter?.fullName}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase truncate">To {invite.targetId?.name || "Squad"}</p>
                                            </div>
                                        </div>
                                        <div className="flex gap-2">
                                            <Button
                                                size="sm"
                                                onClick={() => handleRespond(invite._id, 'accepted')}
                                                className="flex-1 h-8 bg-sky-600 hover:bg-sky-700 text-white font-black text-[9px] uppercase rounded-lg"
                                            >
                                                Join
                                            </Button>
                                            <Button
                                                size="sm"
                                                variant="ghost"
                                                onClick={() => handleRespond(invite._id, 'declined')}
                                                className="flex-1 h-8 text-slate-400 hover:text-rose-600 hover:bg-rose-50 font-black text-[9px] uppercase rounded-lg"
                                            >
                                                Skip
                                            </Button>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/student/squad')} className="justify-center text-[10px] font-black uppercase text-sky-600 focus:text-sky-700 cursor-pointer py-2">
                            View All Squads
                        </DropdownMenuItem>
                    </DropdownMenuContent>
                </DropdownMenu>

                {isMounted && (
                    <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                            <Button variant="ghost" className="h-10 pl-1 pr-2 py-1 gap-2 rounded-xl hover:bg-slate-100 text-slate-600 hover:text-slate-900 transition-colors group">
                                <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-white font-bold text-xs shadow-md">
                                    {initials}
                                </div>
                                <span className="text-sm font-bold hidden md:inline-block">{fullName}</span>
                                <ChevronDown className="w-4 h-4 opacity-40 group-hover:opacity-100 transition-opacity" />
                            </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent align="end" className="w-56 bg-white border-slate-200 text-slate-900 rounded-xl p-2 shadow-2xl backdrop-blur-xl bg-white/90">
                            <DropdownMenuLabel className="font-normal p-2">
                                <div className="flex flex-col space-y-1">
                                    <p className="text-sm font-bold leading-none">{fullName}</p>
                                    <p className="text-xs leading-none text-slate-500">{email}</p>
                                </div>
                            </DropdownMenuLabel>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                                onClick={handleProfile}
                                className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium"
                            >
                                <User className="w-4 h-4 text-slate-400" />
                                <span>My Profile</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium">
                                <CreditCard className="w-4 h-4 text-slate-400" />
                                <span>Subscription</span>
                            </DropdownMenuItem>
                            <DropdownMenuItem
                                onClick={handleSettings}
                                className="rounded-lg focus:bg-slate-100 focus:text-slate-900 flex items-center gap-2 py-2 cursor-pointer font-medium"
                            >
                                <Settings className="w-4 h-4 text-slate-400" />
                                <span>Settings</span>
                            </DropdownMenuItem>
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg focus:bg-red-50 focus:text-red-600 flex items-center gap-2 py-2 cursor-pointer text-red-600 font-medium"
                            >
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
