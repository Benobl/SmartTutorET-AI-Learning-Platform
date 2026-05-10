"use client"

import { useEffect, useMemo, useState } from "react"
import { assignmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { FileText, Loader2, Search } from "lucide-react"

export default function StudentGradesPage() {
    const [loading, setLoading] = useState(true)
    const [marks, setMarks] = useState<any[]>([])
    const [search, setSearch] = useState("")

    const [reportCard, setReportCard] = useState<any>(null)

    useEffect(() => {
        ;(async () => {
            try {
                setLoading(true)
                const [marksRes, reportRes] = await Promise.all([
                    assignmentApi.getMyMarks(),
                    assignmentApi.getMyGrades()
                ])
                setMarks(marksRes?.data || [])
                setReportCard(reportRes?.data || null)
            } catch (error) {
                console.error("Failed to load grades:", error)
            } finally {
                setLoading(false)
            }
        })()
    }, [])

    const filtered = useMemo(() => {
        const q = search.toLowerCase().trim()
        if (!q) return marks
        return marks.filter((item) => {
            const title = String(item?.assignment?.title || "").toLowerCase()
            const subject = String(item?.assignment?.subject?.title || "").toLowerCase()
            return title.includes(q) || subject.includes(q)
        })
    }, [marks, search])

    const summary = useMemo(() => {
        const totalPossible = marks.reduce((acc, m) => acc + Number(m?.assignment?.maxMarks || 0), 0)
        const totalObtained = marks.reduce((acc, m) => acc + Number(m?.marksObtained || 0), 0)
        const averagePercent = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0
        return { totalPossible, totalObtained, averagePercent }
    }, [marks])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Compiling Performance Report...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 pb-8 border-b border-slate-100/50">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100 italic">Academic Records</span>
                        <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                        Performance <span className='text-sky-500'>Vault</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Comprehensive analysis of your assessments, quizzes, and final exams.
                    </p>
                </div>
                <div className="relative w-full lg:w-[400px]">
                    <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search subject or assignment..."
                        className="w-full h-16 pl-14 pr-6 rounded-[32px] border border-slate-100 bg-white text-sm font-black uppercase tracking-tight outline-none shadow-xl shadow-slate-200/20 focus:ring-4 focus:ring-sky-500/5 transition-all"
                    />
                </div>
            </div>

            {/* Semester Report Card */}
            <div className="space-y-6">
                <div className="flex items-center gap-3 mb-2">
                    <div className="w-2 h-6 bg-indigo-500 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Semester Report Card</h2>
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                    {reportCard && Object.entries(reportCard).map(([subject, data]: [string, any]) => (
                        <div key={subject} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-2xl transition-all duration-700 group overflow-hidden">
                            <div className="absolute -right-10 -top-10 w-32 h-32 bg-indigo-500/5 blur-3xl rounded-full" />
                            <div className="flex justify-between items-start mb-6">
                                <div>
                                    <h4 className="text-xl font-black text-slate-900 uppercase tracking-tighter group-hover:text-indigo-600 transition-colors">{subject}</h4>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-0.5">Cumulative Performance</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-indigo-600 leading-none">{data.total}</p>
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">Total Points</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                {Object.entries(data.breakdown).map(([type, score]: [string, any]) => (
                                    <div key={type} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border border-slate-100 group-hover:bg-white transition-all">
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">{type.replace('_', ' ')}</span>
                                        <span className="text-xs font-black text-slate-900">{score} pts</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                    {!reportCard && (
                        <div className="md:col-span-3 p-12 text-center bg-slate-50 rounded-[40px] border-2 border-dashed border-slate-100">
                             <Loader2 className="w-10 h-10 text-slate-200 mx-auto mb-4 animate-spin" />
                             <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Calculating aggregate scores...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Detailed Ledger */}
            <div className="space-y-8">
                <div className="flex items-center gap-3">
                    <div className="w-2 h-6 bg-sky-500 rounded-full" />
                    <h2 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">Detailed Ledger</h2>
                </div>

                <div className="grid grid-cols-1 gap-6">
                    {filtered.map((item) => (
                        <div key={item._id} className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-sky-200 hover:shadow-2xl transition-all duration-700 relative overflow-hidden">
                            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 border border-slate-100 flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                        <FileText className="w-8 h-8 text-slate-400" />
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-tight">{item?.assignment?.title}</h3>
                                        <div className="flex items-center gap-4 mt-1.5">
                                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest bg-sky-50 px-2.5 py-1 rounded-lg border border-sky-100">{item?.assignment?.subject?.title}</span>
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic">{new Date(item.updatedAt).toLocaleDateString()}</span>
                                            <span className="text-[10px] font-black text-amber-600 uppercase tracking-widest">{item?.assignment?.type || "assignment"}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-10">
                                    <div className="text-right">
                                        <p className="text-4xl font-black text-sky-600 leading-none">{item.marksObtained}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Out of {item?.assignment?.maxMarks}</p>
                                    </div>
                                    <div className="w-px h-12 bg-slate-100" />
                                    <div className="text-right min-w-[80px]">
                                        <p className="text-2xl font-black text-indigo-600 leading-none">#{item?.result?.rank || "-"}</p>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Global Rank</p>
                                    </div>
                                </div>
                            </div>

                            {item?.feedback && (
                                <div className="mt-8 p-6 rounded-[32px] bg-sky-50/50 border border-sky-100 relative overflow-hidden">
                                    <div className="absolute top-4 right-6">
                                        <Sparkles className="w-5 h-5 text-sky-200 fill-sky-200" />
                                    </div>
                                    <p className="text-[10px] font-black text-sky-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400" />
                                        Tutor Feedback
                                    </p>
                                    <p className="text-sm font-medium text-sky-900 italic leading-relaxed">"{item.feedback}"</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
