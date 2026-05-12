"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { assignmentApi, assessmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileText, 
    Loader2, 
    Search, 
    Sparkles, 
    TrendingUp, 
    Award, 
    BookOpen, 
    Calendar,
    Trophy,
    Shield,
    Zap,
    ChevronRight,
    Target,
    Activity,
    CheckCircle2
} from "lucide-react"

const getGradeColor = (percentage: number) => {
    if (percentage >= 90) return "text-emerald-600 bg-emerald-50 border-emerald-100"
    if (percentage >= 80) return "text-sky-600 bg-sky-50 border-sky-100"
    if (percentage >= 70) return "text-amber-600 bg-amber-50 border-amber-100"
    return "text-rose-600 bg-rose-50 border-rose-100"
}

export default function StudentGradesPage() {
    const [loading, setLoading] = useState(true)
    const [marks, setMarks] = useState<any[]>([])
    const [quizResults, setQuizResults] = useState<any[]>([])
    const [search, setSearch] = useState("")
    const [reportCard, setReportCard] = useState<any>(null)

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const [marksRes, reportRes, quizRes] = await Promise.all([
                assignmentApi.getMyMarks(),
                assignmentApi.getMyGrades(),
                assessmentApi.getSubmissions()
            ])
            setMarks(marksRes?.data || [])
            setReportCard(reportRes?.data || null)
            setQuizResults((quizRes?.data || []).filter((row: any) => row?.gradedAt))
        } catch (error) {
            console.error("Failed to load grades:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()
    }, [fetchData])

    const allResults = useMemo(() => {
        const combined = [
            ...(marks || []).map(m => ({
                ...m,
                type: 'Assignment',
                title: m.assignment?.title,
                subject: m.assignment?.subject?.title,
                score: m.marksObtained,
                total: m.assignment?.maxMarks,
                percent: Math.round((m.marksObtained / (m.assignment?.maxMarks || 1)) * 100),
                date: m.updatedAt
            })),
            ...(quizResults || []).map(q => ({
                ...q,
                type: 'Quiz',
                title: q.assessment?.title,
                subject: q.assessment?.type || 'Assessment',
                score: q.percentage,
                total: 100,
                percent: q.percentage,
                date: q.updatedAt || q.submittedAt
            }))
        ].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime())

        const q = search.toLowerCase().trim()
        if (!q) return combined
        return combined.filter((item) => {
            const title = String(item.title || "").toLowerCase()
            const subject = String(item.subject || "").toLowerCase()
            return title.includes(q) || subject.includes(q)
        })
    }, [marks, quizResults, search])

    const stats = useMemo(() => {
        if (!allResults.length) return { avg: 0, total: 0, highest: 0 }
        const avg = Math.round(allResults.reduce((acc, m) => acc + m.percent, 0) / allResults.length)
        const highest = Math.max(...allResults.map(m => m.percent))
        return { avg, total: allResults.length, highest }
    }, [allResults])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Accessing Records...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32 pt-4 px-4">
            
            {/* HEADER */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Academic Ledger</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Grades & <span className="font-semibold text-slate-900">Performance</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        A clean, immutable record of your academic journey at SmartTutorET.
                    </p>
                </div>

                <div className="flex gap-6">
                    <div className="p-8 rounded-[32px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 transition-all duration-500 min-w-[160px]">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                           <Activity size={12} className="text-sky-500" /> Aggregate
                        </p>
                        <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{stats.avg}%</h3>
                    </div>
                    <div className="p-8 rounded-[32px] bg-slate-900 text-white shadow-xl min-w-[160px] relative overflow-hidden group">
                        <div className="absolute -top-2 -right-2 opacity-10 group-hover:scale-110 transition-transform">
                            <Zap size={60} />
                        </div>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2 relative z-10">Peak Score</p>
                        <h3 className="text-3xl font-semibold text-white tracking-tight relative z-10">{stats.highest}%</h3>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-12 gap-12">
                
                {/* Left: Matrix Sidebar */}
                <div className="xl:col-span-4 space-y-8">
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-slate-900 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Subject Matrix</h4>
                        </div>

                        <div className="space-y-4">
                            {reportCard && Object.entries(reportCard).map(([subject, data]: [string, any]) => (
                                <div key={subject} className="p-6 rounded-[24px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 transition-all duration-300 group">
                                    <div className="flex justify-between items-start mb-4">
                                        <div>
                                            <h5 className="font-bold text-slate-900 text-sm group-hover:text-sky-600 transition-colors">{subject}</h5>
                                            <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-1">Cumulative Grade</p>
                                        </div>
                                        <div className="text-right">
                                            <span className="text-lg font-black text-slate-900">{data.total}</span>
                                            <p className="text-[8px] font-black text-slate-400 uppercase">Points</p>
                                        </div>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                        <div 
                                            className="h-full bg-slate-900 rounded-full transition-all duration-1000" 
                                            style={{ width: `${Math.min(100, (data.total / 500) * 100)}%` }} 
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Quick Tips */}
                    <div className="p-10 rounded-[48px] bg-sky-600 text-white shadow-xl space-y-6">
                        <Sparkles className="w-8 h-8 opacity-50" />
                        <h4 className="text-xl font-bold tracking-tight">Boost Your GPA</h4>
                        <p className="text-sky-100 text-sm leading-relaxed font-medium">
                            Completing AI Tutor modules increases your subject depth score and provides better preparation for quizzes.
                        </p>
                        <Button variant="secondary" className="w-full h-12 rounded-2xl bg-white text-sky-600 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50">
                            Explore Modules
                        </Button>
                    </div>
                </div>

                {/* Right: Detailed Ledger */}
                <div className="xl:col-span-8 space-y-8">
                    <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-sky-600 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Detailed Ledger</h4>
                        </div>
                        <div className="relative w-full md:w-80 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                            <input
                                value={search}
                                onChange={(e) => setSearch(e.target.value)}
                                placeholder="Filter records..."
                                className="w-full h-12 pl-12 pr-6 rounded-2xl border border-slate-100 bg-white text-xs font-medium outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 transition-all placeholder:text-slate-400"
                            />
                        </div>
                    </div>

                    <div className="space-y-4">
                        <AnimatePresence mode="popLayout">
                            {allResults.map((item, idx) => (
                                <motion.div
                                    key={item._id}
                                    layout
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    className="group p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500"
                                >
                                    <div className="flex flex-col md:flex-row items-center justify-between gap-8">
                                        <div className="flex items-center gap-6">
                                            <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-sky-600 group-hover:bg-sky-50 transition-all duration-500">
                                                {item.type === 'Quiz' ? <Target size={24} /> : <FileText size={24} />}
                                            </div>
                                            <div className="space-y-2">
                                                <div className="flex items-center gap-3">
                                                    <span className="px-2 py-0.5 rounded-md bg-slate-100 text-slate-500 text-[9px] font-black uppercase tracking-widest">{item.type}</span>
                                                    <span className="text-[9px] font-bold text-sky-600 uppercase tracking-widest">{item.subject}</span>
                                                </div>
                                                <h4 className="text-xl font-bold text-slate-900 tracking-tight group-hover:text-sky-600 transition-colors">{item.title}</h4>
                                                <div className="flex items-center gap-4 text-[10px] font-medium text-slate-400 uppercase tracking-widest">
                                                    <span className="flex items-center gap-1.5"><Calendar size={12}/> {new Date(item.date).toLocaleDateString()}</span>
                                                    {item.result?.rank && <span className="flex items-center gap-1.5 text-amber-600 font-bold"><Trophy size={12}/> Rank #{item.result.rank}</span>}
                                                </div>
                                            </div>
                                        </div>

                                        <div className="flex items-center gap-10">
                                            <div className="text-right">
                                                <div className="flex items-baseline justify-end gap-1">
                                                    <span className="text-4xl font-black text-slate-900 leading-none tracking-tight">{item.score}</span>
                                                    <span className="text-sm font-bold text-slate-300">/{item.total}</span>
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Verified Marks</p>
                                            </div>
                                            <div className="w-px h-10 bg-slate-100 hidden md:block" />
                                            <div className="text-center">
                                                <div className={cn(
                                                    "w-12 h-12 rounded-xl flex items-center justify-center text-xl font-black border transition-all duration-500",
                                                    getGradeColor(item.percent)
                                                )}>
                                                    {item.percent >= 90 ? "A" : item.percent >= 80 ? "B" : item.percent >= 70 ? "C" : "D"}
                                                </div>
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-2">Grade</p>
                                            </div>
                                        </div>
                                    </div>

                                    {item.feedback && (
                                        <div className="mt-8 p-6 rounded-[24px] bg-slate-50 border border-transparent group-hover:border-slate-100 transition-all duration-500">
                                            <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-2 flex items-center gap-2">
                                                <Shield size={12} /> Instructor Feedback
                                            </p>
                                            <p className="text-sm text-slate-500 italic font-medium leading-relaxed">
                                                "{item.feedback}"
                                            </p>
                                        </div>
                                    )}
                                </motion.div>
                            ))}
                        </AnimatePresence>

                        {allResults.length === 0 && (
                            <div className="py-32 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                                <FileText size={48} className="mx-auto text-slate-200 mb-6" />
                                <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No academic records found</h4>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
