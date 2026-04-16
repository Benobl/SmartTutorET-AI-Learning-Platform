"use client"

import { useState, useEffect } from "react"
import {
    Users,
    BookOpen,
    CalendarDays,
    FileText,
    TrendingUp,
    CheckCircle2,
    Clock,
    ArrowRight,
    Activity,
    ExternalLink,
    FileCheck,
    Briefcase
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
    DialogFooter
} from "@/components/ui/dialog"
import { getCurrentUser } from "@/lib/auth-utils"
import {
    getStudents,
    getPendingTutors,
    getCourses,
    getJobs,
    getSystemStats,
    approveTutor
} from "@/lib/manager-utils"
import Link from "next/link"

export default function ManagerDashboard() {
    const [user, setUser] = useState<any>(null)
    const [stats, setStats] = useState<any[]>([])
    const [system, setSystem] = useState<any>(null)
    const [pendingTutors, setPendingTutors] = useState<any[]>([])

    // Modal states
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [analyzeModalOpen, setAnalyzeModalOpen] = useState(false)

    const refreshData = () => {
        const currentUser = getCurrentUser()
        setUser(currentUser)

        const students = getStudents()
        const pending = getPendingTutors()
        const courses = getCourses()
        const jobs = getJobs()
        const sysStats = getSystemStats()

        setPendingTutors(pending)
        setStats([
            { label: "Pending Approvals", value: pending.length.toString(), icon: Users, color: "text-sky-600", bgColor: "bg-sky-50" },
            { label: "Active Courses", value: courses.length.toString(), icon: BookOpen, color: "text-blue-600", bgColor: "bg-blue-50" },
            { label: "Total Students", value: students.length.toString(), icon: TrendingUp, color: "text-indigo-600", bgColor: "bg-indigo-50" },
            { label: "Open Jobs", value: jobs.length.toString(), icon: Briefcase, color: "text-cyan-600", bgColor: "bg-cyan-50" },
        ])
        setSystem(sysStats)
    }

    useEffect(() => {
        refreshData()
    }, [])

    const handleAnalyze = (tutor: any) => {
        setSelectedTutor(tutor)
        setAnalyzeModalOpen(true)
    }

    const handleApprove = (id: string) => {
        approveTutor(id)
        setAnalyzeModalOpen(false)
        refreshData()
    }

    const managerName = user ? user.firstName : "Manager"

    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            {/* Header - Cohesive Blue Theme */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900 mb-2 tracking-tight">Welcome, {managerName}</h1>
                    <p className="text-slate-500 font-medium">Institutional overview and administrative controls.</p>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white border-slate-200 text-slate-700 rounded-xl hover:bg-slate-50 transition-all font-bold">
                        Export Report
                    </Button>
                    <Link href="/dashboard/manager/jobs">
                        <Button className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl font-bold px-6 shadow-md shadow-blue-500/20">
                            Post Vacancy
                        </Button>
                    </Link>
                </div>
            </div>

            {/* Stats Grid - Cohesive Blue Industrial Aesthetic */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {stats.map((stat, idx) => (
                    <Card key={idx} className="bg-white border-slate-200 rounded-2xl hover:shadow-lg transition-all duration-300 border shadow-sm group">
                        <CardContent className="p-6">
                            <div className="flex items-center justify-between mb-4">
                                <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.color} group-hover:scale-110 transition-transform`}>
                                    <stat.icon className="w-5 h-5" />
                                </div>
                                <Activity className="w-4 h-4 text-slate-200" />
                            </div>
                            <div className="space-y-1">
                                <p className="text-[10px] font-black uppercase tracking-[0.15em] text-slate-400">{stat.label}</p>
                                <p className="text-3xl font-bold text-slate-900">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            {/* Content Areas */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Task queue */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="flex items-center justify-between px-2">
                        <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-[11px]">Pending Vetting Queue</h2>
                        <Link href="/dashboard/manager/tutors" className="text-blue-600 text-xs font-bold hover:text-blue-700 transition-colors flex items-center gap-1">
                            Go to Queue <ArrowRight className="w-3 h-3" />
                        </Link>
                    </div>

                    <div className="space-y-3">
                        {pendingTutors.length > 0 ? (
                            pendingTutors.slice(0, 3).map((tutor, idx) => (
                                <div key={idx} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between group hover:border-blue-200 transition-all duration-500 shadow-sm">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-xl bg-blue-50 border border-blue-100 flex items-center justify-center text-lg font-bold text-blue-700 uppercase">
                                            {tutor.firstName[0]}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2">
                                                <p className="font-bold text-slate-900">{tutor.name}</p>
                                                <Badge className="bg-blue-50 text-blue-600 border-0 text-[10px] px-2 py-0">Reviewing</Badge>
                                            </div>
                                            <p className="text-xs text-slate-500 font-medium">{tutor.subject} • {tutor.degree}</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={() => handleAnalyze(tutor)}
                                        className="bg-slate-900 hover:bg-slate-800 text-white rounded-xl text-[11px] font-bold px-5 h-9"
                                    >
                                        Analyze Docs
                                    </Button>
                                </div>
                            ))
                        ) : (
                            <div className="p-10 rounded-2xl bg-slate-50 border border-dashed border-slate-200 text-center">
                                <CheckCircle2 className="w-8 h-8 text-emerald-500 mx-auto mb-2" />
                                <p className="text-slate-500 font-medium">All applications processed.</p>
                            </div>
                        )}
                    </div>
                </div>

                {/* System Info */}
                <div className="space-y-6">
                    <h2 className="text-lg font-bold text-slate-900 uppercase tracking-widest text-[11px] px-2">System Pulse</h2>
                    <Card className="bg-slate-900 text-white border-slate-900 rounded-3xl p-8 shadow-xl">
                        <div className="space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-blue-500/20 flex items-center justify-center text-blue-400 border border-blue-500/20">
                                    <Activity className="w-6 h-6" />
                                </div>
                                <div>
                                    <p className="font-bold text-white text-sm">Optimal Performance</p>
                                    <p className="text-[10px] text-blue-400 uppercase font-black tracking-widest">{system?.health || '99.9%'} Healthy</p>
                                </div>
                            </div>

                            <div className="space-y-5 pt-2">
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Latency</span>
                                    <span className="text-sm font-bold text-blue-400">120ms</span>
                                </div>
                                <div className="flex justify-between items-center px-1">
                                    <span className="text-xs font-bold text-white/40 uppercase tracking-widest">Bandwidth</span>
                                    <span className="text-sm font-bold text-emerald-400">Stable</span>
                                </div>
                                <div className="h-1 w-full bg-white/5 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-3/4 rounded-full" />
                                </div>
                            </div>

                            <Button className="w-full bg-white/10 hover:bg-white/20 text-white rounded-xl font-bold py-6 text-xs uppercase tracking-widest mt-4">
                                Diagnostics
                            </Button>
                        </div>
                    </Card>
                </div>
            </div>

            {/* Analysis Modal */}
            <Dialog open={analyzeModalOpen} onOpenChange={setAnalyzeModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-3xl p-0 overflow-hidden border-0">
                    {selectedTutor && (
                        <>
                            <div className="p-8 bg-slate-50 border-b border-slate-100 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-blue-600 flex items-center justify-center text-3xl font-bold text-white shadow-lg">
                                    {selectedTutor.firstName[0]}
                                </div>
                                <div>
                                    <h2 className="text-2xl font-bold text-slate-900 leading-tight">{selectedTutor.name}</h2>
                                    <p className="text-blue-600 font-bold text-sm tracking-wide uppercase">{selectedTutor.subject} Specialist</p>
                                    <div className="flex items-center gap-3 mt-2">
                                        <Badge className="bg-white border-slate-200 text-slate-500 font-bold px-2 py-0 text-[10px]">{selectedTutor.degree}</Badge>
                                        <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold px-2 py-0 text-[10px]">{selectedTutor.experience} Yrs Exp</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="p-8 space-y-6">
                                <div className="space-y-2">
                                    <h3 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Biography / CV Summary</h3>
                                    <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-4 rounded-xl border border-slate-100 italic">
                                        "{selectedTutor.cvSummary || 'No summary provided.'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Verified ID</h3>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                            <FileCheck className="w-4 h-4" />
                                            Identity Checked
                                        </div>
                                    </div>
                                    <div className="p-4 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2">
                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Contact</h3>
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs truncate">
                                            <ExternalLink className="w-4 h-4" />
                                            {selectedTutor.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-3 pt-4">
                                    <Button
                                        variant="outline"
                                        className="flex-1 rounded-xl h-12 font-bold border-slate-200 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100"
                                        onClick={() => setAnalyzeModalOpen(false)}
                                    >
                                        Decline
                                    </Button>
                                    <Button
                                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-500/20"
                                        onClick={() => handleApprove(selectedTutor.id)}
                                    >
                                        Approve & Verify
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
