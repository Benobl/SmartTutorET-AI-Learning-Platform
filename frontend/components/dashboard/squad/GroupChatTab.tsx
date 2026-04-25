"use client"

import React, { useEffect, useState } from "react"
// import {
//     Chat,
//     Channel,
//     ChannelHeader,
//     MessageList,
//     MessageInput,
//     Thread,
//     Window,
// } from "stream-chat-react"
// import "stream-chat-react/dist/css/v2/index.css"
// import { useStream } from "@/components/providers/StreamProvider"
import { MessageSquare } from "lucide-react"

interface GroupChatTabProps {
    squadId: string
}

export function GroupChatTab({ squadId }: GroupChatTabProps) {
    // const { chatClient } = useStream()
    const chatClient = null as any
    const [channel, setChannel] = useState<any>(null)

    useEffect(() => {
        if (!chatClient || !squadId) return

        // const setupChannel = async () => {
        //     const newChannel = chatClient.channel("messaging", squadId, {
        //         name: `Squad_${squadId}`,
        //     })
        //     await newChannel.watch()
        //     setChannel(newChannel)
        // }

        // setupChannel()

        return () => {
            if (channel) channel.stopWatching()
        }
    }, [chatClient, squadId])

    if (!chatClient || !channel) {
        return (
            <div className="flex flex-col h-[500px] items-center justify-center bg-slate-900 rounded-3xl border border-white/10 text-slate-500">
                <MessageSquare className="w-12 h-12 opacity-20 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-widest text-center px-8">Squad Chat is currently offline for maintenance. <br /> Use Whiteboard or Forum for sync.</p>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-[600px] bg-slate-900 rounded-3xl overflow-hidden border border-white/10 stream-chat-custom">
            {/* Stream Chat disabled temporarily */}
        </div>
    )
}
