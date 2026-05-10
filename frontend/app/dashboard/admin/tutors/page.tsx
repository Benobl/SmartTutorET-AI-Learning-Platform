"use client"

import { useState, useEffect } from "react"
import { 
    GraduationCap, Search, CheckCircle2, XCircle, 
    Loader2, RefreshCw, BookOpen, Users, Clock
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { adminApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminTutorManagement() {
    const [allTutors, setAllTutors] = useState<any[]>([])
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState<"all" | "pending">("all")

    const fetchTutors = async () => {
        try {
            setLoading(true)
            const [allRes, pendingRes] = await Promise.allSettled([
                adminApi.getUsers(),
                adminApi.getPendingTutors()
            ])

            if (allRes.status === "fulfilled") {
                const users = allRes.value?.data || []
                setAllTutors(users.filter((u: any) => u.role === "tutor"))
            }
            if (pendingRes.status === "fulfilled") {
                setPendingTutors(pendingRes.value?.data || [])
            }
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load tutors.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchTutors() }, [])

    const handleApprove = async (id: string) => {
        try {
            await adminApi.approveTutor(id)
            toast({ title: "Tutor Approved ✓", description: "The educator has been granted platform access.", className: "bg-emerald-500 text-white" })
            fetchTutors()
        } catch (error: any) {
            toast({ title: "Approval Failed", description: error.message, variant: "destructive" })
        }
    }

    const handleReject = async (id: string) => {
        try {
            await adminApi.rejectTutor(id, "Application does not meet platform requirements.")
            toast({ title: "Tutor Rejected", description: "The application has been declined.", variant: "destructive" })
            fetchTutors()
        } catch (error: any) {
            toast({ title: "Rejection Failed", description: error.message, variant: "destructive" })
        }
    }

    const displayList = (activeTab === "all" ? allTutors : pendingTutors).filter(t =>
        t.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    const approvedCount = allTutors.filter(t => t.tutorStatus === "approved").length

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Educator Registry</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        All <span className="font-semibold text-slate-900">Tutors</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Verify, manage and monitor all educators on the platform.
                    </p>
                </div>
                <Button
                    onClick={fetchTutors}
                    variant="outline"
                    className="rounded-2xl h-12 px-6 border-slate-100 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all text-slate-500 font-bold text-xs uppercase tracking-widest"
                >
                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Refresh
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 px-4">
                {[
                    { label: "Total Tutors", value: allTutors.length, icon: GraduationCap, color: "sky" },
                    { label: "Approved", value: approvedCount, icon: CheckCircle2, color: "emerald" },
                    { label: "Pending Review", value: pendingTutors.length, icon: Clock, color: "amber" },
                ].map((stat, i) => (
                    <div key={i} className="p-7 rounded-[24px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-200 flex items-center gap-5">
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            stat.color === "sky" ? "bg-sky-50 text-sky-500" :
                            stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" : "bg-amber-50 text-amber-500"
                        )}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-2xl font-bold text-slate-900">{loading ? "—" : stat.value}</p>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Tab + Search */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
                <div className="flex bg-slate-100 rounded-2xl p-1.5">
                    {(["all", "pending"] as const).map(tab => (
                        <button
                            key={tab}
                            onClick={() => setActiveTab(tab)}
                            className={cn(
                                "px-5 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                activeTab === tab
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {tab === "all" ? `All Tutors (${allTutors.length})` : `Pending (${pendingTutors.length})`}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search tutors..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="mx-4 rounded-[28px] bg-white border border-slate-100 shadow-sm overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {["Educator", "Email", "Subjects", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left py-5 px-7 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(4).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={5} className="p-6">
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : displayList.length === 0 ? (
                                <tr>
                                    <td colSpan={5} className="py-20 text-center">
                                        <GraduationCap className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">
                                            {activeTab === "pending" ? "No pending applications" : "No tutors found"}
                                        </p>
                                    </td>
                                </tr>
                            ) : displayList.map((tutor: any) => (
                                <tr key={tutor._id} className="hover:bg-slate-50/50 transition-all group">
                                    <td className="py-5 px-7">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-sky-600 font-black text-sm group-hover:scale-105 transition-transform">
                                                {tutor.name?.charAt(0)?.toUpperCase()}
                                            </div>
                                            <div>
                                                <p className="text-sm font-bold text-slate-900">{tutor.name}</p>
                                                <p className="text-[10px] text-slate-400">{tutor.tutorProfile?.qualification || "Educator"}</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="py-5 px-7">
                                        <p className="text-xs text-slate-500 font-medium">{tutor.email}</p>
                                    </td>
                                    <td className="py-5 px-7">
                                        <div className="flex items-center gap-1.5 text-slate-400">
                                            <BookOpen className="w-3.5 h-3.5" />
                                            <span className="text-xs font-medium">{tutor.subjects?.length || "—"}</span>
                                        </div>
                                    </td>
                                    <td className="py-5 px-7">
                                        <span className={cn(
                                            "inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                            tutor.tutorStatus === "approved"
                                                ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                : tutor.tutorStatus === "rejected"
                                                ? "bg-rose-50 text-rose-600 border border-rose-100"
                                                : "bg-amber-50 text-amber-600 border border-amber-100"
                                        )}>
                                            {tutor.tutorStatus || "pending"}
                                        </span>
                                    </td>
                                    <td className="py-5 px-7">
                                        <div className="flex items-center gap-2">
                                            {tutor.tutorStatus !== "approved" && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleApprove(tutor._id)}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl shadow-sm transition-all active:scale-95"
                                                >
                                                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                                                    Approve
                                                </Button>
                                            )}
                                            {tutor.tutorStatus !== "rejected" && (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleReject(tutor._id)}
                                                    className="border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-400 font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl transition-all"
                                                >
                                                    <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                                    Reject
                                                </Button>
                                            )}
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    )
}
