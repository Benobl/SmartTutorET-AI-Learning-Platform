"use client"

import { useState, useEffect } from "react"
import { assignmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Award, BookOpen, Calendar, CheckCircle2, ChevronRight, FileText, Loader2, Star, TrendingUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"

export default function StudentMarksPage() {
    const [loading, setLoading] = useState(true)
    const [marks, setMarks] = useState<any[]>([])

    useEffect(() => {
        fetchMarks()
    }, [])

    const fetchMarks = async () => {
        try {
            const res = await assignmentApi.getMyMarks()
            setMarks(res.data || [])
        } catch (error) {
            console.error("Error fetching marks:", error)
        } finally {
            setLoading(false)
        }
    }

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Calculating Grades...</p>
            </div>
        )
    }

    const totalPossible = marks.reduce((acc, m) => acc + (m.assignment.maxMarks || 100), 0)
    const totalObtained = marks.reduce((acc, m) => acc + (m.marksObtained || 0), 0)
    const averagePercent = totalPossible > 0 ? Math.round((totalObtained / totalPossible) * 100) : 0
    const bestRank = marks.reduce((best, mark) => {
        const rank = mark?.result?.rank
        if (!rank) return best
        if (best === null) return rank
        return rank < best ? rank : best
    }, null as number | null)
    const averagePercentile = marks.length > 0
        ? Math.round(
            marks.reduce((acc, mark) => acc + Number(mark?.result?.percentile || 0), 0) / marks.length
        )
        : 0

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1 italic uppercase tracking-tighter">Academic Performance</h1>
                <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Track your progress and assignment evaluations.</p>
            </div>

            {/* Performance Overview */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="md:col-span-2 bg-slate-900 rounded-[40px] p-8 text-white relative overflow-hidden shadow-2xl">
                    <div className="absolute top-0 right-0 p-8 opacity-10">
                        <TrendingUp className="w-32 h-32 text-indigo-400" />
                    </div>
                    <div className="relative z-10 space-y-6">
                        <div>
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-indigo-400 mb-2">Overall Average</h3>
                            <div className="flex items-end gap-3">
                                <span className="text-6xl font-black italic tracking-tighter">{averagePercent}%</span>
                                <span className="text-sm font-bold text-indigo-300 mb-3 uppercase tracking-widest">Cumulative GPA</span>
                            </div>
                        </div>
                        <div className="space-y-2">
                            <div className="flex justify-between text-[10px] font-black uppercase tracking-widest">
                                <span>Platform Progress</span>
                                <span>{totalObtained} / {totalPossible} Total Marks</span>
                            </div>
                            <Progress value={averagePercent} className="h-2 bg-white/10" />
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-[40px] border border-slate-100 p-8 shadow-sm flex flex-col items-center justify-center text-center space-y-4">
                    <div className="w-16 h-16 rounded-full bg-amber-50 flex items-center justify-center border border-amber-100">
                        <Award className="w-8 h-8 text-amber-500" />
                    </div>
                    <div>
                        <p className="text-2xl font-black text-slate-900">
                            {bestRank ? `Best Rank: #${bestRank}` : "Rank: Pending"}
                        </p>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-1">
                            {bestRank ? `Average Percentile: ${averagePercentile}%` : "Ranking appears after tutor grading."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Detailed Marks List */}
            <div className="space-y-6">
                <div className="flex items-center gap-3">
                    <div className="p-2 rounded-xl bg-indigo-50 border border-indigo-100">
                        <CheckCircle2 className="w-5 h-5 text-indigo-600" />
                    </div>
                    <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight italic">Evaluated Assignments</h3>
                </div>

                {marks.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40 bg-white rounded-[40px] border border-dashed border-slate-200">
                        <FileText className="w-16 h-16 text-slate-300" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No evaluated marks found yet.</p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 gap-4">
                        {marks.map(mark => (
                            <div key={mark._id} className="bg-white rounded-3xl border border-slate-100 p-6 flex items-center justify-between group hover:shadow-xl transition-all duration-500">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center group-hover:bg-indigo-50 transition-colors">
                                        <BookOpen className="w-6 h-6 text-slate-300 group-hover:text-indigo-600 transition-colors" />
                                    </div>
                                    <div>
                                        <h4 className="text-sm font-black text-slate-900 uppercase italic group-hover:text-indigo-600 transition-colors">{mark.assignment.title}</h4>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mt-0.5">
                                            {mark.assignment.subject?.title} • {new Date(mark.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>
                                <div className="flex items-center gap-8">
                                    <div className="text-right">
                                        <p className="text-xl font-black text-slate-900">{mark.marksObtained}/{mark.assignment.maxMarks}</p>
                                        <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest">
                                            {mark?.result?.rank && mark?.result?.totalEvaluated
                                                ? `Rank #${mark.result.rank}/${mark.result.totalEvaluated}`
                                                : "Graded"}
                                        </p>
                                    </div>
                                    <ChevronRight className="w-5 h-5 text-slate-200 group-hover:text-indigo-400 transition-all group-hover:translate-x-1" />
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {marks.some((mark) => mark?.feedback) && (
                    <div className="space-y-3">
                        <h4 className="text-sm font-black text-slate-900 uppercase tracking-widest">Tutor Feedback</h4>
                        {marks.filter((mark) => mark?.feedback).slice(0, 5).map((mark) => (
                            <div key={`${mark._id}-feedback`} className="p-4 rounded-2xl bg-indigo-50/40 border border-indigo-100">
                                <p className="text-[10px] font-black text-indigo-700 uppercase tracking-widest mb-1">
                                    {mark.assignment?.title}
                                </p>
                                <p className="text-sm text-indigo-900 font-medium whitespace-pre-wrap">{mark.feedback}</p>
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}
