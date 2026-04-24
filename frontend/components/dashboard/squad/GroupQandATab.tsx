"use client"

import { useState, useEffect } from "react"
import { HelpCircle, ChevronUp, CheckCircle2, User, Plus, MessageCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface GroupQandATabProps {
    squadId: string
}

export function GroupQandATab({ squadId }: GroupQandATabProps) {
    const [questions, setQuestions] = useState<any[]>([])
    const [isAsking, setIsAsking] = useState(false)
    const [newQuestion, setNewQuestion] = useState({ title: "", content: "", tags: "" })
    const [selectedQuestion, setSelectedQuestion] = useState<any>(null)
    const [answers, setAnswers] = useState<any[]>([])
    const [newAnswer, setNewAnswer] = useState("")

    useEffect(() => {
        fetchQuestions()
    }, [squadId])

    const fetchQuestions = async () => {
        try {
            // Simplified question fetching (ideally filtered by group, but backend currently returns all)
            const data = await fetchWithAuth("/questions")
            setQuestions(data)
        } catch (error) {
            console.error("Failed to fetch questions:", error)
        }
    }

    const handleAskQuestion = async () => {
        if (!newQuestion.title || !newQuestion.content) return
        try {
            await fetchWithAuth("/questions", {
                method: "POST",
                body: JSON.stringify({
                    title: newQuestion.title,
                    content: newQuestion.content,
                    tags: newQuestion.tags.split(",").map(t => t.trim())
                })
            })
            setIsAsking(false)
            setNewQuestion({ title: "", content: "", tags: "" })
            fetchQuestions()
            toast({ title: "Inquiry Published", description: "The squad has been notified." })
        } catch (error) {
            toast({ title: "Failed", description: "Question transmission failed.", variant: "destructive" })
        }
    }

    const selectQuestion = async (q: any) => {
        setSelectedQuestion(q)
        try {
            const data = await fetchWithAuth(`/questions/answers/${q._id}`)
            setAnswers(data)
        } catch (error) {
            console.error("Failed to fetch answers:", error)
        }
    }

    const handleVote = async (id: string, type: "upvote" | "downvote") => {
        try {
            await fetchWithAuth(`/questions/${type}/${id}`, { method: "POST" })
            fetchQuestions()
            toast({ title: "Vote Cast", description: "Your feedback matters." })
        } catch (error) {
            console.error(error)
        }
    }

    const handlePostAnswer = async () => {
        if (!newAnswer.trim()) return
        try {
            const data = await fetchWithAuth("/questions/answers", {
                method: "POST",
                body: JSON.stringify({ questionId: selectedQuestion._id, content: newAnswer })
            })
            setAnswers([...answers, data])
            setNewAnswer("")
            toast({ title: "Resolution Proposed" })
        } catch (error) {
            toast({ title: "Failed to post answer", variant: "destructive" })
        }
    }

    return (
        <div className="flex gap-6 h-[500px]">
            {/* Questions List */}
            <div className="w-1/3 flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between bg-slate-50/30">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Peer Inquiries</h4>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsAsking(true)}
                        className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-2 custom-scrollbar">
                    {questions.map(q => (
                        <div
                            key={q._id}
                            onClick={() => selectQuestion(q)}
                            className={cn(
                                "p-4 rounded-2xl cursor-pointer transition-all duration-300 border",
                                selectedQuestion?._id === q._id ? "bg-sky-50 border-sky-100" : "bg-white border-transparent hover:bg-slate-50"
                            )}
                        >
                            <h5 className={cn("text-xs font-black uppercase italic leading-tight", selectedQuestion?._id === q._id ? "text-sky-700" : "text-slate-700")}>{q.title}</h5>
                            <div className="flex items-center justify-between mt-3">
                                <div className="flex items-center gap-2">
                                    <button
                                        onClick={(e) => { e.stopPropagation(); handleVote(q._id, "upvote"); }}
                                        className="flex items-center gap-1 text-[9px] font-black text-slate-400 hover:text-sky-600"
                                    >
                                        <ChevronUp className="w-3 h-3" /> {(q.upvotes?.length || 0) - (q.downvotes?.length || 0)}
                                    </button>
                                </div>
                                <div className="text-[8px] font-black text-slate-300 uppercase">Grade {q.author.grade || "12"}</div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Inquiry Context */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm">
                {selectedQuestion ? (
                    <>
                        <div className="p-8 border-b border-slate-50">
                            <div className="flex items-center gap-2 mb-4">
                                <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[8px] font-black uppercase tracking-widest border border-sky-100">Live Inquiry</span>
                                <span className="text-[8px] font-black text-slate-300 uppercase tracking-widest">{selectedQuestion.author.fullName}</span>
                            </div>
                            <h4 className="text-2xl font-black text-slate-900 italic uppercase leading-none mb-4">{selectedQuestion.title}</h4>
                            <p className="text-sm font-medium text-slate-600 leading-relaxed">{selectedQuestion.content}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar">
                            <h5 className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-2 flex items-center gap-2">
                                <CheckCircle2 className="w-4 h-4 text-emerald-500" /> Proposed Resolutions
                            </h5>
                            {answers.map(ans => (
                                <div key={ans._id} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 space-y-4">
                                    <p className="text-sm text-slate-700 font-medium leading-relaxed italic">"{ans.content}"</p>
                                    <div className="flex items-center justify-between pt-4 border-t border-slate-200/50">
                                        <div className="flex items-center gap-2">
                                            <div className="w-6 h-6 rounded-lg bg-white border border-slate-200 flex items-center justify-center font-black text-[8px] text-slate-400">
                                                {ans.author.fullName[0]}
                                            </div>
                                            <span className="text-[9px] font-black text-slate-400 uppercase">{ans.author.fullName}</span>
                                        </div>
                                        <Button variant="ghost" className="h-8 rounded-xl text-[9px] font-black uppercase text-sky-600 hover:bg-sky-50">
                                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" /> Best Fit
                                        </Button>
                                    </div>
                                </div>
                            ))}
                            {answers.length === 0 && (
                                <div className="text-center py-10">
                                    <p className="text-[10px] font-black text-slate-300 uppercase italic">No resolutions proposed yet...</p>
                                </div>
                            )}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                            <Input
                                placeholder="Propose a resolution..."
                                value={newAnswer}
                                onChange={(e) => setNewAnswer(e.target.value)}
                                className="h-12 bg-white rounded-xl border-slate-200"
                            />
                            <Button onClick={handlePostAnswer} className="h-12 rounded-xl bg-sky-600 hover:bg-sky-700">
                                <Plus className="w-4 h-4 mr-2" /> Resolve
                            </Button>
                        </div>
                    </>
                ) : isAsking ? (
                    <div className="p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-slate-900 uppercase italic">Formulate <span className="text-sky-600">Inquiry</span></h4>
                            <p className="text-xs font-medium text-slate-400">Describe your academic block clearly for the squad.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Inquiry Header</label>
                                <Input
                                    placeholder="e.g. Solving for X in Vector Space"
                                    value={newQuestion.title}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, title: e.target.value })}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Problem Matrix</label>
                                <Textarea
                                    placeholder="Explain the technical difficulty..."
                                    value={newQuestion.content}
                                    onChange={(e) => setNewQuestion({ ...newQuestion, content: e.target.value })}
                                    className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 font-medium pt-4"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button onClick={() => setIsAsking(false)} variant="outline" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest">Abort</Button>
                                <Button onClick={handleAskQuestion} className="flex-1 h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 font-black text-xs uppercase tracking-widest">Broadcast</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-20 h-20 rounded-[32px] bg-sky-50 border border-sky-100 flex items-center justify-center">
                            <HelpCircle className="w-10 h-10 text-sky-200" />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-lg font-black text-slate-700 uppercase italic">Matrix Inquiry Required</h5>
                            <p className="text-xs text-slate-400 font-medium max-w-[240px]">Select an inquiry from the left or formulate a new peer question.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
