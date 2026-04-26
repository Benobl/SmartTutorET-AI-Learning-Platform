"use client"

import { useState, useEffect, useRef } from "react"
import { Send, User, Loader2, ChevronLeft, Hash, Circle, MoreVertical, Check, CheckCheck, Smile, MessageCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { chatApi } from "@/lib/api"
import { initializeSocket } from "@/lib/socket"
import { getCurrentUser } from "@/lib/auth-utils"
import { cn } from "@/lib/utils"

interface DirectChatProps {
    otherUser: { _id: string; fullName: string; profilePic?: string }
    onBack?: () => void
}

interface ChatMessage {
    _id: string
    text: string
    senderId: string
    senderName: string
    createdAt: string
    status: 'sent' | 'delivered' | 'seen'
}

export function DirectChat({ otherUser, onBack }: DirectChatProps) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState("")
    const [loading, setLoading] = useState(true)
    const currentUser = getCurrentUser()
    const userId = currentUser?._id || currentUser?.id || ""
    const socketRef = useRef<any>(null)
    const bottomRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const socket = initializeSocket(userId)
        socketRef.current = socket

        const loadHistory = async () => {
            try {
                const res = await chatApi.getDirectHistory(otherUser._id)
                if (res.success) setMessages(res.data)
            } catch (e) {
                console.error("History load error:", e)
            } finally {
                setLoading(false)
            }
        }
        loadHistory()

        socket.on("newMessage", (msg: any) => {
            if (msg.senderId === otherUser._id || msg.receiverId === otherUser._id) {
                setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg])
                if (msg.senderId === otherUser._id) {
                    socket.emit("message-seen", { senderId: msg.senderId })
                }
            }
        })

        return () => { socket.off("newMessage") }
    }, [otherUser._id, userId])

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

    const handleSend = () => {
        if (!text.trim() || !socketRef.current) return
        const msgText = text.trim()

        const optimisticMsg: ChatMessage = {
            _id: Date.now().toString(),
            text: msgText,
            senderId: userId,
            senderName: currentUser?.fullName || "You",
            createdAt: new Date().toISOString(),
            status: 'sent'
        }
        setMessages(prev => [...prev, optimisticMsg])

        socketRef.current.emit("sendMessage", {
            receiverId: otherUser._id,
            message: msgText,
            senderName: currentUser?.fullName || "You"
        })
        setText("")
    }

    return (
        <div className="flex flex-col h-full bg-[#f4f7f9] relative overflow-hidden animate-in fade-in slide-in-from-right-4 duration-300">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-100 shadow-sm z-30">
                <Button variant="ghost" size="icon" onClick={onBack} className="rounded-xl h-9 w-9 text-slate-400 hover:text-slate-600 hover:bg-slate-50 lg:hidden -ml-2">
                    <ChevronLeft className="w-5 h-5" />
                </Button>
                <div className="relative">
                    <div className="w-10 h-10 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center text-sky-600 font-black overflow-hidden shadow-inner">
                        {otherUser.profilePic ? <img src={otherUser.profilePic} className="w-full h-full object-cover" /> : otherUser.fullName[0]}
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 tracking-tight">{otherUser.fullName}</span>
                    <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <Button variant="ghost" size="icon" className="w-8 h-8 rounded-lg text-slate-400"><MoreVertical className="w-4 h-4" /></Button>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 pattern-dots">
                {loading ? (
                    <div className="flex items-center justify-center h-full"><Loader2 className="w-8 h-8 text-sky-400 animate-spin" /></div>
                ) : messages.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-40">
                        <div className="w-20 h-20 rounded-[40px] bg-white shadow-xl flex items-center justify-center text-slate-300">
                            <MessageCircle className="w-8 h-8" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-widest">No transmissions matched</p>
                    </div>
                ) : (
                    messages.map((msg) => {
                        const isMe = msg.senderId === userId
                        return (
                            <div key={msg._id} className={cn("flex animate-in fade-in duration-300", isMe ? "justify-end" : "justify-start")}>
                                <div className={cn(
                                    "relative px-4 py-2.5 rounded-2xl shadow-sm max-w-[85%] md:max-w-[70%]",
                                    isMe ? "bg-sky-600 text-white rounded-br-none soft-shadow-sky" : "bg-white text-slate-700 rounded-bl-none border border-slate-100"
                                )}>
                                    <p className="text-[14px] leading-relaxed font-medium whitespace-pre-wrap">{msg.text}</p>
                                    <div className={cn("flex items-center gap-1.5 mt-1 justify-end text-[8px] font-bold", isMe ? "text-white/60" : "text-slate-400")}>
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                        {isMe && (msg.status === 'seen' ? <CheckCheck className="w-2.5 h-2.5 text-emerald-300" /> : <Check className="w-2.5 h-2.5" />)}
                                    </div>
                                </div>
                            </div>
                        )
                    })
                )}
                <div ref={bottomRef} />
            </div>

            {/* Input Overlay */}
            <div className="bg-white border-t border-slate-100 p-4 shadow-2xl z-40">
                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 relative group">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Type a private message..."
                            className="w-full min-h-[44px] max-h-40 px-5 py-3 bg-slate-50 rounded-2xl text-[14px] text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 focus:bg-white focus:border-sky-300 focus:ring-4 focus:ring-sky-500/5 transition-all resize-none"
                            rows={1}
                        />
                        <Smile className="absolute right-4 bottom-3 w-5 h-5 text-slate-300 hover:text-sky-500 cursor-pointer transition-colors" />
                    </div>
                    <button onClick={handleSend} disabled={!text.trim()} className="w-12 h-12 shrink-0 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all shadow-lg shadow-sky-600/30">
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

            <style jsx global>{`
                .pattern-dots {
                    background-image: radial-gradient(#e2e8f0 0.8px, transparent 0.8px);
                    background-size: 24px 24px;
                }
                .soft-shadow-sky {
                    box-shadow: 0 4px 14px 0 rgba(14, 165, 233, 0.39);
                }
            `}</style>
        </div>
    )
}
