"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { groupApi, inviteApi, userApi } from "@/lib/api"
import { X, Video, UserPlus, Search, Loader2, Mic, MicOff, VideoOff, Monitor, Radio, Plus, Users, Check, Crown, MessageSquare, BookOpen, PenTool, HelpCircle, Bell, ArrowLeft, Clock, Play, PhoneCall, Info, Layout } from 'lucide-react'
import { initializeSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import {
    StreamCall,
    StreamVideo,
    Call,
    CallingState,
    StreamTheme
} from "@stream-io/video-react-sdk"
import { useStream } from "@/components/providers/StreamProvider"
import { GroupChatTab } from "@/components/dashboard/squad/GroupChatTab"
import { GroupWhiteboardTab } from "@/components/dashboard/squad/GroupWhiteboardTab"
import { GroupForumTab } from "@/components/dashboard/squad/GroupForumTab"
import { GroupQandATab } from "@/components/dashboard/squad/GroupQandATab"
import { GroupStudentsTab } from "@/components/dashboard/squad/GroupStudentsTab"
import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
import { PermissionRecoveryModal } from "@/components/dashboard/stream/PermissionRecoveryModal"
import { getCurrentUser } from "@/lib/auth-utils"

const AVATARS = ["🧬", "⚗️", "🔭", "🧪", "📡", "🛸", "⚡", "🌌", "🔬", "📐"]

// ─────────── Small Components ───────────

function Avatar({ name, size = "md", color = "sky" }: { name?: string; size?: "sm" | "md" | "lg"; color?: string }) {
    const sizes = { sm: "w-8 h-8 text-xs", md: "w-10 h-10 text-sm", lg: "w-14 h-14 text-base" }
    const colors: Record<string, string> = {
        sky: "bg-sky-50 text-sky-600 border border-sky-100",
        indigo: "bg-indigo-50 text-indigo-600 border border-indigo-100",
        amber: "bg-amber-50 text-amber-600 border border-amber-100",
        emerald: "bg-emerald-50 text-emerald-600 border border-emerald-100",
        rose: "bg-rose-50 text-rose-600 border border-rose-100",
        purple: "bg-purple-50 text-purple-600 border border-purple-100",
    }
    return (
        <div className={cn("rounded-2xl flex items-center justify-center font-black uppercase shrink-0", sizes[size], colors[color] || colors.sky)}>
            {name?.[0] || "?"}
        </div>
    )
}

// ─────────── Squad Card ───────────

function SquadCard({ squad, onOpen, onInvite, currentUserId }: {
    squad: any; onOpen: (s: any) => void; onInvite: (s: any) => void; currentUserId: string
}) {
    const isOwner = (squad.creator?._id || squad.creator)?.toString() === currentUserId
    const memberCount = squad.members?.length || 0
    const isLive = squad.isLive

    return (
        <div
            className={cn(
                "group relative bg-white border rounded-[32px] p-6 hover:shadow-2xl hover:shadow-slate-200/50 hover:-translate-y-1.5 transition-all duration-500 cursor-pointer flex flex-col gap-6 shadow-sm",
                isLive ? "border-rose-200 bg-rose-50/20" : "border-slate-100"
            )}
            onClick={() => onOpen(squad)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-14 h-14 rounded-2xl flex items-center justify-center text-2xl shadow-sm transition-transform group-hover:scale-110",
                    isLive ? "bg-rose-500 text-white" : "bg-slate-50 border border-slate-100 text-slate-900"
                )}>
                    {squad.avatar || "🧬"}
                </div>
                <div className="flex flex-col items-end gap-2">
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-3 py-1 bg-rose-50 text-rose-500 rounded-full animate-pulse border border-rose-100">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live</span>
                        </div>
                    )}
                    {isOwner && (
                        <span className="flex items-center gap-1.5 text-[8px] font-black uppercase tracking-[0.2em] bg-slate-900 text-white px-3 py-1 rounded-full">
                            <Crown className="w-2.5 h-2.5" /> Lead
                        </span>
                    )}
                </div>
            </div>
            {/* Info */}
            <div className="flex-1 space-y-1">
                <h3 className="font-bold text-slate-900 text-lg leading-tight group-hover:text-sky-600 transition-colors">{squad.name}</h3>
                <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest truncate">{squad.topic || "Collaboration"}</p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-50">
                <div className="flex items-center gap-1.5">
                    <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                            <div key={i} className="w-6 h-6 rounded-full bg-slate-100 border-2 border-white flex items-center justify-center text-[8px] font-black text-slate-400">
                                {i}
                            </div>
                        ))}
                    </div>
                    <span className="text-[10px] font-bold text-slate-400 ml-2">+{memberCount} members</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        onClick={e => { e.stopPropagation(); onOpen(squad) }}
                        className={cn(
                            "h-9 px-4 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                            isLive ? "bg-rose-600 text-white hover:bg-rose-700 shadow-xl shadow-rose-200" : "bg-slate-900 text-white hover:bg-slate-700 shadow-xl shadow-slate-200"
                        )}
                    >
                        {isLive ? "Join" : "Enter"}
                    </Button>
                </div>
            </div>
        </div>
    )
}

