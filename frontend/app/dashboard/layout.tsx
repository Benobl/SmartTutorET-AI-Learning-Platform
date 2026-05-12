"use client"
import React from "react"

import { SidebarInset, SidebarProvider } from "@/components/ui/sidebar"
import { DashboardSidebar } from "@/components/dashboard/dashboard-sidebar"
import { DashboardNavbar } from "@/components/dashboard/dashboard-navbar"
import { useSessionTimeout } from "@/hooks/use-session-timeout"
import { AuthGuard } from "@/components/auth/AuthGuard"
import { StreamProvider } from "@/components/providers/StreamProvider"
import { GlobalAITutor } from "@/components/global/global-ai-tutor"

/**
 * Dashboard layout wrapper — provides sidebar, navbar, breadcrumbs,
 * and session timeout management across all dashboard pages.
 */
function SessionTimeoutBanner() {
    const { showWarning, remainingSeconds, extendSession } = useSessionTimeout()

    if (!showWarning) return null

    return (
        <div className="sticky top-0 left-0 right-0 z-[70] bg-amber-500/95 backdrop-blur-xl text-black py-3 px-6 flex items-center justify-between animate-in slide-in-from-top duration-300">
            <p className="text-sm font-semibold">
                ⚠️ Your session will expire in <strong>{remainingSeconds}s</strong>. Click below to stay logged in.
            </p>
            <button
                onClick={extendSession}
                className="px-4 py-1.5 bg-black/20 hover:bg-black/30 rounded-lg text-sm font-bold transition-colors"
            >
                Extend Session
            </button>
        </div>
    )
}

export default function DashboardLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const [isMounted, setIsMounted] = React.useState(false)

    React.useEffect(() => {
        setIsMounted(true)
    }, [])

    if (!isMounted) {
        return (
            <div className="flex h-screen w-screen items-center justify-center bg-slate-50 dark:bg-[#0a0e27]">
                <div className="flex flex-col items-center gap-4">
                    <div className="h-10 w-10 animate-spin rounded-full border-4 border-blue-500 border-t-transparent" />
                    <p className="text-sm font-bold text-slate-500 uppercase tracking-widest animate-pulse">Initializing Interface...</p>
                </div>
            </div>
        )
    }

    return (
        <AuthGuard>
            <StreamProvider>
                <SidebarProvider>
                    <div className="flex h-screen w-full bg-[#f8f9fa] text-slate-900 overflow-hidden relative">
                        <DashboardSidebar />
                        <SidebarInset className="flex-1 flex flex-col bg-[#f8f9fa] overflow-y-auto custom-scrollbar relative">
                            <SessionTimeoutBanner />
                            <DashboardNavbar />
                            <div className="p-4 md:p-8">
                                <div className="max-w-7xl mx-auto">
                                    {children}
                                </div>
                            </div>
                        </SidebarInset>
                        <GlobalAITutor />
                    </div>
                </SidebarProvider>
            </StreamProvider>
        </AuthGuard>
    )
}
