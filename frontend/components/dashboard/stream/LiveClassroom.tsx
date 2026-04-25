"use client"

import React, { useEffect, useState } from 'react'
import {
    Call,
    CallControls,
    CallParticipantsList,
    SpeakerLayout,
    StreamCall,
    StreamTheme,
    useCallStateHooks,
} from '@stream-io/video-react-sdk'
import { FlaskConical, X, MessageSquare, ScreenShare, Video, VideoOff, Mic, MicOff } from 'lucide-react'
import { Button } from '@/components/ui/button'
import "@stream-io/video-react-sdk/dist/css/styles.css"

interface LiveClassroomProps {
    call: Call
    onLeave: () => void
    squadName: string
}

export const LiveClassroom = ({ call, onLeave, squadName }: LiveClassroomProps) => {
    return (
        <StreamCall call={call}>
            <StreamTheme className="h-full w-full bg-slate-950 rounded-[48px] overflow-hidden border border-white/10 shadow-3xl flex flex-col relative">
                {/* Custom Header */}
                <div className="absolute top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 pointer-events-auto">
                        <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase italic text-xs tracking-tight">{squadName} <span className="text-sky-400">Live Lab</span></h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-rose-500 animate-pulse" />
                                <span className="text-[9px] font-bold text-white/60 uppercase tracking-widest leading-none">Transmission Active</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onLeave}
                        variant="ghost"
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 pointer-events-auto transition-all"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 min-h-0 relative">
                    <SpeakerLayout />
                    <CallParticipantsList onClose={() => { }} />
                </div>

                {/* Custom Controls Container */}
                <div className="p-8 bg-gradient-to-t from-black/80 to-transparent">
                    <div className="max-w-xl mx-auto">
                        <div className="bg-white/10 backdrop-blur-2xl p-2 rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-center gap-4">
                            <CallControls onLeave={onLeave} />
                        </div>
                    </div>
                </div>
            </StreamTheme>
        </StreamCall>
    )
}
