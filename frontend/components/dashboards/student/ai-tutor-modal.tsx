"use client"

import { useState, useEffect, useRef } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    MessageSquare, Send, Sparkles, Brain,
    Lightbulb, Laptop, Calculator, X,
    Bot, User, ChevronRight, Zap, Target, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { aiApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"

interface Message {
    id: string
    role: "assistant" | "user"
    content: string
    timestamp: Date
}

interface AITutorModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const SUGGESTED_PROMPTS = [
    { icon: Target, label: "Create Study Plan", prompt: "Can you help me create a study plan for this week? I'm in Grade 12 and need to focus on Mathematics and Physics." },
    { icon: Brain, label: "How to Study?", prompt: "What are the best scientifically proven study techniques for high school subjects like Biology?" },
    { icon: Calculator, label: "Explain Chapter", prompt: "Can you explain the main concepts of Calculus Chapter 1 for Grade 12?" },
    { icon: Lightbulb, label: "Exam Tips", prompt: "Give me tips for the Ethiopian National Exam preparation." },
]

export function AITutorModal({ isOpen, onOpenChange }: AITutorModalProps) {
    const user = getCurrentUser()
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: `Hello ${user?.name?.split(" ")[0] || "Scholar"}! I'm your AI Academic Assistant. I can help you create a personalized study plan, explain complex topics, or give you tips for your exams. What's on your mind today?`,
            timestamp: new Date(),
        }
    ])
    const [input, setInput] = useState("")
    const [isTyping, setIsTyping] = useState(false)
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight
        }
    }, [messages, isTyping])

    const handleSend = async (customPrompt?: string) => {
        const textToSend = typeof customPrompt === 'string' ? customPrompt : input
        if (!textToSend.trim() || isTyping) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: textToSend,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        try {
            const response = await aiApi.getTutorResponse({
                studentQuery: textToSend,
                performanceData: { grade: user?.grade, role: user?.role },
                conversationHistory: messages.map(m => ({ role: m.role, content: m.content }))
            });

            // Handle both response object structures depending on API shape
            const content = response?.data?.response || response;

            const aiMsg: Message = {
                id: Date.now().toString(),
                role: "assistant",
                content: typeof content === 'string' ? content : "I received a response, but it was in an unexpected format.",
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, aiMsg])
        } catch (error: any) {
            console.error("[AI Tutor] Error:", error)
            const errorMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm sorry, I'm having trouble connecting to my knowledge base right now. Please try again in a moment.",
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, errorMsg])
        } finally {
            setIsTyping(false)
        }
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[85vh] bg-white rounded-[40px] p-0 overflow-hidden flex flex-col border-slate-200 shadow-2xl">
                <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-sky-50 via-white to-indigo-50/30 shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-sky-600 to-indigo-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    AI Learning <span className="text-sky-600">Assistant</span>
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                    Personalized Study Planning & Tutoring
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Live Engine</span>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-slate-50/30">
                    {/* Chat Messages */}
                    <div
                        ref={scrollRef}
                        className="flex-1 overflow-y-auto p-8 space-y-6 custom-scrollbar"
                    >
                        {messages.map((m) => (
                            <div
                                key={m.id}
                                className={cn(
                                    "flex items-start gap-4 animate-in fade-in slide-in-from-bottom-2 duration-500",
                                    m.role === "user" ? "flex-row-reverse" : ""
                                )}
                            >
                                <div className={cn(
                                    "w-10 h-10 rounded-xl flex items-center justify-center shrink-0 shadow-sm border",
                                    m.role === "assistant" ? "bg-white text-sky-600 border-sky-100" : "bg-sky-600 text-white border-sky-500"
                                )}>
                                    {m.role === "assistant" ? <Bot className="w-5 h-5" /> : <User className="w-5 h-5" />}
                                </div>
                                <div className={cn(
                                    "max-w-[85%] p-5 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm whitespace-pre-wrap",
                                    m.role === "assistant"
                                        ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                        : "bg-sky-600 text-white rounded-tr-none shadow-sky-600/20"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white p-5 rounded-[24px] rounded-tl-none border border-slate-100 shadow-sm">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Prompts */}
                    {messages.length < 5 && !isTyping && (
                        <div className="p-8 pt-0 space-y-3 shrink-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Recommended Actions</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => { handleSend(p.prompt); }}
                                        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:shadow-xl transition-all text-[11px] font-black uppercase tracking-tight"
                                    >
                                        <p.icon className="w-4 h-4 text-sky-500" />
                                        {p.label}
                                        <ChevronRight className="w-3.5 h-3.5 opacity-30" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-8 border-t border-slate-100 bg-white shrink-0 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
                        <div className="flex gap-3 relative">
                            <Input
                                placeholder="Discuss your study plan or ask a question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white focus:ring-sky-500/10 focus:border-sky-500 text-sm font-medium pl-6 pr-16 shadow-inner"
                            />
                            <Button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-2 h-12 w-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/30 p-0 transition-all active:scale-95"
                            >
                                <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-6 mt-6">
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Zap className="w-3 h-3 text-amber-500 fill-amber-500" /> Ultra-Fast Response
                            </div>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <div className="flex items-center gap-2 text-[9px] font-black text-slate-400 uppercase tracking-[0.2em]">
                                <Brain className="w-3 h-3 text-indigo-500" /> Deep Context Aware
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