// ─────────── Invite Card ───────────

function InviteCard({ invite, onAccept, onDecline }: { invite: any; onAccept: () => void; onDecline: () => void }) {
    const [loading, setLoading] = useState(false)
    return (
        <div className="flex items-center gap-4 p-5 rounded-3xl bg-white/50 backdrop-blur-md border border-white/50 shadow-sm">
            <Avatar name={invite.inviter?.fullName} color="sky" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-bold text-slate-900 truncate">{invite.inviter?.fullName || "A peer"}</p>
                <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest truncate">
                    Invite to <span className="text-sky-600">{invite.targetId?.name || "Squad"}</span>
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button
                    size="sm"
                    disabled={loading}
                    onClick={async () => { setLoading(true); await onAccept(); setLoading(false) }}
                    className="h-9 w-9 p-0 rounded-xl bg-slate-900 hover:bg-slate-800 text-white shadow-lg shadow-slate-200"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-4 h-4" />}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={loading}
                    onClick={async () => { setLoading(true); await onDecline(); setLoading(false) }}
                    className="h-9 w-9 p-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                    <X className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

// ─────────── Live Session Alert ───────────

function LiveAlert({ alert, onJoin, onDismiss }: { alert: any, onJoin: () => void, onDismiss: () => void }) {
    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[420px] bg-white/80 backdrop-blur-3xl p-6 rounded-[40px] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.1)] animate-in fade-in zoom-in duration-500 ring-1 ring-slate-100">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-rose-500 flex items-center justify-center text-white shadow-2xl relative overflow-hidden shrink-0 group">
                    <Video className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-1.5 w-1.5 rounded-full bg-rose-500 animate-ping" />
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Live Class</h4>
                    </div>
                    <p className="text-[16px] text-slate-900 font-bold leading-tight">
                        {alert.hostName} <span className="text-slate-400 font-medium">is teaching in</span>
                    </p>
                    <p className="text-[12px] text-sky-600 font-black uppercase tracking-widest mt-1">
                        {alert.squadName}
                    </p>
                </div>
                <button onClick={onDismiss} className="w-10 h-10 rounded-2xl bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-6 flex gap-3">
                <Button
                    onClick={onJoin}
                    className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-200 active:scale-95 transition-all"
                >
                    <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Join Class
                </Button>
            </div>
        </div>
    )
}

// ─────────── Main Page ───────────

