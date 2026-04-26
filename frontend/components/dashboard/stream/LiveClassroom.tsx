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

    const localParticipant = useLocalParticipant()
    const participants = useParticipants()
    const callingState = useCallCallingState()

    // Robust detection: Fallback to the first participant if localParticipant hook is still syncing
    const targetParticipant = localParticipant || participants[0]
    const isSolo = participants.length <= 1
    const isJoined = callingState === CallingState.JOINED

    const { isEnabled: micEnabled } = useMicrophoneState()
    const { isEnabled: camEnabled } = useCameraState()
    const { isEnabled: screenShareEnabled } = useScreenShareState()
    const isRecording = call.state.recording // Using direct observable for stability

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

    return (
        <StreamTheme className="h-full w-full flex flex-col bg-[#f0f4f8]">
            {/* Advanced Premium Header */}
            <div className="flex items-center justify-between px-8 py-6 bg-white/40 backdrop-blur-3xl border-b border-white/20 sticky top-0 z-50">
                <div className="flex items-center gap-5">
                    <div className="flex items-center gap-4 bg-white/60 backdrop-blur-md px-6 py-3 rounded-[2rem] border border-white/40 shadow-xl shadow-slate-200/20">
                        <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-indigo-600 via-sky-500 to-emerald-400 flex items-center justify-center text-white shadow-2xl relative overflow-hidden group">
                            <Video className="w-6 h-6 relative z-10 group-hover:scale-110 transition-transform" />
                            <div className="absolute inset-0 bg-white/20 animate-pulse" />
                        </div>
                        <div className="flex flex-col">
                            <p className="text-slate-900 font-black text-base tracking-tighter uppercase">{squadName}</p>
                            <div className="flex items-center gap-2 mt-1">
                                <span className="relative flex h-2 w-2">
                                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
                                </span>
                                <span className="text-[10px] font-black text-emerald-600 uppercase tracking-[0.2em]">High Definition Stream</span>
                            </div>
                        </div>
                    </div>

                    <div className="hidden lg:flex items-center gap-3 px-5 py-2.5 bg-sky-500/10 rounded-2xl border border-sky-500/20">
                        <Radio className="w-4 h-4 text-sky-600 animate-pulse" />
                        <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Global Sync Active</span>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={() => setIsInviteOpen(true)}
                        className="h-14 px-8 rounded-3xl bg-white/80 border-white text-slate-800 font-black text-[12px] uppercase tracking-[0.15em] hover:bg-white hover:scale-105 transition-all shadow-xl shadow-slate-200/40 border-2"
                    >
                        <UserPlus className="w-5 h-5 mr-3 text-sky-500" />
                        Invite Partners
                    </Button>
                    <Button
                        variant="destructive"
                        onClick={onLeave}
                        className="h-14 px-8 rounded-3xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[12px] uppercase tracking-[0.15em] shadow-2xl shadow-rose-500/30 border-none transition-all active:scale-95"
                    >
                        End Session
                    </Button>
                </div>
            </div>

            {/* Primary Content Area */}
            <div className="flex-1 min-h-0 relative flex gap-8 p-8">
                <div className="flex-1 relative overflow-hidden bg-slate-950 rounded-[3rem] border-8 border-white/20 shadow-[0_45px_120px_rgba(0,0,0,0.4)] flex items-center justify-center group/video">
                    {/* Cinematic Backdrop */}
                    <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-950 to-indigo-950 opacity-50" />
                    <div className="absolute inset-0 bg-[url('https://www.transparenttextures.com/patterns/dark-matter.png')] opacity-20" />

                    {/* Aspect Ratio Controlled Content Wrapper */}
                    <div className="relative w-full h-full max-h-[80vh] aspect-video flex items-center justify-center overflow-hidden rounded-3xl bg-slate-900 shadow-inner">
                        {!isJoined || (!targetParticipant && isSolo) ? (
                            <div className="flex flex-col items-center gap-4">
                                <div className="w-16 h-16 rounded-full border-4 border-sky-500/20 border-t-sky-500 animate-spin" />
                                <p className="text-xs font-black text-sky-500 uppercase tracking-[0.2em] animate-pulse">
                                    {!isJoined ? "Establishing Secure Link..." : "Connecting Hardware..."}
                                </p>
                            </div>
                        ) : isSolo ? (
                            <ParticipantView
                                participant={targetParticipant!}
                                className="w-full h-full object-cover"
                                mirror={true}
                            />
                        ) : (
                            <SpeakerLayout />
                        )}
                    </div>

                    {/* Overlay Status Indicators - Advanced Glassmorphism */}
                    <div className="absolute top-8 left-8 flex gap-4 z-30 transition-all group-hover/video:translate-y-1">
                        {screenShareEnabled && (
                            <div className="px-5 py-2.5 bg-emerald-500/80 backdrop-blur-2xl rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 border border-emerald-400/40 shadow-2xl shadow-emerald-500/20">
                                <div className="w-2 h-2 rounded-full bg-white animate-pulse" />
                                <Monitor className="w-4 h-4" /> SCREEN STREAMING
                            </div>
                        )}
                        {isRecording && (
                            <div className="px-5 py-2.5 bg-rose-500/80 backdrop-blur-2xl rounded-2xl text-white text-[11px] font-black uppercase tracking-[0.2em] flex items-center gap-2.5 border border-rose-400/40 shadow-2xl shadow-rose-500/20 animate-pulse">
                                <div className="w-2 h-2 rounded-full bg-white" />
                                <Radio className="w-4 h-4" /> RECORDING HUB
                            </div>
                        )}
                    </div>
                </div>

                {/* Participant Sidebar - Redesigned for Desktop Premium */}
                <div className="hidden xl:block w-[400px] z-20 transition-all border-l border-white/20 bg-white/40 backdrop-blur-3xl">
                    <div className="h-full flex flex-col p-10 px-8">
                        <div className="flex items-center justify-between mb-8">
                            <h3 className="text-[12px] font-black text-slate-800 uppercase tracking-[0.4em] flex items-center gap-3">
                                <div className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse" />
                                Participants
                            </h3>
                            <div className="px-3 py-1 bg-slate-900/5 rounded-full text-[10px] font-black text-slate-500 uppercase tracking-widest">
                                Global Sync
                            </div>
                        </div>

                        <div className="flex-1 overflow-y-auto scrollbar-premium pr-2">
                            <CallParticipantsList
                                onClose={() => { }}
                            />
                        </div>

                        <div className="mt-8 pt-8 border-t border-slate-200/50">
                            <div className="flex items-center gap-4 bg-white/40 p-4 rounded-3xl border border-white/60">
                                <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center text-sky-600">
                                    <Radio className="w-5 h-5 animate-pulse" />
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[10px] font-black text-slate-900 uppercase">Live Bitrate</span>
                                    <span className="text-[9px] font-bold text-slate-400">Optimizing for HD...</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Advanced Glassmorphism Control Bar */}
            <div className="shrink-0 flex items-center justify-center p-10 bg-gradient-to-t from-slate-200/50 to-transparent">
                <div className="bg-white/40 backdrop-blur-3xl rounded-[3rem] p-5 flex items-center gap-10 border border-white/60 shadow-[0_30px_100px_rgba(0,0,0,0.1)] ring-1 ring-white/40">

                    <div className="flex items-center gap-5 px-8 border-r border-slate-200/50 hidden md:flex">
                        <div className="flex flex-col gap-1 items-center">
                            <div className="flex gap-2 items-end h-6">
                                {[1.5, 3, 2, 4, 3.5, 2.5, 3, 1].map((h, i) => (
                                    <div key={i} className={cn("w-1.5 rounded-full transition-all duration-500",
                                        micEnabled ? "bg-sky-500 shadow-[0_0_8px_rgba(14,165,233,0.5)]" : "bg-slate-300")}
                                        style={{ height: `${micEnabled ? h * 25 : 10}%` }} />
                                ))}
                            </div>
                            <span className="text-[9px] font-black text-slate-400 uppercase tracking-tighter">Voice Stream</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-5 pr-5">
                        <div className="flex items-center gap-4">
                            <div className="flex flex-col items-center gap-2 group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        try {
                                            if (micEnabled) {
                                                await call.microphone.disable()
                                                // Hardware Force Release
                                                const tracks = await navigator.mediaDevices.getUserMedia({ audio: true }).then(s => s.getTracks()).catch(() => [])
                                                tracks.forEach(track => track.stop())
                                            } else {
                                                await call.microphone.enable()
                                                toast({ title: "Microphone Active", description: "Audio stream engaged." })
                                            }
                                        } catch (e: any) {
                                            console.error("[Mic Error]", e)
                                            const isPermissionError =
                                                e.name === "NotAllowedError" ||
                                                e.name === "PermissionDeniedError" ||
                                                e.name === "SecurityError" ||
                                                e.message?.toLowerCase().includes("denied") ||
                                                e.message?.toLowerCase().includes("granted") ||
                                                e.message?.toLowerCase().includes("prompt")

                                            if (isPermissionError) {
                                                setIsPermissionOpen(true)
                                            } else {
                                                toast({ title: "Microphone Error", description: "Hardware busy or unavailable.", variant: "destructive" })
                                            }
                                        }
                                    }}
                                    className={cn("w-16 h-16 rounded-[2rem] transition-all border-2 shadow-lg active:scale-95 group-hover:-translate-y-1 flex items-center justify-center",
                                        micEnabled
                                            ? "bg-emerald-500 text-white border-emerald-400 shadow-emerald-200"
                                            : "bg-rose-50 text-rose-500 border-rose-100 hover:bg-rose-100")}
                                >
                                    {micEnabled ? <Mic className="w-7 h-7" /> : <MicOff className="w-7 h-7" />}
                                </Button>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", micEnabled ? "text-emerald-600" : "text-rose-600")}>
                                    {micEnabled ? "Active" : "Muted"}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-2 group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        try {
                                            if (camEnabled) {
                                                await call.camera.disable()
                                                toast({ title: "Camera Off" })
                                            } else {
                                                await call.camera.enable()
                                                toast({ title: "Camera On" })
                                            }
                                        } catch (e: any) {
                                            console.error("[Camera Toggle Error]", e)
                                            if (e.name === "NotAllowedError" || e.message?.includes("denied")) {
                                                setIsPermissionOpen(true)
                                            } else {
                                                toast({ title: "Media Error", description: "Failed to toggle camera.", variant: "destructive" })
                                            }
                                        }
                                    }}
                                    className={cn("w-16 h-16 rounded-[2rem] transition-all border-2 shadow-lg active:scale-95 group-hover:-translate-y-1 flex items-center justify-center",
                                        camEnabled
                                            ? "bg-sky-500 text-white border-sky-400 shadow-sky-200"
                                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100")}
                                >
                                    {camEnabled ? <Video className="w-7 h-7" /> : <VideoOff className="w-7 h-7" />}
                                </Button>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", camEnabled ? "text-sky-600" : "text-slate-400")}>
                                    {camEnabled ? "Cam On" : "Cam Off"}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-2 group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        try {
                                            await call.screenShare.toggle()
                                        } catch (e: any) {
                                            console.error("[Screen Share Error]", e)
                                            if (e.name === "NotAllowedError" || e.name === "PermissionDeniedError" || e.message?.toLowerCase().includes("denied")) {
                                                setIsPermissionOpen(true)
                                            } else {
                                                toast({ title: "Screen Share Error", description: "Failed to start sharing.", variant: "destructive" })
                                            }
                                        }
                                    }}
                                    className={cn("w-16 h-16 rounded-[2rem] transition-all border-2 shadow-lg active:scale-95 group-hover:-translate-y-1 flex items-center justify-center",
                                        screenShareEnabled
                                            ? "bg-indigo-600 text-white border-indigo-400 shadow-indigo-200 animate-pulse"
                                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100")}
                                >
                                    <Monitor className="w-7 h-7" />
                                </Button>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", screenShareEnabled ? "text-indigo-600" : "text-slate-400")}>
                                    {screenShareEnabled ? "Sharing" : "Screen"}
                                </span>
                            </div>

                            <div className="flex flex-col items-center gap-2 group">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        try {
                                            if (isRecording) {
                                                await call.stopRecording()
                                                toast({ title: "Recording Saved", description: "Session capture has ended." })
                                            } else {
                                                await call.startRecording()
                                                toast({ title: "Recording Started", description: "Capturing laboratory session." })
                                            }
                                        } catch (e: any) {
                                            console.error("[Recording Error]", e)
                                            toast({
                                                title: "Recording Unavailable",
                                                description: e.message || "You may not have permission to record this session.",
                                                variant: "destructive"
                                            })
                                        }
                                    }}
                                    className={cn("w-16 h-16 rounded-[2rem] transition-all border-2 shadow-lg active:scale-95 group-hover:-translate-y-1 flex items-center justify-center",
                                        isRecording
                                            ? "bg-rose-600 text-white border-rose-500 shadow-rose-200 animate-pulse"
                                            : "bg-slate-50 text-slate-400 border-slate-200 hover:bg-slate-100")}
                                >
                                    <Radio className="w-7 h-7" />
                                </Button>
                                <span className={cn("text-[10px] font-black uppercase tracking-widest", isRecording ? "text-rose-600" : "text-slate-400")}>
                                    {isRecording ? "REC ON" : "Record"}
                                </span>
                            </div>
                        </div>

                        <div className="w-[1.5px] h-12 bg-slate-200/60 mx-4" />

                        <Button
                            variant="destructive"
                            onClick={onLeave}
                            title="Exit Session"
                            className="h-16 w-16 rounded-[2rem] bg-rose-600 hover:bg-rose-700 text-white shadow-2xl shadow-rose-500/40 border-none flex items-center justify-center p-0 active:scale-90 transition-all hover:rotate-90 hover:scale-110"
                        >
                            <X className="w-8 h-8" />
                        </Button>
                    </div>
                </div>
            </div>

            <style jsx global>{`
                .str-video__speaker-layout {
                    background: transparent !important;
                }
                .str-video__call-controls {
                    gap: 12px !important;
                    padding: 0 !important;
                    background: transparent !important;
                }
                /* Desktop Premium Participant Sidebar & List Override */
                .str-video__participants-list {
                    background: transparent !important;
                    display: flex !important;
                    flex-direction: column !important;
                    gap: 12px !important;
                    padding: 0 !important;
                    width: 100% !important;
                    height: auto !important;
                }
                .str-video__participants-list-header {
                    display: none !important; /* Managed by custom header */
                }
                .str-video__participant-list-item {
                    background: rgba(255, 255, 255, 0.4) !important;
                    backdrop-filter: blur(10px) !important;
                    border: 1px solid rgba(255, 255, 255, 0.6) !important;
                    border-radius: 2rem !important;
                    padding: 16px 20px !important;
                    margin: 0 !important;
                    transition: all 0.3s ease !important;
                    width: 100% !important;
                    box-sizing: border-box !important;
                }
                .str-video__participant-list-item:hover {
                    background: white !important;
                    box-shadow: 0 15px 40px rgba(15, 23, 42, 0.05) !important;
                    transform: translateY(-2px) !important;
                }
                .str-video__participant-details {
                    font-weight: 900 !important;
                    color: #0f172a !important;
                    font-size: 15px !important;
                }
                .str-video__participant-avatar {
                    border: 3px solid white !important;
                    box-shadow: 0 8px 20px rgba(15, 23, 42, 0.1) !important;
                }
                .str-video__participants-list-input-container {
                    background: #f8fafc !important;
                    border-radius: 1.5rem !important;
                    border: 1px solid #e2e8f0 !important;
                    margin-bottom: 24px !important;
                    padding: 4px 12px !important;
                    box-shadow: inset 0 2px 4px rgba(0,0,0,0.02) !important;
                }
                .str-video__participants-list-input {
                    font-weight: 700 !important;
                    color: #0f172a !important;
                    font-size: 14px !important;
                }
                .str-video__participants-list-search-icon {
                    color: #94a3b8 !important;
                }

                .scrollbar-premium::-webkit-scrollbar {
                    width: 5px;
                }
                .scrollbar-premium::-webkit-scrollbar-track {
                    background: transparent;
                }
                .scrollbar-premium::-webkit-scrollbar-thumb {
                    background: #e2e8f0;
                    border-radius: 10px;
                }
                .scrollbar-premium::-webkit-scrollbar-thumb:hover {
                    background: #cbd5e1;
                }

                .soft-shadow-emerald { box-shadow: 0 10px 25px -5px rgba(16, 185, 129, 0.4); }
                .soft-shadow-sky { box-shadow: 0 10px 25px -5px rgba(14, 165, 233, 0.4); }
                .soft-shadow-indigo { box-shadow: 0 10px 25px -5px rgba(79, 70, 229, 0.4); }
                .soft-shadow-rose { box-shadow: 0 10px 25px -5px rgba(244, 63, 94, 0.4); }
            `}</style>

            {/* Final Refined Invite Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="bg-white/90 backdrop-blur-3xl border border-white/40 text-slate-900 rounded-[3rem] max-w-sm p-8 shadow-3xl ring-1 ring-black/5">
                    <DialogHeader>
                        <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Invite <span className="text-sky-600">Partners</span></DialogTitle>
                    </DialogHeader>
                    <div className="py-6 space-y-4">
                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                            <Input
                                placeholder="Search by name..."
                                value={searchQuery}
                                onChange={e => setSearchQuery(e.target.value)}
                                className="bg-slate-50 border-slate-200 text-slate-900 pl-11 h-12 rounded-2xl focus:ring-sky-500/20 text-xs font-semibold"
                                autoFocus
                            />
                        </div>
                        <div className="space-y-3 max-h-72 overflow-y-auto pr-1 scrollbar-hide">
                            {students
                                .filter(s => (s._id || s.id) !== (currentUser?._id || currentUser?.id))
                                .filter(s => !invitedIds.has(s._id || s.id))
                                .filter(s => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(student => (
                                    <div key={student._id || student.id} className="group flex items-center justify-between p-5 rounded-[2rem] bg-slate-50 border border-slate-100 hover:bg-white hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300">
                                        <div className="flex items-center gap-4">
                                            <div className="w-12 h-12 rounded-[1.25rem] bg-gradient-to-br from-sky-400 to-indigo-500 text-white flex items-center justify-center font-black shadow-lg uppercase">
                                                {student.fullName[0]}
                                            </div>
                                            <div className="flex flex-col">
                                                <span className="text-sm font-black text-slate-800">{student.fullName}</span>
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">Student Academic</span>
                                            </div>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => sendInvite(student)}
                                            className="h-10 px-6 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white text-[11px] font-black uppercase tracking-widest shadow-lg shadow-sky-100 transition-all active:scale-95"
                                        >
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
