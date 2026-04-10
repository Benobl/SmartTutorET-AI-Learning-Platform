"use client"

import { useState, useMemo } from "react"
import { attendanceSummary, attendanceRecords } from "@/lib/student-data"
import { cn } from "@/lib/utils"
import {
    CalendarCheck,
    CheckCircle2,
    XCircle,
    Clock,
    AlertCircle,
    Flame,
    Zap,
    Target,
    Activity,
    ChevronLeft,
    ChevronRight,
    CalendarDays,
    ArrowUpRight,
    Sparkles,
    TrendingUp,
    Award
} from "lucide-react"

import { ModernDataTable } from "@/components/dashboards/student/modern-data-table"
import { Button } from "@/components/ui/button"

export default function StudentAttendance() {
    const [selectedGrade, setSelectedGrade] = useState("12")
    const [selectedSemester, setSelectedSemester] = useState("1")
    const [currentMonthIndex, setCurrentMonthIndex] = useState(0)

    const semester1Months = ["Meskerem", "Tikimt", "Hidar", "Tahsas", "Tir"]
    const semester2Months = ["Yekatit", "Megabit", "Miazia", "Ginbot", "Sene"]
    const activeMonths = selectedSemester === "1" ? semester1Months : semester2Months
    const currentMonth = activeMonths[currentMonthIndex]


    const { totalClasses, present, absent, late, excused, streak, perCourse } = attendanceSummary
    const overallRate = Math.round((present / totalClasses) * 100)

    // Generate month-specific mock data
    const days = ["MON", "TUE", "WED", "THU", "FRI", "SAT"]
    const weeks = useMemo(() => [
        { label: "WEEK 01", data: ["present", "present", "present", "late", "present", "present"] },
        { label: "WEEK 02", data: ["present", "present", "absent", "present", "present", "excused"] },
        { label: "WEEK 03", data: ["present", "present", "present", "present", "late", "present"] },
        { label: "WEEK 04", data: ["present", "present", "present", "present", "present", "present"] },
    ], [selectedGrade, selectedSemester, currentMonthIndex])

    const statusStyles = (status: string) => {
        switch (status) {
            case "present": return "bg-emerald-50 border-emerald-100/50 text-emerald-600 shadow-sm hover:shadow-emerald-200/50"
            case "absent": return "bg-rose-50 border-rose-100/50 text-rose-600 shadow-sm hover:shadow-rose-200/50"
            case "late": return "bg-amber-50 border-amber-100/50 text-amber-600 shadow-sm hover:shadow-amber-200/50"
            case "excused": return "bg-indigo-50 border-indigo-100/50 text-indigo-600 shadow-sm hover:shadow-indigo-200/50"
            default: return "bg-white/50 border-slate-100"
        }
    }

    const accentColor = (status: string) => {
        switch (status) {
            case "present": return "bg-emerald-500"
            case "absent": return "bg-rose-500"
            case "late": return "bg-amber-500"
            case "excused": return "bg-indigo-500"
            default: return "bg-slate-200"
        }
    }

    const nextMonth = () => {
        setCurrentMonthIndex((prev) => (prev + 1) % activeMonths.length)
    }

    const prevMonth = () => {
        setCurrentMonthIndex((prev) => (prev - 1 + activeMonths.length) % activeMonths.length)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header & Advanced Filter Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase tracking-widest border border-emerald-100">Consistency Tracker</span>
                            <Sparkles className="w-4 h-4 text-emerald-400 fill-emerald-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Attendance <span className='text-emerald-500'>Vault</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Precision tracking of your academic presence and daily engagement patterns.
                        </p>
                    </div>

                    <div className="flex flex-wrap items-center gap-4">
                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1">
                            {["9", "10", "11", "12"].map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={cn(
                                        "h-12 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                        selectedGrade === grade
                                            ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/10 border border-emerald-100"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                    )}
                                >
                                    Grade {grade}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1">
                            {["1", "2"].map((sem) => (
                                <button
                                    key={sem}
                                    onClick={() => setSelectedSemester(sem)}
                                    className={cn(
                                        "h-12 px-6 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                        selectedSemester === sem
                                            ? "bg-white text-emerald-600 shadow-xl shadow-emerald-500/10 border border-emerald-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Semester {sem}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Month Picker & Break Info */}
                <div className="flex flex-col items-center gap-4">
                    <div className="flex items-center gap-4 bg-white/80 backdrop-blur-md p-2 rounded-[32px] border border-slate-200 shadow-xl">
                        <button onClick={prevMonth} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all hover:scale-105">
                            <ChevronLeft className="w-6 h-6 text-slate-600" />
                        </button>
                        <div className="px-8 text-center min-w-[140px]">
                            <span className="text-xs font-black text-slate-900 uppercase tracking-[0.2em]">{currentMonth}</span>
                        </div>
                        <button onClick={nextMonth} className="w-12 h-12 rounded-2xl flex items-center justify-center border border-slate-100 bg-white shadow-sm hover:bg-slate-50 transition-all hover:scale-105">
                            <ChevronRight className="w-6 h-6 text-slate-600" />
                        </button>
                    </div>
                    {selectedSemester === "1" && currentMonthIndex === 4 && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-indigo-500 animate-pulse bg-indigo-50 px-4 py-1.5 rounded-full border border-indigo-100">
                            <CalendarCheck className="w-3 h-3" /> 15-Day Semester Break Approaching
                        </div>
                    )}
                    {/* Exam Indicators */}
                    {((selectedSemester === "1" && currentMonthIndex === 2) || (selectedSemester === "2" && currentMonthIndex === 2)) && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-amber-500 animate-bounce bg-amber-50 px-4 py-1.5 rounded-full border border-amber-100 shadow-sm">
                            <Sparkles className="w-3 h-3" /> Midterm Exams Period
                        </div>
                    )}
                    {((selectedSemester === "1" && currentMonthIndex === 4) || (selectedSemester === "2" && currentMonthIndex === 4)) && (
                        <div className="flex items-center gap-2 text-[10px] font-black uppercase tracking-widest text-rose-500 animate-pulse bg-rose-50 px-4 py-1.5 rounded-full border border-rose-100 shadow-sm">
                            <Award className="w-3 h-3" /> Final Exams Period
                        </div>
                    )}
                </div>


            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Overall Rate", value: `${overallRate}%`, icon: Zap, color: "emerald", sub: "+1.2% from last month" },
                    { label: "Class Streak", value: `${streak}d`, icon: Flame, color: "orange", sub: "Personal Record!" },
                    { label: "Goal Progress", value: "95%", icon: Target, color: "sky", sub: "On Track for Excellence" },
                    { label: "Fidelity Score", value: "High", icon: Activity, color: "indigo", sub: "Consistent Attendance" },
                ].map((stat, i) => (
                    <div key={i} className="group p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 relative overflow-hidden">
                        <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity", `bg-${stat.color}-500`)} />
                        <div className="flex items-center justify-between mb-6">
                            <div className={cn("p-4 rounded-2xl bg-slate-50 border border-slate-100 shadow-sm transition-all duration-500 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md", `text-${stat.color}-500`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-400 border border-slate-100 uppercase tracking-tighter">Verified</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 group-hover:text-emerald-600 transition-colors tracking-tight">{stat.value}</h3>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest mt-1">{stat.label}</p>
                        <div className="mt-4 pt-4 border-t border-slate-50">
                            <p className="text-[10px] font-bold text-slate-500 flex items-center gap-2">
                                <TrendingUp className="w-3.5 h-3.5 text-emerald-500" />
                                {stat.sub}
                            </p>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
                {/* Visual Heatmap */}
                <div className="xl:col-span-8 p-12 rounded-[56px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 relative overflow-hidden group">
                    <div className="flex items-center justify-between mb-12">
                        <div className="flex items-center gap-4">
                            <div className="w-3 h-10 bg-emerald-500 rounded-full shadow-lg shadow-emerald-500/30" />
                            <div>
                                <h3 className="text-2xl font-black text-slate-900 uppercase tracking-tight">{currentMonth} Heatmap</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Daily Presence Analysis</p>
                            </div>
                        </div>
                        <div className="px-6 py-2 bg-slate-900 rounded-2xl border border-slate-800 flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-white uppercase tracking-widest">Active Monitoring</span>
                        </div>
                    </div>

                    <div className="space-y-8">
                        {/* Day headers */}
                        <div className="flex gap-5 ml-32">
                            {days.map((d) => (
                                <div key={d} className="flex-1 text-center text-[10px] text-slate-400 font-black uppercase tracking-widest">{d}</div>
                            ))}
                        </div>

                        {/* Weeks */}
                        {weeks.map((week, wi) => (
                            <div key={wi} className="flex items-center gap-8 group/week">
                                <span className="w-24 text-[11px] text-slate-400 font-black uppercase tracking-widest text-right shrink-0 group-hover/week:text-emerald-500 transition-colors">{week.label}</span>
                                <div className="flex gap-4 flex-1">
                                    {week.data.map((status, di) => (
                                        <div
                                            key={di}
                                            className={cn(
                                                "flex-1 h-20 rounded-[28px] transition-all duration-500 hover:scale-105 hover:-translate-y-1.5 cursor-pointer relative group/cell border p-1.5 flex items-center justify-center",
                                                statusStyles(status)
                                            )}
                                        >
                                            <div className={cn("w-full h-full rounded-[20px] transition-all duration-300", accentColor(status), "opacity-20 group-hover/cell:opacity-100")} />

                                            {/* Status Icon Indicator */}
                                            <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover/cell:opacity-100 transition-opacity">
                                                {status === 'present' && <CheckCircle2 className="w-6 h-6 text-white" />}
                                                {status === 'absent' && <XCircle className="w-6 h-6 text-white" />}
                                                {status === 'late' && <Clock className="w-6 h-6 text-white" />}
                                                {status === 'excused' && <AlertCircle className="w-6 h-6 text-white" />}
                                            </div>

                                            {/* Hover Detail */}
                                            <div className="absolute -top-16 left-1/2 -translate-x-1/2 px-5 py-3 bg-slate-900/95 backdrop-blur-xl rounded-[20px] text-[11px] text-white font-black opacity-0 group-hover/cell:opacity-100 transition-all shadow-2xl z-20 pointer-events-none scale-90 group-hover/cell:scale-100 border border-white/10 min-w-[120px] text-center">
                                                <p className="uppercase tracking-widest opacity-60 text-[9px] mb-1">{days[di]} • {week.label}</p>
                                                <p className="capitalize text-emerald-400 text-sm">{status}</p>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            </div>
                        ))}

                        {/* Legend */}
                        <div className="flex items-center gap-10 mt-12 pt-10 border-t border-slate-50 justify-center">
                            {[
                                { label: "Present", color: "emerald", icon: CheckCircle2 },
                                { label: "Absent", color: "rose", icon: XCircle },
                                { label: "Late", color: "amber", icon: Clock },
                                { label: "Excused", color: "indigo", icon: AlertCircle },
                            ].map((l) => (
                                <div key={l.label} className="flex flex-col items-center gap-3 group cursor-help">
                                    <div className={cn(
                                        "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:scale-110 shadow-sm",
                                        l.color === "emerald" ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                            l.color === "rose" ? "bg-rose-50 border-rose-100 text-rose-500" :
                                                l.color === "amber" ? "bg-amber-50 border-amber-100 text-amber-500" :
                                                    "bg-indigo-50 border-indigo-100 text-indigo-500"
                                    )}>
                                        <l.icon className="w-5 h-5" />
                                    </div>
                                    <span className="text-[10px] text-slate-400 font-black uppercase tracking-widest group-hover:text-slate-900 transition-colors tracking-widest">{l.label}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Vertical Stats */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="p-10 rounded-[48px] bg-white text-slate-900 shadow-xl border border-slate-100 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 blur-3xl rounded-full translate-x-10 -translate-y-10" />
                        <h4 className="text-xl font-black mb-6 flex items-center gap-3 uppercase tracking-tight text-slate-900">
                            <ArrowUpRight className="w-6 h-6 text-emerald-500" />
                            Engagement Insights
                        </h4>
                        <div className="space-y-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-emerald-100 transition-all group/card">
                                <p className="text-[10px] font-black text-emerald-600 uppercase tracking-widest mb-1">Stability Index</p>
                                <p className="text-2xl font-black italic tracking-tighter text-slate-900">94.2/100</p>
                                <p className="text-xs text-slate-500 mt-2 font-medium">You are more consistent than 88% of Grade {selectedGrade} students.</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 hover:bg-white hover:border-amber-100 transition-all group/card">
                                <p className="text-[10px] font-black text-amber-600 uppercase tracking-widest mb-1">Impact Analysis</p>
                                <p className="text-2xl font-black tracking-tighter text-slate-900">2 Sessions Missed</p>
                                <p className="text-xs text-slate-500 mt-2 font-medium">Missed sessions recorded in <span className="text-slate-900 font-bold">Chemistry</span>. We recommend reviewing the recordings.</p>
                            </div>
                        </div>
                    </div>


                    <div className="p-8 rounded-[48px] bg-white border border-slate-100 shadow-xl">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest mb-6">Course Attendance</h4>
                        <div className="space-y-6">
                            {perCourse.slice(0, 4).map((course, idx) => (
                                <div key={idx} className="space-y-2.5">
                                    <div className="flex justify-between items-end">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{course.course}</span>
                                        <span className="text-xs font-black text-emerald-600">{course.rate}%</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100 p-0.5">
                                        <div
                                            className="h-full bg-emerald-500 rounded-full transition-all duration-1000 shadow-[0_0_10px_rgba(16,185,129,0.3)]"
                                            style={{ width: `${course.rate}%` }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>

            {/* Attendance Ledger */}
            <div className="relative z-10 pt-10">
                <div className="mb-8 pl-6 border-l-4 border-emerald-500">
                    <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight">Attendance <span className="text-slate-400">Archive</span></h3>
                    <p className="text-slate-500 text-sm font-medium">Detailed logs for Grade {selectedGrade} • {currentMonth}</p>
                </div>

                <ModernDataTable
                    data={attendanceRecords.map((r, i) => ({ ...r, id: i }))}
                    columns={[
                        {
                            header: "Date",
                            accessorKey: "date",
                            cell: (row) => (
                                <div className="flex items-center gap-4">
                                    <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center border border-slate-100 text-slate-400">
                                        <CalendarCheck className="w-5 h-5" />
                                    </div>
                                    <span className="font-black text-slate-900 uppercase tracking-tight text-sm">{row.date}</span>
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
                                        "inline-flex items-center gap-2 px-4 py-1.5 rounded-xl border font-black text-[10px] uppercase tracking-widest shadow-sm",
                                        status === "present" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                            status === "absent" ? "bg-rose-50 text-rose-600 border-rose-100" :
                                                status === "late" ? "bg-amber-50 text-amber-600 border-amber-100" :
                                                    "bg-indigo-50 text-indigo-600 border-indigo-100"
                                    )}>
                                        <div className={cn("w-2 h-2 rounded-full", accentColor(status))} />
                                        {status}
                                    </div>
                                )
                            }
                        }
                    ]}
                    searchPlaceholder="Filter subject or date..."
                />
            </div>
        </div>
    )
}
