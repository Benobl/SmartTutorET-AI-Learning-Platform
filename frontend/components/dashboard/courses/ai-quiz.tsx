"use client"

import { useState, useEffect, useRef } from "react"
import {
    BrainCircuit, Sparkles, CheckCircle2, AlertCircle,
    ArrowRight, Trophy, RefreshCcw, Loader2, Clock, Timer
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"
import { assessmentApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"

interface QuizQuestion {
    _id?: string
    id?: number
    question: string
    options: string[]
    correctAnswer: string | number
    explanation?: string
}

interface AIQuizProps {
    assessmentId?: string
    lessonTitle?: string
    questions?: QuizQuestion[] // Add direct questions support
    type?: "quiz" | "exam" | "practice"
    onComplete: (score: number) => void
}

export function AIQuiz({ assessmentId, lessonTitle, questions: initialQuestions, type = "quiz", onComplete }: AIQuizProps) {
    const { toast } = useToast()
    const [isLoading, setIsLoading] = useState(true)
    const [questions, setQuestions] = useState<QuizQuestion[]>([])
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<string | null>(null)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [answers, setAnswers] = useState<any[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)
    
    // Timer State
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useEffect(() => {
        loadAssessment()
        return () => {
            if (timerRef.current) clearInterval(timerRef.current)
        }
    }, [assessmentId])

    const loadAssessment = async () => {
        setIsLoading(true)
        try {
            if (assessmentId) {
                // Call Start API
                await assessmentApi.start(assessmentId).catch(err => {
                    if (err.message?.includes("already submitted")) {
                        // Handle already attempted
                        toast({ title: "Already Attempted", description: "You cannot take this assessment again.", variant: "destructive" })
                        onComplete(0)
                        return
                    }
                })

                const res = await assessmentApi.getById(assessmentId)
                const data = res.data || res
                setQuestions(data.questions || [])
                
                if (data.duration && type === "exam") {
                    setTimeLeft(data.duration * 60)
                    startTimer()
                }
            } else if (initialQuestions && initialQuestions.length > 0) {
                setQuestions(initialQuestions)
                setIsLoading(false)
            } else {
                // Fallback to mock/generate for simple lessons
                setTimeout(() => {
                    setQuestions([
                        {
                            question: "What is the primary objective of this lesson?",
                            options: ["To explain core foundations", "To solve practice set 1", "To review final summary", "To demo advanced UI"],
                            correctAnswer: "To explain core foundations"
                        }
                    ])
                    setIsLoading(false)
                }, 2000)
                return
            }
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" })
        } finally {
            setIsLoading(false)
        }
    }

    const startTimer = () => {
        timerRef.current = setInterval(() => {
            setTimeLeft(prev => {
                if (prev === null || prev <= 0) {
                    clearInterval(timerRef.current!)
                    handleAutoSubmit()
                    return 0
                }
                return prev - 1
            })
        }, 1000)
    }

    const handleAutoSubmit = () => {
        toast({ title: "Time's Up!", description: "Your exam is being submitted automatically.", variant: "destructive" })
        finishQuiz()
    }

    const handleOptionSelect = (option: string) => {
        if (selectedOption !== null) return
        setSelectedOption(option)

        const currentQ = questions[currentIndex]
        const isCorrect = option === currentQ.correctAnswer

        const newAnswers = [...answers]
        newAnswers[currentIndex] = {
            questionId: currentQ._id || currentQ.id,
            selectedAnswer: option
        }
        setAnswers(newAnswers)

        if (isCorrect) {
            setScore(prev => prev + 1)
        }
    }

    const nextQuestion = () => {
        if (currentIndex < questions.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setSelectedOption(null)
        } else {
            finishQuiz()
        }
    }

    const finishQuiz = async () => {
        if (isSubmitting) return
        setIsSubmitting(true)
        
        try {
            if (assessmentId) {
                const res = await assessmentApi.submit(assessmentId, { answers })
                const result = res.data || res
                setScore(result.score)
                setShowResult(true)
                onComplete(result.percentage)
            } else {
                setShowResult(true)
                onComplete((score / questions.length) * 100)
            }
        } catch (error: any) {
            toast({ title: "Submission Failed", description: error.message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    const formatTime = (seconds: number) => {
        const mins = Math.floor(seconds / 60)
        const secs = seconds % 60
        return `${mins}:${secs.toString().padStart(2, '0')}`
    }

    if (isLoading) {
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center space-y-8 animate-in fade-in duration-700 shadow-xl">
                <div className="relative mx-auto w-24 h-24">
                    <BrainCircuit className="w-24 h-24 text-sky-500 animate-pulse" />
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-bounce" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">Initializing Assessment...</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto uppercase tracking-widest">
                        {type === 'exam' ? 'Secure exam environment loading' : 'AI is curating your practice session'}
                    </p>
                </div>
            </div>
        )
    }

    if (showResult) {
        const percentage = Math.round((score / (questions.length || 1)) * 100)
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 p-10 text-center space-y-8 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="relative mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-amber-400" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Assessment Complete!</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your performance profile</p>
                </div>

                <div className="text-6xl font-black text-indigo-600">{percentage}%</div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                        <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1">Score</p>
                        <p className="text-xl font-black text-sky-700">{score} / {questions.length}</p>
                    </div>
                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Status</p>
                        <p className="text-xl font-black text-slate-700">{percentage >= 60 ? "PASSED" : "FAILED"}</p>
                    </div>
                </div>

                <Button
                    onClick={() => onComplete(percentage)}
                    className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                >
                    Return to Dashboard
                </Button>
            </div>
        )
    }

    const currentQ = questions[currentIndex]

    return (
        <div className="bg-white rounded-[48px] border border-slate-100 p-10 space-y-8 shadow-2xl relative overflow-hidden">
            {/* Timer Bar for Exams */}
            {timeLeft !== null && (
                <div className="absolute top-0 left-0 right-0 h-2 bg-slate-100">
                    <div
                        className={cn(
                            "h-full transition-all duration-1000",
                            timeLeft < 60 ? "bg-rose-500" : "bg-indigo-500"
                        )}
                        style={{ width: `${(timeLeft / (timeLeft + 10)) * 100}%` }} // Simplified visual
                    />
                </div>
            )}

            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-4 py-2 rounded-xl">
                    Question {currentIndex + 1} of {questions.length}
                </span>
                {timeLeft !== null && (
                    <div className={cn(
                        "flex items-center gap-2 px-4 py-2 rounded-xl font-black text-xs",
                        timeLeft < 60 ? "bg-rose-50 text-rose-600 animate-pulse" : "bg-slate-50 text-slate-600"
                    )}>
                        <Timer className="w-4 h-4" />
                        {formatTime(timeLeft)}
                    </div>
                )}
            </div>

            <h3 className="text-2xl font-black text-slate-900 leading-tight italic uppercase">
                {currentQ?.question}
            </h3>

            <div className="space-y-3">
                {currentQ?.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(option)}
                        disabled={selectedOption !== null}
                        className={cn(
                            "w-full p-6 rounded-[28px] text-left border-2 transition-all group flex items-start justify-between",
                            selectedOption === null
                                ? "border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50"
                                : option === currentQ.correctAnswer
                                    ? "bg-sky-50 border-sky-500 text-sky-700 shadow-lg shadow-sky-100"
                                    : selectedOption === option
                                        ? "bg-rose-50 border-rose-500 text-rose-700 shadow-lg shadow-rose-100"
                                        : "border-slate-50 opacity-40"
                        )}
                    >
                        <span className="text-sm font-bold">{option}</span>
                        {selectedOption !== null && option === currentQ.correctAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0" />
                        )}
                        {selectedOption === option && option !== currentQ.correctAnswer && (
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0" />
                        )}
                    </button>
                ))}
            </div>

            {selectedOption !== null && (
                <div className="pt-6 border-t border-slate-100 animate-in fade-in slide-in-from-bottom-2 duration-500 space-y-4">
                    {currentQ.explanation && (
                        <div className="p-6 rounded-3xl bg-amber-50/50 border border-amber-100">
                            <p className="text-[10px] font-black text-amber-700 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <Sparkles className="w-4 h-4" /> Smart Explanation
                            </p>
                            <p className="text-xs text-slate-600 font-medium leading-relaxed italic">"{currentQ.explanation}"</p>
                        </div>
                    )}
                    <Button
                        onClick={nextQuestion}
                        disabled={isSubmitting}
                        className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[11px] uppercase tracking-[0.2em] shadow-xl shadow-indigo-100 transition-all flex items-center justify-center gap-3"
                    >
                        {isSubmitting ? "Finalizing Submission..." : currentIndex === questions.length - 1 ? "Submit Assessment" : "Proceed to Next"} 
                        {!isSubmitting && <ArrowRight className="w-5 h-5" />}
                    </Button>
                </div>
            )}
        </div>
    )
}
