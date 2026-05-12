"use client"

import { useEffect, useState, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import { 
    Search, 
    Plus, 
    MessageSquare, 
    ThumbsUp, 
    Clock, 
    Filter,
    User,
    ArrowRight,
    Loader2,
    CheckCircle2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"

// Mock API - In a real app, this would use lib/api
const mockQuestions = [
    {
        _id: "1",
        title: "How to solve quadratic equations using the formula?",
        content: "I'm having trouble understanding where the ± comes from in the formula. Can someone explain?",
        author: { name: "Abebe Kebede", avatar: "" },
        subject: "Mathematics",
        upvotes: 12,
        answers: 4,
        createdAt: new Date().toISOString(),
        isSolved: true
    },
    {
        _id: "2",
        title: "Difference between mitosis and meiosis?",
        content: "I keep getting these two confused in Biology. Is there a simple way to remember which is which?",
        author: { name: "Sara Tefera", avatar: "" },
        subject: "Biology",
        upvotes: 8,
        answers: 2,
        createdAt: new Date().toISOString(),
        isSolved: false
    }
]

export default function QuestionsForumPage() {
    const [questions, setQuestions] = useState(mockQuestions)
    const [loading, setLoading] = useState(false)
    const [search, setSearch] = useState("")

    return (
        <div className="max-w-7xl mx-auto space-y-12 animate-in fade-in duration-700 pb-32 pt-8 px-4 sm:px-6">
            
            {/* HEADER */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-sky-500" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Knowledge Hub</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Student <span className="font-semibold text-slate-900">Forum</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                        Ask questions, share knowledge, and learn together with students across Ethiopia.
                    </p>
                </div>

                <div className="flex gap-4">
                    <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-200">
                        <Plus className="w-4 h-4 mr-2" /> Ask a Question
                    </Button>
                </div>
            </div>

            {/* SEARCH & FILTER */}
            <div className="flex flex-col lg:flex-row gap-4">
                <div className="relative flex-1 group">
                    <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                    <input
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                        placeholder="Search for questions, topics, or subjects..."
                        className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-white text-xs font-medium outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 transition-all shadow-sm"
                    />
                </div>
                <Button variant="outline" className="h-14 px-6 rounded-2xl border-slate-100 bg-white text-slate-600 font-bold text-xs">
                    <Filter className="w-4 h-4 mr-2" /> All Subjects
                </Button>
            </div>

            {/* QUESTIONS LIST */}
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                
                {/* Main Feed */}
                <div className="lg:col-span-8 space-y-6">
                    <AnimatePresence mode="popLayout">
                        {questions.map((q, idx) => (
                            <motion.div
                                key={q._id}
                                initial={{ opacity: 0, y: 20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: idx * 0.05 }}
                                className="group p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl hover:border-slate-200 transition-all duration-500"
                            >
                                <div className="flex items-start justify-between gap-6">
                                    <div className="flex-1 space-y-4">
                                        <div className="flex items-center gap-3">
                                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[9px] font-black uppercase tracking-widest">{q.subject}</span>
                                            {q.isSolved && (
                                                <span className="flex items-center gap-1 text-emerald-500 text-[9px] font-black uppercase tracking-widest">
                                                    <CheckCircle2 size={12} /> Solved
                                                </span>
                                            )}
                                        </div>
                                        <h3 className="text-xl font-bold text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">
                                            {q.title}
                                        </h3>
                                        <p className="text-slate-500 text-sm line-clamp-2 font-medium">
                                            {q.content}
                                        </p>
                                        
                                        <div className="flex items-center justify-between pt-4">
                                            <div className="flex items-center gap-6">
                                                <div className="flex items-center gap-2 text-slate-400 group-hover:text-sky-600 transition-colors">
                                                    <ThumbsUp size={16} />
                                                    <span className="text-xs font-bold">{q.upvotes}</span>
                                                </div>
                                                <div className="flex items-center gap-2 text-slate-400 group-hover:text-sky-600 transition-colors">
                                                    <MessageSquare size={16} />
                                                    <span className="text-xs font-bold">{q.answers} answers</span>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                <div className="text-right">
                                                    <p className="text-[10px] font-bold text-slate-900">{q.author.name}</p>
                                                    <p className="text-[9px] text-slate-400 font-medium">asked 2h ago</p>
                                                </div>
                                                <Avatar className="w-8 h-8 border border-slate-100">
                                                    <AvatarFallback className="bg-slate-100 text-[10px] font-black text-slate-400">{q.author.name[0]}</AvatarFallback>
                                                </Avatar>
                                            </div>
                                        </div>
                                    </div>
                                    <Button size="icon" variant="ghost" className="rounded-2xl h-12 w-12 text-slate-300 group-hover:text-sky-600 group-hover:bg-sky-50 transition-all">
                                        <ArrowRight size={20} />
                                    </Button>
                                </div>
                            </motion.div>
                        ))}
                    </AnimatePresence>

                    {loading && (
                        <div className="flex justify-center py-12">
                            <Loader2 className="w-8 h-8 text-sky-500 animate-spin" />
                        </div>
                    )}
                </div>

                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    {/* Top Contributors */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
                        <div className="flex items-center gap-4">
                            <div className="w-1 h-6 bg-slate-900 rounded-full" />
                            <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Top Helpers</h4>
                        </div>
                        <div className="space-y-6">
                            {[1, 2, 3].map((i) => (
                                <div key={i} className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <Avatar className="w-10 h-10 border-2 border-white shadow-sm">
                                            <AvatarFallback className="bg-slate-100 text-xs font-black text-slate-400">U</AvatarFallback>
                                        </Avatar>
                                        <div>
                                            <p className="text-xs font-bold text-slate-900">Student Name</p>
                                            <p className="text-[9px] text-sky-600 font-black uppercase tracking-widest mt-0.5">42 Answers</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <span className="text-[10px] font-black text-slate-400"># {i}</span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Guidelines */}
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white shadow-2xl space-y-6">
                        <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center">
                            <MessageSquare className="w-6 h-6 text-sky-400" />
                        </div>
                        <h4 className="text-xl font-bold tracking-tight">Community Rules</h4>
                        <ul className="space-y-4">
                            {[
                                "Be respectful to others",
                                "Search before asking",
                                "Provide clear context",
                                "Help others when you can"
                            ].map((rule, i) => (
                                <li key={i} className="flex items-center gap-3 text-slate-400 text-xs font-medium">
                                    <div className="w-1 h-1 rounded-full bg-sky-500" />
                                    {rule}
                                </li>
                            ))}
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    )
}
