"use client"

import { useState, useEffect } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Clock, Calendar, Sparkles, BookOpen, PenTool, CheckCircle } from "lucide-react"
import { aiApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"

interface StudySession {
    dayOfWeek: string
    startTime: string
    endTime: string
    title: string
    category: string
}

interface AIStudyPlannerModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday"]

export function AIStudyPlannerModal({ isOpen, onOpenChange }: AIStudyPlannerModalProps) {
    const user = getCurrentUser()
    const [loading, setLoading] = useState(true)
    const [schedule, setSchedule] = useState<StudySession[]>([])
    const [error, setError] = useState("")

    useEffect(() => {
        if (isOpen && schedule.length === 0) {
            generatePlan()
        }
    }, [isOpen])

    const generatePlan = async () => {
        setLoading(true)
        setError("")
        try {
            // Ask AI to generate plan based on standard high school subjects
            const res = await aiApi.generateStudyPlan({
                grade: user?.grade || "10",
                subjects: ["Mathematics", "Physics", "Chemistry", "Biology", "English", "Civics"]
            })
            if (res.success && Array.isArray(res.data)) {
                setSchedule(res.data)
            } else {
                setError("Failed to generate study plan.")
            }
        } catch (err) {
            console.error("Study Planner Error:", err)
            setError("Could not connect to AI Engine.")
        } finally {
            setLoading(false)
        }
    }

    const getCategoryIcon = (category: string) => {
        if (category.toLowerCase().includes("homework") || category.toLowerCase().includes("practice")) return <PenTool className="w-4 h-4" />
        if (category.toLowerCase().includes("review")) return <CheckCircle className="w-4 h-4" />
        return <BookOpen className="w-4 h-4" />
    }

    const getCategoryColor = (category: string) => {
        const cat = category.toLowerCase()
        if (cat.includes("homework")) return "bg-rose-100 text-rose-700"
        if (cat.includes("practice")) return "bg-sky-100 text-sky-700"
        if (cat.includes("review")) return "bg-emerald-100 text-emerald-700"
        return "bg-indigo-100 text-indigo-700"
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-4xl max-h-[85vh] bg-slate-50 rounded-[32px] p-0 overflow-hidden flex flex-col border border-slate-200">
                <DialogHeader className="p-8 border-b border-slate-200 bg-white shrink-0">
                    <div className="flex items-center gap-4">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center text-white shadow-lg shadow-indigo-500/20">
                            <Clock className="w-6 h-6" />
                        </div>
                        <div className="text-left">
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">
                                AI Weekly Study Planner
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium mt-1">
                                Your personalized, AI-optimized after-school study schedule
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                    {loading ? (
                        <div className="flex flex-col items-center justify-center h-64 space-y-4">
                            <div className="relative w-16 h-16 flex items-center justify-center">
                                <div className="absolute inset-0 border-4 border-indigo-100 rounded-full" />
                                <div className="absolute inset-0 border-4 border-indigo-500 rounded-full border-t-transparent animate-spin" />
                                <Sparkles className="w-6 h-6 text-indigo-500 animate-pulse" />
                            </div>
                            <p className="text-sm font-bold text-slate-400 uppercase tracking-widest animate-pulse">Generating your plan...</p>
                        </div>
                    ) : error ? (
                        <div className="text-center py-20 text-rose-500">
                            <p className="font-bold">{error}</p>
                            <button onClick={generatePlan} className="mt-4 text-sm underline hover:text-rose-700">Try Again</button>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                            {DAYS.map(day => {
                                const daySessions = schedule.filter(s => s.dayOfWeek === day).sort((a, b) => a.startTime.localeCompare(b.startTime))
                                return (
                                    <div key={day} className="flex flex-col gap-3">
                                        <div className="flex items-center justify-center py-3 bg-slate-900 rounded-2xl shadow-sm">
                                            <h4 className="text-[11px] font-black text-white uppercase tracking-widest">{day}</h4>
                                        </div>
                                        
                                        {daySessions.map((session, idx) => (
                                            <div key={idx} className="bg-white p-4 rounded-2xl border border-slate-200 shadow-sm hover:border-indigo-300 hover:shadow-md transition-all">
                                                <div className="text-[10px] font-bold text-slate-400 mb-2 flex items-center gap-1.5">
                                                    <Clock className="w-3 h-3" /> {session.startTime} - {session.endTime}
                                                </div>
                                                <h5 className="text-sm font-bold text-slate-900 mb-3">{session.title}</h5>
                                                <div className={"inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[9px] font-bold uppercase tracking-wider " + getCategoryColor(session.category)}>
                                                    {getCategoryIcon(session.category)}
                                                    {session.category}
                                                </div>
                                            </div>
                                        ))}

                                        {daySessions.length === 0 && (
                                            <div className="flex-1 border-2 border-dashed border-slate-200 rounded-2xl flex items-center justify-center p-6 min-h-[100px]">
                                                <p className="text-[10px] font-bold text-slate-300 uppercase tracking-widest text-center">Free Time</p>
                                            </div>
                                        )}
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    )
}
