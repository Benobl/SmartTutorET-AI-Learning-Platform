"use client"

import { useState, useEffect } from "react"
import {
    Users, Search, GraduationCap, ShieldCheck,
    Activity, RefreshCw, XCircle, BookOpen
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { adminApi } from "@/lib/api"
import { getStudentProgress } from "@/lib/manager-utils"
import { Skeleton } from "@/components/ui/skeleton"
import { toast } from "sonner"

export default function MonitoringPage() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterRole, setFilterRole] = useState("all")
    const [filterGrade, setFilterGrade] = useState("all")
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [progressData, setProgressData] = useState<any[]>([])
    const [loadingProgress, setLoadingProgress] = useState(false)

    const fetchUsers = async () => {
        setLoading(true)
        try {
            const res = await adminApi.getUsers()
            setUsers(res?.data || [])
        } catch (e) {
            toast.error("Could not load users.")
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchUsers() }, [])

    const viewProgress = async (student: any) => {
        setSelectedStudent(student)
        setLoadingProgress(true)
        try {
            const data = await getStudentProgress(student._id)
            setProgressData(data || [])
        } catch {
            setProgressData([])
        } finally {
            setLoadingProgress(false)
        }
    }

    const filtered = users.filter(u => {
        const matchSearch = !searchQuery ||
            u.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchRole = filterRole === "all" || u.role === filterRole
        const matchGrade = filterGrade === "all" || String(u.grade) === filterGrade
        return matchSearch && matchRole && matchGrade
    })

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === "student").length,
        tutors: users.filter(u => u.role === "tutor").length,
        admins: users.filter(u => u.role === "admin" || u.role === "manager").length,
    }

    const roleColor = (role: string) => {
        if (role === "student") return "bg-sky-50 text-sky-600 border border-sky-100"
        if (role === "tutor") return "bg-indigo-50 text-indigo-600 border border-indigo-100"
        if (role === "admin" || role === "manager") return "bg-emerald-50 text-emerald-600 border border-emerald-100"
        return "bg-slate-50 text-slate-500 border border-slate-100"
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Institutional Oversight</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        System <span className="font-semibold text-slate-900">Monitoring</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        Track cross-platform user activity, role distributions, and institutional growth metrics.
                    </p>
                </div>
                <Button
                    onClick={fetchUsers}
                    variant="outline"
                    className="h-12 px-6 rounded-full border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm hover:bg-slate-50 transition-all"
                >
                    <RefreshCw className={cn("w-4 h-4 mr-2", loading && "animate-spin")} />
                    Synchronize Registry
                </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
                {[
                    { label: "Platform Users", value: stats.total, icon: Users, color: "sky" },
                    { label: "Active Students", value: stats.students, icon: GraduationCap, color: "indigo" },
                    { label: "Approved Tutors", value: stats.tutors, icon: ShieldCheck, color: "emerald" },
                    { label: "Admin Console", value: stats.admins, icon: Activity, color: "amber" },
                ].map((s, i) => (
                    <div key={i} className="p-10 rounded-[32px] bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500 group">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
                        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{loading ? "..." : s.value}</h3>
                        <div className="flex items-center gap-2 mt-2">
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <p className="text-[9px] font-medium text-slate-400 uppercase">Live Audit</p>
                        </div>
                    </div>
                ))}
            </div>

            {/* Filters & Search */}
            <div className="flex flex-col md:flex-row items-center gap-6 px-4">
                <div className="flex bg-slate-100/50 rounded-full p-1.5 border border-slate-100">
                    {["all", "student", "tutor", "admin"].map(role => (
                        <button
                            key={role}
                            onClick={() => setFilterRole(role)}
                            className={cn(
                                "px-6 py-2 rounded-full text-[10px] font-black uppercase tracking-widest transition-all",
                                filterRole === role ? "bg-white text-slate-900 shadow-md" : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {role}
                        </button>
                    ))}
                </div>
                
                <div className="relative flex-1">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search registry by name or email..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-14 pr-6 h-14 rounded-full border border-slate-100 bg-white text-sm focus:outline-none focus:ring-4 focus:ring-slate-900/5 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>

                <select
                    value={filterGrade}
                    onChange={e => setFilterGrade(e.target.value)}
                    className="h-14 px-8 rounded-full border border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-500 focus:outline-none focus:ring-4 focus:ring-slate-900/5 shadow-sm appearance-none cursor-pointer"
                >
                    <option value="all">All Academic Grades</option>
                    {["9", "10", "11", "12"].map(g => <option key={g} value={g}>Grade {g}</option>)}
                </select>
            </div>

            {/* Main Content */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 px-4 pb-40">
                {/* List */}
                <div className="lg:col-span-8">
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center gap-4">
                                <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">User Directory</h4>
                            </div>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{filtered.length} Displayed</span>
                        </div>

                        <div className="space-y-4">
                            {loading ? (
                                <div className="space-y-4 py-10">
                                    {Array(5).fill(0).map((_, i) => <Skeleton key={i} className="h-24 rounded-[32px]" />)}
                                </div>
                            ) : filtered.length === 0 ? (
                                <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                                    <Users className="w-10 h-10 text-slate-200 mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No matching records</p>
                                </div>
                            ) : filtered.map(user => (
                                <div
                                    key={user._id}
                                    className={cn(
                                        "group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] border transition-all duration-500",
                                        selectedStudent?._id === user._id 
                                            ? "bg-white border-sky-200 shadow-xl shadow-sky-500/5" 
                                            : "bg-slate-50 border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl"
                                    )}
                                >
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                                            {user.name?.charAt(0)?.toUpperCase()}
                                        </div>
                                        <div>
                                            <div className="flex items-center gap-2 mb-1">
                                                <p className="text-sm font-bold text-slate-900">{user.name}</p>
                                                <span className={cn("px-2 py-0.5 rounded-lg text-[8px] font-black uppercase tracking-widest border", roleColor(user.role))}>
                                                    {user.role}
                                                </span>
                                            </div>
                                            <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{user.email}</p>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-4 mt-6 md:mt-0">
                                        {user.grade && (
                                            <div className="text-right hidden md:block">
                                                <p className="text-[10px] font-black text-slate-900 uppercase">Grade {user.grade}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-tighter">Academic Year</p>
                                            </div>
                                        )}
                                        {user.role === "student" && (
                                            <Button
                                                onClick={() => viewProgress(user)}
                                                className={cn(
                                                    "h-11 px-6 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                    selectedStudent?._id === user._id
                                                        ? "bg-slate-900 text-white"
                                                        : "bg-white border border-slate-100 text-slate-400 hover:text-slate-900 shadow-sm"
                                                )}
                                            >
                                                Audit Progress
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Progress Panel */}
                <div className="lg:col-span-4">
                    {selectedStudent ? (
                        <div className="p-10 rounded-[48px] bg-white border border-sky-100 shadow-2xl shadow-sky-500/5 space-y-10 animate-in fade-in slide-in-from-right-8 duration-500 sticky top-4">
                            <div className="flex items-start justify-between">
                                <div className="space-y-1">
                                    <h4 className="text-[11px] font-black text-sky-500 uppercase tracking-[0.3em]">Student Audit</h4>
                                    <h2 className="text-2xl font-bold text-slate-900">{selectedStudent.name}</h2>
                                    <p className="text-xs text-slate-400 truncate max-w-[200px]">{selectedStudent.email}</p>
                                </div>
                                <button
                                    onClick={() => { setSelectedStudent(null); setProgressData([]) }}
                                    className="p-2 rounded-full hover:bg-slate-50 text-slate-300 transition-colors"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            <div className="space-y-4">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                    <BookOpen className="w-3 h-3" /> Enrolled Subjects
                                </p>
                                {loadingProgress ? (
                                    <div className="space-y-4 py-4">
                                        {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-20 rounded-[24px]" />)}
                                    </div>
                                ) : progressData.length === 0 ? (
                                    <div className="py-20 text-center rounded-[32px] border border-dashed border-slate-200 bg-slate-50/50">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No active courses</p>
                                    </div>
                                ) : (
                                    <div className="space-y-4">
                                        {progressData.map((subject: any, i: number) => (
                                            <div key={i} className="p-6 rounded-[24px] bg-slate-50 border border-transparent hover:border-sky-100 hover:bg-white transition-all group">
                                                <p className="text-sm font-bold text-slate-800 mb-2">{subject.title}</p>
                                                <div className="flex items-center justify-between">
                                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{subject.tutor?.name || "Unassigned"}</span>
                                                    <div className="flex gap-2">
                                                        <span className="px-2 py-0.5 rounded-md bg-white border border-slate-100 text-[8px] font-black text-slate-500 uppercase tracking-widest">G-{subject.grade}</span>
                                                        {subject.isPremium && <span className="w-2 h-2 rounded-full bg-amber-400" />}
                                                    </div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>

                            <Button className="w-full h-14 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all">
                                Generate Full Report
                            </Button>
                        </div>
                    ) : (
                        <div className="h-full min-h-[500px] flex flex-col items-center justify-center p-10 rounded-[48px] border border-dashed border-slate-100 bg-slate-50/20 text-center space-y-6">
                            <div className="w-20 h-20 rounded-[32px] bg-white border border-slate-100 flex items-center justify-center text-slate-200">
                                <Activity className="w-10 h-10" />
                            </div>
                            <div>
                                <p className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em] mb-2">Awaiting Context</p>
                                <p className="text-xs text-slate-400 max-w-[200px] leading-relaxed mx-auto font-medium">
                                    Select a student profile from the directory to initialize the academic audit.
                                </p>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
