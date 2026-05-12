"use client"

import React from 'react'
import {
    Call,
    CallControls,
    CallingState,
    CallParticipantsList,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
    ParticipantView,
} from '@stream-io/video-react-sdk'
import { ArrowLeft, Video, Users, Mic, MicOff, VideoOff, UserPlus, Search, X, Loader2, Monitor, Radio, Circle } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { userApi, liveApi } from '@/lib/api'
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
    dbSessionId?: string | null
    socket?: any
    courseCode?: string
}

// --- Consumer Component (Uses Hooks) ---
const LiveSessionContent = ({
    call,
    onLeave,
    squadName,
    squadId,
    dbSessionId,
    socket,
    courseCode
}: LiveClassroomProps) => {
    const { 
        useParticipants, 
        useLocalParticipant,
        useCallCallingState,
        useCameraState,
        useMicrophoneState,
        useScreenShareState,
        useIsCallRecordingInProgress,
        useIsAutoplayBlocked
    } = useCallStateHooks()

    const participants = useParticipants()
    const localParticipant = useLocalParticipant()
    const callingState = useCallCallingState()
    const { isEnabled: camEnabled, camera } = useCameraState()
    const { isEnabled: micEnabled, microphone } = useMicrophoneState()
    const { isSharing: isSharing, screenShare } = useScreenShareState()
    const isRecordingRunning = useIsCallRecordingInProgress()
    const isAutoplayBlocked = useIsAutoplayBlocked()

    const [isInviteOpen, setIsInviteOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [students, setStudents] = React.useState<any[]>([])
    const [isRecordingLoading, setIsRecordingLoading] = React.useState(false)

    // Auto-join logic - ONLY runs when IDLE or LEFT
    React.useEffect(() => {
        const joinCall = async () => {
            const s = call.state.callingState
            console.log("[LiveClassroom] Join Logic Triggered. State:", s)
            
            if (s === CallingState.IDLE || s === CallingState.LEFT) {
                try {
                    console.log("[LiveClassroom] Attempting call.join()...")
                    await call.join({ create: true })
                    console.log("[LiveClassroom] Joined call successfully")
                } catch (err) {
                    console.error("[LiveClassroom] Failed to join call:", err)
                }
            }
        }
        joinCall()
    }, [call])

    // Cleanup on unmount - ONLY stop tracks, don't leave the call server-side
    // This prevents the "Unmount -> Leave -> Mount" race condition in development/Strict Mode
    React.useEffect(() => {
        const mountedAt = Date.now()
        console.log(`[LiveClassroom] Session Instance Mounted at ${mountedAt}`)
        
        return () => {
            const duration = Date.now() - mountedAt
            console.log(`[LiveClassroom] Session Instance Unmounting after ${duration}ms`)
            
            // 1. Stop all local media tracks to turn off camera/mic lights
            // This is safe even if we remount immediately
            if (call.camera) call.camera.disable().catch(e => console.warn("Cam disable failed:", e))
            if (call.microphone) call.microphone.disable().catch(e => console.warn("Mic disable failed:", e))
            
            // 2. We DO NOT call call.leave() here. 
            // Why? Because React StrictMode or a Parent re-render can unmount us 
            // and we don't want to kill the active WebRTC connection for a temporary UI flicker.
            // The call.leave() is now handled explicitly by handleCloseSession.
            
            console.log("[LiveClassroom] Local media tracks disposed.")
        }
    }, [call])

    const handleCloseSession = async () => {
        console.log("[LiveClassroom] Explicit Leave Triggered by User")
        try {
            if (dbSessionId) {
                await liveApi.end(dbSessionId).catch(e => console.warn("End session log failed:", e))
                toast({ title: "Session Ended", description: "Class session has been archived." })
            }
            
            // Only call leave if we haven't left yet
            const s = call.state.callingState
            if (s !== CallingState.LEFT && s !== CallingState.IDLE) {
                await call.leave()
            }
            
            onLeave() 
        } catch (e) {
            console.error("[LiveClassroom] Error during explicit leave:", e)
            onLeave() 
        }
    }

    const [isHardwareReady, setIsHardwareReady] = React.useState(false)
    const [joinError, setJoinError] = React.useState<string | null>(null)
    const [showPermissionModal, setShowPermissionModal] = React.useState(false)

    // 1. Diagnostic Logging
    React.useEffect(() => {
        console.log(`[LiveClassroom] State: ${callingState} | Participants: ${participants.length}`)
        if (participants.length > 0) {
            console.log("[LiveClassroom] Active Participants:", participants.map(p => ({ id: p.userId, role: p.role, name: p.name })))
        }
    }, [callingState, participants])

    // 2. Hardware Sync Logic
    React.useEffect(() => {
        if (callingState === CallingState.JOINED && !isHardwareReady) {
            console.log("[LiveClassroom] Session Joined. Synchronizing Media Hardware...")
            const syncMedia = async () => {
                try {
                    // Force a permission prompt if not already granted
                    const stream = await navigator.mediaDevices.getUserMedia({ video: true, audio: true })
                    console.log("[LiveClassroom] Permissions Granted. Media Tracks:", stream.getTracks().length)
                    
                    await call.camera.enable()
                    await call.microphone.enable()
                    setIsHardwareReady(true)
                    console.log("[LiveClassroom] Media Hardware Synchronized")
                } catch (err: any) {
                    console.warn("[LiveClassroom] Auto-hardware sync failed:", err)
                    if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                        setShowPermissionModal(true)
                    }
                }
            }
            syncMedia()
        }
    }, [callingState, isHardwareReady, call])

    const activeSpeaker = participants.find(p => p.isSpeaking) || participants.find(p => p.role === 'host') || participants[0]
    const screenSharingParticipant = participants.find(p => p.screenShareStream)

    // Log call state changes
    React.useEffect(() => {
        console.log(`[LiveClassroom] State Update: ${callingState}`)
    }, [callingState])

    // Force re-join if stuck
    const handleForceSync = async () => {
        console.log("[LiveClassroom] Manual Force Sync Triggered")
        setJoinError(null)
        try {
            if (call.state.callingState !== CallingState.JOINED) {
                console.log("[LiveClassroom] Attempting manual call.join()")
                await call.join({ create: true })
            }
            if (call.state.localParticipant) {
                console.log("[LiveClassroom] Enabling hardware tracks...")
                await call.camera.enable()
                await call.microphone.enable()
                setIsHardwareReady(true)
            } else {
                console.warn("[LiveClassroom] Cannot sync: localParticipant still null")
            }
        } catch (err: any) {
            console.error("[LiveClassroom] Force Sync Failed:", err)
            setJoinError(err.message || "Manual sync failed")
        }
    }

    if (callingState !== CallingState.JOINED || !isHardwareReady) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
                <div className="relative">
                    <div className={cn(
                        "w-16 h-16 border-4 rounded-full animate-spin",
                        joinError ? "border-rose-500/20 border-t-rose-500" : "border-sky-500/20 border-t-sky-500"
                    )} />
                    <Radio className={cn(
                        "w-6 h-6 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse",
                        joinError ? "text-rose-500" : "text-sky-500"
                    )} />
                </div>
                <div className="text-center space-y-2">
                    <p className={cn(
                        "text-[10px] font-black uppercase tracking-[0.3em] animate-pulse",
                        joinError ? "text-rose-500" : "text-sky-500"
                    )}>
                        {joinError ? "Handshake Error" : (callingState === CallingState.JOINED && localParticipant ? "Secure Channel Established" : "Establishing Secure Stream...")}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">{squadName || "Academic Session"}</p>
                    {joinError && <p className="text-[8px] text-rose-400/60 max-w-xs mx-auto">{joinError}</p>}
                </div>
                <div className="flex flex-col items-center gap-3 mt-4">
                    {callingState === CallingState.JOINED && localParticipant ? (
                        <Button 
                            onClick={async () => {
                                console.log("[LiveClassroom] User clicked Enter Classroom")
                                try {
                                    await call.camera.enable()
                                    await call.microphone.enable()
                                    setIsHardwareReady(true)
                                } catch (err) {
                                    console.error("[LiveClassroom] Permission Error:", err)
                                    handleForceSync()
                                }
                            }}
                            className="h-12 px-8 rounded-xl bg-sky-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20 animate-bounce"
                        >
                            Enter Classroom
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-4">
                            <div className="flex flex-col items-center gap-2">
                                <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                                <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">
                                    {callingState === CallingState.MIGRATING ? "Switching Server Nodes..." : "Awaiting Server Synchronization..."}
                                </p>
                                <p className="text-[8px] text-slate-500 uppercase font-bold tracking-tight">Stream State: {callingState}</p>
                            </div>
                            <Button 
                                onClick={handleForceSync}
                                variant="outline"
                                className="h-10 px-6 rounded-xl border-white/10 text-white font-black text-[9px] uppercase tracking-widest hover:bg-white/5"
                            >
                                Force Sync Session
                            </Button>
                        </div>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={() => {
                            console.log("[LiveClassroom] User clicked Cancel & Return")
                            handleCloseSession()
                        }}
                        className="text-[9px] font-black uppercase text-slate-500 hover:text-white"
                    >
                        Cancel & Return
                    </Button>
                </div>
            </div>
        )
    }


    return (
        <div className="h-screen w-full flex flex-col bg-slate-950 text-white overflow-hidden font-sans">
            {/* Minimal Header */}
            <div className="h-14 border-b border-white/5 flex items-center justify-between px-6 bg-black/20">
                <div className="flex items-center gap-3">
                    <Button variant="ghost" size="icon" onClick={handleCloseSession} className="rounded-full text-slate-400">
                        <ArrowLeft className="w-4 h-4" />
                    </Button>
                    <h2 className="text-[12px] font-black uppercase tracking-widest text-white flex items-center gap-2">
                        <span className="text-sky-400 animate-pulse">●</span> 
                        <span className="truncate max-w-[200px]">{squadName || "Active Class"}</span>
                        {courseCode && (
                            <span className="text-slate-500 font-bold ml-1">#{courseCode}</span>
                        )}
                        <span className="ml-2 px-2 py-0.5 rounded-md bg-sky-500/10 text-sky-400 text-[8px] border border-sky-500/20">LIVE</span>
                    </h2>
                </div>
                <div className="flex items-center gap-3">
                    {isRecordingRunning && (
                        <div className="flex items-center gap-2 px-3 py-1 rounded-full bg-rose-500/20 text-rose-500 border border-rose-500/20 animate-pulse">
                            <Circle className="w-2 h-2 fill-current" />
                            <span className="text-[8px] font-black uppercase tracking-widest">Recording</span>
                        </div>
                    )}
                    <div className="w-px h-8 bg-white/10 mx-2" />

                    <Button 
                        onClick={() => setIsInviteOpen(true)}
                        className="h-8 px-4 rounded-full bg-white/5 hover:bg-white/10 text-[9px] font-black uppercase"
                    >
                        <UserPlus className="w-3 h-3 mr-2" /> Invite
                    </Button>
                    <Button 
                        onClick={handleCloseSession}
                        className="h-8 px-4 rounded-full bg-rose-600 hover:bg-rose-700 text-[9px] font-black uppercase"
                    >
                        End Class
                    </Button>
                </div>
            </div>

            {/* Main Content Area */}
            <div className="flex-1 flex overflow-hidden">
                {/* Stage */}
                <div className="flex-[3] relative bg-black flex items-center justify-center p-4">
                    <div className="w-full h-full max-w-5xl aspect-video rounded-3xl overflow-hidden bg-slate-900 border border-white/10 relative">
                        {screenSharingParticipant ? (
                             <ParticipantView participant={screenSharingParticipant} trackType="screenShareTrack" className="w-full h-full object-contain" />
                        ) : activeSpeaker ? (
                             <ParticipantView participant={activeSpeaker} className="w-full h-full object-cover" />
                        ) : (
                            <div className="absolute inset-0 flex items-center justify-center text-slate-600 text-[10px] font-black uppercase tracking-widest">
                                Awaiting Signal
                            </div>
                        )}
                    </div>
                </div>

                {/* Simplified Sidebar */}
                <div className="flex-1 max-w-[300px] border-l border-white/5 bg-black/20 overflow-y-auto p-4 hidden md:block">
                    <div className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-4">Participants ({participants.length})</div>
                    <div className="space-y-3">
                        {participants.map(p => (
                            <div key={p.sessionId} className="aspect-video rounded-xl overflow-hidden bg-slate-900 border border-white/5 relative group">
                                <ParticipantView participant={p} className="w-full h-full object-cover" />
                                <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-black/60 rounded-md text-[8px] font-bold">
                                    {p.name || 'Student'}
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Control Bar */}
            <div className="h-20 border-t border-white/5 flex items-center justify-center gap-4 bg-black/40">
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => micEnabled ? call.microphone.disable() : call.microphone.enable()}
                    className={cn("w-12 h-12 rounded-2xl", micEnabled ? "bg-white/5 text-white" : "bg-rose-600 text-white")}
                >
                    {micEnabled ? <Mic className="w-5 h-5" /> : <MicOff className="w-5 h-5" />}
                </Button>
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => camEnabled ? call.camera.disable() : call.camera.enable()}
                    className={cn("w-12 h-12 rounded-2xl", camEnabled ? "bg-white/5 text-white" : "bg-rose-600 text-white")}
                >
                    {camEnabled ? <Video className="w-5 h-5" /> : <VideoOff className="w-5 h-5" />}
                </Button>
                <div className="w-px h-8 bg-white/10 mx-2" />
                <Button 
                    variant="ghost" 
                    size="icon" 
                    onClick={() => call.screenShare.toggle()}
                    className={cn("w-12 h-12 rounded-2xl", isSharing ? "bg-sky-600 text-white" : "bg-white/5 text-slate-400")}
                >
                    <Monitor className="w-5 h-5" />
                </Button>
            </div>

            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="max-w-md bg-slate-950 border-white/10 text-white">
                    <DialogHeader><DialogTitle className="text-xs font-black uppercase tracking-widest">Invite Members</DialogTitle></DialogHeader>
                    <div className="py-4 space-y-4">
                         <Input 
                            placeholder="Search name..." 
                            className="bg-white/5 border-white/10" 
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                         />
                         <div className="space-y-2 max-h-60 overflow-y-auto">
                            {/* Mock student list for now or fetch from API if needed */}
                            <p className="text-[10px] text-center text-slate-500 py-4 font-black uppercase tracking-widest">Search results will appear here</p>
                         </div>
                    </div>
                </DialogContent>
            </Dialog>

            <PermissionRecoveryModal open={showPermissionModal} onOpenChange={setShowPermissionModal} />
        </div>
    )
}

import { useStream } from '@/components/providers/StreamProvider'
import { StreamVideo } from '@stream-io/video-react-sdk'

export const LiveClassroom = (props: LiveClassroomProps) => {
    const { videoClient, isReady } = useStream()

    if (!videoClient || !isReady) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-4">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500/60">Synchronizing Video Engine...</p>
            </div>
        )
    }

    return (
        <StreamVideo client={videoClient}>
            <StreamCall call={props.call}>
                <StreamTheme>
                    <LiveSessionContent {...props} />
                </StreamTheme>
            </StreamCall>
        </StreamVideo>
    )
}
