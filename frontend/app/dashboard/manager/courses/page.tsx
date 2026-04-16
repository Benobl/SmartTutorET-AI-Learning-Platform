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
    BookOpen
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
import { getCourses } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function CourseManagement() {
    const [searchQuery, setSearchQuery] = useState("")
    const [courses, setCourses] = useState<any[]>([])
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Form state for adding course (simplified)
    const [newCourse, setNewCourse] = useState({
        name: "",
        code: "",
        subject: "",
        grade: "",
        studentCount: "0"
    })

    const refreshCourses = () => {
        setCourses(getCourses())
    }

    useEffect(() => {
        refreshCourses()
    }, [])

    const handleCreateCourse = (e: React.FormEvent) => {
        e.preventDefault()
        // In a real app we'd call an updateDB function, here we'll just simulate a successful addition
        toast.info("Course creation is simulated for this demo.")
        setIsCreateModalOpen(false)
    }

    const filteredCourses = courses.filter(c =>
        c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.code.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Curriculum Registry</h1>
                    <p className="text-slate-500 font-medium text-sm">Central repository for school courses and departmental records.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-8 h-12 text-sm shadow-lg shadow-blue-500/10 transition-all font-bold"
                >
                    <Plus className="w-5 h-5" />
                    Archive New Course
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search curriculum registry..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-12 rounded-xl focus:ring-blue-500/50 shadow-sm border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Course Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                {filteredCourses.map((course) => (
                    <Card key={course.id} className="bg-white border-slate-200 rounded-[32px] overflow-hidden hover:shadow-lg transition-all duration-500 border shadow-sm group">
                        <CardContent className="p-8 space-y-8">
                            <div>
                                <div className="flex items-center justify-between mb-4">
                                    <div className="px-3 py-1 rounded-full bg-blue-50 border border-blue-100 text-[10px] font-black text-blue-600 uppercase tracking-[0.2em]">
                                        {course.code}
                                    </div>
                                    <Badge className="bg-slate-50 text-slate-400 border-slate-200 border text-[9px]">ACTIVE</Badge>
                                </div>
                                <h3 className="text-2xl font-bold text-slate-900 mb-1 leading-tight">{course.name}</h3>
                                <p className="text-[11px] font-black uppercase tracking-widest text-blue-500/60 font-bold">{course.subject} • Grade {course.grade}</p>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-2xl bg-slate-50 border border-transparent flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Students</span>
                                    <p className="text-xl font-bold text-slate-900">{course.studentCount}</p>
                                </div>
                                <div className="p-5 rounded-2xl bg-slate-50 border border-transparent flex flex-col gap-1">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                                    <p className={`text-xs font-bold ${course.tutorId ? 'text-blue-600' : 'text-amber-600'}`}>
                                        {course.tutorId ? 'Staffed' : 'Unassigned'}
                                    </p>
                                </div>
                            </div>

                            <div className="flex items-center gap-3">
                                <Button className="flex-1 bg-white hover:bg-slate-50 text-slate-900 rounded-xl font-bold h-12 border border-slate-200 text-xs uppercase tracking-widest shadow-sm">
                                    Modify
                                </Button>
                                <Button variant="ghost" className="bg-rose-50 hover:bg-rose-600/10 text-rose-400 hover:text-rose-600 rounded-xl h-12 w-12 border border-slate-100">
                                    <Trash2 className="w-4 h-4" />
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                ))}

                {/* Create Course Modal */}
                <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                    <DialogContent className="sm:max-w-[500px] bg-white rounded-[32px] p-8 border-0 shadow-2xl">
                        <DialogHeader className="mb-6">
                            <DialogTitle className="text-2xl font-bold text-slate-900">Archive Course</DialogTitle>
                            <p className="text-slate-500 text-sm">Add a new subject to the official institutional curriculum.</p>
                        </DialogHeader>

                        <form onSubmit={handleCreateCourse} className="space-y-6">
                            <div className="space-y-4">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Course Name</Label>
                                    <Input
                                        placeholder="e.g. Advanced Thermodynamics"
                                        className="rounded-xl border-slate-200 h-12"
                                        value={newCourse.name}
                                        onChange={(e) => setNewCourse({ ...newCourse, name: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Code</Label>
                                        <Input
                                            placeholder="e.g. PHYS-401"
                                            className="rounded-xl border-slate-200 h-12"
                                            value={newCourse.code}
                                            onChange={(e) => setNewCourse({ ...newCourse, code: e.target.value })}
                                            required
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade</Label>
                                        <Input
                                            placeholder="e.g. 12"
                                            className="rounded-xl border-slate-200 h-12"
                                            value={newCourse.grade}
                                            onChange={(e) => setNewCourse({ ...newCourse, grade: e.target.value })}
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <DialogFooter className="pt-4 flex !justify-between gap-4">
                                <Button
                                    type="button"
                                    variant="ghost"
                                    className="flex-1 rounded-xl h-12 font-bold border border-slate-100"
                                    onClick={() => setIsCreateModalOpen(false)}
                                >
                                    Cancel
                                </Button>
                                <Button
                                    type="submit"
                                    className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-500/20"
                                >
                                    Create Course
                                </Button>
                            </DialogFooter>
                        </form>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    )
}
