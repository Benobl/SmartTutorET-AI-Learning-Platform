"use client"

import { teacherProfile, teacherCourses, teacherAssignments, teacherRecentActivity, analyticsData } from "@/lib/teacher-data"
import { BookOpen, Users, FileText, TrendingUp, ChevronRight, Clock, CheckCircle2, MessageSquare, Upload, Plus, Award, Activity } from "lucide-react"
import { cn } from "@/lib/utils"
import Link from "next/link"
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, LineChart, Line } from "recharts"

const pendingSubmissions = 6
const pendingGrading = 3

export default function TeacherOverview() {
    const totalStudents = teacherCourses.reduce((sum, c) => sum + c.studentsEnrolled, 0)
    const activeAssignments = teacherAssignments.filter(a => a.status === "active").length
    const avgGrade = Math.round(teacherCourses.reduce((sum, c) => sum + c.avgGrade, 0) / teacherCourses.length)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Welcome Header */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                    <h1 className="text-4xl font-bold text-slate-900 mb-2">
                        Welcome back, <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-sky-600">{teacherProfile.firstName}!</span> 👋
                    </h1>
                    <p className="text-slate-500 font-medium">{teacherProfile.title} · {teacherProfile.department}</p>
                </div>
                <div className="flex gap-3">
                    <Link href="/dashboard/teacher/announcements" className="flex items-center gap-2 px-4 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20 hover:shadow-indigo-500/20">
                        <Plus className="w-4 h-4" />
                        New Announcement
                    </Link>
                    <Link href="/dashboard/teacher/assignments" className="flex items-center gap-2 px-4 py-2.5 bg-white border border-slate-200 hover:border-slate-300 text-slate-700 rounded-xl text-sm font-bold transition-all shadow-sm">
                        <FileText className="w-4 h-4" />
                        New Assignment
                    </Link>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: totalStudents.toString(), icon: Users, color: "sky", sub: `${teacherCourses.filter(c => c.status === "active").length} active courses` },
                    { label: "Active Assignments", value: activeAssignments.toString(), icon: FileText, color: "rose", sub: `${pendingSubmissions} pending submissions` },
                    { label: "Average Grade", value: `${avgGrade}%`, icon: Award, color: "emerald", sub: "Across all courses" },
                    { label: "Unread Messages", value: "3", icon: MessageSquare, color: "indigo", sub: "From students" },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm hover:shadow-md hover:border-slate-300 transition-all group relative overflow-hidden">
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl transition-all group-hover:opacity-20", `bg-${stat.color}-500`)} />
                        <div className="flex items-start justify-between mb-4">
                            <div className={cn("p-3 rounded-2xl bg-slate-50 border border-slate-100", `text-${stat.color}-500`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                        </div>
                        <div className="space-y-1">
                            <p className="text-sm font-semibold text-slate-400">{stat.label}</p>
                            <h3 className="text-3xl font-bold text-slate-900 tracking-tight">{stat.value}</h3>
                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{stat.sub}</p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
                {/* Left column — charts */}
                <div className="xl:col-span-2 space-y-8">
                    {/* Enrollment Trend Chart */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center justify-between mb-6">
                            <div className="flex items-center gap-3">
                                <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                                <h2 className="text-xl font-bold text-slate-900">Student Enrollment Trend</h2>
                            </div>
                            <Link href="/dashboard/teacher/analytics" className="text-indigo-600 text-sm font-bold hover:text-indigo-500 transition-colors flex items-center gap-1 group">
                                Full Analytics
                                <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                            </Link>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <LineChart data={analyticsData.enrollmentTrend}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                                <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                                <Line type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} dot={{ fill: "#6366f1", strokeWidth: 2, r: 5 }} activeDot={{ r: 7 }} />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>

                    {/* Assignment Completion */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <div className="flex items-center gap-3 mb-6">
                            <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                            <h2 className="text-xl font-bold text-slate-900">Course Completion Rates</h2>
                        </div>
                        <ResponsiveContainer width="100%" height={200}>
                            <BarChart data={analyticsData.completionRates} barSize={32}>
                                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                                <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                                <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} domain={[0, 100]} unit="%" />
                                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} formatter={(v) => [`${v}%`, "Completion Rate"]} />
                                <Bar dataKey="rate" fill="#10b981" radius={[8, 8, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Right column — activity + quick info */}
                <div className="space-y-6">
                    {/* Pending Actions */}
                    <div className="bg-gradient-to-br from-indigo-600 to-sky-600 rounded-3xl p-6 text-white shadow-xl shadow-indigo-500/20 relative overflow-hidden">
                        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/10 rounded-full blur-2xl" />
                        <h3 className="font-bold text-lg mb-4 relative z-10">Pending Actions</h3>
                        <div className="space-y-3 relative z-10">
                            {[
                                { label: "Submissions to review", count: pendingSubmissions, href: "/dashboard/teacher/submissions", icon: FileText },
                                { label: "Assignments to grade", count: pendingGrading, href: "/dashboard/teacher/grading", icon: Award },
                                { label: "Unread messages", count: 3, href: "/dashboard/teacher/messages", icon: MessageSquare },
                            ].map((item) => (
                                <Link key={item.label} href={item.href} className="flex items-center justify-between p-3 bg-white/15 hover:bg-white/25 rounded-xl transition-all group">
                                    <div className="flex items-center gap-3">
                                        <item.icon className="w-4 h-4 text-white/70" />
                                        <span className="text-sm font-semibold">{item.label}</span>
                                    </div>
                                    <span className="text-sm font-black bg-white/20 px-2.5 py-1 rounded-lg">{item.count}</span>
                                </Link>
                            ))}
                        </div>
                    </div>

                    {/* Recent Activity */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Recent Activity</h3>
                        <div className="relative pl-5 space-y-4 before:absolute before:left-0 before:top-2 before:bottom-2 before:w-[1px] before:bg-slate-200">
                            {teacherRecentActivity.slice(0, 5).map((act, i) => (
                                <div key={i} className="relative group">
                                    <div className={cn(
                                        "absolute -left-[26px] top-1 w-2.5 h-2.5 rounded-full border-2 border-[#f8f9fa] transition-all group-hover:scale-125",
                                        act.color === "emerald" ? "bg-emerald-500" : act.color === "sky" ? "bg-sky-500" : act.color === "indigo" ? "bg-indigo-500" : act.color === "amber" ? "bg-amber-500" : act.color === "violet" ? "bg-violet-500" : "bg-rose-500"
                                    )} />
                                    <p className="text-sm font-semibold text-slate-700">{act.text}</p>
                                    <p className="text-xs font-medium text-slate-400 mt-0.5">{act.time}</p>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Actions */}
                    <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                        <h3 className="text-lg font-bold text-slate-900 mb-4">Quick Actions</h3>
                        <div className="grid grid-cols-2 gap-3">
                            {[
                                { label: "Upload Material", icon: Upload, href: "/dashboard/teacher/courses", color: "sky" },
                                { label: "New Assignment", icon: Plus, href: "/dashboard/teacher/assignments", color: "rose" },
                                { label: "View Analytics", icon: Activity, href: "/dashboard/teacher/analytics", color: "indigo" },
                                { label: "Send Message", icon: MessageSquare, href: "/dashboard/teacher/messages", color: "emerald" },
                            ].map((action) => (
                                <Link key={action.label} href={action.href} className={cn(
                                    "p-4 rounded-2xl border border-slate-100 hover:border-slate-200 bg-slate-50/50 hover:bg-white transition-all group text-center shadow-sm hover:shadow-md",
                                )}>
                                    <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center mx-auto mb-2 transition-all group-hover:scale-110", `bg-${action.color}-50 text-${action.color}-500`)}>
                                        <action.icon className="w-5 h-5" />
                                    </div>
                                    <p className="text-xs font-bold text-slate-600">{action.label}</p>
                                </Link>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* My Courses Preview */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900">My Active Courses</h2>
                    </div>
                    <Link href="/dashboard/teacher/courses" className="text-indigo-600 text-sm font-bold hover:text-indigo-500 transition-colors flex items-center gap-1 group">
                        Manage All
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
                    {teacherCourses.filter(c => c.status === "active").slice(0, 3).map((course) => (
                        <div key={course.id} className="group rounded-3xl border border-slate-200 bg-white overflow-hidden hover:border-indigo-200 hover:shadow-md transition-all duration-300 shadow-sm">
                            <div className="h-28 relative overflow-hidden">
                                <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent" />
                                <div className="absolute bottom-3 left-4">
                                    <span className="text-[10px] font-bold text-white uppercase tracking-widest bg-white/20 backdrop-blur-sm px-2 py-1 rounded-lg border border-white/30">{course.grade}</span>
                                </div>
                                <div className="absolute top-3 right-3">
                                    <span className={cn("text-[10px] font-bold px-2 py-1 rounded-lg", course.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-500 text-white")}>
                                        {course.status === "active" ? "Active" : "Completed"}
                                    </span>
                                </div>
                            </div>
                            <div className="p-5 space-y-3">
                                <div>
                                    <h4 className="text-base font-bold text-slate-900 group-hover:text-indigo-600 transition-colors">{course.name}</h4>
                                    <p className="text-xs font-medium text-slate-400">{course.code}</p>
                                </div>
                                <div className="flex items-center justify-between text-xs">
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Users className="w-3.5 h-3.5" />
                                        <span className="font-bold">{course.studentsEnrolled} students</span>
                                    </div>
                                    <div className="flex items-center gap-1.5 text-slate-500">
                                        <Clock className="w-3.5 h-3.5" />
                                        <span className="font-bold">{course.nextClass}</span>
                                    </div>
                                </div>
                                <div>
                                    <div className="flex justify-between text-xs font-bold mb-1">
                                        <span className="text-slate-400">Completion</span>
                                        <span className="text-indigo-600">{course.completionRate}%</span>
                                    </div>
                                    <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                        <div className="h-full bg-indigo-500 rounded-full transition-all duration-1000" style={{ width: `${course.completionRate}%` }} />
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Recent Submissions */}
            <div className="space-y-4">
                <div className="flex items-center justify-between px-2">
                    <div className="flex items-center gap-3">
                        <div className="w-1.5 h-6 bg-rose-500 rounded-full" />
                        <h2 className="text-xl font-bold text-slate-900">Recent Submissions</h2>
                    </div>
                    <Link href="/dashboard/teacher/submissions" className="text-indigo-600 text-sm font-bold hover:text-indigo-500 transition-colors flex items-center gap-1 group">
                        View All
                        <ChevronRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </Link>
                </div>
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                    {teacherAssignments.filter(a => a.submitted > 0).slice(0, 4).map((a, i) => (
                        <div key={a.id} className={cn("flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors", i < 3 && "border-b border-slate-100")}>
                            <div className={cn("w-10 h-10 rounded-xl flex items-center justify-center shrink-0 text-sm font-black", a.status === "active" ? "bg-emerald-50 text-emerald-600" : "bg-slate-100 text-slate-500")}>
                                {a.submitted}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-slate-800 truncate text-sm">{a.title}</p>
                                <p className="text-xs text-slate-400 font-medium">{a.courseCode} · {a.submitted}/{a.totalStudents} submitted</p>
                            </div>
                            <div className="text-right shrink-0">
                                <span className={cn("text-xs font-bold px-3 py-1 rounded-lg", a.graded > 0 ? "bg-emerald-50 text-emerald-600" : "bg-amber-50 text-amber-600")}>
                                    {a.graded > 0 ? `${a.graded} graded` : "Needs review"}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
