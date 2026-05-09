"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import { assessmentApi } from "@/lib/api"
import { 
    Clock, CheckCircle2, 
    ChevronRight, Brain,
    Send, Sparkles, Trophy
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { useToast } from "@/hooks/use-toast"

export default function StudentQuizView() {
    const { id } = useParams()
    const router = useRouter()
    const { toast } = useToast()
    
    const [quiz, setQuiz] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [currentQuestionIndex, setCurrentQuestionIndex] = useState(0)
    const [answers, setAnswers] = useState<Record<string, string>>({})
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isCompleted, setIsCompleted] = useState(false)
    const [result, setResult] = useState<any>(null)
    const [showFeedback, setShowFeedback] = useState<Record<string, boolean>>({})
    const [timeLeft, setTimeLeft] = useState<number | null>(null)
    const [timerActive, setTimerActive] = useState(false)

    useEffect(() => {
        const loadQuiz = async () => {
            try {
                setLoading(true)
                const res = await assessmentApi.getById(id as string)
                setQuiz(res.data)
                
                // Check existing submission for this quiz
                const subRes = await assessmentApi.getSubmissions(id as string)
                if (subRes.data && subRes.data.length > 0) {
                    const latestSubmission = subRes.data[0]
                    setResult(latestSubmission)
                    setIsCompleted(true)

                    if (latestSubmission.answers) {
                        const savedAnswers: Record<string, string> = {}
                        latestSubmission.answers.forEach((row: any) => {
                            savedAnswers[String(row.questionId)] = row.selectedAnswer
                        })
                        setAnswers(savedAnswers)
                    }
                } else {
                    // Start server-side attempt to support timed exams.
                    try {
                        await assessmentApi.start(id as string)
                    } catch (startError: any) {
                        // If already started/attempted, continue silently.
                    }

                    // Initialize timer for new attempts
                    if (res.data.duration) {
                        setTimeLeft(res.data.duration * 60)
                        setTimerActive(true)
                    }
                }
            } catch (error: any) {
                toast({ title: "Status", description: error.message })
            } finally {
                setLoading(false)
            }
        }
        loadQuiz()
    }, [id, toast])

    // Timer Logic
    useEffect(() => {
        if (!timerActive || timeLeft === null || timeLeft <= 0) {
            if (timeLeft === 0 && !isCompleted && !isSubmitting) {
                handleSubmit() // Auto-submit when time is up
            }
            return
        }

        const timer = setInterval(() => {
            setTimeLeft(prev => (prev !== null ? prev - 1 : null))
        }, 1000)

        return () => clearInterval(timer)
    }, [timerActive, timeLeft, isCompleted, isSubmitting])

    const formatTime = (seconds: number) => {
        const m = Math.floor(seconds / 60)
        const s = seconds % 60
        return `${m}:${s < 10 ? '0' : ''}${s}`
    }



    const currentQuestion = quiz?.questions?.[currentQuestionIndex]
    const progress = quiz ? ((currentQuestionIndex + 1) / quiz.questions.length) * 100 : 0
    const hasAnsweredCurrent = currentQuestion ? !!showFeedback[currentQuestion._id] : false

    const handleSelectOption = (option: string) => {
        if (!currentQuestion || showFeedback[currentQuestion._id]) return
        
        const qId = currentQuestion._id
        setAnswers(prev => ({ ...prev, [qId]: option }))
        setShowFeedback(prev => ({ ...prev, [qId]: true }))
        toast({ title: "Answer saved", description: "Move to the next question when ready." })
    }

    const handleSubmit = async () => {
        setIsSubmitting(true)
        try {
            const formattedAnswers = Object.entries(answers).map(([qId, val]) => ({
                questionId: qId,
                selectedAnswer: val
            }))
            
            const res = await assessmentApi.submit(id as string, { answers: formattedAnswers })
            setResult(res.data)
            setIsCompleted(true)
            toast({ title: "Assessment Submitted!", description: "Check your results below." })
        } catch (error: any) {
            toast({ title: "Submission failed", description: error.message, variant: "destructive" })
        } finally {
            setIsSubmitting(false)
        }
    }

    if (loading) return (
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
            <div className="space-y-4 text-center">
                <Brain className="w-12 h-12 text-sky-500 animate-pulse mx-auto" />
                <p className="text-sm font-black text-slate-400 uppercase tracking-widest">Calibrating Assessment...</p>
            </div>
        </div>
    )

    if (isCompleted) return (
        <div className="min-h-screen p-6 lg:p-20 bg-slate-50 animate-in fade-in duration-1000">
            <div className="max-w-4xl mx-auto space-y-12">
                <div className="text-center space-y-4">
                    <div className="w-24 h-24 rounded-[32px] bg-sky-600 text-white flex items-center justify-center mx-auto shadow-2xl shadow-sky-600/20 mb-8">
                        <Trophy className="w-12 h-12" />
                    </div>
                    <h1 className="text-5xl font-black text-slate-900 tracking-tight italic">
                        Assessment <span className="text-sky-600">Complete!</span>
                    </h1>
                    <p className="text-slate-500 font-medium">You've successfully finished {quiz?.title}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                    {[
                        { label: "Score", value: `${result?.percentage}%`, sub: `${result?.score}/${quiz?.totalMarks} pts`, color: "sky" },
                        { label: "Result", value: result?.passed ? "PASSED" : "FAILED", sub: "Based on 60% threshold", color: result?.passed ? "emerald" : "rose" },
                        {
                            label: "Rank",
                            value: result?.result?.rank ? `#${result.result.rank}` : "Pending",
                            sub: result?.result?.totalEvaluated
                                ? `Out of ${result.result.totalEvaluated} graded attempts`
                                : "Ranking updates after submission",
                            color: "amber",
                        }
                    ].map((stat, i) => (
                        <div key={i} className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 text-center space-y-2">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                            <h3 className={cn("text-4xl font-black", `text-${stat.color}-600`)}>{stat.value}</h3>
                            <p className="text-xs font-bold text-slate-400">{stat.sub}</p>
                        </div>
                    ))}
                </div>

                {/* Detailed Review */}
                <div className="space-y-6">
                    <h2 className="text-2xl font-black text-slate-900 uppercase tracking-tight italic">Review Your Answers</h2>
                    <div className="space-y-4">
                        {quiz.questions.map((q: any, i: number) => {
                            const userAnswer = answers[q._id];
                            const attemptRow = (result?.answers || []).find(
                                (row: any) => String(row.questionId) === String(q._id)
                            );
                            const isCorrect = Boolean(attemptRow?.isCorrect);
                            return (
                                <div key={i} className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm space-y-4">
                                    <div className="flex items-start justify-between gap-4">
                                        <h4 className="font-bold text-slate-900">{i + 1}. {q.question}</h4>
                                        {isCorrect ? (
                                            <div className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[10px] font-black uppercase">Correct</div>
                                        ) : (
                                            <div className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase">Incorrect</div>
                                        )}
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-2 text-sm">
                                        <p className="text-slate-500">Your Answer: <span className={isCorrect ? "text-emerald-600 font-bold" : "text-rose-600 font-bold"}>{userAnswer || "Skipped"}</span></p>
                                        <p className="text-slate-500">Points Earned: <span className="text-emerald-600 font-bold">{attemptRow?.pointsEarned ?? 0}</span></p>
                                    </div>
                                    {q.explanation && (
                                        <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100 mt-2">
                                            <div className="flex items-center gap-2 mb-1">
                                                <Brain className="w-4 h-4 text-sky-600" />
                                                <span className="text-[10px] font-black text-sky-600 uppercase">Tutor Explanation</span>
                                            </div>
                                            <p className="text-sm text-sky-900 font-medium leading-relaxed">{q.explanation}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>

                <div className="flex justify-center gap-4 pt-10">
                    <Button 
                        onClick={() => router.push("/dashboard/student")}
                        className="h-16 px-10 rounded-[24px] bg-slate-900 text-white font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl"
                    >
                        Back to Dashboard
                    </Button>
                </div>
            </div>
        </div>
    )

    return (
        <div className="min-h-screen p-6 lg:p-20 bg-slate-50">
            <div className="max-w-4xl mx-auto space-y-12">
                {/* Quiz Header */}
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                    <div className="space-y-2">
                        <div className="flex items-center gap-2">
                            <span className="px-2 py-0.5 rounded-md bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">
                                {quiz.subject?.title || "General"}
                            </span>
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Question {currentQuestionIndex + 1} of {quiz.questions.length}</span>
                        </div>
                        <h2 className="text-3xl font-black text-slate-900 uppercase italic leading-none">{quiz.title}</h2>
                    </div>
                    <div className={cn(
                        "flex items-center gap-4 p-4 rounded-3xl bg-white border transition-all duration-500 shadow-sm",
                        timeLeft !== null && timeLeft < 60 ? "border-rose-200 bg-rose-50 shadow-rose-100 animate-pulse" : "border-slate-100"
                    )}>
                        <Clock className={cn("w-5 h-5", timeLeft !== null && timeLeft < 60 ? "text-rose-500" : "text-sky-500")} />
                        <span className={cn(
                            "text-xl font-black tabular-nums",
                            timeLeft !== null && timeLeft < 60 ? "text-rose-600" : "text-slate-900"
                        )}>
                            {timeLeft !== null ? formatTime(timeLeft) : "--:--"}
                        </span>
                    </div>
                </div>

                {/* Progress Bar */}
                <div className="space-y-2">
                    <div className="flex justify-between text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <span>Progress</span>
                        <span>{Math.round(progress)}%</span>
                    </div>
                    <Progress value={progress} className="h-3 rounded-full bg-slate-200 [&>div]:bg-sky-500 transition-all" />
                </div>

                {/* Question Card */}
                <div className="p-10 lg:p-16 rounded-[64px] bg-white border border-slate-100 shadow-2xl shadow-slate-200/20 space-y-10 animate-in slide-in-from-right-4 duration-500">
                    <h3 className="text-2xl lg:text-3xl font-black text-slate-900 leading-tight">
                        {currentQuestion.question}
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        {currentQuestion.options.map((option: string, i: number) => {
                            const isSelected = answers[currentQuestion._id] === option
                            const isRevealed = showFeedback[currentQuestion._id]
                            
                            let stateStyles = "bg-slate-50 border-transparent text-slate-600 hover:bg-white hover:border-slate-200"
                            if (isRevealed) {
                                if (isSelected) stateStyles = "bg-sky-50 border-sky-600 text-sky-900 shadow-xl shadow-sky-500/10"
                                else stateStyles = "bg-slate-50 border-transparent text-slate-300 opacity-50"
                            } else if (isSelected) {
                                stateStyles = "bg-sky-50 border-sky-600 text-sky-900 shadow-xl shadow-sky-500/10"
                            }

                            return (
                                <button
                                    key={i}
                                    disabled={isRevealed}
                                    onClick={() => handleSelectOption(option)}
                                    className={cn(
                                        "group flex items-center justify-between p-6 rounded-[32px] border-2 transition-all text-left relative overflow-hidden",
                                        stateStyles
                                    )}
                                >
                                    <div className="flex items-center gap-4 relative z-10">
                                        <div className={cn(
                                            "w-10 h-10 rounded-2xl flex items-center justify-center font-black transition-all",
                                            isRevealed && isCorrect ? "bg-emerald-500 text-white" :
                                            isRevealed && isSelected && !isCorrect ? "bg-rose-500 text-white" :
                                            isSelected ? "bg-sky-600 text-white" : "bg-white text-slate-400"
                                        )}>
                                            {String.fromCharCode(65 + i)}
                                        </div>
                                        <span className="font-bold text-lg">{option}</span>
                                    </div>
                                    <div className="relative z-10">
                                        {isRevealed && isSelected && <CheckCircle2 className="w-6 h-6 text-sky-600" />}
                                    </div>
                                </button>
                            )
                        })}
                    </div>

                    {hasAnsweredCurrent && currentQuestion.explanation && (
                         <div className="p-8 rounded-[40px] bg-sky-50 border border-sky-100 animate-in fade-in zoom-in duration-500">
                             <div className="flex items-center gap-2 mb-3">
                                 <Sparkles className="w-5 h-5 text-sky-600" />
                                 <span className="text-xs font-black text-sky-600 uppercase tracking-widest">Instant Feedback</span>
                             </div>
                             <p className="text-lg text-sky-900 font-medium leading-relaxed italic">{currentQuestion.explanation}</p>
                         </div>
                    )}
                </div>

                {/* Navigation */}
                <div className="flex items-center justify-between">
                    <Button
                        variant="ghost"
                        onClick={() => setCurrentQuestionIndex(prev => Math.max(0, prev - 1))}
                        disabled={currentQuestionIndex === 0}
                        className="h-14 px-8 rounded-2xl text-slate-400 font-black text-xs uppercase tracking-widest hover:text-sky-600"
                    >
                        Previous
                    </Button>
                    
                    {currentQuestionIndex === quiz.questions.length - 1 ? (
                        <Button
                            onClick={handleSubmit}
                            disabled={isSubmitting || !answers[currentQuestion._id]}
                            className="h-16 px-12 rounded-[24px] bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-sky-500/20 hover:bg-sky-700 transition-all"
                        >
                            {isSubmitting ? "Submitting..." : "Submit Assessment"}
                            <Send className="ml-3 w-4 h-4" />
                        </Button>
                    ) : (
                        <Button
                            onClick={() => setCurrentQuestionIndex(prev => prev + 1)}
                            disabled={!answers[currentQuestion._id]}
                            className="h-16 px-12 rounded-[24px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest hover:bg-sky-600 transition-all"
                        >
                            Next Question
                            <ChevronRight className="ml-2 w-4 h-4" />
                        </Button>
                    )}
                </div>
            </div>
        </div>
    )
}
