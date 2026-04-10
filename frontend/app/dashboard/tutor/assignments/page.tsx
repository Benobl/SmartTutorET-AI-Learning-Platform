"use client"

import { useState } from "react"
import { teacherAssignments, teacherCourses } from "@/lib/teacher-data"
import { cn } from "@/lib/utils"
import { Plus, FileText, Users, CheckCircle2, Clock, X, Calendar, AlignLeft, Paperclip } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"

export default function TeacherAssignmentsPage() {
    const [creating, setCreating] = useState(false)
    const [form, setForm] = useState({ title: "", course: "", description: "", dueDate: "", maxScore: "100" })
    const [submitted, setSubmitted] = useState(false)
    const [filter, setFilter] = useState<"all" | "active" | "closed">("all")

    const filtered = teacherAssignments.filter(a => filter === "all" || a.status === filter)

    const handleCreate = () => {
        if (!form.title || !form.course) return
        setSubmitted(true)
        setCreating(false)
        setForm({ title: "", course: "", description: "", dueDate: "", maxScore: "100" })
        setTimeout(() => setSubmitted(false), 4000)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">Assignments</h1>
                    <p className="text-slate-500 text-sm font-medium">Create, manage, and track all student assignments.</p>
                </div>
                <button
                    onClick={() => setCreating(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-rose-600/20"
                >
                    <Plus className="w-4 h-4" />
                    Create Assignment
                </button>
            </div>

            {/* Create Assignment Modal */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-900">New Assignment</h2>
                            <button onClick={() => setCreating(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Assignment Title *</label>
                                <Input
                                    placeholder="e.g. Calculus Homework #5"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Course *</label>
                                    <select
                                        value={form.course}
                                        onChange={e => setForm(p => ({ ...p, course: e.target.value }))}
                                        className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium"
                                    >
                                        <option value="">Select course...</option>
                                        {teacherCourses.map(c => (
                                            <option key={c.id} value={c.code}>{c.name}</option>
                                        ))}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Max Score</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={form.maxScore}
                                        onChange={e => setForm(p => ({ ...p, maxScore: e.target.value }))}
                                        className="rounded-xl h-11"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Due Date</label>
                                <Input
                                    type="date"
                                    value={form.dueDate}
                                    onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                    className="rounded-xl h-11"
                                />
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Description</label>
                                <textarea
                                    placeholder="Describe the assignment objectives and requirements..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={3}
                                    className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none"
                                />
                            </div>
                            <div className="flex items-center gap-3 p-4 bg-slate-50 rounded-xl border border-slate-100">
                                <Paperclip className="w-4 h-4 text-slate-400" />
                                <span className="text-sm text-slate-500 font-medium">Attach files (PDF, DOCX, XLSX)</span>
                                <button className="ml-auto text-xs font-bold text-sky-600 hover:text-sky-500 transition-colors">Browse</button>
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setCreating(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} className="flex-1 py-3 bg-rose-600 hover:bg-rose-500 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-rose-600/20">
                                    Create Assignment
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {submitted && (
                <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <CheckCircle2 className="w-5 h-5 text-sky-600 shrink-0" />
                    <p className="text-sm font-bold text-sky-700">Assignment created and published to students successfully!</p>
                </div>
            )}

            {/* Summary Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Assignments", value: teacherAssignments.length, color: "slate" },
                    { label: "Active", value: teacherAssignments.filter(a => a.status === "active").length, color: "sky" },
                    { label: "Total Submissions", value: teacherAssignments.reduce((s, a) => s + a.submitted, 0), color: "sky" },
                    { label: "Pending Grading", value: teacherAssignments.reduce((s, a) => s + (a.submitted - a.graded), 0), color: "rose" },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Filter */}
            <div className="flex gap-2">
                {(["all", "active", "closed"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn("px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize", filter === f ? "bg-rose-600 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50")}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Assignments List */}
            <div className="space-y-4">
                {filtered.map(assignment => {
                    const submissionRate = Math.round((assignment.submitted / assignment.totalStudents) * 100)
                    const gradingRate = assignment.submitted > 0 ? Math.round((assignment.graded / assignment.submitted) * 100) : 0
                    return (
                        <div key={assignment.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all overflow-hidden group">
                            <div className="p-6">
                                <div className="flex items-start justify-between gap-4 mb-4">
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center gap-3 mb-2 flex-wrap">
                                            <h3 className="text-lg font-black text-slate-900 group-hover:text-rose-600 transition-colors">{assignment.title}</h3>
                                            <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg", assignment.status === "active" ? "bg-sky-50 text-sky-600 border border-sky-100" : "bg-slate-100 text-slate-400")}>
                                                {assignment.status}
                                            </span>
                                        </div>
                                        <div className="flex items-center gap-4 text-sm text-slate-500 flex-wrap">
                                            <span className="font-bold bg-slate-50 px-2 py-0.5 rounded-lg border border-slate-100 text-xs">{assignment.courseCode}</span>
                                            <div className="flex items-center gap-1.5">
                                                <Calendar className="w-3.5 h-3.5" />
                                                <span className="font-medium">Due: {assignment.dueLabel}</span>
                                            </div>
                                            <div className="flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" />
                                                <span className="font-medium">{assignment.totalStudents} students</span>
                                            </div>
                                        </div>
                                    </div>
                                    {assignment.avgScore > 0 && (
                                        <div className="text-right shrink-0">
                                            <p className="text-2xl font-black text-rose-600">{assignment.avgScore}%</p>
                                            <p className="text-xs text-slate-400 font-bold">avg score</p>
                                        </div>
                                    )}
                                </div>

                                <p className="text-sm text-slate-500 mb-5 font-medium leading-relaxed">{assignment.description}</p>

                                <div className="grid grid-cols-2 gap-6">
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-slate-400">Submissions</span>
                                            <span className="text-sky-600">{assignment.submitted}/{assignment.totalStudents}</span>
                                        </div>
                                        <Progress value={submissionRate} className="h-2 bg-slate-100" />
                                    </div>
                                    <div>
                                        <div className="flex justify-between text-xs font-bold mb-2">
                                            <span className="text-slate-400">Graded</span>
                                            <span className="text-sky-600">{assignment.graded}/{assignment.submitted}</span>
                                        </div>
                                        <Progress value={gradingRate} className="h-2 bg-slate-100" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    )
                })}
            </div>
        </div>
    )
}
