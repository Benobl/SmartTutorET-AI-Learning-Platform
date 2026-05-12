"use client"

import { useState, useEffect } from "react"
import { assessmentApi } from "@/lib/api"
import { 
    GraduationCap, Search, Filter, 
    Sparkles, FileText, Upload,
    ChevronRight, Brain, Clock,
    LayoutGrid, List
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import Link from "next/link"

export default function StudentQuizzesPage() {
    const [assessments, setAssessments] = useState<any[]>([])
    const [submissionByAssessment, setSubmissionByAssessment] = useState<Record<string, any>>({})
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [activeTab, setActiveTab] = useState("all") // all, ai, manual, uploaded

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                setLoading(true)
                const [res, subRes] = await Promise.all([
                    assessmentApi.getAll(),
                    assessmentApi.getSubmissions(),
                ])
                setAssessments(res.data || [])
                const map: Record<string, any> = {}
                ;(subRes.data || []).forEach((sub: any) => {
                    const assessmentId = String(sub?.assessment?._id || sub?.assessment || "")
                    if (!assessmentId) return
                    if (!map[assessmentId]) {
                        map[assessmentId] = sub
                        return
                    }
                    const oldTs = new Date(map[assessmentId]?.updatedAt || 0).getTime()
                    const newTs = new Date(sub?.updatedAt || 0).getTime()
                    if (newTs > oldTs) map[assessmentId] = sub
                })
                setSubmissionByAssessment(map)
            } catch (error) {
                console.error("Failed to load assessments:", error)
            } finally {
                setLoading(false)
            }
        }
        loadQuizzes()
    }, [])

    const filteredAssessments = assessments.filter(q => {
        const matchesSearch = q.title.toLowerCase().includes(searchQuery.toLowerCase()) || 
                             q.subject?.title?.toLowerCase().includes(searchQuery.toLowerCase())
        
        if (activeTab === "ai") return matchesSearch && (q.creationMethod === "ai" || q.title.toLowerCase().includes("ai"))
        if (activeTab === "manual") return matchesSearch && q.creationMethod !== "ai" && !q.title.toLowerCase().includes("ai")
        return matchesSearch
    })

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Header Section */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-8 rounded-[40px] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100/50">Assessment Hub</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tight leading-tight">
                        Academic <span className="text-sky-600">Quizzes</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm">Challenge yourself with curriculum-aligned tests.</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-hover:text-sky-500 transition-colors" />
                        <Input 
                            placeholder="Search topics..." 
                            className="h-14 pl-12 pr-6 w-full md:w-[300px] rounded-2xl bg-slate-50 border-transparent focus:bg-white focus:border-sky-200 transition-all font-bold"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* Filter Tabs */}
            <div className="flex flex-wrap items-center gap-2">
                {[
                    { id: "all", label: "All Tests", icon: LayoutGrid },
                    { id: "ai", label: "AI Generated", icon: Sparkles },
                    { id: "manual", label: "Tutor Written", icon: FileText },
                    { id: "uploaded", label: "Uploaded", icon: Upload }
                ].map((tab) => (
                    <Button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        variant={activeTab === tab.id ? "default" : "ghost"}
                        className={cn(
                            "h-12 px-6 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all",
                            activeTab === tab.id 
                                ? "bg-slate-900 text-white shadow-xl" 
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-100"
                        )}
                    >
                        <tab.icon className="w-3.5 h-3.5 mr-2" />
                        {tab.label}
                    </Button>
                ))}
            </div>

            {/* Quizzes Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-[300px] rounded-[48px] bg-slate-100 animate-pulse" />
                    ))}
                </div>
            ) : filteredAssessments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 pb-20">
                    {filteredAssessments.map((quiz) => {
                        const isAI = quiz.creationMethod === "ai" || quiz.title.toLowerCase().includes("ai")
                        const mySubmission = submissionByAssessment[String(quiz._id)]
                        return (
                            <Link 
                                key={quiz._id} 
                                href={`/dashboard/student/quizzes/${quiz._id}`}
                                className="group relative block"
                            >
                                <div className="h-full p-8 rounded-[48px] bg-white border border-slate-100 hover:border-sky-300 hover:shadow-3xl hover:-translate-y-2 transition-all duration-500 overflow-hidden">
                                    {/* Glass Decor */}
                                    <div className={cn(
                                        "absolute -right-10 -top-10 w-32 h-32 blur-3xl opacity-10 transition-all duration-700 group-hover:scale-150 group-hover:opacity-20",
                                        isAI ? "bg-sky-500" : "bg-indigo-500"
                                    )} />

                                    <div className="relative z-10 space-y-6">
                                        <div className="flex items-center justify-between">
                                            <div className={cn(
                                                "w-12 h-12 rounded-2xl flex items-center justify-center border transition-all duration-500 group-hover:rotate-12",
                                                isAI ? "bg-sky-50 text-sky-500 border-sky-100" : "bg-indigo-50 text-indigo-500 border-indigo-100"
                                            )}>
                                                {isAI ? <Sparkles className="w-6 h-6" /> : <FileText className="w-6 h-6" />}
                                            </div>
                                            <div className="px-3 py-1 rounded-full bg-slate-50 text-[8px] font-black uppercase tracking-widest text-slate-400 border border-slate-100">
                                                Grade {quiz.grade}
                                            </div>
                                        </div>

                                        <div className="space-y-2">
                                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">
                                                {quiz.subject?.title || "General Science"}
                                            </p>
                                            <h3 className="text-xl font-black text-slate-900 leading-tight line-clamp-2 italic">
                                                {quiz.title}
                                            </h3>
                                        </div>

                                        <div className="flex items-center gap-4 py-4 border-y border-slate-50">
                                            <div className="flex items-center gap-2">
                                                <Clock className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{quiz.duration || 20} Min</span>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Brain className="w-3.5 h-3.5 text-slate-300" />
                                                <span className="text-[10px] font-bold text-slate-400 uppercase">{quiz.totalMarks} Points</span>
                                            </div>
                                        </div>

                                        {mySubmission && (
                                            <div className="p-3 rounded-2xl bg-emerald-50 border border-emerald-100">
                                                <p className="text-[9px] font-black text-emerald-700 uppercase tracking-widest">
                                                    Result: {mySubmission.percentage}% {mySubmission.passed ? "Passed" : "Needs Improvement"}
                                                </p>
                                                {mySubmission?.result?.rank && mySubmission?.result?.totalEvaluated ? (
                                                    <p className="text-[9px] font-black text-indigo-600 uppercase tracking-widest mt-1">
                                                        Rank #{mySubmission.result.rank}/{mySubmission.result.totalEvaluated}
                                                    </p>
                                                ) : null}
                                            </div>
                                        )}

                                        <div className="flex items-center justify-between group/btn">
                                            <span className="text-[10px] font-black text-slate-900 uppercase tracking-widest group-hover/btn:text-sky-600 transition-colors">Start Assessment</span>
                                            <div className="w-10 h-10 rounded-full bg-slate-900 text-white flex items-center justify-center group-hover:bg-sky-600 group-hover:scale-110 transition-all shadow-lg">
                                                <ChevronRight className="w-5 h-5" />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </Link>
                        )
                    })}
                </div>
            ) : (
                <div className="py-40 text-center space-y-6 bg-white rounded-[64px] border border-dashed border-slate-200">
                    <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-4">
                        <GraduationCap className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-2xl font-black text-slate-900 uppercase italic">No quizzes found</h3>
                        <p className="text-slate-400 font-medium">Try adjusting your filters or search query.</p>
                    </div>
                    <Button 
                        onClick={() => {setSearchQuery(""); setActiveTab("all")}}
                        variant="outline" 
                        className="rounded-xl font-black text-[10px] uppercase tracking-widest"
                    >
                        Clear All Filters
                    </Button>
                </div>
            )}
        </div>
    )
}
