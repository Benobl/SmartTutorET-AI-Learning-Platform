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
                <h1 className="text-3xl font-black text-foreground mb-1">Student Submissions</h1>
                <p className="text-muted-foreground text-sm font-medium">Review all submitted work from your students.</p>
            </div>

            {/* Submission Detail Overlay */}
            {viewedSub && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
                    <div className="bg-card rounded-[32px] shadow-2xl border border-border p-8 w-full max-w-lg animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-start justify-between mb-6">
                            <div>
                                <h2 className="text-xl font-black text-foreground">{viewedSub.studentName}</h2>
                                <p className="text-sm text-muted-foreground font-medium">{getAssignment(viewedSub.assignmentId)?.title}</p>
                            </div>
                            <button onClick={() => setSelectedSub(null)} className="p-2 rounded-xl hover:bg-muted text-muted-foreground transition-colors">✕</button>
                        </div>
                        <div className="space-y-4">
                            <div className="p-4 bg-muted rounded-2xl border border-border">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-2">Submitted Files</p>
                                {viewedSub.files.map(f => (
                                    <div key={f} className="flex items-center gap-3 p-3 bg-card rounded-xl border border-border mt-2">
                                        <FileText className="w-4 h-4 text-sky-500" />
                                        <span className="text-sm font-bold text-foreground flex-1">{f}</span>
                                        <button className="text-sky-500 hover:text-sky-400 transition-colors">
                                            <Download className="w-4 h-4" />
                                        </button>
                                    </div>
                                ))}
                            </div>
                            <div className="p-4 bg-muted rounded-2xl border border-border text-sm">
                                <p className="text-xs font-black text-muted-foreground uppercase tracking-widest mb-1">Submitted At</p>
                                <p className="font-bold text-foreground">{formatTime(viewedSub.submittedAt)}</p>
                            </div>
                            {viewedSub.score !== null && (
                                <div className="p-4 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                                    <p className="text-xs font-black text-sky-500 uppercase tracking-widest mb-1">Score</p>
                                    <p className="text-2xl font-black text-sky-500">{viewedSub.score}/{getAssignment(viewedSub.assignmentId)?.maxScore}</p>
                                    {viewedSub.feedback && <p className="text-sm text-sky-200/80 mt-2">{viewedSub.feedback}</p>}
                                </div>
                            )}
                            <button onClick={() => setSelectedSub(null)} className="w-full py-3 bg-sky-600 hover:bg-sky-700 text-white rounded-xl font-bold text-sm transition-colors shadow-lg shadow-sky-500/20">Close Preview</button>
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
                    <div key={stat.label} className="bg-card rounded-2xl border border-border shadow-sm p-5 text-center">
                        <p className="text-3xl font-black text-foreground">{stat.value}</p>
                        <p className="text-xs text-muted-foreground font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filters */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                    <Input placeholder="Search by student name..." value={search} onChange={e => setSearch(e.target.value)} className="pl-10 rounded-xl h-11 bg-muted border-border text-foreground placeholder:text-muted-foreground" />
                </div>
                <select
                    value={selectedAssignment}
                    onChange={e => setSelectedAssignment(e.target.value === "all" ? "all" : Number(e.target.value))}
                    className="h-11 rounded-xl border border-border bg-muted px-3 text-sm font-medium min-w-[200px] text-foreground"
                >
                    <option value="all">All Assignments</option>
                    {teacherAssignments.map(a => (
                        <option key={a.id} value={a.id}>{a.title}</option>
                    ))}
                </select>
            </div>

            {/* Submissions Table */}
            <div className="bg-card rounded-3xl border border-border shadow-sm overflow-hidden">
                <div className="grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-3 bg-muted border-b border-border">
                    {["Student", "Assignment", "Submitted", "Status", "Action"].map(h => (
                        <p key={h} className="text-[10px] font-black text-muted-foreground uppercase tracking-widest">{h}</p>
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
                        <div key={sub.id} className={cn("grid grid-cols-[1fr_2fr_1fr_1fr_auto] gap-4 px-6 py-4 items-center hover:bg-muted/50 transition-colors", i < filtered.length - 1 && "border-b border-border")}>
                            <div className="flex items-center gap-3">
                                <div className="w-9 h-9 rounded-full bg-sky-500/10 border border-sky-500/20 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black text-sky-500">{sub.studentName.split(" ").map(n => n[0]).join("")}</span>
                                </div>
                                <span className="font-bold text-foreground text-sm truncate">{sub.studentName}</span>
                            </div>
                            <p className="text-sm text-muted-foreground font-medium truncate">{assignment?.title}</p>
                            <div className="flex items-center gap-1.5 text-muted-foreground">
                                <Clock className="w-3.5 h-3.5 shrink-0" />
                                <span className="text-xs font-medium">{formatTime(sub.submittedAt)}</span>
                            </div>
                            <div>
                                <span className={cn("text-xs font-bold px-2.5 py-1 rounded-lg", sub.status === "graded" ? "bg-sky-500/10 text-sky-500 border border-sky-500/20" : "bg-amber-500/10 text-amber-500 border border-amber-500/20")}>
                                    {sub.status === "graded" ? `${sub.score}/${assignment?.maxScore}` : "Pending Review"}
                                </span>
                            </div>
                            <button
                                onClick={() => setSelectedSub(sub.id)}
                                className="p-2 rounded-xl hover:bg-muted text-muted-foreground hover:text-sky-500 transition-colors"
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
