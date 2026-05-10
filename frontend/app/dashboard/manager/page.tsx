"use client"

import { useState, useEffect } from "react"
import {
    Users, BookOpen, GraduationCap, ShieldCheck,
    CheckCircle2, Clock, ArrowRight, RefreshCw,
    FileText, UserCheck, XCircle, Loader2, ExternalLink
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { adminApi } from "@/lib/api"
import {
    getPendingTutors, getCourses, getJobs, getPendingSubjects,
    approveTutor, rejectTutor
} from "@/lib/manager-utils"
import Link from "next/link"
import { toast } from "sonner"
import {
    Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog"
import { Skeleton } from "@/components/ui/skeleton"

export default function ManagerDashboard() {
    const [loading, setLoading] = useState(true)
    const [stats, setStats] = useState({ students: 0, tutors: 0, courses: 0, pendingTutors: 0, pendingSubjects: 0, jobs: 0 })
    const [pendingTutors, setPendingTutors] = useState<any[]>([])
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [isProcessing, setIsProcessing] = useState(false)
    const [docType, setDocType] = useState<'degree' | 'cv' | null>(null)

    const refreshData = async () => {
        setLoading(true)
        try {
            const [statsRes, pending, courses, jobs, pendingSubjects] = await Promise.allSettled([
                adminApi.getStats(),
                getPendingTutors(),
                getCourses(),
                getJobs(),
                getPendingSubjects()
            ])

            const statsData = statsRes.status === "fulfilled" ? (statsRes.value?.data || {}) : {}
            const pendingList = pending.status === "fulfilled" ? (pending.value || []) : []
            const coursesList = courses.status === "fulfilled" ? (courses.value || []) : []
            const jobsList = jobs.status === "fulfilled" ? (jobs.value || []) : []
            const subjectsList = pendingSubjects.status === "fulfilled" ? (pendingSubjects.value || []) : []

            setStats({
                students: statsData.totalStudents || 0,
                tutors: statsData.totalTutors || 0,
                courses: coursesList.length,
                pendingTutors: pendingList.length,
                pendingSubjects: subjectsList.length,
                jobs: jobsList.length,
            })
            setPendingTutors(pendingList)
        } catch (e) {
            console.error("Dashboard load error:", e)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { refreshData() }, [])

    const handleAction = async (id: string, action: 'approve' | 'reject') => {
        setIsProcessing(true)
        try {
            if (action === 'approve') {
                await approveTutor(id)
                toast.success("Tutor approved successfully.")
            } else {
                const reason = window.prompt("Enter rejection reason (will be sent to the tutor):")
                if (reason === null) { setIsProcessing(false); return }
                await rejectTutor(id, reason)
                toast.error("Application rejected.")
            }
            setSelectedTutor(null)
            setDocType(null)
            await refreshData()
        } catch (error: any) {
            toast.error(error.message || "An error occurred.")
        } finally {
            setIsProcessing(false)
        }
    }

    const statCards = [
        { label: "Total Students", value: stats.students, icon: Users, color: "sky" },
        { label: "Active Tutors", value: stats.tutors, icon: GraduationCap, color: "emerald" },
        { label: "Active Courses", value: stats.courses, icon: BookOpen, color: "indigo" },
        { label: "Pending Tutors", value: stats.pendingTutors, icon: Clock, color: "amber" },
    ]

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Registrar Console</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Manager <span className="font-semibold text-slate-900">Overview</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Monitor institutional metrics, pending approvals, and curriculum status.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={refreshData}
                        variant="outline"
                        className="rounded-2xl h-12 px-5 border-slate-100 hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all text-slate-500"
                    >
                        <RefreshCw className={cn("w-4 h-4", loading && "animate-spin")} />
                    </Button>
                    <Link href="/dashboard/manager/jobs">
                        <Button className="rounded-2xl h-12 px-7 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200">
                            Post Job
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stat Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-5 px-4">
                {statCards.map((stat, i) => (
                    <div key={i} className="p-7 rounded-[24px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-200 flex items-center gap-5">
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            stat.color === "sky" ? "bg-sky-50 text-sky-500" :
                            stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" :
                            stat.color === "indigo" ? "bg-indigo-50 text-indigo-500" : "bg-amber-50 text-amber-500"
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

            {/* Quick Actions */}
            <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 px-4">
                {[
                    { label: "Curriculum Registry", href: "/dashboard/manager/courses", icon: BookOpen, count: stats.courses },
                    { label: "Tutor Approvals", href: "/dashboard/manager/tutors", icon: ShieldCheck, count: stats.pendingTutors, urgent: stats.pendingTutors > 0 },
                    { label: "Subject Requests", href: "/dashboard/manager/approvals/subjects", icon: FileText, count: stats.pendingSubjects, urgent: stats.pendingSubjects > 0 },
                ].map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "p-5 rounded-[20px] border transition-all duration-200 group cursor-pointer hover:shadow-md",
                            item.urgent
                                ? "bg-amber-50 border-amber-100 hover:border-amber-200"
                                : "bg-white border-slate-100 hover:border-sky-100"
                        )}>
                            <div className="flex items-center justify-between mb-4">
                                <div className={cn(
                                    "w-9 h-9 rounded-xl flex items-center justify-center",
                                    item.urgent ? "bg-amber-100 text-amber-600" : "bg-slate-50 text-slate-400 group-hover:bg-sky-50 group-hover:text-sky-500 transition-colors"
                                )}>
                                    <item.icon className="w-4 h-4" />
                                </div>
                                {item.urgent && (
                                    <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
                                )}
                            </div>
                            <p className="text-sm font-bold text-slate-700">{item.label}</p>
                            <p className={cn("text-2xl font-bold mt-1", item.urgent ? "text-amber-600" : "text-slate-900")}>{loading ? "—" : item.count}</p>
                            <div className="flex items-center gap-1 mt-2 text-sky-500 opacity-0 group-hover:opacity-100 transition-opacity">
                                <span className="text-[10px] font-black uppercase tracking-widest">View</span>
                                <ArrowRight className="w-3 h-3" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Vetting Queue */}
            <div className="px-4 space-y-5 pb-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                        <h2 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Pending Vetting Queue</h2>
                        <p className="text-xs text-slate-400 mt-1">{loading ? "—" : pendingTutors.length} application{pendingTutors.length !== 1 ? "s" : ""} awaiting review</p>
                    </div>
                    <Link href="/dashboard/manager/tutors" className="text-[10px] font-black text-sky-500 uppercase tracking-widest hover:text-sky-600 flex items-center gap-1.5">
                        Full Registry <ArrowRight className="w-3 h-3" />
                    </Link>
                </div>

                {loading ? (
                    <div className="space-y-3">
                        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-2xl" />)}
                    </div>
                ) : pendingTutors.length === 0 ? (
                    <div className="py-16 rounded-[28px] border border-dashed border-slate-200 bg-slate-50/20 text-center">
                        <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                        <p className="text-sm font-bold text-slate-700">All Applications Processed</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">No pending educator applications.</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {pendingTutors.slice(0, 5).map((tutor, i) => (
                            <div key={tutor._id || i} className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[20px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all gap-4">
                                <div className="flex items-center gap-4">
                                    <div className="w-11 h-11 rounded-2xl bg-gradient-to-br from-sky-100 to-indigo-100 flex items-center justify-center text-sky-600 font-black text-base">
                                        {tutor.name?.charAt(0)?.toUpperCase()}
                                    </div>
                                    <div>
                                        <p className="text-sm font-bold text-slate-900">{tutor.name}</p>
                                        <p className="text-[10px] text-slate-400">{tutor.email}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => { setSelectedTutor(tutor); setDocType(null) }}
                                        className="border-slate-100 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-100 text-slate-400 font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl transition-all"
                                    >
                                        Review
                                    </Button>
                                    <Button
                                        size="sm"
                                        onClick={() => handleAction(tutor._id, 'approve')}
                                        disabled={isProcessing}
                                        className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl shadow-sm transition-all"
                                    >
                                        <UserCheck className="w-3.5 h-3.5 mr-1.5" />
                                        Approve
                                    </Button>
                                    <Button
                                        size="sm"
                                        variant="outline"
                                        onClick={() => handleAction(tutor._id, 'reject')}
                                        disabled={isProcessing}
                                        className="border-rose-100 bg-rose-50 hover:bg-rose-100 text-rose-600 font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl transition-all"
                                    >
                                        <XCircle className="w-3.5 h-3.5 mr-1.5" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        ))}
                    </div>
                )}
            </div>

            {/* Tutor Detail Modal */}
            <Dialog open={!!selectedTutor} onOpenChange={() => { setSelectedTutor(null); setDocType(null) }}>
                <DialogContent className="sm:max-w-lg border-0 shadow-2xl rounded-[32px] bg-white p-0 overflow-hidden">
                    <DialogHeader className="sr-only">
                        <DialogTitle>Tutor Application Review</DialogTitle>
                    </DialogHeader>
                    {selectedTutor && (
                        <>
                            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-5">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-500 flex items-center justify-center text-white font-black text-2xl shadow-lg">
                                    {selectedTutor.name?.charAt(0)?.toUpperCase()}
                                </div>
                                <div>
                                    <h2 className="text-xl font-bold text-slate-900">{selectedTutor.name}</h2>
                                    <p className="text-sm text-slate-400 mt-0.5">{selectedTutor.email}</p>
                                    <span className="inline-flex mt-2 px-2.5 py-1 rounded-lg bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase tracking-widest">
                                        Pending Verification
                                    </span>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                {/* Documents */}
                                <div>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Credentials</p>
                                    <div className="grid grid-cols-2 gap-3">
                                        {[
                                            { key: 'degree', label: 'Degree / Certificate', icon: GraduationCap },
                                            { key: 'cv', label: 'Professional CV', icon: FileText },
                                        ].map(doc => {
                                            const path = selectedTutor.documents?.[doc.key]
                                            const isActive = docType === doc.key
                                            return (
                                                <button
                                                    key={doc.key}
                                                    onClick={() => {
                                                        if (!path) return
                                                        const base = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001'
                                                        const url = path.startsWith('http') ? path : `${base}/${path.replace(/^\//, '')}`
                                                        window.open(url, '_blank')
                                                        setDocType(doc.key as any)
                                                    }}
                                                    className={cn(
                                                        "p-4 rounded-2xl border-2 flex items-center gap-3 text-left transition-all group",
                                                        isActive ? "border-sky-300 bg-sky-50" : "border-slate-100 bg-white hover:border-slate-200",
                                                        !path && "opacity-40 cursor-not-allowed"
                                                    )}
                                                >
                                                    <div className={cn("w-9 h-9 rounded-xl flex items-center justify-center", isActive ? "bg-sky-500 text-white" : "bg-slate-50 text-slate-400")}>
                                                        <doc.icon className="w-4 h-4" />
                                                    </div>
                                                    <div className="min-w-0 flex-1">
                                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{doc.label}</p>
                                                        <p className="text-xs font-bold text-slate-600 truncate">{path ? path.split('/').pop() : 'Not provided'}</p>
                                                    </div>
                                                    {path && <ExternalLink className="w-3 h-3 text-slate-300 shrink-0" />}
                                                </button>
                                            )
                                        })}
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedTutor.skills && (
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2">Biography</p>
                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                            "{selectedTutor.skills}"
                                        </p>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex gap-3 pt-2">
                                    <Button
                                        className="flex-1 h-12 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-emerald-200"
                                        onClick={() => handleAction(selectedTutor._id, 'approve')}
                                        disabled={isProcessing}
                                    >
                                        {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : <UserCheck className="w-4 h-4 mr-2" />}
                                        Approve
                                    </Button>
                                    <Button
                                        className="flex-1 h-12 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-xs uppercase tracking-widest"
                                        onClick={() => handleAction(selectedTutor._id, 'reject')}
                                        disabled={isProcessing}
                                    >
                                        <XCircle className="w-4 h-4 mr-2" />
                                        Reject
                                    </Button>
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
