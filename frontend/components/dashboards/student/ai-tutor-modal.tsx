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
            <DialogContent className="max-w-3xl h-[85vh] bg-white rounded-[32px] p-0 overflow-hidden flex flex-col border border-slate-100 shadow-2xl">
                <DialogHeader className="p-6 border-b border-slate-100 bg-white shrink-0 flex flex-row items-center justify-between">
                    <div className="flex items-center gap-4">
                        <div className="w-10 h-10 rounded-xl bg-slate-900 flex items-center justify-center text-white shadow-sm">
                            <Sparkles className="w-5 h-5" />
                        </div>
                        <div className="text-left space-y-0.5">
                            <DialogTitle className="text-xl font-bold text-slate-900 tracking-tight leading-none">
                                AI Assistant
                            </DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium text-xs">
                                Always here to help you learn
                            </DialogDescription>
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-hidden flex flex-col bg-white">
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
                                    "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-sm",
                                    m.role === "assistant" ? "bg-slate-900 text-white" : "bg-slate-100 text-slate-600"
                                )}>
                                    {m.role === "assistant" ? <Sparkles className="w-4 h-4" /> : <User className="w-4 h-4" />}
                                </div>
                                <div className={cn(
                                    "max-w-[85%] p-4 rounded-2xl text-[15px] font-normal leading-relaxed shadow-sm whitespace-pre-wrap",
                                    m.role === "assistant"
                                        ? "bg-white text-slate-800 border border-slate-100"
                                        : "bg-slate-100 text-slate-900"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start gap-4">
                                <div className="w-8 h-8 rounded-full bg-slate-900 text-white flex items-center justify-center shrink-0 shadow-sm">
                                    <Sparkles className="w-4 h-4" />
                                </div>
                                <div className="bg-white p-4 rounded-2xl border border-slate-100 shadow-sm">
                                    <div className="flex gap-1.5 mt-1">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-400 animate-bounce" style={{ animationDelay: '300ms' }} />
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
                                        className="flex items-center gap-2.5 px-4 py-2.5 rounded-xl bg-slate-50 border border-slate-100 text-slate-600 hover:bg-slate-100 hover:text-slate-900 transition-all text-sm font-medium"
                                    >
                                        <p.icon className="w-4 h-4 text-slate-400" />
                                        {p.label}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-6 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex gap-3 relative max-w-3xl mx-auto">
                            <Input
                                placeholder="Message AI Assistant..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="h-14 rounded-2xl border-slate-200 bg-white focus:ring-slate-900/5 focus:border-slate-900 text-[15px] font-normal pl-6 pr-16 shadow-sm"
                            />
                            <Button
                                onClick={() => handleSend()}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-2 h-10 w-10 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-sm p-0 transition-all active:scale-95"
                            >
                                <Send className="w-4 h-4 translate-x-0.5 -translate-y-0.5" />
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
