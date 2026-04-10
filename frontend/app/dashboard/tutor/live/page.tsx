"use client"

import { useState } from "react"
import {
    Video, Mic, MicOff, VideoOff, Settings,
    MessageSquare, Users, LayoutGrid, X,
    MonitorPlay, Share2, PanelRight, Hand,
    MoreVertical, Plus, Clock, GraduationCap,
    Sparkles, ArrowUpRight, ChevronRight,
    Disc, PlayCircle, Users2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MOCK_LIVE_SESSSIONS = [
    { id: "ls1", title: "Grade 12 Physics: Quantum Entanglement", time: "Starts in 15 mins", students: 42, active: true },
    { id: "ls2", title: "Grade 11 Math: Trigonometric Identities", time: "Today, 14:00", students: 52, active: false },
]

const MIGHTY_STUDENTS = [
    { id: "ms1", name: "Biniyam S.", status: "connected", handRaised: true },
    { id: "ms2", name: "Helena T.", status: "muted", handRaised: false },
    { id: "ms3", name: "Dagmawi G.", status: "connected", handRaised: false },
]

export default function TeacherLive() {
    const [isLive, setIsLive] = useState(false)
    const [activeTab, setActiveTab] = useState<"chat" | "students" | "settings">("chat")

    if (isLive) {
        return (
            <div className="fixed inset-0 bg-slate-900 z-[100] flex flex-col overflow-hidden animate-in fade-in duration-500">
                {/* Teaching Header */}
                <header className="h-20 bg-black/40 backdrop-blur-md px-8 flex items-center justify-between shrink-0 border-b border-white/10 relative z-20">
                    <div className="flex items-center gap-6">
                        <div className="flex items-center gap-2">
                            <span className="w-2.5 h-2.5 rounded-full bg-rose-500 animate-pulse" />
                            <span className="text-[10px] font-black uppercase tracking-widest text-white">Live Session: Grade 12 Physics</span>
                        </div>
                        <div className="h-6 w-px bg-white/10" />
                        <div className="flex items-center gap-2">
                            <Users className="w-4 h-4 text-slate-400" />
                            <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">42 Participating</span>
                        </div>
                    </div>
                    <div className="flex items-center gap-3">
                        <Button onClick={() => setIsLive(false)} className="h-10 px-6 rounded-xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2 transition-all">
                            End Session <X className="w-4 h-4" />
                        </Button>
                    </div>
                </header>

                <div className="flex-1 flex overflow-hidden">
                    {/* Video / Whiteboard Area */}
                    <div className="flex-1 flex flex-col p-6 gap-6 overflow-hidden">
                        <div className="flex-1 rounded-[48px] bg-slate-800 border border-white/10 relative overflow-hidden group">
                            {/* Mock Video Stream / Camera */}
                            <div className="absolute inset-0 bg-[url('https://images.unsplash.com/photo-1544717297-fa15739a5447?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center opacity-40 mix-blend-overlay" />

                            {/* Overlays */}
                            <div className="absolute top-8 left-8 p-4 rounded-3xl bg-black/40 backdrop-blur-md border border-white/10 flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-sky-500 flex items-center justify-center font-black text-white text-xs">AK</div>
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-widest text-white">Abebe Kebede (Teacher)</p>
                                    <p className="text-[9px] font-medium text-slate-400 tracking-widest uppercase">Presenter View</p>
                                </div>
                            </div>

                            {/* Whiteboard Overlay Toggle (UI Mock) */}
                            <div className="absolute bottom-8 right-8 flex gap-3">
                                <button className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-md border border-white/10 flex items-center justify-center text-white hover:bg-white/20 transition-all">
                                    <LayoutGrid className="w-5 h-5" />
                                </button>
                                <button className="w-12 h-12 rounded-2xl bg-sky-600 text-white shadow-xl shadow-sky-500/20 flex items-center justify-center hover:scale-110 transition-all">
                                    <PanelRight className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* Controls Bar */}
                        <div className="h-24 px-10 rounded-[40px] bg-black/20 backdrop-blur-xl border border-white/10 flex items-center justify-center gap-6 relative z-10 shrink-0">
                            <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center group relative">
                                <Mic className="w-6 h-6 group-hover:scale-110" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/60 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Audio</span>
                            </button>
                            <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center group relative">
                                <Video className="w-6 h-6 group-hover:scale-110" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-black/60 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Video</span>
                            </button>
                            <div className="h-10 w-px bg-white/10" />
                            <button className="w-14 h-14 rounded-2xl bg-white/10 hover:bg-white/20 text-white transition-all flex items-center justify-center group relative">
                                <Share2 className="w-6 h-6" />
                            </button>
                            <button className="w-14 h-14 rounded-2xl bg-sky-600 shadow-xl shadow-sky-500/20 text-white transition-all flex items-center justify-center group relative ring-4 ring-sky-500/20">
                                <MonitorPlay className="w-6 h-6" />
                            </button>
                            <div className="h-10 w-px bg-white/10" />
                            <button className="w-14 h-14 rounded-2xl bg-rose-500/20 hover:bg-rose-500 transition-all border border-rose-500 flex items-center justify-center group relative">
                                <Disc className="w-6 h-6 text-rose-500 group-hover:text-white" />
                                <span className="absolute -top-12 left-1/2 -translate-x-1/2 px-3 py-1.5 rounded-lg bg-rose-500 text-[8px] font-black uppercase opacity-0 group-hover:opacity-100 transition-opacity">Rec</span>
                            </button>
                        </div>
                    </div>

                    {/* Right Panel: Chat / Students */}
                    <div className="w-96 bg-black/20 backdrop-blur-md border-l border-white/10 flex flex-col overflow-hidden relative z-20">
                        <div className="h-20 shrink-0 flex items-center justify-around px-4 border-b border-white/10">
                            {[
                                { id: 'chat', icon: MessageSquare, label: 'Chat' },
                                { id: 'students', icon: Users, label: 'Class' },
                            ].map((tab) => (
                                <button
                                    key={tab.id}
                                    onClick={() => setActiveTab(tab.id as any)}
                                    className={cn(
                                        "px-6 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                        activeTab === tab.id ? "bg-white/10 text-white border border-white/20 shadow-lg shadow-white/5" : "text-slate-500 hover:text-slate-300"
                                    )}
                                >
                                    <tab.icon className="w-4 h-4 mb-1.5 mx-auto" />
                                    {tab.label}
                                </button>
                            ))}
                        </div>

                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {activeTab === 'chat' ? (
                                <>
                                    <div className="space-y-4">
                                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                            <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Biniyam S.</p>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">Professor, can you re-explain the measurement problem in quantum physics?</p>
                                        </div>
                                        <div className="p-4 rounded-3xl bg-white/5 border border-white/10 space-y-2">
                                            <p className="text-[9px] font-black text-sky-400 uppercase tracking-widest">Helena T.</p>
                                            <p className="text-xs text-slate-300 font-medium leading-relaxed">+1 to Biniyam's question!</p>
                                        </div>
                                    </div>
                                    <div className="mt-auto pt-6">
                                        <div className="h-14 bg-white/5 border border-white/10 rounded-2xl px-5 flex items-center gap-3">
                                            <input placeholder="Type a message..." className="bg-transparent border-0 outline-none w-full text-xs text-white" />
                                            <button className="p-2 rounded-lg bg-sky-500 text-white shadow-lg"><ArrowUpRight className="w-4 h-4" /></button>
                                        </div>
                                    </div>
                                </>
                            ) : (
                                <div className="space-y-4">
                                    {MIGHTY_STUDENTS.map(student => (
                                        <div key={student.id} className="p-4 rounded-3xl bg-white/5 border border-white/10 flex items-center justify-between group">
                                            <div className="flex items-center gap-4">
                                                <div className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center font-black text-[10px] text-white">
                                                    {student.name.split(' ').map(n => n[0]).join('')}
                                                </div>
                                                <div>
                                                    <p className="text-[11px] font-black text-white">{student.name}</p>
                                                    <p className="text-[8px] font-medium text-slate-500 uppercase tracking-widest">{student.status}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-3">
                                                {student.handRaised && <Hand className="w-4 h-4 text-rose-500 animate-bounce" />}
                                                <button className="p-1.5 rounded-lg hover:bg-white/10 transition-all opacity-0 group-hover:opacity-100">
                                                    <MoreVertical className="w-4 h-4 text-slate-500" />
                                                </button>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">
            {/* Standard Dashboard List View */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-rose-50 text-rose-600 text-[10px] font-black uppercase tracking-widest border border-rose-100 shadow-sm">Global Broadcast</span>
                            <Video className="w-4 h-4 text-rose-400 fill-rose-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Live <span className='text-rose-500'>Teaching</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Broadcast high-quality educational content, host interactive seminars, and engage with your students in real-time nationwide.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <Plus className="w-4 h-4 text-rose-400" /> Schedule Class
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-rose-600 hover:bg-rose-50/50 transition-all">
                            <PlayCircle className="w-4 h-4 mr-2" /> Past Recordings
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex items-center gap-6 min-w-[220px]">
                        <div className="w-14 h-14 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100">
                            <Disc className="w-7 h-7" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Live Now</p>
                            <h2 className="text-2xl font-black text-slate-900">0 Classes</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Upcoming Sessions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                {MOCK_LIVE_SESSSIONS.map(session => (
                    <div key={session.id} className="group p-10 rounded-[48px] bg-white border border-slate-100 hover:border-rose-100 hover:shadow-2xl hover:shadow-rose-500/5 transition-all duration-700 relative overflow-hidden">
                        <div className="absolute top-0 right-0 p-8">
                            <span className={cn(
                                "px-3 py-1 rounded-xl text-[8px] font-black uppercase tracking-widest border",
                                session.active ? "bg-rose-50 text-rose-500 border-rose-100 animate-pulse" : "bg-slate-50 text-slate-400 border-slate-100"
                            )}>
                                {session.active ? "Ready to Launch" : "Upcoming"}
                            </span>
                        </div>

                        <div className="space-y-6 relative z-10 text-center flex flex-col items-center">
                            <div className="w-20 h-20 rounded-[32px] bg-rose-50 text-rose-600 flex items-center justify-center border border-rose-100 group-hover:scale-110 transition-transform shadow-sm">
                                <Video className="w-10 h-10" />
                            </div>

                            <div>
                                <h3 className="text-xl font-black text-slate-900 leading-[1.3] uppercase italic mb-2 group-hover:text-rose-600 transition-colors">{session.title}</h3>
                                <div className="flex items-center justify-center gap-3">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Clock className="w-3.5 h-3.5" /> {session.time}
                                    </p>
                                    <span className="w-1 h-1 rounded-full bg-slate-200" />
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-1.5">
                                        <Users2 className="w-3.5 h-3.5" /> {session.students} Enrolled
                                    </p>
                                </div>
                            </div>

                            <Button
                                onClick={() => setIsLive(true)}
                                className={cn(
                                    "w-full h-14 rounded-2xl font-black text-[10px] uppercase tracking-widest transition-all shadow-xl",
                                    session.active ? "bg-rose-500 text-white shadow-rose-500/20 hover:scale-105" : "bg-slate-900 text-white hover:bg-slate-800"
                                )}
                            >
                                {session.active ? "Start Live Session" : "Prepare Resources"}
                            </Button>
                        </div>
                    </div>
                ))}
                <button className="h-full min-h-[350px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-rose-100 hover:shadow-xl transition-all">
                    <div className="w-16 h-16 rounded-2xl bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-rose-50 group-hover:text-rose-500 transition-all">
                        <Plus className="w-8 h-8" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-rose-600 transition-all">Schedule Broadcast</p>
                </button>
            </div>
        </div>
    )
}
