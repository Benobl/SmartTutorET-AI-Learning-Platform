"use client"

import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { Sparkles, X, Send, BrainCircuit, Maximize2, Minimize2, Mic, Paperclip, Loader2, User, ScanEye } from "lucide-react"
import { cn } from "@/lib/utils"
import { usePathname } from "next/navigation"

export function GlobalAITutor() {
    const pathname = usePathname()
    const [isOpen, setIsOpen] = useState(false)
    const [isExpanded, setIsExpanded] = useState(false)
    const [messages, setMessages] = useState<{role: 'ai'|'user', content: string}[]>([
        { role: 'ai', content: "Hello! I am your Neural Assistant. I am currently analyzing your environment. How can I help you accelerate your learning today?" }
    ])
    const [inputValue, setInputValue] = useState("")
    const [isThinking, setIsThinking] = useState(false)
    const messagesEndRef = useRef<HTMLDivElement>(null)

    const getContextName = () => {
        if (!pathname) return "Dashboard Overview"
        const segments = pathname.split('/').filter(Boolean)
        if (segments.length <= 2) return "Dashboard Overview"
        return segments[segments.length - 1].replace(/-/g, ' ').replace(/\b\w/g, l => l.toUpperCase()) + " Page"
    }

    // Auto-scroll to bottom
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages, isThinking])

    const handleSend = () => {
        if (!inputValue.trim()) return

        // Add user message
        const newMsgs = [...messages, { role: 'user' as const, content: inputValue }]
        setMessages(newMsgs)
        setInputValue("")
        setIsThinking(true)

        // Mock AI response (To be integrated by AI developer)
        setTimeout(() => {
            setIsThinking(false)
            setMessages([...newMsgs, { 
                role: 'ai', 
                content: "That's a great question. I am currently operating in UI Demo mode, but once the backend logic is connected, I will provide highly contextual answers based on the page you are currently viewing!" 
            }])
        }, 1500)
    }

    return (
        <>
            {/* Floating Action Button */}
            <AnimatePresence>
                {!isOpen && (
                    <motion.button
                        initial={{ scale: 0, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        exit={{ scale: 0, opacity: 0 }}
                        whileHover={{ scale: 1.1, rotate: 5 }}
                        whileTap={{ scale: 0.9 }}
                        onClick={() => setIsOpen(true)}
                        className="fixed bottom-8 right-8 z-[100] w-16 h-16 rounded-full bg-slate-900 shadow-[0_0_40px_rgba(14,165,233,0.5)] flex items-center justify-center group overflow-hidden border border-sky-500/30"
                    >
                        {/* Animated Gradient Background */}
                        <div className="absolute inset-0 bg-gradient-to-tr from-sky-600 via-indigo-600 to-purple-600 opacity-80 group-hover:opacity-100 transition-opacity duration-500" />
                        <div className="absolute inset-0 opacity-10 mix-blend-overlay bg-black/5" />
                        
                        <Sparkles className="w-7 h-7 text-white relative z-10 animate-pulse" />
                        
                        {/* Ping rings */}
                        <div className="absolute inset-0 rounded-full border-2 border-sky-400 opacity-0 group-hover:animate-ping" style={{ animationDuration: '2s' }} />
                    </motion.button>
                )}
            </AnimatePresence>

            {/* Chat Overlay */}
            <AnimatePresence>
                {isOpen && (
                    <motion.div
                        initial={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        animate={{ 
                            opacity: 1, 
                            y: 0, 
                            scale: 1,
                            filter: "blur(0px)",
                            width: isExpanded ? '85vw' : '420px',
                            height: isExpanded ? '85vh' : '650px',
                            right: isExpanded ? '7.5vw' : '2rem',
                            bottom: isExpanded ? '7.5vh' : '2rem'
                        }}
                        exit={{ opacity: 0, y: 30, scale: 0.9, filter: "blur(10px)" }}
                        transition={{ type: "spring", stiffness: 350, damping: 28 }}
                        style={{ transformOrigin: "bottom right" }}
                        className={cn(
                            "fixed bottom-8 right-8 z-[100] bg-slate-900/80 backdrop-blur-3xl border border-white/10 shadow-[0_0_80px_rgba(14,165,233,0.2)] overflow-hidden flex flex-col",
                            isExpanded ? "rounded-[40px]" : "rounded-[32px]"
                        )}
                    >
                        {/* Inner subtle glow border */}
                        <div className="absolute inset-0 rounded-[inherit] border border-white/5 pointer-events-none" />

                        {/* Header */}
                        <div className="px-6 py-5 bg-white/5 border-b border-white/10 flex flex-col relative z-10 overflow-hidden">
                            <div className="absolute inset-0 bg-gradient-to-r from-sky-500/20 to-purple-500/20 blur-xl opacity-50" />
                            <div className="flex items-center justify-between relative z-10">
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center border border-white/20 shadow-[0_0_20px_rgba(14,165,233,0.4)]">
                                        <BrainCircuit className="w-6 h-6 text-white" />
                                    </div>
                                    <div>
                                        <h3 className="font-black tracking-tighter text-lg text-transparent bg-clip-text bg-gradient-to-r from-white to-white/70">Neural Core A.I.</h3>
                                        <div className="flex items-center gap-2 mt-0.5">
                                            <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.8)] animate-pulse" />
                                            <span className="text-[10px] uppercase tracking-widest font-black text-emerald-400">System Online</span>
                                        </div>
                                    </div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <button 
                                        onClick={() => setIsExpanded(!isExpanded)}
                                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors border border-white/5 text-slate-300 hover:text-white"
                                    >
                                        {isExpanded ? <Minimize2 className="w-4 h-4" /> : <Maximize2 className="w-4 h-4" />}
                                    </button>
                                    <button 
                                        onClick={() => setIsOpen(false)}
                                        className="w-10 h-10 rounded-xl bg-white/5 hover:bg-rose-500/20 flex items-center justify-center transition-colors border border-white/5 text-slate-300 hover:text-rose-400"
                                    >
                                        <X className="w-5 h-5" />
                                    </button>
                                </div>
                            </div>
                            
                            {/* Context Chip */}
                            <div className="mt-4 flex items-center gap-2 relative z-10 bg-slate-800/80 w-fit px-3 py-1.5 rounded-full border border-white/10 backdrop-blur-md">
                                <ScanEye className="w-3.5 h-3.5 text-sky-400" />
                                <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest">
                                    Analyzing Context: <span className="text-sky-400">{getContextName()}</span>
                                </span>
                            </div>
                        </div>

                        {/* Chat History */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar relative">
                            {/* Background noise/mesh */}
                            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-sky-900/20 via-slate-900/0 to-slate-900/0 pointer-events-none" />
                            
                            {messages.map((msg, idx) => (
                                <motion.div 
                                    key={idx}
                                    initial={{ opacity: 0, y: 20, scale: 0.95 }}
                                    animate={{ opacity: 1, y: 0, scale: 1 }}
                                    transition={{ type: "spring", stiffness: 400, damping: 25 }}
                                    className={cn(
                                        "flex gap-4 max-w-[85%] relative z-10",
                                        msg.role === 'user' ? "ml-auto flex-row-reverse" : "mr-auto"
                                    )}
                                >
                                    <div className={cn(
                                        "w-8 h-8 rounded-full flex items-center justify-center shrink-0 shadow-lg border border-white/10",
                                        msg.role === 'user' ? "bg-slate-800 text-slate-300" : "bg-gradient-to-br from-sky-500 to-indigo-600 text-white"
                                    )}>
                                        {msg.role === 'user' ? <User className="w-4 h-4" /> : <Sparkles className="w-4 h-4" />}
                                    </div>
                                    <div className={cn(
                                        "p-4 rounded-2xl text-sm font-medium leading-relaxed shadow-lg backdrop-blur-md",
                                        msg.role === 'user' 
                                            ? "bg-slate-800/80 text-white border border-white/10 rounded-tr-sm" 
                                            : "bg-white/10 text-slate-200 border border-white/10 rounded-tl-sm"
                                    )}>
                                        {msg.content}
                                    </div>
                                </motion.div>
                            ))}

                            {isThinking && (
                                <motion.div 
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 1 }}
                                    className="flex gap-4 max-w-[85%] mr-auto relative z-10"
                                >
                                    <div className="w-8 h-8 rounded-full bg-gradient-to-br from-sky-500 to-indigo-600 text-white flex items-center justify-center shrink-0 shadow-lg border border-white/10">
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    </div>
                                    <div className="p-4 rounded-2xl bg-white/10 border border-white/10 text-slate-200 rounded-tl-sm shadow-lg flex flex-col gap-2 backdrop-blur-md">
                                        <p className="text-[10px] font-black uppercase tracking-widest text-sky-400 mb-1">Synthesizing</p>
                                        <div className="flex gap-1.5">
                                            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '0ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '150ms' }} />
                                            <div className="w-2 h-2 rounded-full bg-sky-400 animate-bounce" style={{ animationDelay: '300ms' }} />
                                        </div>
                                    </div>
                                </motion.div>
                            )}
                            <div ref={messagesEndRef} />
                        </div>

                        {/* Input Area */}
                        <div className="p-4 bg-slate-900/50 backdrop-blur-xl border-t border-white/10 z-10 relative">
                            <div className="flex items-center gap-2 bg-slate-800/80 p-2 rounded-2xl border border-white/10 focus-within:border-sky-500/50 focus-within:ring-4 focus-within:ring-sky-500/20 transition-all shadow-inner">
                                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                                    <Paperclip className="w-5 h-5" />
                                </button>
                                <input 
                                    type="text"
                                    value={inputValue}
                                    onChange={(e) => setInputValue(e.target.value)}
                                    onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                                    placeholder="Initialize command sequence..."
                                    className="flex-1 bg-transparent border-none focus:outline-none text-sm font-medium text-white placeholder:text-slate-500 px-2"
                                />
                                <button className="w-10 h-10 rounded-xl flex items-center justify-center text-slate-400 hover:bg-slate-700 hover:text-white transition-colors">
                                    <Mic className="w-5 h-5" />
                                </button>
                                <button 
                                    onClick={handleSend}
                                    disabled={!inputValue.trim() || isThinking}
                                    className="w-10 h-10 rounded-xl bg-gradient-to-r from-sky-500 to-indigo-600 disabled:opacity-50 text-white flex items-center justify-center shadow-lg hover:shadow-sky-500/50 transition-all border border-white/20"
                                >
                                    <Send className="w-4 h-4 ml-1" />
                                </button>
                            </div>
                            <div className="mt-3 flex justify-between items-center px-2">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-amber-400 animate-pulse" />
                                    <span className="text-[8px] font-black text-amber-400 uppercase tracking-[0.3em]">Integration Ready</span>
                                </div>
                                <span className="text-[8px] font-black text-slate-600 uppercase tracking-[0.2em]">
                                    v2.0 UI Shell
                                </span>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </>
    )
}
