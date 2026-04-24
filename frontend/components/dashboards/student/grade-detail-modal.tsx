"use client"

import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Progress } from "@/components/ui/progress"
import { cn } from "@/lib/utils"
import { Calendar, FileText, Target, Award, Clock } from "lucide-react"

interface GradeDetailModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
    course: any
}

export function GradeDetailModal({ isOpen, onOpenChange, course }: GradeDetailModalProps) {
    if (!course) return null

    const gradeColor = (pct: number) => {
        if (pct >= 90) return "text-emerald-500"
        if (pct >= 80) return "text-sky-500"
        if (pct >= 70) return "text-amber-500"
        return "text-red-500"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl bg-white/95 backdrop-blur-2xl border-slate-200 rounded-[32px] p-0 overflow-hidden shadow-2xl">
                <DialogHeader className="p-8 pb-4 bg-gradient-to-br from-slate-50 to-white border-b border-slate-100">
                    <div className="flex items-center gap-4 mb-4">
                        <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center text-white shadow-lg shadow-sky-500/20">
                            <FileText className="w-6 h-6" />
                        </div>
                        <div>
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none">
                                {course.courseName}
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium mt-1">
                                {course.code} • {course.tutor} • Semester {course.semester}
                            </DialogDescription>
                        </div>
                    </div>

                    <div className="grid grid-cols-3 gap-4 mt-6">
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-sm font-black text-slate-800 uppercase tracking-tight">Grades Finalized</span>
                            </div>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Percentage</p>
                            <span className={cn("text-xl font-black", gradeColor(course.percentage))}>{course.percentage}%</span>
                        </div>
                        <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Letter Grade</p>
                            <span className={cn("text-xl font-black", gradeColor(course.percentage))}>{course.letterGrade}</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="p-8 space-y-6 max-h-[60vh] overflow-y-auto custom-scrollbar">
                    <div className="space-y-4">
                        <div className="flex items-center justify-between px-1">
                            <h4 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Detailed Assessments</h4>
                            <span className="text-[10px] font-bold text-slate-400">Sort by: Date</span>
                        </div>

                        <div className="space-y-3">
                            {course.assessments.map((a: any, i: number) => (
                                <div key={i} className="group p-5 rounded-3xl bg-slate-50/50 hover:bg-white border border-slate-100/50 hover:border-sky-200 transition-all duration-300 shadow-sm hover:shadow-xl relative overflow-hidden">
                                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />

                                    <div className="flex items-center justify-between relative z-10">
                                        <div className="flex items-center gap-4">
                                            <div className={cn(
                                                "w-10 h-10 rounded-xl flex items-center justify-center transition-all duration-500 group-hover:scale-110",
                                                a.score >= 90 ? "bg-emerald-50 text-emerald-500 border border-emerald-100" :
                                                    a.score >= 80 ? "bg-sky-50 text-sky-500 border border-sky-100" :
                                                        "bg-amber-50 text-amber-500 border border-amber-100"
                                            )}>
                                                {a.name.toLowerCase().includes('midterm') || a.name.toLowerCase().includes('final') ?
                                                    <Award className="w-5 h-5" /> : <Clock className="w-5 h-5" />}
                                            </div>
                                            <div>
                                                <p className="text-sm font-black text-slate-900 group-hover:text-sky-600 transition-colors">{a.name}</p>
                                                <div className="flex items-center gap-2 mt-0.5">
                                                    <Calendar className="w-3 h-3 text-slate-400" />
                                                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{a.date}</span>
                                                    <span className="text-[10px] font-black text-sky-600/60 uppercase tracking-widest ml-1">{a.weight}% Weight</span>
                                                </div>
                                            </div>
                                        </div>

                                        <div className="text-right">
                                            <div className="flex items-baseline gap-1">
                                                <span className={cn("text-xl font-black", gradeColor(a.score))}>{a.score}</span>
                                                <span className="text-xs font-bold text-slate-400">/{a.total}</span>
                                            </div>
                                            <div className="mt-1 flex justify-end">
                                                <div className="w-24 h-1.5 bg-slate-200 rounded-full overflow-hidden p-0.5 border border-white">
                                                    <div
                                                        className={cn("h-full rounded-full transition-all duration-1000",
                                                            a.score >= 90 ? "bg-emerald-500" : a.score >= 80 ? "bg-sky-500" : "bg-amber-500")}
                                                        style={{ width: `${(a.score / a.total) * 100}%` }}
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="p-6 rounded-[24px] bg-gradient-to-br from-indigo-50/50 to-sky-50/50 border border-sky-100 relative overflow-hidden group">
                        <div className="absolute -right-8 -bottom-8 w-24 h-24 bg-sky-500/10 blur-3xl rounded-full" />
                        <div className="flex items-center gap-3 mb-2">
                            <Target className="w-4 h-4 text-sky-600" />
                            <h5 className="text-[11px] font-black text-slate-800 uppercase tracking-widest">Tutor Observation</h5>
                        </div>
                        <p className="text-sm text-slate-600 leading-relaxed font-medium">
                            Sarah shows strong conceptual understanding and excellence in practical assessments. Consistent participation has positively impacted her weighted aggregate.
                        </p>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
