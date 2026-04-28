"use client"

import { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { groupApi, inviteApi, userApi } from "@/lib/api"
import { X, Video, UserPlus, Search, Loader2, Mic, MicOff, VideoOff, Monitor, Radio, Plus, Users, Check, Crown, MessageSquare, BookOpen, PenTool, HelpCircle, Bell, ArrowLeft, Clock, Play, PhoneCall } from 'lucide-react'
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
        sky: "bg-sky-100 text-sky-600",
        indigo: "bg-indigo-100 text-indigo-600",
        amber: "bg-amber-100 text-amber-600",
        emerald: "bg-emerald-100 text-emerald-600",
        rose: "bg-rose-100 text-rose-600",
        purple: "bg-purple-100 text-purple-600",
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
                "group relative bg-white border rounded-3xl p-5 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 shadow-sm",
                isLive ? "border-rose-200 bg-rose-50/30" : "border-slate-100"
            )}
            onClick={() => onOpen(squad)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center text-xl shadow-lg transition-transform group-hover:scale-110",
                    isLive ? "bg-gradient-to-br from-rose-500 to-orange-500" : "bg-gradient-to-br from-blue-500 to-indigo-600"
                )}>
                    {squad.avatar || "🧬"}
                </div>
                <div className="flex flex-col items-end gap-1">
                    {isLive && (
                        <div className="flex items-center gap-1.5 px-2.5 py-1 bg-rose-100 text-rose-600 rounded-full animate-pulse border border-rose-200">
                            <span className="w-1.5 h-1.5 bg-rose-500 rounded-full" />
                            <span className="text-[9px] font-black uppercase tracking-widest">Live Now</span>
                        </div>
                    )}
                    {isOwner && (
                        <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-full">
                            <Crown className="w-2.5 h-2.5" /> Owner
                        </span>
                    )}
                </div>
            </div>
            {/* Info */}
            <div className="flex-1">
                <h3 className="font-black text-slate-900 text-base leading-tight group-hover:text-sky-600 transition-colors">{squad.name}</h3>
                <p className="text-[10px] font-semibold text-slate-400 mt-0.5 uppercase tracking-wider truncate">{squad.topic || "General Collaboration"}</p>
            </div>
            {/* Footer */}
            <div className="flex items-center justify-between pt-3 border-t border-slate-50">
                <div className="flex items-center gap-1.5 text-xs text-slate-400">
                    <Users className="w-3.5 h-3.5" />
                    <span className="font-bold">{memberCount}</span>
                    <span>members</span>
                </div>
                <div className="flex gap-2">
                    <Button
                        size="sm"
                        variant="ghost"
                        onClick={e => { e.stopPropagation(); onInvite(squad) }}
                        className="h-8 px-3 rounded-xl text-[10px] font-black uppercase text-slate-400 hover:text-indigo-600 hover:bg-indigo-50"
                    >
                        <UserPlus className="w-3 h-3 mr-1" /> Invite
                    </Button>
                    <Button
                        size="sm"
                        onClick={e => { e.stopPropagation(); onOpen(squad) }}
                        className={cn(
                            "h-8 px-3 rounded-xl text-[10px] font-black uppercase shadow-lg transition-all",
                            isLive ? "bg-rose-600 text-white hover:bg-rose-700 shadow-rose-200" : "bg-slate-900 text-white hover:bg-slate-700"
                        )}
                    >
                        {isLive ? "Join Live" : "Open"}
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
        <div className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-amber-100 shadow-sm">
            <Avatar name={invite.inviter?.fullName} color="amber" />
            <div className="flex-1 min-w-0">
                <p className="text-sm font-black text-slate-900 truncate">{invite.inviter?.fullName || "Someone"}</p>
                <p className="text-[10px] text-slate-500 font-semibold truncate">
                    To <span className="text-slate-700 font-black">{invite.targetId?.name || "a squad"}</span>
                </p>
            </div>
            <div className="flex gap-2 shrink-0">
                <Button
                    size="sm"
                    disabled={loading}
                    onClick={async () => { setLoading(true); await onAccept(); setLoading(false) }}
                    className="h-8 w-8 p-0 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white"
                >
                    {loading ? <Loader2 className="w-3 h-3 animate-spin" /> : <Check className="w-3.5 h-3.5" />}
                </Button>
                <Button
                    size="sm"
                    variant="ghost"
                    disabled={loading}
                    onClick={async () => { setLoading(true); await onDecline(); setLoading(false) }}
                    className="h-8 w-8 p-0 rounded-xl text-slate-400 hover:bg-rose-50 hover:text-rose-500"
                >
                    <X className="w-3.5 h-3.5" />
                </Button>
            </div>
        </div>
    )
}

