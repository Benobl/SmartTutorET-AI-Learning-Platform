"use client"

import React from 'react'
import {
    Call,
    CallControls,
    CallParticipantsList,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
} from '@stream-io/video-react-sdk'
import { ArrowLeft, Video, Users, Mic, MicOff, VideoOff, UserPlus, Search, X, Loader2, Monitor, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { userApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth-utils'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import "@stream-io/video-react-sdk/dist/css/styles.css"

interface LiveClassroomProps {
    call: Call
    onLeave: () => void
    squadName: string
    squadId?: string
    socket?: any
}

export const LiveClassroom = ({ call, onLeave, squadName, squadId, socket }: LiveClassroomProps) => {
    const [isInviteOpen, setIsInviteOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [students, setStudents] = React.useState<any[]>([])
    const [invitedIds, setInvitedIds] = React.useState<Set<string>>(new Set())
    const [loading, setLoading] = React.useState(false)
    const currentUser = getCurrentUser()
    const { useMicrophoneState, useCameraState, useScreenShareState } = useCallStateHooks()
    const microphone = useMicrophoneState()
    const camera = useCameraState()
    const screenShare = useScreenShareState()

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
        <StreamCall call={call}>
            <StreamTheme className="h-full w-full flex flex-col bg-[#f0f4f8]">
                {/* Modern Lighter Header */}
                <div className="flex items-center justify-between px-8 py-5 bg-white/70 backdrop-blur-2xl border-b border-slate-200 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white px-5 py-2.5 rounded-2xl border border-slate-100 shadow-sm">
                            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-lg shadow-lg relative overflow-hidden">
                                <Video className="w-5 h-5 text-white relative z-10" />
                                <div className="absolute inset-0 bg-white/20 animate-pulse" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-slate-900 font-black text-sm tracking-tight">{squadName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1.5 w-1.5 bg-emerald-500 rounded-full shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
                                    <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">Live Transmission</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden lg:flex items-center gap-2 px-4 py-2 bg-sky-50/50 rounded-xl border border-sky-100/50">
                            <Users className="w-4 h-4 text-sky-500" />
                            <span className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Collaborative Hub</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="outline"
                            onClick={() => setIsInviteOpen(true)}
                            className="h-12 px-6 rounded-2xl bg-white border-slate-200 text-slate-800 font-black text-[11px] uppercase tracking-[0.15em] hover:bg-slate-50 transition-all shadow-sm hover:shadow-md"
                        >
                            <UserPlus className="w-4 h-4 mr-2.5 text-sky-500" />
                            Invite Partners
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={onLeave}
                            className="h-12 px-8 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black text-[11px] uppercase tracking-[0.15em] shadow-lg shadow-rose-200 border border-transparent transition-all"
                        >
                            Disconnect
                        </Button>
                    </div>
                </div>

                {/* Primary Content Area */}
                <div className="flex-1 min-h-0 relative flex gap-6 p-6">
                    <div className="flex-1 relative overflow-hidden bg-white rounded-[40px] border border-slate-200 shadow-2xl shadow-slate-200/50">
                        <SpeakerLayout />
                    </div>

                    {/* Final Refined Participant Sidebar */}
                    <div className="hidden xl:block w-80 z-20 transition-all">
                        <div className="h-full bg-white rounded-[40px] border border-slate-200 overflow-hidden shadow-2xl flex flex-col p-6 px-4">
                            <div className="flex-1 overflow-y-auto scrollbar-hide">
                                <CallParticipantsList onClose={() => { }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Lighter Control Bar */}
                <div className="shrink-0 flex items-center justify-center p-8 bg-gradient-to-t from-slate-100 to-transparent">
                    <div className="bg-white/90 backdrop-blur-3xl rounded-full p-4 flex items-center gap-8 border border-slate-200 shadow-[0_20px_50px_rgba(0,0,0,0.1)] ring-1 ring-black/5">
                        <div className="flex items-center gap-4 px-6 border-r border-slate-100 hidden md:flex">
                            <div className="flex gap-1.5 items-end h-5">
                                {[1, 2, 3, 2.5, 4, 1.5, 3].map((h, i) => (
                                    <div key={i} className="w-1.5 rounded-full bg-sky-500/20" style={{ height: `${h * 25}%` }} />
                                ))}
                            </div>
                        </div>

                        <div className="flex items-center gap-4 pr-4">
                            <div className="flex items-center gap-3">
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        if ((call.microphone.state as any).status === 'enabled') {
                                            await call.microphone.disable()
                                        } else {
                                            await call.microphone.enable()
                                        }
                                    }}
                                    className={cn("w-14 h-14 rounded-3xl transition-all border shadow-sm active:scale-90",
                                        (call.microphone.state as any).status === 'enabled' ? "bg-emerald-500 text-white border-emerald-600 shadow-emerald-200" : "bg-white text-slate-400 border-slate-200")}
                                >
                                    {(call.microphone.state as any).status === 'enabled' ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={async () => {
                                        if ((call.camera.state as any).status === 'enabled') {
                                            await call.camera.disable()
                                        } else {
                                            await call.camera.enable()
                                        }
                                    }}
                                    className={cn("w-14 h-14 rounded-3xl transition-all border shadow-sm active:scale-90",
                                        (call.camera.state as any).status === 'enabled' ? "bg-sky-500 text-white border-sky-600 shadow-sky-200" : "bg-white text-slate-400 border-slate-200")}
                                >
                                    {(call.camera.state as any).status === 'enabled' ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
                                </Button>
                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => call.screenShare.toggle()}
                                    className={cn("w-14 h-14 rounded-3xl transition-all border shadow-sm active:scale-90",
                                        (call.screenShare.state as any).status === 'enabled' ? "bg-emerald-500 text-white border-emerald-600" : "bg-slate-50 text-slate-400 border-slate-200")}
                                >
                                    <Monitor className="w-6 h-6" />
                                </Button>

                                <Button
                                    variant="ghost"
                                    size="icon"
                                    onClick={() => call.state.recording ? call.stopRecording() : call.startRecording()}
                                    className={cn("w-14 h-14 rounded-3xl transition-all border shadow-sm active:scale-90",
                                        call.state.recording ? "bg-rose-500 text-white border-rose-600 animate-pulse shadow-rose-200" : "bg-slate-50 text-slate-400 border-slate-200")}
                                >
                                    <Radio className="w-6 h-6" />
                                </Button>
                            </div>

                            <div className="w-px h-10 bg-slate-100 mx-2" />

                            <Button
                                variant="destructive"
                                onClick={onLeave}
                                className="h-14 w-14 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-200 border border-transparent flex items-center justify-center p-0 active:scale-90"
                            >
                                <X className="w-7 h-7" />
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
                    .str-video__call-controls__button {
                        width: 50px !important;
                        height: 50px !important;
                        border-radius: 20px !important;
                        background: rgba(255,255,255,0.05) !important;
                        border: 1px solid rgba(255,255,255,0.1) !important;
                        transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1) !important;
                    }
                    .str-video__call-controls__button:hover {
                        background: rgba(255,255,255,0.1) !important;
                        transform: translateY(-2px) !important;
                    }
                    .str-video__participants-list {
                        background: transparent !important;
                        padding: 0 !important;
                        display: flex !important;
                        flex-direction: column !important;
                        gap: 12px !important;
                        overflow: hidden !important;
                        width: 100% !important;
                    }
                    .str-video__participants-list-header {
                        padding: 0 0 16px 0 !important;
                        color: #1e1b4b !important;
                        font-weight: 950 !important;
                        text-transform: uppercase !important;
                        letter-spacing: 0.25em !important;
                        font-size: 11px !important;
                        border-bottom: 2px solid #e0e7ff !important;
                        margin-bottom: 24px !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .str-video__participant-list-item {
                        border-radius: 20px !important;
                        background: #f5f3ff !important;
                        margin-bottom: 0 !important;
                        border: 1px solid #e0e7ff !important;
                        padding: 12px 14px !important;
                        transition: all 0.2s ease !important;
                        width: 100% !important;
                        box-sizing: border-box !important;
                    }
                    .str-video__participant-list-item:hover {
                        background: white !important;
                        border-color: #c4b5fd !important;
                        box-shadow: 0 12px 30px rgba(79,70,229,0.1) !important;
                    }
                    .str-video__participant-details {
                        font-weight: 900 !important;
                        font-size: 14px !important;
                        color: #1e1b4b !important;
                    }
                    .str-video__participants-list-input-container {
                        background: #eef2ff !important;
                        border-radius: 16px !important;
                        border: 1px solid #c7d2fe !important;
                        margin-bottom: 20px !important;
                        padding: 4px !important;
                    }
                    .str-video__participants-list-input {
                        color: #1e1b4b !important;
                        font-size: 13px !important;
                        font-weight: 800 !important;
                    }
                    .str-video__participants-list-search-icon {
                        color: #4f46e5 !important;
                    }
                    .str-video__participant-avatar {
                        border: 3px solid white !important;
                        box-shadow: 0 4px 15px rgba(79,70,229,0.2) !important;
                    }
                `}</style>
            </StreamTheme>
            {/* Final Refined Invite Dialog */}
            <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                <DialogContent className="bg-white border border-slate-200 text-slate-900 rounded-[40px] max-w-sm p-8 shadow-3xl ring-1 ring-black/5">
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
                        <div className="space-y-2 max-h-60 overflow-y-auto pr-1 scrollbar-hide">
                            {students
                                .filter(s => (s._id || s.id) !== (currentUser?._id || currentUser?.id))
                                .filter(s => !invitedIds.has(s._id || s.id))
                                .filter(s => s.fullName?.toLowerCase().includes(searchQuery.toLowerCase()))
                                .map(student => (
                                    <div key={student._id || student.id} className="flex items-center justify-between p-4 rounded-3xl bg-indigo-50/50 border border-indigo-100 group hover:bg-white transition-all shadow-sm">
                                        <div className="flex items-center gap-3">
                                            <div className="w-10 h-10 rounded-xl bg-indigo-600 text-white flex items-center justify-center font-black shadow-md shadow-indigo-200">
                                                {student.fullName[0]}
                                            </div>
                                            <span className="text-xs font-black text-indigo-900">{student.fullName}</span>
                                        </div>
                                        <Button
                                            size="sm"
                                            onClick={() => sendInvite(student)}
                                            className="h-9 px-5 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white text-[10px] font-black uppercase shadow-lg shadow-indigo-100"
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
        </StreamCall>
    )
}
