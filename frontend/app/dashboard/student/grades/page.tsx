"use client"

import { useEffect, useMemo, useState, useCallback } from "react"
import { assignmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { motion, AnimatePresence } from "framer-motion"
import { 
    FileText, 
    Loader2, 
    Search, 
    TrendingUp, 
    Award, 
    CheckCircle2,
    AlertCircle,
    Info
} from "lucide-react"
import { getSocket } from "@/lib/socket"

const getGradeLetter = (score: number, status: string) => {
    if (status === "in_progress" && score < 60) return "P" // Progress
    if (score >= 90) return "A+"
    if (score >= 85) return "A"
    if (score >= 80) return "A-"
    if (score >= 75) return "B+"
    if (score >= 70) return "B"
    if (score >= 65) return "B-"
    if (score >= 60) return "C+"
    if (score >= 50) return "C"
    if (score >= 40) return "D"
    return "F"
}

const getGradeColor = (grade: string) => {
    switch (grade) {
        case "A+":
        case "A":
        case "A-": return "text-emerald-600 bg-emerald-50 border-emerald-100"
        case "B+":
        case "B":
        case "B-": return "text-sky-600 bg-sky-50 border-sky-100"
        case "C+":
        case "C": return "text-amber-600 bg-amber-50 border-amber-100"
        case "D": return "text-orange-600 bg-orange-50 border-orange-100"
        case "P": return "text-slate-600 bg-slate-50 border-slate-100 font-black"
        default: return "text-rose-600 bg-rose-50 border-rose-100"
    }
}

export default function StudentGradesPage() {
    const [loading, setLoading] = useState(true)
    const [reportCard, setReportCard] = useState<any>(null)
    const [search, setSearch] = useState("")

    const fetchData = useCallback(async () => {
        try {
            setLoading(true)
            const reportRes = await assignmentApi.getMyGrades()
            setReportCard(reportRes?.data || null)
        } catch (error) {
            console.error("Failed to load grades:", error)
        } finally {
            setLoading(false)
        }
    }, [])

    useEffect(() => {
        fetchData()

        const socket = getSocket()
        if (socket) {
            socket.on("grade-updated", (data: any) => {
                console.log("[Socket] Grade updated received:", data)
                fetchData() // Refresh records
            })
        }

        return () => {
            if (socket) {
                socket.off("grade-updated")
            }
        }
    }, [fetchData])

    const calculateEthiopianGrade = (data: any) => {
        const weights = {
            assignment: 0.15,
            quiz: 0.20,
            mid_exam: 0.25,
            final_exam: 0.40
        }

        let totalScore = 0
        
        Object.entries(weights).forEach(([type, weight]) => {
            const { obtained, max } = data.breakdown[type]
            if (max > 0) {
                totalScore += (obtained / max) * (weight * 100)
            }
        })

        return Math.round(totalScore)
    }

    const filteredSubjects = useMemo(() => {
        if (!reportCard || !Array.isArray(reportCard)) return []
        const q = search.toLowerCase().trim()
        if (!q) return reportCard
        return reportCard.filter((item: any) => item.subject.toLowerCase().includes(q))
    }, [reportCard, search])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[60vh] space-y-4">
                <Loader2 className="w-10 h-10 text-sky-500 animate-spin" />
                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Records...</p>
            </div>
        )
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 pt-8 px-4 sm:px-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Academic System</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Student <span className="font-semibold text-slate-900">Mark Sheet</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        Official academic performance record using the Ethiopian standard grading system.
                    </p>
                </div>

                <div className="relative w-full md:w-80 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search subjects..."
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-white text-xs font-medium outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 transition-all placeholder:text-slate-400 shadow-sm"
                    />
                </div>
            </div>

            {/* MAIN TABLE */}
            <div className="bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                        <thead>
                            <tr className="bg-slate-50/50 border-b border-slate-100">
                                <th className="px-8 py-6 text-left text-[10px] font-black text-slate-400 uppercase tracking-widest">Subject Name</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Assignments (15%)</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Quizzes (20%)</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Mid-Term (25%)</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Final Exam (40%)</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Total (100)</th>
                                <th className="px-6 py-6 text-center text-[10px] font-black text-slate-400 uppercase tracking-widest">Grade</th>
                                <th className="px-8 py-6 text-right text-[10px] font-black text-slate-400 uppercase tracking-widest">Status</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-50">
                            <AnimatePresence mode="popLayout">
                                {filteredSubjects.map((data: any, idx: number) => {
                                    const subject = data.subject
                                    const weightedTotal = calculateEthiopianGrade(data)
                                    const gradeLetter = getGradeLetter(weightedTotal, data.status)
                                    
                                    return (
                                        <motion.tr 
                                            key={subject}
                                            initial={{ opacity: 0, y: 10 }}
                                            animate={{ opacity: 1, y: 0 }}
                                            transition={{ delay: idx * 0.05 }}
                                            className="group hover:bg-slate-50/30 transition-colors"
                                        >
                                            <td className="px-8 py-8">
                                                <div className="flex items-center gap-4">
                                                    <div className="w-10 h-10 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-sky-100 group-hover:text-sky-600 transition-colors">
                                                        <FileText size={20} />
                                                    </div>
                                                    <div>
                                                        <h4 className="text-sm font-bold text-slate-900">{subject}</h4>
                                                        <p className="text-[9px] font-medium text-slate-400 uppercase tracking-widest mt-0.5">Academic Record</p>
                                                        {data.recentFeedback && data.recentFeedback.length > 0 && (
                                                            <div className="mt-2 space-y-1">
                                                                {data.recentFeedback.map((f: any, i: number) => (
                                                                    <div key={i} className="flex flex-col gap-0.5 px-2 py-1 bg-emerald-50 rounded-lg border border-emerald-100">
                                                                        <span className="text-[8px] font-black text-emerald-700 uppercase">{f.task}: {f.marks}/{f.max}</span>
                                                                        <span className="text-[10px] italic font-medium text-emerald-600 line-clamp-1">"{f.comment}"</span>
                                                                    </div>
                                                                ))}
                                                            </div>
                                                        )}
                                                    </div>
                                                </div>
                                            </td>
                                            
                                            {/* CATEGORIES */}
                                            {['assignment', 'quiz', 'mid_exam', 'final_exam'].map((type) => {
                                                const cat = data.breakdown[type]
                                                return (
                                                    <td key={type} className="px-6 py-8 text-center">
                                                        {cat.count > 0 ? (
                                                            <div className="space-y-1">
                                                                <div className="flex flex-col items-center gap-0.5">
                                                                    <span className="text-sm font-black text-slate-900">{cat.obtained}</span>
                                                                    <span className="text-[9px] font-bold text-slate-300"> / {cat.max}</span>
                                                                </div>
                                                                {cat.pending > 0 && (
                                                                    <div className="mt-2">
                                                                        <span className="px-1.5 py-0.5 rounded-md bg-sky-50 text-[7px] text-sky-600 font-black uppercase tracking-tighter border border-sky-100">
                                                                            {cat.pending} Pending
                                                                        </span>
                                                                    </div>
                                                                )}
                                                            </div>
                                                        ) : (
                                                            <div className="flex flex-col items-center gap-1 opacity-20">
                                                                <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">N/A</span>
                                                            </div>
                                                        )}
                                                    </td>
                                                )
                                            })}

                                            <td className="px-6 py-8 text-center">
                                                <div className="inline-flex flex-col items-center">
                                                    <span className="text-xl font-black text-slate-900 tracking-tighter">{weightedTotal}</span>
                                                    <div className="w-12 h-1 bg-slate-100 rounded-full mt-2 overflow-hidden">
                                                        <div className="h-full bg-slate-900 rounded-full" style={{ width: `${weightedTotal}%` }} />
                                                    </div>
                                                </div>
                                            </td>

                                            <td className="px-6 py-8 text-center">
                                                <div className={cn(
                                                    "w-10 h-10 rounded-xl mx-auto flex items-center justify-center text-sm font-black border transition-all duration-500",
                                                    getGradeColor(gradeLetter)
                                                )}>
                                                    {gradeLetter}
                                                </div>
                                            </td>

                                            <td className="px-8 py-8 text-right">
                                                <div className={cn(
                                                    "inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                                    data.status === 'completed' 
                                                        ? "text-emerald-600 bg-emerald-50 border-emerald-100" 
                                                        : "text-amber-600 bg-amber-50 border-amber-100"
                                                )}>
                                                    {data.status === 'completed' ? <CheckCircle2 size={12} /> : <AlertCircle size={12} />}
                                                    {data.status === 'completed' ? "Completed" : "In Progress"}
                                                </div>
                                            </td>
                                        </motion.tr>
                                    )
                                })}
                            </AnimatePresence>
                        </tbody>
                    </table>

                    {filteredSubjects.length === 0 && (
                        <div className="py-32 text-center">
                            <Info size={40} className="mx-auto text-slate-200 mb-4" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No subjects found</h4>
                        </div>
                    )}
                </div>
            </div>

            {/* WEIGHTING INFO */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Assignments", weight: "15%", color: "bg-emerald-500" },
                    { label: "Quizzes", weight: "20%", color: "bg-sky-500" },
                    { label: "Mid-Term", weight: "25%", color: "bg-amber-500" },
                    { label: "Final Exam", weight: "40%", color: "bg-slate-900" },
                ].map((item) => (
                    <div key={item.label} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm flex items-center justify-between">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">{item.label}</p>
                            <h5 className="text-lg font-black text-slate-900">{item.weight} Weight</h5>
                        </div>
                        <div className={cn("w-2 h-10 rounded-full", item.color)} />
                    </div>
                ))}
            </div>

            {/* LEGEND/HELP */}
            <div className="p-8 rounded-[40px] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                <div className="absolute -top-12 -right-12 w-64 h-64 bg-white/5 rounded-full blur-3xl group-hover:scale-110 transition-transform duration-1000" />
                <div className="relative z-10 flex flex-col lg:flex-row items-center gap-12">
                    <div className="bg-white/10 p-6 rounded-[32px] backdrop-blur-md border border-white/10">
                        <Award size={48} className="text-amber-400" />
                    </div>
                    <div className="flex-1 space-y-4">
                        <h3 className="text-2xl font-bold tracking-tight">Understanding Your Grade</h3>
                        <p className="text-slate-400 text-sm leading-relaxed max-w-2xl">
                            The Ethiopian grading system evaluates your performance across multiple assessment types. 
                            If a column shows <span className="text-white font-bold">"-"</span>, it means no assessments of that type have been graded yet. 
                            Your final grade will be fully calculated once the final exam is recorded.
                        </p>
                    </div>
                    <div className="flex gap-4 shrink-0">
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">A</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">90-100</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">B</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">80-89</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">C</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">70-79</span>
                        </div>
                        <div className="w-px h-8 bg-white/10" />
                        <div className="flex flex-col items-center">
                            <span className="text-2xl font-black">D</span>
                            <span className="text-[9px] text-slate-500 uppercase tracking-widest font-black">60-69</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
