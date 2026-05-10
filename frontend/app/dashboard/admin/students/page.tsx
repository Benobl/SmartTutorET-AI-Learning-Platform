"use client"

import { useState, useEffect } from "react"
import { Users, Search, RefreshCw, BookOpen, GraduationCap, CheckCircle2, Clock, Mail } from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { adminApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminStudentsPage() {
    const [students, setStudents] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [filterGrade, setFilterGrade] = useState("All")

    const fetchStudents = async () => {
        try {
            setLoading(true)
            const res = await adminApi.getUsers()
            const allUsers = res?.data || []
            setStudents(allUsers.filter((u: any) => u.role === "student"))
        } catch (error) {
            toast({ title: "Fetch Error", description: "Could not load students.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => { fetchStudents() }, [])

    const handleUpdateStatus = async (userId: string, status: string) => {
        try {
            await adminApi.updateUserStatus(userId, status)
            toast({ title: `Student ${status}`, description: "Account status updated.", className: status === "active" ? "bg-emerald-500 text-white" : undefined })
            fetchStudents()
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message, variant: "destructive" })
        }
    }

    const grades = ["All", "9", "10", "11", "12"]

    const filteredStudents = students.filter(s => {
        const matchSearch = !searchQuery ||
            s.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
            s.email?.toLowerCase().includes(searchQuery.toLowerCase())
        const matchGrade = filterGrade === "All" || String(s.grade) === filterGrade
        return matchSearch && matchGrade
    })

    const activeCount = students.filter(s => s.accountStatus === "active" || !s.accountStatus).length

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Student Registry</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        All <span className="font-semibold text-slate-900">Students</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Manage and monitor all enrolled students on the platform.
                    </p>
                </div>
                <Button
                    onClick={fetchStudents}
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
                    { label: "Total Students", value: students.length, icon: Users, color: "sky" },
                    { label: "Active", value: activeCount, icon: CheckCircle2, color: "emerald" },
                    { label: "Suspended", value: students.length - activeCount, icon: Clock, color: "rose" },
                ].map((stat, i) => (
                    <div key={i} className="p-7 rounded-[24px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-200 flex items-center gap-5">
                        <div className={cn(
                            "w-11 h-11 rounded-xl flex items-center justify-center",
                            stat.color === "sky" ? "bg-sky-50 text-sky-500" :
                            stat.color === "emerald" ? "bg-emerald-50 text-emerald-500" : "bg-rose-50 text-rose-500"
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

            {/* Filters */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 px-4">
                {/* Grade filter */}
                <div className="flex bg-slate-100 rounded-2xl p-1.5 gap-1">
                    {grades.map(g => (
                        <button
                            key={g}
                            onClick={() => setFilterGrade(g)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                filterGrade === g
                                    ? "bg-white text-slate-900 shadow-sm"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            {g === "All" ? "All Grades" : `Grade ${g}`}
                        </button>
                    ))}
                </div>
                <div className="relative w-full sm:w-72">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                    <input
                        type="text"
                        placeholder="Search students..."
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                        className="w-full pl-11 pr-4 py-3 rounded-2xl border border-slate-100 bg-white text-sm focus:outline-none focus:ring-2 focus:ring-sky-500/20 transition-all placeholder:text-slate-300 shadow-sm"
                    />
                </div>
            </div>

            {/* Table */}
            <div className="mx-4 rounded-[28px] bg-white border border-slate-100 shadow-sm overflow-hidden pb-4">
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="border-b border-slate-50">
                                {["Student", "Email", "Grade", "Stream", "Status", "Actions"].map(h => (
                                    <th key={h} className="text-left py-5 px-7 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                        {h}
                                    </th>
                                ))}
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {loading ? (
                                Array(5).fill(0).map((_, i) => (
                                    <tr key={i}>
                                        <td colSpan={6} className="p-5">
                                            <Skeleton className="h-10 w-full rounded-xl" />
                                        </td>
                                    </tr>
                                ))
                            ) : filteredStudents.length === 0 ? (
                                <tr>
                                    <td colSpan={6} className="py-20 text-center">
                                        <Users className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No students found</p>
                                    </td>
                                </tr>
                            ) : filteredStudents.map((student: any) => {
                                const isActive = !student.accountStatus || student.accountStatus === "active"
                                return (
                                    <tr key={student._id} className="hover:bg-slate-50/50 transition-all group">
                                        <td className="py-5 px-7">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-indigo-100 to-sky-100 flex items-center justify-center text-indigo-600 font-black text-sm group-hover:scale-105 transition-transform">
                                                    {student.name?.charAt(0)?.toUpperCase()}
                                                </div>
                                                <p className="text-sm font-bold text-slate-900">{student.name}</p>
                                            </div>
                                        </td>
                                        <td className="py-5 px-7">
                                            <div className="flex items-center gap-1.5 text-slate-400">
                                                <Mail className="w-3 h-3" />
                                                <span className="text-xs">{student.email}</span>
                                            </div>
                                        </td>
                                        <td className="py-5 px-7">
                                            <span className="text-xs font-bold text-slate-600">
                                                {student.grade ? `Grade ${student.grade}` : "—"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-7">
                                            <span className="text-xs text-slate-500">{student.stream || "Common"}</span>
                                        </td>
                                        <td className="py-5 px-7">
                                            <span className={cn(
                                                "inline-flex items-center px-3 py-1.5 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                                isActive
                                                    ? "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                                    : "bg-rose-50 text-rose-600 border border-rose-100"
                                            )}>
                                                {student.accountStatus || "active"}
                                            </span>
                                        </td>
                                        <td className="py-5 px-7">
                                            {isActive ? (
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleUpdateStatus(student._id, "suspended")}
                                                    className="border-slate-100 hover:bg-rose-50 hover:text-rose-600 hover:border-rose-100 text-slate-400 font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl transition-all"
                                                >
                                                    Suspend
                                                </Button>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    onClick={() => handleUpdateStatus(student._id, "active")}
                                                    className="bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[9px] uppercase tracking-widest h-9 px-4 rounded-xl shadow-sm transition-all"
                                                >
                                                    Reactivate
                                                </Button>
                                            )}
                                        </td>
                                    </tr>
                                )
                            })}
                        </tbody>
                    </table>
                </div>
                {!loading && filteredStudents.length > 0 && (
                    <div className="px-7 pt-4 border-t border-slate-50 flex items-center justify-between">
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            Showing {filteredStudents.length} of {students.length} students
                        </p>
                    </div>
                )}
            </div>
        </div>
    )
}
