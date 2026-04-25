"use client"

import { useState, useMemo, useEffect, useRef } from "react"
import { squadPosts } from "@/lib/mock-data"
import { groupApi, inviteApi, fetchWithAuth } from "@/lib/api"
import {
    MessageSquare, Heart, MessageCircle, Share2,
    Search, Plus, Filter, TrendingUp, Sparkles,
    ChevronRight, ArrowUpRight, Award, Users, BookOpen,
    Trophy, Users2, UserPlus, FlaskConical, PlayCircle, X,
    Calendar, GraduationCap, Flame, Target, Send, Video
} from "lucide-react"
import { initializeSocket } from "@/lib/socket"
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
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { toast } from "@/hooks/use-toast"
import { GroupChatTab } from "@/components/dashboard/squad/GroupChatTab"
import { GroupWhiteboardTab } from "@/components/dashboard/squad/GroupWhiteboardTab"
import { GroupForumTab } from "@/components/dashboard/squad/GroupForumTab"
import { GroupQandATab } from "@/components/dashboard/squad/GroupQandATab"
// import { useStream } from "@/components/providers/StreamProvider"
// import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
// import { Call } from "@stream-io/video-react-sdk"
import { getCurrentUser } from "@/lib/auth-utils"

const MOCK_STUDENT_SQUADS = [
    { id: 1, name: "Quantum Pioneers", members: 8, grade: "12", subject: "Physics", activity: "High" },
    { id: 2, name: "Calculus Wizards", members: 5, grade: "12", subject: "Math", activity: "Medium" },
]

const LEADERBOARD_DATA = {
    semester: [
        { id: 1, name: "Dawit Isaac", score: 4500, grade: "12", rank: 1 },
        { id: 2, name: "Sarah J.", score: 4200, grade: "12", rank: 2 },
        { id: 3, name: "Liya Tekle", score: 3900, grade: "11", rank: 3 },
    ],
    year: [
        { id: 1, name: "Samuel K.", score: 12500, grade: "12", rank: 1 },
        { id: 2, name: "Elias M.", score: 11800, grade: "10", rank: 2 },
        { id: 3, name: "Betty A.", score: 11200, grade: "12", rank: 3 },
    ],
    grades: {
        "9": [{ name: "Junior A.", score: 2500 }, { name: "Junior B.", score: 2400 }],
        "10": [{ name: "Sophomore A.", score: 5500 }, { name: "Sophomore B.", score: 5400 }],
        "11": [{ name: "Junior A.", score: 8500 }, { name: "Junior B.", score: 8400 }],
        "12": [{ name: "Dawit Isaac", score: 14500 }, { name: "Sarah J.", score: 14200 }],
    }
}

