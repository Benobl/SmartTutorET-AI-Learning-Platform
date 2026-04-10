"use client"

import { useState, useMemo } from "react"
import {
    GraduationCap, Plus, Search, Filter,
    Users, MessageSquare, Activity, Sparkles,
    CheckCircle2, ChevronRight, ArrowUpRight,
    Users2, BookOpen, Clock, Star, LayoutGrid,
    MoreVertical, Send, ShieldCheck, AlertCircle,
    Trophy, FlaskConical, PlayCircle, X
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"
import { mockTeacherData } from "@/lib/teacher-data"
import { useToast } from "@/hooks/use-toast"

export default function TeacherSquads() {
    const { toast } = useToast()
    const [searchQuery, setSearchQuery] = useState("")
    const [squads, setSquads] = useState(mockTeacherData.squads)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
    const [isLabsOpen, setIsLabsOpen] = useState(false)
    const [isOptimizing, setIsOptimizing] = useState(false)

    const [newSquad, setNewSquad] = useState({ name: "", subject: "Physics", students: 5 })

    const filteredSquads = useMemo(() => {
        return squads.filter(s => s.name.toLowerCase().includes(searchQuery.toLowerCase()))
    }, [squads, searchQuery])

    const handleCreateSquad = () => {
        const squad = {
            id: `sq${Date.now()}`,
            name: newSquad.name,
            studentCount: newSquad.students,
            active: true,
            activity: "Fresh"
        }
        setSquads([squad, ...squads])
        setIsCreateOpen(false)
        setNewSquad({ name: "", subject: "Physics", students: 5 })
        toast({
            title: "Squad Commissioned",
            description: `Successfully formed the collaborative team: ${squad.name}`,
        })
    }

    const runOptimization = () => {
        setIsOptimizing(true)
        setTimeout(() => {
            setIsOptimizing(false)
            toast({
                title: "Synergy Optimized",
                description: "AI has restructured squads for 98% compatibility.",
            })
        }, 2000)
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">Collaboration Engine</span>
                            <GraduationCap className="w-4 h-4 text-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-sky-600'>Squads</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Organize your students into high-performance collaborative groups to foster peer-to-peer learning and competitive academic growth.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl shadow-sky-500/20 hover:scale-105 transition-transform"
                        >
                            <Plus className="w-4 h-4 text-white" /> Create New Squad
                        </Button>
                        <Button
                            onClick={() => setIsLeaderboardOpen(true)}
                            variant="outline"
                            className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all"
                        >
                            <Trophy className="w-4 h-4 mr-2" /> View Squad Leaderboard
                        </Button>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-center gap-4">
                    <div className="relative group min-w-[300px]">
                        <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4.5 h-4.5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            placeholder="Find a squad..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-16 pl-14 pr-6 rounded-[28px] bg-white border border-slate-200 text-sm font-medium focus:outline-none focus:ring-4 focus:ring-sky-500/10 focus:border-sky-500/50 transition-all placeholder:text-slate-400 shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Squads Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-10">
                {filteredSquads.map(squad => (
                    <div
                        key={squad.id}
                        className="group p-10 rounded-[48px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-700 relative overflow-hidden flex flex-col"
                    >
                        <div className="absolute top-0 right-0 p-8 text-center bg-sky-50 px-4 py-2 rounded-bl-[24px] border-l border-b border-sky-100 shadow-sm">
                            <span className="text-[8px] font-black uppercase tracking-widest text-sky-600 flex items-center gap-1.5 leading-none">
                                <FlaskConical className="w-2.5 h-2.5" /> Active Lab
                            </span>
                        </div>

                        <div className="space-y-8 relative z-10 flex-1 flex flex-col pt-4">
                            <div className="flex items-center gap-5">
                                <div className="w-16 h-16 rounded-[28px] bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100 group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                    <Users2 className="w-8 h-8" />
                                </div>
                                <div>
                                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase italic group-hover:text-sky-600 transition-colors truncate max-w-[180px]">{squad.name}</h3>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">G12 Physics • {squad.studentCount} Members</p>
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-2 mb-1.5">
                                        <Activity className="w-3.5 h-3.5 text-sky-400" />
                                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Synergy</span>
                                    </div>
                                    <p className="text-sm font-black text-slate-900">High</p>
                                </div>
                                <div className="p-5 rounded-[24px] bg-slate-50 border border-slate-100 group-hover:bg-white group-hover:shadow-lg transition-all">
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
                                <div className="h-2.5 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner">
                                    <div className="h-full bg-sky-500 rounded-full shadow-lg" style={{ width: '84%' }} />
                                </div>
                            </div>

                            <div className="pt-6 border-t border-slate-50 flex items-center justify-between mt-auto">
                                <div className="flex -space-x-3">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-10 h-10 rounded-xl bg-white border-2 border-slate-50 flex items-center justify-center shadow-lg">
                                            <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-400 flex items-center justify-center font-black text-[10px]">ST</div>
                                        </div>
                                    ))}
                                    <div className="w-10 h-10 rounded-xl bg-slate-900 text-white text-[9px] font-black flex items-center justify-center border-2 border-white shadow-lg">
                                        +5
                                    </div>
                                </div>
                                <Button
                                    onClick={() => setIsLabsOpen(true)}
                                    size="sm"
                                    className="h-11 px-6 rounded-xl bg-slate-900 text-white font-black text-[9px] uppercase tracking-widest hover:bg-sky-600 transition-all shadow-xl hover:scale-105"
                                >
                                    Enter Lab
                                </Button>
                            </div>
                        </div>

                        {/* Decoration */}
                        <div className="absolute -left-10 -bottom-10 w-40 h-40 bg-sky-500/10 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                    </div>
                ))}

                <button
                    onClick={() => setIsCreateOpen(true)}
                    className="h-full min-h-[400px] border-2 border-dashed border-slate-200 rounded-[48px] flex flex-col items-center justify-center gap-4 group hover:bg-white hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/10 transition-all"
                >
                    <div className="w-20 h-20 rounded-[32px] bg-slate-50 text-slate-300 flex items-center justify-center group-hover:bg-sky-50 group-hover:text-sky-500 transition-all shadow-sm">
                        <Plus className="w-10 h-10" />
                    </div>
                    <p className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 group-hover:text-sky-600 transition-all">Form New Squad</p>
                </button>
            </div>

            {/* AI Collaborative Suggestion */}
            <div className="bg-white border border-slate-100 rounded-[64px] p-12 lg:p-20 relative overflow-hidden group shadow-2xl shadow-slate-200/50">
                <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-sky-500/5 blur-3xl rounded-full -mr-32 -mb-32" />
                <div className="relative z-10 grid grid-cols-1 lg:grid-cols-2 gap-16 items-center">
                    <div className="space-y-8">
                        <div>
                            <div className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest mb-6 border border-sky-100">Squad Synergy AI</div>
                            <h2 className="text-4xl lg:text-5xl font-black text-slate-900 leading-none tracking-tight uppercase italic">Optimize <span className="text-sky-600">Team</span> Dynamics</h2>
                        </div>
                        <p className="text-slate-500 text-lg font-medium leading-relaxed">
                            Our AI analyzes student strengths and weaknesses to suggest ideal project groups. Balanced squads perform 34% better in national exam simulations.
                        </p>
                        <Button
                            onClick={runOptimization}
                            disabled={isOptimizing}
                            className="h-16 px-10 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-xs uppercase tracking-widest shadow-2xl shadow-sky-500/20 group"
                        >
                            {isOptimizing ? "Processing Sync..." : "Generate Optimized Squads"}
                            <Sparkles className={cn("ml-3 w-4 h-4 transition-all", isOptimizing ? "animate-spin text-white" : "group-hover:rotate-12")} />
                        </Button>
                    </div>
                    <div className="hidden lg:flex justify-center">
                        <div className="relative animate-in zoom-in duration-1000">
                            <div className="w-72 h-72 rounded-[64px] border border-slate-100 bg-slate-50/50 p-8 flex flex-col justify-around shadow-inner">
                                <div className="flex justify-between items-center">
                                    <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100 shadow-sm"><ShieldCheck className="w-6 h-6" /></div>
                                    <div className="w-12 h-12 rounded-2xl bg-rose-50 text-rose-500 flex items-center justify-center border border-rose-100 shadow-sm"><AlertCircle className="w-6 h-6" /></div>
                                </div>
                                <div className="space-y-4">
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-sky-500 w-3/4 rounded-full shadow-lg" /></div>
                                    <div className="h-2 w-full bg-slate-100 rounded-full overflow-hidden shadow-inner"><div className="h-full bg-indigo-400 w-1/2 rounded-full shadow-lg" /></div>
                                </div>
                            </div>
                            <div className="absolute -top-6 -right-6 w-24 h-24 rounded-[32px] bg-white border border-slate-100 shadow-2xl flex flex-col items-center justify-center scale-110">
                                <span className="text-[10px] font-black uppercase text-slate-400">Match</span>
                                <span className="text-2xl font-black text-slate-900">98%</span>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Create Squad Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Form <span className="text-sky-600">New Squad</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Create a high-performance collaborative group for your course.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Squad Call-sign</label>
                            <Input
                                placeholder="e.g. Quantum Pioneers"
                                value={newSquad.name}
                                onChange={(e) => setNewSquad({ ...newSquad, name: e.target.value })}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Quick Stats</label>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Students</p>
                                    <p className="text-lg font-black text-slate-900">5-8 Initial</p>
                                </div>
                                <div className="p-4 rounded-2xl bg-slate-50 border border-slate-100 text-center">
                                    <p className="text-[8px] font-black uppercase text-slate-400 mb-1">Status</p>
                                    <p className="text-lg font-black text-sky-600">Elite-Ready</p>
                                </div>
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCreateSquad}
                            disabled={!newSquad.name}
                            className="w-full h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-sky-500/20 transition-all hover:scale-[1.02]"
                        >
                            Commission Squad <ArrowUpRight className="ml-2 w-5 h-5" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Leaderboard Dialog */}
            <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[48px] border-slate-100 p-0 overflow-hidden">
                    <div className="p-10 bg-slate-50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Squad <span className="text-sky-600">Leaderboard</span></DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">Tracking performance metrics and collaborative synergy across all groups.</DialogDescription>
                        </DialogHeader>
                    </div>
                    <div className="p-10 space-y-4">
                        {squads.map((s, idx) => (
                            <div key={s.id} className="flex items-center gap-6 p-5 rounded-[32px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-xl transition-all group">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black group-hover:bg-sky-600 group-hover:text-white transition-all shadow-sm">
                                    {idx + 1}
                                </div>
                                <div className="flex-1">
                                    <h4 className="font-black text-sm text-slate-900 uppercase italic">{s.name}</h4>
                                    <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">94% Efficiency • 1.4k Engagement Points</p>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Trophy className={cn("w-5 h-5", idx === 0 ? "text-yellow-500" : "text-slate-200")} />
                                </div>
                            </div>
                        ))}
                    </div>
                </DialogContent>
            </Dialog>

            {/* Labs Entry Dialog */}
            <Dialog open={isLabsOpen} onOpenChange={setIsLabsOpen}>
                <DialogContent className="sm:max-w-[700px] rounded-[48px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl">
                    <div className="bg-slate-900 p-12 text-center space-y-8 relative overflow-hidden">
                        {/* Background Pulse */}
                        <div className="absolute inset-0 bg-sky-500/5 animate-pulse" />

                        <div className="relative z-10 space-y-6">
                            <div className="w-24 h-24 rounded-[40px] bg-sky-500/10 text-sky-400 mx-auto flex items-center justify-center border border-sky-500/20 shadow-2xl relative group">
                                <div className="absolute inset-0 bg-sky-500/20 blur-xl rounded-full animate-ping group-hover:animate-none" />
                                <FlaskConical className="w-12 h-12 relative z-10" />
                            </div>
                            <div className="space-y-2">
                                <DialogTitle className="text-3xl font-black text-white uppercase italic tracking-tight">Secure <span className="text-sky-400">Collaborative Lab</span></DialogTitle>
                                <p className="text-slate-400 font-medium text-sm">Initializing encrypted peer-to-peer workspace environment...</p>
                            </div>
                        </div>

                        <div className="relative z-10 grid grid-cols-1 gap-4 max-w-sm mx-auto">
                            {[
                                { label: "Secure Tunneling", delay: "0ms", status: "Active" },
                                { label: "Establishing Workspace", delay: "300ms", status: "Syncing" },
                                { label: "Interface Hardware Handshake", delay: "600ms", status: "Pending" }
                            ].map((step, i) => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/10 group hover:bg-white/10 transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-8 h-8 rounded-lg bg-sky-500/20 text-sky-400 flex items-center justify-center font-black text-[10px]">{i + 1}</div>
                                        <span className="text-xs font-bold text-slate-300 uppercase tracking-widest">{step.label}</span>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <div className="w-1.5 h-1.5 rounded-full bg-sky-500 animate-pulse" />
                                        <span className="text-[8px] font-black text-sky-500 uppercase tracking-widest">{step.status}</span>
                                    </div>
                                </div>
                            ))}
                        </div>

                        <div className="relative z-10 pt-4">
                            <Button
                                onClick={() => setIsLabsOpen(false)}
                                className="w-full h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-sky-500/40 transition-all active:scale-95"
                            >
                                Launch Lab Interface <ArrowUpRight className="ml-2 w-5 h-5" />
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>


        </div>
    )
}
