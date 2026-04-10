"use client"

import { useState } from "react"
import {
    BookOpen, Plus, Search, Filter,
    MoreVertical, Users, Clock, Video,
    Sparkles, ArrowUpRight, GraduationCap,
    LayoutGrid, List, CheckCircle2, ChevronRight,
    PenTool, Trash2, Activity
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useToast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"
import { mockTeacherData } from "@/lib/teacher-data"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"

export default function TeacherCourses() {
    const [viewMode, setViewMode] = useState<"grid" | "list">("grid")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [courses, setCourses] = useState(mockTeacherData.courses)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedGrade, setSelectedGrade] = useState("All Courses")
    const { toast } = useToast()

    // Form state for new course
    const [newCourse, setNewCourse] = useState({
        name: "",
        grade: "",
        semester: "",
    })

    const handleCreateCourse = () => {
        if (!newCourse.name || !newCourse.grade || !newCourse.semester) return

        const course = {
            id: `c${courses.length + 1}`,
            name: newCourse.name,
            grade: newCourse.grade,
            semester: newCourse.semester,
            studentCount: 0,
            completionRate: 0,
            activeQuizzes: 0
        }

        setCourses([course, ...courses])
        setIsCreateModalOpen(false)
        setNewCourse({ name: "", grade: "", semester: "" })
        toast({
            title: "Course Created",
            description: `Successfully initialized ${newCourse.name}.`,
        })
    }

    const filteredCourses = courses.filter(course => {
        const matchesSearch = course.name.toLowerCase().includes(searchQuery.toLowerCase())
        const matchesGrade = selectedGrade === "All Courses" || `Grade ${course.grade}` === selectedGrade
        return matchesSearch && matchesGrade
    })

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Curriculum Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Course <span className='text-sky-600'>Library</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Manage your Grade 9-12 classes, update lessons, and track student enrollment progress.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                            <DialogTrigger asChild>
                                <Button className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-all">
                                    <Plus className="w-4 h-4" /> Create New Course
                                </Button>
                            </DialogTrigger>
                            <DialogContent className="sm:max-w-[500px] rounded-[32px] border-slate-100 bg-white p-10">
                                <DialogHeader>
                                    <DialogTitle className="text-2xl font-black uppercase tracking-tight text-slate-900">New Academic Course</DialogTitle>
                                    <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">Ethiopian Curriculum Standards</p>
                                </DialogHeader>
                                <div className="space-y-6 py-8">
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
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Grade Level</Label>
                                            <Select value={newCourse.grade} onValueChange={(v) => setNewCourse({ ...newCourse, grade: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-[10px] uppercase tracking-widest">
                                                    <SelectValue placeholder="Select Grade" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    <SelectItem value="9">Grade 9</SelectItem>
                                                    <SelectItem value="10">Grade 10</SelectItem>
                                                    <SelectItem value="11">Grade 11</SelectItem>
                                                    <SelectItem value="12">Grade 12</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Semester</Label>
                                            <Select value={newCourse.semester} onValueChange={(v) => setNewCourse({ ...newCourse, semester: v })}>
                                                <SelectTrigger className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-black text-[10px] uppercase tracking-widest">
                                                    <SelectValue placeholder="Select Term" />
                                                </SelectTrigger>
                                                <SelectContent className="rounded-2xl border-slate-100">
                                                    <SelectItem value="1">Semester 1</SelectItem>
                                                    <SelectItem value="2">Semester 2</SelectItem>
                                                </SelectContent>
                                            </Select>
                                        </div>
                                    </div>
                                    <div className="p-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50 text-center space-y-2 group cursor-pointer hover:bg-sky-50 hover:border-sky-200 transition-all">
                                        <LayoutGrid className="w-6 h-6 text-slate-300 mx-auto group-hover:scale-110 transition-transform" />
                                        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Upload Syllabus/Outline (PDF)</p>
                                    </div>
                                </div>
                                <DialogFooter>
                                    <Button onClick={handleCreateCourse} className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-sky-500/20">Initialize Course Framework</Button>
                                </DialogFooter>
                            </DialogContent>
                        </Dialog>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4 w-full sm:w-auto">
                    <div className="relative group flex-1">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            placeholder="Search library..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>

                    <div className="bg-white px-6 py-2 rounded-[28px] border border-slate-200 shadow-sm flex items-center gap-2 overflow-x-auto no-scrollbar">
                        {["All Courses", "Grade 9", "Grade 10", "Grade 11", "Grade 12"].map(grade => (
                            <button
                                key={grade}
                                onClick={() => setSelectedGrade(grade)}
                                className={cn(
                                    "px-4 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all whitespace-nowrap",
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

            {/* Courses Display */}
            <div className={cn(
                "grid gap-8",
                viewMode === "grid" ? "grid-cols-1 md:grid-cols-2 lg:grid-cols-3" : "grid-cols-1"
            )}>
                {filteredCourses.map(course => (
                    <div
                        key={course.id}
                        className={cn(
                            "group bg-white rounded-[48px] border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden",
                            viewMode === "list" ? "p-6 lg:p-10 flex flex-col lg:flex-row items-center gap-8" : "p-10"
                        )}
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <span className="px-3 py-1 rounded-xl bg-sky-50 text-sky-500 text-[8px] font-black uppercase tracking-widest border border-sky-100">Grade {course.grade}</span>
                        </div>

                        <div className={cn("space-y-6 relative z-10 w-full", viewMode === "list" && "flex-1")}>
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                    <BookOpen className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic group-hover:text-sky-600 transition-colors">{course.name}</h3>
                                    <div className="flex items-center gap-3 mt-1">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                            <Users className="w-3.5 h-3.5" /> {course.studentCount} Students
                                        </p>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Semester {course.semester}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Pulse</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">72% Active</p>
                                </div>
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Sparkles className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Exercises</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">24 Ready</p>
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-9 h-9 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center shadow-sm">
                                            <Users className="w-4 h-4 text-slate-300" />
                                        </div>
                                    ))}
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                                        +42
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button size="sm" variant="outline" className="h-10 w-10 rounded-xl p-0 border-slate-100 text-slate-400 hover:text-sky-600 transition-all">
                                        <PenTool className="w-4 h-4" />
                                    </Button>
                                    <Button
                                        onClick={() => toast({
                                            title: "Content Manager",
                                            description: `Opening content editor for ${course.name}...`,
                                            duration: 3000
                                        })}
                                        className="w-full h-12 rounded-xl bg-slate-900 hover:bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest transition-all shadow-lg shadow-slate-900/10 hover:shadow-sky-500/20"
                                    >
                                        Manage Content
                                    </Button>
                                </div>
                            </div>
                        </div>

                        {/* Background Decoration */}
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                    </div>
                ))}
            </div>

            <div className="h-20" /> {/* Spacer */}
        </div>
    )
}
