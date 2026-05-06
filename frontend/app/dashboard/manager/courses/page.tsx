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
    Zap
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
import { Label } from "@/components/ui/label"
import { getCourses, addCourse, updateCourse, deleteCourse, exportToPDF, generateGradeCurriculum } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function CourseManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [courses, setCourses] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isAIModalOpen, setIsAIModalOpen] = useState(false)
    const [generatingCurriculum, setGeneratingCurriculum] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)
    const [targetGrade, setTargetGrade] = useState("9")
    const [targetStream, setTargetStream] = useState("Common")

    // Form state
    const INITIAL_FORM_STATE = {
        name: "",
        code: "",
        subject: "",
        grade: "",
        stream: "Common",
        semester: "Full Year",
        description: "",
        roadmap: {
            semester1: { chapters: "", midTerm: "", final: "" },
            semester2: { chapters: "", midTerm: "", final: "" }
        }
    }

    const [formState, setFormState] = useState(INITIAL_FORM_STATE)

    const refreshCourses = async () => {
        try {
            const data = await getCourses()
            setCourses(Array.isArray(data) ? data : [])
        } catch (error) {
            console.error("Failed to refresh courses:", error)
            toast.error("Resource synchronization failed.")
        }
    }

    useEffect(() => {
        refreshCourses()
    }, [])

    const handleAction = async (e: React.FormEvent) => {
        e.preventDefault()
        if (editingCourse) {
            await updateCourse(editingCourse.id, formState)
            toast.success("Course modified successfully.")
        } else {
            await addCourse(formState)
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
            name: course.name,
            code: course.code,
            subject: course.subject,
            grade: course.grade,
            stream: course.stream || "Common",
            semester: course.semester || "Full Year",
            description: course.description || "",
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

    const handleExportPDF = () => {
        const columns = ['name', 'code', 'subject', 'grade', 'studentCount']
        exportToPDF(filteredCourses, columns, 'Curriculum Registry Report', 'smarttutor_curriculum')
        toast.success("Curriculum exported as PDF.")
    }

    const filteredCourses = courses.filter(c =>
        (c.title || c.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
        (c.code || "").toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Curriculum <span className="text-blue-500">Registry</span></h1>
                    <p className="text-slate-400 font-medium">Standardize and audit institutional learning paths.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleExportPDF}
                        className="border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest transition-all"
                    >
                        <FileDown className="w-5 h-5" />
                        Export PDF
                    </Button>
                    <Button
                        onClick={() => setIsAIModalOpen(true)}
                        className="bg-indigo-600 hover:bg-indigo-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-indigo-500/30 transition-all active:scale-95 border-0"
                    >
                        <Sparkles className="w-5 h-5" />
                        Sync with Gemini AI
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
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.length > 0 ? (
                    filteredCourses.map((course, index) => (
                        <Card key={course._id || course.id || index} className="bg-white border-slate-100 rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border shadow-sm group relative">
                            {/* Decorative Corner Circle */}
                            <div className="absolute -top-6 -right-6 w-24 h-24 bg-blue-500/5 rounded-full blur-xl group-hover:bg-blue-500/10 transition-all" />

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

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-50 flex flex-col gap-1 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Students</span>
                                        <p className="text-xl font-black text-slate-800">{course.studentCount}</p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-50 flex flex-col gap-1 group-hover:bg-white group-hover:border-blue-100 transition-all">
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                                        <div className="flex items-center gap-2 text-[11px] font-black uppercase text-blue-500">
                                            <CheckCircle2 className="w-3.5 h-3.5" /> Staffed
                                        </div>
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

                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        onClick={() => openEdit(course)}
                                        className="flex-1 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black h-14 border border-slate-100 text-[11px] uppercase tracking-widest transition-all"
                                    >
                                        Modify Path
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDelete(course._id || course.id)}
                                        className="bg-rose-50 hover:bg-rose-500 hover:text-white text-rose-400 rounded-2xl h-14 w-14 border border-rose-100/50 transition-all"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="col-span-full text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                        <BookOpen className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-300">No Curriculum Found</h3>
                        <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.25em] mt-3 px-10 max-w-md mx-auto">There are currently no course records matching your search query.</p>
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
        </div>
    )
}
