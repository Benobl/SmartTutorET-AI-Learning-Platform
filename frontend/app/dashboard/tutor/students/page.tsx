"use client"

import { useState } from "react"
import {
    Users, Search, Filter, Mail, MessageSquare,
    ChevronRight, ArrowUpRight, TrendingUp, TrendingDown,
    Activity, GraduationCap, Star, BookOpen, Clock,
    LayoutGrid, List, MoreVertical, ShieldAlert
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { mockTeacherData } from "@/lib/teacher-data"

const MOCK_STUDENTS = [
    { id: "s1", name: "Biniyam Solomon", grade: "12", course: "Quantum Mechanics", attendance: "98%", average: 92, status: "excellent", trend: "up" },
    { id: "s2", name: "Helena Tesfaye", grade: "12", course: "Quantum Mechanics", attendance: "85%", average: 78, status: "good", trend: "up" },
    { id: "s3", name: "Dagmawi Girma", grade: "11", course: "Kinematics", attendance: "92%", average: 64, status: "struggling", trend: "down" },
    { id: "s4", name: "Selamawit Bekele", grade: "11", course: "Kinematics", attendance: "100%", average: 88, status: "excellent", trend: "up" },
    { id: "s5", name: "Yonas Alemu", grade: "12", course: "Quantum Mechanics", attendance: "76%", average: 45, status: "at-risk", trend: "down" },
]

export default function TeacherStudents() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Enrollment Portal</span>
                            <Activity className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-sky-500'>Directory</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Monitor student performance, track attendance, and provide personalized AI-driven feedback to improve exam readiness.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <Mail className="w-4 h-4" /> Message All Students
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <ArrowUpRight className="w-4 h-4 mr-2" /> Export Gradebook
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            placeholder="Find a student..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Total Students", value: "97", icon: Users, color: "bg-sky-50 text-sky-500" },
                    { label: "Avg Attendance", value: "91%", icon: Clock, color: "bg-sky-50 text-sky-500" },
                    { label: "Exam Ready", value: "64", icon: Star, color: "bg-sky-50 text-sky-500" },
                    { label: "At Risk", value: "8", icon: ShieldAlert, color: "bg-rose-50 text-rose-500" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 flex items-center gap-6">
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.color)}>
                            <stat.icon className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h2 className="text-2xl font-black text-slate-900">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* Students Table/List */}
            <div className="bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-sky-500/5 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="border-b border-slate-50 bg-slate-50/50">
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Student Identity</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Course</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">GPA / Score</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-center">Attendance</th>
                                <th className="px-10 py-8 text-[10px] font-black text-slate-400 uppercase tracking-widest text-right">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            {MOCK_STUDENTS.map((student) => (
                                <tr key={student.id} className="group hover:bg-slate-50/50 transition-all cursor-pointer">
                                    <td className="px-10 py-8">
                                        <div className="flex items-center gap-5">
                                            <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center font-black text-xs border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                                {student.name.split(' ').map(n => n[0]).join('')}
                                            </div>
                                            <div>
                                                <h4 className="text-[15px] font-black text-slate-900 leading-none mb-1.5">{student.name}</h4>
                                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Grade {student.grade} • ID-8821</p>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div>
                                            <p className="text-[11px] font-black text-slate-900 uppercase tracking-tight">{student.course}</p>
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest">Semester 1</p>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center">
                                            <div className="flex items-center gap-2 mb-1.5">
                                                <span className={cn(
                                                    "text-xl font-black",
                                                    student.average >= 85 ? "text-sky-600" :
                                                        student.average >= 70 ? "text-sky-600" :
                                                            "text-rose-600"
                                                )}>{student.average}%</span>
                                                {student.trend === 'up' ? <TrendingUp className="w-4 h-4 text-sky-400" /> : <TrendingDown className="w-4 h-4 text-rose-400" />}
                                            </div>
                                            <span className={cn(
                                                "px-3 py-1 rounded-full text-[8px] font-black uppercase tracking-widest border",
                                                student.status === 'excellent' ? "bg-sky-50 text-sky-600 border-sky-100" :
                                                    student.status === 'good' ? "bg-sky-50 text-sky-600 border-sky-100" :
                                                        "bg-rose-50 text-rose-600 border-rose-100"
                                            )}>{student.status}</span>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8">
                                        <div className="flex flex-col items-center gap-1.5">
                                            <span className="text-[13px] font-black text-slate-600">{student.attendance}</span>
                                            <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-slate-300 rounded-full" style={{ width: student.attendance }} />
                                            </div>
                                        </div>
                                    </td>
                                    <td className="px-10 py-8 text-right">
                                        <div className="flex items-center justify-end gap-3">
                                            <Button size="sm" variant="outline" className="h-10 w-10 rounded-xl p-0 border-slate-100 text-slate-400 hover:text-sky-600 transition-all">
                                                <MessageSquare className="w-4 h-4" />
                                            </Button>
                                            <Button size="sm" className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-sky-600 transition-all">
                                                Full Profile
                                            </Button>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
                <div className="p-8 bg-slate-50/50 border-t border-slate-50 flex items-center justify-between">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">Showing 5 of 97 enrolled students</p>
                    <div className="flex gap-2">
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest">Previous</Button>
                        <Button variant="outline" size="sm" className="h-10 px-4 rounded-xl border-slate-100 text-[10px] font-black uppercase tracking-widest">Next</Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
