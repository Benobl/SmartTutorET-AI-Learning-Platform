"use client"

import { useState, useEffect } from "react"
import { assignmentApi, courseApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Plus, FileText, Users, CheckCircle2, Clock, X, Calendar, AlignLeft, Paperclip, ChevronRight, ArrowUpRight, Search, Loader2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/components/ui/use-toast"

export default function TeacherAssignmentsPage() {
    const { toast } = useToast()
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [assignments, setAssignments] = useState<any[]>([])
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [form, setForm] = useState({ title: "", description: "", dueDate: "", maxMarks: "100" })
    const [filter, setFilter] = useState<"all" | "active" | "closed">("all")
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
    const [submissions, setSubmissions] = useState<any[]>([])
    const [isViewingSubmissions, setIsViewingSubmissions] = useState(false)
    const [evaluationForm, setEvaluationForm] = useState({ marks: "", feedback: "" })
    const [evaluatingSubmissionId, setEvaluatingSubmissionId] = useState<string | null>(null)

    useEffect(() => {
        fetchInitialData()
    }, [])

    const fetchInitialData = async () => {
        setLoading(true)
        try {
            const coursesRes = await courseApi.getMyCourses()
            setCourses(coursesRes.data || [])
            
            // If there are courses, fetch assignments for the first one or all
            if (coursesRes.data && coursesRes.data.length > 0) {
                const firstCourseId = coursesRes.data[0]._id || coursesRes.data[0].id
                setSelectedCourseId(firstCourseId)
                fetchAssignments(firstCourseId)
            } else {
                setLoading(false)
            }
        } catch (error) {
            console.error("Fetch Error:", error)
            setLoading(false)
        }
    }

    const fetchAssignments = async (courseId: string) => {
        try {
            const res = await assignmentApi.getByCourse(courseId)
            setAssignments(res.data || [])
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch assignments", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!form.title || !selectedCourseId || !form.dueDate) {
            toast({ title: "Missing Fields", description: "Please fill in all required fields.", variant: "destructive" })
            return
        }
        try {
            await assignmentApi.create({
                subjectId: selectedCourseId,
                title: form.title,
                description: form.description,
                maxMarks: parseInt(form.maxMarks),
                dueDate: form.dueDate
            })
            toast({ title: "Success", description: "Assignment created successfully!" })
            setCreating(false)
            setForm({ title: "", description: "", dueDate: "", maxMarks: "100" })
            fetchAssignments(selectedCourseId)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const handleViewSubmissions = async (assignment: any) => {
        setSelectedAssignment(assignment)
        setIsViewingSubmissions(true)
        try {
            const res = await assignmentApi.getSubmissions(assignment._id)
            setSubmissions(res.data || [])
        } catch (error) {
            toast({ title: "Error", description: "Failed to fetch submissions", variant: "destructive" })
        }
    }

    const handleEvaluate = async (submissionId: string) => {
        if (!evaluationForm.marks) return
        try {
            await assignmentApi.evaluate(submissionId, {
                marksObtained: parseInt(evaluationForm.marks),
                feedback: evaluationForm.feedback
            })
            toast({ title: "Evaluated", description: "Grade submitted successfully!" })
            setEvaluatingSubmissionId(null)
            setEvaluationForm({ marks: "", feedback: "" })
            // Refresh submissions
            if (selectedAssignment) handleViewSubmissions(selectedAssignment)
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        }
    }

    const filtered = assignments.filter(a => {
        const isClosed = new Date(a.dueDate) < new Date()
        if (filter === "all") return true
        return filter === "closed" ? isClosed : !isClosed
    })

    if (loading && !creating && !isViewingSubmissions) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Assignments...</p>
            </div>
        )
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1 italic uppercase tracking-tighter">Assignments</h1>
                    <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest">Create, manage, and evaluate student work.</p>
                </div>
                <div className="flex items-center gap-3">
                    <select
                        value={selectedCourseId}
                        onChange={e => {
                            setSelectedCourseId(e.target.value)
                            setLoading(true)
                            fetchAssignments(e.target.value)
                        }}
                        className="h-12 px-4 rounded-2xl border border-slate-200 bg-white text-xs font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                    >
                        {courses.map(c => (
                            <option key={c._id || c.id} value={c._id || c.id}>{c.title || c.name}</option>
                        ))}
                    </select>
                    <button
                        onClick={() => setCreating(true)}
                        className="flex items-center gap-2 px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20 active:scale-95"
                    >
                        <Plus className="w-4 h-4" />
                        New Assignment
                    </button>
                </div>
            </div>

            {/* Create Assignment Modal */}
            {creating && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/40 backdrop-blur-md p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-8">
                            <h2 className="text-2xl font-black text-slate-900 uppercase italic">Create Assignment</h2>
                            <button onClick={() => setCreating(false)} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        <div className="space-y-6">
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Assignment Title</label>
                                <Input
                                    placeholder="e.g. Chapter 5: Advanced Integration Submissions"
                                    value={form.title}
                                    onChange={e => setForm(p => ({ ...p, title: e.target.value }))}
                                    className="rounded-2xl h-14 font-bold border-slate-100 focus:ring-indigo-500/20"
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Due Date</label>
                                    <Input
                                        type="date"
                                        value={form.dueDate}
                                        onChange={e => setForm(p => ({ ...p, dueDate: e.target.value }))}
                                        className="rounded-2xl h-14 font-bold border-slate-100"
                                    />
                                </div>
                                <div>
                                    <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Max Marks</label>
                                    <Input
                                        type="number"
                                        placeholder="100"
                                        value={form.maxMarks}
                                        onChange={e => setForm(p => ({ ...p, maxMarks: e.target.value }))}
                                        className="rounded-2xl h-14 font-bold border-slate-100"
                                    />
                                </div>
                            </div>
                            <div>
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2 block">Instructions</label>
                                <textarea
                                    placeholder="Provide clear guidelines for your students..."
                                    value={form.description}
                                    onChange={e => setForm(p => ({ ...p, description: e.target.value }))}
                                    rows={4}
                                    className="w-full rounded-[24px] border border-slate-100 bg-white px-5 py-4 text-sm font-medium focus:ring-2 focus:ring-indigo-500/20 outline-none transition-all resize-none"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <button onClick={() => setCreating(false)} className="flex-1 py-4 border border-slate-100 rounded-2xl text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-50 transition-colors">
                                    Cancel
                                </button>
                                <button onClick={handleCreate} className="flex-1 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-xl shadow-indigo-600/20">
                                    Publish to Students
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Viewing Submissions Modal */}
            {isViewingSubmissions && selectedAssignment && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/60 backdrop-blur-xl p-4">
                    <div className="bg-white rounded-[40px] shadow-2xl p-10 w-full max-w-4xl h-[85vh] flex flex-col animate-in slide-in-from-bottom-8 duration-500">
                        <div className="flex items-center justify-between mb-8 shrink-0">
                            <div>
                                <h2 className="text-2xl font-black text-slate-900 uppercase italic leading-tight">{selectedAssignment.title}</h2>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Reviewing {submissions.length} Submissions</p>
                            </div>
                            <button onClick={() => setIsViewingSubmissions(false)} className="p-3 rounded-2xl hover:bg-slate-100 text-slate-400 transition-colors">
                                <X className="w-5 h-5" />
                            </button>
                        </div>
                        
                        <div className="flex-1 overflow-y-auto pr-2 space-y-4 no-scrollbar">
                            {submissions.length === 0 ? (
                                <div className="h-full flex flex-col items-center justify-center text-center space-y-4 opacity-50">
                                    <Clock className="w-12 h-12 text-slate-300" />
                                    <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No Submissions Yet</p>
                                </div>
                            ) : (
                                submissions.map(sub => (
                                    <div key={sub._id} className="p-6 rounded-[32px] border border-slate-100 bg-slate-50/50 hover:bg-white hover:shadow-lg transition-all space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-3">
                                                <div className="w-10 h-10 rounded-full bg-indigo-100 flex items-center justify-center">
                                                    <Users className="w-5 h-5 text-indigo-600" />
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-900 uppercase">{sub.student.name}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{new Date(sub.createdAt).toLocaleDateString()} • {sub.status}</p>
                                                </div>
                                            </div>
                                            {sub.status === "evaluated" ? (
                                                <div className="px-4 py-2 bg-emerald-50 text-emerald-600 rounded-xl text-[10px] font-black uppercase border border-emerald-100">
                                                    Score: {sub.marksObtained}/{selectedAssignment.maxMarks}
                                                </div>
                                            ) : (
                                                <button 
                                                    onClick={() => setEvaluatingSubmissionId(sub._id)}
                                                    className="px-4 py-2 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/10 active:scale-95 transition-all"
                                                >
                                                    Grade Now
                                                </button>
                                            )}
                                        </div>

                                        <div className="bg-white p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{sub.content || "No text provided."}</p>
                                        </div>

                                        {evaluatingSubmissionId === sub._id && (
                                            <div className="p-6 bg-white rounded-3xl border-2 border-indigo-100 shadow-xl space-y-4 animate-in slide-in-from-top-4 duration-300">
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div>
                                                        <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Assign Mark</label>
                                                        <Input 
                                                            type="number"
                                                            placeholder={`Max: ${selectedAssignment.maxMarks}`}
                                                            value={evaluationForm.marks}
                                                            onChange={e => setEvaluationForm(p => ({ ...p, marks: e.target.value }))}
                                                            className="rounded-xl h-11 font-bold border-slate-100"
                                                        />
                                                    </div>
                                                    <div className="flex items-end gap-2">
                                                        <button 
                                                            onClick={() => handleEvaluate(sub._id)}
                                                            className="flex-1 h-11 bg-indigo-600 text-white rounded-xl text-[10px] font-black uppercase shadow-lg shadow-indigo-600/10"
                                                        >
                                                            Submit Grade
                                                        </button>
                                                        <button 
                                                            onClick={() => setEvaluatingSubmissionId(null)}
                                                            className="px-4 h-11 border border-slate-100 text-slate-400 rounded-xl"
                                                        >
                                                            <X className="w-4 h-4" />
                                                        </button>
                                                    </div>
                                                </div>
                                                <div>
                                                    <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Feedback</label>
                                                    <textarea 
                                                        placeholder="Well done! Here are some areas for improvement..."
                                                        value={evaluationForm.feedback}
                                                        onChange={e => setEvaluationForm(p => ({ ...p, feedback: e.target.value }))}
                                                        rows={2}
                                                        className="w-full rounded-xl border border-slate-100 bg-white px-4 py-3 text-sm font-medium outline-none focus:ring-2 focus:ring-indigo-500/10 transition-all resize-none"
                                                    />
                                                </div>
                                            </div>
                                        )}
                                    </div>
                                ))
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* List Filter */}
            <div className="flex gap-2 bg-slate-100/50 p-1.5 rounded-[22px] border border-slate-200/50 w-fit">
                {(["all", "active", "closed"] as const).map(f => (
                    <button
                        key={f}
                        onClick={() => setFilter(f)}
                        className={cn(
                            "px-6 py-2.5 rounded-[18px] text-[10px] font-black uppercase tracking-widest transition-all", 
                            filter === f ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100" : "text-slate-500 hover:text-slate-700"
                        )}
                    >
                        {f}
                    </button>
                ))}
            </div>

            {/* Assignments List */}
            <div className="grid grid-cols-1 gap-6">
                {filtered.length === 0 ? (
                    <div className="py-20 flex flex-col items-center justify-center text-center space-y-4 opacity-40">
                        <FileText className="w-16 h-16 text-slate-300" />
                        <p className="text-sm font-black text-slate-400 uppercase tracking-widest">No assignments found in this category.</p>
                    </div>
                ) : (
                    filtered.map(assignment => {
                        const isClosed = new Date(assignment.dueDate) < new Date()
                        return (
                            <div key={assignment._id} className="bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 overflow-hidden group">
                                <div className="p-8">
                                    <div className="flex items-start justify-between gap-6 mb-6">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2 flex-wrap">
                                                <h3 className="text-xl font-black text-slate-900 group-hover:text-indigo-600 transition-colors uppercase italic">{assignment.title}</h3>
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border", 
                                                    !isClosed ? "bg-indigo-50 text-indigo-600 border-indigo-100" : "bg-slate-100 text-slate-400 border-slate-200"
                                                )}>
                                                    {!isClosed ? "ACTIVE" : "CLOSED"}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <Users className="w-4 h-4 text-indigo-400" />
                                                    <span>Grading: {assignment.maxMarks} Marks</span>
                                                </div>
                                            </div>
                                        </div>
                                        <button 
                                            onClick={() => handleViewSubmissions(assignment)}
                                            className="px-8 py-3 bg-white border border-slate-200 hover:border-indigo-500 text-slate-900 hover:text-indigo-600 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all shadow-sm active:scale-95 flex items-center gap-2"
                                        >
                                            View Submissions <ChevronRight className="w-4 h-4" />
                                        </button>
                                    </div>

                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 italic opacity-80">{assignment.description}</p>
                                    
                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                            <Paperclip className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supports Student Uploads (PDF/TXT)</p>
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>
        </div>
    )
}

