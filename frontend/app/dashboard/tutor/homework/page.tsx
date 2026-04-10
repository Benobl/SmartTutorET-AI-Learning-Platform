"use client"

import { useState } from "react"
import {
    ClipboardList, Plus, Search, Filter,
    Clock, CheckCircle2, AlertCircle, FileText,
    ArrowUpRight, MessageSquare, GraduationCap,
    Users, Calendar, Sparkles, ChevronRight,
    Star, Timer, Send
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

const MOCK_ASSIGNMENTS = [
    {
        id: "a1",
        title: "Wave-Particle Duality Derivation",
        course: "Quantum Mechanics Intro",
        grade: "12",
        submissions: 42,
        total: 45,
        graded: 28,
        due: "Tomorrow, 23:59",
        priority: "high",
        status: "active"
    },
    {
        id: "a2",
        title: "Projectile Motion Worksheet",
        course: "Kinematics & Dynamics",
        grade: "11",
        submissions: 52,
        total: 52,
        graded: 52,
        due: "Completed",
        priority: "low",
        status: "completed"
    },
    {
        id: "a3",
        title: "Hydraulic Systems Lab Report",
        course: "Fluid Mechanics",
        grade: "10",
        submissions: 14,
        total: 38,
        graded: 0,
        due: "In 3 days",
        priority: "medium",
        status: "active"
    }
]

export default function TeacherHomework() {
    const { toast } = useToast()
    const [activeFilter, setActiveFilter] = useState<"all" | "active" | "completed">("all")

    const handleAssign = () => {
        toast({
            title: "Homework Assigned",
            description: "Students will be notified via their dashboard.",
        })
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Workflow Manager</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Grading <span className='text-sky-600'>Hub</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Review submissions, provide qualitative feedback, and manage academic deadlines for your assigned grade levels.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button onClick={handleAssign} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <Plus className="w-4 h-4 text-sky-400" /> Assign New Task
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <Timer className="w-4 h-4 mr-2" /> Bulk Grading Mode
                        </Button>
                    </div>
                </div>

                <div className="bg-slate-100/80 backdrop-blur-md p-1.5 rounded-[28px] border border-slate-200/50 shadow-inner flex gap-1 w-fit">
                    {[
                        { id: 'all', label: 'All Tasks', icon: ClipboardList },
                        { id: 'active', label: 'Active', icon: Timer },
                        { id: 'completed', label: 'Graded', icon: CheckCircle2 },
                    ].map((t) => (
                        <button
                            key={t.id}
                            onClick={() => setActiveFilter(t.id as any)}
                            className={cn(
                                "h-12 px-8 rounded-[22px] text-[10px] font-black uppercase tracking-widest transition-all duration-500 flex items-center gap-2.5",
                                activeFilter === t.id
                                    ? "bg-white text-sky-600 shadow-xl shadow-sky-500/10 border border-sky-100"
                                    : "text-slate-400 hover:text-slate-600"
                            )}
                        >
                            <t.icon className="w-4 h-4" />
                            {t.label}
                        </button>
                    ))}
                </div>
            </div>

            {/* Assignments Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-2 gap-10">
                {MOCK_ASSIGNMENTS.filter(a => activeFilter === 'all' || a.status === activeFilter).map((assignment) => (
                    <div
                        key={assignment.id}
                        className="group p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl hover:-translate-y-1.5 transition-all duration-700 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <span className={cn(
                                "px-4 py-2 rounded-xl text-[9px] font-black uppercase tracking-[0.15em] border",
                                assignment.priority === 'high' ? "bg-rose-50 text-rose-600 border-rose-100" :
                                    assignment.priority === 'medium' ? "bg-sky-50 text-sky-600 border-sky-100" :
                                        "bg-slate-50 text-slate-500 border-slate-100"
                            )}>
                                {assignment.priority} Priority
                            </span>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-6">
                                <div className="w-16 h-16 rounded-[24px] bg-sky-50 text-sky-600 flex items-center justify-center border border-sky-100 group-hover:scale-110 transition-transform shadow-sm">
                                    <FileText className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight mb-2 group-hover:text-sky-600 transition-colors uppercase italic">{assignment.title}</h3>
                                    <div className="flex items-center gap-3">
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{assignment.course}</span>
                                        <span className="w-1 h-1 rounded-full bg-slate-200" />
                                        <span className="text-[10px] font-bold text-slate-400">Grade {assignment.grade}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-6">
                                <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Submissions</p>
                                    <p className="text-xl font-black text-slate-900">{assignment.submissions}<span className="text-xs text-slate-400">/{assignment.total}</span></p>
                                </div>
                                <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Graded</p>
                                    <p className="text-xl font-black text-sky-600">{assignment.graded}</p>
                                </div>
                                <div className="p-6 rounded-[28px] bg-slate-50 border border-slate-100">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Deadline</p>
                                    <p className={cn("text-xs font-black uppercase tracking-tight truncate", assignment.due === 'Completed' ? "text-sky-500" : "text-rose-500")}>
                                        {assignment.due}
                                    </p>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Grading Progress</span>
                                    <span>{Math.round((assignment.graded / assignment.submissions) * 100 || 0)}%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div
                                        className="h-full bg-sky-500 rounded-full transition-all duration-1000"
                                        style={{ width: `${(assignment.graded / assignment.submissions) * 100 || 0}%` }}
                                    />
                                </div>
                            </div>

                            <div className="pt-6 flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3, 4].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center shadow-sm text-slate-400">
                                            <Users className="w-5 h-5" />
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white text-[10px] font-black flex items-center justify-center border-2 border-white">
                                        +38
                                    </div>
                                </div>

                                <Button className="h-14 px-10 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-3 shadow-xl hover:scale-105 transition-all">
                                    Open Grading Panel <ChevronRight className="w-4 h-4 text-sky-400" />
                                </Button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -right-10 -bottom-10 w-40 h-40 bg-sky-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}
            </div>

            {/* AI Assistant Insight */}
            <div className="bg-sky-600 rounded-[64px] p-12 lg:p-20 relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-3xl rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[2000ms]" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-6">Automated Grading Assistant</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none tracking-tight uppercase italic">Smart<span className="text-sky-200">Review</span> Engine</h2>
                        </div>
                        <p className="text-sky-100 text-lg font-medium leading-relaxed">
                            Let our AI handle the first-pass grading. It can scan PDFs, analyze derivations, and suggest scores with 94% accuracy aligned with the ET National Exam standards.
                        </p>
                        <div className="flex items-center gap-4 pt-4">
                            <Button className="h-16 px-10 rounded-2xl bg-white text-sky-600 font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all">
                                Activate AI Reviewer
                            </Button>
                            <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                                Learn More
                            </Button>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-square rounded-[64px] bg-white shadow-2xl p-10 relative overflow-hidden flex flex-col justify-center gap-10">
                            <div className="flex items-center gap-5">
                                <div className="w-14 h-14 rounded-2xl bg-sky-50 flex items-center justify-center">
                                    <Sparkles className="w-7 h-7 text-sky-500" />
                                </div>
                                <div className="h-3 flex-1 bg-slate-100 rounded-full" />
                            </div>
                            <div className="space-y-4">
                                <div className="h-3 w-4/5 bg-slate-100 rounded-full" />
                                <div className="h-3 w-full bg-slate-100 rounded-full" />
                                <div className="h-3 w-3/5 bg-slate-100 rounded-full" />
                            </div>
                            <div className="pt-10 flex justify-end">
                                <div className="w-20 h-20 rounded-[32px] bg-slate-900 flex items-center justify-center font-black text-2xl text-white">92</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
