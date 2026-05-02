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
            <div className="h-full w-full flex flex-col bg-[#0f172a] text-white">
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 lg:p-20 gap-16 overflow-y-auto">
                    <div className="w-full max-w-2xl aspect-video rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                        <ParticipantView
                            participant={localParticipant || { user_id: currentUser?._id || 'local', isLocalParticipant: true, publishedTracks: [], roles: [], tags: [] } as any}
                            className="w-full h-full object-cover"
                            mirror={true}
                        />
                        <div className="absolute inset-x-0 top-8 flex justify-center px-4">
                            {(!micEnabled && !camEnabled) && (
                                <div className="px-6 py-3 bg-rose-500/90 backdrop-blur-xl rounded-2xl border border-rose-400 text-white text-xs font-black uppercase tracking-widest flex items-center gap-3 shadow-2xl animate-pulse">
                                    <VideoOff className="w-5 h-5" /> Permissions Required: Hardware Blocked
                                </div>
                            )}
                        </div>
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
                            <Button variant="ghost" size="icon" onClick={toggleMic} className={cn("w-14 h-14 rounded-full border-2", micEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </Button>
                            <Button variant="ghost" size="icon" onClick={toggleCam} className={cn("w-14 h-14 rounded-full border-2", camEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                                {camEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </Button>
                        </div>
                    </div>
                    <div className="flex flex-col items-center md:items-start max-w-sm text-center md:text-left gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-black text-white">Ready to join?</h1>
                            <p className="text-slate-400 font-medium">Verify your audio and video settings before the class begins.</p>
                        </div>
                        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700 w-full">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold">{currentUser?.fullName?.[0] || "U"}</div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{currentUser?.fullName}</span>
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest leading-none mt-1">Classroom: {squadName}</span>
                            </div>
                        </div>
                        <Button onClick={handleJoin} disabled={callingState === CallingState.JOINING} className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 transition-all active:scale-95">
                            {callingState === CallingState.JOINING ? <><Loader2 className="w-6 h-6 mr-3 animate-spin" /> JOINING...</> : "Join Now"}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <StreamTheme className="h-full w-full flex flex-col bg-[#0f172a] selection:bg-indigo-500/30">
            {/* Header Area */}
            <div className="absolute top-6 left-6 z-30 flex items-center gap-4 pointer-events-none">
                <div className="px-5 py-2.5 bg-black/40 backdrop-blur-2xl rounded-2xl border border-white/5 flex items-center gap-3 shadow-2xl pointer-events-auto">
                    <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black text-white uppercase tracking-[0.2em]">{squadName} • Live</span>
                </div>
            </div>

            {/* Main Stage & Gallery */}
            <div className="flex-1 flex gap-4 p-4 min-h-0 overflow-hidden relative">
                {/* 1. Theater Main Area (Left) */}
                <div className="flex-[4] relative rounded-[2.5rem] overflow-hidden bg-black border border-white/5 flex items-center justify-center shadow-3xl group/theater">
                    {screenShareEnabled ? (
                        <div className="w-full h-full p-2">
                            <ParticipantView
                                participant={localParticipant && localParticipant.screenShareStream ? localParticipant : (participants.find(p => p.screenShareStream) || { user_id: 'screen' } as any)}
                                className="w-full h-full object-contain"
                                trackType="screenShareTrack"
                            />
                        </div>
                    ) : (
                        <SpeakerLayout />
                    )}

                    {/* Reaction Floating Overlays */}
                    <div className="absolute inset-x-0 bottom-24 flex justify-center pointer-events-none z-50">
                        <div className="relative w-full max-w-xl h-64">
                            {activeReactions.map(r => (
                                <div key={r.id} className="absolute bottom-0 left-1/2 -translate-x-1/2 text-5xl animate-bounce-up select-none">
                                    {r.type}
                                </div>
                            ))}
                        </div>
                    </div>

                    {isRecording && (
                        <div className="absolute top-6 right-6 px-4 py-2 bg-rose-500/90 backdrop-blur-xl rounded-xl text-[9px] font-black text-white uppercase tracking-widest flex items-center gap-2 border border-rose-400/20 animate-pulse">
                            <div className="w-2 h-2 rounded-full bg-white animate-ping" /> REC
                        </div>
                    )}
                </div>

                {/* 2. Side Gallery (Right) */}
                <div className="flex-1 hidden md:flex flex-col gap-3 min-w-[280px] max-w-[320px] h-full">
                    <div className="flex-1 overflow-y-auto pr-2 space-y-3 scrollbar-premium">
                        {participants.map(p => (
                            <div key={p.sessionId} className={cn(
                                "relative aspect-video rounded-2xl overflow-hidden border-2 bg-slate-900 shadow-xl transition-all",
                                p.isLocalParticipant ? "border-indigo-500/50" : "border-slate-800 hover:border-white/20"
                            )}>
                                <ParticipantView participant={p} className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 left-2 px-2 py-1 bg-black/50 backdrop-blur-md rounded-lg text-[8px] font-black text-white uppercase tracking-widest flex items-center gap-2">
                                    {p.isLocalParticipant && <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />}
                                    {p.name || p.userId || "Participant"}
                                </div>
                            </div>
                        ))}
                        <Button onClick={() => setIsInviteOpen(true)} className="w-full h-20 rounded-2xl bg-white/5 border border-white/5 hover:bg-white/10 text-white font-black text-[10px] uppercase tracking-widest transition-all gap-3">
                            <UserPlus className="w-4 h-4 text-sky-400" /> Invite Partner
                        </Button>
                    </div>
                </div>
            </div>

            {/* Bottom Floating Control Bar */}
            <div className="shrink-0 pb-8 flex justify-center px-4">
                <div className="px-8 py-4 bg-slate-900/40 backdrop-blur-3xl rounded-[2.5rem] border border-white/5 flex items-center gap-8 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.5)]">
                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleMic} className={cn("w-12 h-12 rounded-2xl border shadow-xl transition-all active:scale-90", micEnabled ? "bg-slate-800 border-white/5 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                            {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={toggleCam} className={cn("w-12 h-12 rounded-2xl border shadow-xl transition-all active:scale-90", camEnabled ? "bg-slate-800 border-white/5 text-white" : "bg-rose-500 border-rose-400 text-white")}>
                            {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                        </Button>
                        <Button variant="ghost" size="icon" onClick={() => call.screenShare.toggle()} className={cn("w-12 h-12 rounded-2xl border shadow-xl transition-all active:scale-90", screenShareEnabled ? "bg-indigo-500 border-indigo-400 text-white" : "bg-slate-800 border-white/5 text-white")}>
                            <Monitor className="w-5 h-5" />
                        </Button>
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl">
                        {[{ e: '❤️', t: 'heart' }, { e: '👍', t: 'like' }, { e: '🎉', t: 'party' }, { e: '✋', t: 'raise-hand' }].map(r => (
                            <button key={r.t} onClick={() => handleReaction(r.e)} className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-xl active:scale-125">{r.e}</button>
                        ))}
                    </div>

                    <div className="w-[1px] h-8 bg-white/10" />

                    <div className="flex items-center gap-4">
                        <Button variant="ghost" size="icon" onClick={toggleRecording} className={cn("w-12 h-12 rounded-2xl border shadow-xl transition-all active:scale-90", isRecording ? "bg-rose-500 border-rose-400 text-white animate-pulse" : "bg-slate-800 border-white/5 text-slate-500 hover:text-white")}>
                            <Radio className="w-5 h-5" />
                        </Button>
                        <Button variant="destructive" onClick={onLeave} className="w-14 h-14 rounded-2xl shadow-rose-900/40 shadow-2xl transition-all hover:rotate-90 active:scale-90"><X className="w-7 h-7" /></Button>
                    </div>
                </div>
            </div>


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
