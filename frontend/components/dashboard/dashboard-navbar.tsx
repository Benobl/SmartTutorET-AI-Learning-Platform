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
    const [notifications, setNotifications] = useState<any[]>([])
    const [gamification, setGamification] = useState<any>(null)

    useEffect(() => {
        setIsMounted(true)
        const currentUser = getCurrentUser()
        setUser(currentUser)

        if (currentUser) {
            const fetchData = async () => {
                try {
                    const { inviteApi, notificationApi, gamificationApi } = await import("@/lib/api")
                    const [invRes, notifRes, gamifRes] = await Promise.all([
                        inviteApi.getMine(),
                        notificationApi.getMine(),
                        gamificationApi.getProfile().catch(() => ({ data: null }))
                    ])
                    
                    if (gamifRes?.data) setGamification(gamifRes.data)
                    
                    // Filter pending invites
                    const incomingInvites = (invRes.data || []).filter((inv: any) => {
                        const inviteeId = (inv.invitee?._id || inv.invitee)?.toString()
                        return (inviteeId === currentUser._id || inviteeId === currentUser.id) && inv.status === "pending"
                    })
                    setInvites(incomingInvites)

                    // Filter unread notifications
                    const unreadNotifs = (notifRes.data || []).filter((n: any) => !n.isRead)
                    setNotifications(unreadNotifs)
                } catch (e) { console.error("Error fetching dashboard data:", e) }
            }
            fetchData()

            // Socket Listener
            const { initializeSocket } = require("@/lib/socket")
            const socket = initializeSocket(currentUser._id || currentUser.id)
            
            socket.on("new-invite", (data: any) => {
                setInvites(prev => [data, ...prev])
            })

            socket.on("new-notification", (data: any) => {
                setNotifications(prev => [data, ...prev])
                const { toast } = require("sonner")
                toast.info("New Notification", {
                    description: data.message,
                    className: "rounded-[20px] border-none shadow-2xl bg-white text-slate-900 font-bold",
                })
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
                socket.off("new-notification")
                socket.off("squad-live-notification")
            }
        }
    }, [])

    const handleRespond = async (inviteId: string, status: 'accepted' | 'declined') => {
        try {
            const { inviteApi } = await import("@/lib/api")
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
        router.push(`/dashboard/${role}/profile`)
    }

    const displayName = user?.name || "User"
    const initials = displayName.split(" ").filter(Boolean).slice(0, 2).map((n: string) => n[0]).join("").toUpperCase() || "U"
    const fullName = displayName
    const email = user ? user.email : "user@example.com"
    const totalAlerts = invites.length + notifications.length

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
                {/* Gamification Indicator */}
                {gamification && user?.role === 'student' && (
                    <Link href="/dashboard/student/gamification" className="hidden md:flex items-center gap-3 px-4 py-1.5 rounded-full bg-slate-50 border border-slate-100 hover:bg-sky-50 hover:border-sky-200 transition-all cursor-pointer group">
                        <div className="flex flex-col items-end">
                            <span className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-500 transition-colors">Lvl {gamification.level}</span>
                            <span className="text-xs font-black text-slate-800 italic">{gamification.xp} XP</span>
                        </div>
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-amber-400 to-orange-500 text-white flex items-center justify-center font-black text-xs shadow-md shadow-orange-500/20 group-hover:scale-110 transition-transform">
                            🔥
                        </div>
                        <div className="flex flex-col">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Streak</span>
                            <span className="text-[11px] font-black text-orange-500">{gamification.currentStreak} Days</span>
                        </div>
                    </Link>
                )}

                {/* Notifications & Invites */}
                <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="relative text-slate-500 hover:text-slate-900 hover:bg-slate-100 rounded-xl transition-all">
                            <Bell className="w-5 h-5" />
                            {totalAlerts > 0 && (
                                <span className="absolute top-2 right-2 w-4 h-4 bg-rose-500 rounded-full border-2 border-white text-[8px] font-black text-white flex items-center justify-center animate-pulse">
                                    {totalAlerts}
                                </span>
                            )}
                        </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end" className="w-80 bg-white border-slate-200 text-slate-900 rounded-2xl p-2 shadow-2xl backdrop-blur-xl bg-white/90">
                        <DropdownMenuLabel className="font-black text-[10px] uppercase tracking-widest text-slate-400 p-2">Intelligence Hub</DropdownMenuLabel>
                        <DropdownMenuSeparator className="bg-slate-100" />
                        
                        {totalAlerts === 0 ? (
                            <div className="py-8 px-4 text-center">
                                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">No pending updates...</p>
                            </div>
                        ) : (
                            <div className="max-h-[400px] overflow-y-auto custom-scrollbar space-y-1 p-1">
                                {/* Invites Section */}
                                {invites.map((invite: any) => (
                                    <div key={invite._id} className="p-3 rounded-xl bg-sky-50/50 border border-sky-100 space-y-3">
                                        <div className="flex items-center gap-3">
                                            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center font-black text-[10px]">
                                                INV
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate italic">{invite.inviter?.fullName || "A Colleague"}</p>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase truncate">Squad Invitation</p>
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

                                {/* Notifications Section */}
                                {notifications.map((notif: any) => (
                                    <div key={notif._id} className="p-3 rounded-xl bg-slate-50 border border-slate-100 flex gap-3 items-start">
                                        <div className="w-8 h-8 rounded-lg bg-slate-200 text-slate-500 flex items-center justify-center shrink-0">
                                            <Bell className="w-4 h-4" />
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="text-xs font-bold text-slate-800 leading-tight">{notif.message}</p>
                                            <p className="text-[9px] font-medium text-slate-400 mt-1 uppercase tracking-widest">System Update</p>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        )}
                        
                        <DropdownMenuSeparator className="bg-slate-100" />
                        <DropdownMenuItem onClick={() => router.push('/dashboard/student/squad')} className="justify-center text-[10px] font-black uppercase text-sky-600 focus:text-sky-700 cursor-pointer py-2">
                            Advanced Intelligence Settings
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
                                className="rounded-lg focus:bg-sky-50 focus:text-sky-600 flex items-center gap-3 py-3 px-3 cursor-pointer group transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-colors">
                                    <User className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">View My Profile</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Account Settings</span>
                                </div>
                            </DropdownMenuItem>
                            
                            <DropdownMenuSeparator className="bg-slate-100" />
                            <DropdownMenuItem
                                onClick={handleLogout}
                                className="rounded-lg focus:bg-rose-50 focus:text-rose-600 flex items-center gap-3 py-3 px-3 cursor-pointer group transition-all"
                            >
                                <div className="w-8 h-8 rounded-lg bg-rose-100 text-rose-600 flex items-center justify-center group-hover:bg-rose-600 group-hover:text-white transition-colors">
                                    <LogOut className="w-4 h-4" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-black uppercase tracking-widest text-slate-900">Sign Out</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase">Secure Terminate</span>
                                </div>
                            </DropdownMenuItem>
                        </DropdownMenuContent>
                    </DropdownMenu>
                )}
            </div>
        </header>

    )
}
