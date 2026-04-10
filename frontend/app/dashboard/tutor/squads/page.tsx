"use client"

import { useState } from "react"
import {
    GraduationCap, Plus, Search, Filter,
    Users, MessageSquare, Activity, Sparkles,
    CheckCircle2, ChevronRight, ArrowUpRight,
    Users2, BookOpen, Clock, Star, LayoutGrid,
    MoreVertical, Send, ShieldCheck, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { mockTeacherData } from "@/lib/teacher-data"

export default function TeacherSquads() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-violet-50 text-violet-600 text-[10px] font-black uppercase tracking-widest border border-violet-100">Collaboration Engine</span>
                            <GraduationCap className="w-4 h-4 text-violet-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-violet-600'>Squads</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Organize your students into high-performance collaborative groups to foster peer-to-peer learning and competitive academic growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <Plus className="w-4 h-4 text-violet-400" /> Create New Squad
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-violet-600 hover:bg-violet-50/50 transition-all">
                            <Star className="w-4 h-4 mr-2" /> View Squad Leaderboard
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-violet-500 transition-colors" />
                        <input
                            placeholder="Find a squad..."
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-violet-500/5 focus:border-violet-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {mockTeacherData.squads.map(squad => (
                    <div
                        key={squad.id}
                        className="group p-10 rounded-[48px] bg-white border border-slate-100 hover:border-violet-100 hover:shadow-2xl hover:shadow-violet-500/5 transition-all duration-700 relative overflow-hidden"
                    >
                        <div className="absolute top-0 right-0 p-8">
                            <span className="px-3 py-1 rounded-xl bg-violet-50 text-violet-500 text-[8px] font-black uppercase tracking-widest border border-violet-100">Active Lab</span>
                        </div>

                        <div className="space-y-8 relative z-10">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-violet-600 group-hover:text-white transition-all shadow-sm">
                                    <Users2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic group-hover:text-violet-600 transition-colors">{squad.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">G12 Physics • {squad.studentCount} Members</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Activity className="w-3.5 h-3.5 text-violet-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synergy</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">High</p>
                                </div>
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <MessageSquare className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Msgs</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">142 today</p>
                                </div>
                            </div>

                            <div className="space-y-4">
                                <div className="flex items-center justify-between text-[10px] font-black uppercase tracking-widest text-slate-400">
                                    <span>Goal Achievement</span>
                                    <span>84%</span>
                                </div>
                                <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden">
                                    <div className="h-full bg-violet-500 rounded-full" style={{ width: '84%' }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-9 h-9 rounded-xl bg-slate-50 border-2 border-white flex items-center justify-center shadow-sm">
                                            <Users className="w-4 h-4 text-slate-300" />
                                        </div>
                                    ))}
                                    <div className="w-9 h-9 rounded-xl bg-slate-900 text-white text-[9px] font-black flex items-center justify-center border-2 border-white">
                                        +5
                                    </div>
                                </div>
                                <Button size="sm" className="h-10 px-6 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-violet-600 transition-all">
                                    Enter Lab
                                </Button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-violet-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}

                <button className="h-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-violet-100 hover:shadow-xl transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-violet-50 group-hover:text-violet-500 transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-violet-600 transition-all">Form New Squad</p>
                </button>
            </div>

            {/* AI Collaborative Suggestion */}
            <div className="bg-slate-900 rounded-[64px] p-12 lg:p-20 relative overflow-hidden group">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/10 blur-3xl rounded-full -mr-32 -mb-32" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-500/20 text-sky-300 text-[10px] font-black uppercase tracking-widest mb-6">Squad Synergy AI</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-white leading-none tracking-tight uppercase italic">Optimize <span className="text-violet-400">Team</span> Dynamics</h2>
                        </div>
                        <p className="text-slate-400 text-lg font-medium leading-relaxed">
                            Our AI analyzes student strengths and weaknesses to suggest ideal project groups. Balanced squads perform 34% better in national exam simulations.
                        </p>
                        <Button className="h-16 px-10 rounded-2xl bg-violet-600 hover:bg-violet-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-violet-500/20 group">
                            Generate Optimized Squads <Sparkles className="ml-3 w-4 h-4 group-hover:rotate-12 transition-transform" />
                        </Button>
                    </div>
                    <div className="hidden lg:flex justify-center">
                        <div className="relative">
                            <div className="w-72 h-72 rounded-[64px] border border-white/10 bg-white/5 p-8 flex flex-col justify-around">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-500/20 flex items-center justify-center"><ShieldCheck className="w-6 h-6 text-sky-400" /></div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-500/20 flex items-center justify-center"><AlertCircle className="w-6 h-6 text-rose-400" /></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-white/10 rounded-full"><div className="h-full bg-violet-500 w-3/4 rounded-full" /></div>
                                    <div className="h-2 w-full bg-white/10 rounded-full"><div className="h-full bg-sky-400 w-1/2 rounded-full" /></div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-[32px] bg-white border border-slate-100 shadow-2xl flex flex-col items-center justify-center">
                                <span className="text-[10px] font-black uppercase text-slate-400">Match</span>
                                <span className="text-2xl font-black text-slate-900">98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

        </div>
    )
}
