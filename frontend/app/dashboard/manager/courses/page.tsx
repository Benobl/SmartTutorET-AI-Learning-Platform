"use client"

import { useState, useEffect } from "react"
import {
    Plus,
    Search,
    User,
    GraduationCap,
    Layers,
    Edit3,
    Trash2,
    Calendar,
    Settings2,
    BookOpen,
    Download,
    FileDown,
    MoreVertical,
    CheckCircle2,
    Clock,
    Sparkles,
    Zap,
    Eye,
    ArrowRight,
    FileText,
    TrendingDown,
    TrendingUp,
    ListPlus,
    Youtube,
    PenTool as Pen,
    Activity,
    Library,
    ExternalLink, FileUp, UploadCloud,
    Video as VideoIcon, FileType
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { Label } from "@/components/ui/label"
import { cn } from "@/lib/utils"
import { getCourses, addCourse, updateCourse, deleteCourse, exportToPDF, generateGradeCurriculum } from "@/lib/manager-utils"
import { toast } from "sonner"
import { courseApi, adminApi } from "@/lib/api"

const API_BASE_URL = (process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api').replace(/\/api$/, '')

const getFileUrl = (path?: string) => {
    if (!path) return ""
    if (path.startsWith('http')) return path
    return `${API_BASE_URL}${path.startsWith('/') ? '' : '/'}${path}`
}

export default function CourseManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [courses, setCourses] = useState<any[]>([])
    const [tutors, setTutors] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isAIModalOpen, setIsAIModalOpen] = useState(false)
    const [generatingCurriculum, setGeneratingCurriculum] = useState(false)
    const [pendingCourses, setPendingCourses] = useState<any[]>([])
    const [activeView, setActiveView] = useState<"curriculum" | "pending">("curriculum")
    const [editingCourse, setEditingCourse] = useState<any>(null)
    const [targetGrade, setTargetGrade] = useState("9")
    const [targetStream, setTargetStream] = useState("Common")

    // --- Module Architect States ---
    const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false)
    const [selectedCourseForModules, setSelectedCourseForModules] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [isLessonsLoading, setIsLessonsLoading] = useState(false)
    const [lessonForm, setLessonForm] = useState({
        title: "",
        duration: "15 min",
        type: "video" as "video" | "exercise" | "quiz" | "ppt" | "exam",
        url: "",
        content: ""
    })
    const [uploadType, setUploadType] = useState<"url" | "file">("url")

    // Smart-Switch Logic: Auto-toggle uploader based on component type
    useEffect(() => {
        if (lessonForm.type === "video") {
            setUploadType("url")
        } else {
            setUploadType("file")
        }
    }, [lessonForm.type])
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isUploadingVideo, setIsUploadingVideo] = useState(false)
    const [isApproved] = useState(true) // Managers are inherently approved
    const [searchQuery_modules, setSearchQuery_modules] = useState("")

    const loadCourseLessons = async () => {
        if (!selectedCourseForModules) return
        try {
            setIsLessonsLoading(true)
            const res = await courseApi.getLessons(selectedCourseForModules._id || selectedCourseForModules.id)
            setLessons(res.data || [])
        } catch (error: any) {
            toast.error("Failed to load module sequence.")
        } finally {
            setIsLessonsLoading(false)
        }
    }

    const getYoutubeEmbedUrl = (url: string) => {
        if (!url) return ""
        const regExp = /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/
        const match = url.match(regExp)
        if (match && match[2].length === 11) {
            return `https://www.youtube.com/embed/${match[2]}`
        }
        return url
    }

    const handleAddLesson = async () => {
        if (!lessonForm.title) return
        try {
            setIsUploadingVideo(true)
            const { uploadToSupabase, supabase } = await import("@/lib/supabase")
            let contentUrl = ""

            if (uploadType === "file" && videoFile) {
                try {
                    contentUrl = await uploadToSupabase(videoFile)
                    toast.success("File Uploaded: Securing resource in cloud storage...")
                } catch (error: any) {
                    toast.error(`Upload Failed: ${error.message}`)
                    setIsUploadingVideo(false)
                    return
                }
            } else if (uploadType === "url") {
                contentUrl = lessonForm.type === "video" ? getYoutubeEmbedUrl(lessonForm.url) : lessonForm.url
            }

            // Prepare for DB insert
            const payload = {
                course_id: selectedCourseForModules._id || selectedCourseForModules.id,
                type: lessonForm.type,
                title: lessonForm.title,
                content_url: contentUrl,
                quiz_data: lessonForm.content ? JSON.parse(lessonForm.content) : null,
                created_at: new Date().toISOString()
            }

            // 1. Save to Supabase Table (Critical Fix)
            if (supabase) {
                const { error: sbError } = await supabase
                    .from('course_contents')
                    .insert([payload])
                
                if (sbError) console.error("[SUPABASE DB ERROR]", sbError.message)
            }

            // 2. Sync with MongoDB Backend
            const mongoPayload: any = { 
                title: lessonForm.title,
                duration: lessonForm.duration,
                type: lessonForm.type,
                content: lessonForm.content
            }
            if (lessonForm.type === "video") mongoPayload.videoUrl = contentUrl
            else if (lessonForm.type === "ppt") mongoPayload.pptUrl = contentUrl
            else mongoPayload.exerciseUrl = contentUrl

            const res = await courseApi.addLesson(selectedCourseForModules._id, mongoPayload)
            setLessons(res.data.lessons)
            
            toast.success("Curriculum Synchronized: Content is now live for students.")
            setLessonForm({ title: "", duration: "15 min", type: "video", url: "", content: "" })
            setVideoFile(null)
        } catch (error: any) {
            toast.error(`Failed to add lesson: ${error.message}`)
        } finally {
            setIsUploadingVideo(false)
        }
    }

    useEffect(() => {
        if (selectedCourseForModules && isModuleManagerOpen) {
            loadCourseLessons()
        }
    }, [selectedCourseForModules, isModuleManagerOpen])

    // Form state
    const INITIAL_FORM_STATE = {
        name: "",
        code: "",
        subject: "",
        grade: "9",
        stream: "Common",
        semester: "Full Year",
        description: "",
        tutor: "",
        roadmap: {
            semester1: { chapters: "", midTerm: "", final: "" },
            semester2: { chapters: "", midTerm: "", final: "" }
        }
    }

    const [formState, setFormState] = useState(INITIAL_FORM_STATE)

    const handleExportPDF = () => {
        exportToPDF(courses)
        toast.success("Curriculum exported to PDF.")
    }

    const refreshCourses = async () => {
        try {
            const [cData, uData, pData] = await Promise.all([
                courseApi.getAll(),
                adminApi.getUsers(),
                adminApi.getPendingSubjects()
            ])
            setCourses(Array.isArray(cData.data) ? cData.data : [])
            setTutors(Array.isArray(uData.data) ? uData.data.filter((t: any) => t.role === 'tutor' && t.tutorStatus === 'approved') : [])
            setPendingCourses(Array.isArray(pData.data) ? pData.data : [])
        } catch (error) {
            console.error("Failed to refresh data:", error)
            toast.error("Resource synchronization failed.")
        }
    }

    useEffect(() => {
        refreshCourses()
    }, [])

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault()
        // Format data for backend
        const payload = {
            ...formState,
            title: formState.name,
            tutor: formState.tutor || undefined
        }

        if (editingCourse) {
            await courseApi.update(editingCourse.id, payload)
            toast.success("Course modified successfully.")
        } else {
            await courseApi.create(payload)
            toast.success("New course archived to curriculum.")
        }
        setIsCreateModalOpen(false)
        setEditingCourse(null)
        setFormState(INITIAL_FORM_STATE)
        refreshCourses()
    }

    const openEdit = (course: any) => {
        setEditingCourse({ ...course, id: course._id || course.id })
        setFormState({
            name: course.title || course.name,
            code: course.code,
            subject: course.subject || course.title,
            grade: course.grade?.toString() || "9",
            stream: course.stream || "Common",
            semester: course.semester || "Full Year",
            description: course.description || "",
            tutor: course.tutor?._id || course.tutor || "",
            roadmap: course.roadmap || {
                semester1: { chapters: "", midTerm: "", final: "" },
                semester2: { chapters: "", midTerm: "", final: "" }
            }
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = async (id: string) => {
        await deleteCourse(id)
        refreshCourses()
        toast.error("Course removed from registry.")
    }

    const handleAIGenerate = async () => {
        setGeneratingCurriculum(true)
        try {
            const result = await generateGradeCurriculum(targetGrade, targetStream)
            if (result && result.length > 0) {
                // Batch create courses
                for (const item of result) {
                    await addCourse({
                        title: item.title,
                        code: item.code,
                        subject: item.title,
                        grade: parseInt(item.grade) || 9,
                        stream: item.stream,
                        semester: "Full Year",
                        description: item.description,
                        status: "approved",
                        roadmap: {
                            semester1: {
                                chapters: [item.roadmap.semester1.chapters],
                                midTermDate: item.roadmap.semester1.midTerm || item.roadmap.semester1.midTermDate,
                                finalDate: item.roadmap.semester1.final || item.roadmap.semester1.finalDate
                            },
                            semester2: {
                                chapters: [item.roadmap.semester2.chapters],
                                midTermDate: item.roadmap.semester2.midTerm || item.roadmap.semester2.midTermDate,
                                finalDate: item.roadmap.semester2.final || item.roadmap.semester2.finalDate
                            }
                        }
                    })
                }
                toast.success(`Generated ${result.length} courses for Grade ${targetGrade} with Gemini!`)
                setIsAIModalOpen(false)
                refreshCourses()
            } else {
                toast.error("AI could not finalize the curriculum. Please try again.")
            }
        } catch (error) {
            console.error("AI Generation Error:", error)
            toast.error("Communication with Gemini failed.")
        } finally {
            setGeneratingCurriculum(false)
        }
    }

    const [isRejectModalOpen, setIsRejectModalOpen] = useState(false)
    const [isReviewModalOpen, setIsReviewModalOpen] = useState(false)
    const [selectedCourseForReview, setSelectedCourseForReview] = useState<any>(null)
    const [rejectionFeedback, setRejectionFeedback] = useState("")
    const [selectedCourseId, setSelectedCourseId] = useState<string | null>(null)

    const handleApprove = async (id: string) => {
        try {
            await adminApi.approveSubject(id)
            toast.success("Course framework approved and published.")
            refreshCourses()
        } catch (error) {
            toast.error("Failed to approve course.")
        }
    }

    const openRejectModal = (id: string) => {
        setSelectedCourseId(id)
        setRejectionFeedback("")
        setIsRejectModalOpen(true)
    }

    const handleReject = async () => {
        if (!selectedCourseId) return
        try {
            await fetch(
                `${process.env.NEXT_PUBLIC_API_URL || 'http://localhost:5001/api'}/admin/reject-subject/${selectedCourseId}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Content-Type': 'application/json',
                        'X-ST-CSRF': 'XMLHttpRequest',
                        Authorization: `Bearer ${localStorage.getItem('token') || ''}`
                    },
                    body: JSON.stringify({ feedback: rejectionFeedback })
                }
            )
            toast.warning("Course framework rejected with feedback.")
            setIsRejectModalOpen(false)
            refreshCourses()
        } catch (error) {
            toast.error("Failed to reject course.")
        }
    }

    const filteredCourses = (activeView === "curriculum" ? courses : pendingCourses).filter(c =>
        (c.title || c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    const appendFeedback = (text: string) => {
        setRejectionFeedback(prev => prev ? `${prev}. ${text}` : text)
    }

    const openReview = (course: any) => {
        setSelectedCourseForReview(course)
        setIsReviewModalOpen(true)
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1">
                <div className="space-y-1">
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight">Academic <span className="text-blue-600">Governance</span></h1>
                    <p className="text-slate-500 font-medium text-sm">Review, audit, and authorize institutional curriculum frameworks.</p>
                </div>
                <div className="flex items-center gap-4">
                    <div className="inline-flex p-1.5 bg-slate-100 rounded-[24px] border border-slate-200 shadow-inner mr-4">
                        <button
                            onClick={() => setActiveView("curriculum")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all",
                                activeView === "curriculum" ? "bg-white text-blue-600 shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <BookOpen className="w-4 h-4" /> Curriculum
                        </button>
                        <button
                            onClick={() => setActiveView("pending")}
                            className={cn(
                                "flex items-center gap-2 px-6 py-2.5 rounded-[20px] text-[10px] font-black uppercase tracking-widest transition-all relative",
                                activeView === "pending" ? "bg-white text-indigo-600 shadow-md border border-slate-100" : "text-slate-500 hover:text-slate-700"
                            )}
                        >
                            <Clock className="w-4 h-4" /> Pending
                            {pendingCourses.length > 0 && (
                                <span className="absolute -top-1 -right-1 w-5 h-5 bg-rose-500 text-white text-[8px] flex items-center justify-center rounded-full border-2 border-white animate-pulse">
                                    {pendingCourses.length}
                                </span>
                            )}
                        </button>
                    </div>

                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest transition-all"
                    >
                        <FileDown className="w-5 h-5" />
                        Export PDF
                    </Button>
                    <Button
                        onClick={() => {
                            setEditingCourse(null)
                            setFormState(INITIAL_FORM_STATE)
                            setIsCreateModalOpen(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Manual Archive
                    </Button>
                </div>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4 relative z-10">
                <div className="relative flex-1 max-w-[500px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search curriculum registry..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-14 rounded-2xl focus:ring-blue-500/30 shadow-sm border transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                        <Card key={course._id || course.id || index} className="bg-white border-slate-100 rounded-[32px] overflow-hidden hover:shadow-xl hover:shadow-slate-200/50 transition-all duration-500 border shadow-sm group relative flex flex-col">
                            {/* Status Indicator Bar */}
                            <div className={cn(
                                "h-1.5 w-full",
                                activeView === "pending" ? "bg-amber-400" : "bg-blue-500"
                            )} />

                            <CardContent className="p-8 space-y-8 relative z-10">
                                <div className="space-y-4">
                                    <div className="flex items-center justify-between">
                                        <div className="px-4 py-1.5 rounded-full bg-blue-50 border border-blue-100/50 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                            {course.code}
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-sm" />
                                            <span className="text-[9px] font-black text-slate-300 uppercase tracking-widest">Active</span>
                                        </div>
                                    </div>
                                    <div>
                                        <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{course.title || course.name}</h3>
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 flex items-center gap-2">
                                            <BookOpen className="w-3.5 h-3.5 text-blue-400" /> {course.subject} • Grade {course.grade}
                                        </p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-3">
                                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Enrollment</span>
                                        <p className="text-lg font-black text-slate-900">{course.studentCount || 0}</p>
                                    </div>
                                    <div className="p-4 rounded-2xl bg-slate-50/50 border border-slate-100 flex flex-col gap-1">
                                        <span className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Price Point</span>
                                        <p className="text-lg font-black text-blue-600">{course.price || 0} <span className="text-[10px] text-slate-400">ETB</span></p>
                                    </div>
                                </div>

                                {/* Yearly Roadmap Preview */}
                                <div className="mt-6 pt-6 border-t border-slate-50 space-y-4">
                                    <div className="flex items-center gap-2 mb-2">
                                        <Calendar className="w-4 h-4 text-blue-500" />
                                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Yearly Roadmap</span>
                                    </div>
                                    <div className="grid grid-cols-2 gap-3">
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                            <div className="text-[9px] font-black text-blue-600 uppercase mb-1">Semester 1</div>
                                            <div className="text-[11px] font-bold text-slate-700 truncate">{course.roadmap?.semester1?.chapters || "Chapters 1-3"}</div>
                                            <div className="text-[9px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Final: {course.roadmap?.semester1?.final || course.roadmap?.semester1?.finalDate || "Jan"}
                                            </div>
                                        </div>
                                        <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100/50">
                                            <div className="text-[9px] font-black text-indigo-600 uppercase mb-1">Semester 2</div>
                                            <div className="text-[11px] font-bold text-slate-700 truncate">{course.roadmap?.semester2?.chapters || "Chapters 4-6"}</div>
                                            <div className="text-[9px] font-medium text-slate-400 mt-1 flex items-center gap-1">
                                                <Clock className="w-3 h-3" />
                                                Final: {course.roadmap?.semester2?.final || course.roadmap?.semester2?.finalDate || "Jun"}
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                 <div className="flex flex-col gap-3 pt-4">
                                     {activeView === "pending" ? (
                                         <Button
                                             onClick={() => openReview(course)}
                                             className="w-full bg-slate-900 hover:bg-slate-800 text-white rounded-2xl font-black h-12 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-slate-900/10"
                                         >
                                             <Eye className="w-4 h-4" /> Review Framework
                                         </Button>
                                     ) : (
                                         <div className="flex gap-2">
                                              <Button
                                                  onClick={() => {
                                                      setSelectedCourseForModules(course)
                                                      setIsModuleManagerOpen(true)
                                                  }}
                                                  className="flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black h-12 text-[10px] uppercase tracking-widest transition-all"
                                              >
                                                  Manage Modules
                                              </Button>
                                              <Button
                                                  variant="outline"
                                                  onClick={() => openEdit(course)}
                                                  className="bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black h-12 w-12 border border-slate-200 text-[10px] uppercase tracking-widest transition-all p-0 flex items-center justify-center"
                                              >
                                                  <Edit3 className="w-4 h-4" />
                                              </Button>
                                             <Button
                                                 variant="ghost"
                                                 onClick={() => handleDelete(course._id || course.id)}
                                                 className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-400 rounded-2xl h-12 w-12 border border-rose-100/50 transition-all flex items-center justify-center"
                                             >
                                                 <Trash2 className="w-4 h-4" />
                                             </Button>
                                         </div>
                                     )}
                                 </div>
                                 
                                 {course.syllabusUrl && (
                                     <a 
                                         href={getFileUrl(course.syllabusUrl)} 
                                         target="_blank" 
                                         rel="noopener noreferrer"
                                         className="flex items-center justify-center gap-2 text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-700 transition-colors pt-2"
                                     >
                                         <Download className="w-3 h-3" /> View Submitted Syllabus
                                     </a>
                                 )}
                             </CardContent>
                         </Card>
                     ))
                 ) : (
                     <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                         <BookOpen className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                         <h3 className="text-2xl font-black text-slate-300">
                             {activeView === "pending" ? "No Pending Frameworks" : "No Curriculum Found"}
                         </h3>
                         <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.25em] mt-3 px-10 max-w-md mx-auto">
                             {activeView === "pending" 
                                ? "Tutors have not submitted any new course frameworks for review."
                                : "There are currently no course records matching your search query."}
                         </p>
                     </div>
                 )}
             </div>

            {/* Archive / Modify Course Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={(open) => {
                setIsCreateModalOpen(open)
                if (!open) setEditingCourse(null)
            }}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    <div className="p-10 bg-slate-50/50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-800 leading-none">
                                {editingCourse ? "Modify Course Path" : "Archive New Path"}
                            </DialogTitle>
                            <p className="text-slate-400 font-medium text-sm mt-2">
                                {editingCourse ? "Audit and update existing curriculum standards." : "Formalize a new subject into the institutional curriculum."}
                            </p>
                        </DialogHeader>
                    </div>
                    <form onSubmit={handleAction} className="p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Designation</Label>
                                <Input
                                    placeholder="e.g. Advanced Biology & Genetics"
                                    className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                    value={formState.name || formState.title}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                                    <select
                                        className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                        value={formState.grade}
                                        onChange={(e) => setFormState({ ...formState, grade: e.target.value })}
                                        required
                                    >
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Stream</Label>
                                    <select
                                        className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                        value={formState.stream}
                                        onChange={(e) => setFormState({ ...formState, stream: e.target.value })}
                                    >
                                        <option value="Common">Common</option>
                                        <option value="Natural Science">Natural Science</option>
                                        <option value="Social Science">Social Science</option>
                                    </select>
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Syllabus Overview</Label>
                                <textarea
                                    className="w-full bg-white border border-slate-200 min-h-[120px] rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold p-4 text-sm"
                                    placeholder="Describe the learning objectives and scope..."
                                    value={formState.description}
                                    onChange={(e) => setFormState({ ...formState, description: e.target.value })}
                                />
                            </div>
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Assigned Tutor</Label>
                                <select
                                    className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                    value={formState.tutor}
                                    onChange={(e) => setFormState({ ...formState, tutor: e.target.value })}
                                >
                                    <option value="">No Tutor Assigned</option>
                                    {tutors.map(t => (
                                        <option key={t._id} value={t._id}>{t.name} ({t.email})</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                            <div className="space-y-4">
                                <Label className="text-xs font-black uppercase tracking-widest text-blue-500 flex items-center gap-2">
                                    <Layers className="w-4 h-4" /> Yearly Academic Roadmap
                                </Label>
                                
                                <div className="grid grid-cols-2 gap-6">
                                    {/* Semester 1 */}
                                    <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-blue-600">Semester 1 Breakdown</p>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Chapters (e.g. 1-5)</Label>
                                                <Input 
                                                    className="h-10 rounded-xl bg-white border-blue-100 text-xs font-bold"
                                                    value={formState.roadmap.semester1.chapters}
                                                    onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester1: { ...formState.roadmap.semester1, chapters: e.target.value } } })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Mid-term</Label>
                                                    <Input type="date" className="h-10 rounded-xl bg-white border-blue-100 text-[10px]" 
                                                        value={formState.roadmap.semester1.midTerm}
                                                        onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester1: { ...formState.roadmap.semester1, midTerm: e.target.value } } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Final</Label>
                                                    <Input type="date" className="h-10 rounded-xl bg-white border-blue-100 text-[10px]" 
                                                        value={formState.roadmap.semester1.final}
                                                        onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester1: { ...formState.roadmap.semester1, final: e.target.value } } })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Semester 2 */}
                                    <div className="p-6 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-4">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-indigo-600">Semester 2 Breakdown</p>
                                        <div className="space-y-3">
                                            <div className="space-y-1">
                                                <Label className="text-[9px] font-bold text-slate-400 uppercase">Chapters (e.g. 6-10)</Label>
                                                <Input 
                                                    className="h-10 rounded-xl bg-white border-indigo-100 text-xs font-bold"
                                                    value={formState.roadmap.semester2.chapters}
                                                    onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester2: { ...formState.roadmap.semester2, chapters: e.target.value } } })}
                                                />
                                            </div>
                                            <div className="grid grid-cols-2 gap-2">
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Mid-term</Label>
                                                    <Input type="date" className="h-10 rounded-xl bg-white border-indigo-100 text-[10px]" 
                                                        value={formState.roadmap.semester2.midTerm}
                                                        onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester2: { ...formState.roadmap.semester2, midTerm: e.target.value } } })}
                                                    />
                                                </div>
                                                <div className="space-y-1">
                                                    <Label className="text-[9px] font-bold text-slate-400 uppercase">Final</Label>
                                                    <Input type="date" className="h-10 rounded-xl bg-white border-indigo-100 text-[10px]" 
                                                        value={formState.roadmap.semester2.final}
                                                        onChange={(e) => setFormState({ ...formState, roadmap: { ...formState.roadmap, semester2: { ...formState.roadmap.semester2, final: e.target.value } } })}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="w-full sm:flex-none sm:w-40 rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] text-slate-400 hover:bg-slate-50 transition-all"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                                >
                                    {editingCourse ? "Update Standards" : "Finalize Archive"}
                                </Button>
                            </div>
                    </form>
                </DialogContent>
            </Dialog>

            {/* Review Framework Modal [NEW] */}
            <Dialog open={isReviewModalOpen} onOpenChange={setIsReviewModalOpen}>
                <DialogContent className="sm:max-w-[700px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl flex flex-col max-h-[90vh]">
                    <div className="p-8 bg-slate-900 text-white flex-shrink-0">
                        <div className="flex items-center justify-between mb-4">
                            <Badge className="bg-blue-500 text-white border-none text-[9px] uppercase font-black px-3 py-1">Framework Audit</Badge>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Submitted: {selectedCourseForReview && new Date(selectedCourseForReview.createdAt).toLocaleDateString()}</span>
                        </div>
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black leading-tight">
                                {selectedCourseForReview?.title || selectedCourseForReview?.name}
                            </DialogTitle>
                            <div className="flex items-center gap-4 mt-4">
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                                    <User className="w-4 h-4 text-blue-400" />
                                    <span className="text-[11px] font-bold text-slate-300">{selectedCourseForReview?.tutor?.name || "Anonymous Tutor"}</span>
                                </div>
                                <div className="flex items-center gap-2 px-3 py-1.5 rounded-xl bg-white/10 border border-white/10">
                                    <GraduationCap className="w-4 h-4 text-emerald-400" />
                                    <span className="text-[11px] font-bold text-slate-300">Grade {selectedCourseForReview?.grade} • {selectedCourseForReview?.stream}</span>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-y-auto p-8 space-y-8">
                        {/* Summary & Price */}
                        <div className="grid grid-cols-2 gap-6">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Proposed Tuition Fee</Label>
                                <div className="flex items-end gap-2">
                                    <span className="text-3xl font-black text-slate-900">{selectedCourseForReview?.price || 0}</span>
                                    <span className="text-sm font-black text-slate-400 mb-1">ETB</span>
                                </div>
                                <div className="pt-2 flex gap-2">
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:text-blue-600"
                                        onClick={() => {
                                            appendFeedback("Please decrease the price by 10-20%")
                                            openRejectModal(selectedCourseForReview._id || selectedCourseForReview.id)
                                        }}
                                    >
                                        <TrendingDown className="w-3 h-3 mr-1" /> Decrease
                                    </Button>
                                    <Button 
                                        variant="outline" 
                                        size="sm" 
                                        className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:text-emerald-600"
                                        onClick={() => {
                                            appendFeedback("Price seems low for this content volume. Consider increasing it")
                                            openRejectModal(selectedCourseForReview._id || selectedCourseForReview.id)
                                        }}
                                    >
                                        <TrendingUp className="w-3 h-3 mr-1" /> Increase
                                    </Button>
                                </div>
                            </div>
                            <div className="p-6 rounded-3xl bg-blue-50/50 border border-blue-100 flex flex-col justify-center items-center text-center space-y-3">
                                <FileText className="w-8 h-8 text-blue-500" />
                                <div className="space-y-1">
                                    <p className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Syllabus Outline</p>
                                    <p className="text-[11px] font-bold text-slate-500 leading-tight">Detailed educational framework (PDF)</p>
                                </div>
                                {selectedCourseForReview?.syllabusUrl ? (
                                    <Button 
                                        asChild 
                                        className="w-full bg-white hover:bg-blue-600 hover:text-white text-blue-600 border border-blue-200 rounded-xl font-black text-[10px] uppercase h-10 tracking-widest transition-all"
                                    >
                                        <a href={getFileUrl(selectedCourseForReview.syllabusUrl)} target="_blank" rel="noopener noreferrer">
                                            <Download className="w-3 h-3 mr-2" /> Open Outline
                                        </a>
                                    </Button>
                                ) : (
                                    <span className="text-[10px] font-black text-slate-400 uppercase italic">No File Provided</span>
                                )}
                            </div>
                        </div>

                        {/* Roadmap Content */}
                        <div className="space-y-4">
                            <div className="flex items-center justify-between">
                                <Label className="text-xs font-black uppercase tracking-[0.2em] text-slate-900 flex items-center gap-2">
                                    <ListPlus className="w-4 h-4 text-blue-500" /> Curriculum Chapters
                                </Label>
                                <Button 
                                    variant="ghost" 
                                    size="sm" 
                                    className="h-8 rounded-lg text-[9px] font-black uppercase tracking-widest text-blue-600 hover:bg-blue-50"
                                    onClick={() => appendFeedback("The roadmap is too sparse. Please add more specific chapters or sub-topics")}
                                >
                                    Suggest Content Additions
                                </Button>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-[10px] font-black uppercase text-blue-600">Semester 1</span>
                                        <Badge className="bg-blue-50 text-blue-600 border-none text-[8px] font-black uppercase">{selectedCourseForReview?.roadmap?.semester1?.midTermDate || "TBD"} Mid-term</Badge>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed min-h-[60px]">
                                        {selectedCourseForReview?.roadmap?.semester1?.chapters || "No chapters listed for this semester."}
                                    </p>
                                </div>
                                <div className="p-6 rounded-3xl bg-white border border-slate-100 space-y-4">
                                    <div className="flex items-center justify-between border-b border-slate-50 pb-2">
                                        <span className="text-[10px] font-black uppercase text-indigo-600">Semester 2</span>
                                        <Badge className="bg-indigo-50 text-indigo-600 border-none text-[8px] font-black uppercase">{selectedCourseForReview?.roadmap?.semester2?.midTermDate || "TBD"} Mid-term</Badge>
                                    </div>
                                    <p className="text-xs font-bold text-slate-700 leading-relaxed min-h-[60px]">
                                        {selectedCourseForReview?.roadmap?.semester2?.chapters || "No chapters listed for this semester."}
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="p-8 border-t border-slate-100 flex gap-4 bg-slate-50/50 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => {
                                setIsReviewModalOpen(false)
                                openRejectModal(selectedCourseForReview._id || selectedCourseForReview.id)
                            }}
                            className="flex-1 rounded-2xl font-black h-14 text-[11px] uppercase tracking-widest border-slate-200 text-slate-600 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-100 transition-all"
                        >
                            Request Revisions
                        </Button>
                        <Button
                            onClick={() => {
                                setIsReviewModalOpen(false)
                                handleApprove(selectedCourseForReview._id || selectedCourseForReview.id)
                            }}
                            className="flex-[1.5] bg-emerald-500 hover:bg-emerald-600 text-white rounded-2xl font-black h-14 text-[11px] uppercase tracking-widest shadow-xl shadow-emerald-500/20 transition-all flex items-center justify-center gap-2"
                        >
                            <CheckCircle2 className="w-5 h-5" /> Authorize Framework
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Gemini AI Generation Modal */}
            <Dialog open={isAIModalOpen} onOpenChange={setIsAIModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    <div className="p-10 bg-indigo-600 text-white relative">
                        <div className="absolute top-0 right-0 p-8 opacity-10">
                            <Sparkles className="w-24 h-24" />
                        </div>
                        <DialogHeader>
                            <div className="flex items-center gap-3 mb-2">
                                <div className="p-2 bg-white/20 rounded-xl">
                                    <Zap className="w-5 h-5 text-white" />
                                </div>
                                <Badge className="bg-indigo-400/30 text-white border-none text-[9px] uppercase font-black">AI Powered</Badge>
                            </div>
                            <DialogTitle className="text-3xl font-black leading-none">
                                Gemini Curriculum <br/>Sync
                            </DialogTitle>
                            <p className="text-indigo-100 font-medium text-sm mt-4 leading-relaxed">
                                Automatically generate all official subjects, roadmaps, and chapter breakdowns based on the Ethiopian National Curriculum.
                            </p>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Grade</Label>
                                <select
                                    className="w-full bg-slate-50 border-0 h-14 rounded-2xl focus:ring-indigo-500/30 text-slate-800 font-bold px-4"
                                    value={targetGrade}
                                    onChange={(e) => setTargetGrade(e.target.value)}
                                >
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                            </div>
                            {(targetGrade === "11" || targetGrade === "12") && (
                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Stream</Label>
                                    <select
                                        className="w-full bg-slate-50 border-0 h-14 rounded-2xl focus:ring-indigo-500/30 text-slate-800 font-bold px-4"
                                        value={targetStream}
                                        onChange={(e) => setTargetStream(e.target.value)}
                                    >
                                        <option value="Natural Science">Natural Science</option>
                                        <option value="Social Science">Social Science</option>
                                    </select>
                                </div>
                            )}
                        </div>

                        <div className="bg-amber-50 p-6 rounded-3xl border border-amber-100 flex gap-4">
                            <div className="w-10 h-10 rounded-2xl bg-amber-100 text-amber-600 flex items-center justify-center flex-shrink-0">
                                <Clock className="w-5 h-5" />
                            </div>
                            <p className="text-xs font-bold text-amber-700 leading-relaxed">
                                This will automatically create all official subjects for this grade. Chapter breakdowns and exam milestones will be set based on national standards.
                            </p>
                        </div>

                        <Button
                            disabled={generatingCurriculum}
                            onClick={handleAIGenerate}
                            className="w-full bg-indigo-600 hover:bg-indigo-500 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[11px] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 border-0"
                        >
                            {generatingCurriculum ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                    <span>Syncing with Gemini...</span>
                                </div>
                            ) : (
                                "Generate Full Curriculum"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
            {/* Rejection Feedback Modal */}
            <Dialog open={isRejectModalOpen} onOpenChange={setIsRejectModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-[40px] p-10 border-0 shadow-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-2xl font-black text-slate-800">Review Suggestions</DialogTitle>
                        <p className="text-slate-400 font-medium text-sm mt-2"> Provide constructive feedback to the tutor on how to improve this course framework.</p>
                    </DialogHeader>
                    <div className="space-y-6 py-8">
                        <div className="flex flex-wrap gap-2">
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-blue-50 hover:text-blue-600 transition-all"
                                onClick={() => appendFeedback("Please decrease the price of the course")}
                            >
                                <TrendingDown className="w-3.5 h-3.5 mr-1.5" /> Decrease Price
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-emerald-50 hover:text-emerald-600 transition-all"
                                onClick={() => appendFeedback("The price seems low, please increase it")}
                            >
                                <TrendingUp className="w-3.5 h-3.5 mr-1.5" /> Increase Price
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-amber-50 hover:text-amber-600 transition-all"
                                onClick={() => appendFeedback("Please add more detailed content/chapters")}
                            >
                                <ListPlus className="w-3.5 h-3.5 mr-1.5" /> Add Contents
                            </Button>
                            <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-9 rounded-xl text-[9px] font-black uppercase tracking-widest border-slate-200 text-slate-500 hover:bg-rose-50 hover:text-rose-600 transition-all"
                                onClick={() => setRejectionFeedback("The framework is not up to our institutional standards. Please completely re-evaluate the roadmap and goals.")}
                            >
                                <Trash2 className="w-3.5 h-3.5 mr-1.5" /> Reject Totally
                            </Button>
                        </div>

                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Manager Recommendations</Label>
                            <textarea
                                className="w-full bg-slate-50 border border-slate-200 min-h-[120px] rounded-2xl focus:ring-rose-500/30 text-slate-800 font-bold p-4 text-sm"
                                placeholder="Details on required revisions..."
                                value={rejectionFeedback}
                                onChange={(e) => setRejectionFeedback(e.target.value)}
                            />
                        </div>
                    </div>
                    <DialogFooter className="gap-3">
                        <Button
                            variant="ghost"
                            onClick={() => setIsRejectModalOpen(false)}
                            className="flex-1 rounded-2xl font-black h-14 text-[11px] uppercase tracking-widest"
                        >
                            Cancel
                        </Button>
                        <Button
                            onClick={handleReject}
                            className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl font-black h-14 text-[11px] uppercase tracking-widest shadow-xl shadow-rose-500/20"
                        >
                            Confirm Rejection
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
            {/* Module Architect Dialog [SYNCED FROM TUTOR] */}
            <Dialog open={isModuleManagerOpen} onOpenChange={setIsModuleManagerOpen}>
                <DialogContent className="sm:max-w-[1100px] h-[85vh] rounded-[40px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-0.5 rounded-full bg-blue-50 text-blue-600 text-[8px] font-black uppercase tracking-widest border border-blue-100">Module Architect</span>
                                <Library className="w-3.5 h-3.5 text-blue-400" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic leading-none">Curriculum <span className="text-blue-600">Structure</span></DialogTitle>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-2">{selectedCourseForModules?.title || selectedCourseForModules?.name}</p>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex">
                        <div className="w-[380px] p-8 border-r border-slate-100 flex-shrink-0 bg-white">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Lesson Architect</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Construct your curriculum module</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Component Type</Label>
                                        <select 
                                            className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase px-4 outline-none cursor-pointer"
                                            value={lessonForm.type}
                                            onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as any })}
                                        >
                                            <option value="video">Lectures (Video Content)</option>
                                            <option value="ppt">Resources (Slides & Docs)</option>
                                            <option value="exercise">Practice (Interactive Exercise)</option>
                                            <option value="quiz">Assessment (Timed Quiz)</option>
                                            <option value="exam">Official Exam (Mid/Final)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Module Title</Label>
                                        <Input 
                                            placeholder="e.g. Intro to Quantum Mechanics"
                                            className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm focus:bg-white"
                                            value={lessonForm.title}
                                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="flex p-1.5 bg-slate-100 rounded-2xl border border-slate-200 shadow-inner">
                                            <button 
                                                onClick={() => setUploadType("url")}
                                                type="button"
                                                className={cn(
                                                    "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                                    uploadType === "url" ? "bg-white text-sky-600 shadow-md ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                <Youtube className="w-3.5 h-3.5" />
                                                YouTube Link
                                            </button>
                                            <button 
                                                onClick={() => setUploadType("file")}
                                                type="button"
                                                className={cn(
                                                    "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-[0.2em] transition-all flex items-center justify-center gap-2",
                                                    uploadType === "file" ? "bg-white text-sky-600 shadow-md ring-1 ring-slate-100" : "text-slate-400 hover:text-slate-600"
                                                )}
                                            >
                                                <FileUp className="w-3.5 h-3.5" />
                                                From My PC
                                            </button>
                                        </div>

                                        <div className="min-h-[120px] py-2">
                                            {uploadType === "url" ? (
                                                <div className="space-y-1.5 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center justify-between ml-1 mb-1">
                                                        <Label className="text-[9px] font-black uppercase text-slate-400">
                                                            {lessonForm.type === "video" ? "YouTube Video Resource" : 
                                                             lessonForm.type === "ppt" ? "Cloud Document / Slide" : 
                                                             "External Evaluation Link"}
                                                        </Label>
                                                        {lessonForm.type === "video" ? <Youtube className="w-3 h-3 text-rose-500" /> : 
                                                         lessonForm.type === "ppt" ? <FileType className="w-3 h-3 text-amber-500" /> : 
                                                         <Activity className="w-3 h-3 text-emerald-500" />}
                                                    </div>
                                                    <Input 
                                                        placeholder="Paste shared URL here..."
                                                        className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm focus:bg-white transition-all"
                                                        value={lessonForm.url}
                                                        onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                                                    />
                                                </div>
                                            ) : (
                                                <div className="space-y-2 animate-in fade-in slide-in-from-top-2 duration-300">
                                                    <div className="flex items-center justify-between ml-1 mb-1">
                                                        <Label className="text-[9px] font-black uppercase text-slate-400">Local PC Selection</Label>
                                                        <Badge className="bg-sky-50 text-sky-600 border-none text-[8px] font-black uppercase italic">Stored in Supabase Cloud</Badge>
                                                    </div>
                                                    <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-sky-400 hover:bg-sky-50/30 transition-all cursor-pointer bg-slate-50/50">
                                                        <Input 
                                                            type="file"
                                                            className="absolute inset-0 opacity-0 cursor-pointer z-10"
                                                            onChange={(e) => setVideoFile(e.target.files?.[0] || null)}
                                                        />
                                                        <div className="flex flex-col items-center gap-3 text-center">
                                                            <div className="w-12 h-12 rounded-xl bg-white shadow-sm flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors">
                                                                <FileUp className="w-6 h-6" />
                                                            </div>
                                                            <div>
                                                                <p className="text-[10px] font-black uppercase text-slate-900 leading-tight">
                                                                    {videoFile ? videoFile.name : "Select Desktop File"}
                                                                </p>
                                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest mt-1">Video, PDF, or PPTX</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(lessonForm.type === "quiz" || lessonForm.type === "exercise" || lessonForm.type === "exam") && (
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Timer</Label>
                                            <Input 
                                                placeholder="e.g. 45 min"
                                                className="h-12 rounded-2xl bg-blue-50/30 border-blue-100 font-black text-blue-700 text-xs text-center"
                                                value={lessonForm.duration}
                                                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <Button 
                                        onClick={handleAddLesson}
                                        disabled={isUploadingVideo}
                                        className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest mt-4"
                                    >
                                        {isUploadingVideo ? "Synchronizing..." : "Commit to Registry"}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        <div className="flex-1 p-8 bg-slate-50/30 overflow-y-auto">
                             <div className="space-y-4">
                                {isLessonsLoading ? (
                                    <div className="text-center py-20">
                                        <div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Compiling Modules...</p>
                                    </div>
                                ) : lessons.length === 0 ? (
                                    <div className="text-center py-20 bg-white rounded-3xl border-2 border-dashed border-slate-100">
                                        <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">No modules formalized yet.</p>
                                    </div>
                                ) : (
                                    lessons.map((lesson, i) => (
                                        <div key={i} className="p-5 rounded-2xl bg-white border border-slate-100 flex items-center justify-between shadow-sm">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-blue-50 flex items-center justify-center text-blue-600">
                                                    {lesson.type === 'video' ? <Youtube className="w-5 h-5" /> : <BookOpen className="w-5 h-5" />}
                                                </div>
                                                <div>
                                                    <p className="text-xs font-black text-slate-800 uppercase">{lesson.title}</p>
                                                    <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">{lesson.type} • {lesson.duration}</p>
                                                </div>
                                            </div>
                                        </div>
                                    ))
                                )}
                             </div>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
