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
import { X, Video } from 'lucide-react'
import { Button } from '@/components/ui/button'
import "@stream-io/video-react-sdk/dist/css/styles.css"

interface IndividualVideoCallProps {
    call: Call
    onLeave: () => void
}

export const IndividualVideoCall = ({ call, onLeave }: IndividualVideoCallProps) => {
    return (
        <StreamCall call={call}>
            <StreamTheme className="h-full w-full bg-slate-950 rounded-[48px] overflow-hidden border border-white/10 shadow-3xl flex flex-col relative focus:outline-none">
                {/* Custom Header */}
                <div className="absolute top-8 left-8 right-8 z-50 flex items-center justify-between pointer-events-none">
                    <div className="flex items-center gap-4 bg-black/40 backdrop-blur-xl p-4 rounded-3xl border border-white/10 pointer-events-auto shadow-2xl">
                        <div className="w-10 h-10 rounded-2xl bg-sky-500/20 text-sky-400 flex items-center justify-center border border-sky-500/30">
                            <Video className="w-5 h-5" />
                        </div>
                        <div>
                            <h3 className="text-white font-black uppercase italic text-[10px] tracking-widest leading-none mb-1.5">Direct <span className="text-sky-400">Transmission</span></h3>
                            <div className="flex items-center gap-2">
                                <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                                <span className="text-[8px] font-black text-white/50 uppercase tracking-[0.2em] leading-none">Secure Link Established</span>
                            </div>
                        </div>
                    </div>

                    <Button
                        onClick={onLeave}
                        variant="ghost"
                        className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 text-white hover:bg-rose-500/20 hover:text-rose-400 hover:border-rose-500/30 pointer-events-auto transition-all shadow-2xl"
                    >
                        <X className="w-5 h-5" />
                    </Button>
                </div>

                {/* Main Video Area */}
                <div className="flex-1 min-h-0 relative">
                    <SpeakerLayout />
                    <div className="absolute bottom-32 right-8 w-48 aspect-video rounded-2xl overflow-hidden border border-white/10 shadow-2xl pointer-events-none">
                        <CallParticipantsList onClose={() => { }} />
                    </div>
                </div>

                {/* Custom Controls Container */}
                <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-50 w-full max-w-sm px-8 pointer-events-none">
                    <div className="bg-black/40 backdrop-blur-2xl p-2 rounded-[32px] border border-white/10 shadow-2xl flex items-center justify-center gap-4 pointer-events-auto ring-1 ring-white/5">
                        <CallControls onLeave={onLeave} />
                    </div>
                </div>
            </StreamTheme>
        </StreamCall>
    )
}
