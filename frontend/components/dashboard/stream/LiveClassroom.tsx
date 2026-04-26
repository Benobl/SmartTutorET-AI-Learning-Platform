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
import { ArrowLeft, Video, Users, Mic, MicOff, VideoOff } from 'lucide-react'
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
            <StreamTheme className="h-full w-full flex flex-col bg-[#010409]">
                {/* Modern Header */}
                <div className="flex items-center justify-between px-6 py-4 bg-black/60 backdrop-blur-2xl border-b border-white/5 sticky top-0 z-50">
                    <div className="flex items-center gap-4">
                        <div className="flex items-center gap-3 bg-white/5 px-4 py-2 rounded-2xl border border-white/10">
                            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-rose-500 to-orange-600 flex items-center justify-center text-lg shadow-lg animate-pulse">
                                <Video className="w-5 h-5 text-white" />
                            </div>
                            <div className="flex flex-col">
                                <p className="text-white font-black text-sm tracking-tight">{squadName}</p>
                                <div className="flex items-center gap-1.5 mt-0.5">
                                    <div className="h-1 w-1 bg-emerald-500 rounded-full animate-ping" />
                                    <span className="text-[9px] font-black text-emerald-500 uppercase tracking-widest">Connected • Live</span>
                                </div>
                            </div>
                        </div>

                        <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-white/5 rounded-xl border border-white/5">
                            <Users className="w-3.5 h-3.5 text-white/40" />
                            <span className="text-[10px] font-bold text-white/60 uppercase">Streaming active</span>
                        </div>
                    </div>

                    <div className="flex items-center gap-3">
                        <Button
                            variant="destructive"
                            onClick={onLeave}
                            className="h-10 px-6 rounded-2xl bg-rose-600 hover:bg-rose-700 text-white font-black text-xs uppercase tracking-widest shadow-xl shadow-rose-900/40 border border-white/10"
                        >
                            End Session
                        </Button>
                    </div>
                </div>

                {/* Primary Content Area */}
                <div className="flex-1 min-h-0 relative flex">
                    <div className="flex-1 relative overflow-hidden bg-black/40 m-4 rounded-[40px] border border-white/5 shadow-2xl">
                        <SpeakerLayout />
                    </div>

                    {/* Floating Participant Overlay */}
                    <div className="hidden xl:block absolute right-12 top-12 bottom-12 w-80 z-20 transition-all">
                        <div className="h-full bg-black/40 backdrop-blur-3xl rounded-[40px] border border-white/10 overflow-hidden shadow-2xl flex flex-col p-6">
                            <div className="flex items-center gap-2 mb-6 px-2">
                                <Users className="w-4 h-4 text-sky-400" />
                                <h3 className="text-white font-black text-xs uppercase tracking-widest">Participants</h3>
                            </div>
                            <div className="flex-1 overflow-y-auto">
                                <CallParticipantsList onClose={() => { }} />
                            </div>
                        </div>
                    </div>
                </div>

                {/* Cyberpunk Control Bar */}
                <div className="shrink-0 flex items-center justify-center p-8 bg-gradient-to-t from-black to-transparent">
                    <div className="bg-[#1a1c23]/80 backdrop-blur-3xl rounded-[32px] p-3 flex items-center gap-4 border border-white/10 shadow-3xl">
                        <div className="px-4 border-r border-white/10 hidden md:block">
                            <p className="text-[10px] font-black text-white/30 uppercase tracking-tighter mb-1">Session Audio</p>
                            <div className="flex gap-1">
                                {[1, 2, 3, 4, 3, 2, 1].map((h, i) => (
                                    <div key={i} className="w-1 bg-sky-500/40 rounded-full" style={{ height: h * 4 }} />
                                ))}
                            </div>
                        </div>
                        <div className="flex items-center gap-2">
                            <CallControls onLeave={onLeave} />
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
                    .str-video__participant-view {
                        background: #0d1117 !important;
                        border-radius: 32px !important;
                        margin: 8px !important;
                        border: 1px solid rgba(255,255,255,0.05) !important;
                    }
                    .str-video__participants-list {
                        background: transparent !important;
                    }
                    .str-video__participant-list-item {
                        border-radius: 12px !important;
                        background: rgba(255,255,255,0.03) !important;
                        margin-bottom: 8px !important;
                    }
                `}</style>
            </StreamTheme>
        </StreamCall>
    )
}
