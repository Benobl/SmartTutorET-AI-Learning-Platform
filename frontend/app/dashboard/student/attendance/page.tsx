"use client"

import { attendanceSummary, attendanceRecords } from "@/lib/student-data"
import { cn } from "@/lib/utils"
import { CalendarCheck, CheckCircle2, XCircle, Clock, AlertCircle, Flame, TrendingUp, Zap, Target, Activity } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { ModernDataTable } from "@/components/dashboards/student/modern-data-table"

/**
 * Redesigned Attendance Tracking page — features a high-impact, 
 * glass-morphic UI with vibrant gradients and advanced data visualization.
 */
export default function StudentAttendance() {
    const { totalClasses, present, absent, late, excused, streak, perCourse } = attendanceSummary
    const overallRate = Math.round((present / totalClasses) * 100)

    // Generate last 4 weeks of mock heatmap data
    const days = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat"]
    const weeks = [
        { label: "Week 1", data: ["present", "present", "present", "late", "present", "present"] },
        { label: "Week 2", data: ["present", "present", "absent", "present", "present", "excused"] },
        { label: "Week 3", data: ["present", "present", "present", "present", "late", "present"] },
        { label: "Week 4", data: ["present", "present", "present", "present", "present", "present"] },
    ]

    const statusStyles = (status: string) => {
        switch (status) {
            case "present": return "bg-emerald-400/20 text-emerald-600 border-emerald-500/20 shadow-[0_0_15px_rgba(52,211,153,0.1)]"
            case "absent": return "bg-red-400/20 text-red-600 border-red-500/20 shadow-[0_0_15px_rgba(248,113,113,0.1)]"
            case "late": return "bg-amber-400/20 text-amber-600 border-amber-500/20 shadow-[0_0_15px_rgba(251,191,36,0.1)]"
            case "excused": return "bg-indigo-400/20 text-indigo-600 border-indigo-500/20 shadow-[0_0_15px_rgba(129,140,248,0.1)]"
            default: return "bg-white/50 border-white/50"
        }
    }

    const accentColor = (status: string) => {
        switch (status) {
            case "present": return "bg-emerald-500"
            case "absent": return "bg-red-500"
            case "late": return "bg-amber-500"
            case "excused": return "bg-indigo-500"
            default: return "bg-slate-200"
        }
    }

    return (
        <div className="relative space-y-8 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Background Accent Gradients */}
            <div className="absolute -top-20 -right-20 w-[500px] h-[500px] bg-sky-200/20 blur-3xl rounded-full opacity-50 pointer-events-none" />
            <div className="absolute top-[40%] -left-20 w-[400px] h-[400px] bg-indigo-200/20 blur-3xl rounded-full opacity-40 pointer-events-none" />

            {/* Header Section */}
            <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6 pb-4">
                <div>
                    <div className="flex items-center gap-3 mb-2">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">Real-time Analytics</span>
                        <div className="h-px w-12 bg-sky-200" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-none mb-2">Engagement <span className="text-sky-500 italic">Insights</span></h1>
                    <p className="text-slate-500 text-sm font-medium">Tracking your academic presence and learning stability.</p>
                </div>

                <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md px-6 py-4 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-200/20 group hover:scale-[1.02] transition-all cursor-pointer">
                    <div className="relative">
                        <Activity className="w-8 h-8 text-sky-500 group-hover:animate-pulse" />
                        <div className="absolute -top-1 -right-1 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white animate-bounce" />
                    </div>
                    <div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">Stability Score</p>
                        <h3 className="text-2xl font-black text-slate-900">Alpha-92</h3>
                    </div>
                </div>
            </div>

            {/* Performance Metrics Hero */}
            <div className="relative z-10 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Average Rate", value: `${overallRate}%`, icon: Zap, color: "sky", trend: "+2.4%" },
                    { label: "Total Sessions", value: totalClasses, icon: Target, color: "indigo", trend: "Normal" },
                    { label: "Max Streak", value: `${streak}d`, icon: Flame, color: "orange", trend: "Rising" },
                    { label: "Consistency", value: "High", icon: Activity, color: "emerald", trend: "Stable" },
                ].map((stat) => (
                    <div key={stat.label} className="relative group p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 overflow-hidden">
                        <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity", `bg-${stat.color}-500`)} />
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn("p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:scale-110 transition-all duration-500", `text-${stat.color}-500`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-emerald-50 text-emerald-600 border border-emerald-100 uppercase tracking-tighter">{stat.trend}</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                    </div>
                ))}
            </div>

            <div className="relative z-10 grid grid-cols-1 xl:grid-cols-12 gap-6">
                {/* Advanced Heatmap Card */}
                <div className="xl:col-span-8 p-10 rounded-[48px] bg-white border border-slate-200 shadow-xl shadow-slate-200/30 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-2.5 h-8 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30" />
                            <h3 className="text-2xl font-black text-slate-900 tracking-tight">Engagement Matrix</h3>
                        </div>
                        <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-2xl border border-slate-100">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-600 uppercase tracking-widest">Active Tracking</span>
                        </div>
                    </div>

                    <div className="space-y-6">
                        {/* Day headers */}
                        <div className="flex gap-4 ml-24">
                            {days.map((d) => (
                                <div key={d} className="flex-1 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">{d}</div>
                            ))}
                        </div>

                        {/* Weeks with visual depth */}
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex items-center gap-4 group/week">
                                <span className="w-20 text-[10px] text-slate-400 font-black uppercase tracking-widest text-right shrink-0 opacity-50 group-hover/week:opacity-100 transition-opacity">{week.label}</span>
                                <div className="flex gap-4 flex-1">
                                    {week.data.map((status, di) => (
                                        <div
                                            key={di}
                                            className={cn(
                                                "flex-1 h-16 rounded-3xl transition-all duration-500 hover:scale-110 hover:-translate-y-1 cursor-pointer relative group/cell border-2 p-1",
                                                statusStyles(status)
                                            )}
                                        >
                                            <div className={cn("w-full h-full rounded-2xl shadow-inner", accentColor(status), "opacity-30 group-hover/cell:opacity-60 transition-opacity")} />

                                            {/* Hover Detail */}
                                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-5 py-3 bg-slate-900/95 backdrop-blur-xl rounded-[20px] text-[11px] text-white font-black opacity-0 group-hover/cell:opacity-100 transition-all shadow-2xl z-20 pointer-events-none scale-90 group-hover/cell:scale-100 border border-white/10 flex flex-col items-center gap-1">
                                                <span className="uppercase tracking-widest opacity-60">{days[di]} Afternoon</span>
                                                <span className="capitalize text-sky-400 text-sm">{status}</span>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Advanced Legend */}
                        <div className="flex items-center gap-8 mt-12 pt-10 border-t border-slate-50 justify-center">
                            {[
                                { label: "Present", color: "emerald", icon: CheckCircle2 },
                                { label: "Delayed", color: "amber", icon: Clock },
                                { label: "Absent", color: "red", icon: XCircle },
                                { label: "Excused", color: "indigo", icon: AlertCircle },
                            ].map((l) => (
                                <div key={l.label} className="flex flex-col items-center gap-3 group cursor-help transition-all hover:-translate-y-1">
                                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border transition-all shadow-sm group-hover:shadow-xl", `bg-${l.color}-50 border-${l.color}-100 text-${l.color}-500 group-hover:scale-110 group-hover:rotate-6`)}>
                                        <l.icon className="w-6 h-6" />
                                    </div>
                                    <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest group-hover:text-slate-900">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                    <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-sky-500/5 blur-3xl rounded-full" />
                </div>

                {/* Vertical Stats Column */}
                <div className="xl:col-span-4 space-y-6">
                    {/* Focus Breakdown */}
                    <div className="p-8 rounded-[48px] bg-white border border-slate-200 shadow-xl shadow-slate-100/50 relative overflow-hidden group">
                        <div className="flex items-center gap-3 mb-8">
                            <TrendingUp className="w-5 h-5 text-indigo-500" />
                            <h4 className="text-lg font-black text-slate-900">Course Fidelity</h4>
                        </div>
                        <div className="space-y-6 relative z-10">
                            {perCourse.slice(0, 4).map((course, idx) => (
                                <div key={idx} className="space-y-3 group/item">
                                    <div className="flex justify-between items-end">
                                        <div>
                                            <p className="text-[10px] text-slate-400 font-black uppercase tracking-widest mb-1">{course.course}</p>
                                            <p className="text-sm font-black text-slate-900 group-hover/item:text-indigo-600 transition-colors uppercase tracking-tight">{course.rate}% Reliable</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-[11px] font-black text-slate-800">{course.attended}/{course.total}</span>
                                        </div>
                                    </div>
                                    <div className="h-2.5 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div
                                            className={cn("h-full rounded-full transition-all duration-1000",
                                                course.rate >= 90 ? "bg-emerald-500" : course.rate >= 80 ? "bg-sky-500" : "bg-amber-500")}
                                            style={{ width: `${course.rate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Insight Card */}
                    <div className="p-8 rounded-[48px] bg-sky-600 text-white shadow-2xl shadow-sky-200/50 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 blur-3xl rounded-full translate-x-10 -translate-y-10 group-hover:scale-150 transition-transform duration-1000" />
                        <div className="relative z-10">
                            <div className="w-14 h-14 rounded-[20px] bg-white text-sky-600 flex items-center justify-center mb-6 shadow-xl">
                                <AlertCircle className="w-8 h-8" />
                            </div>
                            <h4 className="text-xl font-black mb-2 leading-tight">Attendance Goal</h4>
                            <p className="text-sky-100 text-sm font-medium leading-relaxed opacity-80">You're only <span className="font-black text-white">3 classes</span> away from reaching a <span className="font-black text-white">95% score</span> this month!</p>
                            <button className="mt-6 w-full py-4 bg-white text-sky-600 rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg hover:shadow-white/20 hover:-translate-y-1 transition-all">Keep Going</button>
                        </div>
                    </div>
                </div>
            </div>
            <div className="relative z-10 pt-10">
                <ModernDataTable
                    title="Detailed Attendance Logs"
                    description="A comprehensive history of your classroom presence and engagement."
                    data={attendanceRecords.map((r, i) => ({ ...r, id: i }))}
                    columns={[
                        {
                            header: "Date",
                            accessorKey: "date",
                            cell: (row) => (
                                <div className="flex items-center gap-3">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                                        <CalendarCheck className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-slate-900 tracking-tight">{row.date}</span>
                                </div>
                            )
                        },
                        {
                            header: "Course",
                            accessorKey: "course",
                            cell: (row) => <span className="font-black text-slate-700 uppercase tracking-tight text-xs">{row.course}</span>
                        },
                        {
                            header: "Period",
                            accessorKey: "period",
                            className: "text-center",
                            cell: (row) => <span className="px-3 py-1 rounded-lg bg-slate-50 border border-slate-100 text-[10px] font-black text-slate-500 uppercase tracking-widest">{row.period}</span>
                        },
                        {
                            header: "Status",
                            accessorKey: "status",
                            className: "text-right",
                            cell: (row) => {
                                const status = row.status as string
                                return (
                                    <div className={cn(
                                        "inline-flex items-center gap-2 px-3 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-sm",
                                        status === "present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            status === "absent" ? "bg-red-50 text-red-600 border-red-100" :
                                                status === "late" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                    )}>
                                        <div className={cn("w-1.5 h-1.5 rounded-full",
                                            status === "present" ? "bg-emerald-500" :
                                                status === "absent" ? "bg-red-500" :
                                                    status === "late" ? "bg-amber-500" :
                                                        "bg-indigo-500"
                                        )} />
                                        {status}
                                    </div>
                                )
                            }
                        }
                    ]}
                    searchPlaceholder="Search by course or date..."
                />
            </div>
        </div>
    )
}
