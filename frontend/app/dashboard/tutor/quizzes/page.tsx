"use client"

import { useState } from "react"
import {
    Brain, Plus, Search, Sparkles, LayoutGrid,
    CheckCircle2, AlertCircle, Clock, Timer,
    GraduationCap, BookOpen, Users, BarChart3,
    ArrowUpRight, ChevronRight, ListChecks,
    History, PenTool, Activity, Send, Filter
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"
import {
    Dialog, DialogContent, DialogHeader,
    DialogTitle, DialogTrigger, DialogFooter
} from "@/components/ui/dialog"

const MOCK_QUIZZES = [
    { id: "q1", title: "Intro to Particles", type: "AI-Generated", course: "Physics G12", questions: 10, completed: 42, avgScore: "84%", status: "active" },
    { id: "q2", title: "Mid-Term Mock Test", type: "Teacher-Made", course: "Math G11", questions: 30, completed: 52, avgScore: "72%", status: "active" },
    { id: "q3", title: "Biology Unit 1 Quiz", type: "Teacher-Made", course: "Biology G10", questions: 15, completed: 38, avgScore: "91%", status: "completed" },
]

export default function TeacherQuizzes() {
    const { toast } = useToast()
    const [isGenerating, setIsGenerating] = useState(false)
    const [activeTab, setActiveTab] = useState<"ai" | "manual">("ai")

    const handleGenerate = () => {
        setIsGenerating(true)
        setTimeout(() => {
            setIsGenerating(false)
            toast({
                title: "Quiz Generated Successfully",
                description: "15 questions have been added to your draft library.",
            })
        }, 2000)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Assessment Suite</span>
                            <Brain className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Quiz & <span className='text-sky-600'>Test Hub</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Create adaptive AI assessments or design custom curriculum-based tests for your students across Grades 9-12.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <Plus className="w-4 h-4 text-sky-400" /> Create Static Test
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <History className="w-4 h-4 mr-2" /> Recent Drafts
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Timer className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Avg Completion</p>
                            <h2 className="text-2xl font-black text-slate-900">22m</h2>
                        </div>
                    </div>
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                            <Users className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Attempts Today</p>
                            <h2 className="text-2xl font-black text-slate-900">142</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* AI Generator Panel */}
            <div className="p-10 lg:p-16 rounded-[64px] bg-sky-600 text-white relative overflow-hidden group">
                <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-white/10 blur-3xl rounded-full -mr-64 -mt-64 group-hover:scale-110 transition-transform duration-[3000ms]" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-widest mb-6">AI-Powered Question Engine</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none tracking-tight uppercase italic">Instant <span className="text-sky-200">Quiz</span> Generator</h2>
                        </div>
                        <p className="text-sky-100 text-lg font-medium leading-relaxed">
                            Describe your topic or paste lesson content. Our AI will automatically generate multiple-choice, short-answer, and essay questions tailored for your grade level.
                        </p>
                        <div className="space-y-4">
                            <textarea
                                placeholder="Topic: Ethiopian History - The Battle of Adwa... (Or Grade 12 Physics: Magnetism)"
                                className="w-full h-32 rounded-[28px] bg-white/10 border border-white/20 p-6 text-white placeholder:text-sky-300 font-medium outline-none focus:bg-white/20 focus:ring-4 focus:ring-white/5 transition-all"
                            />
                            <div className="flex items-center gap-4">
                                <Button
                                    onClick={handleGenerate}
                                    disabled={isGenerating}
                                    className="h-16 px-10 rounded-2xl bg-white text-sky-600 font-black text-xs uppercase tracking-widest shadow-2xl hover:scale-105 transition-all"
                                >
                                    {isGenerating ? "Analyzing Topic..." : "Generate 15 Questions"}
                                    {!isGenerating && <Sparkles className="ml-3 w-4 h-4" />}
                                </Button>
                                <Button variant="outline" className="h-16 px-10 rounded-2xl border-white/20 bg-white/10 text-white font-black text-xs uppercase tracking-widest hover:bg-white/20 transition-all">
                                    Advanced Settings
                                </Button>
                            </div>
                        </div>
                    </div>
                    <div className="flex justify-center">
                        <div className="w-full max-w-sm aspect-[4/5] rounded-[64px] bg-white shadow-2xl p-10 relative overflow-hidden flex flex-col gap-8">
                            <div className="flex items-center justify-between">
                                <span className="text-[10px] font-black text-sky-500 uppercase tracking-widest">Live Preview</span>
                                <Sparkles className="w-5 h-5 text-sky-400 group-hover:animate-pulse" />
                            </div>
                            <div className="space-y-6">
                                <div className="space-y-3">
                                    <div className="h-2 w-3/4 bg-slate-100 rounded-full" />
                                    <div className="h-2 w-full bg-slate-100 rounded-full" />
                                </div>
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="p-4 rounded-2xl border border-slate-100 bg-slate-50/50 flex items-center justify-between">
                                        <div className="h-2 w-1/2 bg-slate-200 rounded-full" />
                                        <div className="w-4 h-4 rounded-full border border-slate-300" />
                                    </div>
                                ))}
                            </div>
                            <div className="mt-auto pt-6 border-t border-slate-50 flex items-center justify-between">
                                <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Adaptive Difficulty</span>
                                <div className="flex gap-1">
                                    {[1, 2, 3, 4, 5].map(i => (
                                        <div key={i} className={cn("w-1.5 h-4 rounded-full", i <= 3 ? "bg-sky-500" : "bg-slate-100")} />
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Existing Quizzes Table */}
            <div className="space-y-8">
                <div className="flex items-center justify-between">
                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Previous Assessments</h3>
                    <div className="flex items-center gap-3">
                        <Button variant="outline" size="sm" className="rounded-xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            <Filter className="w-4 h-4 mr-2" /> Filter
                        </Button>
                    </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-8">
                    {MOCK_QUIZZES.map(quiz => (
                        <div key={quiz.id} className="group p-8 rounded-[48px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <span className={cn(
                                    "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                    quiz.status === 'active' ? "bg-sky-50 text-sky-500 border-sky-100" : "bg-slate-50 text-slate-400 border-slate-100"
                                )}>
                                    {quiz.status}
                                </span>
                            </div>

                            <div className="space-y-6 relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-14 h-14 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                        <ListChecks className="w-7 h-7" />
                                    </div>
                                    <div>
                                        <h4 className="text-lg font-black text-slate-900 leading-tight uppercase italic group-hover:text-sky-600 transition-colors">{quiz.title}</h4>
                                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{quiz.course} • {quiz.questions} Qs</p>
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <Users className="w-3.5 h-3.5 text-slate-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Completed</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{quiz.completed} Students</p>
                                    </div>
                                    <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                        <div className="flex items-center gap-2 mb-1.5">
                                            <BarChart3 className="w-3.5 h-3.5 text-sky-400" />
                                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Avg Result</span>
                                        </div>
                                        <p className="text-sm font-black text-slate-900">{quiz.avgScore}</p>
                                    </div>
                                </div>

                                <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                    <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest italic">{quiz.type}</span>
                                    <Button size="sm" className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:scale-105 transition-all">
                                        Analyze Data
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button className="h-full min-h-[300px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-sky-100 hover:shadow-xl transition-all">
                        <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-500 transition-all">
                            <Plus className="w-8 h-8" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-600 transition-all">New Assessment</p>
                    </button>
                </div>
            </div>

        </div>
    )
}
