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

    // Auto-join and media enablement logic
    React.useEffect(() => {
        let mounted = true
        
        const joinAndEnable = async () => {
            if (callingState === CallingState.IDLE) {
                try {
                    await call.join({ create: true })
                } catch (err) {
                    if (mounted) console.error("Failed to join call:", err)
                }
            }
            
            // Once joined, the user will click 'Start Teaching' to enable hardware
            if (callingState === CallingState.JOINED) {
                // No automatic hardware start to prevent NegotiationError
            }
        }

        joinAndEnable()

        return () => {
            mounted = false
        }
    }, [call, callingState, camEnabled, micEnabled, localParticipant])

    // Cleanup on unmount - IMPORTANT to turn off camera/mic lights
    React.useEffect(() => {
        return () => {
            const shutdown = async () => {
                try {
                    // Force disable media first
                    await call.camera.disable()
                    await call.microphone.disable()
                    
                    if (call.state.callingState !== CallingState.IDLE && call.state.callingState !== CallingState.LEFT) {
                        await call.leave()
                    }
                } catch (err) {
                    console.error("Cleanup error:", err)
                }
            }
            shutdown()
        }
    }, [call])

    const activeSpeaker = participants.find(p => p.isSpeaking) || participants[0]
    const screenSharingParticipant = participants.find(p => p.screenShareStream)

    const [isHardwareReady, setIsHardwareReady] = React.useState(false)

    if (callingState !== CallingState.JOINED || !isHardwareReady) {
        return (
            <div className="h-screen w-full flex flex-col items-center justify-center bg-slate-950 text-white gap-6">
                <div className="relative">
                    <div className="w-16 h-16 border-4 border-sky-500/20 border-t-sky-500 rounded-full animate-spin" />
                    <Radio className="w-6 h-6 text-sky-500 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 animate-pulse" />
                </div>
                <div className="text-center space-y-2">
                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-500 animate-pulse">
                        {callingState === CallingState.JOINED && localParticipant ? "Secure Channel Established" : "Establishing Secure Stream..."}
                    </p>
                    <p className="text-[9px] font-bold text-slate-500 uppercase tracking-widest italic">{squadName || "Academic Session"}</p>
                </div>
                <div className="flex flex-col items-center gap-3 mt-4">
                    {callingState === CallingState.JOINED && localParticipant ? (
                        <Button 
                            onClick={async () => {
                                try {
                                    // Ensure participant is still valid
                                    if (!call.state.localParticipant) {
                                        throw new Error("Local participant synchronization pending...");
                                    }
                                    await call.camera.enable()
                                    await call.microphone.enable()
                                    setIsHardwareReady(true)
                                } catch (err) {
                                    console.error("Hardware failed:", err)
                                    toast({ title: "Sync Pending", description: "Waiting for server signal. Please try again in a moment." })
                                }
                            }}
                            className="h-12 px-8 rounded-xl bg-rose-500 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-rose-500/20 animate-bounce"
                        >
                            {localParticipant ? "Join Academic Session" : "Synchronizing..."}
                        </Button>
                    ) : (
                        <div className="flex flex-col items-center gap-2">
                            <Loader2 className="w-4 h-4 animate-spin text-slate-700" />
                            <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest">Awaiting Server Synchronization...</p>
                        </div>
                    )}
                    <Button 
                        variant="ghost" 
                        size="sm"
                        onClick={onLeave}
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
                    <Button variant="ghost" size="icon" onClick={onLeave} className="rounded-full text-slate-400">
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
                        onClick={async () => {
                            if (dbSessionId) {
                                try {
                                    // Robustly try to stop recording if UI thinks it's running
                                    if (isRecordingRunning) {
                                        try {
                                            await call.stopRecording();
                                        } catch (stopErr) {
                                            console.warn("Stop recording failed (egress might not be running):", stopErr);
                                        }
                                    }
                                    await liveApi.end(dbSessionId);
                                    toast({ title: "Session Ended", description: "Class session has been archived." });
                                } catch (err) {
                                    console.error("End session error:", err);
                                }
                            }
                            await call.leave();
                            onLeave();
                        }}
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
        </div>
    )
}

export const LiveClassroom = (props: LiveClassroomProps) => {
    return (
        <StreamCall call={props.call}>
            <LiveSessionContent {...props} />
        </StreamCall>
    )
}
