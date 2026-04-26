"use client"

import React from 'react'
import {
    Call,
    CallControls,
    CallParticipantsList,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
} from '@stream-io/video-react-sdk'
import { X, Video, UserPlus, Search, Loader2, Mic, MicOff, VideoOff, Monitor, Radio } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { userApi } from '@/lib/api'
import { getCurrentUser } from '@/lib/auth-utils'
import { toast } from '@/hooks/use-toast'
import { cn } from '@/lib/utils'
import "@stream-io/video-react-sdk/dist/css/styles.css"

interface IndividualVideoCallProps {
    call: Call
    onLeave: () => void
    socket?: any
}

export const IndividualVideoCall = ({ call, onLeave, socket }: IndividualVideoCallProps) => {
    const [isInviteOpen, setIsInviteOpen] = React.useState(false)
    const [searchQuery, setSearchQuery] = React.useState("")
    const [students, setStudents] = React.useState<any[]>([])
    const [invitedIds, setInvitedIds] = React.useState<Set<string>>(new Set())
    const currentUser = getCurrentUser()

    React.useEffect(() => {
        if (isInviteOpen) {
            userApi.getAllStudents().then(res => setStudents(res.data || []))
        }
    }, [isInviteOpen])

    const sendInvite = (student: any) => {
        if (!socket) return
        const targetId = student._id || student.id
        socket.emit("direct-live-invite", {
            callId: call.id,
            hostName: currentUser?.fullName || "Someone",
            inviteeId: targetId
        })
        setInvitedIds(prev => new Set(prev).add(targetId))
        toast({ title: "Invite Sent!", description: `Notified ${student.fullName}.` })
    }
    return (
        <StreamCall call={call}>
            <StreamTheme className="h-full w-full bg-[#f5f3ff] rounded-[48px] overflow-hidden border border-indigo-100 shadow-3xl flex flex-col relative focus:outline-none">
                {/* Custom Modern Header */}
                <div className="absolute top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-3 pointer-events-auto">
                        <div className="flex items-center gap-4 bg-white/90 backdrop-blur-xl p-3 px-5 rounded-3xl border border-sky-100 shadow-xl shadow-sky-100/50">
                            <div className="w-10 h-10 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center border border-sky-500/20">
                                <Video className="w-5 h-5 shadow-sm" />
                            </div>
                            <div>
                                <h3 className="text-sky-900 font-black uppercase italic text-[11px] tracking-[0.2em] leading-none mb-1.5">Neural <span className="text-sky-500">Session</span></h3>
                                <div className="flex items-center gap-2">
                                    <div className="w-2 h-2 rounded-full bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.5)]" />
                                    <span className="text-[9px] font-black text-sky-400 uppercase tracking-[0.2em] leading-none">Encrypted Network Link</span>
                                </div>
                            </div>
                        </div>

                        <Button
                            onClick={() => setIsInviteOpen(true)}
                            className="h-14 px-6 rounded-[28px] bg-white border border-sky-100 text-sky-800 font-black text-[10px] uppercase tracking-widest hover:bg-sky-50 transition-all shadow-xl shadow-sky-100/40"
                        >
                            <UserPlus className="w-4 h-4 mr-2.5 text-sky-500" />
                            Invite Partners
                        </Button>
                    </div>

                    <Button
                        onClick={onLeave}
                        variant="ghost"
                        className="w-14 h-14 rounded-[28px] bg-white border border-sky-100 text-slate-400 hover:bg-rose-50 hover:text-rose-500 hover:border-rose-200 pointer-events-auto transition-all shadow-xl shadow-sky-100/40"
                    >
                        <X className="w-6 h-6" />
                    </Button>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 min-h-0 relative p-4 mt-20">
                    <div className="h-full rounded-[40px] overflow-hidden border border-sky-100 shadow-inner bg-white">
                        <SpeakerLayout />
                    </div>
                    <div className="absolute bottom-32 right-12 w-56 aspect-video rounded-3xl overflow-hidden border-4 border-white shadow-2xl pointer-events-none ring-1 ring-sky-100">
                        <CallParticipantsList onClose={() => { }} />
                    </div>
                </div>

                {/* Custom Controls Container */}
                <div className="absolute bottom-12 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-8 flex justify-center pointer-events-none">
                    <div className="bg-white/95 backdrop-blur-2xl p-4 rounded-full border border-sky-100 shadow-2xl flex items-center gap-6 pointer-events-auto ring-1 ring-sky-50/50">
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
                                    (call.camera.state as any).status === 'enabled' ? "bg-indigo-500 text-white border-indigo-600 shadow-indigo-200" : "bg-white text-slate-400 border-slate-200")}
                            >
                                {(call.camera.state as any).status === 'enabled' ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
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
                        <div className="w-px h-10 bg-sky-100 mx-1" />
                        <Button
                            onClick={onLeave}
                            className="w-14 h-14 rounded-3xl bg-rose-600 hover:bg-rose-700 text-white shadow-xl shadow-rose-200 transition-all flex items-center justify-center p-0"
                        >
                            <X className="w-7 h-7" />
                        </Button>
                    </div>
                </div>
                {/* Refined Light Invite Dialog */}
                <Dialog open={isInviteOpen} onOpenChange={setIsInviteOpen}>
                    <DialogContent className="bg-white border border-slate-200 text-slate-900 rounded-[40px] max-w-sm p-8 shadow-3xl ring-1 ring-black/5">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black italic uppercase tracking-tight text-slate-800">Expand <span className="text-sky-600">Session</span></DialogTitle>
                        </DialogHeader>
                        <div className="py-6 space-y-4">
                            <div className="relative group">
                                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                                <Input
                                    placeholder="Search peers..."
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
            </StreamTheme>
        </StreamCall >
    )
}
