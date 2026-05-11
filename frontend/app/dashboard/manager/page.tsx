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
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Institutional Registrar</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Manager <span className="font-semibold text-slate-900">Console</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        Manage institutional standards, monitor growth analytics, and verify academic credentials.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button
                        onClick={refreshData}
                        variant="outline"
                        className="h-12 px-6 rounded-full border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                        Refresh Registry
                    </Button>
                    <Link href="/dashboard/manager/jobs">
                        <Button className="h-12 px-8 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-sky-600 transition-all">
                            Post Vacancy
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
                {statCards.map((s, i) => (
                    <div key={i} className="p-10 rounded-[32px] bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500 group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{loading ? "..." : s.value}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <p className="text-[9px] font-medium text-slate-400 uppercase">Live Update</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {[
                    { label: "Curriculum Registry", href: "/dashboard/manager/courses", icon: BookOpen, count: stats.courses, color: "sky" },
                    { label: "Tutor Approvals", href: "/dashboard/manager/tutors", icon: ShieldCheck, count: stats.pendingTutors, color: "emerald", urgent: stats.pendingTutors > 0 },
                    { label: "Subject Requests", href: "/dashboard/manager/approvals/subjects", icon: FileText, count: stats.pendingSubjects, color: "indigo", urgent: stats.pendingSubjects > 0 },
                ].map((item) => (
                    <Link key={item.href} href={item.href}>
                        <div className={cn(
                            "p-10 rounded-[48px] border transition-all duration-500 group cursor-pointer relative overflow-hidden",
                            item.urgent
                                ? "bg-white border-amber-200 shadow-xl shadow-amber-500/5"
                                : "bg-white border-slate-100 hover:border-slate-200 shadow-sm hover:shadow-xl"
                        )}>
                            <div className="flex items-center justify-between mb-6">
                                <div className={cn(
                                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all duration-500",
                                    item.color === "sky" ? "bg-sky-50 text-sky-500 group-hover:bg-sky-500 group-hover:text-white" :
                                    item.color === "emerald" ? "bg-emerald-50 text-emerald-500 group-hover:bg-emerald-500 group-hover:text-white" :
                                    "bg-indigo-50 text-indigo-500 group-hover:bg-indigo-500 group-hover:text-white"
                                )}>
                                    <item.icon className="w-5 h-5" />
                                </div>
                                {item.urgent && (
                                    <span className="px-3 py-1 rounded-full bg-amber-100 text-amber-600 text-[8px] font-black uppercase tracking-widest animate-pulse">Action Required</span>
                                )}
                            </div>
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">{item.label}</h4>
                            <p className="text-4xl font-bold text-slate-900">{loading ? "..." : item.count}</p>
                            <div className="flex items-center gap-2 mt-6 text-slate-400 group-hover:text-slate-900 transition-colors">
                                <span className="text-[10px] font-black uppercase tracking-widest">Manage Domain</span>
                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </div>
                        </div>
                    </Link>
                ))}
            </div>

            {/* Vetting Queue */}
            <div className="px-4 pb-32">
                <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-slate-900 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Pending Verifications</h4>
                        </div>
                        <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{pendingTutors.length} Application{pendingTutors.length !== 1 ? "s" : ""}</span>
                    </div>

                    <div className="space-y-4">
                        {loading ? (
                            <div className="space-y-4">
                                {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-[32px]" />)}
                            </div>
                        ) : pendingTutors.length === 0 ? (
                            <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400 mx-auto mb-3" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Registry is clean</p>
                            </div>
                        ) : (
                            pendingTutors.slice(0, 5).map((tutor) => (
                                <div
                                    key={tutor._id}
                                    className="group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500"
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                            <Users className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">{tutor.name}</p>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{tutor.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 mt-6 md:mt-0">
                                        <Button
                                            onClick={() => setSelectedTutor(tutor)}
                                            variant="outline"
                                            className="h-11 px-6 rounded-xl border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 transition-all shadow-sm"
                                        >
                                            Audit Profile
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(tutor._id, 'approve')}
                                            disabled={isProcessing}
                                            className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-slate-200"
                                        >
                                            Verify Access
                                        </Button>
                                        <Button
                                            onClick={() => handleAction(tutor._id, 'reject')}
                                            disabled={isProcessing}
                                            variant="outline"
                                            className="h-11 px-4 rounded-xl border-slate-100 bg-white text-slate-400 hover:text-rose-500 transition-all"
                                        >
                                            <XCircle className="w-4 h-4" />
                                        </Button>
                                    </div>
                                </div>
                            ))
                        )}
                    </div>
                </div>
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
