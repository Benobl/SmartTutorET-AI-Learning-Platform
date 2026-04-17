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
    Clock
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
import { getCourses, addCourse, updateCourse, deleteCourse, exportToPDF } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function CourseManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [courses, setCourses] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [editingCourse, setEditingCourse] = useState<any>(null)

    // Form state
    const [formState, setFormState] = useState({
        name: "",
        code: "",
        subject: "",
        grade: "",
        semester: "Semester 1",
        description: ""
    })

    const refreshCourses = () => {
        setCourses(getCourses())
    }

    useEffect(() => {
        refreshCourses()
    }, [])

    const handleAction = (e: React.FormEvent) => {
        e.preventDefault()
        if (editingCourse) {
            updateCourse(editingCourse.id, formState)
            toast.success("Course modified successfully.")
        } else {
            addCourse(formState)
            toast.success("New course archived to curriculum.")
        }
        setIsCreateModalOpen(false)
        setEditingCourse(null)
        setFormState({ name: "", code: "", subject: "", grade: "", semester: "Semester 1", description: "" })
        refreshCourses()
    }

    const openEdit = (course: any) => {
        setEditingCourse(course)
        setFormState({
            name: course.name,
            code: course.code,
            subject: course.subject,
            grade: course.grade,
            semester: course.semester || "Semester 1",
            description: course.description || ""
        })
        setIsCreateModalOpen(true)
    }

    const handleDelete = (id: string) => {
        deleteCourse(id)
        refreshCourses()
        toast.error("Course removed from registry.")
    }

    const handleExportPDF = () => {
        const columns = ['name', 'code', 'subject', 'grade', 'studentCount']
        exportToPDF(filteredCourses, columns, 'Curriculum Registry Report', 'smarttutor_curriculum')
        toast.success("Curriculum exported as PDF.")
    }

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
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
                        onClick={() => {
                            setEditingCourse(null)
                            setFormState({ name: "", code: "", subject: "", grade: "", semester: "Semester 1", description: "" })
                            setIsCreateModalOpen(true)
                        }}
                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                    >
                        <Plus className="w-5 h-5" />
                        Archive Course
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
                    filteredCourses.map((course) => (
                        <Card key={course.id} className="bg-white border-slate-100 rounded-[40px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border shadow-sm group relative">
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
                                        <h3 className="text-2xl font-black text-slate-800 mb-1 leading-tight group-hover:text-blue-600 transition-colors">{course.name}</h3>
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

                                <div className="flex items-center gap-3 pt-2">
                                    <Button
                                        onClick={() => openEdit(course)}
                                        className="flex-1 bg-white hover:bg-slate-50 text-slate-900 rounded-2xl font-black h-14 border border-slate-100 text-[11px] uppercase tracking-widest transition-all"
                                    >
                                        Modify Path
                                    </Button>
                                    <Button
                                        variant="ghost"
                                        onClick={() => handleDelete(course.id)}
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
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Designation</Label>
                                <Input
                                    placeholder="e.g. Advanced Calculus & Topology"
                                    className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                    value={formState.name}
                                    onChange={(e) => setFormState({ ...formState, name: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Registry Code</Label>
                                    <Input
                                        placeholder="e.g. MATH-402"
                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={formState.code}
                                        onChange={(e) => setFormState({ ...formState, code: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                                    <Input
                                        placeholder="e.g. 12"
                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={formState.grade}
                                        onChange={(e) => setFormState({ ...formState, grade: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Area</Label>
                                    <Input
                                        placeholder="e.g. Mathematics"
                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={formState.subject}
                                        onChange={(e) => setFormState({ ...formState, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Term</Label>
                                    <select
                                        className="w-full bg-white border border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold px-4"
                                        value={formState.semester}
                                        onChange={(e) => setFormState({ ...formState, semester: e.target.value })}
                                    >
                                        <option>Semester 1</option>
                                        <option>Semester 2</option>
                                    </select>
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
        </div>
    )
}
