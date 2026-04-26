"use client"

import { useState, useEffect, useRef } from "react"
import { groupApi, inviteApi, userApi } from "@/lib/api"
import { X, Video, UserPlus, Search, Loader2, Mic, MicOff, VideoOff, Monitor, Radio, Plus, Users, Check, Crown, MessageSquare, BookOpen, PenTool, HelpCircle, Bell, ArrowLeft, Clock, Play, PhoneCall } from 'lucide-react'
import { initializeSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/components/ui/dialog"
import { toast } from "@/hooks/use-toast"
import { useStream } from "@/components/providers/StreamProvider"
import { GroupChatTab } from "@/components/dashboard/squad/GroupChatTab"
import { GroupWhiteboardTab } from "@/components/dashboard/squad/GroupWhiteboardTab"
import { GroupForumTab } from "@/components/dashboard/squad/GroupForumTab"
import { GroupQandATab } from "@/components/dashboard/squad/GroupQandATab"
import { LiveClassroom } from "@/components/dashboard/stream/LiveClassroom"
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

    return (
        <div
            className="group relative bg-white border border-slate-100 rounded-3xl p-5 hover:shadow-xl hover:shadow-slate-200/60 hover:-translate-y-1 transition-all duration-300 cursor-pointer flex flex-col gap-4 shadow-sm"
            onClick={() => onOpen(squad)}
        >
            {/* Top row */}
            <div className="flex items-start justify-between">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-xl shadow-lg">
                    {squad.avatar || "🧬"}
                </div>
                {isOwner && (
                    <span className="flex items-center gap-1 text-[9px] font-black uppercase tracking-widest bg-amber-50 text-amber-600 border border-amber-100 px-2 py-1 rounded-full">
                        <Crown className="w-2.5 h-2.5" /> Owner
                    </span>
                )}
            </div>
            {/* Info */}
            <div className="flex-1">
                <h3 className="font-black text-slate-900 text-base leading-tight">{squad.name}</h3>
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
                        className="h-8 px-3 rounded-xl text-[10px] font-black uppercase text-indigo-600 hover:bg-indigo-50"
                    >
                        <UserPlus className="w-3 h-3 mr-1" /> Invite
                    </Button>
                    <Button
                        size="sm"
                        onClick={e => { e.stopPropagation(); onOpen(squad) }}
                        className="h-8 px-3 rounded-xl text-[10px] font-black uppercase bg-slate-900 text-white hover:bg-slate-700"
                    >
                        Open
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
        <div className="fixed bottom-8 right-8 z-[100] w-full max-w-[340px] bg-white/90 backdrop-blur-3xl p-6 rounded-[2.5rem] border border-sky-100 shadow-[0_20px_50px_rgba(14,165,233,0.15)] animate-in slide-in-from-right-10 duration-500 ring-1 ring-black/5">
            <div className="flex items-start gap-4">
                <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-white shadow-lg relative overflow-hidden shrink-0">
                    <Video className="w-6 h-6 relative z-10" />
                    <div className="absolute inset-0 bg-white/20 animate-pulse" />
                </div>
                <div className="flex-1 min-w-0 pr-2">
                    <h4 className="text-[10px] font-black text-rose-500 uppercase tracking-[0.2em] mb-1">Transmission Alert</h4>
                    <p className="text-[13px] text-slate-800 font-bold leading-snug">
                        <span className="text-sky-600">{alert.hostName}</span> is live in <span className="text-sky-600">{alert.squadName}</span>
                    </p>
                    <p className="text-[10px] text-slate-400 font-medium mt-1 uppercase tracking-tight">Active collaboration in progress</p>
                </div>
                <button onClick={onDismiss} className="w-8 h-8 rounded-full bg-slate-50 text-slate-400 hover:text-rose-500 hover:bg-rose-50 flex items-center justify-center transition-all shrink-0">
                    <X className="w-4 h-4" />
                </button>
            </div>
            <div className="flex gap-2 mt-5">
                <Button
                    onClick={onJoin}
                    className="flex-1 h-12 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[11px] uppercase tracking-widest shadow-lg shadow-sky-200 transition-all active:scale-95"
                >
                    <Play className="w-4 h-4 mr-2" /> Join Session
                </Button>
            </div>
        </div>
    )
}

