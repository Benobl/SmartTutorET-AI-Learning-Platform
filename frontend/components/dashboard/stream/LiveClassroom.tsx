"use client"

import React from 'react'
import {
    Call,
    CallControls,
    CallingState,
    CallParticipantsList,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
    ParticipantView,
} from '@stream-io/video-react-sdk'
import { ArrowLeft, Video, Users, Mic, MicOff, VideoOff, UserPlus, Search, X, Loader2, Monitor, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { userApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth-utils'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import { PermissionRecoveryModal } from './PermissionRecoveryModal'
import "@stream-io/video-react-sdk/dist/css/styles.css"

interface LiveClassroomProps {
    call: Call
    onLeave: () => void
    squadName: string
    squadId?: string
    socket?: any
}

// --- Consumer Component (Uses Hooks) ---
const LiveSessionContent = ({
    call,
    onLeave,
    squadName,
    squadId,
    socket
}: LiveClassroomProps) => {
    const [isInviteOpen, setIsInviteOpen] = React.useState(false)
    const [isPermissionOpen, setIsPermissionOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [students, setStudents] = React.useState<any[]>([])
    const [invitedIds, setInvitedIds] = React.useState<Set<string>>(new Set())

    const currentUser = getCurrentUser()
    const {
        useMicrophoneState,
        useCameraState,
        useScreenShareState,
        useParticipants,
        useLocalParticipant,
        useCallCallingState
    } = useCallStateHooks()

    const { isEnabled: micEnabled } = useMicrophoneState()
    const { isEnabled: camEnabled } = useCameraState()
    const { isEnabled: screenShareEnabled } = useScreenShareState()
    const isRecording = call.state.recording

    const localParticipant = useLocalParticipant() || call.state.localParticipant
    const participants = useParticipants()
    const callingState = useCallCallingState()

    // Find if someone is sharing their screen
    const screenSharingParticipant = participants.find(p => p.screenShareStream)
    const isAnyoneSharing = !!screenSharingParticipant

    const [activeReactions, setActiveReactions] = React.useState<{ id: number; type: string }[]>([])

    React.useEffect(() => {
        const unsubscribe = call.on('call.reaction_new', (event: any) => {
            const type = event.reaction?.type || '👍'
            setActiveReactions(prev => [...prev, { id: Date.now(), type }])
            setTimeout(() => {
                setActiveReactions(prev => prev.filter(r => r.id !== (prev[0]?.id)))
            }, 3000)
        })
        return () => unsubscribe()
    }, [call])

    const toggleMic = async () => {
        try {
            if (!call.microphone) return
            if (micEnabled) {
                await call.microphone.disable()
            } else {
                await call.microphone.enable()
                toast({ title: "Voice Open", description: "Your microphone is now active." })
            }
        } catch (e: any) {
            console.error("Mic toggle failed", e)
            if (e.name === "NotAllowedError") setIsPermissionOpen(true)
        }
    }

    const toggleCam = async () => {
        try {
            if (!call.camera) return
            if (camEnabled) {
                await call.camera.disable()
            } else {
                await call.camera.enable()
                toast({ title: "Video Open", description: "Your camera is now active." })
            }
        } catch (e: any) {
            console.error("Cam toggle failed", e)
            if (e.name === "NotAllowedError") setIsPermissionOpen(true)
        }
    }

    const handleReaction = async (type: string) => {
        try { await call.sendReaction({ type }) } catch (e) { }
    }

    const toggleRecording = async () => {
        try {
            if (isRecording) await call.stopRecording()
            else await call.startRecording()
        } catch (e: any) {
            toast({ title: "Recording Error", description: e.message, variant: "destructive" })
        }
    }

    const handleJoin = React.useCallback(async () => {
        try {
            if (callingState === CallingState.IDLE) {
                await call.join({ create: true });
                toast({ title: "Classroom Ready", description: "You are now live in the squad hub." });
                
                // Auto-enable hardware after successful join
                if (call.microphone) await call.microphone.enable().catch(() => {});
                if (call.camera) await call.camera.enable().catch(() => {});
            }
        } catch (err: any) { 
            toast({ title: "Join Failed", description: err.message, variant: "destructive" });
        }
    }, [call, callingState]);

    React.useEffect(() => {
        if (callingState === CallingState.IDLE) {
            handleJoin();
        }
    }, [handleJoin, callingState]);

    React.useEffect(() => {
        if (isInviteOpen) {
            userApi.getAllStudents().then(res => setStudents(res.data || []))
        }
    }, [isInviteOpen])

    const sendInvite = (student: any) => {
        if (!socket || !squadId) return
        const targetId = student._id || student.id
        socket.emit("squad-live-start", {
            callId: call.id,
            squadId: squadId,
            squadName: squadName,
            hostId: currentUser?._id || currentUser?.id,
            hostName: currentUser?.fullName || "Someone",
            memberIds: [targetId]
        })
        setInvitedIds(prev => new Set(prev).add(targetId))
        toast({ title: "Invite Sent!", description: `Notified ${student.fullName} about this session.` })
    }

    if (callingState === CallingState.IDLE || callingState === CallingState.JOINING) {
        return (
            <div className="h-full w-full flex flex-col bg-[#020617] text-white">
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 lg:p-20 gap-16 overflow-y-auto">
                    <div className="w-full max-w-2xl aspect-video rounded-[2.5rem] bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden group transition-all duration-500 hover:border-indigo-500/50">
                        <ParticipantView
                            participant={localParticipant || { user_id: currentUser?._id || 'local', isLocalParticipant: true, publishedTracks: [], roles: [], tags: [] } as any}
                            className="w-full h-full object-cover"
                            mirror={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-[#020617] via-transparent to-transparent opacity-60" />
                        <div className="absolute inset-x-0 top-8 flex justify-center px-4">
                            {(!micEnabled && !camEnabled) && (
                                <div className="px-6 py-3 bg-rose-500/90 backdrop-blur-2xl rounded-2xl border border-rose-400 text-[10px] font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-bounce">
                                    <VideoOff className="w-4 h-4" /> Hardware Blocked
                                </div>
                            )}
                        </div>
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-4">
                            <Button variant="ghost" size="icon" onClick={toggleMic} className={cn("w-14 h-14 rounded-2xl border-2 transition-all active:scale-90", micEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleCam} className={cn("w-14 h-14 rounded-2xl border-2 transition-all active:scale-90", camEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                                {camEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-start max-w-sm text-center md:text-left gap-8">
                        <div className="space-y-4">
                            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/10 border border-indigo-500/20 rounded-full text-[10px] font-black text-indigo-400 uppercase tracking-widest">
                                <Radio className="w-3 h-3" /> Waiting Room
                            </div>
                            <h1 className="text-4xl lg:text-5xl font-black text-white leading-tight">Ready to join <br/><span className="text-indigo-400">{squadName}</span>?</h1>
                            <p className="text-slate-400 font-medium text-sm">Everything looks good. Your partners are waiting for you in the classroom.</p>
                        </div>
                        <Button onClick={handleJoin} disabled={callingState === CallingState.JOINING} className="w-full h-16 rounded-3xl bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/30 transition-all active:scale-95">
                            {callingState === CallingState.JOINING ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> ENTERING...</> : "Join Now"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <StreamTheme className="h-full w-full flex flex-col bg-[#020617] selection:bg-indigo-500/30 overflow-hidden">
            {/* Header Area */}
            <div className="shrink-0 h-16 flex items-center justify-between px-6 border-b border-white/5 bg-[#020617]/50 backdrop-blur-xl z-30">
                <div className="flex items-center gap-4">
                    <div className="w-8 h-8 rounded-xl bg-indigo-600 flex items-center justify-center font-black text-xs shadow-lg shadow-indigo-500/20">
                        {squadName[0]}
                    </div>
                    <div>
                        <h2 className="text-xs font-black text-white uppercase tracking-widest">{squadName}</h2>
                        <div className="flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                            <span className="text-[9px] font-black text-slate-500 uppercase tracking-[0.2em]">Live Session</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="ghost" onClick={() => setIsInviteOpen(true)} className="h-9 px-4 rounded-xl bg-white/5 border border-white/5 hover:bg-white/10 text-[9px] font-black text-white uppercase tracking-widest gap-2">
                        <UserPlus className="w-3.5 h-3.5 text-sky-400" /> Invite
                    </Button>
                    {isRecording && (
                        <div className="px-3 py-1.5 bg-rose-500/10 border border-rose-500/20 rounded-lg text-[8px] font-black text-rose-500 uppercase tracking-widest flex items-center gap-2">
                            <div className="w-1.5 h-1.5 rounded-full bg-rose-500 animate-ping" /> REC
                        </div>
                    )}
                </div>
            </div>

            {/* Main Stage & Gallery Layout */}
            <div className="flex-1 flex flex-col md:flex-row min-h-0 overflow-hidden">
                
                {/* 1. Theater Main Area (Center/Left) */}
                <div className="flex-[3] lg:flex-[4] relative bg-black/40 flex flex-col items-center justify-center p-4 lg:p-6 min-h-0">
                    <div className="w-full h-full relative rounded-[2rem] lg:rounded-[3rem] overflow-hidden bg-slate-950 border border-white/5 shadow-3xl group/theater">
                        {isAnyoneSharing ? (
                            <div className="w-full h-full bg-black">
                                <ParticipantView
                                    participant={screenSharingParticipant!}
                                    className="w-full h-full object-contain"
                                    trackType="screenShareTrack"
                                />
                                <div className="absolute top-4 left-4 px-3 py-1.5 bg-indigo-600/90 backdrop-blur-xl rounded-lg text-[9px] font-black text-white uppercase tracking-widest border border-white/10 flex items-center gap-2">
                                    <Monitor className="w-3 h-3" /> {screenSharingParticipant?.name}'s Screen
                                </div>
                            </div>
                        ) : (
                            <div className="w-full h-full">
                                <SpeakerLayout />
                            </div>
                        )}

                        {/* Reaction Floating Overlays */}
                        <div className="absolute inset-x-0 bottom-12 flex justify-center pointer-events-none z-50">
                            <div className="relative w-full max-w-xl h-64">
                                {activeReactions.map(r => (
                                    <div key={r.id} className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl animate-bounce-up select-none">
                                        {r.type}
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>
                </div>

                {/* 2. Side Gallery (Right) - Hide on very small mobile if screen sharing */}
                <div className={cn(
                    "flex-1 min-w-[280px] max-w-full md:max-w-[340px] border-l border-white/5 bg-[#020617]/30 backdrop-blur-md flex flex-col min-h-0",
                    isAnyoneSharing && "hidden lg:flex"
                )}>
                    <div className="p-4 border-b border-white/5">
                        <h3 className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] flex items-center gap-2">
                            <Users className="w-3.5 h-3.5" /> Participants ({participants.length})
                        </h3>
                    </div>
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 scrollbar-premium">
                        {participants.map(p => (
                            <div key={p.sessionId} className={cn(
                                "relative aspect-video rounded-2xl overflow-hidden border-2 bg-slate-900 shadow-xl transition-all group",
                                p.isLocalParticipant ? "border-indigo-500/40" : "border-white/5 hover:border-white/20"
                            )}>
                                <ParticipantView participant={p} className="w-full h-full object-cover" />
                                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2 border border-white/5">
                                    {p.isLocalParticipant && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                    {p.name || p.userId || "Participant"}
                                </div>
                                {!p.isMicrophoneEnabled && (
                                    <div className="absolute top-2 right-2 p-1.5 bg-rose-500/80 backdrop-blur-md rounded-lg border border-rose-400/20">
                                        <MicOff className="w-3 h-3 text-white" />
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* 3. Bottom Premium Control Dock */}
            <div className="shrink-0 h-24 flex items-center justify-center px-4 z-40 bg-gradient-to-t from-[#020617] to-transparent">
                <div className="px-6 py-3 bg-[#0f172a]/80 backdrop-blur-3xl rounded-[2.5rem] border border-white/10 flex items-center gap-6 shadow-3xl">
                    
                    {/* Media Group */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={toggleMic} className={cn("w-12 h-12 rounded-2xl border-2 transition-all active:scale-90", micEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20")}>
                            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleCam} className={cn("w-12 h-12 rounded-2xl border-2 transition-all active:scale-90", camEnabled ? "bg-white/5 border-white/10 text-white hover:bg-white/10" : "bg-rose-500 border-rose-400 text-white shadow-lg shadow-rose-500/20")}>
                            {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    {/* Interaction Group */}
                    <div className="flex items-center gap-3">
                        <Button variant="ghost" size="icon" onClick={() => call.screenShare.toggle()} className={cn("w-12 h-12 rounded-2xl border-2 transition-all active:scale-90", screenShareEnabled ? "bg-indigo-500 border-indigo-400 text-white shadow-lg shadow-indigo-500/20" : "bg-white/5 border-white/10 text-slate-400 hover:text-white hover:bg-white/10")}>
                            <Monitor className="w-5 h-5" />
                        </Button>
                        <div className="flex items-center gap-1 p-1 bg-white/5 rounded-2xl border border-white/5">
                            {[{ e: '❤️', t: 'heart' }, { e: '👍', t: 'like' }, { e: '🎉', t: 'party' }].map(r => (
                                <button key={r.t} onClick={() => handleReaction(r.e)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-xl active:scale-125">{r.e}</button>
                            ))}
                        </div>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    {/* System Group */}
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleRecording} className={cn("w-12 h-12 rounded-2xl border-2 transition-all active:scale-90", isRecording ? "bg-rose-500/20 border-rose-500/50 text-rose-500" : "bg-white/5 border-white/10 text-slate-500 hover:text-white hover:bg-white/10")}>
                            <Radio className="w-5 h-5" />
                        </Button>
                        <Button variant="destructive" onClick={onLeave} className="w-14 h-14 rounded-2xl bg-rose-600 hover:bg-rose-700 shadow-2xl shadow-rose-900/40 transition-all hover:rotate-90 active:scale-90 flex items-center justify-center">
                            <X className="w-7 h-7" />
                        </Button>
                    </div>
                </div>
            </div>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="max-w-md bg-[#020617] border-white/10 text-white rounded-[2rem] p-8">
                    <DialogHeader><DialogTitle className="text-xl font-black uppercase tracking-tight">Invite Partners</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <div className="relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" />
                            <Input placeholder="Search partners..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl pl-12 text-sm" />
                        </div>
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-premium">
                            {students.filter(s => 
                                (s._id || s.id) !== (currentUser?._id || currentUser?.id) && 
                                !invitedIds.has(s._id || s.id) &&
                                (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(student => (
                                <div key={student._id || student.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5 hover:border-white/20 transition-all">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center font-black text-xs">{student.fullName?.[0]}</div>
                                        <span className="text-sm font-bold">{student.fullName}</span>
                                    </div>
                                    <Button size="sm" onClick={() => sendInvite(student)} className="bg-indigo-600 hover:bg-indigo-700 rounded-xl px-6 font-black uppercase text-[10px] tracking-widest h-9">Invite</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <PermissionRecoveryModal open={isPermissionOpen} onOpenChange={setIsPermissionOpen} />
        </StreamTheme>
    )
}


            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="max-w-md bg-slate-900 border-white/10 text-white rounded-[2rem] p-8">
                    <DialogHeader><DialogTitle className="text-xl font-black">Invite Partners</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                        <Input placeholder="Search partners..." value={searchQuery} onChange={e => setSearchQuery(e.target.value)} className="bg-white/5 border-white/10 h-12 rounded-xl" />
                        <div className="space-y-2 max-h-72 overflow-y-auto pr-2 scrollbar-premium">
                            {students.filter(s => 
                                (s._id || s.id) !== (currentUser?._id || currentUser?.id) && 
                                !invitedIds.has(s._id || s.id) &&
                                (s.fullName || "").toLowerCase().includes(searchQuery.toLowerCase())
                            ).map(student => (
                                <div key={student._id || student.id} className="flex items-center justify-between p-4 rounded-2xl bg-white/5 border border-white/5">
                                    <span className="text-sm font-bold">{student.fullName}</span>
                                    <Button size="sm" onClick={() => sendInvite(student)} className="bg-sky-600 hover:bg-sky-700 rounded-xl px-4">Invite</Button>
                                </div>
                            ))}
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <PermissionRecoveryModal open={isPermissionOpen} onOpenChange={setIsPermissionOpen} />
        </StreamTheme>
    )
}

// --- Parent Wrapper (Provides Context) ---
export const LiveClassroom = (props: LiveClassroomProps) => {
    return (
        <StreamCall call={props.call}>
            <LiveSessionContent {...props} />
        </StreamCall>
    )
}
