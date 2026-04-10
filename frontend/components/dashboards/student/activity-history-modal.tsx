"use client"

import { useState } from "react"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import {
    Clock, Search, Filter, Calendar,
    ArrowUpRight, CheckCircle2, Zap,
    BookOpen, GraduationCap, Laptop,
    BarChart3, History, Sparkles, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { recentActivity as fullHistory } from "@/lib/student-data"

interface ActivityHistoryModalProps {
    isOpen: boolean
    onOpenChange: (open: boolean) => void
}

const CATEGORIES = ["All", "Quiz", "Assignment", "Course", "AI", "Social", "Resource"]

export function ActivityHistoryModal({ isOpen, onOpenChange }: ActivityHistoryModalProps) {
    const [selectedCategory, setSelectedCategory] = useState("All")
    const [searchQuery, setSearchQuery] = useState("")

    const filteredHistory = fullHistory.filter(act => {
        const matchesCategory = selectedCategory === "All" || act.category === selectedCategory
        const matchesSearch = act.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
            act.sub.toLowerCase().includes(searchQuery.toLowerCase())
        return matchesCategory && matchesSearch
    })

    return (
        <Dialog open={isOpen} onOpenChange={onOpenChange}>
            <DialogContent className="max-w-3xl h-[85vh] bg-white rounded-[48px] p-0 overflow-hidden flex flex-col border-slate-200 shadow-2xl">
                <DialogHeader className="p-10 pb-8 shrink-0 bg-slate-50/50 border-b border-slate-100">
                    <div className="flex items-center justify-between mb-8">
                        <div className="flex items-center gap-6">
                            <div className="w-16 h-16 rounded-[28px] bg-slate-900 flex items-center justify-center text-white shadow-xl shadow-slate-200 group relative overflow-hidden">
                                <History className="w-8 h-8 relative z-10" />
                                <div className="absolute inset-0 bg-gradient-to-tr from-sky-500 to-indigo-600 opacity-0 group-hover:opacity-100 transition-opacity" />
                            </div>
                            <div>
                                <DialogTitle className="text-3xl font-black text-slate-900 tracking-tight leading-none uppercase">
                                    Activity <span className="text-sky-600">Pulse</span>
                                </DialogTitle>
                                <DialogDescription className="text-slate-400 font-bold mt-1 uppercase tracking-widest text-[10px]">
                                    Full historical audit of your academic journey
                                </DialogDescription>
                            </div>
                        </div>
                        <div className="flex items-center gap-3">
                            <div className="px-4 py-2 rounded-2xl bg-white border border-slate-200 shadow-sm flex items-center gap-2">
                                <Calendar className="w-4 h-4 text-slate-400" />
                                <span className="text-[10px] font-black uppercase text-slate-600">This Semester</span>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                        <div className="flex gap-1.5 p-1 bg-white rounded-2xl border border-slate-100 shadow-inner overflow-x-auto no-scrollbar max-w-full">
                            {CATEGORIES.map(cat => (
                                <button
                                    key={cat}
                                    onClick={() => setSelectedCategory(cat)}
                                    className={cn(
                                        "px-5 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        selectedCategory === cat
                                            ? "bg-slate-900 text-white shadow-lg"
                                            : "text-slate-400 hover:text-slate-600 hover:bg-slate-50"
                                    )}
                                >
                                    {cat}
                                </button>
                            ))}
                        </div>
                        <div className="relative group w-full md:w-64">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-sky-600 transition-colors" />
                            <input
                                placeholder="Search timeline..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-11 pl-10 pr-4 rounded-xl border-slate-200 bg-white text-xs font-bold focus:ring-sky-500/10 focus:border-sky-500 shadow-sm"
                            />
                        </div>
                    </div>
                </DialogHeader>

                <div className="flex-1 overflow-y-auto p-10 custom-scrollbar bg-white relative">
                    {/* Activity Feed */}
                    <div className="relative pl-12 space-y-10 before:absolute before:left-[23px] before:top-2 before:bottom-2 before:w-[2px] before:bg-slate-100">
                        {filteredHistory.map((act, i) => (
                            <div key={i} className="relative group flex items-start justify-between gap-6 animate-in fade-in slide-in-from-left-4 duration-500" style={{ animationDelay: `${i * 50}ms` }}>
                                {/* Timeline Node */}
                                <div className={cn(
                                    "absolute -left-[39px] top-1 w-12 h-12 rounded-[20px] border-4 border-white flex items-center justify-center transition-all group-hover:scale-110 shadow-xl z-20",
                                    act.color === "emerald" ? "bg-emerald-500 shadow-emerald-500/20" :
                                        act.color === "sky" ? "bg-sky-500 shadow-sky-500/20" :
                                            act.color === "amber" ? "bg-amber-500 shadow-amber-500/20" :
                                                act.color === "purple" ? "bg-purple-500 shadow-purple-500/20" :
                                                    "bg-indigo-500 shadow-indigo-500/20"
                                )}>
                                    {act.category === "Quiz" ? <Zap className="w-5 h-5 text-white" /> :
                                        act.category === "Assignment" ? <FileText className="w-5 h-5 text-white" /> :
                                            act.category === "Course" ? <BookOpen className="w-5 h-5 text-white" /> :
                                                act.category === "AI" ? <Sparkles className="w-5 h-5 text-white" /> :
                                                    <Laptop className="w-5 h-5 text-white" />}
                                </div>

                                <div className="flex-1 space-y-2">
                                    <div className="flex items-center gap-3">
                                        <h4 className="text-lg font-black text-slate-900 group-hover:text-sky-600 transition-colors leading-none tracking-tight">{act.title}</h4>
                                        <span className="px-2.5 py-1 rounded-lg bg-slate-50 text-slate-400 text-[9px] font-black uppercase tracking-widest border border-slate-100">{act.category}</span>
                                    </div>
                                    <p className="text-sm font-bold text-slate-500 leading-relaxed italic pr-12">{act.sub}</p>
                                    <div className="flex items-center gap-4 text-[10px] font-black text-slate-400 uppercase tracking-widest bg-slate-50/50 w-fit px-3 py-1.5 rounded-xl border border-slate-100/50 mt-4">
                                        <Clock className="w-3.5 h-3.5" />
                                        {act.time}
                                    </div>
                                </div>

                                <Button variant="ghost" size="icon" className="h-12 w-12 rounded-2xl text-slate-300 hover:text-sky-600 hover:bg-sky-50 transition-all opacity-0 group-hover:opacity-100">
                                    <ArrowUpRight className="w-5 h-5" />
                                </Button>
                            </div>
                        ))}

                        {filteredHistory.length === 0 && (
                            <div className="py-20 text-center pr-12">
                                <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-dashed border-slate-200">
                                    <Search className="w-8 h-8 text-slate-200" />
                                </div>
                                <h5 className="text-xl font-black text-slate-900 uppercase tracking-tight">No Events Matched</h5>
                                <p className="text-slate-400 font-medium text-sm mt-2">Adjust your filters or search query to see more activity.</p>
                            </div>
                        )}
                    </div>
                </div>

                <div className="p-10 shrink-0 border-t border-slate-100 bg-slate-50/30">
                    <div className="grid grid-cols-3 gap-6">
                        <div className="flex flex-col gap-1">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Total Events</span>
                            <span className="text-2xl font-black text-slate-900">{fullHistory.length}</span>
                        </div>
                        <div className="flex flex-col gap-1 text-center">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Growth Rate</span>
                            <span className="text-2xl font-black text-sky-600">+12%</span>
                        </div>
                        <div className="flex flex-col gap-1 text-right">
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Current Streak</span>
                            <span className="text-2xl font-black text-emerald-500">12 Days</span>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    )
}
