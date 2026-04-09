"use client"

import { useState } from "react"
import { teacherCourses } from "@/lib/teacher-data"
import { cn } from "@/lib/utils"
import { BookOpen, Users, Clock, Upload, Edit2, BarChart2, Plus, Search, CheckCircle2, FileText, X, Check } from "lucide-react"
import { Progress } from "@/components/ui/progress"
import { Input } from "@/components/ui/input"

export default function TeacherCoursesPage() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<"all" | "active" | "completed">("all")
    const [uploadingFor, setUploadingFor] = useState<number | null>(null)
    const [uploadTitle, setUploadTitle] = useState("")
    const [uploadSuccess, setUploadSuccess] = useState<number | null>(null)

    const filtered = teacherCourses.filter(c => {
        if (filter !== "all" && c.status !== filter) return false
        if (searchQuery && !c.name.toLowerCase().includes(searchQuery.toLowerCase()) && !c.code.toLowerCase().includes(searchQuery.toLowerCase())) return false
        return true
    })

    const handleUpload = (courseId: number) => {
        if (!uploadTitle.trim()) return
        setUploadSuccess(courseId)
        setUploadingFor(null)
        setUploadTitle("")
        setTimeout(() => setUploadSuccess(null), 3000)
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">My Courses</h1>
                    <p className="text-slate-500 text-sm font-medium">Manage your courses and upload learning materials.</p>
                </div>
                <button className="flex items-center gap-2 px-5 py-2.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-indigo-600/20">
                    <Plus className="w-4 h-4" />
                    Create New Course
                </button>
            </div>

            {/* Filters + Search */}
            <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by course name or code..."
                        className="pl-10 bg-white border-slate-200 rounded-xl h-11"
                        value={searchQuery}
                        onChange={e => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex gap-2">
                    {(["all", "active", "completed"] as const).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={cn(
                                "px-4 py-2 rounded-xl text-sm font-bold transition-all capitalize",
                                filter === f ? "bg-indigo-600 text-white shadow-md" : "bg-white text-slate-500 border border-slate-200 hover:bg-slate-50"
                            )}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[
                    { label: "Total Courses", value: teacherCourses.length },
                    { label: "Active", value: teacherCourses.filter(c => c.status === "active").length },
                    { label: "Total Students", value: teacherCourses.reduce((s, c) => s + c.studentsEnrolled, 0) },
                    { label: "Materials Uploaded", value: teacherCourses.reduce((s, c) => s + c.materials, 0) },
                ].map(stat => (
                    <div key={stat.label} className="bg-white rounded-2xl border border-slate-200 shadow-sm p-5 text-center">
                        <p className="text-3xl font-black text-slate-900">{stat.value}</p>
                        <p className="text-xs text-slate-400 font-bold uppercase tracking-widest mt-1">{stat.label}</p>
                    </div>
                ))}
            </div>

            {/* Course Cards Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                {filtered.map(course => (
                    <div key={course.id} className="group bg-white rounded-[32px] border border-slate-200 shadow-sm hover:shadow-xl hover:border-indigo-200 transition-all duration-500 overflow-hidden">
                        {/* Cover Image */}
                        <div className="h-36 relative overflow-hidden">
                            <img src={course.image} alt={course.name} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-black/20 to-transparent" />
                            <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                                <div>
                                    <span className="text-[10px] font-black text-white/80 uppercase tracking-widest">{course.code}</span>
                                    <h3 className="text-lg font-black text-white leading-tight mt-0.5">{course.name}</h3>
                                </div>
                                <span className={cn("text-[10px] font-bold px-2.5 py-1.5 rounded-xl", course.status === "active" ? "bg-emerald-500 text-white" : "bg-slate-600 text-white")}>
                                    {course.status === "active" ? "Active" : "Completed"}
                                </span>
                            </div>
                        </div>

                        <div className="p-5 space-y-4">
                            {/* Stats Row */}
                            <div className="flex items-center gap-4 text-sm">
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <Users className="w-4 h-4" />
                                    <span className="font-bold">{course.studentsEnrolled}/{course.capacity}</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <FileText className="w-4 h-4" />
                                    <span className="font-bold">{course.materials} materials</span>
                                </div>
                                <div className="flex items-center gap-1.5 text-slate-500">
                                    <BarChart2 className="w-4 h-4" />
                                    <span className="font-bold">Avg {course.avgGrade}%</span>
                                </div>
                            </div>

                            {/* Completion bar */}
                            <div>
                                <div className="flex justify-between text-xs font-bold mb-1">
                                    <span className="text-slate-400">Student Completion</span>
                                    <span className="text-indigo-600">{course.completionRate}%</span>
                                </div>
                                <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-indigo-500 rounded-full" style={{ width: `${course.completionRate}%` }} />
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex gap-2 pt-1">
                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-indigo-50 text-indigo-600 text-xs font-bold hover:bg-indigo-100 transition-colors border border-indigo-100">
                                    <Edit2 className="w-3.5 h-3.5" />
                                    Edit
                                </button>
                                <button
                                    onClick={() => setUploadingFor(course.id === uploadingFor ? null : course.id)}
                                    className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-sky-50 text-sky-600 text-xs font-bold hover:bg-sky-100 transition-colors border border-sky-100"
                                >
                                    <Upload className="w-3.5 h-3.5" />
                                    Upload
                                </button>
                                <button className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-xl bg-emerald-50 text-emerald-600 text-xs font-bold hover:bg-emerald-100 transition-colors border border-emerald-100">
                                    <BarChart2 className="w-3.5 h-3.5" />
                                    Stats
                                </button>
                            </div>

                            {/* Upload Form */}
                            {uploadingFor === course.id && (
                                <div className="mt-2 p-4 bg-sky-50 rounded-2xl border border-sky-100 space-y-3 animate-in fade-in slide-in-from-bottom-2 duration-300">
                                    <p className="text-xs font-black text-sky-700 uppercase tracking-widest">Upload Material</p>
                                    <Input
                                        placeholder="Material title (e.g. Chapter 5 Summary)"
                                        value={uploadTitle}
                                        onChange={e => setUploadTitle(e.target.value)}
                                        className="bg-white border-sky-200 text-sm rounded-xl"
                                    />
                                    <div className="flex gap-2">
                                        <button onClick={() => handleUpload(course.id)} className="flex-1 py-2 bg-sky-600 hover:bg-sky-500 text-white rounded-xl text-xs font-bold transition-colors">
                                            Upload
                                        </button>
                                        <button onClick={() => setUploadingFor(null)} className="px-3 py-2 bg-white border border-sky-200 rounded-xl text-xs font-bold text-slate-500 hover:bg-slate-50 transition-colors">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                </div>
                            )}

                            {/* Upload success */}
                            {uploadSuccess === course.id && (
                                <div className="flex items-center gap-2 p-3 bg-emerald-50 rounded-xl border border-emerald-100 animate-in fade-in duration-300">
                                    <Check className="w-4 h-4 text-emerald-600" />
                                    <p className="text-xs font-bold text-emerald-700">Material uploaded successfully!</p>
                                </div>
                            )}
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
