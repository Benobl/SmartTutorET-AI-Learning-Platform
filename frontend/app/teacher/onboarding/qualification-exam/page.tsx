"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Brain, Timer, CheckCircle2, AlertCircle,
    ArrowRight, Trophy, Sparkles, LayoutPanelLeft,
    MonitorPlay, BookOpenCheck
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

const MOCK_QUESTIONS = [
    {
        id: 1,
        question: "How would you explain the concept of Quantum Entanglement to a Grade 12 student?",
        options: [
            "Using advanced mathematical tensors only",
            "Analogies with coin flips and correlated states",
            "Telling them it's impossible to understand",
            "Focusing purely on the history of Einstein"
        ]
    },
    {
        id: 2,
        question: "In the Ethiopian Grade 11 Physics curriculum, what is the primary focus of the Mechanics unit?",
        options: [
            "Advanced Relativity",
            "Newtonian Mechanics and Fluid Dynamics",
            "Quantum Field Theory",
            "Basic Arithmetic"
        ]
    },
    {
        id: 3,
        question: "Which approach best handles a student struggling with abstract derivation?",
        options: [
            "Providing a visual simulation first",
            "Increasing the homework volume",
            "Advising them to switch subjects",
            "Ignoring the derivation and focusing on results"
        ]
    }
]

export default function QualificationExam() {
    const router = useRouter()
    const { toast } = useToast()
    const [currentStep, setCurrentStep] = useState(0)
    const [answers, setAnswers] = useState<Record<number, number>>({})
    const [isEvaluating, setIsEvaluating] = useState(false)
    const [timeLeft, setLeft] = useState(300) // 5 minutes

    useEffect(() => {
        if (timeLeft <= 0) return
        const timer = setInterval(() => setLeft(prev => prev - 1), 1000)
        return () => clearInterval(timer)
    }, [timeLeft])

    const handleSelect = (optionIndex: number) => {
        setAnswers({ ...answers, [MOCK_QUESTIONS[currentStep].id]: optionIndex })
    }

    const nextStep = () => {
        if (currentStep < MOCK_QUESTIONS.length - 1) {
            setCurrentStep(currentStep + 1)
        } else {
            setIsEvaluating(true)
            setTimeout(() => {
                setIsEvaluating(false)
                toast({
                    title: "Exam Completed",
                    description: "AI evaluation successful. Score: 92/100",
                })
                router.push("/teacher/onboarding/status")
            }, 3000)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (isEvaluating) {
        return (
            <div className="min-h-screen bg-white flex flex-col items-center justify-center p-12 overflow-hidden shadow-sm">
                <div className="relative mb-12">
                    <div className="w-32 h-32 rounded-[40px] bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-bounce">
                        <Brain className="w-12 h-12 text-indigo-500" />
                    </div>
                    <div className="absolute top-0 right-0 w-8 h-8 rounded-full bg-white border border-indigo-100 flex items-center justify-center animate-pulse">
                        <Sparkles className="w-4 h-4 text-indigo-400" />
                    </div>
                </div>
                <div className="text-center space-y-4 max-w-md">
                    <h2 className="text-4xl font-black text-slate-900 uppercase tracking-tighter">AI Evaluation <span className="text-indigo-500">Active</span></h2>
                    <p className="text-slate-400 font-bold text-xs uppercase tracking-widest leading-loose">
                        SmartTutorET AI is analyzing your pedagogical logic and subject knowledge against the Ethiopian National Curriculum standards...
                    </p>
                </div>
                <div className="w-full max-w-sm mt-12">
                    <Progress value={66} className="h-2 rounded-full bg-slate-100" />
                </div>
            </div>
        )
    }

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-12">
            <div className="max-w-4xl mx-auto space-y-10">
                {/* Exam Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-10">
                    <div>
                        <div className="flex items-center gap-2 mb-4">
                            <span className="px-3 py-1 rounded-full bg-white text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100 shadow-sm">Qualification Milestone</span>
                            <BookOpenCheck className="w-4 h-4 text-indigo-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none uppercase">
                            Hiring <span className="text-indigo-500">Excellence</span> Exam
                        </h1>
                    </div>

                    <div className="flex items-center gap-6">
                        <div className="text-right">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1.5">Time Remaining</p>
                            <div className="flex items-center gap-2.5 text-2xl font-black text-slate-900">
                                <Timer className="w-6 h-6 text-indigo-500" />
                                {formatTime(timeLeft)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Progress Tracking */}
                <div className="grid grid-cols-3 gap-2">
                    {MOCK_QUESTIONS.map((_, i) => (
                        <div
                            key={i}
                            className={cn(
                                "h-2 rounded-full transition-all duration-500",
                                i === currentStep ? "bg-indigo-500 w-full" :
                                    i < currentStep ? "bg-indigo-200" : "bg-white border border-slate-100"
                            )}
                        />
                    ))}
                </div>

                {/* Question Card */}
                <div className="bg-white rounded-[48px] border border-slate-100 p-10 lg:p-16 shadow-2xl shadow-indigo-500/5 relative overflow-hidden">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-50/30 blur-3xl rounded-full -mr-32 -mt-32" />

                    <div className="relative z-10 space-y-12">
                        <div className="space-y-4">
                            <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest">Question {currentStep + 1} of {MOCK_QUESTIONS.length}</span>
                            <h2 className="text-2xl lg:text-3xl font-black text-slate-900 leading-[1.2]">
                                {MOCK_QUESTIONS[currentStep].question}
                            </h2>
                        </div>

                        <div className="grid grid-cols-1 gap-4">
                            {MOCK_QUESTIONS[currentStep].options.map((option, idx) => (
                                <button
                                    key={idx}
                                    onClick={() => handleSelect(idx)}
                                    className={cn(
                                        "w-full p-8 rounded-[32px] text-left transition-all relative overflow-hidden border font-black text-sm",
                                        answers[MOCK_QUESTIONS[currentStep].id] === idx
                                            ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                            : "bg-slate-50 border-slate-100 text-slate-600 hover:border-indigo-200 hover:bg-indigo-50/50"
                                    )}
                                >
                                    <div className="flex items-center justify-between">
                                        <span>{option}</span>
                                        {answers[MOCK_QUESTIONS[currentStep].id] === idx && (
                                            <CheckCircle2 className="w-5 h-5 text-white" />
                                        )}
                                    </div>
                                </button>
                            ))}
                        </div>

                        <div className="pt-6 flex justify-between items-center border-t border-slate-50">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <AlertCircle className="w-3.5 h-3.5" /> Select one best answer
                            </p>
                            <Button
                                onClick={nextStep}
                                disabled={answers[MOCK_QUESTIONS[currentStep].id] === undefined}
                                className="h-16 px-10 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 group"
                            >
                                {currentStep === MOCK_QUESTIONS.length - 1 ? "Submit Exam" : "Next Question"}
                                <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1.5 transition-transform" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Decorative Footer */}
                <div className="flex items-center justify-center gap-10 opacity-30">
                    <div className="flex items-center gap-2">
                        <MonitorPlay className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Proctored Session</span>
                    </div>
                    <div className="flex items-center gap-2">
                        <LayoutPanelLeft className="w-4 h-4" />
                        <span className="text-[10px] font-black uppercase tracking-widest">Teacher Sandbox</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
