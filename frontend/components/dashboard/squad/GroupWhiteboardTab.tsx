"use client"

import { LiveWhiteboard } from "../stream/LiveWhiteboard"

interface GroupWhiteboardTabProps {
    squadId: string
    socket: any
}

export function GroupWhiteboardTab({ squadId, socket }: GroupWhiteboardTabProps) {
    return (
        <div className="flex flex-col h-[600px] bg-slate-50 rounded-3xl overflow-hidden border border-slate-200 relative">
            <LiveWhiteboard roomId={`squad_${squadId}`} socket={socket} isHost={true} />
        </div>
    )
}
