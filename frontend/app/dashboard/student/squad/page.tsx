"use client"

import { useState } from "react"
import { squadPosts } from "@/lib/student-data"
import {
    MessageSquare, Heart, MessageCircle, Share2,
    Search, Plus, Filter, TrendingUp, Sparkles,
    ChevronRight, ArrowUpRight, Award, Users, BookOpen
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { toast } from "@/hooks/use-toast"

export default function ClassSquad() {
    const [searchQuery, setSearchQuery] = useState("")

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Peer Cooperation</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Class <span className='text-sky-500'>Squad</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Collaborate with your fellow Grade 12 students. Ask questions, share insights, and learn together.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <div className="relative group min-w-[320px]">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <input
                                placeholder="Search discussions..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:ring-sky-500/10 focus:border-sky-500 transition-all shadow-sm"
                            />
                        </div>
                        <Button className="h-16 px-10 rounded-[28px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 transition-transform">
                            <Plus className="w-5 h-5 text-sky-400" />
                            New Exploration
                        </Button>
                    </div>
                </div>

                <div className="hidden xl:flex items-center gap-6">
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white bg-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-lg">
                                U{i}
                            </div>
                        ))}
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Active Squad</p>
                        <p className="text-xl font-black text-slate-900 leading-none">42.8k Students</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Feed */}
                <div className="xl:col-span-2 space-y-8">
                    {squadPosts.map((post) => (
                        <div key={post.id} className="group p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl hover:border-sky-100 transition-all duration-700 relative overflow-hidden">
                            <div className="absolute top-0 right-0 p-8">
                                <span className="px-4 py-2 rounded-xl bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">
                                    {post.subject}
                                </span>
                            </div>

                            <div className="space-y-8">
                                <div className="flex items-center gap-5">
                                    <div className="w-16 h-16 rounded-[24px] bg-slate-100 border border-slate-200 flex items-center justify-center text-slate-400 font-black text-sm uppercase shadow-inner">
                                        {post.author.split(' ').map(n => n[0]).join('')}
                                    </div>
                                    <div>
                                        <h4 className="text-xl font-black text-slate-900 leading-tight mb-1">{post.author}</h4>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{post.time}</p>
                                    </div>
                                </div>

                                <p className="text-xl font-bold text-slate-700 leading-relaxed pr-10 italic">
                                    "{post.content}"
                                </p>

                                <div className="flex flex-wrap gap-2">
                                    {post.tags.map(tag => (
                                        <span key={tag} className="px-3 py-1.5 rounded-lg bg-slate-50 text-slate-500 text-[9px] font-black uppercase tracking-widest border border-slate-100">#{tag}</span>
                                    ))}
                                </div>

                                <div className="pt-8 flex items-center justify-between border-t border-slate-50">
                                    <div className="flex items-center gap-8">
                                        <button className="flex items-center gap-2.5 text-slate-400 hover:text-rose-500 transition-colors group/stat">
                                            <Heart className="w-5 h-5 group-hover/stat:fill-rose-500" />
                                            <span className="text-xs font-black">{post.likes}</span>
                                        </button>
                                        <button className="flex items-center gap-2.5 text-slate-400 hover:text-sky-600 transition-colors group/stat">
                                            <MessageCircle className="w-5 h-5" />
                                            <span className="text-xs font-black">{post.replies}</span>
                                        </button>
                                    </div>
                                    <Button variant="ghost" className="rounded-2xl h-12 px-6 font-black text-[10px] uppercase tracking-widest group/btn bg-slate-50 hover:bg-sky-50 hover:text-sky-600 transition-all">
                                        Exploration Board <ArrowUpRight className="w-4 h-4 ml-2 group-hover/btn:scale-110 transition-transform" />
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Sidebar Context */}
                <div className="space-y-10">
                    {/* Trending Topics */}
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white relative overflow-hidden shadow-2xl">
                        <div className="absolute -right-20 -bottom-20 w-64 h-64 bg-sky-500/10 blur-3xl rounded-full" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-white/10 border border-white/20 flex items-center justify-center">
                                    <TrendingUp className="w-6 h-6 text-sky-400" />
                                </div>
                                <h3 className="text-xl font-black uppercase tracking-tight">Trending Hub</h3>
                            </div>
                            <div className="space-y-6">
                                {[
                                    { tag: "CalculusVitals", posts: 142 },
                                    { tag: "Electromagnetism", posts: 89 },
                                    { tag: "HamletTragedy", posts: 56 },
                                ].map((item, i) => (
                                    <div key={i} className="flex items-center justify-between group cursor-pointer">
                                        <p className="text-sm font-black text-sky-100 group-hover:text-sky-400 transition-colors uppercase tracking-widest">#{item.tag}</p>
                                        <div className="px-3 py-1 rounded-lg bg-white/10 text-[9px] font-black uppercase tracking-widest">{item.posts} Active</div>
                                    </div>
                                ))}
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-600/20">
                                Expand Universe
                            </Button>
                        </div>
                    </div>

                    {/* Expert Students */}
                    <div className="space-y-6">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight px-2 flex items-center gap-3">
                            <Award className="w-6 h-6 text-amber-500" />
                            Squad Leaders
                        </h3>
                        <div className="space-y-4">
                            {[
                                { name: "Dawit Isaac", score: 1420, courses: 4 },
                                { name: "Sarah J.", score: 1280, courses: 3 },
                                { name: "Liya Tekle", score: 950, courses: 2 },
                            ].map((expert, i) => (
                                <div key={i} className="p-6 rounded-[32px] bg-white border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all duration-500 group">
                                    <div className="flex items-center gap-4">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center font-black text-slate-400 text-xs shadow-inner">
                                            {expert.name[0]}
                                        </div>
                                        <div>
                                            <h5 className="font-black text-slate-900 text-sm">{expert.name}</h5>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{expert.courses} Mastery Courses</p>
                                        </div>
                                        <div className="ml-auto text-right">
                                            <p className="text-lg font-black text-sky-600 leading-none">{expert.score}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Karma</p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
