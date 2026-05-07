"use client"

import { useState, useEffect } from "react"
import { assessmentApi } from "@/lib/api"
import { 
    Brain, Clock, ChevronRight, 
    CheckCircle2, AlertCircle, ListChecks,
    Sparkles, Target
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import Link from "next/link"

export function AssessmentList() {
    const [assessments, setAssessments] = useState<any[]>([])
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const loadQuizzes = async () => {
            try {
                setLoading(true)
                const res = await assessmentApi.getAll()
                console.log("🔍 [STUDENT_QUIZZES] Loaded:", res.data?.length, "assessments");
                setAssessments(res.data || [])
            } catch (error) {
                console.error("Failed to load assessments:", error)
            } finally {
                setLoading(false)
            }
        }
        loadQuizzes()
    }, [])

    if (loading) {
        return (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {[1, 2].map(i => (
                    <div key={i} className="h-32 rounded-3xl bg-slate-50 animate-pulse" />
                ))}
            </div>
        )
    }

    if (assessments.length === 0) {
        return (
            <div className="p-8 rounded-[32px] bg-slate-50 border border-slate-100 text-center">
                <Target className="w-10 h-10 text-slate-300 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">No quizzes available for your grade yet</p>
            </div>
        )
    }

    return (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {assessments.slice(0, 4).map((quiz) => (
                <Link 
                    key={quiz._id} 
                    href={`/dashboard/student/quizzes/${quiz._id}`}
                    className="group flex items-center gap-5 p-5 rounded-[32px] bg-white border border-slate-100 hover:border-sky-300 hover:shadow-2xl transition-all duration-500 relative overflow-hidden"
                >
                    <div className="absolute top-0 right-0 p-4">
                        {quiz.creationMethod === 'ai' && <Sparkles className="w-4 h-4 text-sky-400" />}
                    </div>

                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                        <ListChecks className="w-6 h-6" />
                    </div>

                    <div className="flex-1 min-w-0">
                        <h4 className="text-sm font-black text-slate-900 truncate uppercase tracking-tight group-hover:text-sky-600 transition-colors">
                            {quiz.title}
                        </h4>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                            {quiz.subject?.title || "General"} • {quiz.questions?.length} Questions
                        </p>
                    </div>

                    <div className="shrink-0 flex items-center gap-2">
                         <Button variant="ghost" size="icon" className="rounded-xl group-hover:bg-sky-50 group-hover:text-sky-600">
                            <ChevronRight className="w-4 h-4" />
                         </Button>
                    </div>
                </Link>
            ))}
        </div>
    )
}
