"use client"

import {
    BarChart3, TrendingUp, TrendingDown, Users,
    BookOpen, Sparkles, Activity, AlertCircle,
    ChevronRight, ArrowUpRight, GraduationCap,
    CheckCircle2, Brain, History, Filter, Search,
    LayoutGrid, PieChart, LineChart, Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MOCK_WEAKNESSES = [
    { subject: "Quantum Tunnelling", grade: "12", difficulty: "High", impacted: 14, status: "critical" },
    { subject: "Trigonometric Derivations", grade: "11", difficulty: "Medium", impacted: 8, status: "warning" },
    { subject: "Newtonian Mechanics", grade: "10", difficulty: "Low", impacted: 5, status: "stable" },
]

export default function TeacherAnalytics() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Data Intelligence</span>
                            <BarChart3 className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Academic <span className='text-sky-600'>Insights</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Analyze class performance, identify individual student weaknesses, and leverage AI to predict national curriculum exam readiness.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <ArrowUpRight className="w-4 h-4" /> Download Full Report
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <History className="w-4 h-4 mr-2" /> Comparative Analysis
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-white p-2 rounded-[28px] border border-slate-100 shadow-sm flex gap-2">
                        {['Week', 'Month', 'Term'].map(period => (
                            <button key={period} className={cn(
                                "h-12 px-6 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all",
                                period === 'Month' ? "bg-sky-600 text-white shadow-xl shadow-sky-500/10" : "text-slate-400 hover:text-slate-600"
                            )}>{period}</button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Class Average", value: "78%", trend: "+4%", status: "up", icon: TrendingUp, color: "text-sky-500 bg-sky-50 border-sky-100" },
                    { label: "Syllabus Covered", value: "62%", trend: "On Track", status: "none", icon: BookOpen, color: "text-sky-500 bg-sky-50 border-sky-100" },
                    { label: "Student Engagement", value: "92%", trend: "+12%", status: "up", icon: Activity, color: "text-sky-500 bg-sky-50 border-sky-100" },
                    { label: "Exam Readiness", value: "B+", trend: "Static", status: "none", icon: Target, color: "text-violet-500 bg-violet-50 border-violet-100" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 flex flex-col justify-between min-h-[220px] group hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center justify-between">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.color)}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                stat.status === 'up' ? "bg-sky-50 text-sky-600" : "bg-slate-50 text-slate-400"
                            )}>{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h2 className="text-4xl font-black text-slate-900">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Weakness Map */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 p-12 rounded-[56px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/10 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic tracking-tight">Curriculum <span className='text-sky-600'>Weakness Heatmap</span></h3>
                            <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Identified via AI Assessment scans</p>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">Global Grades 9-12</Button>
                    </div>

                    <div className="space-y-6">
                        {MOCK_WEAKNESSES.map((item, idx) => (
                            <div key={idx} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 hover:bg-sky-50/30 hover:border-sky-100 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm",
                                            item.status === 'critical' ? "bg-rose-50 border-rose-100 text-rose-500" :
                                                item.status === 'warning' ? "bg-orange-50 border-orange-100 text-orange-500" :
                                                    "bg-sky-50 border-sky-100 text-sky-500"
                                        )}>
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-slate-900 uppercase tracking-tight">{item.subject}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Grade {item.grade} • Impacting {item.impacted} Students</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Difficulty</p>
                                        <p className="text-xs font-black text-slate-900 uppercase">{item.difficulty}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            item.status === 'critical' ? "bg-rose-500" : "bg-sky-500"
                                        )} style={{ width: `${(item.impacted / 45) * 100}%` }} />
                                    </div>
                                    <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity">
                                        Intervention Plan <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2">Student Growth</h3>
                                <p className="text-xs text-slate-400 font-bold uppercase tracking-widest">Aggregate Readiness Index</p>
                            </div>
                            <div className="flex items-center justify-center py-6">
                                <div className="w-40 h-40 rounded-full border-[12px] border-white/5 flex items-center justify-center relative">
                                    <div className="absolute inset-0 border-[12px] border-sky-500 rounded-full border-t-transparent -rotate-45" />
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-white leading-none">82</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-sky-400 mt-1">Points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-black text-white">4.2k</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Solved Qs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-sky-400">98%</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-500">Positive Trend</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/5 relative group overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100"><Sparkles className="w-5 h-5" /></div>
                                <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">AI Prediction</h3>
                            </div>
                            <p className="text-xs text-slate-500 font-medium leading-relaxed">
                                Based on current performance, 89 students (92%) are expected to score above Grade-Point 3.5 in the national exam.
                            </p>
                            <Button className="w-full h-12 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                                Detailed Forecast
                            </Button>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

        </div>
    )
}