// ─────────── Live Session Alert ───────────

function LiveAlert({ alert, onJoin, onDismiss }: { alert: any, onJoin: () => void, onDismiss: () => void }) {
    return (
        <div className="fixed top-8 left-1/2 -translate-x-1/2 z-[100] w-full max-w-[420px] bg-white/90 backdrop-blur-3xl p-6 rounded-[3rem] border border-white shadow-[0_40px_100px_rgba(0,0,0,0.15)] animate-in fade-in zoom-in duration-500 ring-4 ring-rose-500/10">
            <div className="flex items-center gap-6">
                <div className="w-16 h-16 rounded-[2rem] bg-gradient-to-br from-rose-500 via-rose-600 to-orange-500 flex items-center justify-center text-white shadow-2xl relative overflow-hidden shrink-0 group">
                    <Video className="w-8 h-8 relative z-10 group-hover:scale-110 transition-transform" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-1.5">
                        <span className="flex h-2 w-2 rounded-full bg-rose-500 animate-ping" />
                        <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.3em]">Live Classroom</h4>
                    </div>
                    <p className="text-[16px] text-slate-900 font-black leading-tight">
                        {alert.hostName} <span className="text-slate-400 font-medium">is teaching in</span>
                    </p>
                    <p className="text-[12px] text-sky-600 font-black uppercase tracking-wider mt-0.5">
                        {alert.squadName}
                    </p>
                </div>
                <button onClick={onDismiss} className="w-10 h-10 rounded-2xl bg-slate-100 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all">
                    <X className="w-5 h-5" />
                </button>
            </div>
            <div className="mt-6 flex gap-3">
                <Button
                    variant="outline"
                    onClick={onDismiss}
                    className="h-12 px-6 rounded-2xl text-[10px] font-black uppercase tracking-widest border-slate-200"
                >
                    Dismiss
                </Button>
                <Button
                    onClick={onJoin}
                    className="flex-1 h-12 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-600/20 active:scale-95 transition-all"
                >
                    <Play className="w-3.5 h-3.5 mr-2 fill-current" /> Join Class Now
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
    const currentUser = getCurrentUser()
    const currentUserId = (currentUser?._id || currentUser?.id || "") as string
    const searchParams = useSearchParams()
    const externalCallId = searchParams.get('joinCall')

    // Handle Deep Link Joins
    useEffect(() => {
        if (externalCallId && isStreamReady && videoClient && currentUser) {
            const handleAutoJoin = async () => {
                const call = videoClient.call('default', externalCallId)
                try {
                    await call.getOrCreate()
                    setActiveCall(call)
                    setActiveSquad({ name: "Study Hub Session", avatar: "⚡", members: [] })
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
            const liveSquad = squadsArr.find((s: any) => s.isLive)
            if (liveSquad && liveSquad.sessionData?.callId) {
                setLiveAlert({ callId: liveSquad.sessionData.callId, squadName: liveSquad.name, squadId: liveSquad._id, hostName: "A squad member" })
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
            toast({ title: "🏆 New Squad Invite!" })
        })

        socket.on("squad-live-started", (data: any) => {
            const { callId, squadName, hostName, squadId, hostId } = data
            if (hostId === currentUserId) return
            setSquads(prev => prev.map(s => s._id === squadId ? { ...s, isLive: true, sessionData: { callId } } : s))
            
            // Also update activeSquad if the user is currently looking at it
            setActiveSquad(prev => {
                if (prev?._id === squadId) {
                    return { ...prev, isLive: true, sessionData: { callId } }
                }
                return prev
            })

            setLiveAlert({ callId, squadName, hostName, squadId })
            toast({ title: "Live Now!", description: `${hostName} is teaching in ${squadName}` })
        })

        socket.on("squad-live-ended", (data: any) => {
            const { squadId } = data
            setSquads(prev => prev.map(s => s._id === squadId ? { ...s, isLive: false, sessionData: null } : s))
            
            // Also update activeSquad if the user is currently looking at it
            setActiveSquad(prev => {
                if (prev?._id === squadId) {
                    return { ...prev, isLive: false, sessionData: null }
                }
                return prev
            })

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
            if (status === "accepted") { await fetchAll(); toast({ title: "✅ Squad Joined!" }) }
        } catch (e) { toast({ title: "Error", variant: "destructive" }) }
    }

    const handleCreateSquad = async () => {
        if (!newSquad.name.trim()) return
        setCreating(true)
        try {
            const res = await groupApi.create({ name: newSquad.name, topic: newSquad.topic || "General", avatar: newSquad.avatar })
            // API may return { success: true, data: squadObj } or the squad directly
            const squad = res?.data || res
            if (!squad || !squad._id) throw new Error("Invalid response from server")
            setSquads(prev => [squad, ...prev])
            setIsCreateOpen(false)
            setNewSquad({ name: "", topic: "", avatar: "🧬" })
            toast({ title: "✅ Squad Created!", description: `"${squad.name}" is ready.` })
        } catch (e: any) { toast({ title: "Failed to Create Squad", description: e.message, variant: "destructive" }) } finally { setCreating(false) }
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

    const startLaboratory = async (squad: any, existingCallId?: string) => {
        if (!currentUser) return
        if (!videoClient) {
            if (streamError) {
                toast({ title: "Stream Not Ready", description: streamError, variant: "destructive" })
            } else {
                toast({ title: "Stream Initializing", description: "Please wait a moment then try again.", variant: "destructive" })
            }
            return
        }
        const currentUserId = currentUser?._id || currentUser?.id
        setIsJoining(true)
        const callId = existingCallId || squad.sessionData?.callId || `squad-${squad._id}-${Date.now()}`
        const call = videoClient.call('default', callId)
        try {
            await call.getOrCreate({ data: { members: (squad.members?.map((m: any) => m._id || m) || []).map((id: string) => ({ user_id: id, role: 'admin' })), custom: { squadName: squad.name, squadId: squad._id } } })
            
            // Only toggle backend and emit socket if WE are the ones starting a NEW session
            if (!existingCallId && !squad.isLive && socketRef.current) {
                await groupApi.toggleLive(squad._id, { isLive: true, sessionData: { callId } })
                socketRef.current.emit("squad-live-start", { callId, squadId: squad._id, squadName: squad.name, hostId: currentUserId, hostName: currentUser?.fullName || "Someone", memberIds: squad.members?.map((m: any) => m._id || m).filter((id: string) => id !== currentUserId) || [] })
            }
            setActiveCall(call); setActiveSquad(squad)
        } catch (e: any) { console.error("[Lab Failed]", e); toast({ title: "Failed to join video", description: e.message, variant: "destructive" }) } finally { setIsJoining(false) }
    }

    const handleJoinLive = async (squad: any, callId?: string) => { await startLaboratory(squad, callId) }

    const handleLeaveLive = async () => {
        if (!activeCall || !activeSquad) {
            setIsJoining(false)
            return
        }
        const callToLeave = activeCall; const squadToLeave = activeSquad

        // 1. Immediate UI Reset
        setActiveCall(null)
        setActiveSquad(null)
        setIsJoining(false)

        try {
            const s = callToLeave.state.callingState
            if (s !== CallingState.LEFT && s !== CallingState.UNKNOWN) {
                await callToLeave.leave().catch(e => console.warn("Error leaving call:", e))
            }

            const isHost = callToLeave.state.createdBy?.id === (currentUser?._id || currentUser?.id)
            if (isHost) {
                try {
                    await groupApi.toggleLive(squadToLeave._id, { isLive: false })
                    if (socketRef.current) {
                        socketRef.current.emit("squad-live-stop", {
                            squadId: squadToLeave._id,
                            memberIds: squadToLeave.members?.map((m: any) => m._id || m).filter((id: string) => id !== (currentUser?._id || currentUser?.id)) || []
                        })
                    }
                } catch (signalingErr) {
                    console.error("Signaling friction (Non-critical):", signalingErr)
                }
            }
        } catch (e) {
            console.error("General error in handleLeaveLive:", e)
        }
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
                <PermissionRecoveryModal open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen} />
            </div>
        )
    }

    if (activeSquad) {
        return (
            <>
                <SquadWorkspace squad={activeSquad} onBack={() => setActiveSquad(null)} onStartLive={() => handleJoinLive(activeSquad)} onInvite={() => { setInviteTarget(activeSquad); setIsInviteOpen(true) }} isStreamReady={isStreamReady} streamError={streamError} retryInit={retryInit} socket={socketRef.current} isPermissionModalOpen={isPermissionModalOpen} setIsPermissionModalOpen={setIsPermissionModalOpen} />
                {liveAlert && <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />}
            </>
        )
    }

    const filteredSquads = squads.filter(s => s.name?.toLowerCase().includes(squadSearch.toLowerCase()))

    return (
        <>
            {liveAlert && <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />}
            <div className="min-h-screen bg-slate-50 pb-10">
                <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Squad Hub <span className="text-sky-500">⚡</span></h1>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Your collaborative learning network</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:flex-none sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input value={squadSearch} onChange={e => setSquadSearch(e.target.value)} placeholder="Search squads..." className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm" />
                            </div>
                            <Button onClick={() => setIsCreateOpen(true)} className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shrink-0 shadow-md">
                                <Plus className="w-4 h-4 mr-1.5" /> New Squad
                            </Button>
                        </div>
                    </div>
                </div>
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                    {receivedInvites.length > 0 && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-6 text-white shadow-xl">
                            <h2 className="font-black text-base uppercase tracking-tight flex items-center gap-2 mb-4"><Bell className="w-5 h-5" /> {receivedInvites.length} Pending Invites</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {receivedInvites.map(invite => <InviteCard key={invite._id} invite={invite} onAccept={() => handleRespond(invite._id, "accepted")} onDecline={() => handleRespond(invite._id, "declined")} />)}
                            </div>
                        </div>
                    )}
                    <div>
                        <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">My Squads ({filteredSquads.length})</h2>
                        {loading ? <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">{[1, 2, 3].map(i => <div key={i} className="h-52 bg-white rounded-3xl border animate-pulse" />)}</div> :
                            filteredSquads.length === 0 ? <div className="flex flex-col items-center justify-center py-24 gap-4"><div className="text-3xl">🧬</div><p className="font-black text-slate-700 text-lg">No Squads Yet</p><Button onClick={() => setIsCreateOpen(true)} className="bg-sky-600 text-white">Create Squad</Button></div> :
                                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">{filteredSquads.map(s => <SquadCard key={s._id} squad={s} currentUserId={currentUserId} onOpen={setActiveSquad} onInvite={s => { setInviteTarget(s); setIsInviteOpen(true) }} />)}</div>}
                    </div>
                </div>
            </div>
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8"><DialogHeader><DialogTitle>Create a Squad</DialogTitle></DialogHeader>
                    <div className="space-y-4 py-4"><div className="flex gap-2">{AVATARS.map(a => <button key={a} onClick={() => setNewSquad(p => ({ ...p, avatar: a }))} className={cn("w-10 h-10 rounded-xl border-2", newSquad.avatar === a ? "border-sky-500 bg-sky-50" : "border-slate-100")}>{a}</button>)}</div>
                        <Input value={newSquad.name} onChange={e => setNewSquad(p => ({ ...p, name: e.target.value }))} placeholder="Squad name..." /><Input value={newSquad.topic} onChange={e => setNewSquad(p => ({ ...p, topic: e.target.value }))} placeholder="Topic..." /></div>
                    <DialogFooter><Button onClick={handleCreateSquad} disabled={!newSquad.name.trim() || creating}>{creating ? <Loader2 className="w-4 h-4 animate-spin" /> : "Create"}</Button></DialogFooter></DialogContent>
            </Dialog>
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="max-w-md rounded-3xl p-8"><DialogHeader><DialogTitle>Invite to {inviteTarget?.name}</DialogTitle></DialogHeader>
                    <div className="py-2 space-y-3"><Input value={inviteSearch} onChange={e => setInviteSearch(e.target.value)} placeholder="Search..." /><div className="space-y-2 max-h-72 overflow-y-auto">
                        {allStudents.filter(s => (s._id || s.id) !== currentUserId && !inviteTarget?.members?.some((m: any) => (m._id || m)?.toString() === (s._id || s.id)?.toString()) && (s.fullName || "").toLowerCase().includes(inviteSearch.toLowerCase())).map(student => (
                            <div key={student._id || student.id} className="flex items-center justify-between p-3 rounded-2xl bg-slate-50 border"><span>{student.fullName}</span><Button size="sm" onClick={() => handleSendInvite(student)}>{invitingSids.has(student._id || student.id) ? "..." : "Invite"}</Button></div>
                        ))}</div></div>
                    <DialogFooter><Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl">Done</Button></DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

export default function ClassSquad() {
    return (
        <Suspense fallback={
            <div className="flex flex-col h-screen items-center justify-center bg-slate-50">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                <p className="mt-4 text-[10px] font-black uppercase tracking-widest text-slate-400">Loading Squad Hub...</p>
            </div>
        }>
            <ClassSquadContent />
        </Suspense>
    )
}

// ─────────── Squad Workspace ───────────

const TABS = [
    { id: "chat", label: "Chat", Icon: MessageSquare },
    { id: "forum", label: "Forum", Icon: BookOpen },
    { id: "students", label: "Students", Icon: Users },
    { id: "whiteboard", label: "Board", Icon: PenTool },
    { id: "qa", label: "Q&A", Icon: HelpCircle },
]

function SquadWorkspace({ squad, onBack, onStartLive, onInvite, isStreamReady, streamError, retryInit, socket, isPermissionModalOpen, setIsPermissionModalOpen }: {
    squad: any;
    onBack: () => void;
    onStartLive: () => void;
    onInvite: () => void;
    isStreamReady: boolean;
    streamError: string | null;
    retryInit: () => void;
    socket: any;
    isPermissionModalOpen: boolean;
    setIsPermissionModalOpen: (open: boolean) => void;
}) {
    const [activeTab, setActiveTab] = useState("chat")

    return (
        <div className="flex flex-col h-[calc(100vh-4rem)] bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 px-4 sm:px-6 py-3 border-b border-slate-100 bg-white shrink-0 shadow-sm">
                <Button
                    variant="ghost"
                    size="icon"
                    onClick={onBack}
                    className="rounded-xl h-9 w-9 text-slate-500 hover:text-slate-900 hover:bg-slate-100"
                >
                    <ArrowLeft className="w-4 h-4" />
                </Button>
                <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-base shadow-md shrink-0">
                    {squad.avatar || "🧬"}
                </div>
                <div className="flex-1 min-w-0">
                    <h2 className="font-black text-slate-900 text-sm leading-tight truncate">{squad.name}</h2>
                    <p className="text-[10px] text-slate-400 font-semibold">{squad.members?.length || 0} members</p>
                </div>
                <div className="flex gap-2 shrink-0">
                    <Button
                        size="sm"
                        variant="outline"
                        onClick={onInvite}
                        className="h-9 px-3 rounded-xl border-slate-200 text-xs font-bold hidden sm:flex items-center gap-1.5"
                    >
                        <UserPlus className="w-3.5 h-3.5 text-indigo-500" /> Invite
                    </Button>
                    {streamError ? (
                        <Button
                            size="sm"
                            onClick={retryInit}
                            className="h-10 px-4 rounded-2xl bg-amber-500 hover:bg-amber-600 text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-lg"
                        >
                            <Radio className="w-4 h-4" />
                            <span className="hidden sm:inline">Retry Stream</span>
                        </Button>
                    ) : (
                        <Button
                            size="sm"
                            onClick={onStartLive}
                            disabled={!isStreamReady}
                            className={cn(
                                "h-10 px-5 rounded-2xl text-white text-xs font-black uppercase tracking-widest flex items-center gap-2 shadow-xl transition-all active:scale-95 group overflow-hidden relative",
                                isStreamReady
                                    ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/30 ring-2 ring-rose-500/20"
                                    : "bg-slate-300 cursor-wait"
                            )}
                        >
                            <div className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
                            <div className="relative flex items-center gap-2">
                                {isStreamReady ? (
                                    <>
                                        <div className={cn("w-2 h-2 bg-white rounded-full shadow-[0_0_8px_rgba(255,255,255,0.8)]", squad.isLive ? "bg-emerald-400 animate-ping" : "animate-pulse")} />
                                        <Video className="w-4 h-4" />
                                        <span className="hidden sm:inline">
                                            {squad.isLive ? "Join Live Class" : "Initialize Live"}
                                        </span>
                                    </>
                                ) : (
                                    <>
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                        <span className="hidden sm:inline">Connecting...</span>
                                    </>
                                )}
                            </div>
                        </Button>
                    )}
                </div>
            </div>

            {/* Tab Bar */}
            <div className="flex gap-0 border-b border-slate-100 bg-white px-2 shrink-0">
                {TABS.map(({ id, label, Icon }) => (
                    <button
                        key={id}
                        onClick={() => setActiveTab(id)}
                        className={cn(
                            "flex items-center gap-1.5 px-3 py-3 text-xs font-black uppercase tracking-wider border-b-2 transition-all",
                            activeTab === id
                                ? "border-sky-500 text-sky-600"
                                : "border-transparent text-slate-400 hover:text-slate-700 hover:border-slate-200"
                        )}
                    >
                        <Icon className="w-3.5 h-3.5 shrink-0" />
                        <span className="hidden sm:inline">{label}</span>
                    </button>
                ))}
            </div>

            {/* Tab Content */}
            <div className="flex-1 min-h-0 overflow-hidden">
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
            <PermissionRecoveryModal open={isPermissionModalOpen} onOpenChange={setIsPermissionModalOpen} />
        </div>
    )
}
