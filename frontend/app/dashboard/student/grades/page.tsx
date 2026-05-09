"use client"

import { useState, useMemo } from "react"
import { grades as allGradesData } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import {
    GraduationCap, TrendingUp, TrendingDown, Minus,
    Calendar, BookOpen, Award, Filter, ChevronDown,
    Search, LayoutDashboard, FileText, Sparkles, ArrowRight
} from "lucide-react"
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid,
    Tooltip, ResponsiveContainer, BarChart, Bar, Cell
} from "recharts"
import { CollapsibleGradeTable } from "@/components/dashboards/student/collapsible-grade-table"
import { GradeDetailModal } from "@/components/dashboards/student/grade-detail-modal"
import { Button } from "@/components/ui/button"

export default function StudentGrades() {
    const [selectedGrade, setSelectedGrade] = useState("12")
    const [selectedSemester, setSelectedSemester] = useState<1 | 2>(1)
    const [selectedCourseId, setSelectedCourseId] = useState<number | null>(null)

    const [submissions, setSubmissions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        loadSubmissions()
    }, [])

    const loadSubmissions = async () => {
        try {
            setLoading(true)
            const res = await assessmentApi.getSubmissions()
            setSubmissions(res.data || [])
        } catch (error) {
            console.error("Failed to load submissions:", error)
        } finally {
            setLoading(false)
        }
    }

    // Filter data based on selected tabs
    const filteredGrades = useMemo(() => {
        return submissions.filter(s => {
            const assessment = s.assessment || {}
            return (assessment.grade || "12") === selectedGrade &&
                   (assessment.semester || 1) === selectedSemester
        })
    }, [submissions, selectedGrade, selectedSemester])

    const averageGPA = useMemo(() => {
        if (filteredGrades.length === 0) return 0
        const sum = filteredGrades.reduce((acc, curr) => acc + curr.percentage, 0)
        return (sum / filteredGrades.length / 25).toFixed(2) // Rough 4.0 scale conversion
    }, [filteredGrades])

    const performanceData = useMemo(() => {
        return filteredGrades.map(g => ({
            name: g.code.split('-')[0],
            score: g.percentage,
            fullMark: 100
        }))
    }, [filteredGrades])

    const selectedCourse = useMemo(() =>
        allGradesData.find(g => g.courseId === selectedCourseId),
        [selectedCourseId])

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Performance Analytics</span>
                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase italic">
                            Academic <span className='text-sky-600'>Records</span>
                        </h1>
                        <p className="text-slate-400 text-[11px] font-black uppercase tracking-widest max-w-md opacity-70">
                            Comprehensive overview of your grades, credits, and historical performance trends.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1">
                            {["9", "10", "11", "12"].map((grade) => (
                                <button
                                    key={grade}
                                    onClick={() => setSelectedGrade(grade)}
                                    className={cn(
                                        "h-12 px-8 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                        selectedGrade === grade
                                            ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Grade {grade}
                                </button>
                            ))}
                        </div>

                        <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1">
                            {[1, 2].map((sem) => (
                                <button
                                    key={sem}
                                    onClick={() => setSelectedSemester(sem as 1 | 2)}
                                    className={cn(
                                        "h-12 px-8 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500",
                                        selectedSemester === sem
                                            ? "bg-white text-indigo-600 shadow-xl shadow-indigo-500/10 border border-indigo-100"
                                            : "text-slate-400 hover:text-slate-600"
                                    )}
                                >
                                    Semester {sem}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="p-6 bg-white rounded-[32px] text-slate-900 flex items-center gap-6 shadow-xl border border-slate-100 min-w-[240px]">
                        <div className="w-14 h-14 rounded-2xl bg-indigo-50 flex items-center justify-center border border-indigo-100">
                            <GraduationCap className="w-8 h-8 text-indigo-500" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-1">Average GPA</p>
                            <p className="text-3xl font-black text-slate-900">{averageGPA || "0.00"}</p>
                        </div>
                    </div>
                </div>

            </div>

            {/* Performance Visualization */}
            {performanceData.length > 0 && (
                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 p-10 rounded-[56px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 relative overflow-hidden group">
                        <div className="flex items-center justify-between mb-10">
                            <div>
                                <h3 className="text-xl font-black text-slate-900 uppercase tracking-tight">Grade Spectrum</h3>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Full Academic Year Distribution</p>
                            </div>
                            <div className="flex items-center gap-3">
                                <span className="w-3 h-3 rounded-full bg-indigo-500" />
                                <span className="text-[10px] font-black uppercase text-slate-400">Current Score</span>
                            </div>
                        </div>
                        <div className="h-[300px] w-full">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={performanceData}>
                                    <defs>
                                        <linearGradient id="scoreGradient" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.3} />
                                            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis
                                        dataKey="name"
                                        axisLine={false}
                                        tickLine={false}
                                        tick={{ fontSize: 10, fontWeight: 900, fill: '#64748b' }}
                                        dy={10}
                                    />
                                    <YAxis hide domain={[0, 100]} />
                                    <Tooltip
                                        contentStyle={{
                                            borderRadius: '24px',
                                            border: 'none',
                                            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.1)',
                                            padding: '16px'
                                        }}
                                        itemStyle={{ fontWeight: 900, fontSize: '12px', color: '#6366f1' }}
                                    />
                                    <Area
                                        type="monotone"
                                        dataKey="score"
                                        stroke="#6366f1"
                                        strokeWidth={4}
                                        fillOpacity={1}
                                        fill="url(#scoreGradient)"
                                    />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </div>

                    <div className="p-10 rounded-[56px] bg-white text-slate-900 shadow-2xl shadow-slate-200/20 border border-slate-100 relative overflow-hidden group">
                        <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-50 blur-3xl rounded-full group-hover:scale-150 transition-transform duration-1000 opacity-50" />
                        <h3 className="text-xl font-black uppercase tracking-tight mb-8">Quick Stats</h3>
                        <div className="space-y-8">
                            <div>
                                <p className="text-[10px] font-black uppercase tracking-widest text-slate-400 mb-2">Subject Credits</p>
                                <div className="flex items-end gap-3">
                                    <p className="text-5xl font-black text-slate-900">24</p>
                                    <span className="text-[10px] font-bold text-slate-400 mb-1.5 uppercase tracking-widest">/ 32 Required</span>
                                </div>
                            </div>
                            <div className="flex gap-4">
                                <div className="flex-1 p-5 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:border-indigo-100 hover:bg-white group/card">
                                    <TrendingUp className="w-5 h-5 text-sky-500 mb-2" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Highest</p>
                                    <p className="text-lg font-black text-slate-900">{Math.max(...performanceData.map(d => d.score), 0)}%</p>
                                </div>
                                <div className="flex-1 p-5 rounded-3xl bg-slate-50 border border-slate-100 transition-all hover:border-indigo-100 hover:bg-white group/card">
                                    <BookOpen className="w-5 h-5 text-indigo-500 mb-2" />
                                    <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Courses</p>
                                    <p className="text-lg font-black text-slate-900">{performanceData.length}</p>
                                </div>
                            </div>
                        </div>
                    </div>

                </div>
            )}

            {/* Detailed Grade Tables */}
            <div className="space-y-12">
                {filteredGrades.length > 0 ? (
                    <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 bg-white p-10 rounded-[48px] border border-slate-100 shadow-xl">
                        <div className="flex items-center gap-4 mb-8">
                            <div className="w-12 h-1.5 bg-sky-500 rounded-full" />
                            <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">
                                Semester {selectedSemester} <span className="text-slate-300 mx-2">/</span> Grade {selectedGrade}
                            </h2>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                            {filteredGrades.map((submission) => (
                                <div key={submission._id} className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 hover:bg-white hover:border-sky-100 transition-all group">
                                    <div className="flex justify-between items-start mb-6">
                                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center shadow-sm border border-slate-50 group-hover:scale-110 transition-transform">
                                            <Award className="w-6 h-6 text-sky-500" />
                                        </div>
                                        <Badge className={cn(
                                            "font-black uppercase tracking-widest text-[8px] px-3 py-1 rounded-full",
                                            submission.passed ? "bg-emerald-50 text-emerald-600 border-emerald-100" : "bg-rose-50 text-rose-600 border-rose-100"
                                        )}>
                                            {submission.passed ? "Passed" : "Action Required"}
                                        </Badge>
                                    </div>
                                    <h3 className="text-lg font-black text-slate-900 uppercase italic leading-tight mb-2">{submission.assessment?.title}</h3>
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-6">{submission.assessment?.type}</p>
                                    
                                    <div className="flex items-end justify-between">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Performance</p>
                                            <p className="text-3xl font-black text-slate-900">{submission.percentage}%</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Score</p>
                                            <p className="text-sm font-bold text-slate-600">{submission.score} / {submission.assessment?.totalMarks}</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                ) : (
                    <div className="py-32 bg-white border border-dashed border-slate-100 rounded-[64px] shadow-sm text-center">
                        <div className="w-24 h-24 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100 shadow-inner">
                            <FileText className="w-10 h-10 text-slate-200" />
                        </div>
                        <h3 className="text-2xl font-black text-slate-900 uppercase tracking-[0.2em] italic">No Records Found</h3>
                        <p className="text-slate-400 font-bold text-[10px] uppercase tracking-widest max-w-sm mx-auto mt-4 leading-relaxed">
                            We couldn't find any official academic records for the selected Grade {selectedGrade} and Semester {selectedSemester}.
                        </p>
                    </div>
                )}
            </div>

            {/* Modal for detail view */}
            {selectedCourse && (
                <GradeDetailModal
                    course={selectedCourse}
                    isOpen={!!selectedCourseId}
                    onOpenChange={(open) => !open && setSelectedCourseId(null)}
                />
            )}
        </div>
    )
}
