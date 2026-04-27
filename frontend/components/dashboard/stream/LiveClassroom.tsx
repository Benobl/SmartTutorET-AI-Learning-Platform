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
    const isRecording = call.state.recording // Using direct observable for stability

    const localParticipant = useLocalParticipant() || call.state.localParticipant // Direct state fallback
    const participants = useParticipants()
    const callingState = useCallCallingState()

    // Robust detection: Bridge the gap between camera active and participant list sync
    const targetParticipant = localParticipant || participants[0]
    const isSolo = participants.length <= 1
    const isJoined = callingState === CallingState.JOINED
    const hasMedia = camEnabled || micEnabled
    const isCamActive = camEnabled || !!targetParticipant?.videoStream

    React.useEffect(() => {
        // Cleanup call on unmount to prevent WebRTC stale connections
        return () => {
            if (call && call.state.callingState !== CallingState.LEFT) {
                call.leave().catch(err => console.error("Error leaving call:", err))
            }
        }
    }, [call])

    // Zero-Click Auto-Activation Logic
    React.useEffect(() => {
        const autoEnable = async () => {
            try {
                // Short wait to ensure SDK context is definitely ready
                await new Promise(resolve => setTimeout(resolve, 800))

                if (call.microphone && !micEnabled) {
                    await call.microphone.enable().catch(console.warn)
                }
                if (call.camera && !camEnabled) {
                    await call.camera.enable().catch(console.warn)
                }

                toast({ title: "Laboratory Active", description: "Hardware synchronized automatically." })
            } catch (e: any) {
                console.warn("[Auto-Media Warning]", e)
                if (e.name === "NotAllowedError" || e.message?.toLowerCase().includes("denied")) {
                    setIsPermissionOpen(true)
                }
            }
        }
        autoEnable()
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [])

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

    // Join Trigger
    const handleJoin = async () => {
        try {
            await call.join({ create: true })
            toast({ title: "Connected!", description: "You have joined the laboratory." })
        } catch (err: any) {
            console.error("Join Failed:", err)
            toast({ title: "Connection Failed", description: err.message, variant: "destructive" })
        }
    }

    // --- Phase 1: Pre-join Staging Area (Google Meet Style) ---
    if (callingState === CallingState.IDLE || callingState === CallingState.JOINING) {
        return (
            <div className="h-full w-full flex flex-col bg-[#0f172a] text-white">
                <div className="flex-1 flex flex-col md:flex-row items-center justify-center p-8 lg:p-20 gap-16 overflow-y-auto">
                    {/* Left: Media Preview */}
                    <div className="w-full max-w-2xl aspect-video rounded-3xl bg-slate-900 border-4 border-slate-800 shadow-2xl relative overflow-hidden group">
                        <ParticipantView
                            participant={localParticipant || { user_id: currentUser?._id || 'local', isLocalParticipant: true, publishedTracks: [], roles: [], tags: [] } as any}
                            className="w-full h-full object-cover"
                            mirror={true}
                        />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                        <div className="absolute bottom-8 left-1/2 -translate-x-1/2 flex gap-6">
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => micEnabled ? call.microphone.disable() : call.microphone.enable()}
                                className={cn("w-14 h-14 rounded-full transition-all border-2", micEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}
                            >
                                {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                            </Button>
                            <Button
                                variant="ghost"
                                size="icon"
                                onClick={() => camEnabled ? call.camera.disable() : call.camera.enable()}
                                className={cn("w-14 h-14 rounded-full transition-all border-2", camEnabled ? "bg-white/10 border-white/20 text-white" : "bg-rose-500 border-rose-400 text-white")}
                            >
                                {camEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                            </Button>
                        </div>
                    </div>

                    {/* Right: Join Details */}
                    <div className="flex flex-col items-center md:items-start max-w-sm text-center md:text-left gap-8">
                        <div className="space-y-4">
                            <h1 className="text-4xl lg:text-5xl font-black tracking-tight text-white">Ready to join?</h1>
                            <p className="text-slate-400 font-medium">Review your hardware settings before entering the laboratory theater.</p>
                        </div>

                        <div className="flex items-center gap-4 bg-slate-800/50 p-4 rounded-3xl border border-slate-700 w-full">
                            <div className="w-12 h-12 rounded-2xl bg-indigo-500 flex items-center justify-center font-bold">
                                {currentUser?.fullName?.[0] || "U"}
                            </div>
                            <div className="flex flex-col">
                                <span className="text-sm font-black text-white">{currentUser?.fullName}</span>
                                <span className="text-[11px] text-slate-500 font-bold uppercase tracking-widest">Participating in {squadName}</span>
                            </div>
                        </div>

                        <Button
                            onClick={handleJoin}
                            disabled={callingState === CallingState.JOINING}
                            className="w-full h-16 rounded-[2rem] bg-indigo-600 hover:bg-indigo-700 text-white text-base font-black uppercase tracking-[0.2em] shadow-2xl shadow-indigo-500/20 active:scale-95 transition-all"
                        >
                            {callingState === CallingState.JOINING ? (
                                <> <Loader2 className="w-6 h-6 mr-3 animate-spin" /> ESTABLISHING LINK... </>
                            ) : (
                                "Ask to join"
                            )}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    // --- Phase 2: Live Laboratory Theater (Google Meet Style) ---
    return (
        <StreamTheme className="h-full w-full flex flex-col bg-[#0f172a]">
            {/* Header / Top Bar Area (Floating Style) */}
            <div className="absolute top-8 left-8 z-30 pointer-events-none">
                <div className="px-6 py-3 bg-black/40 backdrop-blur-3xl rounded-[2rem] border border-white/10 flex items-center gap-4 shadow-2xl pointer-events-auto">
                    <Video className="w-5 h-5 text-sky-400" />
                    <span className="text-xs font-black text-white uppercase tracking-widest">{squadName} Laboratory</span>
                    <div className="w-[1px] h-4 bg-white/10" />
                    <span className="text-[10px] font-black text-emerald-400 whitespace-nowrap">{participants.length} Active Participants</span>
                </div>
            </div>

            {/* Main Content: Theater Focus + Right Sidebar Gallery */}
            <div className="flex-1 flex gap-6 p-6 min-h-0 overflow-hidden">
                {/* 1. Main Theater Focus */}
                <div className="flex-[4] relative rounded-[3rem] overflow-hidden bg-black border-4 border-slate-900 flex items-center justify-center shadow-inner group/theater">
                    {screenShareEnabled ? (
                        <div className="w-full h-full p-4">
                            <ParticipantView
                                participant={localParticipant || participants.find(p => p.screenShareStream) || { user_id: 'screen', isLocalParticipant: true } as any}
                                className="w-full h-full object-contain"
                                trackType="screenShareTrack"
                            />
                        </div>
                    ) : participants.length === 1 ? (
                        <ParticipantView
                            participant={localParticipant || { user_id: 'local', isLocalParticipant: true, publishedTracks: [], roles: [], tags: [] } as any}
                            className="w-full h-full object-cover"
                            mirror={true}
                        />
                    ) : (
                        <SpeakerLayout />
                    )}

                    {/* Rec State Overlay */}
                    {isRecording && (
                        <div className="absolute top-8 right-8 px-5 py-2.5 bg-rose-500/80 backdrop-blur-2xl rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.1em] flex items-center gap-2.5 border border-rose-400/40 shadow-2xl animate-pulse">
                            <Radio className="w-4 h-4" /> RECORDING HUB
                        </div>
                    )}
                </div>

                {/* 2. Side Gallery (Participant Miniatures) */}
                <div className="flex-1 hidden xl:flex flex-col gap-4 max-w-[320px] h-full">
                    <div className="flex-1 overflow-y-auto scrollbar-premium space-y-4 pr-2">
                        {participants.map(p => (
                            <div key={p.sessionId} className="relative aspect-video rounded-3xl overflow-hidden border-2 border-slate-800 bg-slate-900 group/gallery hover:border-sky-500/50 transition-all shadow-xl">
                                <ParticipantView
                                    participant={p}
                                    className="w-full h-full object-cover"
                                />
                                <div className="absolute bottom-3 left-3 px-3 py-1 bg-black/40 backdrop-blur-md rounded-lg text-[9px] font-black text-white uppercase tracking-wider">
                                    {p.name || p.userId || "Member"}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Invite Shortcut */}
                    <Button
                        onClick={() => setIsInviteOpen(true)}
                        className="h-16 rounded-[2rem] bg-white/5 border-2 border-white/10 hover:bg-white/10 text-white font-black text-[11px] uppercase tracking-widest transition-all"
                    >
                        <UserPlus className="w-5 h-5 mr-3 text-sky-400" />
                        Add Partner
                    </Button>
                </div>
            </div>

            {/* Bottom Control Bar */}
            <div className="shrink-0 h-32 flex items-center justify-center bg-gradient-to-t from-black/40 to-transparent p-8">
                <div className="px-10 py-5 bg-slate-900/40 backdrop-blur-3xl rounded-[3rem] border border-white/5 flex items-center gap-10 shadow-2xl">
                    <div className="flex items-center gap-6">
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => micEnabled ? call.microphone.disable() : call.microphone.enable()}
                            className={cn("w-14 h-14 rounded-2xl transition-all border shadow-lg",
                                micEnabled ? "bg-slate-800 border-white/5 text-white" : "bg-rose-500 border-rose-400 text-white")}
                        >
                            {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => camEnabled ? call.camera.disable() : call.camera.enable()}
                            className={cn("w-14 h-14 rounded-2xl transition-all border shadow-lg",
                                camEnabled ? "bg-slate-800 border-white/5 text-white" : "bg-rose-500 border-rose-400 text-white")}
                        >
                            {camEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                        </Button>
                        <Button
                            variant="ghost"
                            size="icon"
                            onClick={() => call.screenShare.toggle()}
                            className={cn("w-14 h-14 rounded-2xl transition-all border shadow-lg",
                                screenShareEnabled ? "bg-indigo-500 border-indigo-400 text-white animate-pulse" : "bg-slate-800 border-white/5 text-white")}
                        >
                            <Monitor className="w-6 h-6" />
                        </Button>
                    </div>

                    <div className="w-[1px] h-10 bg-white/5 mx-2" />

                    <Button
                        variant="destructive"
                        onClick={onLeave}
                        className="h-14 w-14 rounded-2xl shadow-rose-900/20 shadow-2xl transition-all hover:rotate-90 active:scale-95"
                    >
                        <X className="w-7 h-7" />
                    </Button>
                </div>
            </div>

            <style jsx global>{`
                .str-video__speaker-layout { background: transparent !important; }
                .scrollbar-premium::-webkit-scrollbar { width: 4px; }
                .scrollbar-premium::-webkit-scrollbar-thumb { background: rgba(255,255,255,0.1); border-radius: 10px; }
            `}</style>

            {/* Invite Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="bg-slate-900/95 backdrop-blur-3xl border border-white/10 text-white rounded-[3rem] max-w-sm p-8 shadow-3xl">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black uppercase tracking-tight">Invite <span className="text-sky-400">Partners</span></DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <Input
                            placeholder="Search partners..."
                            value={searchQuery}
                            onChange={e => setSearchQuery(e.target.value)}
                            className="bg-slate-800/50 border-slate-700 text-white h-12 rounded-2xl text-xs font-semibold"
                        />
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                            {students
                                .filter(s => (s._id || s.id) !== (currentUser?._id || currentUser?.id))
                                .filter(student => student.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(student => (
                                    <div key={student._id || student.id} className="flex items-center justify-between p-4 rounded-3xl bg-slate-800/40 border border-white/5 hover:bg-slate-800 transition-all">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-sky-500/10 text-sky-400 flex items-center justify-center font-black">
                                                {student.fullName[0]}
                                            </div>
                                            <span className="text-sm font-black text-slate-100">{student.fullName}</span>
                                        </div>
                                        <Button size="sm" onClick={() => sendInvite(student)} className="h-9 px-4 rounded-xl bg-sky-600 hover:bg-sky-700 text-[10px] uppercase font-black tracking-widest">
                                            Invite
                                        </Button>
                                    </div>
                                ))
                            }
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
            <PermissionRecoveryModal open={isPermissionOpen} onOpenChange={setIsPermissionOpen} />
        </StreamTheme >
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
