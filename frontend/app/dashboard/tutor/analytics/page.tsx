"use client"

import { useState } from "react"
import {
    BarChart3, TrendingUp, TrendingDown, Users,
    BookOpen, Sparkles, Activity, AlertCircle,
    ChevronRight, ArrowUpRight, GraduationCap,
    CheckCircle2, Brain, History, Filter, Search,
    LayoutGrid, PieChart, LineChart, Target, Loader2, Download
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"

const MOCK_WEAKNESSES = [
    { subject: "Quantum Tunnelling", grade: "12", difficulty: "High", impacted: 14, status: "critical" },
    { subject: "Trigonometric Derivations", grade: "11", difficulty: "Medium", impacted: 8, status: "warning" },
    { subject: "Newtonian Mechanics", grade: "10", difficulty: "Low", impacted: 5, status: "stable" },
]

export default function TeacherAnalytics() {
    const [period, setPeriod] = useState<'Week' | 'Month' | 'Term'>('Month')
    const [isDownloading, setIsDownloading] = useState(false)
    const [isForecastOpen, setIsForecastOpen] = useState(false)
    const [isInterventionOpen, setIsInterventionOpen] = useState(false)

    const handleDownload = () => {
        setIsDownloading(true)
        setTimeout(() => {
            setIsDownloading(false)
            toast({
                title: "Report Generated",
                description: "Academic_Insights_April.pdf is ready for download.",
            })
        }, 2000)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-500/10 text-sky-500 text-[10px] font-black uppercase tracking-widest border border-sky-500/20 shadow-sm">Data Intelligence</span>
                            <BarChart3 className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight leading-none mb-3 uppercase">
                            Academic <span className='text-sky-600'>Insights</span>
                        </h1>
                        <p className="text-muted-foreground text-sm font-medium max-w-md">
                            Analyze class performance, identify individual student weaknesses, and leverage AI to predict national curriculum exam readiness.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="h-14 px-8 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-2xl shadow-sky-500/20 transition-all active:scale-95"
                        >
                            {isDownloading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Download className="w-4 h-4" />}
                            {isDownloading ? "Generating..." : "Download Full Report"}
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-border bg-card text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-500/10 transition-all">
                            <History className="w-4 h-4 mr-2" /> Comparative Analysis
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="bg-card p-2 rounded-[28px] border border-border shadow-sm flex gap-2">
                        {['Week', 'Month', 'Term'].map((p) => (
                            <button
                                key={p}
                                onClick={() => setPeriod(p as any)}
                                className={cn(
                                    "h-12 px-6 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all",
                                    period === p ? "bg-sky-600 text-white shadow-xl shadow-sky-500/10" : "text-muted-foreground hover:text-foreground"
                                )}
                            >
                                {p}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {/* Performance Metric Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                {[
                    { label: "Class Average", value: "78%", trend: "+4%", status: "up", icon: TrendingUp, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
                    { label: "Syllabus Covered", value: "62%", trend: "On Track", status: "none", icon: BookOpen, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
                    { label: "Student Engagement", value: "92%", trend: "+12%", status: "up", icon: Activity, color: "text-sky-500 bg-sky-500/10 border-sky-500/20" },
                    { label: "Exam Readiness", value: "B+", trend: "Static", status: "none", icon: Target, color: "text-violet-500 bg-violet-500/10 border-violet-500/20" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-card border border-border shadow-xl shadow-black/20 flex flex-col justify-between min-h-[220px] group hover:-translate-y-2 transition-transform duration-500">
                        <div className="flex items-center justify-between">
                            <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border shadow-sm", stat.color)}>
                                <stat.icon className="w-7 h-7" />
                            </div>
                            <span className={cn(
                                "px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest",
                                stat.status === 'up' ? "bg-sky-500/10 text-sky-500" : "bg-muted text-muted-foreground"
                            )}>{stat.trend}</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest leading-none mb-1.5">{stat.label}</p>
                            <h2 className="text-4xl font-black text-foreground">{stat.value}</h2>
                        </div>
                    </div>
                ))}
            </div>

            {/* AI Weakness Map */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                <div className="xl:col-span-2 p-12 rounded-[56px] bg-card border border-border shadow-2xl shadow-black/20 relative overflow-hidden">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 mb-12">
                        <div>
                            <h3 className="text-2xl font-black text-foreground uppercase italic tracking-tight">Curriculum <span className='text-sky-600'>Weakness Heatmap</span></h3>
                            <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">Identified via AI Assessment scans ({period})</p>
                        </div>
                        <Button variant="outline" className="h-12 px-6 rounded-xl border-border text-muted-foreground font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-500/10 transition-all">Global Grades 9-12</Button>
                    </div>

                    <div className="space-y-6">
                        {MOCK_WEAKNESSES.map((item, idx) => (
                            <div key={idx} className="p-6 rounded-[32px] bg-muted/30 border border-border hover:bg-sky-500/10 hover:border-sky-500/20 transition-all group">
                                <div className="flex items-center justify-between mb-4">
                                    <div className="flex items-center gap-4">
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center border shadow-sm",
                                            item.status === 'critical' ? "bg-rose-500/10 border-rose-500/20 text-rose-500" :
                                                item.status === 'warning' ? "bg-orange-500/10 border-orange-500/20 text-orange-500" :
                                                    "bg-sky-500/10 border-sky-500/20 text-sky-500"
                                        )}>
                                            <AlertCircle className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <h4 className="text-[15px] font-black text-foreground uppercase tracking-tight">{item.subject}</h4>
                                            <p className="text-[10px] font-bold text-muted-foreground uppercase tracking-widest">Grade {item.grade} • Impacting {item.impacted} Students</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-[10px] font-black text-muted-foreground uppercase tracking-widest mb-1">Difficulty</p>
                                        <p className="text-xs font-black text-foreground uppercase">{item.difficulty}</p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-4">
                                    <div className="flex-1 h-2 bg-slate-200 rounded-full overflow-hidden">
                                        <div className={cn(
                                            "h-full rounded-full transition-all duration-1000",
                                            item.status === 'critical' ? "bg-rose-500" : "bg-sky-500"
                                        )} style={{ width: `${(item.impacted / 45) * 100}%` }} />
                                    </div>
                                    <button
                                        onClick={() => setIsInterventionOpen(true)}
                                        className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 opacity-0 group-hover:opacity-100 transition-opacity"
                                    >
                                        Intervention Plan <ChevronRight className="w-3.5 h-3.5" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-10">
                    <div className="p-10 rounded-[48px] bg-sky-500/10 border border-sky-500/20 text-foreground relative overflow-hidden group shadow-xl shadow-sky-500/5">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div>
                                <h3 className="text-xl font-black uppercase italic tracking-tight mb-2 text-foreground">Student <span className="text-sky-600">Growth</span></h3>
                                <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest">Aggregate Readiness Index</p>
                            </div>
                            <div className="flex items-center justify-center py-6">
                                <div className="w-40 h-40 rounded-full border-[12px] border-sky-500/10 flex items-center justify-center relative shadow-inner bg-card">
                                    <div className="absolute inset-0 border-[12px] border-sky-500 rounded-full border-l-transparent border-t-transparent -rotate-45" />
                                    <div className="text-center">
                                        <p className="text-4xl font-black text-foreground leading-none">82</p>
                                        <p className="text-[9px] font-black uppercase tracking-widest text-sky-600 mt-1">Points</p>
                                    </div>
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="text-center">
                                    <p className="text-xl font-black text-foreground">4.2k</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Solved Qs</p>
                                </div>
                                <div className="text-center">
                                    <p className="text-xl font-black text-sky-600">98%</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-muted-foreground">Positive Trend</p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-10 rounded-[48px] bg-card border border-border shadow-xl shadow-black/5 relative group overflow-hidden">
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center border border-sky-500/20 shadow-sm"><Sparkles className="w-5 h-5" /></div>
                                <h3 className="text-sm font-black text-foreground uppercase tracking-widest">AI Prediction</h3>
                            </div>
                            <p className="text-xs text-muted-foreground font-medium leading-relaxed">
                                Based on current performance, 89 students (92%) are expected to score above Grade-Point 3.5 in the national exam.
                            </p>
                            <Button
                                onClick={() => setIsForecastOpen(true)}
                                className="w-full h-12 rounded-xl bg-foreground text-background hover:bg-sky-600 hover:text-white font-black text-[9px] uppercase tracking-widest shadow-xl transition-all active:scale-95"
                            >
                                Detailed Forecast
                            </Button>
                        </div>
                        <div className="absolute -right-6 -bottom-6 w-24 h-24 bg-sky-500/5 rounded-full blur-2xl" />
                    </div>
                </div>
            </div>

            {/* Prediction Dialog */}
            <Dialog open={isForecastOpen} onOpenChange={setIsForecastOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center mb-4">
                            <Brain className="w-6 h-6" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Detailed <span className="text-sky-600">Forecast</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Predictive modeling for upcoming national exit exams.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="p-6 rounded-3xl bg-muted/30 border border-border space-y-4">
                            <div className="flex justify-between items-center">
                                <span className="text-[10px] font-black uppercase text-muted-foreground">Success Probability</span>
                                <span className="text-xl font-black text-sky-600">92.4%</span>
                            </div>
                            <div className="h-2 bg-muted rounded-full overflow-hidden">
                                <div className="h-full bg-sky-500 w-[92.4%]" />
                            </div>
                        </div>
                        <p className="text-sm text-muted-foreground leading-relaxed italic">
                            "The class shows high proficiency in Physics and Mathematics, with slight variance in English Literature. Target interventions in 'Calculus Applications' could push the average to 95%."
                        </p>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Intervention Dialog */}
            <Dialog open={isInterventionOpen} onOpenChange={setIsInterventionOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Smart <span className="text-rose-500">Intervention</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">AI-generated strategy to bypass curriculum bottlenecks.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="space-y-4">
                            {[
                                "Assign refresher quiz on pre-requisites",
                                "Schedule a 15-min deep-dive live session",
                                "Distribute simplified visual mapping docs"
                            ].map((step, i) => (
                                <div key={i} className="flex items-center gap-4 p-4 rounded-2xl bg-muted/30 border border-border">
                                    <div className="w-8 h-8 rounded-lg bg-sky-500/10 text-sky-500 flex items-center justify-center font-black text-xs">{i + 1}</div>
                                    <p className="text-xs font-bold text-foreground/80">{step}</p>
                                </div>
                            ))}
                        </div>
                        <Button className="w-full h-14 rounded-2xl bg-foreground text-background hover:bg-sky-600 hover:text-white font-black uppercase tracking-widest shadow-xl transition-all">Deploy Strategy</Button>
                    </div>
                </DialogContent>
            </Dialog>

        </div>
    )
}
