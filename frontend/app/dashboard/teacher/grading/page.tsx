"use client"

import { useState } from "react"
import { submissions, teacherAssignments } from "@/lib/teacher-data"
import { cn } from "@/lib/utils"
import { CheckCircle2, Clock, Award, Save, ChevronDown, ChevronUp } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

export default function TeacherGradingPage() {
    const ungradedSubmissions = submissions.filter(s => s.status === "submitted")
    const [grades, setGrades] = useState<Record<number, { score: string; feedback: string }>>({})
    const [saved, setSaved] = useState<number[]>([])
    const [expanded, setExpanded] = useState<number | null>(null)

    const getAssignment = (id: number) => teacherAssignments.find(a => a.id === id)

    const handleSave = (subId: number) => {
        if (!grades[subId]?.score) return
        setSaved(prev => [...prev, subId])
        setTimeout(() => setSaved(prev => prev.filter(id => id !== subId)), 3000)
    }

    const totalGraded = submissions.filter(s => s.status === "graded").length
    const total = submissions.length
    const gradingRate = Math.round((totalGraded / total) * 100)

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-3xl font-black text-slate-900 mb-1">Grading</h1>
                <p className="text-slate-500 text-sm font-medium">Review and grade student submissions.</p>
            </div>

            {/* Progress Card */}
            <div className="bg-gradient-to-br from-violet-600 to-indigo-600 rounded-3xl p-6 text-white shadow-xl shadow-violet-500/20 relative overflow-hidden">
                <div className="absolute -right-8 -top-8 w-48 h-48 bg-white/10 rounded-full blur-2xl" />
                <div className="relative z-10 flex items-center justify-between flex-wrap gap-6">
                    <div>
                        <p className="text-violet-200 text-sm font-bold uppercase tracking-widest mb-1">Overall Grading Progress</p>
                        <p className="text-4xl font-black">{totalGraded}<span className="text-xl text-violet-200">/{total}</span></p>
                        <p className="text-violet-200 text-sm mt-1">{ungradedSubmissions.length} submissions pending</p>
                    </div>
                    <div className="w-48">
                        <div className="flex justify-between text-xs font-bold mb-2">
                            <span className="text-violet-200">Graded</span>
                            <span>{gradingRate}%</span>
                        </div>
                        <div className="h-3 bg-white/20 rounded-full overflow-hidden">
                            <div className="h-full bg-white rounded-full transition-all duration-1000" style={{ width: `${gradingRate}%` }} />
                        </div>
                    </div>
                </div>
            </div>

            {/* Per-assignment grading progress */}
            <div className="bg-white rounded-3xl border border-slate-200 shadow-sm p-6">
                <h2 className="text-lg font-black text-slate-900 mb-5">Assignment Grading Progress</h2>
                <div className="space-y-5">
                    {teacherAssignments.filter(a => a.submitted > 0).map(a => {
                        const rate = a.submitted > 0 ? Math.round((a.graded / a.submitted) * 100) : 0
                        return (
                            <div key={a.id}>
                                <div className="flex items-center justify-between mb-2">
                                    <div>
                                        <p className="text-sm font-black text-slate-800">{a.title}</p>
                                        <p className="text-xs text-slate-400 font-medium">{a.courseCode}</p>
                                    </div>
                                    <span className="text-sm font-black text-violet-600">{a.graded}/{a.submitted}</span>
                                </div>
                                <Progress value={rate} className="h-2 bg-slate-100" />
                            </div>
                        )
                    })}
                </div>
            </div>

            {/* Grading Queue */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-violet-500 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900">Grading Queue ({ungradedSubmissions.length})</h2>
                </div>

                {ungradedSubmissions.length === 0 ? (
                    <div className="py-20 text-center bg-white rounded-3xl border border-slate-200 shadow-sm">
                        <CheckCircle2 className="w-16 h-16 text-emerald-400 mx-auto mb-4" />
                        <h3 className="text-xl font-black text-slate-900">All caught up!</h3>
                        <p className="text-slate-400 font-bold text-sm mt-2">All submissions have been graded.</p>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {ungradedSubmissions.map(sub => {
                            const assignment = getAssignment(sub.assignmentId)
                            const isExpanded = expanded === sub.id
                            const isSaved = saved.includes(sub.id)
                            return (
                                <div key={sub.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden">
                                    <div
                                        className="flex items-center gap-4 p-5 cursor-pointer hover:bg-slate-50 transition-colors"
                                        onClick={() => setExpanded(isExpanded ? null : sub.id)}
                                    >
                                        <div className="w-12 h-12 rounded-2xl bg-violet-50 border border-violet-100 flex items-center justify-center shrink-0">
                                            <span className="text-sm font-black text-violet-600">{sub.studentName.split(" ").map(n => n[0]).join("")}</span>
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <p className="font-black text-slate-900">{sub.studentName}</p>
                                            <p className="text-sm text-slate-400 font-medium truncate">{assignment?.title}</p>
                                        </div>
                                        <div className="flex items-center gap-3 shrink-0">
                                            <div className="flex items-center gap-1.5 text-slate-400 text-xs font-medium">
                                                <Clock className="w-3.5 h-3.5" />
                                                {new Date(sub.submittedAt).toLocaleDateString()}
                                            </div>
                                            <span className="text-xs font-bold text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Needs Grading</span>
                                            {isExpanded ? <ChevronUp className="w-4 h-4 text-slate-400" /> : <ChevronDown className="w-4 h-4 text-slate-400" />}
                                        </div>
                                    </div>

                                    {isExpanded && (
                                        <div className="px-6 pb-6 pt-2 space-y-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-200">
                                            {/* Submitted Files */}
                                            <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                                                <p className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Submitted Files</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {sub.files.map(f => (
                                                        <span key={f} className="text-xs font-bold text-indigo-600 bg-indigo-50 px-3 py-1.5 rounded-xl border border-indigo-100">{f}</span>
                                                    ))}
                                                </div>
                                            </div>

                                            {/* Grading Form */}
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div>
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">
                                                        Score (out of {assignment?.maxScore})
                                                    </label>
                                                    <Input
                                                        type="number"
                                                        placeholder={`0 - ${assignment?.maxScore}`}
                                                        min={0} max={assignment?.maxScore}
                                                        value={grades[sub.id]?.score || ""}
                                                        onChange={e => setGrades(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], score: e.target.value } }))}
                                                        className="rounded-xl h-11"
                                                    />
                                                </div>
                                                <div>
                                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Quick Feedback</label>
                                                    <Input
                                                        placeholder="Brief comment for the student..."
                                                        value={grades[sub.id]?.feedback || ""}
                                                        onChange={e => setGrades(prev => ({ ...prev, [sub.id]: { ...prev[sub.id], feedback: e.target.value } }))}
                                                        className="rounded-xl h-11"
                                                    />
                                                </div>
                                            </div>

                                            {isSaved ? (
                                                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100">
                                                    <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                                                    <p className="text-sm font-bold text-emerald-700">Grade saved and student notified!</p>
                                                </div>
                                            ) : (
                                                <button
                                                    onClick={() => handleSave(sub.id)}
                                                    className="flex items-center gap-2 px-5 py-2.5 bg-violet-600 hover:bg-violet-500 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-violet-600/20"
                                                >
                                                    <Save className="w-4 h-4" />
                                                    Save Grade
                                                </button>
                                            )}
                                        </div>
                                    )}
                                </div>
                            )
                        })}
                    </div>
                )}
            </div>
        </div>
    )
}
