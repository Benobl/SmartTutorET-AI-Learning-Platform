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
    Bot, User, ChevronRight, Zap
} from "lucide-react"
import { cn } from "@/lib/utils"

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
    { icon: Calculator, label: "Explain Chain Rule", prompt: "Can you explain the multi-variable chain rule in simple terms?" },
    { icon: Brain, label: "Quiz me on Physics", prompt: "Give me a quick 3-question quiz on Newton's Three Laws." },
    { icon: Lightbulb, label: "Writing Tips", prompt: "How can I improve the introduction of my English essay about Hamlet?" },
]

export function AITutorModal({ isOpen, onOpenChange }: AITutorModalProps) {
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "1",
            role: "assistant",
            content: "Hello Sarah! I'm your AI Academic Tutor. How can I help you with your Calculus or Physics studies today?",
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

    const handleSend = async () => {
        if (!input.trim()) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            timestamp: new Date(),
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setIsTyping(true)

        // Simulate AI response
        setTimeout(() => {
            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: `That's a great question about "${input}". In SmartTutorET, we focus on breaking down complex problems into smaller visible steps. Let's look at the core principles involved...`,
                timestamp: new Date(),
            }
            setMessages(prev => [...prev, aiMsg])
            setIsTyping(false)
        }, 1500)
    }

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-2xl h-[80vh] bg-white rounded-[40px] p-0 overflow-hidden flex flex-col border-slate-200 shadow-2xl">
                <DialogHeader className="p-8 pb-6 border-b border-slate-100 bg-gradient-to-br from-sky-50 to-white shrink-0">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white shadow-xl shadow-sky-500/20 animate-pulse-slow">
                                <Sparkles className="w-8 h-8" />
                            </div>
                            <div>
                                <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    AI Academic <span className="text-sky-600">Tutor</span>
                                </DialogTitle>
                                <DialogDescription className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                    Powered by Personalized Learning Engine
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <div className="flex h-2 w-2 rounded-full bg-emerald-500" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Always Active</span>
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
                                    "max-w-[80%] p-5 rounded-[24px] text-sm font-medium leading-relaxed shadow-sm",
                                    m.role === "assistant"
                                        ? "bg-white text-slate-700 border border-slate-100 rounded-tl-none"
                                        : "bg-sky-600 text-white rounded-tr-none"
                                )}>
                                    {m.content}
                                </div>
                            </div>
                        ))}
                        {isTyping && (
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-white text-sky-600 border border-sky-100 flex items-center justify-center shrink-0 shadow-sm animate-bounce">
                                    <Bot className="w-5 h-5" />
                                </div>
                                <div className="bg-white p-4 rounded-[24px] rounded-tl-none border border-slate-100">
                                    <div className="flex gap-1.5">
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '0ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '150ms' }} />
                                        <div className="w-1.5 h-1.5 rounded-full bg-slate-200 animate-bounce" style={{ animationDelay: '300ms' }} />
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Quick Prompts */}
                    {messages.length < 3 && !isTyping && (
                        <div className="p-8 pt-0 space-y-3 shrink-0">
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-4">Try asking...</p>
                            <div className="flex flex-wrap gap-2">
                                {SUGGESTED_PROMPTS.map((p) => (
                                    <button
                                        key={p.label}
                                        onClick={() => { setInput(p.prompt); }}
                                        className="flex items-center gap-2.5 px-5 py-3 rounded-2xl bg-white border border-slate-100 text-slate-600 hover:border-sky-300 hover:text-sky-600 hover:shadow-lg transition-all text-xs font-bold"
                                    >
                                        <p.icon className="w-4 h-4" />
                                        {p.label}
                                        <ChevronRight className="w-3.5 h-3.5 opacity-40" />
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {/* Input Area */}
                    <div className="p-8 border-t border-slate-100 bg-white shrink-0">
                        <div className="flex gap-3 relative">
                            <Input
                                placeholder="Type your academic question..."
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                className="h-16 rounded-[24px] border-slate-100 bg-slate-50 focus:bg-white focus:ring-sky-500/10 focus:border-sky-500 text-sm font-medium pl-6 pr-16 shadow-inner"
                            />
                            <Button
                                onClick={handleSend}
                                disabled={!input.trim() || isTyping}
                                className="absolute right-2 top-2 h-12 w-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-500/30 p-0"
                            >
                                <Send className="w-5 h-5 translate-x-0.5 -translate-y-0.5" />
                            </Button>
                        </div>
                        <div className="flex items-center justify-center gap-4 mt-6">
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">
                                <Zap className="w-3 h-3" /> Enhanced Learning Mode
                            </div>
                            <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100">
                                <Calculator className="w-3 h-3" /> Active Context: Calculus
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
