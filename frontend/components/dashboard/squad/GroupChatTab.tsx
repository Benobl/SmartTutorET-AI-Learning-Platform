"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

interface GroupChatTabProps {
    squadId: string
    socket: any
    messages: any[]
    onSendMessage: (text: string) => void
}

export function GroupChatTab({ squadId, socket, messages, onSendMessage }: GroupChatTabProps) {
    const [newMsg, setNewMsg] = useState("")
    const scrollRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        scrollRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!newMsg.trim()) return
        onSendMessage(newMsg)
        setNewMsg("")
    }

    return (
        <div className="flex flex-col h-[500px] bg-slate-900 rounded-3xl overflow-hidden border border-white/10">
            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-6 space-y-4 custom-scrollbar">
                {messages.length === 0 ? (
                    <div className="h-full flex flex-col items-center justify-center text-slate-500 space-y-2">
                        <MessageSquare className="w-8 h-8 opacity-20" />
                        <p className="text-[10px] font-bold uppercase tracking-[0.2em]">Matrix Silence... Start the transmission</p>
                    </div>
                ) : (
                    messages.map((msg, i) => (
                        <div key={i} className={cn(
                            "flex flex-col space-y-1 animate-in fade-in slide-in-from-bottom-2 duration-300",
                            msg.isOwn ? "items-end" : "items-start"
                        )}>
                            <div className="flex items-center gap-2 mb-1">
                                {!msg.isOwn && <span className="text-[8px] font-black text-sky-400 uppercase tracking-widest">{msg.senderName || "SQUAD_MEMBER"}</span>}
                                <span className="text-[8px] font-bold text-slate-500">{msg.time}</span>
                            </div>
                            <div className={cn(
                                "max-w-[80%] p-4 rounded-2xl text-sm font-medium",
                                msg.isOwn
                                    ? "bg-sky-600 text-white rounded-tr-none border border-sky-500/50"
                                    : "bg-white/5 text-slate-200 rounded-tl-none border border-white/5"
                            )}>
                                {msg.text}
                            </div>
                        </div>
                    ))
                )}
                <div ref={scrollRef} />
            </div>

            {/* Input Area */}
            <div className="p-4 bg-white/5 border-t border-white/10 flex gap-2">
                <Input
                    placeholder="Broadcast to squad..."
                    value={newMsg}
                    onChange={(e) => setNewMsg(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && handleSend()}
                    className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-sky-500/20"
                />
                <Button onClick={handleSend} className="h-12 w-12 rounded-xl bg-sky-600 hover:bg-sky-700 shrink-0 shadow-lg shadow-sky-600/20">
                    <Send className="w-4 h-4" />
                </Button>
            </div>
        </div>
    )
}

import { MessageSquare } from "lucide-react"
