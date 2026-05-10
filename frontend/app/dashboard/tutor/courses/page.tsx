"use client"

import { useState, useEffect } from "react"
import {
    BookOpen, Plus, Search, Filter,
    MoreVertical, Users, Clock, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    LayoutGrid, List, CheckCircle2, ChevronRight,
    PenTool, Trash2, Activity, Download, AlertCircle,
    BrainCircuit, Library, FileDown, Eye, Youtube,
    ExternalLink, FileUp, UploadCloud,
    FileText, Video as VideoIcon, FileType
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { uploadToSupabase } from "@/lib/supabase"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
import { getCurrentUser } from "@/lib/auth-utils"
import { Badge } from "@/components/ui/badge"
import { courseApi, paymentApi } from "@/lib/api"

export default function TeacherCourses() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false)
    const [selectedCourseForModules, setSelectedCourseForModules] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [isLessonsLoading, setIsLessonsLoading] = useState(false)
    const [lessonSearchQuery, setLessonSearchQuery] = useState("")
    const [lessonForm, setLessonForm] = useState({
        title: "",
        duration: "15 min",
        type: "youtube" as "youtube" | "video" | "exercise" | "quiz" | "ppt" | "exam",
        url: "",
        content: ""
    })
    const [videoFile, setVideoFile] = useState<File | null>(null)
    const [isUploadingVideo, setIsUploadingVideo] = useState(false)
    const [isEditingLesson, setIsEditingLesson] = useState(false)
    const [editingLessonId, setEditingLessonId] = useState<string | null>(null)

    useEffect(() => {
        if (selectedCourseForModules && isModuleManagerOpen) {
            loadCourseLessons()
        }
    }, [selectedCourseForModules, isModuleManagerOpen])

    const loadCourseLessons = async () => {
        try {
            setIsLessonsLoading(true)
            const [courseRes, contentRes] = await Promise.all([
                courseApi.getById(selectedCourseForModules._id),
                courseApi.getContent(selectedCourseForModules._id)
            ])
            
            const courseData = courseRes.data || courseRes
            const legacyLessons = courseData.lessons || []
            const unifiedContent = contentRes.data || []
            
            // Merge legacy lessons with new unified content
            // Using a Map to avoid duplicates by title
            const lessonsMap = new Map()
            legacyLessons.forEach((l: any) => lessonsMap.set(l.title, { ...l, source: 'legacy' }))
            unifiedContent.forEach((c: any) => {
                lessonsMap.set(c.title, {
                    ...c,
                    _id: c._id,
                    type: c.category.toLowerCase(),
                    videoUrl: c.contentId?.url || c.contentId?.videoId,
                    pptUrl: c.contentId?.url,
                    exerciseUrl: c.contentId?.url,
                    source: 'unified'
                })
            })
            
            setLessons(Array.from(lessonsMap.values()))
        } catch (error: any) {
            toast({ title: "Failed to load lessons", description: error.message, variant: "destructive" })
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
            const { uploadToSupabase } = await import("@/lib/supabase")
            let contentUrl = lessonForm.url
            let additionalData: any = {}

            if (lessonForm.type !== "youtube" && videoFile) {
                // Validation for new uploads only
                const maxSize = lessonForm.type === "video" ? 500 * 1024 * 1024 : 50 * 1024 * 1024
                if (videoFile.size > maxSize) {
                    toast({ 
                        title: "File Too Large", 
                        description: `Please keep ${lessonForm.type} files under ${maxSize / (1024 * 1024)}MB.`, 
                        variant: "destructive" 
                    })
                    setIsUploadingVideo(false)
                    return
                }

                try {
                    contentUrl = await uploadToSupabase(videoFile, 'course-contents')
                    toast({ title: "File Uploaded", description: "Metadata being synchronized with database..." })
                } catch (error: any) {
                    toast({ title: "Upload Failed", description: error.message, variant: "destructive" })
                    setIsUploadingVideo(false)
                    return
                }
            } else if (lessonForm.type === "youtube") {
                const videoIdMatch = lessonForm.url.match(/(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|embed\/|shorts\/))([a-zA-Z0-9_-]{11})/)
                if (!videoIdMatch) {
                    toast({ title: "Invalid URL", description: "Please enter a valid YouTube URL.", variant: "destructive" })
                    setIsUploadingVideo(false)
                    return
                }
                contentUrl = lessonForm.url
                additionalData.videoId = videoIdMatch[1]
            }

            // Map frontend types to backend categories
            const categoryMap: any = {
                "video": "Video",
                "youtube": "YouTube",
                "ppt": "PDF",
                "pdf": "PDF",
                "quiz": "Quiz",
                "exercise": "Exercise",
                "exam": "Quiz"
            }

            const payload: any = {
                category: categoryMap[lessonForm.type] || "Video",
                title: lessonForm.title,
                description: lessonForm.content || "",
                url: contentUrl,
                ...additionalData
            }

            if (lessonForm.type === "quiz" || lessonForm.type === "exam") {
                try {
                    payload.questions = lessonForm.content ? JSON.parse(lessonForm.content) : []
                    payload.timeLimit = parseInt(lessonForm.duration) || 15
                } catch (e) {
                    toast({ title: "Invalid Quiz Data", description: "Please ensure quiz content is valid JSON.", variant: "destructive" })
                    setIsUploadingVideo(false)
                    return
                }
            }

            if (videoFile) {
                payload.size = videoFile.size
                payload.format = videoFile.name.split('.').pop()
            }

            if (isEditingLesson && editingLessonId) {
                await courseApi.updateContent(editingLessonId, payload)
                toast({ title: "Lesson Updated", description: "Changes saved successfully." })
            } else {
                await courseApi.addContent(selectedCourseForModules._id, payload)
                toast({ title: "Curriculum Updated", description: `${payload.category} content is now live.` })
            }
            
            // Reset form
            setLessonForm({ title: "", duration: "15 min", type: "youtube", url: "", content: "" })
            setVideoFile(null)
            setIsEditingLesson(false)
            setEditingLessonId(null)
            loadCourseLessons()
        } catch (error: any) {
            toast({ title: "Operation Failed", description: error.message, variant: "destructive" })
        } finally {
            setIsUploadingVideo(true) // Re-enable button after processing
            setIsUploadingVideo(false)
        }
    }

    const [isAuditOpen, setIsAuditOpen] = useState(false)
    const [selectedCourseForAudit, setSelectedCourseForAudit] = useState<any>(null)
    const [auditData, setAuditData] = useState<any[]>([])
    const [isAuditLoading, setIsAuditLoading] = useState(false)

    const loadAudit = async (courseId: string) => {
        try {
            setIsAuditLoading(true)
            const res = await paymentApi.getAudit(courseId)
            setAuditData(res.data || [])
        } catch (error: any) {
            toast({ title: "Failed to load audit", description: error.message, variant: "destructive" })
        } finally {
            setIsAuditLoading(false)
        }
    }

    const [courses, setCourses] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [selectedGrade, setSelectedGrade] = useState("All Courses")
    const [searchQuery, setSearchQuery] = useState("")
    const { toast } = useToast()
    const currentUser = getCurrentUser()
    const isApproved = currentUser?.role === 'manager' || currentUser?.role === 'admin' || currentUser?.tutorStatus === 'approved'

    useEffect(() => {
        loadCourses()
    }, [])

    const loadCourses = async () => {
        try {
            setLoading(true)
            const res = await courseApi.getMyCourses()
            setCourses(res.data || [])
        } catch (error: any) {
            toast({ title: "Failed to load courses", description: error.message, variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    // Form state for new course
    const [newCourse, setNewCourse] = useState({
        name: "",
        grade: "9",
        semester: "1",
        isPremium: false,
        price: 0
    })
    const [editingCourseId, setEditingCourseId] = useState<string | null>(null)

    const [syllabusFile, setSyllabusFile] = useState<File | null>(null)

    const [isSubmitting, setIsSubmitting] = useState(false)

    const handleCreateCourse = async () => {
        console.log("[TutorCourses] Attempting to create/update course:", newCourse);
        if (!newCourse.name) {
            toast({ title: "Title Required", description: "Please provide a course title.", variant: "destructive" })
            return
        }

        try {
            setIsSubmitting(true)
            const formData = new FormData()
            formData.append("title", newCourse.name)
            formData.append("grade", newCourse.grade)
            formData.append("semester", newCourse.semester)
            formData.append("isPremium", String(newCourse.isPremium))
            formData.append("price", String(newCourse.price))
            formData.append("category", "General")
            if (syllabusFile) {
                formData.append("syllabus", syllabusFile)
            }

            if (editingCourseId) {
                await courseApi.update(editingCourseId, formData)
                toast({
                    title: "Framework Updated",
                    description: `Successfully updated ${newCourse.name}. Sent back for review.`,
                })
            } else {
                await courseApi.create(formData)
                toast({
                    title: "Course Framework Submitted",
                    description: `Successfully initialized ${newCourse.name}. Sent to manager for approval.`,
                })
            }

            setIsCreateModalOpen(false)
            setEditingCourseId(null)
            setNewCourse({ name: "", grade: "9", semester: "1", isPremium: false, price: 0 })
            setSyllabusFile(null)
            loadCourses()
        } catch (error: any) {
            toast({
                title: "Operation Failed",
                description: error.message,
                variant: "destructive"
            })
        } finally {
            setIsSubmitting(false)
        }
    }

    const openEditModal = (course: any) => {
        setEditingCourseId(course._id || course.id)
        setNewCourse({
            name: course.title || course.name,
            grade: String(course.grade),
            semester: String(course.semester),
            isPremium: course.isPremium || false,
            price: course.price || 0
        })
        setIsCreateModalOpen(true)
    }

    const filteredCourses = courses.filter(course => {
        const matchesSearch = (course.title || "").toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGrade = selectedGrade === "All Courses" || `Grade ${course.grade}` === selectedGrade
        return matchesSearch && matchesGrade
    })

    return (
        <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 bg-white min-h-screen p-8 pb-32 pt-4">

            {/* Status Warning for Pending Tutors */}
            {!isApproved && (
                <div className="bg-slate-50 border border-slate-100 rounded-[32px] p-10 flex items-start gap-8 shadow-sm">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-slate-400 border border-slate-100 shrink-0">
                        <AlertCircle className="w-6 h-6" />
                    </div>
                    <div className="space-y-4">
                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.2em]">Institutional Review</h4>
                        <p className="text-sm text-slate-500 font-medium leading-relaxed max-w-2xl">
                            Welcome, <span className="text-slate-900 font-bold">{currentUser?.name}</span>. Your tutor application is currently being verified. 
                            Course creation and live sessions will be enabled once your credentials are confirmed.
                        </p>
                        <div className="flex items-center gap-4 pt-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Current Status: Pending Approval</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-12 px-2">
                <div className="space-y-6">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Curriculum Management</span>
                        </div>
                        <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                            Academic <span className="font-semibold text-slate-900">Curriculum</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium max-w-md leading-relaxed">
                            Orchestrate your pedagogical modules and audit student performance across Grade 9-12 tracks.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-slate-900 transition-colors" />
                            <Input 
                                placeholder="Search courses..." 
                                className="h-14 pl-12 pr-6 w-[320px] rounded-2xl bg-slate-50 border-transparent font-medium text-sm focus:bg-white focus:border-slate-100 transition-all shadow-sm"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-200 hover:bg-sky-600 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Create Framework
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-[40px] border-slate-100 bg-white p-0 overflow-hidden flex flex-col shadow-2xl">
                                <div className="p-10 border-b border-slate-50 flex-shrink-0">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-semibold tracking-tight text-slate-900">
                                            {editingCourseId ? "Modify Framework" : "New Course Framework"}
                                        </DialogTitle>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">National Standards V2.0</p>
                                    </DialogHeader>
                                </div>
                                <div className="p-10 pt-6 space-y-10 flex-1 overflow-y-auto">
                                    <div className="space-y-4">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Course Nomenclature</Label>
                                        <Input
                                            placeholder="e.g. Advanced Calculus & Limits"
                                            className="h-14 rounded-2xl bg-slate-50 border-transparent font-medium text-sm px-6"
                                            value={newCourse.name}
                                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                                            <select 
                                                className="w-full h-12 rounded-2xl bg-slate-50 border-transparent font-black text-[10px] uppercase px-4 outline-none transition-all"
                                                value={newCourse.grade}
                                                onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                                            >
                                                <option value="9">Grade 9</option>
                                                <option value="10">Grade 10</option>
                                                <option value="11">Grade 11</option>
                                                <option value="12">Grade 12</option>
                                            </select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Term</Label>
                                            <select 
                                                className="w-full h-12 rounded-2xl bg-slate-50 border-transparent font-black text-[10px] uppercase px-4 outline-none transition-all"
                                                value={newCourse.semester}
                                                onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                                            >
                                                <option value="1">Semester 1</option>
                                                <option value="2">Semester 2</option>
                                                <option value="Full Year">Full Year</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                        <div className="space-y-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-900">Premium Tier</Label>
                                            <p className="text-[9px] text-slate-400 font-medium uppercase">Enable payment verification</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            className="w-5 h-5 rounded-lg border-slate-200 text-slate-900 focus:ring-0"
                                            checked={newCourse.isPremium}
                                            onChange={(e) => setNewCourse({ ...newCourse, isPremium: e.target.checked })}
                                        />
                                    </div>

                                    {newCourse.isPremium && (
                                        <div className="space-y-4 animate-in fade-in slide-in-from-top-1">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Course Price (ETB)</Label>
                                            <Input
                                                type="number"
                                                placeholder="500"
                                                className="h-14 rounded-2xl bg-slate-50 border-transparent font-medium text-sm px-6"
                                                value={newCourse.price}
                                                onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    )}
                                </div>
                                <div className="p-10 pt-4 flex-shrink-0">
                                    <Button 
                                        disabled={isSubmitting}
                                        onClick={handleCreateCourse} 
                                        className="w-full h-14 rounded-2xl bg-slate-900 hover:bg-sky-600 text-white font-bold uppercase tracking-widest text-[10px] shadow-xl shadow-slate-200 disabled:opacity-50 transition-all"
                                    >
                                        {isSubmitting ? "Finalizing Framework..." : editingCourseId ? "Update Framework" : "Initialize Course"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex items-center gap-6">
                    <div className="bg-slate-50 p-1.5 rounded-[22px] border border-slate-100 shadow-sm flex items-center">
                        {["All Courses", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={cn(
                                    "px-5 py-2 rounded-xl text-[9px] font-black uppercase tracking-widest transition-all",
                                    selectedGrade === grade ? "bg-white text-slate-900 shadow-sm" : "text-slate-400 hover:text-slate-600"
                                )}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                </div>
            </div>

            {loading ? (
                <div className="text-center py-20">
                    <div className="w-12 h-12 border-4 border-sky-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading courses...</p>
                </div>
            ) : filteredCourses.length === 0 ? (
                <div className="text-center py-20 bg-white rounded-[48px] border border-dashed border-slate-200">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No courses found</p>
                </div>
            ) : (
                <div className={cn(
                    "grid gap-8",
                    viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
                )}>
                    {filteredCourses.map(course => (
                        <div
                            key={course._id || course.id}
                            className={cn(
                                "group bg-white rounded-[48px] border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden flex flex-col",
                                viewMode === "list" ? "p-6 lg:p-10 lg:flex-row items-center gap-8" : "p-10"
                            )}
                        >
                            {/* Header: Status Badges (Inline) */}
                            <div className="flex items-center justify-between mb-6">
                                <div className="flex flex-wrap gap-2">
                                    <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-500 text-[8px] font-black uppercase tracking-widest border border-sky-100">Grade {course.grade}</span>
                                    {course.status === "pending" && (
                                        <span className="px-3 py-1 rounded-xl bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100 flex items-center gap-1.5 shadow-sm">
                                            <Clock className="w-3 h-3" /> Reviewing
                                        </span>
                                    )}
                                    {course.status === "approved" && (
                                        <span className="px-3 py-1 rounded-xl bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-widest border border-emerald-100 flex items-center gap-1.5 shadow-sm">
                                            <CheckCircle2 className="w-3 h-3" /> Approved
                                        </span>
                                    )}
                                    {course.status === "rejected" && (
                                        <span className="px-3 py-1 rounded-xl bg-rose-50 text-rose-600 text-[8px] font-black uppercase tracking-widest border border-rose-100 flex items-center gap-1.5 shadow-sm">
                                            <Activity className="w-3 h-3" /> Rejected
                                        </span>
                                    )}
                                </div>
                            </div>

                            <div className={cn("space-y-6 relative z-10 w-full", viewMode === "list" && "flex-1")}>
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm flex-shrink-0">
                                        <BookOpen className="w-8 h-8" />
                                    </div>
                                    <div className="min-w-0">
                                        <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic group-hover:text-sky-600 transition-colors line-clamp-2">{course.title || course.name}</h3>
                                        <div className="flex items-center gap-3 mt-1.5">
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                                <Users className="w-3.5 h-3.5" /> {course.students?.length || 0}
                                            </p>
                                            <span className="w-1 h-1 rounded-full bg-slate-200" />
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Sem {course.semester}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Manager Feedback for Rejected Courses */}
                                {course.status === "rejected" && course.managerFeedback && (
                                    <div className="p-5 rounded-3xl bg-rose-50/50 border border-rose-100/50 animate-in fade-in slide-in-from-top-2">
                                        <p className="text-[9px] font-black text-rose-600 uppercase tracking-widest mb-1.5 flex items-center gap-2">
                                            <PenTool className="w-3.5 h-3.5" /> Manager Feedback
                                        </p>
                                        <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{course.managerFeedback}"</p>
                                    </div>
                                )}

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                    {course.status === "rejected" ? (
                                        <Button
                                            onClick={() => openEditModal(course)}
                                            className="w-full bg-rose-600 hover:bg-rose-700 text-white rounded-2xl font-black h-12 text-[10px] uppercase tracking-widest flex items-center justify-center gap-2 transition-all shadow-lg shadow-rose-500/20"
                                        >
                                            <PenTool className="w-4 h-4" /> Modify Framework
                                        </Button>
                                    ) : (
                                        <>
                                            <Button
                                                onClick={() => {
                                                    setSelectedCourseForModules(course)
                                                    setIsModuleManagerOpen(true)
                                                }}
                                                className="flex-1 h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-sky-500/20"
                                            >
                                                Manage Content
                                            </Button>
                                            <Button
                                                onClick={() => {
                                                    setSelectedCourseForAudit(course)
                                                    setIsAuditOpen(true)
                                                    loadAudit(course._id)
                                                }}
                                                variant="outline"
                                                className="h-12 w-12 rounded-2xl p-0 border-slate-200 text-slate-400 hover:text-emerald-600 hover:border-emerald-100 transition-all flex items-center justify-center shrink-0"
                                            >
                                                <Activity className="w-4 h-4" />
                                            </Button>
                                            <Button
                                                variant="outline"
                                                onClick={() => openEditModal(course)}
                                                className="h-12 w-12 rounded-2xl p-0 border-slate-200 text-slate-400 hover:text-sky-600 hover:border-sky-100 transition-all flex items-center justify-center shrink-0"
                                            >
                                                <PenTool className="w-4 h-4" />
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Background Decoration */}
                            <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                        </div>
                    ))}
                </div>
            )}

            <div className="h-20" /> {/* Spacer */}

            {/* Curriculum Module Manager */}
            <Dialog open={isModuleManagerOpen} onOpenChange={setIsModuleManagerOpen}>
                <DialogContent className="sm:max-w-[1100px] h-[85vh] rounded-[40px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl flex flex-col">
                    <div className="p-8 border-b border-slate-50 flex items-center justify-between bg-white/50 backdrop-blur-xl sticky top-0 z-10">
                        <div>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[8px] font-black uppercase tracking-widest border border-sky-100">Module Architect</span>
                                <Library className="w-3.5 h-3.5 text-sky-400" />
                            </div>
                            <DialogTitle className="text-2xl font-black text-slate-900 uppercase italic leading-none">Curriculum <span className="text-sky-600">Structure</span></DialogTitle>
                            <p className="text-slate-400 font-bold text-[9px] uppercase tracking-widest mt-2">{selectedCourseForModules?.title}</p>
                        </div>
                        <div className="flex items-center gap-4">
                             <div className="text-right">
                                <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mb-0.5">Assigned Grade</p>
                                <p className="text-xs font-black text-slate-900 uppercase italic">Grade {selectedCourseForModules?.grade}</p>
                             </div>
                             <div className="w-10 h-10 rounded-xl bg-slate-50 flex items-center justify-center">
                                <GraduationCap className="w-5 h-5 text-slate-400" />
                             </div>
                        </div>
                    </div>

                    <div className="flex-1 overflow-hidden flex">
                        {/* Left: Component Creation */}
                        <div className="w-[380px] p-8 border-r border-slate-100 flex-shrink-0 bg-white overflow-y-auto custom-scrollbar">
                            <div className="space-y-8">
                                <div>
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-widest mb-1">Lesson Architect</h4>
                                    <p className="text-[9px] text-slate-400 font-bold uppercase tracking-tight">Construct your curriculum module</p>
                                </div>

                                <div className="space-y-5">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Curriculum Component Type</Label>
                                        <select 
                                            className="w-full h-12 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase px-4 focus:ring-2 focus:ring-sky-500/20 outline-none transition-all cursor-pointer"
                                            value={lessonForm.type}
                                            onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as any })}
                                        >
                                            <option value="youtube">YouTube Link</option>
                                            <option value="video">Lectures (Recorded MP4)</option>
                                            <option value="ppt">Documents (PDF/PPT)</option>
                                            <option value="pdf">Worksheets (PDF Only)</option>
                                            <option value="exercise">Practice (Interactive)</option>
                                            <option value="quiz">Assessment (Quiz JSON)</option>
                                        </select>
                                    </div>

                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Component Title</Label>
                                        <Input 
                                            placeholder="e.g. Molecular Bonds: Deep Dive"
                                            className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm focus:bg-white transition-all"
                                            value={lessonForm.title}
                                            onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                        />
                                    </div>

                                    <div className="space-y-4 pt-2">
                                        <div className="min-h-[120px] py-2">
                                            {lessonForm.type === "youtube" ? (
                                                <div className="space-y-1.5 transition-all duration-300">
                                                    <div className="flex items-center justify-between ml-1 mb-1">
                                                        <Label className="text-[9px] font-black uppercase text-slate-400">
                                                            YouTube Video URL
                                                        </Label>
                                                        <Youtube className="w-3 h-3 text-rose-500" />
                                                    </div>
                                                    <Input 
                                                        placeholder="https://youtube.com/watch?v=..."
                                                        className="h-12 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm focus:bg-white focus:ring-2 focus:ring-sky-500/10 transition-all"
                                                        value={lessonForm.url}
                                                        onChange={(e) => setLessonForm({ ...lessonForm, url: e.target.value })}
                                                    />
                                                    <p className="text-[8px] text-slate-400 font-bold uppercase tracking-widest ml-1 mt-1">This link will be saved to the database.</p>
                                                </div>
                                            ) : (
                                                <div className="space-y-2 transition-all duration-300">
                                                    <div className="flex items-center justify-between ml-1 mb-1">
                                                        <Label className="text-[9px] font-black uppercase text-slate-400">Local PC Selection</Label>
                                                        <Badge className="bg-sky-50 text-sky-600 border-none text-[8px] font-black uppercase italic">Stored in Supabase Cloud</Badge>
                                                    </div>
                                                    <div className="group relative border-2 border-dashed border-slate-200 rounded-2xl p-8 hover:border-sky-400 hover:bg-sky-50/30 transition-all cursor-pointer bg-slate-50/50">
                                                        <input 
                                                            type="file"
                                                            accept=".mp4,.mov,.webm,.pdf,.pptx"
                                                            className="absolute inset-0 w-full h-full opacity-0 cursor-pointer z-10"
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
                                                    {videoFile && (
                                                        <div className="flex items-center gap-2 text-emerald-600 ml-1 animate-pulse">
                                                            <CheckCircle2 className="w-3 h-3" />
                                                            <span className="text-[9px] font-black uppercase">File Ready for Supabase</span>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    {(lessonForm.type === "quiz" || lessonForm.type === "exercise" || lessonForm.type === "exam") && (
                                        <div className="space-y-1.5 animate-in zoom-in-95 duration-300">
                                            <div className="flex items-center justify-between ml-1 mb-1">
                                                <Label className="text-[9px] font-black uppercase text-slate-400">Completion Timer</Label>
                                                <Clock className="w-3 h-3 text-sky-400" />
                                            </div>
                                            <Input 
                                                placeholder="e.g. 45 min"
                                                className="h-12 rounded-2xl bg-sky-50/30 border-sky-100 font-black text-sky-700 text-xs text-center"
                                                value={lessonForm.duration}
                                                onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                            />
                                        </div>
                                    )}

                                    <Button 
                                        onClick={handleAddLesson}
                                        disabled={isUploadingVideo}
                                        className={cn(
                                            "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-[0.2em] shadow-xl transition-all hover:scale-[1.02] active:scale-95 disabled:opacity-50 mt-4",
                                            isEditingLesson ? "bg-sky-600 hover:bg-sky-700 shadow-sky-500/20" : "bg-slate-900 hover:bg-sky-600 shadow-slate-200"
                                        )}
                                    >
                                        {isUploadingVideo ? (
                                            <div className="flex items-center gap-3">
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Processing...
                                            </div>
                                        ) : (
                                            <div className="flex items-center gap-2">
                                                {isEditingLesson ? <CheckCircle2 className="w-3.5 h-3.5" /> : <Plus className="w-3.5 h-3.5" />}
                                                {isEditingLesson ? "Update Module" : "Append to Curriculum"}
                                            </div>
                                        )}
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Right: Lessons List */}
                        <div className="flex-1 p-8 space-y-6 overflow-y-auto bg-slate-50/30">
                            <div className="flex items-center justify-between">
                                <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Active Lessons ({lessons.length})</h4>
                                <div className="flex items-center gap-2">
                                    <Button 
                                        size="sm"
                                        disabled={isLessonsLoading}
                                        onClick={async () => {
                                            try {
                                                setIsLessonsLoading(true)
                                                const res = await courseApi.autoGenerateLessons(selectedCourseForModules._id)
                                                setLessons(res.data.lessons)
                                                toast({ title: "AI Generation Success", description: "Curriculum has been auto-populated with specialized videos." })
                                            } catch (error: any) {
                                                toast({ title: "AI Generation Failed", description: error.message, variant: "destructive" })
                                            } finally {
                                                setIsLessonsLoading(false)
                                            }
                                        }}
                                        className="h-8 px-4 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100 border border-sky-100 font-black text-[8px] uppercase tracking-widest flex items-center gap-2"
                                    >
                                        {isLessonsLoading ? <div className="w-3 h-3 border-2 border-sky-600 border-t-transparent rounded-full animate-spin" /> : <BrainCircuit className="w-3 h-3" />}
                                        AI Auto-Populate
                                    </Button>
                                    {isLessonsLoading && <div className="w-4 h-4 border-2 border-sky-500 border-t-transparent rounded-full animate-spin" />}
                                </div>
                            </div>

                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-slate-400" />
                                <Input 
                                    placeholder="Search active lessons..."
                                    value={lessonSearchQuery}
                                    onChange={(e) => setLessonSearchQuery(e.target.value)}
                                    className="h-9 pl-9 rounded-xl bg-white border-slate-100 font-bold text-[9px] uppercase tracking-widest focus:border-sky-200 transition-all"
                                />
                            </div>

                            <div className="space-y-3">
                                {lessons.filter(l => l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())).length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No matching lessons found</p>
                                    </div>
                                ) : (
                                    lessons.filter(l => l.title.toLowerCase().includes(lessonSearchQuery.toLowerCase())).map((lesson, i) => (
                                        <div key={i} className="group p-4 rounded-2xl bg-white border border-slate-100 hover:border-sky-100 transition-all flex items-center justify-between">
                                            <div className="flex items-center gap-4 min-w-0">
                                                <div className="w-8 h-8 rounded-lg bg-slate-50 flex items-center justify-center font-black text-slate-400 text-[10px] border border-slate-100 group-hover:bg-sky-50 group-hover:text-sky-600 group-hover:border-sky-100 transition-all">
                                                    {i + 1}
                                                </div>
                                                <div className="min-w-0">
                                                    <h5 className="font-black text-slate-900 text-[11px] uppercase truncate">{lesson.title}</h5>
                                                    <div className="flex items-center gap-3 mt-0.5">
                                                        <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                                            <Clock className="w-2.5 h-2.5" /> {lesson.duration}
                                                        </p>
                                                        {lesson.videoUrl && (
                                                            <p className="text-[8px] font-bold text-rose-400 uppercase tracking-widest flex items-center gap-1">
                                                                <Video className="w-2.5 h-2.5" /> Video
                                                            </p>
                                                        )}
                                                        {lesson.pptUrl && (
                                                            <p className="text-[8px] font-bold text-amber-400 uppercase tracking-widest flex items-center gap-1">
                                                                <Download className="w-2.5 h-2.5" /> PPT
                                                            </p>
                                                        )}
                                                        {lesson.type === 'exercise' && (
                                                            <p className="text-[8px] font-bold text-emerald-400 uppercase tracking-widest flex items-center gap-1">
                                                                <PenTool className="w-2.5 h-2.5" /> Exercise
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 rounded-lg p-0 text-slate-300 hover:text-sky-500"
                                                    onClick={() => {
                                                        setIsEditingLesson(true);
                                                        setEditingLessonId(lesson._id);
                                                        setLessonForm({
                                                            title: lesson.title,
                                                            duration: lesson.duration || "15 min",
                                                            type: lesson.type || (lesson.videoUrl?.includes('youtube') ? 'youtube' : 'video'),
                                                            url: lesson.videoUrl || lesson.url || "",
                                                            content: lesson.description || ""
                                                        });
                                                        // Scroll to form
                                                        document.querySelector('.lesson-form-container')?.scrollIntoView({ behavior: 'smooth' });
                                                    }}
                                                >
                                                    <PenTool className="w-3.5 h-3.5" />
                                                </Button>
                                                <Button 
                                                    variant="ghost" 
                                                    size="sm" 
                                                    className="h-8 w-8 rounded-lg p-0 text-slate-300 hover:text-rose-500"
                                                    onClick={async () => {
                                                        if (!confirm("Are you sure you want to delete this content?")) return;
                                                        try {
                                                            if (lesson.source === 'unified') {
                                                                await courseApi.deleteContent(lesson._id);
                                                            } else {
                                                                const updatedLegacyLessons = lessons
                                                                    .filter(l => l.source === 'legacy' && l.title !== lesson.title)
                                                                    .map(l => ({
                                                                        title: l.title,
                                                                        duration: l.duration,
                                                                        type: l.type,
                                                                        videoUrl: l.videoUrl,
                                                                        pptUrl: l.pptUrl,
                                                                        exerciseUrl: l.exerciseUrl,
                                                                        content: l.content,
                                                                        completed: l.completed
                                                                    }));
                                                                await courseApi.update(selectedCourseForModules._id, { lessons: updatedLegacyLessons });
                                                            }
                                                            toast({ title: "Deleted", description: "Content removed successfully." });
                                                            loadCourseLessons();
                                                        } catch (error: any) {
                                                            toast({ title: "Delete Failed", description: error.message, variant: "destructive" });
                                                        }
                                                    }}
                                                >
                                                    <Trash2 className="w-3.5 h-3.5" />
                                                </Button>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    </div>

                    <div className="p-8 bg-slate-50 border-t border-slate-100 flex justify-end gap-3 flex-shrink-0">
                        <Button
                            variant="outline"
                            onClick={() => setIsModuleManagerOpen(false)}
                            className="h-12 px-8 rounded-xl border-slate-200 text-slate-600 font-black uppercase tracking-widest text-[9px]"
                        >
                            Close Manager
                        </Button>
                        <Button
                            onClick={() => setIsModuleManagerOpen(false)}
                            className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-black uppercase tracking-widest text-[9px] shadow-xl"
                        >
                            Save Changes
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Revenue Audit Dialog */}
            <Dialog open={isAuditOpen} onOpenChange={setIsAuditOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[48px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl">
                    <div className="p-10 bg-emerald-50 border-b border-emerald-100 flex items-center justify-between">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-emerald-100 text-emerald-700 text-[8px] font-black uppercase tracking-widest border border-emerald-200">Financial Audit</span>
                                <Activity className="w-4 h-4 text-emerald-500" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic leading-none">Revenue <span className="text-emerald-600">Audit</span></DialogTitle>
                            <p className="text-slate-500 font-bold text-[10px] uppercase tracking-widest mt-2">{selectedCourseForAudit?.title}</p>
                        </DialogHeader>
                        <div className="text-right">
                            <p className="text-[10px] font-black text-emerald-700 uppercase tracking-widest mb-1">Total Earnings</p>
                            <p className="text-3xl font-black text-slate-900 italic">
                                {auditData.reduce((acc, curr) => acc + (curr.amount || 0), 0).toLocaleString()} <span className="text-sm font-black text-slate-400 uppercase not-italic">ETB</span>
                            </p>
                        </div>
                    </div>

                    <div className="p-10 space-y-6 max-h-[450px] overflow-y-auto bg-white">
                        <div className="grid grid-cols-2 gap-4 mb-8">
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Enrollments</p>
                                <p className="text-2xl font-black text-slate-900">{auditData.length}</p>
                            </div>
                            <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100">
                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Conversion Rate</p>
                                <p className="text-2xl font-black text-slate-900">100%</p>
                            </div>
                        </div>

                        <div className="space-y-4">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2">Payment History</h4>
                            {isAuditLoading ? (
                                <div className="text-center py-10">
                                    <div className="w-8 h-8 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin mx-auto mb-4" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Loading transactions...</p>
                                </div>
                            ) : auditData.length === 0 ? (
                                <div className="text-center py-12 bg-slate-50 rounded-3xl border border-dashed border-slate-200">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No payment records found</p>
                                </div>
                            ) : (
                                auditData.map((payment, i) => (
                                    <div key={i} className="p-4 rounded-2xl bg-white border border-slate-100 flex items-center justify-between hover:border-emerald-100 transition-all">
                                        <div className="flex items-center gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-emerald-50 flex items-center justify-center font-black text-emerald-600 text-xs">
                                                {payment.student?.name?.charAt(0) || "S"}
                                            </div>
                                            <div>
                                                <p className="text-xs font-black text-slate-900 uppercase">{payment.student?.name || "Anonymous Student"}</p>
                                                <p className="text-[8px] font-bold text-slate-400 uppercase tracking-widest">{new Date(payment.createdAt).toLocaleDateString()} • {payment.tx_ref}</p>
                                            </div>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xs font-black text-emerald-600">{payment.amount} ETB</p>
                                            <p className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{payment.status}</p>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </div>

                    <div className="p-10 bg-slate-50 border-t border-slate-100 flex justify-end">
                        <Button
                            onClick={() => setIsAuditOpen(false)}
                            className="h-12 px-10 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-black uppercase tracking-widest text-[9px] shadow-xl"
                        >
                            Close Audit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
