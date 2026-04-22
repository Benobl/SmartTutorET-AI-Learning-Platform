"use client"

import { useState, useEffect } from "react"
import { usePathname, useRouter } from "next/navigation"
import {
    Search,
    Download,
    FileText,
    Calendar
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { exportToCSV, exportToPDF } from "@/lib/admin-utils"
import { adminUserList, adminTutorList, adminManagerList, contentFlags } from "@/lib/admin-mock-data"

export default function AdminLayout({ children }: { children: React.ReactNode }) {
    return (
        <div className="flex flex-col min-h-screen bg-[#f8f9fa] transition-all duration-500">
            {/* ── Main Content Area ── */}
            <main className="flex-1 p-8 pt-6 relative overflow-hidden">
                {/* Decorative elements */}
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-blue-100/20 blur-[120px] rounded-full pointer-events-none -z-10" />
                <div className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-100/20 blur-[120px] rounded-full pointer-events-none -z-10" />

                <div className="max-w-[1600px] mx-auto animate-in fade-in slide-in-from-bottom-4 duration-700">
                    {children}
                </div>
            </main>
        </div>
    )
}
