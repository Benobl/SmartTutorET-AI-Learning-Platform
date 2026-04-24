"use client"

import { useState } from "react"
import { tutorMessages } from "@/lib/mock-data"
import { cn } from "@/lib/utils"
import { Send, MessageSquare } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TeacherMessagesPage() {
    const [selectedThread, setSelectedThread] = useState<number>(tutorMessages[0].id)
    const [reply, setReply] = useState("")
    const [sentReplies, setSentReplies] = useState<Record<number, string[]>>({})

    const thread = tutorMessages.find(m => m.id === selectedThread)!
    const allMessages = [
        ...thread.messages,
        ...(sentReplies[selectedThread] || []).map((text, i) => ({ id: 1000 + i, from: "teacher" as const, text, time: "Just now" })),
    ]

    const handleSend = () => {
        if (!reply.trim()) return
        setSentReplies(prev => ({ ...prev, [selectedThread]: [...(prev[selectedThread] || []), reply] }))
        setReply("")
    }

    return (
        <div className="animate-in fade-in slide-in-from-bottom-4 duration-700 h-[calc(100vh-180px)] flex flex-col">
            <div className="mb-6">
                <h1 className="text-3xl font-black text-slate-900 mb-1">Messages</h1>
                <p className="text-slate-500 text-sm font-medium">Communicate directly with your students.</p>
            </div>

            <div className="flex flex-1 gap-6 min-h-0">
                {/* Thread List */}
                <div className="w-80 shrink-0 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col">
                    <div className="p-4 border-b border-slate-100">
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">Conversations</p>
                    </div>
                    <div className="overflow-y-auto flex-1">
                        {tutorMessages.map(m => (
                            <button
                                key={m.id}
                                onClick={() => setSelectedThread(m.id)}
                                className={cn(
                                    "w-full flex items-start gap-3 p-4 text-left border-b border-slate-50 transition-colors hover:bg-slate-50",
                                    selectedThread === m.id && "bg-sky-50 border-l-2 border-l-sky-500"
                                )}
                            >
                                <div className="w-10 h-10 rounded-2xl bg-sky-100 border border-sky-100 flex items-center justify-center shrink-0">
                                    <span className="text-xs font-black text-sky-600">{m.initials}</span>
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center justify-between mb-0.5">
                                        <p className="font-bold text-slate-800 text-sm truncate">{m.studentName}</p>
                                        <span className="text-[10px] text-slate-400 shrink-0 ml-2">{m.time}</span>
                                    </div>
                                    <p className="text-xs text-slate-400 font-medium truncate">{m.lastMessage}</p>
                                    {m.unread > 0 && (
                                        <span className="inline-flex items-center justify-center w-5 h-5 rounded-full bg-sky-500 text-white text-[10px] font-black mt-1">{m.unread}</span>
                                    )}
                                </div>
                            </button>
                        ))}
                    </div>
                </div>

                {/* Chat Window */}
                <div className="flex-1 bg-white rounded-3xl border border-slate-200 shadow-sm overflow-hidden flex flex-col min-w-0">
                    {/* Chat Header */}
                    <div className="px-6 py-4 border-b border-slate-100 flex items-center gap-4">
                        <div className="w-10 h-10 rounded-2xl bg-sky-100 flex items-center justify-center">
                            <span className="text-sm font-black text-sky-600">{thread.initials}</span>
                        </div>
                        <div>
                            <p className="font-black text-slate-900">{thread.studentName}</p>
                            <p className="text-xs text-slate-400 font-medium">{thread.course}</p>
                        </div>
                    </div>

                    {/* Messages */}
                    <div className="flex-1 overflow-y-auto p-6 space-y-4">
                        {allMessages.map(msg => (
                            <div key={msg.id} className={cn("flex", msg.from === "teacher" ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "max-w-sm px-4 py-3 rounded-2xl shadow-sm text-sm",
                                    msg.from === "teacher"
                                        ? "bg-sky-600 text-white rounded-br-none"
                                        : "bg-slate-100 text-slate-800 rounded-bl-none border border-slate-200"
                                )}>
                                    <p className="leading-relaxed">{msg.text}</p>
                                    <p className={cn("text-[10px] mt-1.5", msg.from === "teacher" ? "text-sky-200" : "text-slate-400")}>{msg.time}</p>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Reply Input */}
                    <div className="p-4 border-t border-slate-100 flex gap-3">
                        <Input
                            placeholder="Type a reply..."
                            value={reply}
                            onChange={e => setReply(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && handleSend()}
                            className="rounded-xl h-11 flex-1"
                        />
                        <button
                            onClick={handleSend}
                            disabled={!reply.trim()}
                            className="w-11 h-11 rounded-xl bg-sky-600 hover:bg-sky-500 disabled:opacity-40 disabled:cursor-not-allowed text-white flex items-center justify-center transition-colors shadow-md shadow-sky-600/20"
                        >
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
