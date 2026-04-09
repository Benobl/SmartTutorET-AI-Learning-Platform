"use client"

import { useState } from "react"
import {
    Collapsible,
    CollapsibleContent,
    CollapsibleTrigger,
} from "@/components/ui/collapsible"
import { ChevronRight, Activity, GraduationCap, Award, BookOpen } from "lucide-react"
import { cn } from "@/lib/utils"
import { ModernDataTable } from "./modern-data-table"

interface CollapsibleGradeTableProps {
    title: string
    semester: number
    grades: any[]
    onViewDetails: (course: any) => void
    defaultOpen?: boolean
}

export function CollapsibleGradeTable({
    title,
    semester,
    grades,
    onViewDetails,
    defaultOpen = true,
}: CollapsibleGradeTableProps) {
    const [isOpen, setIsOpen] = useState(defaultOpen)

    if (grades.length === 0) return null

    const columns = [
        {
            header: "Course Name",
            accessorKey: "courseName",
            cell: (grade: any) => (
                <div className="flex items-center gap-4">
                    <div className={cn(
                        "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border shadow-sm transition-all group-hover/row:scale-110",
                        semester === 1 ? "bg-sky-50 text-sky-500 border-sky-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                    )}>
                        <BookOpen className="w-5 h-5" />
                    </div>
                    <div>
                        <p className="font-black text-slate-900 group-hover/row:text-sky-600 transition-colors uppercase tracking-tight text-sm">{grade.courseName}</p>
                        <div className="flex items-center gap-2 mt-0.5">
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{grade.code}</span>
                            <span className="text-[10px] font-medium text-slate-300">•</span>
                            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-tighter">{grade.tutor}</span>
                        </div>
                    </div>
                </div>
            )
        },
        {
            header: "Credits",
            accessorKey: "credits",
            className: "text-center",
            cell: (grade: any) => <span className="font-black text-slate-500">{grade.credits}</span>
        },
        {
            header: "Score",
            accessorKey: "percentage",
            className: "text-center",
            cell: (grade: any) => (
                <div className="flex flex-col items-center gap-1.5">
                    <span className={cn(
                        "font-black text-lg leading-none",
                        grade.percentage >= 90 ? "text-emerald-500" : grade.percentage >= 80 ? "text-sky-500" : "text-amber-500"
                    )}>{grade.percentage}%</span>
                    <div className="w-16 h-1.5 bg-slate-100 rounded-full overflow-hidden p-0.5 border border-white shrink-0">
                        <div
                            className={cn("h-full rounded-full transition-all duration-1000",
                                grade.percentage >= 90 ? "bg-emerald-500" : grade.percentage >= 80 ? "bg-sky-500" : "bg-amber-500")}
                            style={{ width: `${grade.percentage}%` }}
                        />
                    </div>
                </div>
            )
        },
        {
            header: "Grade",
            accessorKey: "letterGrade",
            className: "text-center",
            cell: (grade: any) => (
                <div className={cn(
                    "inline-flex items-center justify-center w-10 h-10 rounded-xl font-black text-sm border shadow-sm transition-all group-hover/row:scale-110",
                    grade.percentage >= 90 ? "bg-emerald-50 text-emerald-500 border-emerald-100" :
                        grade.percentage >= 80 ? "bg-sky-50 text-sky-500 border-sky-100" :
                            "bg-amber-50 text-amber-500 border-amber-100"
                )}>
                    {grade.letterGrade}
                </div>
            )
        }
    ]

    return (
        <Collapsible
            open={isOpen}
            onOpenChange={setIsOpen}
            className="w-full bg-white rounded-[48px] border border-slate-200 shadow-xl shadow-slate-200/20 overflow-hidden transition-all duration-500 group/collapsible"
        >
            <CollapsibleTrigger className="w-full p-10 flex items-center justify-between hover:bg-slate-50/50 transition-colors group">
                <div className="flex items-center gap-8">
                    <div className={cn(
                        "w-16 h-16 rounded-[24px] flex items-center justify-center transition-all duration-700 group-hover:scale-110 group-hover:rotate-6 shadow-xl",
                        semester === 1 ? "bg-sky-600 text-white shadow-sky-200" : "bg-indigo-600 text-white shadow-indigo-200"
                    )}>
                        <Activity className="w-8 h-8" />
                    </div>
                    <div className="text-left">
                        <h3 className="text-3xl font-black text-slate-900 tracking-tight leading-none mb-2">{title}</h3>
                        <div className="flex items-center gap-4">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Award className="w-3.5 h-3.5 text-amber-500" />
                                {grades.length} Courses Tracked
                            </span>
                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <GraduationCap className="w-3.5 h-3.5 text-sky-500" />
                                Verified Results
                            </span>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-10">
                    <div className="hidden md:flex flex-col items-end">
                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Average Performance</span>
                        <div className="flex items-baseline gap-1">
                            <span className="text-3xl font-black text-slate-900">
                                {Math.round(grades.reduce((s, g) => s + g.percentage, 0) / (grades.length || 1))}
                            </span>
                            <span className="text-sm font-black text-slate-400">%</span>
                        </div>
                    </div>
                    <div className={cn(
                        "w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center transition-all duration-500 border border-slate-100",
                        isOpen ? "rotate-90 bg-sky-50 text-sky-600 border-sky-100 shadow-lg shadow-sky-500/10" : "group-hover:translate-x-1"
                    )}>
                        <ChevronRight className="w-6 h-6" />
                    </div>
                </div>
            </CollapsibleTrigger>

            <CollapsibleContent className="animate-in slide-in-from-top-4 duration-500">
                <div className="px-10 pb-10">
                    <ModernDataTable
                        data={grades}
                        columns={columns}
                        onRowClick={onViewDetails}
                        searchPlaceholder="Filter subjects..."
                    />
                </div>
            </CollapsibleContent>
        </Collapsible>
    )
}
