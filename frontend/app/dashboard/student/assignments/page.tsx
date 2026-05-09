"use client"

import { useEffect, useMemo, useRef, useState } from "react"
import {
    CheckCircle2, Clock, FileText, AlertCircle,
    ChevronRight, Upload, Download, Paperclip, X,
    Calendar, Inbox, Filter, Search, Sparkles,
    ArrowUpRight, Bookmark, LayoutGrid, ListTodo,
    AlertTriangle, Check, Star, Award
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { assignmentApi, courseApi, uploadApi } from "@/lib/api"

export default function StudentAssignments() {
    const [activeTab, setActiveTab] = useState<"pending" | "submitted" | "graded">("pending")
    const [searchQuery, setSearchQuery] = useState("")
    const [uploadedFiles, setUploadedFiles] = useState<Record<string, File[]>>({})
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [activeUploadId, setActiveUploadId] = useState<string | null>(null)
    const { toast } = useToast()

    const [loading, setLoading] = useState(true)
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [assignments, setAssignments] = useState<any[]>([])
    const [mySubmissions, setMySubmissions] = useState<any[]>([])
    const [submitting, setSubmitting] = useState(false)
    const [draftText, setDraftText] = useState<Record<string, string>>({})

    const fetchAssignments = async (courseId: string) => {
        const [assignmentsResult, submissionsResult] = await Promise.allSettled([
            assignmentApi.getByCourse(courseId),
            assignmentApi.getMySubmissionsForCourse(courseId),
        ])

        if (assignmentsResult.status === "fulfilled") {
            setAssignments(assignmentsResult.value?.data || [])
        } else {
            setAssignments([])
            toast({
                title: "Assignments unavailable",
                description: assignmentsResult.reason?.message || "Could not load assignments for this course.",
                variant: "destructive",
            })
        }

        if (submissionsResult.status === "fulfilled") {
            setMySubmissions(submissionsResult.value?.data || [])
        } else {
            setMySubmissions([])
            toast({
                title: "Submissions unavailable",
                description: submissionsResult.reason?.message || "Could not load your submissions right now.",
                variant: "destructive",
            })
        }

        return {
            assignments:
                assignmentsResult.status === "fulfilled"
                    ? (assignmentsResult.value?.data || [])
                    : [],
            submissions:
                submissionsResult.status === "fulfilled"
                    ? (submissionsResult.value?.data || [])
                    : [],
        }
    }

    useEffect(() => {
        (async () => {
            setLoading(true)
            try {
                const courseRes = await courseApi.getMyCourses()
                const list = courseRes?.data || []
                setCourses(list)
                if (list.length > 0) {
                    // Prefer a course that actually has assignments for this student.
                    let chosenCourseId = list[0]?._id || list[0]?.id || ""
                    for (const course of list) {
                        const courseId = course?._id || course?.id
                        if (!courseId) continue
                        const data = await fetchAssignments(courseId)
                        if ((data.assignments || []).length > 0) {
                            chosenCourseId = courseId
                            break
                        }
                    }
                    setSelectedCourseId(chosenCourseId)
                    await fetchAssignments(chosenCourseId)
                } else {
                    setSelectedCourseId("")
                    setAssignments([])
                    setMySubmissions([])
                }
            } catch (e: any) {
                toast({ title: "Error", description: e?.message || "Failed to load courses", variant: "destructive" })
            } finally {
                setLoading(false)
            }
        })()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

    const submissionByAssignmentId = useMemo(() => {
        const map = new Map<string, any>()
        ;(mySubmissions || []).forEach((s: any) => {
            const assignmentId =
                typeof s.assignment === "object"
                    ? (s.assignment?._id || s.assignment?.id)
                    : s.assignment
            if (assignmentId) {
                map.set(String(assignmentId), s)
            }
        })
        return map
    }, [mySubmissions])

    const handleFileSelect = (assignmentId: string, files: FileList | null) => {
        if (!files) return
        setUploadedFiles((prev) => ({
            ...prev,
            [assignmentId]: [...(prev[assignmentId] || []), ...Array.from(files)],
        }))
        toast({
            title: "File(s) Attached",
            description: `${files.length} file(s) ready for submission.`,
        })
    }

    const removeFile = (assignmentId: string, fileName: string) => {
        setUploadedFiles((prev) => ({
            ...prev,
            [assignmentId]: (prev[assignmentId] || []).filter((f) => f.name !== fileName),
        }))
    }

    const handleSubmit = async (assignmentId: string) => {
        try {
            setSubmitting(true)
            const files = uploadedFiles[assignmentId] || []
            const uploadedUrls: string[] = []
            for (const file of files) {
                const up = await uploadApi.uploadDocument(file, "assignment")
                uploadedUrls.push(up.url)
            }
            await assignmentApi.submit(assignmentId, {
                content: draftText[assignmentId] || "",
                attachments: uploadedUrls,
            })
            toast({ title: "Submitted", description: "Your work has been sent for review." })
            setUploadedFiles((p) => ({ ...p, [assignmentId]: [] }))
            setDraftText((p) => ({ ...p, [assignmentId]: "" }))
            setActiveTab("submitted")
            if (selectedCourseId) await fetchAssignments(selectedCourseId)
        } catch (e: any) {
            toast({ title: "Submit failed", description: e?.message || "Could not submit assignment", variant: "destructive" })
        } finally {
            setSubmitting(false)
        }
    }

    const filteredAssignments = useMemo(() => {
        const now = new Date()
        return (assignments || []).filter((asgn: any) => {
            const sub = submissionByAssignmentId.get(String(asgn._id))
            const due = asgn.dueDate ? new Date(asgn.dueDate) : null
            const isClosed = due ? due < now : false

            const status =
                sub?.status === "evaluated" ? "graded" :
                sub ? "submitted" :
                "pending"

            if (activeTab === "pending" && status !== "pending") return false
            if (activeTab === "submitted" && status !== "submitted") return false
            if (activeTab === "graded" && status !== "graded") return false

            const q = searchQuery.toLowerCase()
            const title = String(asgn.title || "").toLowerCase()
            return !q || title.includes(q)
        })
    }, [activeTab, searchQuery, assignments, submissionByAssignmentId])

    const priorityStyles = (priority: string) => {
        switch (priority) {
            case "high": return "bg-sky-100 text-sky-700 border-sky-200"
            case "medium": return "bg-indigo-50 text-indigo-600 border-indigo-100"
            case "low": return "bg-slate-50 text-slate-500 border-slate-100"
            default: return "bg-slate-50 text-slate-500"
        }
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Workflow Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Assignment <span className='text-sky-500'>Hub</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Track your upcoming tasks, submit your work, and review tutor feedback in one centralized location.
                        </p>
                    </div>

                    <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 w-fit">
                        {[
                            { id: 'pending', label: 'Upcoming', icon: Clock },
                            { id: 'submitted', label: 'Completed', icon: CheckCircle2 },
                            { id: 'graded', label: 'Achievement', icon: Star },
                        ].map((t) => (
                            <button
                                key={t.id}
                                onClick={() => setActiveTab(t.id as any)}
                                className={cn(
                                    "h-12 px-8 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5",
                                    activeTab === t.id
                                        ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                        : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                <t.icon className="w-4 h-4" />
                                {t.label}
                            </button>
                        ))}
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <select
                        value={selectedCourseId}
                        onChange={async (e) => {
                            const id = e.target.value
                            setSelectedCourseId(id)
                            setLoading(true)
                            try {
                                await fetchAssignments(id)
                            } finally {
                                setLoading(false)
                            }
                        }}
                        className="h-16 px-5 rounded-[28px] bg-white border border-slate-200 text-[10px] font-black uppercase tracking-widest outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all shadow-sm"
                    >
                        {courses.map((c: any) => (
                            <option key={c._id || c.id} value={c._id || c.id}>
                                {c.title || c.name}
                            </option>
                        ))}
                    </select>
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {loading ? (
                    <div className="col-span-1 xl:col-span-2 py-24 bg-white border border-slate-100 rounded-[64px] shadow-sm text-center">
                        <p className="text-slate-400 font-bold text-sm">Loading assignments...</p>
                    </div>
                ) : filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                        <div
                            key={assignment._id}
                            className="group p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8">
                                <span className={cn(
                                    "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border",
                                    priorityStyles(assignment.priority)
                                )}>
                                    {assignment.priority} Priority
                                </span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[24px] bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-110 transition-transform shadow-sm">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-sky-600 transition-colors">{assignment.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Max {assignment.maxMarks} Marks</span>
                                        </div>
                                    </div>
                                </div>

                                <p className="text-sm text-slate-600 font-medium leading-relaxed line-clamp-2 pr-10">
                                    {assignment.description}
                                </p>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Calendar className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Deadline</span>
                                        </div>
                                        <p className={cn(
                                            "text-xs font-black tracking-tight",
                                            assignment.dueDate && new Date(assignment.dueDate) < new Date()
                                                ? "text-rose-600"
                                                : "text-slate-900"
                                        )}>
                                            {assignment.dueDate
                                                ? `${new Date(assignment.dueDate).toLocaleDateString()}${new Date(assignment.dueDate) < new Date() ? " (Overdue)" : ""}`
                                                : "TBD"}
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <LayoutGrid className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Assessment</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-900 tracking-tight">Formative Task</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex -space-x-3">
                                        {(assignment.attachments || []).slice(0, 3).map((_: any, i: number) => (
                                            <div key={i} className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm">
                                                <Paperclip className="w-4.5 h-4.5 text-slate-400" />
                                            </div>
                                        ))}
                                        {assignment.attachments && assignment.attachments.length > 3 && (
                                            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-600 text-[10px] font-black flex items-center justify-center border-2 border-white">
                                                +{assignment.attachments.length - 3}
                                            </div>
                                        )}

                                    </div>

                                    {(() => {
                                        const sub = submissionByAssignmentId.get(String(assignment._id))
                                        if (!sub) {
                                            return (
                                        <button
                                            onClick={() => { setActiveUploadId(String(assignment._id)); fileInputRef.current?.click(); }}
                                            className="h-14 px-8 bg-sky-500 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:bg-sky-600 hover:scale-105 transition-all active:scale-95"
                                        >
                                            {uploadedFiles[String(assignment._id)]?.length ? `Attached (${uploadedFiles[String(assignment._id)].length})` : 'Attach Files'}
                                            <ArrowUpRight className="w-4 h-4 text-white" />
                                        </button>
                                            )
                                        }
                                        if (sub.status === "evaluated") {
                                            return (
                                        <div className="flex items-center gap-4 max-w-[60%]">
                                            <div className="text-right">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Final Mark</p>
                                                <p className="text-xl font-black text-sky-600">{sub.marksObtained}/{assignment.maxMarks}</p>
                                                {sub?.result?.rank && sub?.result?.totalEvaluated ? (
                                                    <p className="text-[10px] font-black text-indigo-600 uppercase tracking-widest mt-0.5">
                                                        Rank #{sub.result.rank}/{sub.result.totalEvaluated}
                                                    </p>
                                                ) : null}
                                            </div>
                                            <div className="w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 shrink-0">
                                                <Award className="w-6 h-6" />
                                            </div>
                                        </div>
                                            )
                                        }
                                        return (
                                        <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest py-3 px-6 rounded-2xl bg-emerald-50 border border-emerald-100">
                                            <Check className="w-4 h-4" />
                                            Submitted
                                        </div>
                                        )
                                    })()}
                                </div>

                                {(() => {
                                    const sub = submissionByAssignmentId.get(String(assignment._id))
                                    if (!sub || sub.status !== "evaluated" || !sub.feedback) return null
                                    return (
                                        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40">
                                            <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">Tutor Feedback</p>
                                            <p className="text-sm text-indigo-900 font-medium whitespace-pre-wrap">{sub.feedback}</p>
                                        </div>
                                    )
                                })()}

                                {!submissionByAssignmentId.get(String(assignment._id)) && (
                                    <div className="pt-4 space-y-3">
                                        <textarea
                                            placeholder="Write your answer / solution here..."
                                            value={draftText[String(assignment._id)] || ""}
                                            onChange={(e) => setDraftText((p) => ({ ...p, [String(assignment._id)]: e.target.value }))}
                                            className="w-full min-h-[90px] rounded-[24px] border border-slate-100 bg-slate-50 px-5 py-4 text-sm font-medium outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all resize-none"
                                        />
                                        <Button
                                            onClick={() => handleSubmit(String(assignment._id))}
                                            disabled={
                                                submitting ||
                                                (assignment.dueDate && new Date(assignment.dueDate) < new Date()) ||
                                                (!String(draftText[String(assignment._id)] || "").trim() &&
                                                    !(uploadedFiles[String(assignment._id)] || []).length)
                                            }
                                            className="w-full h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px]"
                                        >
                                            {assignment.dueDate && new Date(assignment.dueDate) < new Date() ? "Deadline Passed" : "Submit Assignment"}
                                        </Button>
                                    </div>
                                )}
                            </div>

                            {/* Decorative Elements */}
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 xl:col-span-2 py-32 bg-white border border-dashed border-slate-200 rounded-[64px] shadow-sm text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Inbox className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em]">
                            {courses.length === 0 ? "No Course Access Yet" : "Queue Crystal Clear"}
                        </h3>
                        <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto mt-4 leading-relaxed lowercase">
                            {courses.length === 0
                                ? "This student account has no assigned or enrolled courses yet. Join or enroll in a course to receive assignments."
                                : `Outstanding work successfully managed. No pending items found in ${activeTab} records.`}
                        </p>
                    </div>
                )}
            </div>

            {/* Hidden Input */}
            <input
                ref={fileInputRef}
                type="file"
                className="hidden"
                multiple
                onChange={(e) => {
                    if (activeUploadId !== null) {
                        handleFileSelect(activeUploadId, e.target.files)
                    }
                }}
            />
        </div>
    )
}
