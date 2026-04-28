"use client"

import React, { useEffect, useState, useRef } from "react"
import { useStream } from "@/components/providers/StreamProvider"
import { Loader2, Hash, Send, Check, CheckCheck, Reply, X, Smile, MoreVertical, MessageCircle, Pencil, Trash2 } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import { initializeSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"
import { chatApi } from "@/lib/api"
import { DirectChat } from "../chat/DirectChat"
import { toast } from "@/hooks/use-toast"
import { Button } from "@/components/ui/button"

interface GroupChatTabProps {
    squadId: string
    members?: any[]
}

interface ChatMessage {
    _id: string
    text: string
    senderId: string
    senderName: string
    senderPic?: string
    createdAt: string
    status: 'sent' | 'delivered' | 'seen'
    replyTo?: string
    replyToData?: { text: string; senderName: string }
    reactions?: { user: string; emoji: string; userName: string }[]
    isEdited?: boolean
    isDeleted?: boolean
}

// ─── Socket Chat View ───
function SocketChatView({ squadId }: { squadId: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState("")
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const [connectionStatus, setConnectionStatus] = useState<"connected" | "connecting" | "disconnected">("connecting")
    const [replyingTo, setReplyingTo] = useState<ChatMessage | null>(null)
    const [editingMsg, setEditingMsg] = useState<ChatMessage | null>(null)
    const [editText, setEditText] = useState("")
    const [openMenuId, setOpenMenuId] = useState<string | null>(null)

    const currentUser = getCurrentUser()
    const userId = (currentUser?._id || currentUser?.id || "") as string
    const userName = currentUser?.fullName || "You"

    const bottomRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<any>(null)
    const editInputRef = useRef<HTMLTextAreaElement>(null)

    useEffect(() => {
        if (!userId) return
        const socket = initializeSocket(userId)
        socketRef.current = socket

        const join = () => {
            socket.emit("join-squad", squadId)
            setConnectionStatus("connected")
        }

        if (socket.connected) join()
        socket.on("connect", join)
        socket.on("disconnect", () => setConnectionStatus("disconnected"))

        chatApi.getSquadHistory(squadId).then(res => { if (res.success) setMessages(res.data) })

        socket.on("new-squad-message", (msg: any) => {
            setMessages(prev => prev.find(m => m._id === msg._id) ? prev : [...prev, msg])
            if (msg.senderId !== userId) socket.emit("message-seen", { senderId: msg.senderId })
        })

        socket.on("getOnlineUsers", (users: string[]) => setOnlineUsers(users))
        socket.on("update-message", (updatedMsg: any) => {
            setMessages(prev => prev.map(m => m._id === updatedMsg._id ? { ...m, ...updatedMsg } : m))
        })

        return () => {
            socket.off("connect", join)
            socket.off("new-squad-message")
            socket.off("getOnlineUsers")
            socket.off("update-message")
        }
    }, [squadId, userId])

    useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: "smooth" }) }, [messages])

    // Close context menu when clicking outside
    useEffect(() => {
        const handler = () => setOpenMenuId(null)
        document.addEventListener("click", handler)
        return () => document.removeEventListener("click", handler)
    }, [])

    const handleSend = () => {
        if (!text.trim() || !socketRef.current) return
        socketRef.current.emit("send-squad-message", {
            squadId,
            message: text.trim(),
            senderName: userName,
            senderPic: currentUser?.profilePic || "",
            replyTo: replyingTo?._id || null,
            replyToData: replyingTo ? { text: replyingTo.text, senderName: replyingTo.senderName } : null
        })
        setText(""); setReplyingTo(null)
    }

    const handleReaction = (messageId: string, emoji: string) => {
        socketRef.current?.emit("message-reaction", { messageId, emoji, squadId })
    }

    const startEdit = (msg: ChatMessage) => {
        setEditingMsg(msg)
        setEditText(msg.text)
        setOpenMenuId(null)
        setTimeout(() => editInputRef.current?.focus(), 50)
    }

    const cancelEdit = () => { setEditingMsg(null); setEditText("") }

    const submitEdit = () => {
        if (!editText.trim() || !editingMsg || !socketRef.current) return
        socketRef.current.emit("edit-squad-message", {
            messageId: editingMsg._id,
            newText: editText.trim(),
            squadId
        })
        cancelEdit()
    }

    const handleDelete = (msgId: string) => {
        if (!socketRef.current) return
        socketRef.current.emit("delete-squad-message", { messageId: msgId, squadId })
        setOpenMenuId(null)
    }

    return (
        <div className="flex flex-col h-full bg-[#f4f7f9] relative overflow-hidden">
            {/* Header */}
            <div className="flex items-center gap-3 px-6 py-3 bg-white border-b border-slate-100 shadow-sm z-30">
                <div className="relative">
                    <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all shadow-inner", connectionStatus === "connected" ? "bg-sky-50 text-sky-600" : "bg-rose-50 text-rose-500")}>
                        <Hash className="w-5 h-5" />
                    </div>
                    <span className={cn("absolute -bottom-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm", connectionStatus === "connected" ? "bg-emerald-500" : "bg-rose-500 animate-pulse")} />
                </div>
                <div className="flex flex-col">
                    <span className="text-sm font-black text-slate-800 tracking-tight">Squad Learning Hub</span>
                    <div className="flex items-center gap-2">
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">{onlineUsers.length} members active</span>
                        {connectionStatus !== "connected" && <span className="w-1.5 h-1.5 bg-rose-400 rounded-full animate-ping" />}
                    </div>
                </div>
            </div>

            {/* Messages Area */}
            <div className="flex-1 overflow-y-auto p-4 md:p-6 space-y-6 scrollbar-hide pattern-dots">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center pb-20">
                        <div className="w-20 h-20 rounded-[40px] bg-white shadow-xl shadow-slate-200/50 flex items-center justify-center text-slate-300">
                            <Send className="w-8 h-8 -rotate-12 translate-x-1 -translate-y-1" />
                        </div>
                        <p className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Start the group wisdom</p>
                    </div>
                )}

                {messages.map((msg) => {
                    const isMe = msg.senderId === userId
                    const isBeingEdited = editingMsg?._id === msg._id

                    return (
                        <div key={msg._id} className={cn("flex gap-3 items-end animate-in fade-in slide-in-from-bottom-2 duration-300", isMe ? "flex-row-reverse" : "flex-row")}>
                            {/* Avatar */}
                            <div className="w-9 shrink-0">
                                {!isMe && (
                                    <div className="w-9 h-9 rounded-xl bg-white shadow-md flex items-center justify-center text-[10px] font-black text-sky-600 border border-slate-100 overflow-hidden ring-2 ring-white">
                                        {msg.senderPic ? (
                                            <img src={msg.senderPic} alt="" className="w-full h-full object-cover" />
                                        ) : (
                                            <span className="uppercase">{msg.senderName?.substring(0, 2) || "S"}</span>
                                        )}
                                    </div>
                                )}
                            </div>

                            <div className={cn("flex flex-col max-w-[80%] md:max-w-[70%]", isMe ? "items-end" : "items-start")}>
                                {!isMe && (
                                    <span className="text-[11px] font-black text-sky-600 mb-1 ml-1 uppercase tracking-wider flex items-center gap-2">
                                        {msg.senderName || "Student"}
                                        <span className={cn("w-1.5 h-1.5 rounded-full", connectionStatus === "connected" ? "bg-emerald-400 shadow-[0_0_8px_rgba(52,211,153,0.6)]" : "bg-slate-200")} />
                                    </span>
                                )}

                                {/* Deleted message */}
                                {msg.isDeleted ? (
                                    <div className={cn(
                                        "px-4 py-2 rounded-2xl text-sm italic flex items-center gap-2",
                                        isMe ? "bg-sky-100 text-sky-400 rounded-br-sm" : "bg-slate-100 text-slate-400 rounded-bl-sm"
                                    )}>
                                        <Trash2 className="w-3 h-3 shrink-0" />
                                        This message was deleted
                                    </div>
                                ) : isBeingEdited ? (
                                    /* Inline Edit Mode */
                                    <div className="w-full min-w-[260px] bg-white rounded-2xl border-2 border-sky-400 shadow-xl p-3 space-y-2">
                                        <textarea
                                            ref={editInputRef}
                                            value={editText}
                                            onChange={e => setEditText(e.target.value)}
                                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), submitEdit())}
                                            className="w-full text-[14px] text-slate-800 outline-none resize-none bg-transparent leading-relaxed"
                                            rows={2}
                                        />
                                        <div className="flex items-center justify-end gap-2 pt-1 border-t border-slate-100">
                                            <button onClick={cancelEdit} className="text-[10px] font-black text-slate-400 hover:text-slate-600 uppercase tracking-widest px-2 py-1">Cancel</button>
                                            <button onClick={submitEdit} className="text-[10px] font-black text-white uppercase tracking-widest bg-sky-600 hover:bg-sky-700 px-3 py-1.5 rounded-lg transition-all">Save</button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={cn(
                                        "relative group px-4 py-3 rounded-2xl shadow-sm transition-all hover:shadow-md",
                                        isMe
                                            ? "bg-sky-600 text-white rounded-br-sm soft-shadow-sky"
                                            : "bg-white text-slate-700 rounded-bl-sm border border-slate-100"
                                    )}>
                                        {/* Reply Thread */}
                                        {msg.replyToData && (
                                            <div className={cn(
                                                "mb-2.5 p-2 rounded-xl text-[11px] border-l-[3px] transition-all",
                                                isMe ? "bg-white/10 border-white/40 text-white/90" : "bg-slate-50 border-sky-400 text-slate-500"
                                            )}>
                                                <p className="font-black uppercase text-[8px] mb-0.5 tracking-tight">{msg.replyToData.senderName}</p>
                                                <p className="truncate italic line-clamp-1">{msg.replyToData.text}</p>
                                            </div>
                                        )}

                                        <p className="text-[15px] leading-relaxed font-medium whitespace-pre-wrap break-words">{msg.text}</p>

                                        <div className={cn(
                                            "flex items-center gap-1.5 mt-1.5 justify-end text-[9px] font-bold",
                                            isMe ? "text-white/60" : "text-slate-400"
                                        )}>
                                            {msg.isEdited && <span className="italic">edited</span>}
                                            {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                            {isMe && (msg.status === 'seen' ? <CheckCheck className="w-3 h-3 text-emerald-300" /> : <Check className="w-3 h-3" />)}
                                        </div>

                                        {/* Reactions */}
                                        {msg.reactions && msg.reactions.length > 0 && (
                                            <div className="absolute -bottom-3 left-2 flex flex-wrap gap-1 z-10">
                                                {Array.from(new Set(msg.reactions.map(r => r.emoji))).map(emoji => {
                                                    const reactors = msg.reactions?.filter(r => r.emoji === emoji).map(r => r.userName).join(", ");
                                                    return (
                                                        <button
                                                            key={emoji}
                                                            onClick={() => handleReaction(msg._id, emoji)}
                                                            title={`Reacted by: ${reactors}`}
                                                            className="bg-white/95 backdrop-blur-md px-2 py-0.5 rounded-full border border-slate-100 shadow-sm text-[11px] hover:scale-110 transition-all active:scale-95 group/react flex items-center gap-1"
                                                        >
                                                            <span>{emoji}</span>
                                                            <span className="text-[9px] font-black text-slate-500">{msg.reactions?.filter(r => r.emoji === emoji).length}</span>
                                                        </button>
                                                    );
                                                })}
                                            </div>
                                        )}

                                        {/* Hover Action Bar */}
                                        <div className={cn(
                                            "absolute top-0 opacity-0 group-hover:opacity-100 transition-all flex items-center bg-white/95 backdrop-blur-sm rounded-full shadow-lg border border-slate-100 p-0.5 ring-1 ring-black/5",
                                            isMe ? "right-[102%]" : "left-[102%]"
                                        )}>
                                            <Button variant="ghost" size="icon" className="w-7 h-7 rounded-full text-slate-400 hover:text-sky-600" onClick={() => setReplyingTo(msg)}><Reply className="w-3.5 h-3.5" /></Button>
                                            <button onClick={() => handleReaction(msg._id, "👍")} className="w-7 h-7 flex items-center justify-center text-xs hover:bg-slate-50 rounded-full">👍</button>
                                            <button onClick={() => handleReaction(msg._id, "🔥")} className="w-7 h-7 flex items-center justify-center text-xs hover:bg-slate-50 rounded-full">🔥</button>
                                            <button onClick={() => handleReaction(msg._id, "❤️")} className="w-7 h-7 flex items-center justify-center text-xs hover:bg-slate-50 rounded-full">❤️</button>
                                            {isMe && (
                                                <>
                                                    <div className="w-px h-4 bg-slate-100 mx-0.5" />
                                                    <button
                                                        onClick={() => startEdit(msg)}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-indigo-50 rounded-full text-slate-400 hover:text-indigo-500 transition-colors"
                                                        title="Edit message"
                                                    >
                                                        <Pencil className="w-3 h-3" />
                                                    </button>
                                                    <button
                                                        onClick={() => handleDelete(msg._id)}
                                                        className="w-7 h-7 flex items-center justify-center hover:bg-rose-50 rounded-full text-slate-400 hover:text-rose-500 transition-colors"
                                                        title="Delete message"
                                                    >
                                                        <Trash2 className="w-3 h-3" />
                                                    </button>
                                                </>
                                            )}
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Station */}
            <div className="bg-white border-t border-slate-100 p-4 md:p-6 shadow-2xl relative z-40">
                {replyingTo && (
                    <div className="absolute bottom-full left-0 right-0 bg-white/90 backdrop-blur-md border-t border-slate-100 p-3 flex items-center justify-between animate-in slide-in-from-bottom-2">
                        <div className="flex items-center gap-3 min-w-0">
                            <div className="w-1 bg-sky-500 h-8 rounded-full" />
                            <div className="min-w-0">
                                <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest">Replying to {replyingTo.senderName}</p>
                                <p className="text-xs text-slate-500 truncate">{replyingTo.text}</p>
                            </div>
                        </div>
                        <button onClick={() => setReplyingTo(null)} className="w-8 h-8 rounded-full hover:bg-rose-50 text-slate-400 hover:text-rose-500 flex items-center justify-center transition-all"><X className="w-4 h-4" /></button>
                    </div>
                )}

                <div className="max-w-4xl mx-auto flex items-end gap-3">
                    <div className="flex-1 relative group">
                        <textarea
                            value={text}
                            onChange={e => setText(e.target.value)}
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                            placeholder="Type wisdom here..."
                            className="w-full min-h-[44px] max-h-40 px-5 py-3 bg-slate-50 rounded-2xl text-[15px] text-slate-800 placeholder:text-slate-400 outline-none border border-slate-200 focus:bg-white focus:border-sky-300 focus:ring-4 focus:ring-sky-500/5 transition-all resize-none"
                            rows={1}
                            style={{ height: 'auto' }}
                            onInput={(e) => {
                                const t = e.target as HTMLTextAreaElement;
                                t.style.height = 'auto';
                                t.style.height = `${t.scrollHeight}px`;
                            }}
                        />
                        <Smile className="absolute right-4 bottom-3 w-5 h-5 text-slate-300 hover:text-sky-500 cursor-pointer transition-colors" />
                    </div>
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="w-12 h-12 shrink-0 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-sky-600/30"
                    >
                        <Send className="w-5 h-5" />
                    </button>
                </div>
            </div>

        </div>
    )
}

export function GroupChatTab({ squadId, members = [] }: GroupChatTabProps) {
    const [selectedUserForDM, setSelectedUserForDM] = useState<any>(null)
    const currentUser = getCurrentUser()

    if (selectedUserForDM) return <DirectChat otherUser={selectedUserForDM} onBack={() => setSelectedUserForDM(null)} />

    return (
        <div className="flex h-full overflow-hidden">
            <div className="flex-1 flex flex-col min-w-0 h-full">
                <SocketChatView squadId={squadId} />
            </div>

            {/* Members Sidebar */}
            <div className="hidden lg:flex w-72 border-l border-slate-100 flex-col bg-[#fdfdfe] shrink-0">
                <div className="p-5 border-b border-slate-100 bg-white sticky top-0 z-10">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em] mb-2">Class Students</h3>
                    <div className="flex items-center gap-2">
                        <div className="flex -space-x-2">
                            {members.slice(0, 4).map((m: any, i: number) => (
                                <div key={i} className="w-6 h-6 rounded-full border-2 border-white bg-slate-100 overflow-hidden shadow-sm">
                                    <img src={(m.profilePic || m.pic) || `https://ui-avatars.com/api/?name=${encodeURIComponent(m.fullName || m.name || "S")}&background=random&size=40`} alt="" className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>
                        <span className="text-[10px] text-slate-500 font-bold uppercase tracking-tight">{members.length} enrolled</span>
                    </div>
                </div>
                <div className="flex-1 overflow-y-auto p-3 space-y-1 scrollbar-hide">
                    {members.length === 0 && (
                        <div className="flex flex-col items-center justify-center h-32 gap-2 text-slate-300">
                            <span className="text-2xl">👥</span>
                            <p className="text-[10px] font-bold uppercase tracking-widest">No members yet</p>
                        </div>
                    )}
                    {members.map((member: any) => {
                        const mid = (member._id || member.id || member) as string
                        const isMe = mid === (currentUser?._id || currentUser?.id)
                        const name = member.fullName || member.name || "Scholar"
                        const pic = member.profilePic || ""
                        const grade = member.grade ? `Grade ${member.grade}` : (member.role || "Member")

                        return (
                            <button
                                key={mid}
                                onClick={() => !isMe && setSelectedUserForDM(member)}
                                className={cn(
                                    "w-full flex items-center gap-3 p-2.5 rounded-2xl transition-all group relative border border-transparent",
                                    isMe
                                        ? "bg-sky-50/60 border-sky-100 cursor-default"
                                        : "hover:bg-white hover:shadow-lg hover:shadow-slate-200/60 hover:-translate-y-0.5 cursor-pointer"
                                )}
                            >
                                <div className="relative shrink-0">
                                    <div className="w-10 h-10 rounded-[14px] bg-gradient-to-br from-slate-50 to-white border border-slate-100 flex items-center justify-center text-sky-600 font-black overflow-hidden shadow-inner group-hover:scale-105 transition-transform">
                                        {pic ? (
                                            <img src={pic} className="w-full h-full object-cover" alt={name} />
                                        ) : (
                                            <span className="text-sm uppercase">{name[0]}</span>
                                        )}
                                    </div>
                                    <span className={cn(
                                        "absolute -top-0.5 -right-0.5 w-3 h-3 rounded-full border-2 border-white shadow-sm",
                                        isMe ? "bg-sky-500" : "bg-emerald-400"
                                    )} />
                                </div>
                                <div className="flex flex-col items-start min-w-0 flex-1">
                                    <span className="text-[12px] font-black text-slate-800 truncate w-full flex items-center gap-1">
                                        {name}
                                        {isMe && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200 tracking-tighter ml-auto shrink-0">YOU</span>}
                                    </span>
                                    <span className="text-[9px] text-slate-400 font-semibold uppercase tracking-tight whitespace-nowrap">{grade}</span>
                                </div>
                                {!isMe && (
                                    <div className="opacity-0 group-hover:opacity-100 transition-all text-sky-400 shrink-0">
                                        <MessageCircle className="w-4 h-4" />
                                    </div>
                                )}
                            </button>
                        )
                    })}
                </div>
            </div>
        </div>
    )
}
