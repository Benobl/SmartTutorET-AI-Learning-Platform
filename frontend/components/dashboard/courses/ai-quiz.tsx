"use client"

import { useState, useEffect } from "react"
import {
    BrainCircuit, Sparkles, CheckCircle2, AlertCircle,
    ArrowRight, Trophy, RefreshCcw, Loader2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { cn } from "@/lib/utils"

interface QuizQuestion {
    id: number
    question: string
    options: string[]
    correctAnswer: number
}

interface AIQuizProps {
    lessonTitle: string
    onComplete: (score: number) => void
}

const MOCK_QUESTIONS: QuizQuestion[] = [
    {
        id: 1,
        question: "What is the primary objective of this lesson?",
        options: ["To explain core foundations", "To solve practice set 1", "To review final summary", "To demo advanced UI"],
        correctAnswer: 0
    },
    {
        id: 2,
        question: "Which concept was highlighted as the 'building block' of this topic?",
        options: ["Asynchronous logic", "Data modeling", "Reactive states", "Component lifecycle"],
        correctAnswer: 2
    },
    {
        id: 3,
        question: "How should a student approach the practice exercises?",
        options: ["Skip them", "Do them after reading", "Use a calculator", "Collaborate only"],
        correctAnswer: 1
    }
]

export function AIQuiz({ lessonTitle, onComplete }: AIQuizProps) {
    const [isGenerating, setIsGenerating] = useState(true)
    const [currentIndex, setCurrentIndex] = useState(0)
    const [selectedOption, setSelectedOption] = useState<number | null>(null)
    const [score, setScore] = useState(0)
    const [showResult, setShowResult] = useState(false)
    const [answers, setAnswers] = useState<number[]>([])

    useEffect(() => {
        // Simulate AI "generating" the quiz
        const timer = setTimeout(() => setIsGenerating(false), 3000)
        return () => clearTimeout(timer)
    }, [lessonTitle])

    const handleOptionSelect = (idx: number) => {
        if (selectedOption !== null) return
        setSelectedOption(idx)

        const newAnswers = [...answers]
        newAnswers[currentIndex] = idx
        setAnswers(newAnswers)

        if (idx === MOCK_QUESTIONS[currentIndex].correctAnswer) {
            setScore(prev => prev + 1)
        }
    }

    const nextQuestion = () => {
        if (currentIndex < MOCK_QUESTIONS.length - 1) {
            setCurrentIndex(prev => prev + 1)
            setSelectedOption(null)
        } else {
            setShowResult(true)
            onComplete((score + (selectedOption === MOCK_QUESTIONS[currentIndex].correctAnswer ? 1 : 0)) / MOCK_QUESTIONS.length * 100)
        }
    }

    const resetQuiz = () => {
        setIsGenerating(true)
        setCurrentIndex(0)
        setSelectedOption(null)
        setScore(0)
        setShowResult(false)
        setAnswers([])
    }

    if (isGenerating) {
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 p-12 text-center space-y-8 animate-in fade-in duration-700 shadow-xl">
                <div className="relative mx-auto w-24 h-24">
                    <BrainCircuit className="w-24 h-24 text-sky-500 animate-pulse" />
                    <Sparkles className="absolute -top-2 -right-2 w-8 h-8 text-amber-400 animate-bounce" />
                </div>
                <div className="space-y-4">
                    <h3 className="text-2xl font-black text-slate-900 tracking-tight">AI is generating your quiz...</h3>
                    <p className="text-slate-500 text-sm font-medium max-w-sm mx-auto">
                        Analyzing lesson content to create personalized questions and assessment for <span className="text-sky-600 font-black">"{lessonTitle}"</span>.
                    </p>
                </div>
                <div className="flex justify-center gap-2">
                    {[0, 1, 2].map(i => (
                        <div key={i} className="w-2 h-2 rounded-full bg-sky-200 animate-bounce" style={{ animationDelay: `${i * 0.2}s` }} />
                    ))}
                </div>
            </div>
        )
    }


    if (showResult) {
        const percentage = Math.round((score / MOCK_QUESTIONS.length) * 100)
        return (
            <div className="bg-white rounded-[32px] border border-slate-100 p-10 text-center space-y-8 shadow-xl animate-in zoom-in-95 duration-500">
                <div className="relative mx-auto w-24 h-24 bg-amber-50 rounded-full flex items-center justify-center">
                    <Trophy className="w-12 h-12 text-amber-400" />
                    <div className="absolute inset-0 border-4 border-amber-400/20 rounded-full border-t-amber-400 animate-spin" />
                </div>

                <div className="space-y-2">
                    <h3 className="text-3xl font-black text-slate-900 tracking-tight">Quiz Completed!</h3>
                    <p className="text-slate-500 font-bold uppercase tracking-widest text-[10px]">Your Learning Score</p>
                </div>

                <div className="flex justify-center items-end gap-1">
                    <span className="text-6xl font-black text-indigo-600">{percentage}%</span>
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div className="p-4 bg-sky-50 rounded-2xl border border-sky-100">
                        <p className="text-[9px] font-black text-sky-600 uppercase tracking-widest mb-1">Correct</p>
                        <p className="text-xl font-black text-sky-700">{score}</p>
                    </div>

                    <div className="p-4 bg-slate-50 rounded-2xl border border-slate-100">
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Questions</p>
                        <p className="text-xl font-black text-slate-700">{MOCK_QUESTIONS.length}</p>
                    </div>
                </div>

                <div className="flex gap-4">
                    <Button
                        onClick={resetQuiz}
                        variant="outline"
                        className="flex-1 h-12 rounded-xl border-2 border-slate-100 font-black text-[10px] uppercase tracking-widest hover:bg-slate-50 transition-all gap-2"
                    >
                        <RefreshCcw className="w-3.5 h-3.5" /> Retake Quiz
                    </Button>
                    <Button
                        onClick={() => onComplete(percentage)}
                        className="flex-1 h-12 rounded-xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest shadow-lg transition-all"
                    >
                        Finish Lesson
                    </Button>
                </div>
            </div>
        )
    }

    const currentQ = MOCK_QUESTIONS[currentIndex]

    return (
        <div className="bg-white rounded-[32px] border border-slate-100 p-10 space-y-8 shadow-xl relative overflow-hidden">
            {/* Progress line */}
            <div className="absolute top-0 left-0 right-0 h-1.5 bg-slate-50">
                <div
                    className="h-full bg-indigo-500 transition-all duration-500"
                    style={{ width: `${((currentIndex + 1) / MOCK_QUESTIONS.length) * 100}%` }}
                />
            </div>

            <div className="flex justify-between items-center">
                <span className="text-[10px] font-black text-indigo-500 uppercase tracking-widest bg-indigo-50 px-3 py-1.5 rounded-lg">
                    Question {currentIndex + 1} of {MOCK_QUESTIONS.length}
                </span>
                <div className="flex items-center gap-1 text-slate-400">
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span className="text-[10px] font-bold uppercase tracking-widest">AI monitoring</span>
                </div>
            </div>

            <h3 className="text-xl font-black text-slate-900 leading-tight">
                {currentQ.question}
            </h3>

            <div className="space-y-3">
                {currentQ.options.map((option, idx) => (
                    <button
                        key={idx}
                        onClick={() => handleOptionSelect(idx)}
                        disabled={selectedOption !== null}
                        className={cn(
                            "w-full p-5 rounded-2xl text-left border-2 transition-all group flex items-start justify-between",
                            selectedOption === null
                                ? "border-slate-100 hover:border-indigo-200 hover:bg-slate-50/50"
                                : idx === currentQ.correctAnswer
                                    ? "bg-sky-50 border-sky-500 text-sky-700"
                                    : selectedOption === idx
                                        ? "bg-rose-50 border-rose-500 text-rose-700"
                                        : "border-slate-50 opacity-40"
                        )}
                    >
                        <span className="text-sm font-bold">{option}</span>
                        {selectedOption !== null && idx === currentQ.correctAnswer && (
                            <CheckCircle2 className="w-5 h-5 text-sky-500 shrink-0 mt-0.5" />
                        )}

                        {selectedOption === idx && idx !== currentQ.correctAnswer && (
                            <AlertCircle className="w-5 h-5 text-rose-500 shrink-0 mt-0.5" />
                        )}
                    </button>
                ))}
            </div>

            {selectedOption !== null && (
                <div className="pt-4 border-t border-slate-100 animate-in fade-in slide-in-from-top-2 duration-500">
                    <Button
                        onClick={nextQuestion}
                        className="w-full h-14 rounded-2xl bg-indigo-600 hover:bg-slate-900 text-white font-black text-xs uppercase tracking-widest shadow-lg transition-all flex items-center gap-2"
                    >
                        {currentIndex === MOCK_QUESTIONS.length - 1 ? "Show Results" : "Next Question"} <ArrowRight className="w-4 h-4" />
                    </Button>
                </div>
            )}
        </div>
    )
}