function ClassSquadContent() {
    const [squads, setSquads] = useState<any[]>([])
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [receivedInvites, setReceivedInvites] = useState<any[]>([])
    const [sentInvites, setSentInvites] = useState<any[]>([])
    const [pendingInviteIds, setPendingInviteIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)
    const [invitingSids, setInvitingSids] = useState<Set<string>>(new Set())
    const [activeCall, setActiveCall] = useState<Call | null>(null)
    const [activeSquad, setActiveSquad] = useState<any>(null)
    const [isJoining, setIsJoining] = useState(false)
    const [liveAlert, setLiveAlert] = useState<{ callId: string; squadName: string; hostName: string; squadId: string } | null>(null)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteTarget, setInviteTarget] = useState<any | null>(null)
    const [inviteSearch, setInviteSearch] = useState("")
    const [newSquad, setNewSquad] = useState({ name: "", topic: "", avatar: "🧬" })
    const [squadSearch, setSquadSearch] = useState("")
    const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false)
    const [creating, setCreating] = useState(false)
    const socketRef = useRef<any>(null)
    const { videoClient, isReady: isStreamReady, initError: streamError, retryInit } = useStream()
    
    const [currentUser, setCurrentUser] = useState<any>(null)
    const [currentUserId, setCurrentUserId] = useState<string>("")

    const searchParams = useSearchParams()
    const externalCallId = searchParams ? searchParams.get('joinCall') : null

    useEffect(() => {
        const user = getCurrentUser()
        if (user) {
            setCurrentUser(user)
            setCurrentUserId((user._id || user.id || "") as string)
        }
    }, [])

    useEffect(() => {
        if (externalCallId && isStreamReady && videoClient && currentUser) {
            const handleAutoJoin = async () => {
                const call = videoClient.call('default', externalCallId)
                try {
                    await call.getOrCreate()
                    setActiveCall(call)
                    setActiveSquad({ name: "Live Session", avatar: "⚡", members: [] })
                } catch (e) {
                    console.error("Deep link join failed", e)
                }
            }
            handleAutoJoin()
        }
    }, [externalCallId, isStreamReady, videoClient, currentUser])

    const fetchAll = async () => {
        try {
            const squadRes = await groupApi.getMyGroups()
            const squadsArr = Array.isArray(squadRes) ? squadRes : (squadRes?.data || [])
            setSquads(squadsArr)
            
            if (socketRef.current) {
                squadsArr.forEach((s: any) => {
                    socketRef.current.emit("join-squad", s._id);
                });
            }

            const liveSquad = squadsArr.find((s: any) => s.isLive)
            if (liveSquad && liveSquad.sessionData?.callId) {
                setLiveAlert({ callId: liveSquad.sessionData.callId, squadName: liveSquad.name, squadId: liveSquad._id, hostName: "Squad Host" })
            }
        } catch (e) { console.warn("[Squad] Failed squads:", e) }
        try {
            const studentRes = await userApi.getAllStudents()
            setAllStudents(Array.isArray(studentRes) ? studentRes : (studentRes?.data || []))
        } catch (e) { console.warn("[Squad] Failed students:", e) }
        try {
            const inviteRes = await inviteApi.getMine()
            const all = Array.isArray(inviteRes) ? inviteRes : (inviteRes?.data || [])
            setReceivedInvites(all.filter((inv: any) => (inv.invitee?._id || inv.invitee)?.toString() === currentUserId && inv.status === "pending"))
            setSentInvites(all.filter((inv: any) => (inv.inviter?._id || inv.inviter)?.toString() === currentUserId))
            setPendingInviteIds(new Set(all.filter((inv: any) => (inv.inviter?._id || inv.inviter)?.toString() === currentUserId && inv.status === "pending").map((inv: any) => (inv.invitee?._id || inv.invitee)?.toString())))
        } catch (e) { console.warn("[Squad] Failed invites:", e) }
        setLoading(false)
    }

    useEffect(() => {
        fetchAll()
        if (!currentUserId) return
        const socket = initializeSocket(currentUserId)
        socketRef.current = socket

        socket.on("new-invite", (data: any) => {
            setReceivedInvites(prev => [data, ...prev])
            toast({ title: "New Invite!" })
        })

        socket.on("squad-live-started", (data: any) => {
            const { callId, squadName, hostName, squadId, hostId } = data
            if (hostId === currentUserId) return
            setSquads(prev => prev.map(s => s._id === squadId ? { ...s, isLive: true, sessionData: { callId } } : s))
            setActiveSquad(prev => prev?._id === squadId ? { ...prev, isLive: true, sessionData: { callId } } : prev)
            setLiveAlert({ callId, squadName, hostName, squadId })
        })

        socket.on("squad-live-ended", (data: any) => {
            const { squadId } = data
            setSquads(prev => prev.map(s => s._id === squadId ? { ...s, isLive: false, sessionData: null } : s))
            setActiveSquad(prev => prev?._id === squadId ? { ...prev, isLive: false, sessionData: null } : prev)
            setLiveAlert(prev => prev?.squadId === squadId ? null : prev)
        })

        return () => {
            socket.off("new-invite")
            socket.off("squad-live-started")
            socket.off("squad-live-ended")
            socket.disconnect()
        }
    }, [currentUserId])

    const handleRespond = async (inviteId: string, status: "accepted" | "declined") => {
        try {
            await inviteApi.respond(inviteId, status)
            setReceivedInvites(prev => prev.filter(inv => inv._id !== inviteId))
            if (status === "accepted") { await fetchAll(); toast({ title: "Joined!" }) }
        } catch (e) { toast({ title: "Error", variant: "destructive" }) }
    }

    const handleCreateSquad = async () => {
        if (!newSquad.name.trim()) return
        setCreating(true)
        try {
            const res = await groupApi.create({ name: newSquad.name, topic: newSquad.topic || "General", avatar: newSquad.avatar })
            const squad = res?.data || res
            setSquads(prev => [squad, ...prev])
            setIsCreateOpen(false)
            setNewSquad({ name: "", topic: "", avatar: "🧬" })
            toast({ title: "Squad Created!" })
        } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }) } finally { setCreating(false) }
    }

    const handleSendInvite = async (student: any) => {
        if (!inviteTarget) return
        const sid = (student._id || student.id) as string
        setInvitingSids(prev => new Set([...prev, sid]))
        try {
            await inviteApi.send({ inviteeId: sid, targetType: "StudyGroup", targetId: inviteTarget._id })
            setPendingInviteIds(prev => new Set([...prev, sid]))
            toast({ title: "Invite Sent!" })
        } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }) } finally { setInvitingSids(prev => { const s = new Set(prev); s.delete(sid); return s }) }
    }

    const handleJoinLive = async (squad: any, callId?: string) => { 
        if (!videoClient) return
        const { getCallId } = await import("@/lib/utils")
        const cid = callId || getCallId('squad', squad._id)
        const call = videoClient.call('default', cid)
        try {
            await call.getOrCreate()
            if (!callId && !squad.isLive) {
                await groupApi.toggleLive(squad._id, { isLive: true, sessionData: { callId: cid } })
                socketRef.current?.emit("squad-live-start", { 
                    callId: cid, 
                    squadId: squad._id, 
                    squadName: squad.name, 
                    hostId: currentUserId,
                    hostName: currentUser?.fullName || "A peer"
                })
            }
            setActiveCall(call)
            setActiveSquad(squad)
        } catch (e: any) { toast({ title: "Failed", description: e.message, variant: "destructive" }) }
    }

    const handleLeaveLive = async () => {
        if (!activeCall) return
        
        // 1. Backend cleanup if host
        const isHost = activeCall.state.createdBy?.id === currentUserId
        if (isHost && activeSquad) {
            await groupApi.toggleLive(activeSquad._id, { isLive: false }).catch(console.error)
            socketRef.current?.emit("squad-live-stop", { squadId: activeSquad._id })
        }

        // 2. Safely leave the call if not already left
        const s = activeCall.state.callingState
        if (s !== "left" && s !== "idle") {
            try {
                await activeCall.leave()
            } catch (e) {
                console.warn("Error leaving call:", e)
            }
        }

        // 3. Reset UI state
        setActiveCall(null)
        setActiveSquad(null)
    }

    const handleJoinFromAlert = async () => {
        if (!liveAlert) return
        const sq = squads.find(s => s._id === liveAlert.squadId) || { _id: liveAlert.squadId, name: liveAlert.squadName }
        await handleJoinLive(sq, liveAlert.callId); setLiveAlert(null)
    }

    if (activeCall && activeSquad) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950">
                <LiveClassroom call={activeCall!} squadName={activeSquad.name} squadId={activeSquad._id} socket={socketRef.current} onLeave={handleLeaveLive} />
            </div>
        )
    }

    if (activeSquad) {
        return (
            <>
                <SquadWorkspace squad={activeSquad} onBack={() => setActiveSquad(null)} onStartLive={() => handleJoinLive(activeSquad)} onInvite={() => { setInviteTarget(activeSquad); setIsInviteOpen(true) }} isStreamReady={isStreamReady} socket={socketRef.current} />
                {liveAlert && <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />}
            </>
        )
    }

    const filteredSquads = squads.filter(s => s.name?.toLowerCase().includes(squadSearch.toLowerCase()))

    return (
        <div className="min-h-screen bg-white pb-32 animate-in fade-in duration-700">
            {liveAlert && <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />}
            
            {/* CLEAN HEADER */}
            <div className="max-w-7xl mx-auto px-6 pt-12 space-y-8">
                <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                    <div className="space-y-4">
                        <div className="flex items-center gap-3">
                            <div className="w-2 h-2 rounded-full bg-slate-900" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Collaboration Hub</span>
                        </div>
                        <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                            Class <span className="font-semibold text-slate-900">Squads</span>
                        </h1>
                        <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
                            Join your classmates in private study groups, share resources, and start live sessions.
                        </p>
                    </div>

                    <div className="flex gap-4">
                        <div className="relative w-full md:w-64 group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                            <input
                                value={squadSearch}
                                onChange={(e) => setSquadSearch(e.target.value)}
                                placeholder="Search squads..."
                                className="w-full h-14 pl-12 pr-6 rounded-2xl border border-slate-100 bg-white text-xs font-medium outline-none focus:ring-4 focus:ring-sky-500/5 focus:border-sky-300 transition-all shadow-sm"
                            />
                        </div>
                        <Button onClick={() => setIsCreateOpen(true)} className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest hover:bg-slate-800 shadow-xl shadow-slate-100">
                            <Plus className="w-4 h-4 mr-2" /> New Squad
                        </Button>
                    </div>
                </div>

                {/* INVITES SECTION */}
                {receivedInvites.length > 0 && (
                    <div className="space-y-6 bg-slate-50 p-8 rounded-[40px] border border-slate-100">
                        <div className="flex items-center gap-4">
                            <Bell className="text-sky-500" size={20} />
                            <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Pending Invitations ({receivedInvites.length})</h2>
                        </div>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                            {receivedInvites.map(invite => <InviteCard key={invite._id} invite={invite} onAccept={() => handleRespond(invite._id, "accepted")} onDecline={() => handleRespond(invite._id, "declined")} />)}
                        </div>
                    </div>
                )}

                {/* SQUADS GRID */}
                <div className="space-y-8 pt-8">
                    <div className="flex items-center gap-4">
                        <Layout className="text-slate-900" size={20} />
                        <h2 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">My Active Squads</h2>
                    </div>
                    
                    {loading ? (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                            {[1, 2, 3, 4].map(i => <div key={i} className="h-64 bg-slate-50 rounded-[40px] border border-slate-100 animate-pulse" />)}
                        </div>
                    ) : filteredSquads.length === 0 ? (
                        <div className="py-32 text-center bg-slate-50 rounded-[48px] border border-dashed border-slate-200">
                            <Info size={48} className="mx-auto text-slate-200 mb-6" />
                            <h4 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.3em]">No squads found</h4>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredSquads.map(s => <SquadCard key={s._id} squad={s} currentUserId={currentUserId} onOpen={setActiveSquad} onInvite={s => { setInviteTarget(s); setIsInviteOpen(true) }} />)}
                        </div>
                    )}
                </div>
            </div>

            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md rounded-[40px] p-10 border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Create a New Squad</DialogTitle>
                        <p className="text-slate-400 text-sm">Choose an avatar and name for your study group.</p>
                    </DialogHeader>
                    <div className="space-y-8 py-8">
                        <div className="flex flex-wrap gap-2 justify-center">
                            {AVATARS.map(a => (
                                <button 
                                    key={a} 
                                    onClick={() => setNewSquad(p => ({ ...p, avatar: a }))} 
                                    className={cn(
                                        "w-12 h-12 rounded-2xl border-2 transition-all text-xl flex items-center justify-center", 
                                        newSquad.avatar === a ? "border-slate-900 bg-slate-50 scale-110 shadow-lg" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <div className="space-y-4">
                            <Input value={newSquad.name} onChange={e => setNewSquad(p => ({ ...p, name: e.target.value }))} placeholder="e.g. Bio Squad Grade 11" className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-6" />
                            <Input value={newSquad.topic} onChange={e => setNewSquad(p => ({ ...p, topic: e.target.value }))} placeholder="e.g. Mitosis Exam Prep" className="h-14 rounded-2xl bg-slate-50 border-slate-100 px-6" />
                        </div>
                    </div>
                    <DialogFooter>
                        <Button onClick={handleCreateSquad} disabled={!newSquad.name.trim() || creating} className="w-full h-14 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]">
                            {creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Initialize Squad"}
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="max-w-md rounded-[40px] p-10 border-none shadow-2xl">
                    <DialogHeader className="space-y-4">
                        <DialogTitle className="text-2xl font-bold tracking-tight">Invite Classmates</DialogTitle>
                        <p className="text-slate-400 text-sm">Search for students to join <span className="text-slate-900 font-bold">{inviteTarget?.name}</span></p>
                    </DialogHeader>
                    <div className="py-6 space-y-6">
                        <div className="relative group">
                            <Search className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input value={inviteSearch} onChange={e => setInviteSearch(e.target.value)} placeholder="Search by name..." className="h-12 pl-12 pr-6 rounded-2xl bg-slate-50 border-slate-100" />
                        </div>
                        <div className="space-y-3 max-h-80 overflow-y-auto pr-2 custom-scrollbar">
                            {allStudents.filter(s => (s._id || s.id) !== currentUserId && !inviteTarget?.members?.some((m: any) => (m._id || m)?.toString() === (s._id || s.id)?.toString()) && (s.fullName || "").toLowerCase().includes(inviteSearch.toLowerCase())).map(student => (
                                <div key={student._id || student.id} className="flex items-center justify-between p-4 rounded-2xl bg-white border border-slate-100 hover:border-sky-200 transition-colors group">
                                    <div className="flex items-center gap-3">
                                        <Avatar name={student.fullName} size="sm" />
                                        <span className="text-sm font-bold text-slate-900">{student.fullName}</span>
                                    </div>
                                    <Button size="sm" onClick={() => handleSendInvite(student)} className="h-9 px-4 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest">
                                        {invitingSids.has(student._id || student.id) ? <Loader2 className="w-3 h-3 animate-spin" /> : "Invite"}
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}

export default function ClassSquad() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-screen items-center justify-center bg-white">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400 tracking-widest">Entering Hub...</p>
            </div>
        }>
            <ClassSquadContent />
        </Suspense>
    )
}

// ─────────── Squad Workspace Redesign ───────────

const TABS = [
    { id: "chat", label: "Chat Feed", Icon: MessageSquare },
    { id: "forum", label: "Resources", Icon: BookOpen },
    { id: "students", label: "Members", Icon: Users },
    { id: "whiteboard", label: "Canvas", Icon: PenTool },
    { id: "qa", label: "Q&A Hub", Icon: HelpCircle },
]

function SquadWorkspace({ squad, onBack, onStartLive, onInvite, isStreamReady, socket }: {
    squad: any;
    onBack: () => void;
    onStartLive: () => void;
    onInvite: () => void;
    isStreamReady: boolean;
    socket: any;
}) {
    const [activeTab, setActiveTab] = useState("chat")

    return (
        <div className="flex flex-col h-screen bg-white animate-in slide-in-from-right duration-500">
            {/* CLEAN WORKSPACE HEADER */}
            <div className="flex items-center gap-6 px-8 py-6 border-b border-slate-100 bg-white shrink-0">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="rounded-2xl h-12 w-12 text-slate-400 hover:text-slate-900 hover:bg-slate-50 transition-all border border-transparent hover:border-slate-100"
                >
                    <ArrowLeft className="w-5 h-5" />
                </Button>
                
                <div className="flex items-center gap-4 flex-1">
                    <div className="w-14 h-14 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-2xl shadow-sm">
                        {squad.avatar || "🧬"}
                    </div>
                    <div>
                        <h2 className="font-bold text-slate-900 text-xl tracking-tight">{squad.name}</h2>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-[0.2em]">{squad.members?.length || 0} Members Online</span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em]">{squad.topic || "Research"}</span>
                        </div>
                    </div>
                </div>

                <div className="flex gap-3">
                    <Button
                        variant="outline"
                        onClick={onInvite}
                        className="h-12 px-6 rounded-2xl border-slate-100 text-[10px] font-black uppercase tracking-widest hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <UserPlus className="w-4 h-4 mr-2 text-sky-600" /> Invite
                    </Button>
                    <Button
                        onClick={onStartLive}
                        disabled={!isStreamReady}
                        className={cn(
                            "h-12 px-8 rounded-2xl text-white text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-xl transition-all active:scale-95",
                            squad.isLive ? "bg-emerald-600 hover:bg-emerald-700 shadow-emerald-100" : "bg-rose-600 hover:bg-rose-700 shadow-rose-100"
                        )}
                    >
                        {squad.isLive ? <Radio className="w-4 h-4 animate-pulse" /> : <Video className="w-4 h-4" />}
                        {squad.isLive ? "Join Live Now" : "Go Live"}
                    </Button>
                </div>
            </div>

            {/* TAB BAR */}
            <div className="flex justify-center gap-2 border-b border-slate-100 bg-white/50 backdrop-blur-md px-8 py-2 shrink-0 sticky top-0 z-10">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={cn(
                            "flex items-center gap-2.5 px-6 py-3 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all",
                            activeTab === id
                                ? "bg-slate-900 text-white shadow-lg shadow-slate-200"
                                : "text-slate-400 hover:text-slate-900 hover:bg-slate-50"
                        )}
                    >
                        <Icon className="w-4 h-4" />
                        <span>{label}</span>
                    </button>
                ))}
            </div>

            {/* CONTENT AREA */}
            <div className="flex-1 min-h-0 bg-slate-50/30 overflow-hidden">
                <div className={cn("h-full", activeTab !== "chat" && "hidden")}>
                    <GroupChatTab squadId={squad._id} members={squad.members} />
                </div>
                <div className={cn("h-full overflow-y-auto", activeTab !== "forum" && "hidden")}>
                    <GroupForumTab squadId={squad._id} />
                </div>
                <div className={cn("h-full", activeTab !== "whiteboard" && "hidden")}>
                    <GroupWhiteboardTab squadId={squad._id} socket={socket} />
                </div>
                <div className={cn("h-full overflow-y-auto", activeTab !== "students" && "hidden")}>
                    <GroupStudentsTab members={squad.members} />
                </div>
                <div className={cn("h-full overflow-y-auto", activeTab !== "qa" && "hidden")}>
                    <GroupQandATab squadId={squad._id} />
                </div>
            </div>
        </div>
    )
}
