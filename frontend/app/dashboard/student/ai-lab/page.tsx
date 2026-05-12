"use client";

import React, { useState, useRef, useEffect } from "react";
import { 
    Send, 
    Sparkles, 
    Bot, 
    User, 
    Loader2, 
    Cpu, 
    Zap, 
    MessageSquare, 
    ArrowLeft,
    BrainCircuit,
    Layers,
    Info
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import { aiApi } from "@/lib/api";
import Link from "next/link";

interface Message {
    role: "user" | "assistant";
    content: string;
    model?: string;
    timestamp: Date;
}

export default function AILabPage() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [selectedModel, setSelectedModel] = useState<"llama" | "gemini">("llama");
    const scrollRef = useRef<HTMLDivElement>(null);

    // Auto-scroll to bottom
    useEffect(() => {
        if (scrollRef.current) {
            scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
        }
    }, [messages, isLoading]);

    const handleSend = async () => {
        if (!input.trim() || isLoading) return;

        const userMsg: Message = {
            role: "user",
            content: input,
            timestamp: new Date()
        };

        setMessages(prev => [...prev, userMsg]);
        const currentInput = input;
        setInput("");
        setIsLoading(true);

        try {
            // Real AI integration
            const res = await aiApi.getTutorResponse({
                studentQuery: currentInput,
                context: `The student is currently viewing the AI Lab.`,
                modelPreference: selectedModel,
                conversationHistory: [...messages, { role: 'user', content: currentInput }].map(m => ({ 
                    role: m.role === 'assistant' ? 'assistant' : 'user', 
                    content: m.content 
                }))
            });

            const aiResponse = res.data?.response || res.data || res.response || res;

            const assistantMsg: Message = {
                role: "assistant",
                content: typeof aiResponse === 'string' ? aiResponse : JSON.stringify(aiResponse),
                model: selectedModel === "llama" ? "Meta Llama-3" : "Google Gemini 1.5",
                timestamp: new Date()
            };

            setMessages(prev => [...prev, assistantMsg]);
        } catch (error: any) {
            console.error("AI Lab Error:", error);
            setMessages(prev => [...prev, {
                role: "assistant",
                content: "⚠️ System error. The AI neural link was interrupted. Please try again.",
                timestamp: new Date()
            }]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-[#050505] text-white flex flex-col font-sans selection:bg-sky-500/30">
            {/* Advanced Header */}
            <header className="h-16 border-b border-white/5 bg-black/40 backdrop-blur-xl flex items-center justify-between px-6 sticky top-0 z-50">
                <div className="flex items-center gap-4">
                    <Link href="/dashboard/student">
                        <Button variant="ghost" size="icon" className="rounded-full hover:bg-white/5 text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Button>
                    </Link>
                    <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 flex items-center justify-center border border-sky-500/20">
                            <BrainCircuit className="w-4 h-4 text-sky-400" />
                        </div>
                        <div>
                            <h1 className="text-xs font-black uppercase tracking-[0.2em] text-white">AI Neural Lab</h1>
                            <p className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">Experimental Pedagogical Intelligence</p>
                        </div>
                    </div>
                </div>

                <div className="flex items-center gap-2 bg-white/5 p-1 rounded-xl border border-white/5">
                    <button 
                        onClick={() => setSelectedModel("llama")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            selectedModel === "llama" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Zap className="w-3 h-3" /> Llama-3
                    </button>
                    <button 
                        onClick={() => setSelectedModel("gemini")}
                        className={cn(
                            "px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all flex items-center gap-2",
                            selectedModel === "gemini" ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20" : "text-slate-500 hover:text-white"
                        )}
                    >
                        <Sparkles className="w-3 h-3" /> Gemini
                    </button>
                </div>
            </header>

            {/* Chat Area */}
            <main className="flex-1 overflow-hidden relative flex flex-col max-w-4xl mx-auto w-full">
                <div 
                    ref={scrollRef}
                    className="flex-1 overflow-y-auto p-6 space-y-8 scroll-smooth"
                >
                    {messages.length === 0 ? (
                        <div className="h-full flex flex-col items-center justify-center text-center space-y-6 opacity-60">
                            <div className="relative">
                                <div className="w-20 h-20 rounded-3xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center animate-pulse">
                                    <Bot className="w-10 h-10 text-sky-400" />
                                </div>
                                <div className="absolute -top-2 -right-2 w-6 h-6 rounded-full bg-indigo-500 flex items-center justify-center border-4 border-[#050505]">
                                    <Sparkles className="w-3 h-3 text-white" />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <h2 className="text-xl font-bold tracking-tight">System Ready</h2>
                                <p className="text-sm text-slate-400 max-w-sm mx-auto">
                                    Ask anything about the Ethiopian curriculum. I am trained on Grade 9-12 textbooks and national exam patterns.
                                </p>
                            </div>
                            <div className="grid grid-cols-2 gap-3 w-full max-w-md">
                                {[
                                    "Explain Photosynthesis step-by-step",
                                    "Solve a Grade 10 quadratic equation",
                                    "Historical context of Adwa",
                                    "Tips for Grade 12 National Exam"
                                ].map(tip => (
                                    <button 
                                        key={tip}
                                        onClick={() => setInput(tip)}
                                        className="p-3 rounded-xl bg-white/5 border border-white/5 text-[10px] font-bold text-slate-300 hover:bg-white/10 hover:border-sky-500/30 text-left transition-all"
                                    >
                                        {tip}
                                    </button>
                                ))}
                            </div>
                        </div>
                    ) : (
                        messages.map((msg, idx) => (
                            <div 
                                key={idx}
                                className={cn(
                                    "flex gap-4 animate-in fade-in slide-in-from-bottom-4 duration-500",
                                    msg.role === "assistant" ? "flex-row" : "flex-row-reverse"
                                )}
                            >
                                <div className={cn(
                                    "w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 border",
                                    msg.role === "assistant" ? "bg-sky-500/10 border-sky-500/20" : "bg-white/10 border-white/20"
                                )}>
                                    {msg.role === "assistant" ? <Bot className="w-4 h-4 text-sky-400" /> : <User className="w-4 h-4 text-white" />}
                                </div>
                                <div className={cn(
                                    "max-w-[80%] space-y-2",
                                    msg.role === "user" ? "text-right" : "text-left"
                                )}>
                                    <div className={cn(
                                        "inline-block p-4 rounded-2xl text-sm leading-relaxed",
                                        msg.role === "assistant" 
                                            ? "bg-zinc-900 border border-white/5 text-slate-200" 
                                            : "bg-sky-600 text-white font-medium"
                                    )}>
                                        {msg.content}
                                    </div>
                                    <div className="flex items-center gap-2 text-[8px] font-black uppercase tracking-widest text-slate-600 px-2">
                                        <span>{msg.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                                        {msg.model && (
                                            <>
                                                <span className="w-1 h-1 rounded-full bg-slate-800" />
                                                <span className="text-sky-500/60">{msg.model}</span>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                    {isLoading && (
                        <div className="flex gap-4 animate-pulse">
                            <div className="w-8 h-8 rounded-lg bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                                <Loader2 className="w-4 h-4 text-sky-400 animate-spin" />
                            </div>
                            <div className="p-4 rounded-2xl bg-zinc-900 border border-white/5">
                                <div className="flex gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40 animate-bounce" style={{ animationDelay: '0ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40 animate-bounce" style={{ animationDelay: '150ms' }} />
                                    <div className="w-1.5 h-1.5 rounded-full bg-sky-500/40 animate-bounce" style={{ animationDelay: '300ms' }} />
                                </div>
                            </div>
                        </div>
                    )}
                </div>

                {/* Input Area */}
                <div className="p-6 bg-gradient-to-t from-[#050505] via-[#050505] to-transparent">
                    <div className="relative max-w-3xl mx-auto">
                        <div className="absolute inset-0 bg-sky-500/20 blur-2xl rounded-full opacity-10 pointer-events-none" />
                        <div className="relative flex gap-3 p-2 rounded-2xl bg-zinc-900/50 backdrop-blur-xl border border-white/10 shadow-2xl focus-within:border-sky-500/50 transition-all">
                            <Input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && handleSend()}
                                placeholder="Message AI Neural Lab..."
                                className="border-0 bg-transparent focus-visible:ring-0 text-sm h-12"
                            />
                            <Button 
                                onClick={handleSend}
                                disabled={isLoading || !input.trim()}
                                className="h-12 w-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white p-0 transition-transform active:scale-95"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-[8px] text-center text-slate-600 mt-3 font-black uppercase tracking-[0.2em]">
                            SmartTutorET Multi-Model Architecture • v2.1 Advanced Lab
                        </p>
                    </div>
                </div>
            </main>
        </div>
    );
}
