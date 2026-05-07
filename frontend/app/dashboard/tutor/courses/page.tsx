"use client"

import { useState, useEffect } from "react"
import {
    BookOpen, Plus, Search, Filter,
    MoreVertical, Users, Clock, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    LayoutGrid, List, CheckCircle2, ChevronRight,
    PenTool, Trash2, Activity, Download, AlertCircle,
    BrainCircuit, Library, FileDown, Eye
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { getCurrentUser } from "@/lib/auth-utils"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { courseApi, paymentApi } from "@/lib/api"

export default function TeacherCourses() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isModuleManagerOpen, setIsModuleManagerOpen] = useState(false)
    const [selectedCourseForModules, setSelectedCourseForModules] = useState<any>(null)
    const [lessons, setLessons] = useState<any[]>([])
    const [isLessonsLoading, setIsLessonsLoading] = useState(false)
    const [lessonForm, setLessonForm] = useState({
        title: "",
        duration: "15 min",
        type: "video" as "video" | "exercise" | "quiz",
        videoUrl: ""
    })

    useEffect(() => {
        if (selectedCourseForModules && isModuleManagerOpen) {
            loadCourseLessons()
        }
    }, [selectedCourseForModules, isModuleManagerOpen])

    const loadCourseLessons = async () => {
        try {
            setIsLessonsLoading(true)
            const res = await courseApi.getById(selectedCourseForModules._id)
            // Fix: the response structure for getById might be { data: { ... } } or just the object
            const data = res.data || res
            setLessons(data.lessons || [])
        } catch (error: any) {
            toast({ title: "Failed to load lessons", description: error.message, variant: "destructive" })
        } finally {
            setIsLessonsLoading(false)
        }
    }

    const handleAddLesson = async () => {
        if (!lessonForm.title) return
        try {
            const res = await courseApi.addLesson(selectedCourseForModules._id, lessonForm)
            setLessons(res.data.lessons)
            setLessonForm({ title: "", duration: "15 min", type: "video", videoUrl: "" })
            toast({ title: "Lesson Added", description: "Successfully added new lesson to curriculum." })
        } catch (error: any) {
            toast({ title: "Failed to add lesson", description: error.message, variant: "destructive" })
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
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Status Warning for Pending Tutors */}
            {!isApproved && (
                <div className="bg-amber-50 border border-amber-100 rounded-[32px] p-8 flex items-start gap-6 animate-in slide-in-from-top-4 duration-700">
                    <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center text-amber-500 shadow-sm shrink-0">
                        <AlertCircle className="w-7 h-7" />
                    </div>
                    <div className="space-y-2">
                        <h4 className="text-lg font-black text-amber-900 uppercase tracking-tight">Institutional Review in Progress</h4>
                        <p className="text-sm text-amber-700 font-medium leading-relaxed">
                            Welcome, <span className="font-black underline">{currentUser?.name}</span>! Your tutor application is currently being reviewed by our academic board. 
                            While in pending status, you can explore the platform but <span className="font-black italic">course creation and live sessions</span> are temporarily disabled.
                        </p>
                        <div className="pt-2 flex items-center gap-4">
                            <span className="px-3 py-1 rounded-full bg-amber-500 text-white text-[8px] font-black uppercase tracking-tighter">Status: Pending Verification</span>
                            <span className="text-[10px] text-amber-600 font-bold uppercase tracking-widest italic underline decoration-2 underline-offset-4">Learn about our approval process →</span>
                        </div>
                    </div>
                </div>
            )}

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Curriculum Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Course <span className='text-sky-600'>Library</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Manage your Grade 9-12 classes, update lessons, and track student enrollment progress.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <Input 
                                placeholder="Search courses..." 
                                className="h-14 pl-12 pr-6 w-[300px] rounded-2xl bg-white border-slate-100 font-bold text-sm shadow-sm focus:border-sky-300 transition-all"
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                            />
                        </div>

                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button 
                                    className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-all"
                                >
                                    <Plus className="w-4 h-4" /> Create New Course
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[480px] rounded-[28px] border-slate-100 bg-white p-0 overflow-hidden max-h-[90vh] flex flex-col">
                                <div className="px-8 pt-8 pb-4 border-b border-slate-50 flex-shrink-0">
                                    <DialogHeader>
                                        <DialogTitle className="text-xl font-black uppercase tracking-tight text-slate-900">
                                            {editingCourseId ? "Modify Framework" : "New Academic Course"}
                                        </DialogTitle>
                                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Ethiopian Curriculum Standards</p>
                                    </DialogHeader>
                                </div>
                                <div className="overflow-y-auto flex-1 px-8 py-6">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Title</Label>
                                        <Input
                                            placeholder="e.g. Modern Physics: Derivations"
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm"
                                            value={newCourse.name}
                                            onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        />
                                    </div>
                                    <div className="grid grid-cols-2 gap-4">
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                                            <select 
                                                className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-3"
                                                value={newCourse.grade}
                                                onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                                            >
                                                <option value="9">Grade 9</option>
                                                <option value="10">Grade 10</option>
                                                <option value="11">Grade 11</option>
                                                <option value="12">Grade 12</option>
                                            </select>
                                        </div>
                                        <div className="space-y-1.5">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Term</Label>
                                            <select 
                                                className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-3"
                                                value={newCourse.semester}
                                                onChange={(e) => setNewCourse({ ...newCourse, semester: e.target.value })}
                                            >
                                                <option value="1">Semester 1</option>
                                                <option value="2">Semester 2</option>
                                                <option value="Full Year">Full Year</option>
                                            </select>
                                        </div>
                                    </div>
                                    <div className="flex items-center justify-between p-4 rounded-xl bg-sky-50/50 border border-sky-100">
                                        <div className="space-y-0.5">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-sky-600">Premium Mode</Label>
                                            <p className="text-[8px] text-slate-400 font-bold uppercase">Require Chapa Payment</p>
                                        </div>
                                        <input 
                                            type="checkbox"
                                            className="w-4 h-4 rounded border-slate-200 text-sky-600"
                                            checked={newCourse.isPremium}
                                            onChange={(e) => setNewCourse({ ...newCourse, isPremium: e.target.checked })}
                                        />
                                    </div>

                                    {newCourse.isPremium && (
                                        <div className="space-y-1.5 animate-in fade-in slide-in-from-top-1">
                                            <Label className="text-[9px] font-black uppercase tracking-widest text-slate-400 ml-1">Price (ETB)</Label>
                                            <Input
                                                type="number"
                                                placeholder="500"
                                                className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-xs"
                                                value={newCourse.price}
                                                onChange={(e) => setNewCourse({ ...newCourse, price: parseInt(e.target.value) || 0 })}
                                            />
                                        </div>
                                    )}

                                    <div 
                                        onClick={() => document.getElementById('syllabus-upload')?.click()}
                                        className={cn(
                                            "p-4 rounded-xl border border-dashed text-center space-y-1 group cursor-pointer transition-all",
                                            syllabusFile ? "bg-emerald-50 border-emerald-200" : "bg-slate-50 border-slate-200 hover:bg-sky-50 hover:border-sky-200"
                                        )}
                                    >
                                        <input 
                                            id="syllabus-upload"
                                            type="file" 
                                            className="hidden" 
                                            accept=".pdf"
                                            onChange={(e) => setSyllabusFile(e.target.files?.[0] || null)}
                                        />
                                        {syllabusFile ? (
                                            <>
                                                <CheckCircle2 className="w-6 h-6 text-emerald-500 mx-auto" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-emerald-600 line-clamp-1">{syllabusFile.name}</p>
                                                <p className="text-[8px] text-emerald-400 font-bold uppercase tracking-widest">Click to change file</p>
                                            </>
                                        ) : (
                                            <>
                                                <Download className="w-6 h-6 text-slate-300 mx-auto group-hover:scale-110 transition-transform group-hover:text-sky-500" />
                                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 group-hover:text-sky-600">Upload Syllabus/Outline (PDF)</p>
                                            </>
                                        )}
                                </div>
                                </div>
                                <div className="px-8 pb-8 pt-4 border-t border-slate-50 flex-shrink-0">
                                    <Button 
                                        disabled={isSubmitting}
                                        onClick={handleCreateCourse} 
                                        className="w-full h-12 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px] shadow-lg shadow-sky-500/10 disabled:opacity-50"
                                    >
                                        {isSubmitting ? "Processing..." : editingCourseId ? "Update Framework" : "Submit for Manager Approval"}
                                    </Button>
                                </div>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-row items-center gap-4">
                    <div className="bg-white px-3 py-2 rounded-[28px] border border-slate-200 shadow-sm flex items-center gap-1 flex-nowrap">
                        {["All Courses", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={cn(
                                    "px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
                                    selectedGrade === grade ? "bg-sky-50 text-sky-600" : "text-slate-400 hover:text-sky-600"
                                )}
                            >
                                {grade}
                            </button>
                        ))}
                    </div>
                    <div className="bg-white p-1.5 rounded-[22px] border border-slate-100 shadow-sm flex gap-1">
                        <button
                            onClick={() => setViewMode("grid")}
                            className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                                viewMode === "grid" ? "bg-sky-600 text-white shadow-lg shadow-sky-500/20" : "text-slate-300 hover:text-slate-600"
                            )}
                        >
                            <LayoutGrid className="w-5 h-5" />
                        </button>
                        <button
                            onClick={() => setViewMode("list")}
                            className={cn(
                                "w-11 h-11 rounded-xl flex items-center justify-center transition-all",
                                viewMode === "list" ? "bg-sky-600 text-white shadow-lg shadow-sky-500/20" : "text-slate-300 hover:text-slate-600"
                            )}
                        >
                            <List className="w-5 h-5" />
                        </button>
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

            {/* Module Manager Dialog */}
            <Dialog open={isModuleManagerOpen} onOpenChange={setIsModuleManagerOpen}>
                <DialogContent className="sm:max-w-[800px] rounded-[48px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl max-h-[90vh] flex flex-col">
                    <div className="p-10 bg-slate-50 border-b border-slate-100 flex-shrink-0">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-3">
                                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[8px] font-black uppercase tracking-widest border border-sky-100">Curriculum Editor</span>
                                <BookOpen className="w-4 h-4 text-sky-400" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic leading-none">Lesson <span className="text-sky-600">Builder</span></DialogTitle>
                            <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest mt-2">{selectedCourseForModules?.title || selectedCourseForModules?.name}</p>
                        </DialogHeader>
                    </div>

                    <div className="flex-1 overflow-hidden flex flex-col lg:flex-row">
                        {/* Left: Add Lesson Form */}
                        <div className="w-full lg:w-80 p-8 border-r border-slate-50 space-y-6 overflow-y-auto">
                            <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Add New Lesson</h4>
                            <div className="space-y-4">
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Lesson Title</Label>
                                    <Input 
                                        placeholder="e.g. Intro to Mechanics"
                                        className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-xs"
                                        value={lessonForm.title}
                                        onChange={(e) => setLessonForm({ ...lessonForm, title: e.target.value })}
                                    />
                                </div>
                                <div className="space-y-1.5">
                                    <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Video URL (YouTube)</Label>
                                    <Input 
                                        placeholder="https://youtube.com/..."
                                        className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-xs"
                                        value={lessonForm.videoUrl}
                                        onChange={(e) => setLessonForm({ ...lessonForm, videoUrl: e.target.value })}
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-3">
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Duration</Label>
                                        <Input 
                                            placeholder="15 min"
                                            className="h-11 rounded-xl bg-slate-50 border-slate-100 font-bold text-xs"
                                            value={lessonForm.duration}
                                            onChange={(e) => setLessonForm({ ...lessonForm, duration: e.target.value })}
                                        />
                                    </div>
                                    <div className="space-y-1.5">
                                        <Label className="text-[9px] font-black uppercase text-slate-400 ml-1">Type</Label>
                                        <select 
                                            className="w-full h-11 rounded-xl bg-slate-50 border border-slate-100 font-black text-[9px] uppercase px-2"
                                            value={lessonForm.type}
                                            onChange={(e) => setLessonForm({ ...lessonForm, type: e.target.value as any })}
                                        >
                                            <option value="video">Video</option>
                                            <option value="exercise">Exercise</option>
                                            <option value="quiz">Quiz</option>
                                        </select>
                                    </div>
                                </div>
                                <Button 
                                    onClick={handleAddLesson}
                                    className="w-full h-11 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[9px] uppercase tracking-widest shadow-lg shadow-sky-500/10 mt-2"
                                >
                                    Append to Curriculum
                                </Button>
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

                            <div className="space-y-3">
                                {lessons.length === 0 ? (
                                    <div className="text-center py-12 bg-white rounded-3xl border border-dashed border-slate-200">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">No lessons added yet</p>
                                    </div>
                                ) : (
                                    lessons.map((lesson, i) => (
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
                                                                <Video className="w-2.5 h-2.5" /> Link Attached
                                                            </p>
                                                        )}
                                                    </div>
                                                </div>
                                            </div>
                                            <Button variant="ghost" size="sm" className="h-8 w-8 rounded-lg p-0 text-slate-300 hover:text-rose-500">
                                                <Trash2 className="w-3.5 h-3.5" />
                                            </Button>
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
                            className="h-12 px-8 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] shadow-xl"
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
                            className="h-12 px-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white font-black uppercase tracking-widest text-[9px] shadow-xl"
                        >
                            Close Audit
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
