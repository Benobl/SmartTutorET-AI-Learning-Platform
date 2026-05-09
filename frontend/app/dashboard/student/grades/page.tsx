"use client"

import { useEffect, useMemo, useState } from "react"
import { assignmentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { FileText, Loader2, Search } from "lucide-react"

export default function StudentGradesPage() {
    const [loading, setLoading] = useState(true)
    const [marks, setMarks] = useState<any[]>([])
    const [search, setSearch] = useState("")

    useEffect(() => {
        ;(async () => {
            try {
                setLoading(true)
                const res = await assignmentApi.getMyMarks()
                setMarks(res?.data || [])
            } catch (error) {
                console.error("Failed to load grades:", error)
                setMarks([])
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
        const ranked = marks.filter((m) => Number.isFinite(Number(m?.result?.rank)))
        const bestRank = ranked.length > 0
            ? Math.min(...ranked.map((m) => Number(m.result.rank)))
            : null
        return { totalPossible, totalObtained, averagePercent, bestRank }
    }, [marks])

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-sky-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Grade Records...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 uppercase italic tracking-tight">Grades & Results</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Tutor-evaluated assignment outcomes and ranking.</p>
                </div>
                <div className="relative w-full lg:w-[340px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search by subject or assignment..."
                        className="w-full h-12 pl-11 pr-4 rounded-2xl border border-slate-200 bg-white text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/40"
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Score</p>
                    <p className="text-3xl font-black text-slate-900">{summary.averagePercent}%</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Marks</p>
                    <p className="text-3xl font-black text-slate-900">{summary.totalObtained}/{summary.totalPossible}</p>
                </div>
                <div className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm">
                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Best Rank</p>
                    <p className="text-3xl font-black text-slate-900">{summary.bestRank ? `#${summary.bestRank}` : "-"}</p>
                </div>
            </div>

            {filtered.length === 0 ? (
                <div className="py-24 text-center bg-white border border-dashed border-slate-200 rounded-[40px]">
                    <FileText className="w-12 h-12 text-slate-300 mx-auto mb-4" />
                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No graded records found.</p>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-4">
                    {filtered.map((item) => (
                        <div key={item._id} className="p-6 rounded-3xl bg-white border border-slate-100 shadow-sm hover:shadow-lg transition-all">
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase italic">{item?.assignment?.title}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">
                                        {item?.assignment?.subject?.title || "Subject"} • {new Date(item.updatedAt).toLocaleDateString()}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-xl font-black text-sky-600">{item.marksObtained}/{item?.assignment?.maxMarks}</p>
                                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                        {item?.result?.percentage ?? 0}% • {item?.result?.gradeBand || "-"}
                                    </p>
                                </div>
                            </div>

                            <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-3">
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Rank</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {item?.result?.rank && item?.result?.totalEvaluated
                                            ? `#${item.result.rank}/${item.result.totalEvaluated}`
                                            : "Pending"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Percentile</p>
                                    <p className="text-sm font-black text-slate-900">
                                        {item?.result?.percentile ? `${item.result.percentile}%` : "-"}
                                    </p>
                                </div>
                                <div className="p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Status</p>
                                    <p className={cn(
                                        "text-sm font-black",
                                        (item?.result?.percentage ?? 0) >= 50 ? "text-emerald-600" : "text-rose-600"
                                    )}>
                                        {(item?.result?.percentage ?? 0) >= 50 ? "Passed" : "Needs Improvement"}
                                    </p>
                                </div>
                            </div>

                            {item?.feedback && (
                                <div className="mt-4 p-4 rounded-2xl border border-sky-100 bg-sky-50/50">
                                    <p className="text-[9px] font-black text-sky-700 uppercase tracking-widest mb-1">Tutor Feedback</p>
                                    <p className="text-sm font-medium text-sky-900 whitespace-pre-wrap">{item.feedback}</p>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
