"use client"

import { useState, useMemo } from "react"
import { grades as allGradesData, studentProfile } from "@/lib/student-data"
import { cn } from "@/lib/utils"
import { GraduationCap, TrendingUp, Award, BookOpen, Layers, LayoutGrid, CalendarRange } from "lucide-react"
import { CollapsibleGradeTable } from "@/components/dashboards/student/collapsible-grade-table"
import { GradeDetailModal } from "@/components/dashboards/student/grade-detail-modal"

export default function StudentGrades() {
    const [selectedGrade, setSelectedGrade] = useState<string>("12")
    const [selectedSemester, setSelectedSemester] = useState<string>("All")
    const [selectedCourse, setSelectedCourse] = useState<any>(null)
    const [isModalOpen, setIsModalOpen] = useState(false)

    // Ethiopian students see their current and past grades
    const gradesList = ["9", "10", "11", "12"]

    const filteredGrades = useMemo(() => {
        return allGradesData.filter(g => g.gradeLevel === selectedGrade)
    }, [selectedGrade])

    const semester1Grades = useMemo(() => {
        return filteredGrades.filter(g => g.semester === 1)
    }, [filteredGrades])

    const semester2Grades = useMemo(() => {
        return filteredGrades.filter(g => g.semester === 2)
    }, [filteredGrades])

    // Calculate aggregated stats
    const stats = useMemo(() => {
        const totalCredits = filteredGrades.reduce((sum, g) => sum + g.credits, 0)
        const avgPercentage = filteredGrades.length > 0
            ? Math.round(filteredGrades.reduce((sum, g) => sum + g.percentage, 0) / filteredGrades.length)
            : 0

        // Mock GPA calculation
        const gpa = totalCredits > 0 ? (avgPercentage / 25).toFixed(2) : "0.00"

        return { totalCredits, avgPercentage, gpa }
    }, [filteredGrades])

    const openDetails = (course: any) => {
        setSelectedCourse(course)
        setIsModalOpen(true)
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Header & Advanced Filter Tabs */}
            <div className="relative overflow-hidden p-10 rounded-[48px] bg-white border border-slate-200 shadow-xl shadow-slate-200/20 group">
                <div className="absolute -right-20 -top-20 w-[400px] h-[400px] bg-sky-500/5 blur-3xl rounded-full" />
                <div className="absolute -left-20 -bottom-20 w-[300px] h-[300px] bg-indigo-500/5 blur-3xl rounded-full" />

                <div className="relative z-10 flex flex-col xl:flex-row items-start xl:items-center justify-between gap-10">
                    <div className="max-w-xl">
                        <div className="flex items-center gap-3 mb-4">
                            <div className="w-2 h-8 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30" />
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Academic Transcript</span>
                        </div>
                        <h1 className="text-4xl xl:text-5xl font-black text-slate-900 tracking-tight leading-none mb-4">
                            Grades & <span className="text-sky-500 italic">Academic Records</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium leading-relaxed">
                            Filter by academic year and semester to explore detailed course performance, credit allocations, and assessment breakdowns.
                        </p>
                    </div>

                    <div className="flex flex-col gap-6 w-full xl:w-auto">
                        {/* Grade Level Filter - Large Modern Tabs */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Select Academic Year</label>
                            <div className="flex p-1.5 bg-slate-100/80 rounded-[28px] border border-slate-200/50 backdrop-blur-md">
                                {gradesList.map((grade) => (
                                    <button
                                        key={grade}
                                        onClick={() => setSelectedGrade(grade)}
                                        className={cn(
                                            "flex-1 h-12 px-6 rounded-[22px] text-xs font-black uppercase tracking-widest transition-all duration-500",
                                            selectedGrade === grade
                                                ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                                : "text-slate-400 hover:text-slate-600 hover:bg-white/50"
                                        )}
                                    >
                                        Grade {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Semester Filter - Toggle Pills */}
                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest pl-2">Filter by Period</label>
                            <div className="flex gap-2">
                                {["All", "1", "2"].map((sem) => (
                                    <button
                                        key={sem}
                                        onClick={() => setSelectedSemester(sem)}
                                        className={cn(
                                            "flex-1 h-11 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border transition-all duration-300",
                                            selectedSemester === sem
                                                ? "bg-slate-900 text-white border-slate-900 shadow-lg shadow-slate-900/20"
                                                : "bg-white text-slate-400 border-slate-200 hover:border-sky-300 hover:text-sky-600"
                                        )}
                                    >
                                        {sem === "All" ? "Full Year" : `Semester ${sem}`}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Snapshot */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Weighted GPA", value: stats.gpa, icon: GraduationCap, color: "sky", trend: "+0.2 from last term" },
                    { label: "Avg Performance", value: `${stats.avgPercentage}%`, icon: TrendingUp, color: "emerald", trend: "Grade A- Equivalent" },
                    { label: "Total Credits", value: stats.totalCredits, icon: Award, color: "indigo", trend: "On track for graduation" },
                ].map((stat, i) => (
                    <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-200 shadow-sm hover:shadow-2xl hover:-translate-y-1 transition-all duration-500 relative overflow-hidden group">
                        <div className={cn("absolute -right-6 -top-6 w-32 h-32 rounded-full opacity-0 group-hover:opacity-10 blur-3xl transition-opacity", `bg-${stat.color}-500`)} />
                        <div className="flex items-start justify-between mb-6">
                            <div className={cn("p-4 rounded-2xl bg-slate-50 border border-slate-100 text-slate-400 group-hover:scale-110 group-hover:bg-white group-hover:shadow-md transition-all duration-500", `text-${stat.color}-500`)}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <span className="text-[9px] font-black px-2 py-1 rounded-lg bg-slate-50 text-slate-500 border border-slate-100 uppercase tracking-tighter">Verified Result</span>
                        </div>
                        <h3 className="text-4xl font-black text-slate-900 mb-1">{stat.value}</h3>
                        <p className="text-[11px] text-slate-400 font-black uppercase tracking-widest">{stat.label}</p>
                        <div className="mt-4 pt-4 border-t border-slate-50 flex items-center gap-2">
                            <div className={cn("w-1.5 h-1.5 rounded-full", `bg-${stat.color}-500`)} />
                            <span className="text-[10px] font-bold text-slate-500">{stat.trend}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* Semester Tables */}
            <div className="space-y-8 pb-20">
                {(selectedSemester === "All" || selectedSemester === "1") && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <CalendarRange className="w-5 h-5 text-sky-500" />
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">First Semester Transcript</h2>
                        </div>
                        <CollapsibleGradeTable
                            title="Semester 1 Archive"
                            semester={1}
                            grades={semester1Grades}
                            onViewDetails={openDetails}
                        />
                        {semester1Grades.length === 0 && (
                            <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records available for Semester 1 in Grade {selectedGrade}</p>
                            </div>
                        )}
                    </div>
                )}

                {(selectedSemester === "All" || selectedSemester === "2") && (
                    <div className="space-y-6">
                        <div className="flex items-center gap-3 px-2">
                            <CalendarRange className="w-5 h-5 text-indigo-500" />
                            <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Second Semester Transcript</h2>
                        </div>
                        <CollapsibleGradeTable
                            title="Semester 2 Archive"
                            semester={2}
                            grades={semester2Grades}
                            onViewDetails={openDetails}
                            defaultOpen={selectedSemester === "2"}
                        />
                        {semester2Grades.length === 0 && (
                            <div className="p-12 text-center bg-white rounded-[32px] border border-dashed border-slate-200">
                                <p className="text-slate-400 font-bold uppercase tracking-widest text-xs">No records available for Semester 2 in Grade {selectedGrade}</p>
                            </div>
                        )}
                    </div>
                )}
            </div>

            {/* Empty State for the entire filter selection */}
            {filteredGrades.length === 0 && (
                <div className="text-center py-20 bg-white border border-slate-200 rounded-[40px] shadow-sm animate-in fade-in zoom-in duration-500">
                    <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                        <BookOpen className="w-10 h-10 text-slate-200" />
                    </div>
                    <h3 className="text-2xl font-black text-slate-900">Transcript Records Empty</h3>
                    <p className="text-slate-400 font-bold text-sm max-w-md mx-auto mt-2">
                        We couldn't find any data for Grade {selectedGrade}. This might mean the academic records haven't been synchronized yet.
                    </p>
                    <button
                        onClick={() => setSelectedGrade("12")}
                        className="mt-8 px-8 py-4 bg-sky-500 text-white rounded-2xl font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-500/20 hover:scale-105 transition-transform"
                    >
                        Back to Current Term
                    </button>
                </div>
            )}

            <GradeDetailModal
                isOpen={isModalOpen}
                onOpenChange={setIsModalOpen}
                course={selectedCourse}
            />
        </div>
    )
}
