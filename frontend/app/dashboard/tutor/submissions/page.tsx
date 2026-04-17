"use client"

import { useState } from "react"
import { tutorSubmissions as submissions, tutorAssignments as teacherAssignments } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { FileText, Clock, CheckCircle2, Search, Download, Eye } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TeacherSubmissionsPage() {
    const [selectedAssignment, setSelectedAssignment] = useState<number | "all">("all")
    const [search, setSearch] = useState("")
    const [selectedSub, setSelectedSub] = useState<number | null>(null)

    const filtered = submissions.filter(s => {
        if (selectedAssignment !== "all" && s.assignmentId !== selectedAssignment) return false
        if (search && !s.studentName.toLowerCase().includes(search.toLowerCase())) return false
        return true
    })

    const getAssignment = (id: number) => teacherAssignments.find(a => a.id === id)

    const formatTime = (ts: string) => {
        const d = new Date(ts)
        return d.toLocaleString("en-US", { month: "short", day: "numeric", hour: "2-digit", minute: "2-digit" })
    }

    const viewedSub = selectedSub !== null ? submissions.find(s => s.id === selectedSub) : null

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Student Submissions</h1>
                <p className="text-slate-500 text-sm font-medium">Review all submitted work from your students.</p>
            </div>

            {/* Submission Detail Overlay */}
            {viewedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-slate-900">{viewedSub.studentName}</h2>
                                <p className="text-sm text-slate-400 font-medium">{getAssignment(viewedSub.assignmentId)?.title}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Submitted Files</p>
                                {viewedSub.files.map(f => (
                                    <div key={f} className="flex items-center gap-3 p-3 bg-white rounded-xl border border-slate-100 mt-2">
                                        <FileText className="w-4 h-4 text-sky-500" />
                                        <span className="text-sm font-bold text-slate-700 flex-1">{f}</span>
                                        <button className="text-sky-500 hover:text-sky-600 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100 text-sm">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1">Submitted At</p>
                                <p className="font-bold text-slate-700">{formatTime(viewedSub.submittedAt)}</p>
                            </div>
                            {viewedSub.score !== null && (
                                <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                                    <p className="text-xs font-black text-sky-600 uppercase tracking-widest mb-1">Score</p>
                                    <p className="text-2xl font-black text-sky-700">{viewedSub.score}/{getAssignment(viewedSub.assignmentId)?.maxScore}</p>
                                    {viewedSub.feedback && <p className="text-sm text-sky-600 mt-2">{viewedSub.feedback}</p>}
                                </div>
                            )}
                            <button onClick={() => setSelectedSub(null)} className="w-full py-3 bg-sky-600 hover:bg-sky-500 text-white rounded-xl font-bold text-sm transition-colors">Close Preview</button>
                        </div>
                    </div>
                </div>
            )}

            {/* Stats */}
            <div className="grid grid-cols-3 gap-4">
                {[
                    { label: "Total Submissions", value: submissions.length, color: "sky" },
                    { label: "Graded", value: submissions.filter(s => s.status === "graded").length, color: "sky" },
                    { label: "Awaiting Review", value: submissions.filter(s => s.status === "submitted").length, color: "rose" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input placeholder="Search by student name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11" />
                </div>
                <select
                    value={selectedAssignment}
                    onChange={e => setSelectedAssignment(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium min-w-[200px]"
                >
                    <option value="all">All Assignments</option>
                    {teacherAssignments.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                </select>
            </div>

            {/* Submissions Table */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-slate-50 border-b border-slate-100">
                    {["Student", "Assignment", "Submitted", "Status", "Action"].map(h => (
                        <p key={h} className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{h}</p>
                    ))}
                </div>
                {filtered.length === 0 ? (
                    <div className="py-16 text-center">
                        <FileText className="w-10 h-10 text-slate-200 mx-auto mb-3" />
                        <p className="text-slate-400 font-bold text-sm">No submissions found.</p>
                    </div>
                ) : filtered.map((sub, i) => {
                    const assignment = getAssignment(sub.assignmentId)
                    return (
                        <div key={sub.id} className={cn("grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-slate-50 transition-colors", i < filtered.length - 1 && "border-b border-slate-100")}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-sky-50 border border-sky-100 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black text-sky-600">{sub.studentName.split(" ").map(n => n[0]).join("")}</span>
                                </div>
                                <span className="font-bold text-slate-800 text-sm truncate">{sub.studentName}</span>
                            </div>
                            <p className="text-sm text-slate-500 font-medium truncate">{assignment?.title}</p>
                            <div className="flex items-center gap-1.5 text-slate-400">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-xs font-medium">{formatTime(sub.submittedAt)}</span>
                            </div>
                            <div>
                                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", sub.status === "graded" ? "bg-sky-50 text-sky-600 border border-sky-100" : "bg-amber-50 text-amber-600 border border-amber-100")}>
                                    {sub.status === "graded" ? `${sub.score}/${assignment?.maxScore}` : "Pending Review"}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedSub(sub.id)}
                                className="p-2 rounded-xl hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-colors"
                            >
                                <Eye className="w-4 h-4" />
                            </button>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