export default function ClassSquad() {
    const [searchQuery, setSearchQuery] = useState("")
    const [squads, setSquads] = useState<any[]>([])
    const [selectedSquad, setSelectedSquad] = useState<any>(null)
    const [squadMessages, setSquadMessages] = useState<any[]>([])
    const [newMsg, setNewMsg] = useState("")
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [isLeaderboardOpen, setIsLeaderboardOpen] = useState(false)
    const [isLabsOpen, setIsLabsOpen] = useState(false)
    const [activeCall, setActiveCall] = useState<any | null>(null)

    const [newSquad, setNewSquad] = useState({ name: "", topic: "", avatar: "🧬" })
    // const { videoClient, isReady: isStreamReady } = useStream()
    const videoClient = null as any
    const socketRef = useRef<any>(null)
    const currentUser = getCurrentUser()

    useEffect(() => {
        const fetchSquads = async () => {
            try {
                const data = await groupApi.getMyGroups()
                setSquads(data)
            } catch (error) {
                console.error("Failed to fetch squads:", error)
            }
        }
        fetchSquads()

        if (currentUser?._id) {
            const socket = initializeSocket(currentUser._id)
            socketRef.current = socket
        }

        return () => {
            // Socket cleanup handled in initializeSocket or globally
        }
    }, [])

    const handleToggleLive = async (squad: any) => {
        if (!videoClient || !currentUser) return

        try {
            if (squad.isLive && squad.sessionData?.callId) {
                // Join existing call
                const call = videoClient.call("default", squad.sessionData.callId)
                await call.join({ create: true })
                setActiveCall(call)
            } else {
                // Start a new call (only if creator)
                if (squad.creator !== currentUser._id) {
                    toast({ title: "Access Denied", description: "Only the squad creator can start live labs.", variant: "destructive" })
                    return
                }

                const callId = `squad_${squad._id}_${Date.now()}`
                const call = videoClient.call("default", callId)
                await call.getOrCreate({
                    data: {
                        members: squad.members.map((m: any) => ({ user_id: typeof m === 'string' ? m : m._id })),
                        custom: { squadName: squad.name }
                    }
                })

                await groupApi.toggleLive(squad._id, { isLive: true, sessionData: { callId } })

                // Notify via socket
                socketRef.current?.emit("squad-live-started", { squadId: squad._id, callId, squadName: squad.name })

                setActiveCall(call)
                setSelectedSquad({ ...squad, isLive: true, sessionData: { callId } })
            }
        } catch (error: any) {
            console.error("Stream Video Error:", error)
            toast({ title: "Video Failed", description: error.message, variant: "destructive" })
        }
    }

    const handleLeaveLive = async () => {
        if (activeCall) {
            await activeCall.leave()
            setActiveCall(null)

            // If creator, choice to end for all could be here, but for now just leave
        }
    }

    const handleCreateSquad = async () => {
        if (!newSquad.name.trim()) {
            toast({
                title: "Squad Name Required",
                description: "Every legendary squad needs a name!",
                variant: "destructive",
            })
            return
        }
        try {
            const squad = await groupApi.create({
                name: newSquad.name,
                topic: newSquad.topic || "General Collaboration",
                avatar: newSquad.avatar,
            })
            setSquads([squad, ...squads])
            setIsCreateOpen(false)
            setNewSquad({ name: "", topic: "", avatar: "🧬" })
            toast({
                title: "Squad Established",
                description: `You are now the leader of ${squad.name}!`,
            })
        } catch (error: any) {
            toast({
                title: "Initialization Failed",
                description: error.message || "The squad matrix could not be initialized.",
                variant: "destructive",
            })
        }
    }

    const handleJoinSquadRoom = (squad: any) => {
        setSelectedSquad(squad)
        setIsLabsOpen(true)
        if (socketRef.current) {
            socketRef.current.emit("join-squad", squad._id)
        }
    }

    const handleSendSquadMessage = () => {
        if (!newMsg.trim() || !selectedSquad) return
        const message = { text: newMsg, id: Date.now(), time: new Date().toLocaleTimeString() }
        socketRef.current.emit("send-squad-message", { squadId: selectedSquad._id, message })
        setNewMsg("")
    }

    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100 shadow-sm">Peer Cooperation</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Student <span className='text-sky-500'>Squads</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Collaborate, compete, and grow. Form squads with friends to tackle academic challenges together.
                        </p>
                    </div>

                    <div className="flex flex-wrap gap-4">
                        <Button
                            onClick={() => setIsCreateOpen(true)}
                            className="h-16 px-10 rounded-[28px] bg-slate-900 text-white font-black text-xs uppercase tracking-widest gap-3 shadow-2xl hover:scale-105 transition-transform"
                        >
                            <Plus className="w-5 h-5 text-sky-400" />
                            Initialize Squad
                        </Button>
                        <Button
                            onClick={() => setIsLeaderboardOpen(true)}
                            variant="outline"
                            className="h-16 px-10 rounded-[28px] border-slate-100 bg-white text-slate-400 font-black text-xs uppercase tracking-widest gap-3 hover:text-sky-600 hover:bg-sky-50 transition-all"
                        >
                            <Trophy className="w-5 h-5 text-amber-500" />
                            Global Leaderboards
                        </Button>
                    </div>
                </div>

                <div className="hidden xl:flex items-center gap-8">
                    <div className="flex -space-x-4">
                        {[1, 2, 3, 4, 5].map(i => (
                            <div key={i} className="w-14 h-14 rounded-2xl border-4 border-white bg-slate-50 flex items-center justify-center font-black text-sky-600 text-xs shadow-lg ring-1 ring-slate-100">
                                {String.fromCharCode(64 + i)}
                            </div>
                        ))}
                        <div className="w-14 h-14 rounded-2xl border-4 border-white bg-slate-900 text-white flex items-center justify-center font-black text-xs shadow-lg">
                            +42k
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Global Active</p>
                        <p className="text-xl font-black text-slate-900 leading-none flex items-center gap-2 justify-end">
                            <Flame className="w-5 h-5 text-orange-500 fill-orange-500" /> 845 Squads
                        </p>
                    </div>
                </div>
            </div>

            {/* My Squads Section */}
            <div className="space-y-6">
                <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                    <Users2 className="w-6 h-6 text-sky-500" /> My Active <span className="text-sky-600">Groups</span>
                </h3>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                    {squads.map(squad => (
                        <div key={squad._id || squad.id} className="group p-6 rounded-[32px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-2xl hover:shadow-sky-500/5 transition-all duration-500 relative overflow-hidden">
                            <div className="mb-4">
                                <h4 className="font-black text-slate-900 text-lg uppercase italic group-hover:text-sky-600 transition-colors">{squad.name}</h4>
                                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">{squad.topic || squad.subject || "Collaboration"} • Squad Active</p>
                            </div>
                            <div className="flex items-center justify-between mt-6">
                                <div className="flex -space-x-2">
                                    {[1, 2, 3].map(i => (
                                        <div key={i} className="w-8 h-8 rounded-lg bg-slate-50 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-300">U</div>
                                    ))}
                                    <div className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 border-2 border-white flex items-center justify-center text-[10px] font-black">+{Array.isArray(squad.members) ? squad.members.length : squad.members}</div>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Button
                                        onClick={() => setIsInviteOpen(true)}
                                        size="sm"
                                        variant="ghost"
                                        className="h-8 rounded-xl bg-slate-50 text-slate-400 hover:bg-sky-50 hover:text-sky-600 font-black text-[9px] uppercase tracking-widest"
                                    >
                                        <UserPlus className="w-3.5 h-3.5 mr-1" /> Invite
                                    </Button>
                                    <Button
                                        onClick={() => handleJoinSquadRoom(squad)}
                                        size="sm"
                                        className="h-8 rounded-xl bg-sky-600 text-white font-black text-[9px] uppercase tracking-widest hover:bg-sky-700 transition-all shadow-sm"
                                    >
                                        Lab
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))}
                    <button
                        onClick={() => setIsCreateOpen(true)}
                        className="h-full min-h-[140px] border-2 border-dashed border-slate-100 rounded-[32px] flex flex-col items-center justify-center gap-2 group hover:bg-white hover:border-sky-100 hover:shadow-xl transition-all"
                    >
                        <Plus className="w-6 h-6 text-slate-300 group-hover:text-sky-500 transition-all" />
                        <span className="text-[9px] font-black text-slate-400 uppercase tracking-widest group-hover:text-sky-600">New Group</span>
                    </button>
                </div>
            </div>

            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">
                {/* Main Feed */}
                <div className="xl:col-span-2 space-y-8">
                    <h3 className="text-xl font-black text-slate-900 uppercase italic tracking-tight flex items-center gap-3">
                        <MessageSquare className="w-6 h-6 text-sky-500" /> Exploration <span className="text-sky-600">Feed</span>
                    </h3>
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
                                        <button
                                            onClick={async () => {
                                                try {
                                                    await fetchWithAuth(`/questions/upvote/${post.id}`, { method: "POST" })
                                                    toast({ title: "Liked", description: "You upvoted this question!" })
                                                } catch (error) {
                                                    console.error(error)
                                                }
                                            }}
                                            className="flex items-center gap-2.5 text-slate-400 hover:text-rose-500 transition-colors group/stat">
                                            <Heart className="w-5 h-5 group-hover/stat:fill-rose-500" />
                                            <span className="text-xs font-black">{post.likes}</span>
                                        </button>
                                        <button
                                            onClick={() => {
                                                // Simplified reply logic for now
                                                toast({ title: "Opening Discussion", description: "Loading replies..." })
                                            }}
                                            className="flex items-center gap-2.5 text-slate-400 hover:text-sky-600 transition-colors group/stat">
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

            {/* Create Squad Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Form <span className="text-sky-600">New Squad</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Create a private work group to collaborate with friends.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="space-y-2.5">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Squad Name</label>
                            <Input
                                placeholder="e.g. Einstein's Heirs"
                                value={newSquad.name}
                                onChange={(e) => setNewSquad({ ...newSquad, name: e.target.value })}
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold focus:ring-sky-500/20"
                            />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Topic</label>
                                <Input
                                    placeholder="e.g. Physics Vitals"
                                    value={newSquad.topic}
                                    onChange={(e) => setNewSquad({ ...newSquad, topic: e.target.value })}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2.5">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Icon</label>
                                <Input
                                    value={newSquad.avatar}
                                    onChange={(e) => setNewSquad({ ...newSquad, avatar: e.target.value })}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                        </div>
                    </div>
                    <DialogFooter>
                        <Button
                            onClick={handleCreateSquad}
                            className="w-full h-16 rounded-[24px] bg-sky-600 hover:bg-sky-700 text-white font-black uppercase tracking-widest shadow-2xl shadow-sky-500/20 transition-all"
                        >
                            Establish Squad <ArrowUpRight className="ml-2 w-5 h-5" />
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Friends Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[48px] border-slate-100 p-10">
                    <DialogHeader>
                        <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Invite <span className="text-sky-600">Friends</span></DialogTitle>
                        <DialogDescription className="text-slate-500 font-medium">Add students to your squad to begin collaborative missions.</DialogDescription>
                    </DialogHeader>
                    <div className="py-8 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <Input placeholder="Search students by name or ID..." className="h-14 pl-12 rounded-2xl bg-slate-50 border-slate-100" />
                        </div>
                        <div className="space-y-4 max-h-[250px] overflow-y-auto pr-2">
                            {[1, 2, 3, 4].map(i => (
                                <div key={i} className="flex items-center justify-between p-4 rounded-2xl bg-slate-50 border border-slate-100 group hover:bg-white hover:shadow-lg transition-all">
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-black text-xs">U{i}</div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900">Student Name {i}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest">Active 2h ago • Grade 12</p>
                                        </div>
                                    </div>
                                    <Button
                                        onClick={async () => {
                                            try {
                                                await inviteApi.send({
                                                    inviteeId: i.toString(), // Mock ID for now
                                                    targetType: "StudyGroup",
                                                    targetId: squads[0]?.id // Current squad ID
                                                })
                                                toast({ title: "Invite Sent", description: "Your friend has been notified!" })
                                            } catch (error) {
                                                toast({ title: "Failed", description: "Could not send invite", variant: "destructive" })
                                            }
                                        }}
                                        variant="ghost" className="h-10 px-4 rounded-xl text-sky-600 font-black text-[10px] uppercase hover:bg-sky-50">
                                        Invite
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>

            {/* Global Leaderboard Dialog */}
            <Dialog open={isLeaderboardOpen} onOpenChange={setIsLeaderboardOpen}>
                <DialogContent className="sm:max-w-[800px] rounded-[48px] border-slate-100 p-0 overflow-hidden">
                    <div className="p-10 bg-slate-50 border-b border-slate-100">
                        <DialogHeader>
                            <div className="flex items-center gap-2 mb-2">
                                <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[8px] font-black uppercase tracking-widest border border-amber-100">Hall of Fame</span>
                                <Trophy className="w-3.5 h-3.5 text-amber-500" />
                            </div>
                            <DialogTitle className="text-3xl font-black text-slate-900 uppercase italic">Global <span className="text-sky-600">Leaderboards</span></DialogTitle>
                            <DialogDescription className="text-slate-500 font-medium">Track your standing against the best students across the platform.</DialogDescription>
                        </DialogHeader>
                    </div>

                    <Tabs defaultValue="semester" className="w-full">
                        <div className="bg-slate-50/50 px-10 border-b border-slate-100">
                            <TabsList className="h-16 bg-transparent gap-8">
                                <TabsTrigger value="semester" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-sky-600 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-black text-[10px] uppercase tracking-widest transition-all">Semester Ranking</TabsTrigger>
                                <TabsTrigger value="year" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-sky-600 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-black text-[10px] uppercase tracking-widest transition-all">Academic Year</TabsTrigger>
                                <TabsTrigger value="grades" className="h-full rounded-none border-b-2 border-transparent data-[state=active]:border-sky-600 data-[state=active]:bg-transparent data-[state=active]:text-sky-600 font-black text-[10px] uppercase tracking-widest transition-all">Grade Breakdown</TabsTrigger>
                            </TabsList>
                        </div>

                        <div className="p-10 max-h-[500px] overflow-y-auto">
                            <TabsContent value="semester" className="mt-0 space-y-4">
                                {LEADERBOARD_DATA.semester.map(user => (
                                    <div key={user.id} className={cn(
                                        "flex items-center gap-6 p-6 rounded-[32px] border transition-all duration-500",
                                        user.rank === 1 ? "bg-amber-50/50 border-amber-100 shadow-xl shadow-amber-500/5 group" : "bg-white border-slate-100"
                                    )}>
                                        <div className={cn(
                                            "w-12 h-12 rounded-2xl flex items-center justify-center font-black text-sm shadow-sm border",
                                            user.rank === 1 ? "bg-amber-500 text-white border-amber-400" :
                                                user.rank === 2 ? "bg-slate-300 text-slate-600 border-slate-200" :
                                                    "bg-orange-400 text-white border-orange-300"
                                        )}>
                                            {user.rank}
                                        </div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 uppercase italic flex items-center gap-2">
                                                {user.name}
                                                {user.rank === 1 && <Award className="w-4 h-4 text-amber-500" />}
                                            </h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Grade {user.grade} • Active Student</p>
                                        </div>
                                        <div className="text-right">
                                            <p className={cn("text-xl font-black leading-none", user.rank === 1 ? "text-amber-600" : "text-sky-600")}>{user.score}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">XP Points</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="year" className="mt-0 space-y-4">
                                {LEADERBOARD_DATA.year.map(user => (
                                    <div key={user.id} className="flex items-center gap-6 p-6 rounded-[32px] border bg-white border-slate-100 hover:border-sky-100 transition-all">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center font-black border border-slate-100">{user.rank}</div>
                                        <div className="flex-1">
                                            <h4 className="font-black text-slate-900 uppercase italic">{user.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-0.5">Grade {user.grade}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-xl font-black text-sky-600 leading-none">{user.score}</p>
                                            <p className="text-[8px] font-black text-slate-400 uppercase tracking-widest mt-1">Annual XP</p>
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>

                            <TabsContent value="grades" className="mt-0 space-y-12">
                                {["9", "10", "11", "12"].map(grade => (
                                    <div key={grade} className="space-y-6">
                                        <h5 className="px-4 py-1.5 rounded-full bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest inline-block italic">Grade {grade} Hall <Sparkles className="inline w-3 h-3 ml-1 text-sky-400" /></h5>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {(LEADERBOARD_DATA.grades as any)[grade].map((user: any, idx: number) => (
                                                <div key={idx} className="p-6 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-between group hover:bg-white hover:shadow-xl transition-all">
                                                    <div className="flex items-center gap-4">
                                                        <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center font-black text-xs text-sky-600 shadow-sm">#{idx + 1}</div>
                                                        <div>
                                                            <p className="font-black text-slate-900 text-sm uppercase italic">{user.name}</p>
                                                            <p className="text-[8px] font-black text-slate-400 uppercase">Season High</p>
                                                        </div>
                                                    </div>
                                                    <p className="text-lg font-black text-indigo-600">{user.score}</p>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                ))}
                            </TabsContent>
                        </div>
                    </Tabs>
                </DialogContent>
            </Dialog>

            {/* Labs Entry Dialog */}
            <Dialog open={isLabsOpen} onOpenChange={setIsLabsOpen}>
                <DialogContent className="sm:max-w-[1000px] rounded-[48px] border-slate-100 p-0 overflow-hidden bg-white shadow-3xl">
                    <div className="bg-slate-900 p-8 text-center relative overflow-hidden">
                        <div className="absolute inset-0 bg-sky-500/5 animate-pulse" />
                        <div className="relative z-10 flex items-center justify-between">
                            <div className="flex items-center gap-4 text-left">
                                <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-400 flex items-center justify-center border border-sky-500/20">
                                    <FlaskConical className="w-6 h-6" />
                                </div>
                                <div>
                                    <DialogTitle className="text-xl font-black text-white uppercase italic tracking-tight">{selectedSquad?.name} <span className="text-sky-400">Squad Lab</span></DialogTitle>
                                    <p className="text-slate-400 font-medium text-[10px] uppercase tracking-widest">Interactive Group Workspace</p>
                                </div>
                            </div>
                            <Button
                                onClick={() => setIsLabsOpen(false)}
                                variant="ghost"
                                className="w-10 h-10 rounded-xl text-slate-400 hover:text-white hover:bg-white/10"
                            >
                                <X className="w-5 h-5" />
                            </Button>
                        </div>

                        <div className="mt-8 relative z-10">
                            <Tabs defaultValue="chat" className="w-full">
                                <TabsList className="bg-white/5 border border-white/10 rounded-2xl p-1 h-14">
                                    <TabsTrigger value="chat" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                                        <MessageSquare className="w-4 h-4 mr-2" /> Chat
                                    </TabsTrigger>
                                    <TabsTrigger value="forum" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                                        <BookOpen className="w-4 h-4 mr-2" /> Forum
                                    </TabsTrigger>
                                    <TabsTrigger value="whiteboard" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                                        <FlaskConical className="w-4 h-4 mr-2" /> Whiteboard
                                    </TabsTrigger>
                                    <TabsTrigger value="qa" className="rounded-xl data-[state=active]:bg-sky-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all">
                                        <Target className="w-4 h-4 mr-2" /> Q&A
                                    </TabsTrigger>
                                    <TabsTrigger value="live" className="rounded-xl data-[state=active]:bg-rose-600 data-[state=active]:text-white font-black text-[10px] uppercase tracking-widest transition-all gap-2">
                                        <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" /> Live Lab
                                    </TabsTrigger>
                                </TabsList>

                                <div className="mt-6">
                                    <TabsContent value="chat" className="animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
                                        <GroupChatTab squadId={selectedSquad?._id} />
                                    </TabsContent>
                                    <TabsContent value="forum" className="animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
                                        <GroupForumTab squadId={selectedSquad?._id} />
                                    </TabsContent>
                                    <TabsContent value="whiteboard" className="animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
                                        <GroupWhiteboardTab
                                            squadId={selectedSquad?._id}
                                            socket={socketRef.current}
                                        />
                                    </TabsContent>
                                    <TabsContent value="qa" className="animate-in fade-in slide-in-from-bottom-4 duration-500 m-0">
                                        <GroupQandATab squadId={selectedSquad?._id} />
                                    </TabsContent>
                                    <TabsContent value="live" className="animate-in fade-in slide-in-from-bottom-4 duration-500 m-0 h-[600px]">
                                        <div className="flex flex-col items-center justify-center h-full bg-slate-900 rounded-[48px] border border-white/10 space-y-8">
                                            <div className="w-24 h-24 rounded-[32px] bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                                                <Video className="w-10 h-10 text-sky-400" />
                                            </div>
                                            <div className="text-center space-y-2">
                                                <h4 className="text-xl font-black text-white uppercase italic">Laboratory <span className="text-sky-500">Maintenance</span></h4>
                                                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest px-12 leading-relaxed">
                                                    Real-time video modules are currently being synchronized. Please use the Whiteboard and Forum for collaboration.
                                                </p>
                                            </div>
                                        </div>
                                    </TabsContent>
                                </div>
                            </Tabs>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
