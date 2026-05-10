"use client"

import { useEffect, useMemo, useState } from "react"
import {
    CheckCircle2, Clock, FileText, AlertCircle,
    ChevronRight, Upload, Download, Paperclip, X,
    Calendar, Inbox, Search, Sparkles,
    ArrowUpRight, Award, Star, Loader2, Send,
    Percent, GraduationCap, BookOpen, Check
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useToast } from "@/hooks/use-toast"
import { assignmentApi, courseApi, uploadApi } from "@/lib/api"
import { format } from "date-fns"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

export default function StudentAssignments() {
    const [activeTab, setActiveTab] = useState<"pending" | "submitted" | "graded">("pending")
    const [searchQuery, setSearchQuery] = useState("")
    const [isLoading, setIsLoading] = useState(true)
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [assignments, setAssignments] = useState<any[]>([])
    const [mySubmissions, setMySubmissions] = useState<any[]>([])
    
    // Submission state
    const [isSubmitOpen, setIsSubmitOpen] = useState(false)
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
    const [submitForm, setSubmitForm] = useState({
        content: "",
        attachments: [] as string[]
    })
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [uploadingFile, setUploadingFile] = useState<File | null>(null)
    
    const { toast } = useToast()

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
            setIsLoading(true)
            try {
                const courseRes = await courseApi.getMyCourses()
                const list = courseRes?.data || []
                setCourses(list)
                if (list.length > 0) {
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
                setIsLoading(false)
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

    const handleSubmitWork = async () => {
        if (!submitForm.content && !uploadingFile) {
            toast({ title: "Submission empty", description: "Please provide content or a file.", variant: "destructive" })
            return
        }

        try {
            setIsSubmitting(true)
            let fileUrls: string[] = []
            
            if (uploadingFile) {
                const up = await uploadApi.uploadDocument(uploadingFile, "assignment")
                fileUrls = [up.url]
            }

            await assignmentApi.submit(selectedAssignment._id, {
                content: submitForm.content,
                attachments: fileUrls
            })

            toast({ title: "Success", description: "Assignment submitted successfully!" })
            setIsSubmitOpen(false)
            setSubmitForm({ content: "", attachments: [] })
            setUploadingFile(null)
            if (selectedCourseId) await fetchAssignments(selectedCourseId)
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (isLoading) {
        return (
            <div className="flex flex-col items-center justify-center py-40 gap-6">
                <Loader2 className="w-16 h-16 text-sky-500 animate-spin" />
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-slate-400 animate-pulse">Syncing Academic Ledger...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Workflow Hub</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase italic">
                            Curriculum <span className='text-sky-500'>Evaluation</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Monitor deadlines, track submissions, and review real-time feedback from your tutors.
                        </p>
                    </div>

                    <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 w-fit">
                        {[
                            { id: 'pending', label: 'Inbound', icon: Clock },
                            { id: 'submitted', label: 'Completed', icon: CheckCircle2 },
                            { id: 'graded', label: 'Recognition', icon: Award },
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
                            setIsLoading(true)
                            try {
                                await fetchAssignments(id)
                            } finally {
                                setIsLoading(false)
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
                            placeholder="Search tasks..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
                {isLoading ? (
                    <div className="col-span-1 xl:col-span-2 py-24 bg-white border border-slate-100 rounded-[64px] shadow-sm text-center">
                        <p className="text-slate-400 font-bold text-sm">Loading assignments...</p>
                    </div>
                ) : filteredAssignments.length > 0 ? (
                    filteredAssignments.map((assignment) => (
                        <div
                            key={assignment._id}
                            className="group p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 relative overflow-hidden"
                        >
                            <div className="absolute top-0 right-0 p-8 flex gap-2">
                                <Badge className="bg-slate-50 text-slate-600 border border-slate-100 text-[9px] font-black uppercase italic px-4 py-2 rounded-xl">
                                    {assignment.grade ? `Grade ${assignment.grade}` : "All Grades"}
                                </Badge>
                                <Badge className="bg-amber-50 text-amber-600 border border-amber-100 text-[9px] font-black uppercase italic px-4 py-2 rounded-xl">
                                    {assignment.type || "assignment"}
                                </Badge>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[24px] bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-110 transition-transform shadow-sm">
                                        <FileText className="w-8 h-8" />
                                    </div>
                                    <div>
                                        <h3 className="text-xl font-black text-slate-900 leading-tight mb-1 group-hover:text-sky-600 transition-colors uppercase italic">{assignment.title}</h3>
                                        <div className="flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-sky-400" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                {courses.find(c => c._id === selectedCourseId || c.id === selectedCourseId)?.title || "Course"} • {assignment.maxMarks} / {assignment.maxMarks} pts
                                            </span>
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
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Due Date</span>
                                        </div>
                                        <p className={cn(
                                            "text-xs font-black tracking-tight",
                                            assignment.dueDate && new Date(assignment.dueDate) < new Date()
                                                ? "text-rose-600"
                                                : "text-slate-900"
                                        )}>
                                            {assignment.dueDate
                                                ? `${format(new Date(assignment.dueDate), "MMM dd, yyyy")} ${new Date(assignment.dueDate) < new Date() ? "(Overdue)" : ""}`
                                                : "TBD"}
                                        </p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <GraduationCap className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Max Score</span>
                                        </div>
                                        <p className="text-xs font-black text-slate-900 tracking-tight">{assignment.maxMarks} / {assignment.maxMarks} pts</p>
                                    </div>
                                </div>

                                <div className="pt-4 flex items-center justify-between">
                                    <div className="flex items-center gap-2">
                                        {assignment.attachments?.map((url: string, i: number) => (
                                            <button 
                                                key={i}
                                                onClick={() => window.open(url, '_blank')}
                                                className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm hover:bg-slate-50 transition-colors"
                                            >
                                                <Download className="w-4 h-4 text-slate-400" />
                                            </button>
                                        ))}
                                    </div>

                                    {(() => {
                                        const sub = submissionByAssignmentId.get(String(assignment._id))
                                        if (!sub) {
                                            return (
                                                <button
                                                    onClick={() => { setSelectedAssignment(assignment); setIsSubmitOpen(true); }}
                                                    className="h-14 px-8 bg-sky-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:bg-sky-700 hover:scale-105 transition-all active:scale-95"
                                                >
                                                    Begin Submission
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
                                        <div className="p-4 rounded-2xl border border-indigo-100 bg-indigo-50/40 mt-4">
                                            <p className="text-[9px] font-black text-indigo-700 uppercase tracking-widest mb-1">Tutor Feedback</p>
                                            <p className="text-sm text-indigo-900 font-medium whitespace-pre-wrap">{sub.feedback}</p>
                                        </div>
                                    )
                                })()}
                            </div>
                        </div>
                    ))
                ) : (
                    <div className="col-span-1 xl:col-span-2 py-32 bg-white border border-dashed border-slate-200 rounded-[64px] shadow-sm text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <Inbox className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em]">
                            {courses.length === 0 ? "No Course Access Yet" : "Zero Inbound Tasks"}
                        </h3>
                        <p className="text-slate-400 font-bold text-sm max-w-sm mx-auto mt-4 leading-relaxed">
                            {courses.length === 0
                                ? "This student account has no assigned or enrolled courses yet. Join or enroll in a course to receive assignments."
                                : `Your academic queue is currently synchronized. All curriculum evaluations for ${activeTab} status are accounted for.`}
                        </p>
                    </div>
                )}
            </div>

            {/* Submit Assignment Modal */}
            <Dialog open={isSubmitOpen} onOpenChange={setIsSubmitOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[48px] border-none p-10 shadow-2xl">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-sky-50 text-sky-600 flex items-center justify-center mb-6">
                            <Upload className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Finalize <span className="text-sky-600">Submission</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Submit your solution for <span className="text-slate-900 font-bold">{selectedAssignment?.title}</span>. Ensure all required artifacts are attached.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Work Description / Narrative</label>
                            <Textarea 
                                placeholder="Explain your approach or provide a text-based response..."
                                className="min-h-[150px] rounded-3xl bg-slate-50 border-slate-100 font-medium text-sm p-5 resize-none focus:bg-white transition-all"
                                value={submitForm.content}
                                onChange={(e) => setSubmitForm({...submitForm, content: e.target.value})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Primary Artifact (Optional)</label>
                            <div className="group relative border-2 border-dashed border-slate-200 rounded-[32px] p-8 hover:border-sky-400 hover:bg-sky-50/30 transition-all cursor-pointer bg-slate-50/50">
                                <input 
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setUploadingFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                                        <Paperclip className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                                            {uploadingFile ? uploadingFile.name : "Attach Academic File"}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, Docs, or Media (Max 25MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            disabled={isSubmitting}
                            onClick={handleSubmitWork}
                            className="w-full h-16 rounded-[24px] bg-slate-900 text-white hover:bg-sky-600 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-slate-200 flex items-center gap-3 active:scale-95 transition-all"
                        >
                            {isSubmitting ? "Transmitting..." : <>Deploy Submission <Send className="w-4 h-4" /></>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
