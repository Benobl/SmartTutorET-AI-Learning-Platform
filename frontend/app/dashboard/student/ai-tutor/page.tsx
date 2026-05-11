"use client"

import type React from "react"
import { useState, useRef, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Send, Sparkles, Brain, Loader2, 
    History, MessageSquare, Plus,
    Image as ImageIcon, FileText, 
    Mic, MicOff, Volume2, VolumeX,
    ChevronRight, ChevronLeft,
    Trash2, RotateCcw, Lightbulb,
    ExternalLink, BookOpen, GraduationCap
} from "lucide-react"
import ReactMarkdown from "react-markdown"
import remarkGfm from "remark-gfm"
import { Prism as SyntaxHighlighter } from "react-syntax-highlighter"
import { atomDark } from "react-syntax-highlighter/dist/esm/styles/prism"
import { aiApi, uploadApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { ScrollArea } from "@/components/ui/scroll-area"
import { toast } from "sonner"
import { cn } from "@/lib/utils"

interface Message {
    id: string
    role: "user" | "assistant"
    content: string
    attachments?: any[]
    timestamp: Date
}

const suggestedTopics = [
    { icon: "📐", label: "Quadratic Equations", subject: "Math" },
    { icon: "🧬", label: "Mitosis Process", subject: "Biology" },
    { icon: "⚛️", label: "Atomic Structure", subject: "Chemistry" },
    { icon: "🌍", label: "Continental Drift", subject: "Geography" },
]

export default function AITutorPage() {
    const [messages, setMessages] = useState<Message[]>([])
    const [input, setInput] = useState("")
    const [isLoading, setIsLoading] = useState(false)
    const [isSidebarOpen, setIsSidebarOpen] = useState(true)
    const [currentSessionId, setCurrentSessionId] = useState<string | null>(null)
    const [history, setHistory] = useState<any[]>([])
    const [selectedSubject, setSelectedSubject] = useState("General")
    const [attachments, setAttachments] = useState<any[]>([])
    const [isVoiceActive, setIsVoiceActive] = useState(false)
    const [isTtsActive, setIsTtsActive] = useState(true)

    const scrollAreaRef = useRef<HTMLDivElement>(null)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // Load History
    useEffect(() => {
        const loadHistory = async () => {
            try {
                const res = await aiApi.getChatHistory(selectedSubject === "General" ? undefined : selectedSubject)
                setHistory(res.data || [])
            } catch (err) {
                console.error("Failed to load history")
            }
        }
        loadHistory()
    }, [selectedSubject])

    // Scroll to bottom
    useEffect(() => {
        if (scrollAreaRef.current) {
            const scrollContainer = scrollAreaRef.current.querySelector('[data-radix-scroll-area-viewport]')
            if (scrollContainer) {
                scrollContainer.scrollTop = scrollContainer.scrollHeight
            }
        }
    }, [messages, isLoading])

    const handleSendMessage = async (e?: React.FormEvent) => {
        e?.preventDefault()
        if (!input.trim() && attachments.length === 0) return

        const userMsg: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input,
            attachments: [...attachments],
            timestamp: new Date()
        }

        setMessages(prev => [...prev, userMsg])
        setInput("")
        setAttachments([])
        setIsLoading(true)

        try {
            const res = await aiApi.askTutor({
                subject: selectedSubject,
                query: input,
                historyId: currentSessionId || undefined,
                attachments: userMsg.attachments?.map(a => ({
                    type: a.type,
                    url: a.url,
                    name: a.name
                }))
            })

            const aiMsg: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: res.data.response,
                timestamp: new Date()
            }

            setMessages(prev => [...prev, aiMsg])
            setCurrentSessionId(res.data.sessionId)
            
            // Speak if TTS is active
            if (isTtsActive) {
                speak(res.data.response)
            }

        } catch (err: any) {
            toast.error(err.message || "Failed to get AI response")
        } finally {
            setIsLoading(false)
        }
    }

    const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        const isImage = file.type.startsWith("image/")
        const isPdf = file.type === "application/pdf"

        if (!isImage && !isPdf) {
            toast.error("Only images and PDFs are supported")
            return
        }

        toast.loading(`Uploading ${file.name}...`)
        try {
            const res = await uploadApi.uploadDocument(file, "assignment")
            setAttachments(prev => [...prev, {
                type: isImage ? "image" : "pdf",
                url: res.url,
                name: file.name
            }])
            toast.dismiss()
            toast.success("Uploaded successfully")
        } catch (err) {
            toast.dismiss()
            toast.error("Upload failed")
        }
    }

    const speak = (text: string) => {
        if (!window.speechSynthesis) return
        // Strip markdown for speech
        const cleanText = text.replace(/[#*`_]/g, '')
        const utterance = new SpeechSynthesisUtterance(cleanText)
        window.speechSynthesis.cancel()
        window.speechSynthesis.speak(utterance)
    }

    const toggleVoice = () => {
        const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
        if (!SpeechRecognition) {
            toast.error("Voice recognition not supported in this browser")
            return
        }

        if (isVoiceActive) {
            setIsVoiceActive(false)
            return
        }

        const recognition = new SpeechRecognition()
        recognition.continuous = false
        recognition.interimResults = false
        recognition.lang = "en-US"

        recognition.onstart = () => setIsVoiceActive(true)
        recognition.onend = () => setIsVoiceActive(false)
        recognition.onresult = (event: any) => {
            const transcript = event.results[0][0].transcript
            setInput(transcript)
        }
        recognition.start()
    }

    return (
        <div className="flex h-[calc(100vh-100px)] bg-slate-50/50 rounded-[40px] overflow-hidden border border-slate-200/50 shadow-2xl">
            {/* Sidebar - History */}
            <AnimatePresence>
                {isSidebarOpen && (
                    <motion.div 
                        initial={{ width: 0, opacity: 0 }}
                        animate={{ width: 320, opacity: 1 }}
                        exit={{ width: 0, opacity: 0 }}
                        className="bg-white border-r border-slate-100 flex flex-col"
                    >
                        <div className="p-6 border-b border-slate-50 flex items-center justify-between">
                            <h2 className="text-sm font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                                <History className="w-4 h-4 text-sky-500" />
                                Sessions
                            </h2>
                            <Button variant="ghost" size="icon" onClick={() => {setMessages([]); setCurrentSessionId(null)}} className="rounded-xl h-8 w-8">
                                <Plus className="w-4 h-4" />
                            </Button>
                        </div>
                        
                        <ScrollArea className="flex-1 p-4">
                            <div className="space-y-2">
                                {history.map((session) => (
                                    <button 
                                        key={session._id}
                                        onClick={() => {
                                            setMessages(session.messages)
                                            setCurrentSessionId(session._id)
                                        }}
                                        className={cn(
                                            "w-full p-4 rounded-2xl text-left transition-all group relative overflow-hidden border",
                                            currentSessionId === session._id 
                                                ? "bg-slate-900 border-slate-900 text-white shadow-lg" 
                                                : "bg-white border-slate-100 text-slate-600 hover:border-sky-200 hover:bg-sky-50/50"
                                        )}
                                    >
                                        <p className="text-[10px] font-black uppercase tracking-tighter opacity-50 mb-1">
                                            {session.subject} • {new Date(session.updatedAt).toLocaleDateString()}
                                        </p>
                                        <p className="text-sm font-bold line-clamp-1 italic">
                                            {session.title || "Untitled Session"}
                                        </p>
                                    </button>
                                ))}
                            </div>
                        </ScrollArea>

                        <div className="p-6 border-t border-slate-50 space-y-4">
                            <div className="bg-sky-50 rounded-3xl p-4 border border-sky-100">
                                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Weekly Progress</p>
                                <div className="h-2 bg-sky-200 rounded-full overflow-hidden">
                                    <div className="h-full bg-sky-500 w-[65%]" />
                                </div>
                                <p className="text-[9px] font-bold text-sky-400 mt-2 italic">12 concepts mastered this week!</p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* Main Chat Area */}
            <div className="flex-1 flex flex-col relative bg-white/40 backdrop-blur-sm">
                {/* Header */}
                <div className="h-20 border-b border-slate-100/50 px-8 flex items-center justify-between">
                    <div className="flex items-center gap-4">
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                            className="rounded-xl border border-slate-100"
                        >
                            {isSidebarOpen ? <ChevronLeft className="w-4 h-4" /> : <ChevronRight className="w-4 h-4" />}
                        </Button>
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg rotate-3 group-hover:rotate-0 transition-all">
                                <Sparkles className="w-5 h-5 text-sky-400 animate-pulse" />
                            </div>
                            <div>
                                <h1 className="text-lg font-black text-slate-900 tracking-tight">SmartTutor <span className="text-sky-500">AI</span></h1>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest flex items-center gap-1">
                                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                                    Online & Thinking
                                </p>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <select 
                            value={selectedSubject}
                            onChange={(e) => setSelectedSubject(e.target.value)}
                            className="bg-slate-50 border border-slate-100 rounded-xl px-4 py-2 text-xs font-black uppercase tracking-widest text-slate-600 focus:outline-none focus:ring-2 focus:ring-sky-500"
                        >
                            <option>General</option>
                            <option>Math</option>
                            <option>Physics</option>
                            <option>Chemistry</option>
                            <option>Biology</option>
                            <option>English</option>
                        </select>
                        <Button 
                            variant="ghost" 
                            size="icon" 
                            onClick={() => setIsTtsActive(!isTtsActive)}
                            className={cn("rounded-xl border", isTtsActive ? "text-sky-500 border-sky-100 bg-sky-50" : "text-slate-400 border-slate-100")}
                        >
                            {isTtsActive ? <Volume2 className="w-4 h-4" /> : <VolumeX className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>

                {/* Messages Container */}
                <ScrollArea ref={scrollAreaRef} className="flex-1 p-8">
                    <div className="max-w-4xl mx-auto space-y-10">
                        {messages.length === 0 ? (
                            <div className="py-20 text-center space-y-12">
                                <motion.div 
                                    initial={{ scale: 0.8, opacity: 0 }}
                                    animate={{ scale: 1, opacity: 1 }}
                                    className="w-24 h-24 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 flex items-center justify-center mx-auto shadow-2xl relative"
                                >
                                    <Brain className="w-12 h-12 text-sky-400" />
                                    <div className="absolute -right-2 -bottom-2 w-8 h-8 rounded-full bg-sky-500 border-4 border-white flex items-center justify-center animate-bounce">
                                        <Sparkles className="w-4 h-4 text-white" />
                                    </div>
                                </motion.div>
                                
                                <div className="space-y-4">
                                    <h2 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">
                                        Ready to master <span className="text-sky-600 underline decoration-sky-200 underline-offset-8 decoration-4">{selectedSubject}</span>?
                                    </h2>
                                    <p className="text-slate-400 font-medium text-lg max-w-xl mx-auto italic">
                                        I'm your personal tutor. Ask me for homework help, complex explanations, or exam preparation tips.
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4 max-w-2xl mx-auto">
                                    {suggestedTopics.map((topic, i) => (
                                        <motion.button
                                            key={i}
                                            initial={{ y: 20, opacity: 0 }}
                                            animate={{ y: 0, opacity: 1 }}
                                            transition={{ delay: i * 0.1 }}
                                            onClick={() => setInput(`Explain ${topic.label} to me like I'm a student in Ethiopia.`)}
                                            className="p-6 rounded-[32px] bg-white border border-slate-100 hover:border-sky-200 hover:bg-sky-50/30 text-left group transition-all shadow-sm hover:shadow-xl"
                                        >
                                            <span className="text-2xl mb-4 block group-hover:scale-125 transition-transform">{topic.icon}</span>
                                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">{topic.subject}</p>
                                            <p className="text-sm font-bold text-slate-700 italic">{topic.label}</p>
                                        </motion.button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            messages.map((msg, i) => (
                                <motion.div 
                                    key={msg.id}
                                    initial={{ y: 20, opacity: 0 }}
                                    animate={{ y: 0, opacity: 1 }}
                                    className={cn(
                                        "flex gap-6",
                                        msg.role === "user" ? "flex-row-reverse" : "flex-row"
                                    )}
                                >
                                    <Avatar className={cn(
                                        "w-12 h-12 rounded-2xl shadow-lg border-2",
                                        msg.role === "user" ? "border-sky-100" : "border-slate-100"
                                    )}>
                                        <AvatarImage src={msg.role === "user" ? undefined : "/ai-avatar.png"} />
                                        <AvatarFallback className={cn(
                                            "rounded-2xl font-black",
                                            msg.role === "user" ? "bg-sky-500 text-white" : "bg-slate-900 text-white"
                                        )}>
                                            {msg.role === "user" ? "U" : "AI"}
                                        </AvatarFallback>
                                    </Avatar>

                                    <div className={cn(
                                        "max-w-[80%] space-y-4",
                                        msg.role === "user" ? "items-end" : "items-start"
                                    )}>
                                        <div className={cn(
                                            "p-6 rounded-[32px] shadow-sm text-sm leading-relaxed",
                                            msg.role === "user" 
                                                ? "bg-sky-600 text-white rounded-tr-none" 
                                                : "bg-white border border-slate-100 text-slate-700 rounded-tl-none prose prose-slate max-w-none italic"
                                        )}>
                                            <ReactMarkdown 
                                                remarkPlugins={[remarkGfm]}
                                                components={{
                                                    code({ node, inline, className, children, ...props }: any) {
                                                        const match = /language-(\w+)/.exec(className || "")
                                                        return !inline && match ? (
                                                            <SyntaxHighlighter
                                                                style={atomDark}
                                                                language={match[1]}
                                                                PreTag="div"
                                                                className="rounded-xl my-4"
                                                                {...props}
                                                            >
                                                                {String(children).replace(/\n$/, "")}
                                                            </SyntaxHighlighter>
                                                        ) : (
                                                            <code className={cn("bg-slate-100 px-1 rounded", className)} {...props}>
                                                                {children}
                                                            </code>
                                                        )
                                                    }
                                                }}
                                            >
                                                {msg.content}
                                            </ReactMarkdown>

                                            {msg.attachments?.length ? (
                                                <div className="mt-4 flex flex-wrap gap-2">
                                                    {msg.attachments.map((at, j) => (
                                                        <div key={j} className="flex items-center gap-2 p-2 rounded-xl bg-black/5 border border-black/5 text-[10px] font-black uppercase tracking-widest">
                                                            {at.type === "image" ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                            <span className="truncate max-w-[100px]">{at.name}</span>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : null}
                                        </div>
                                        <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-2 italic">
                                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        </span>
                                    </div>
                                </motion.div>
                            ))
                        )}

                        {isLoading && (
                            <motion.div 
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                className="flex gap-6"
                            >
                                <div className="w-12 h-12 rounded-2xl bg-slate-900 flex items-center justify-center shadow-lg">
                                    <Loader2 className="w-6 h-6 text-sky-400 animate-spin" />
                                </div>
                                <div className="flex flex-col gap-2">
                                    <div className="h-10 w-48 bg-slate-100 rounded-full animate-pulse" />
                                    <div className="h-4 w-32 bg-slate-50 rounded-full animate-pulse" />
                                </div>
                            </motion.div>
                        )}
                    </div>
                </ScrollArea>

                {/* Input Area */}
                <div className="p-8 bg-white border-t border-slate-100 relative z-20">
                    <div className="max-w-4xl mx-auto space-y-4">
                        {/* Attachments Preview */}
                        <AnimatePresence>
                            {attachments.length > 0 && (
                                <motion.div 
                                    initial={{ height: 0, opacity: 0 }}
                                    animate={{ height: "auto", opacity: 1 }}
                                    exit={{ height: 0, opacity: 0 }}
                                    className="flex gap-2 pb-2"
                                >
                                    {attachments.map((at, i) => (
                                        <div key={i} className="group relative">
                                            <div className="flex items-center gap-2 px-4 py-2 rounded-xl bg-sky-50 border border-sky-100 text-[10px] font-black uppercase tracking-widest text-sky-600">
                                                {at.type === "image" ? <ImageIcon className="w-3 h-3" /> : <FileText className="w-3 h-3" />}
                                                {at.name}
                                                <button onClick={() => setAttachments(attachments.filter((_, j) => i !== j))} className="ml-2 hover:text-red-500">
                                                    <Plus className="w-3 h-3 rotate-45" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </motion.div>
                            )}
                        </AnimatePresence>

                        <form 
                            onSubmit={handleSendMessage}
                            className="relative group bg-slate-50 rounded-[32px] border-2 border-slate-100 focus-within:border-sky-500/50 focus-within:bg-white transition-all p-2 flex items-center shadow-sm focus-within:shadow-2xl"
                        >
                            <Button 
                                type="button" 
                                variant="ghost" 
                                size="icon" 
                                onClick={() => fileInputRef.current?.click()}
                                className="rounded-2xl h-12 w-12 text-slate-400 hover:text-sky-500 hover:bg-sky-50"
                            >
                                <ImageIcon className="w-5 h-5" />
                            </Button>
                            <input 
                                type="file" 
                                ref={fileInputRef} 
                                className="hidden" 
                                onChange={handleFileUpload}
                                accept="image/*,application/pdf"
                            />
                            
                            <Input 
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Ask me anything... (e.g. 'Solve this math problem' or 'How does gravity work?')"
                                className="flex-1 bg-transparent border-none focus-visible:ring-0 text-sm font-bold placeholder:text-slate-400 placeholder:italic h-12"
                                disabled={isLoading}
                            />

                            <div className="flex items-center gap-1 px-2">
                                <Button 
                                    type="button" 
                                    variant="ghost" 
                                    size="icon" 
                                    onClick={toggleVoice}
                                    className={cn(
                                        "rounded-2xl h-12 w-12 transition-all",
                                        isVoiceActive ? "text-red-500 bg-red-50" : "text-slate-400 hover:text-sky-500 hover:bg-sky-50"
                                    )}
                                >
                                    {isVoiceActive ? <Mic className="w-5 h-5 animate-pulse" /> : <MicOff className="w-5 h-5" />}
                                </Button>
                                <Button 
                                    type="submit"
                                    disabled={isLoading || (!input.trim() && attachments.length === 0)}
                                    className="rounded-2xl h-12 w-12 bg-slate-900 hover:bg-sky-600 text-white shadow-lg transition-all active:scale-95"
                                >
                                    <Send className="w-5 h-5" />
                                </Button>
                            </div>
                        </form>
                        <div className="flex items-center justify-between px-6">
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest italic">
                                SmartTutor AI leverages GPT-4o for expert pedagogy.
                            </p>
                            <div className="flex items-center gap-4 text-[9px] font-black text-slate-400 uppercase tracking-widest">
                                <span className="flex items-center gap-1 hover:text-sky-500 cursor-pointer italic"><RotateCcw className="w-3 h-3" /> Clear Chat</span>
                                <span className="flex items-center gap-1 hover:text-sky-500 cursor-pointer italic"><GraduationCap className="w-3 h-3" /> Exam Prep Mode</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Right Sidebar - Weak Topics & Resources */}
            <div className="w-[300px] border-l border-slate-100 bg-white p-8 space-y-10">
                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <Brain className="w-4 h-4 text-sky-500" />
                        Weak Topics
                    </h3>
                    <div className="flex flex-wrap gap-2">
                        {["Derivatives", "Periodic Table", "Cell Structure"].map((topic) => (
                            <div key={topic} className="px-3 py-1.5 rounded-full bg-red-50 text-[10px] font-black uppercase tracking-widest text-red-600 border border-red-100 italic">
                                {topic}
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-6">
                    <h3 className="text-xs font-black uppercase tracking-widest text-slate-900 flex items-center gap-2">
                        <BookOpen className="w-4 h-4 text-indigo-500" />
                        Resources
                    </h3>
                    <div className="space-y-3">
                        {[
                            { title: "Mastering Algebra 101", type: "Video", color: "bg-red-50 text-red-600" },
                            { title: "Chemistry Revision PDF", type: "Document", color: "bg-sky-50 text-sky-600" },
                        ].map((res, i) => (
                            <div key={i} className="p-4 rounded-2xl border border-slate-50 hover:border-slate-100 transition-all cursor-pointer group">
                                <p className={cn("text-[8px] font-black uppercase tracking-widest px-2 py-0.5 rounded-full inline-block mb-2", res.color)}>
                                    {res.type}
                                </p>
                                <p className="text-sm font-bold text-slate-700 group-hover:text-slate-900 italic line-clamp-1">{res.title}</p>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="p-6 rounded-[32px] bg-gradient-to-br from-slate-900 to-slate-800 text-white relative overflow-hidden group shadow-xl">
                    <div className="absolute -right-4 -bottom-4 w-20 h-20 bg-sky-500/20 rounded-full blur-2xl group-hover:scale-150 transition-all duration-700" />
                    <Lightbulb className="w-8 h-8 text-sky-400 mb-4" />
                    <p className="text-xs font-black uppercase tracking-widest opacity-50 mb-2">Study Tip</p>
                    <p className="text-sm font-bold italic leading-relaxed">
                        "The best way to learn is to teach someone else. Try explaining this topic to me!"
                    </p>
                </div>
            </div>
        </div>
    )
}
