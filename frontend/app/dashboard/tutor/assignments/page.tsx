"use client"

import { useState, useEffect } from "react"
import {
    ClipboardList, Plus, Search, Calendar, Users, 
    FileText, CheckCircle, Clock, AlertCircle, 
    ArrowUpRight, Download, Eye, Send, MoreVertical,
    FileUp, Sparkles, BookOpen, GraduationCap, Percent,
    ChevronRight, X, Paperclip
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { assignmentApi, courseApi } from "@/lib/api"
import { format } from "date-fns"

export default function TutorAssignments() {
    const [courses, setCourses] = useState<any[]>([])
    const [selectedCourseId, setSelectedCourseId] = useState<string>("")
    const [assignments, setAssignments] = useState<any[]>([])
    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    
    // Modal states
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isViewSubmissionsOpen, setIsViewSubmissionsOpen] = useState(false)
    const [isGradeOpen, setIsGradeOpen] = useState(false)
    
    const [selectedAssignment, setSelectedAssignment] = useState<any>(null)
    const [selectedSubmission, setSelectedSubmission] = useState<any>(null)
    
    const [filter, setFilter] = useState<"all" | "active" | "closed">("all")
    
    const { toast } = useToast()

    // Form states
    const [newAssignment, setNewAssignment] = useState({
        title: "",
        description: "",
        maxMarks: 100,
        weight: 10,
        priority: "medium",
        dueDate: "",
        subjectId: ""
    })
    
    const [grading, setGrading] = useState({
        marksObtained: 0,
        feedback: ""
    })
    const [isUploading, setIsUploading] = useState(false)
    const [assignmentFile, setAssignmentFile] = useState<File | null>(null)

    useEffect(() => {
        loadData()
    }, [])

    const loadData = async () => {
        try {
            setLoading(true)
            const res = await courseApi.getMyCourses()
            const tutorCourses = res.data || []
            setCourses(tutorCourses)
            if (tutorCourses.length > 0) {
                const preferred = tutorCourses.find((c: any) => c.status === "approved") || tutorCourses[0]
                const firstId = preferred._id || preferred.id
                setSelectedCourseId(firstId)
                await loadAssignments(firstId)
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to load your courses", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const loadAssignments = async (courseId: string) => {
        try {
            const res = await assignmentApi.getByCourse(courseId)
            setAssignments(res.data || [])
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to load assignments", variant: "destructive" })
        }
    }

    const loadSubmissions = async (assignmentId: string) => {
        try {
            const res = await assignmentApi.getSubmissions(assignmentId)
            setSubmissions(res.data || [])
        } catch (error: any) {
            toast({ title: "Error", description: "Failed to load submissions", variant: "destructive" })
        }
    }

    const handleCreateAssignment = async () => {
        if (!newAssignment.title || !selectedCourseId || !newAssignment.dueDate) {
            toast({ title: "Missing Fields", description: "Please fill all required fields.", variant: "destructive" })
            return
        }

        try {
            setIsUploading(true)
            let fileUrl = ""
            if (assignmentFile) {
                const { uploadApi } = await import("@/lib/api")
                const up = await uploadApi.uploadDocument(assignmentFile, "assignment")
                fileUrl = up.url
            }

            const created = await assignmentApi.create({
                ...newAssignment,
                subjectId: selectedCourseId,
                attachments: fileUrl ? [fileUrl] : []
            })

            toast({ title: "Assignment Created", description: "Your students have been notified." })
            if (created?.data) {
                setAssignments((prev) => [created.data, ...prev])
            }
            setIsCreateOpen(false)
            setNewAssignment({ title: "", description: "", maxMarks: 100, weight: 10, priority: "medium", dueDate: "", subjectId: "" })
            setAssignmentFile(null)
            await loadAssignments(selectedCourseId)
        } catch (error: any) {
            toast({ title: "Creation Failed", description: error.message || "Failed to create assignment", variant: "destructive" })
        } finally {
            setIsUploading(false)
        }
    }

    const handleViewSubmissions = async (assignment: any) => {
        setSelectedAssignment(assignment)
        setIsViewSubmissionsOpen(true)
        await loadSubmissions(assignment._id)
    }

    const handleGradeSubmission = async () => {
        const parsedMarks = Number(grading.marksObtained)
        if (!Number.isFinite(parsedMarks)) {
            toast({ title: "Missing Marks", description: "Please enter a valid score.", variant: "destructive" })
            return
        }
        if (selectedAssignment && (parsedMarks < 0 || parsedMarks > selectedAssignment.maxMarks)) {
            toast({
                title: "Invalid Marks",
                description: `Marks must be between 0 and ${selectedAssignment.maxMarks}.`,
                variant: "destructive"
            })
            return
        }

        try {
            const res = await assignmentApi.evaluate(selectedSubmission._id, {
                marksObtained: parsedMarks,
                feedback: grading.feedback
            })
            const rank = res?.data?.result?.rank
            const totalEvaluated = res?.data?.result?.totalEvaluated
            
            toast({ title: "Grading Complete", description: "Marks synchronized to student records." })
            if (rank && totalEvaluated) {
                toast({
                    title: "Ranking Updated",
                    description: `This student is now ranked #${rank} out of ${totalEvaluated} graded submissions.`,
                })
            }
            setIsGradeOpen(false)
            setGrading({ marksObtained: 0, feedback: "" })
            if (selectedAssignment?._id) await loadSubmissions(selectedAssignment._id)
        } catch (error: any) {
            toast({ title: "Grading Failed", description: error.message || "Failed to submit grades.", variant: "destructive" })
        }
    }

    const filtered = assignments.filter(a => {
        const isClosed = new Date(a.dueDate) < new Date()
        if (filter === "all") return true
        return filter === "closed" ? isClosed : !isClosed
    })

    if (loading) {
        return (
            <div className="flex flex-col items-center justify-center min-h-[400px] space-y-4">
                <Loader2 className="w-10 h-10 text-indigo-600 animate-spin" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Loading Assignments...</p>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Assessment Hub</span>
                            <Sparkles className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Curriculum <span className='text-indigo-600'>Assignments</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Design rigorous assessments, set weighted grading scales, and provide personalized feedback to accelerate student mastery.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-slate-200 hover:bg-slate-800 hover:scale-105 transition-all"
                        >
                            <Plus className="w-4 h-4" /> Create New Assignment
                        </Button>
                        <select
                            value={selectedCourseId}
                            onChange={async (e) => {
                                const id = e.target.value
                                setSelectedCourseId(id)
                                setLoading(true)
                                await loadAssignments(id)
                                setLoading(false)
                            }}
                            className="h-14 px-5 rounded-2xl border border-slate-200 bg-white text-[10px] font-black uppercase tracking-widest outline-none focus:ring-2 focus:ring-indigo-500/20 transition-all shadow-sm"
                        >
                            {courses.map(c => (
                                <option key={c._id || c.id} value={c._id || c.id}>
                                    {c.title || c.name} {c.status && c.status !== "approved" ? `( ${String(c.status).toUpperCase()} )` : ""}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

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
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {filtered.length === 0 ? (
                    <div className="col-span-full p-20 text-center bg-white rounded-[48px] border border-dashed border-slate-200">
                        <ClipboardList className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-lg font-black text-slate-400 uppercase italic">No assignments found in this category</h3>
                        <p className="text-slate-400 text-xs font-bold uppercase tracking-widest mt-2">Initialize your first assessment to begin tracking student performance.</p>
                    </div>
                ) : (
                    filtered.map((assignment) => {
                        const isClosed = new Date(assignment.dueDate) < new Date()
                        return (
                            <div key={assignment._id} className="group bg-white rounded-[40px] border border-slate-100 shadow-sm hover:shadow-2xl hover:border-indigo-100 transition-all duration-500 overflow-hidden flex flex-col justify-between min-h-[400px]">
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
                                                <span className={cn(
                                                    "text-[9px] font-black uppercase tracking-[0.2em] px-3 py-1 rounded-full border",
                                                    assignment.priority === "high"
                                                        ? "bg-rose-50 text-rose-600 border-rose-100"
                                                        : assignment.priority === "low"
                                                            ? "bg-slate-100 text-slate-500 border-slate-200"
                                                            : "bg-amber-50 text-amber-700 border-amber-100"
                                                )}>
                                                    {String(assignment.priority || "medium")}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-6 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-4 h-4 text-indigo-400" />
                                                    <span>Due: {new Date(assignment.dueDate).toLocaleDateString()}</span>
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <GraduationCap className="w-4 h-4 text-indigo-400" />
                                                    <span>Max: {assignment.maxMarks} Marks</span>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <p className="text-xs text-slate-500 font-medium leading-relaxed mb-6 italic opacity-80 line-clamp-3">{assignment.description}</p>
                                    
                                    <div className="flex items-center gap-3 pt-6 border-t border-slate-50">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center">
                                            <Paperclip className="w-4 h-4 text-slate-300" />
                                        </div>
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Supports Student Uploads (PDF/TXT)</p>
                                    </div>
                                </div>

                                <div className="p-8 pt-0 flex items-center justify-between">
                                    <Badge className="bg-emerald-50 text-emerald-600 border-none text-[8px] font-black uppercase italic">
                                        Weight: {assignment.weight || 10}%
                                    </Badge>
                                    <Button 
                                        onClick={() => handleViewSubmissions(assignment)}
                                        className="h-12 px-6 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-indigo-500/20"
                                    >
                                        Review Submissions <ArrowUpRight className="w-3.5 h-3.5 ml-2" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                )}
            </div>

            {/* Create Assignment Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[600px] rounded-[48px] border-none p-10 shadow-2xl">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-indigo-50 text-indigo-600 flex items-center justify-center mb-6">
                            <Plus className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Initialize <span className="text-indigo-600">Assessment</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Set up a new curriculum evaluation module for your students. All enrolled students will be notified instantly.
                        </DialogDescription>
                    </DialogHeader>
                    
                    <div className="py-8 space-y-6">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assignment Title</label>
                                <Input 
                                    placeholder="e.g. Midterm Lab Report"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm"
                                    value={newAssignment.title}
                                    onChange={(e) => setNewAssignment({...newAssignment, title: e.target.value})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest ml-1">Priority</label>
                                <select
                                    value={newAssignment.priority}
                                    onChange={e => setNewAssignment(p => ({ ...p, priority: e.target.value }))}
                                    className="w-full rounded-2xl h-14 font-bold border border-slate-100 px-4 text-sm bg-slate-50 outline-none focus:ring-2 focus:ring-indigo-500/20"
                                >
                                    <option value="high">High</option>
                                    <option value="medium">Medium</option>
                                    <option value="low">Low</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Instructions & Rubric</label>
                            <Textarea 
                                placeholder="Describe the requirements and grading criteria..."
                                className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 font-medium text-sm p-4"
                                value={newAssignment.description}
                                onChange={(e) => setNewAssignment({...newAssignment, description: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-3 gap-6">
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Max Marks</label>
                                <Input 
                                    type="number"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm text-center"
                                    value={newAssignment.maxMarks}
                                    onChange={(e) => setNewAssignment({...newAssignment, maxMarks: parseInt(e.target.value)})}
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Weight (%)</label>
                                <div className="relative">
                                    <Input 
                                        type="number"
                                        className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm text-center pr-10"
                                        value={newAssignment.weight}
                                        onChange={(e) => setNewAssignment({...newAssignment, weight: parseInt(e.target.value)})}
                                    />
                                    <Percent className="absolute right-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Deadline</label>
                                <Input 
                                    type="date"
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm"
                                    value={newAssignment.dueDate}
                                    onChange={(e) => setNewAssignment({...newAssignment, dueDate: e.target.value})}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Support Materials (Optional)</label>
                            <div className="group relative border-2 border-dashed border-slate-200 rounded-3xl p-8 hover:border-indigo-400 hover:bg-indigo-50/30 transition-all cursor-pointer bg-slate-50/50">
                                <input 
                                    type="file"
                                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
                                    onChange={(e) => setAssignmentFile(e.target.files?.[0] || null)}
                                />
                                <div className="flex flex-col items-center gap-3 text-center">
                                    <div className="w-12 h-12 rounded-2xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-indigo-500 transition-colors">
                                        <FileUp className="w-6 h-6" />
                                    </div>
                                    <div>
                                        <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                                            {assignmentFile ? assignmentFile.name : "Select Desktop File"}
                                        </p>
                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">PDF, Word, or Spreadsheet (Max 10MB)</p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            disabled={isUploading}
                            onClick={handleCreateAssignment}
                            className="w-full h-16 rounded-[24px] bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-indigo-500/30 flex items-center gap-3"
                        >
                            {isUploading ? "Processing..." : <>Deploy Assignment <Send className="w-4 h-4" /></>}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* View Submissions Sheet */}
            <Dialog open={isViewSubmissionsOpen} onOpenChange={setIsViewSubmissionsOpen}>
                <DialogContent className="sm:max-w-[1000px] rounded-[48px] border-none p-0 overflow-hidden shadow-2xl">
                    <div className="bg-indigo-600 p-10 text-white relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 rounded-full blur-3xl" />
                        <div className="relative z-10">
                            <Badge className="bg-white/10 text-white border-none text-[10px] font-black uppercase tracking-widest mb-4">Course: {selectedCourseId && courses.find(c => c._id === selectedCourseId || c.id === selectedCourseId)?.title}</Badge>
                            <h2 className="text-4xl font-black italic uppercase tracking-tighter leading-none mb-2">{selectedAssignment?.title}</h2>
                            <p className="text-indigo-100 font-bold uppercase tracking-widest text-[10px]">{submissions.length} Students have submitted their work</p>
                        </div>
                    </div>

                    <div className="p-10 max-h-[600px] overflow-y-auto bg-slate-50">
                        {submissions.length === 0 ? (
                            <div className="text-center py-20">
                                <Users className="w-16 h-16 text-slate-200 mx-auto mb-6" />
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No submissions yet from students</p>
                            </div>
                        ) : (
                            <div className="grid gap-6">
                                {submissions.map((sub) => (
                                    <div key={sub._id} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/5 hover:border-indigo-100 transition-all flex flex-col gap-6">
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-6">
                                                <Avatar className="w-16 h-16 rounded-3xl border-4 border-slate-50 shadow-sm">
                                                    <AvatarImage src={sub.student?.profile?.avatar} />
                                                    <AvatarFallback className="bg-indigo-50 text-indigo-600 font-black">{sub.student?.name?.split(" ").map((n: any) => n[0]).join("") || "ST"}</AvatarFallback>
                                                </Avatar>
                                                <div>
                                                    <h4 className="text-lg font-black text-slate-900 leading-none mb-1.5">{sub.student?.name || "Unknown Student"}</h4>
                                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest italic">Submitted on {format(new Date(sub.createdAt), "MMM dd, hh:mm a")}</p>
                                                </div>
                                            </div>

                                            <div className="flex items-center gap-4">
                                                {sub.attachments && sub.attachments.length > 0 && (
                                                    <Button 
                                                        variant="outline" 
                                                        onClick={() => window.open(sub.attachments[0], '_blank')}
                                                        className="h-12 px-6 rounded-2xl border-slate-100 text-slate-600 font-black text-[9px] uppercase tracking-widest"
                                                    >
                                                        <Download className="w-4 h-4 mr-2" /> Download Work
                                                    </Button>
                                                )}
                                                {sub.status === "evaluated" ? (
                                                    <div className="flex flex-col items-end px-6">
                                                        <Badge className="bg-emerald-50 text-emerald-600 border-none font-black text-[10px] mb-1 uppercase italic">Evaluated</Badge>
                                                        <span className="text-xl font-black text-slate-900">{sub.marksObtained} / {selectedAssignment.maxMarks}</span>
                                                        {sub?.result?.rank && sub?.result?.totalEvaluated ? (
                                                            <p className="text-[9px] mt-1 text-emerald-700">Rank #{sub.result.rank}/{sub.result.totalEvaluated}</p>
                                                        ) : null}
                                                    </div>
                                                ) : (
                                                    <Button 
                                                        onClick={() => {
                                                            setSelectedSubmission(sub)
                                                            setIsGradeOpen(true)
                                                        }}
                                                        className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-200"
                                                    >
                                                        Evaluate Work
                                                    </Button>
                                                )}
                                            </div>
                                        </div>

                                        <div className="bg-slate-50/50 p-5 rounded-2xl border border-slate-100 shadow-sm">
                                            <p className="text-sm text-slate-600 font-medium whitespace-pre-wrap leading-relaxed">{sub.content || "No text provided."}</p>
                                        </div>

                                        {sub.status === "evaluated" && sub.feedback && (
                                            <div className="p-4 rounded-2xl border border-emerald-100 bg-emerald-50/60">
                                                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest mb-1">Tutor Feedback</p>
                                                <p className="text-sm font-medium text-emerald-900 whitespace-pre-wrap">{sub.feedback}</p>
                                            </div>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Grading Modal */}
            <Dialog open={isGradeOpen} onOpenChange={setIsGradeOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[40px] border-none p-10 shadow-2xl">
                    <DialogHeader>
                        <div className="w-16 h-16 rounded-3xl bg-emerald-50 text-emerald-600 flex items-center justify-center mb-6">
                            <CheckCircle className="w-8 h-8" />
                        </div>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Grade <span className="text-emerald-600">Evaluation</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">
                            Submit marks and provide detailed feedback for {selectedSubmission?.student?.name}.
                        </DialogDescription>
                    </DialogHeader>

                    <div className="py-8 space-y-6">
                        <div className="space-y-2">
                            <div className="flex justify-between ml-1">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Awarded Marks</label>
                                <span className="text-[10px] font-black uppercase text-indigo-600 tracking-widest">Out of {selectedAssignment?.maxMarks}</span>
                            </div>
                            <Input 
                                type="number"
                                className="h-16 rounded-2xl bg-slate-50 border-slate-100 font-black text-2xl text-center text-slate-900 focus:bg-white transition-all"
                                value={grading.marksObtained}
                                max={selectedAssignment?.maxMarks}
                                onChange={(e) => setGrading({...grading, marksObtained: parseInt(e.target.value)})}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Tutor Feedback</label>
                            <Textarea 
                                placeholder="Write a constructive review of the student's work..."
                                className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 font-medium text-sm p-4"
                                value={grading.feedback}
                                onChange={(e) => setGrading({...grading, feedback: e.target.value})}
                            />
                        </div>
                    </div>

                    <DialogFooter>
                        <Button 
                            onClick={handleGradeSubmission}
                            className="w-full h-16 rounded-[24px] bg-emerald-600 hover:bg-emerald-700 text-white font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/20"
                        >
                            Confirm & Sync Grades
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </div>
    )
}
