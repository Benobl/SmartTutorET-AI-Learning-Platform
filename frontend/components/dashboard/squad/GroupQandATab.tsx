"use client"

import { useState, useEffect } from "react"
import { HelpCircle, Plus, ChevronLeft, Loader2, Send, ChevronUp, CheckCircle2 } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { questionApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface GroupQandATabProps {
    squadId: string
}

export function GroupQandATab({ squadId }: GroupQandATabProps) {
    const [questions, setQuestions] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [askOpen, setAskOpen] = useState(false)
    const [newQ, setNewQ] = useState({ title: "", content: "", tags: "" })
    const [selectedQ, setSelectedQ] = useState<any>(null)
    const [answers, setAnswers] = useState<any[]>([])
    const [answerText, setAnswerText] = useState("")
    const [submitting, setSubmitting] = useState(false)
    const [asking, setAsking] = useState(false)

    useEffect(() => {
        fetchQuestions()
    }, [squadId])

    const fetchQuestions = async () => {
        try {
            const data = await questionApi.getBySquad(squadId)
            setQuestions(data.data || [])
        } catch (e) {
            console.error(e)
            toast({ title: "Failed to load questions", variant: "destructive" })
        } finally { setLoading(false) }
    }

    const openQuestion = async (q: any) => {
        setSelectedQ(q)
        try {
            const data = await questionApi.getAnswers(q._id)
            setAnswers(data.data || [])
        } catch (e) { console.error(e) }
    }

    const handleAsk = async () => {
        if (!newQ.title.trim() || !newQ.content.trim()) return
        setAsking(true)
        try {
            const res = await questionApi.create({
                title: newQ.title,
                content: newQ.content,
                tags: newQ.tags.split(",").map(t => t.trim()).filter(Boolean),
                squadId // Scoping to current squad
            })
            const created = res.data || res
            setAskOpen(false)
            setNewQ({ title: "", content: "", tags: "" })
            fetchQuestions()
            toast({ title: "Question posted to squad!" })
        } catch (e) {
            console.error("[QA] Create Error:", e)
            toast({ title: "Failed to post", variant: "destructive" })
        } finally { setAsking(false) }
    }

    const handleAnswer = async () => {
        if (!answerText.trim() || !selectedQ) return
        setSubmitting(true)
        try {
            await questionApi.createAnswer({ questionId: selectedQ._id, content: answerText })
            const data = await questionApi.getAnswers(selectedQ._id)
            setAnswers(data.data || [])
            setAnswerText("")
            toast({ title: "Answer submitted!" })
        } catch (e) {
            toast({ title: "Failed to submit", variant: "destructive" })
        } finally { setSubmitting(false) }
    }

    const handleVote = async (id: string, type: "upvote" | "downvote") => {
        try {
            await questionApi.vote(id, type)
            fetchQuestions()
        } catch (e) { }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
            </div>
        )
    }

    // Question detail view
    if (selectedQ) {
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Header */}
                <div className="flex items-center gap-2 px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setSelectedQ(null)} className="rounded-xl h-9 w-9 hover:bg-white hover:shadow-sm text-slate-500 transition-all">
                        <ChevronLeft className="w-5 h-5" />
                    </Button>
                    <div className="flex-1 min-w-0 ml-1">
                        <p className="font-bold text-sm text-slate-900 truncate tracking-tight">{selectedQ.title}</p>
                        <div className="flex items-center gap-2">
                            <span className="text-[10px] text-slate-400 font-medium">{answers.length} answers</span>
                            <span className="w-1 h-1 bg-slate-300 rounded-full" />
                            <span className="text-[10px] text-slate-400 font-medium">In this squad</span>
                        </div>
                    </div>
                </div>
                {/* Content */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {/* Question */}
                    <div className="p-4 rounded-2xl bg-indigo-50 border border-indigo-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-indigo-200 text-indigo-700 flex items-center justify-center font-black text-[10px]">
                                {selectedQ.author?.fullName?.[0] || "Q"}
                            </div>
                            <span className="text-xs font-bold text-indigo-800">{selectedQ.author?.fullName || "Student"}</span>
                            <div className="ml-auto flex gap-1">
                                {selectedQ.tags?.map((tag: string) => (
                                    <span key={tag} className="px-1.5 py-0.5 bg-indigo-100 text-indigo-600 rounded-full text-[9px] font-bold">{tag}</span>
                                ))}
                            </div>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{selectedQ.content}</p>
                    </div>
                    {answers.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-4">No answers yet. Be the first to help!</p>
                    )}
                    {answers.map((ans: any) => (
                        <div key={ans._id} className={cn("p-3 rounded-2xl border border-slate-100 bg-slate-50", ans.isAccepted && "border-emerald-200 bg-emerald-50")}>
                            <div className="flex items-center gap-2 mb-1.5">
                                <div className="w-6 h-6 rounded-lg bg-slate-200 text-slate-600 flex items-center justify-center font-black text-[10px]">
                                    {ans.author?.fullName?.[0] || "A"}
                                </div>
                                <span className="text-xs font-bold text-slate-600">{ans.author?.fullName || "Member"}</span>
                                {ans.isAccepted && (
                                    <span className="ml-auto flex items-center gap-1 text-[10px] font-black text-emerald-600">
                                        <CheckCircle2 className="w-3 h-3" /> Accepted
                                    </span>
                                )}
                            </div>
                            <p className="text-sm text-slate-700 leading-relaxed">{ans.content}</p>
                        </div>
                    ))}
                </div>
                {/* Answer input */}
                <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                        <Input value={answerText} onChange={e => setAnswerText(e.target.value)}
                            placeholder="Write your answer..."
                            className="flex-1 h-10 rounded-xl text-sm border-slate-200"
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleAnswer()} />
                        <Button size="icon" onClick={handleAnswer} disabled={submitting || !answerText.trim()}
                            className="w-10 h-10 rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white shrink-0">
                            {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // Question list
    return (
        <div className="flex flex-col h-full bg-white">
            {/* Ask new question */}
            <div className="p-4 border-b border-slate-100 shrink-0">
                {!askOpen ? (
                    <Button onClick={() => setAskOpen(true)}
                        className="w-full h-10 rounded-xl bg-slate-50 border border-slate-200 text-slate-400 text-sm font-semibold hover:bg-slate-100 justify-start px-4">
                        <HelpCircle className="w-4 h-4 mr-2 text-indigo-400" /> Ask the squad a question...
                    </Button>
                ) : (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Input value={newQ.title} onChange={e => setNewQ(p => ({ ...p, title: e.target.value }))}
                            placeholder="Your question..." className="h-10 rounded-xl text-sm border-slate-200" />
                        <Textarea value={newQ.content} onChange={e => setNewQ(p => ({ ...p, content: e.target.value }))}
                            placeholder="Add details..." className="text-sm rounded-xl border-slate-200 min-h-[60px] resize-none" />
                        <Input value={newQ.tags} onChange={e => setNewQ(p => ({ ...p, tags: e.target.value }))}
                            placeholder="Tags (comma separated, e.g. math, physics)" className="h-9 rounded-xl text-xs border-slate-200" />
                        <div className="flex justify-end gap-2">
                            <Button variant="ghost" size="sm" onClick={() => setAskOpen(false)} className="rounded-xl text-xs">Cancel</Button>
                            <Button size="sm" onClick={handleAsk} disabled={asking}
                                className="rounded-xl bg-indigo-600 hover:bg-indigo-700 text-white text-xs">
                                {asking ? <Loader2 className="w-3 h-3 animate-spin mr-1" /> : <Plus className="w-3 h-3 mr-1" />} Post Question
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {/* List */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {questions.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                        <HelpCircle className="w-10 h-10 text-slate-200" />
                        <p className="text-sm text-slate-400 font-semibold">No questions yet</p>
                        <p className="text-xs text-slate-300">Ask the first question above</p>
                    </div>
                ) : (
                    questions.map(q => (
                        <button key={q._id} onClick={() => openQuestion(q)}
                            className="w-full text-left p-4 rounded-2xl bg-slate-50 hover:bg-indigo-50 border border-slate-100 hover:border-indigo-100 transition-all group">
                            <div className="flex-1 min-w-0">
                                <p className="font-bold text-[13px] text-slate-800 truncate leading-snug group-hover:text-indigo-600 transition-colors uppercase tracking-tight">{q.title}</p>
                                <p className="text-[11px] text-slate-400 mt-1 line-clamp-1 font-medium">{q.content}</p>
                                <div className="flex items-center gap-2 mt-3 flex-wrap">
                                    {q.tags?.slice(0, 3).map((tag: string) => (
                                        <span key={tag} className="px-2 py-0.5 bg-white border border-slate-100 text-slate-500 rounded-lg text-[9px] font-bold shadow-sm">{tag}</span>
                                    ))}
                                    <span className="text-[10px] text-indigo-400 font-bold ml-auto bg-indigo-50 px-2 py-0.5 rounded-full border border-indigo-100/50">{q.answers?.length || 0} answers</span>
                                </div>
                            </div>
                            <ChevronLeft className="w-4 h-4 text-slate-300 rotate-180 group-hover:text-indigo-400 group-hover:translate-x-0.5 shrink-0 mt-1.5 transition-all" />
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