// ─────────── Main Page ───────────

export default function ClassSquad() {
    const [squads, setSquads] = useState<any[]>([])
    const [allStudents, setAllStudents] = useState<any[]>([])
    const [receivedInvites, setReceivedInvites] = useState<any[]>([])
    const [sentInvites, setSentInvites] = useState<any[]>([])
    const [pendingInviteIds, setPendingInviteIds] = useState<Set<string>>(new Set())
    const [loading, setLoading] = useState(true)

    // Pending invite button states per-student
    const [invitingSids, setInvitingSids] = useState<Set<string>>(new Set())

    // Active workspace
    const [activeSquad, setActiveSquad] = useState<any | null>(null)
    const [activeCall, setActiveCall] = useState<any | null>(null)
    const [liveAlert, setLiveAlert] = useState<{ callId: string; squadName: string; hostName: string; squadId: string } | null>(null)

    // Dialogs
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [isInviteOpen, setIsInviteOpen] = useState(false)
    const [inviteTarget, setInviteTarget] = useState<any | null>(null)
    const [inviteSearch, setInviteSearch] = useState("")
    const [newSquad, setNewSquad] = useState({ name: "", topic: "", avatar: "🧬" })
    const [squadSearch, setSquadSearch] = useState("")
    const [creating, setCreating] = useState(false)

    const socketRef = useRef<any>(null)
    const { videoClient, isReady: isStreamReady } = useStream()
    const currentUser = getCurrentUser()
    const currentUserId = (currentUser?._id || currentUser?.id || "") as string

    // ─────────── Data Fetching ───────────

    const fetchAll = async () => {
        // Fetch squads (response is array or { data: [] })
        try {
            const squadRes = await groupApi.getMyGroups()
            const squadsArr = Array.isArray(squadRes) ? squadRes : (squadRes?.data || [])
            setSquads(squadsArr)
        } catch (e) {
            console.warn("[Squad] Failed to fetch squads:", e)
        }

        // Fetch students
        try {
            const studentRes = await userApi.getAllStudents()
            const studentsArr = Array.isArray(studentRes) ? studentRes : (studentRes?.data || [])
            setAllStudents(studentsArr)
        } catch (e) {
            console.warn("[Squad] Failed to fetch students:", e)
        }

        // Fetch invites
        try {
            const inviteRes = await inviteApi.getMine()
            const all = Array.isArray(inviteRes) ? inviteRes : (inviteRes?.data || [])
            const received = all.filter((inv: any) => {
                const inviteeId = (inv.invitee?._id || inv.invitee)?.toString()
                return inviteeId === currentUserId && inv.status === "pending"
            })
            const sent = all.filter((inv: any) => {
                const inviterId = (inv.inviter?._id || inv.inviter)?.toString()
                return inviterId === currentUserId
            })
            setReceivedInvites(received)
            setSentInvites(sent)
            setPendingInviteIds(new Set(
                all.filter((inv: any) => {
                    const inviterId = (inv.inviter?._id || inv.inviter)?.toString()
                    return inviterId === currentUserId && inv.status === "pending"
                }).map((inv: any) => (inv.invitee?._id || inv.invitee)?.toString())
            ))
        } catch (e) {
            console.warn("[Squad] Failed to fetch invites:", e)
        }

        setLoading(false)
    }


    // ─────────── Socket Setup ───────────

    useEffect(() => {
        fetchAll()
        if (!currentUserId) return

        const socket = initializeSocket(currentUserId)
        socketRef.current = socket

        // New squad invite
        socket.on("new-invite", (data: any) => {
            setReceivedInvites(prev => [data, ...prev])
            toast({ title: "🏆 New Squad Invite!", description: `${data.inviter?.fullName || "Someone"} invited you to ${data.targetId?.name || "a squad"}` })
        })

        // Squad member started a live session → show join alert
        socket.on("squad-live-started", (data: any) => {
            const { callId, squadName, hostName, squadId } = data
            if (data.hostId === currentUserId) return
            setLiveAlert({ callId, squadName, hostName, squadId })
        })

        // Direct video call invite
        socket.on("direct-live-invited", (data: any) => {
            const { callId, hostName } = data
            setLiveAlert({ callId, squadName: "Direct Session", hostName, squadId: "direct" })
        })

        return () => {
            socket.off("new-invite")
            socket.off("squad-live-started")
            socket.off("direct-live-invited")
        }
    }, [currentUserId])

    // ─────────── Handlers ───────────

    const handleRespond = async (inviteId: string, status: "accepted" | "declined") => {
        try {
            await inviteApi.respond(inviteId, status)
            setReceivedInvites(prev => prev.filter(inv => inv._id !== inviteId))
            if (status === "accepted") {
                await fetchAll()
                toast({ title: "✅ Squad Joined!", description: "You can now chat and collaborate." })
            } else {
                toast({ title: "Invite declined." })
            }
        } catch (e) {
            toast({ title: "Error", variant: "destructive" })
        }
    }

    const handleCreateSquad = async () => {
        if (!newSquad.name.trim()) return
        setCreating(true)
        try {
            const squad = await groupApi.create({ name: newSquad.name, topic: newSquad.topic || "General", avatar: newSquad.avatar })
            setSquads(prev => [squad, ...prev])
            setIsCreateOpen(false)
            setNewSquad({ name: "", topic: "", avatar: "🧬" })
            toast({ title: "Squad Created!", description: `Welcome to ${squad.name}` })
        } catch (e: any) {
            toast({ title: "Failed", description: e.message, variant: "destructive" })
        } finally {
            setCreating(false)
        }
    }

    const handleSendInvite = async (student: any) => {
        if (!inviteTarget) return
        const sid = (student._id || student.id) as string
        setInvitingSids(prev => new Set([...prev, sid]))
        try {
            const res = await inviteApi.send({
                inviteeId: sid,
                targetType: "StudyGroup",
                targetId: inviteTarget._id
            })
            setPendingInviteIds(prev => new Set([...prev, sid]))
            if (!res.alreadyPending) {
                toast({ title: "Invite Sent!", description: `${student.fullName} was invited.` })
            } else {
                toast({ title: "Already Pending", description: "This invite is already sent." })
            }
        } catch (e: any) {
            toast({ title: "Failed", description: e.message, variant: "destructive" })
        } finally {
            setInvitingSids(prev => { const s = new Set(prev); s.delete(sid); return s })
        }
    }

    // ─────────── Video Call Handlers ───────────

    const handleJoinLive = async (squad: any, existingCallId?: string) => {
        if (!videoClient || !isStreamReady) {
            toast({ title: "Stream not ready", description: "Please wait a moment.", variant: "destructive" })
            return
        }
        try {
            const callId = existingCallId || `squad-${squad._id}`
            const call = videoClient.call("default", callId)
            await call.getOrCreate()
            await call.join({ create: true })

            // Notify all squad members via socket
            if (!existingCallId && socketRef.current) {
                // Set live status in backend
                await groupApi.toggleLive(squad._id, { isLive: true, sessionData: { callId } })

                // Only notify if we started (no existingCallId)
                socketRef.current.emit("squad-live-start", {
                    callId,
                    squadId: squad._id,
                    squadName: squad.name,
                    hostId: currentUserId,
                    hostName: currentUser?.fullName || "Someone",
                    memberIds: squad.members?.map((m: any) => m._id || m).filter((id: string) => id !== currentUserId) || [],
                })
            }

            setActiveCall(call)
            setActiveSquad(squad)
        } catch (e: any) {
            console.error("[Video Join Error]", e)
            if (e.name === "NotAllowedError" || e.message?.includes("Permission denied")) {
                toast({
                    title: "Camera/Mic Permission Denied",
                    description: "Please enable camera and microphone access in your browser settings to join the live session.",
                    variant: "destructive"
                })
            } else {
                toast({ title: "Video Error", description: e.message, variant: "destructive" })
            }
        }
    }

    const handleLeaveLive = async () => {
        if (!activeCall || !activeSquad) return
        const isHost = activeCall.state.createdBy?.id === currentUserId
        try {
            await activeCall.leave()
            if (isHost && socketRef.current) {
                // Reset live status in backend
                await groupApi.toggleLive(activeSquad._id, { isLive: false })
                // Notify members
                socketRef.current.emit("squad-live-stop", {
                    squadId: activeSquad._id,
                    memberIds: activeSquad.members?.map((m: any) => m._id || m).filter((id: string) => id !== currentUserId) || [],
                })
            }
        } catch (e) {
            console.error("Error leaving call", e)
        } finally {
            setActiveCall(null)
        }
    }


    const handleJoinFromAlert = async () => {
        if (!liveAlert) return
        const squad = squads.find(s => s._id === liveAlert.squadId) || { _id: liveAlert.squadId, name: liveAlert.squadName }
        await handleJoinLive(squad, liveAlert.callId)
        setLiveAlert(null)
    }

    // ─────────── Routing ───────────

    // Full-screen live classroom
    if (activeCall && activeSquad) {
        return (
            <div className="fixed inset-0 z-50 bg-slate-950">
                <LiveClassroom
                    call={activeCall}
                    squadName={activeSquad.name}
                    squadId={activeSquad._id}
                    socket={socketRef.current}
                    onLeave={handleLeaveLive}
                />
            </div>
        )
    }

    // Squad workspace
    if (activeSquad) {
        return (
            <>
                <SquadWorkspace
                    squad={activeSquad}
                    onBack={() => setActiveSquad(null)}
                    onStartLive={() => handleJoinLive(activeSquad)}
                    onInvite={() => { setInviteTarget(activeSquad); setIsInviteOpen(true) }}
                    isStreamReady={isStreamReady}
                    socket={socketRef.current}
                />
                {liveAlert && (
                    <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />
                )}
            </>
        )
    }

    const filteredSquads = squads.filter(s => s.name?.toLowerCase().includes(squadSearch.toLowerCase()))

    return (
        <>
            {/* Live alert overlay (even on overview) */}
            {liveAlert && (
                <LiveAlert alert={liveAlert} onJoin={handleJoinFromAlert} onDismiss={() => setLiveAlert(null)} />
            )}

            <div className="min-h-screen bg-slate-50 pb-10">
                {/* Header */}
                <div className="bg-white border-b border-slate-100 sticky top-0 z-30 px-4 sm:px-6 lg:px-8 py-4">
                    <div className="max-w-7xl mx-auto flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                        <div>
                            <h1 className="text-2xl font-black text-slate-900 tracking-tight">Squad Hub <span className="text-sky-500">⚡</span></h1>
                            <p className="text-xs text-slate-400 font-semibold mt-0.5">Your collaborative learning network</p>
                        </div>
                        <div className="flex gap-2">
                            <div className="relative flex-1 sm:flex-none sm:w-56">
                                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                <Input
                                    value={squadSearch}
                                    onChange={e => setSquadSearch(e.target.value)}
                                    placeholder="Search squads..."
                                    className="pl-9 h-10 rounded-xl bg-slate-50 border-slate-200 text-sm"
                                />
                            </div>
                            <Button
                                onClick={() => setIsCreateOpen(true)}
                                className="h-10 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold text-sm shrink-0 shadow-md shadow-sky-600/20"
                            >
                                <Plus className="w-4 h-4 mr-1.5" /> New Squad
                            </Button>
                        </div>
                    </div>
                </div>

                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-6 space-y-8">
                    {/* Incoming Invitations */}
                    {receivedInvites.length > 0 && (
                        <div className="bg-gradient-to-r from-amber-500 to-orange-500 rounded-3xl p-5 sm:p-6 text-white shadow-xl shadow-amber-500/20">
                            <div className="flex items-center gap-2 mb-4">
                                <Bell className="w-5 h-5 animate-bounce" />
                                <h2 className="font-black text-base uppercase tracking-tight">
                                    {receivedInvites.length} Pending Invite{receivedInvites.length > 1 ? "s" : ""}
                                </h2>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                                {receivedInvites.map(invite => (
                                    <InviteCard
                                        key={invite._id}
                                        invite={invite}
                                        onAccept={() => handleRespond(invite._id, "accepted")}
                                        onDecline={() => handleRespond(invite._id, "declined")}
                                    />
                                ))}
                            </div>
                        </div>
                    )}

                    {/* My Squads */}
                    <div>
                        <div className="flex items-center justify-between mb-4">
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest">
                                My Squads ({filteredSquads.length})
                            </h2>
                        </div>

                        {loading ? (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {[1, 2, 3].map(i => (
                                    <div key={i} className="h-52 bg-white rounded-3xl border border-slate-100 animate-pulse" />
                                ))}
                            </div>
                        ) : filteredSquads.length === 0 ? (
                            <div className="flex flex-col items-center justify-center py-24 gap-4">
                                <div className="w-16 h-16 rounded-3xl bg-slate-100 flex items-center justify-center text-3xl">🧬</div>
                                <div className="text-center">
                                    <p className="font-black text-slate-700 text-lg">No Squads Yet</p>
                                    <p className="text-slate-400 text-sm mt-1">Create your first squad or accept an invite to collaborate.</p>
                                </div>
                                <Button
                                    onClick={() => setIsCreateOpen(true)}
                                    className="h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                                >
                                    <Plus className="w-4 h-4 mr-2" /> Create Squad
                                </Button>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
                                {filteredSquads.map(squad => (
                                    <SquadCard
                                        key={squad._id}
                                        squad={squad}
                                        currentUserId={currentUserId}
                                        onOpen={s => setActiveSquad(s)}
                                        onInvite={s => { setInviteTarget(s); setIsInviteOpen(true) }}
                                    />
                                ))}
                            </div>
                        )}
                    </div>

                    {/* Sent Invites Tracker */}
                    {sentInvites.length > 0 && (
                        <div>
                            <h2 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-4">Sent Invitations</h2>
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-3">
                                {sentInvites.map(inv => {
                                    const name = inv.invitee?.fullName || "Member"
                                    return (
                                        <div key={inv._id} className="flex items-center gap-3 p-4 rounded-2xl bg-white border border-slate-100 shadow-sm">
                                            <Avatar name={name} color="indigo" size="sm" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-xs font-black text-slate-900 truncate">{name}</p>
                                                <p className="text-[10px] text-slate-400 truncate">{inv.targetId?.name || "Squad"}</p>
                                            </div>
                                            <span className={cn(
                                                "px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider shrink-0",
                                                inv.status === "pending" ? "bg-amber-100 text-amber-600" :
                                                    inv.status === "accepted" ? "bg-emerald-100 text-emerald-600" : "bg-rose-100 text-rose-600"
                                            )}>
                                                {inv.status === "pending" ? <Clock className="w-2.5 h-2.5 inline mr-0.5" /> : null}
                                                {inv.status}
                                            </span>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {/* Create Squad Dialog */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black">Create a Squad</DialogTitle>
                    </DialogHeader>
                    <div className="space-y-4 py-4">
                        <div className="flex gap-2 flex-wrap">
                            {AVATARS.map(a => (
                                <button
                                    key={a}
                                    onClick={() => setNewSquad(p => ({ ...p, avatar: a }))}
                                    className={cn(
                                        "w-10 h-10 text-xl rounded-xl border-2 transition-all",
                                        newSquad.avatar === a ? "border-sky-500 bg-sky-50 scale-110" : "border-slate-100 hover:border-slate-200"
                                    )}
                                >
                                    {a}
                                </button>
                            ))}
                        </div>
                        <Input
                            value={newSquad.name}
                            onChange={e => setNewSquad(p => ({ ...p, name: e.target.value }))}
                            placeholder="Squad name..."
                            className="h-12 rounded-xl text-sm"
                        />
                        <Input
                            value={newSquad.topic}
                            onChange={e => setNewSquad(p => ({ ...p, topic: e.target.value }))}
                            placeholder="Topic (Physics, Math, etc.)..."
                            className="h-12 rounded-xl text-sm"
                        />
                    </div>
                    <DialogFooter>
                        <Button variant="outline" onClick={() => setIsCreateOpen(false)} className="rounded-xl">Cancel</Button>
                        <Button
                            disabled={!newSquad.name.trim() || creating}
                            onClick={handleCreateSquad}
                            className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-bold shadow-md shadow-sky-600/20"
                        >
                            {creating ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : null}
                            Create Squad
                        </Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>

            {/* Invite Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={open => { setIsInviteOpen(open); if (!open) setInviteSearch("") }}>
                <DialogContent className="max-w-md rounded-3xl p-6 sm:p-8">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black flex items-center gap-2">
                            <UserPlus className="w-5 h-5 text-sky-500" />
                            Invite to {inviteTarget?.name}
                        </DialogTitle>
                    </DialogHeader>
                    <div className="py-2 space-y-3">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                            <Input
                                value={inviteSearch}
                                onChange={e => setInviteSearch(e.target.value)}
                                placeholder="Search by name..."
                                className="pl-9 h-11 rounded-xl text-sm"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-1">
                            {allStudents
                                .filter(s => (s._id || s.id) !== currentUserId)
                                .filter(s => {
                                    const isMember = inviteTarget?.members?.some((m: any) => (m._id || m)?.toString() === (s._id || s.id)?.toString())
                                    return !isMember
                                })
                                .filter(s => (s.fullName || `${s.firstName || ""} ${s.lastName || ""}`.trim() || "").toLowerCase().includes(inviteSearch.toLowerCase()))
                                .map(student => {
                                    const name = student.fullName || `${student.firstName || ""} ${student.lastName || ""}`.trim() || "Student"
                                    const sid = (student._id || student.id) as string
                                    const isPending = pendingInviteIds.has(sid)
                                    const isInviting = invitingSids.has(sid)

                                    return (
                                        <div key={sid} className="flex items-center gap-3 p-3 rounded-2xl bg-slate-50 border border-slate-100">
                                            <Avatar name={name} size="sm" color="sky" />
                                            <div className="flex-1 min-w-0">
                                                <p className="text-sm font-bold text-slate-900 truncate">{name}</p>
                                                <p className="text-[10px] text-slate-400">{student.grade ? `Grade ${student.grade}` : "Student"}</p>
                                            </div>
                                            {isPending ? (
                                                <span className="flex items-center gap-1 px-3 py-1.5 rounded-xl text-[10px] font-black uppercase bg-amber-50 text-amber-600 border border-amber-100">
                                                    <Clock className="w-3 h-3" /> Pending
                                                </span>
                                            ) : (
                                                <Button
                                                    size="sm"
                                                    disabled={isInviting}
                                                    onClick={() => handleSendInvite(student)}
                                                    className="h-8 px-3 rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-[10px] font-black uppercase"
                                                >
                                                    {isInviting ? <Loader2 className="w-3 h-3 animate-spin" /> : "Invite"}
                                                </Button>
                                            )}
                                        </div>
                                    )
                                })
                            }
                        </div>
                    </div>
                    <DialogFooter>
                        <Button variant="ghost" onClick={() => setIsInviteOpen(false)} className="rounded-xl">Done</Button>
                    </DialogFooter>
                </DialogContent>
            </Dialog>
        </>
    )
}

// ─────────── Squad Workspace ───────────

const TABS = [
    { id: "chat", label: "Chat", Icon: MessageSquare },
    { id: "forum", label: "Forum", Icon: BookOpen },
    { id: "whiteboard", label: "Board", Icon: PenTool },
    { id: "qa", label: "Q&A", Icon: HelpCircle },
]

function SquadWorkspace({ squad, onBack, onStartLive, onInvite, isStreamReady, socket }: {
    squad: any; onBack: () => void; onStartLive: () => void; onInvite: () => void; isStreamReady: boolean; socket: any
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
                    <Button
                        size="sm"
                        onClick={onStartLive}
                        disabled={!isStreamReady}
                        className={cn(
                            "h-9 px-3 rounded-xl text-white text-xs font-bold flex items-center gap-1.5 shadow-md",
                            isStreamReady ? "bg-rose-600 hover:bg-rose-700 shadow-rose-600/20" : "bg-slate-300"
                        )}
                    >
                        <Video className="w-3.5 h-3.5" />
                        <span className="hidden sm:inline">Start Live</span>
                    </Button>
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
                <div className={cn("h-full overflow-y-auto", activeTab !== "qa" && "hidden")}>
                    <GroupQandATab squadId={squad._id} />
                </div>
            </div>
        </div>
    )
}
