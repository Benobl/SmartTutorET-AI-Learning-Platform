"use client"

import { analyticsData, teacherCourses } from "@/lib/teacher-data"
import { cn } from "@/lib/utils"
import { TrendingUp, Users, Award, Activity } from "lucide-react"
import {
    LineChart, Line, BarChart, Bar, PieChart, Pie, Cell,
    XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend, AreaChart, Area
} from "recharts"

const COLORS = ["#22c55e", "#3b82f6", "#f59e0b", "#f97316", "#ef4444"]

export default function TeacherAnalyticsPage() {
    const totalStudents = teacherCourses.reduce((s, c) => s + c.studentsEnrolled, 0)
    const avgGrade = Math.round(teacherCourses.reduce((s, c) => s + c.avgGrade, 0) / teacherCourses.length)
    const avgCompletion = Math.round(teacherCourses.filter(c => c.status === "active").reduce((s, c) => s + c.completionRate, 0) / teacherCourses.filter(c => c.status === "active").length)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Analytics</h1>
                <p className="text-slate-500 text-sm font-medium">Detailed performance insights across all your courses.</p>
            </div>

            {/* KPI Cards */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: totalStudents, icon: Users, color: "sky", sub: "Across 5 courses" },
                    { label: "Average Grade", value: `${avgGrade}%`, icon: Award, color: "emerald", sub: "All courses" },
                    { label: "Avg Completion", value: `${avgCompletion}%`, icon: Activity, color: "indigo", sub: "Active courses" },
                    { label: "Engagement Score", value: "4.9★", icon: TrendingUp, color: "amber", sub: "Student rating" },
                ].map(stat => (
                    <div key={stat.label} className="p-6 rounded-3xl bg-white border border-slate-200 shadow-sm relative overflow-hidden group hover:shadow-md transition-all">
                        <div className={cn("absolute -right-4 -top-4 w-24 h-24 rounded-full opacity-10 blur-2xl group-hover:opacity-20 transition-opacity", `bg-${stat.color}-500`)} />
                        <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center mb-4 border", `bg-${stat.color}-50 text-${stat.color}-500 border-${stat.color}-100`)}>
                            <stat.icon className="w-5 h-5" />
                        </div>
                        <p className="text-sm font-semibold text-slate-400 mb-1">{stat.label}</p>
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {/* Enrollment Trend */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-indigo-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900">Student Enrollment Trend</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <AreaChart data={analyticsData.enrollmentTrend}>
                            <defs>
                                <linearGradient id="enrollGradient" x1="0" y1="0" x2="0" y2="1">
                                    <stop offset="5%" stopColor="#6366f1" stopOpacity={0.2} />
                                    <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                </linearGradient>
                            </defs>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                            <XAxis dataKey="month" tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} domain={[80, 130]} />
                            <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px", boxShadow: "0 4px 20px rgba(0,0,0,0.08)" }} />
                            <Area type="monotone" dataKey="students" stroke="#6366f1" strokeWidth={3} fill="url(#enrollGradient)" dot={{ fill: "#6366f1", r: 5 }} />
                        </AreaChart>
                    </ResponsiveContainer>
                </div>

                {/* Weekly Engagement */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-sky-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900">Weekly Student Engagement</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analyticsData.weeklyEngagement} barSize={28}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="day" tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} unit="h" />
                            <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }} formatter={v => [`${v}h`, "Avg Hours"]} />
                            <Bar dataKey="hours" fill="#0ea5e9" radius={[8, 8, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Course Completion Rates */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-emerald-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900">Course Completion & Avg Score</h2>
                    </div>
                    <ResponsiveContainer width="100%" height={240}>
                        <BarChart data={analyticsData.completionRates} barSize={16}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" vertical={false} />
                            <XAxis dataKey="name" tick={{ fontSize: 11, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} />
                            <YAxis tick={{ fontSize: 12, fill: "#94a3b8", fontWeight: 600 }} axisLine={false} tickLine={false} unit="%" domain={[0, 100]} />
                            <Tooltip
                                contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }}
                                formatter={(v, name) => [`${v}%`, name === "rate" ? "Completion" : "Avg Score"]}
                            />
                            <Legend formatter={(v) => v === "rate" ? "Completion" : "Avg Score"} />
                            <Bar dataKey="rate" fill="#10b981" radius={[4, 4, 0, 0]} />
                            <Bar dataKey="avgScore" fill="#6366f1" radius={[4, 4, 0, 0]} />
                        </BarChart>
                    </ResponsiveContainer>
                </div>

                {/* Grade Distribution Pie Chart */}
                <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                        <h2 className="text-lg font-black text-slate-900">Grade Distribution</h2>
                    </div>
                    <div className="flex items-center gap-6">
                        <ResponsiveContainer width="50%" height={200}>
                            <PieChart>
                                <Pie data={analyticsData.gradeDistribution} dataKey="count" cx="50%" cy="50%" innerRadius={55} outerRadius={90} paddingAngle={3}>
                                    {analyticsData.gradeDistribution.map((entry, i) => (
                                        <Cell key={i} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ background: "white", border: "1px solid #e2e8f0", borderRadius: "12px" }} />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="space-y-3 flex-1">
                            {analyticsData.gradeDistribution.map((item) => (
                                <div key={item.grade} className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                                    <div className="flex-1 min-w-0">
                                        <p className="text-xs font-bold text-slate-700 truncate">{item.grade}</p>
                                    </div>
                                    <span className="text-sm font-black text-slate-900">{item.count}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Per-Course Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="p-6 border-b border-slate-100">
                    <h2 className="text-lg font-black text-slate-900">Course Performance Breakdown</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full">
                        <thead>
                            <tr className="bg-slate-50 border-b border-slate-100">
                                {["Course", "Students", "Avg Grade", "Completion", "Status"].map(h => (
                                    <th key={h} className="text-left px-6 py-3 text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</th>
                                ))}
                            </tr>
                        </thead>
                        <tbody>
                            {teacherCourses.map((course, i) => (
                                <tr key={course.id} className={cn("hover:bg-slate-50 transition-colors", i < teacherCourses.length - 1 && "border-b border-slate-100")}>
                                    <td className="px-6 py-4">
                                        <p className="font-black text-slate-800 text-sm">{course.name}</p>
                                        <p className="text-xs text-slate-400 font-medium">{course.code}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className="font-bold text-slate-700 text-sm">{course.studentsEnrolled}</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <p className={cn("font-black text-sm", course.avgGrade >= 90 ? "text-emerald-600" : course.avgGrade >= 80 ? "text-sky-600" : "text-amber-600")}>{course.avgGrade}%</p>
                                    </td>
                                    <td className="px-6 py-4">
                                        <div className="flex items-center gap-3">
                                            <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                                <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                                            </div>
                                            <span className="text-sm font-bold text-indigo-600">{course.completionRate}%</span>
                                        </div>
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", course.status === "active" ? "bg-emerald-50 text-emerald-600 border border-emerald-100" : "bg-slate-100 text-slate-500")}>
                                            {course.status === "active" ? "Active" : "Completed"}
                                        </span>
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
