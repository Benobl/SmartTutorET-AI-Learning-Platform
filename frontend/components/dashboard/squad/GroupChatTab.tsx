"use client"

import React, { useEffect, useState, useRef, useCallback } from "react"
import {
    Chat,
    Channel,
    MessageList,
    MessageInput,
    Window,
    useMessageInputContext,
    MessageStatus,
} from "stream-chat-react"
import "stream-chat-react/dist/css/v2/index.css"
import { useStream } from "@/components/providers/StreamProvider"
import { Loader2, Hash, AlertCircle, Send, Check, CheckCheck, Circle, User } from "lucide-react"
import { getCurrentUser } from "@/lib/auth-utils"
import { initializeSocket } from "@/lib/socket"
import { cn } from "@/lib/utils"

interface GroupChatTabProps {
    squadId: string
}

// ─── Custom Stream Send Button ───
function StreamSendButton() {
    const { handleSubmit } = useMessageInputContext()
    return (
        <button
            type="button"
            onClick={handleSubmit}
            className="w-9 h-9 shrink-0 rounded-xl bg-sky-600 hover:bg-sky-700 active:scale-95 text-white flex items-center justify-center transition-all"
            aria-label="Send"
        >
            <Send className="w-4 h-4" />
        </button>
    )
}

// ─── Stream Chat (if available) ───
function StreamChatView({ squadId, chatClient, onFail }: { squadId: string; chatClient: any; onFail?: () => void }) {
    const [channel, setChannel] = useState<any>(null)
    const [error, setError] = useState<string | null>(null)
    const currentUser = getCurrentUser()

    useEffect(() => {
        let mounted = true
        if (!chatClient || !squadId || !currentUser) return

        const channelId = `squad-${squadId}`

        const setup = async () => {
            try {
                const userId = (currentUser._id || currentUser.id)?.toString()
                const ch = chatClient.channel("messaging", channelId, {
                    name: "Squad Chat",
                    members: [userId],
                })

                await ch.watch()
                if (mounted) {
                    setChannel(ch)
                    setError(null)
                }
            } catch (e: any) {
                console.error("[StreamChatView] Error:", e)
                if (mounted) {
                    setError(e.message || "Failed to connect")
                    // If rate limited or permission error, trigger fallback
                    if (e.code === 9 || e.code === 17 || e.message?.includes("Too many requests")) {
                        setTimeout(() => { if (mounted) onFail?.() }, 1000)
                    }
                }
            }
        }

        setup()
        return () => { mounted = false }
    }, [chatClient, squadId, currentUser?.id || currentUser?._id])

    if (error) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-3 bg-white px-6 text-center">
                <AlertCircle className="w-10 h-10 text-rose-300" />
                <p className="text-sm font-bold text-slate-600">Chat Connection Error</p>
                <p className="text-xs text-slate-400 max-w-xs">{error}</p>
                <div className="mt-4 p-3 bg-slate-50 rounded-xl border border-slate-100 text-[10px] text-slate-400">
                    If this persists, the Stream app settings might need "user" ReadChannel permissions.
                </div>
            </div>
        )
    }

    if (!channel) {
        return (
            <div className="flex flex-col h-full items-center justify-center gap-3 bg-white">
                <Loader2 className="w-8 h-8 text-sky-400 animate-spin" />
                <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">Connecting to chat...</p>
            </div>
        )
    }

    return (
        <div className="stream-squad-chat flex flex-col h-full bg-white overflow-hidden">
            <Chat client={chatClient} theme="str-chat__theme-light">
                <Channel channel={channel} SendButton={StreamSendButton}>
                    <Window>
                        <div className="flex items-center gap-2 px-4 py-2.5 border-b border-slate-100 bg-white shrink-0">
                            <Hash className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-xs font-black text-slate-600 uppercase tracking-wide">squad-chat</span>
                            <span className="ml-auto flex items-center gap-1.5 text-[10px] font-bold text-emerald-500">
                                <span className="w-1.5 h-1.5 bg-emerald-400 rounded-full" /> Live
                            </span>
                        </div>
                        <div className="flex-1 min-h-0 overflow-y-auto">
                            <MessageList />
                        </div>
                        <div className="shrink-0 px-3 py-2 border-t border-slate-100 bg-white">
                            <MessageInput focus />
                        </div>
                    </Window>
                </Channel>
            </Chat>

            <style jsx global>{`
                .stream-squad-chat .str-chat {
                    height: 100%; display: flex; flex-direction: column;
                    background: #f0f2f5 !important; border: none !important; font-family: inherit !important;
                }
                .stream-squad-chat .str-chat__container,
                .stream-squad-chat .str-chat__main-panel {
                    flex: 1; min-height: 0; display: flex; flex-direction: column; padding: 0 !important;
                }
                .stream-squad-chat .str-chat__message-input {
                    padding: 12px 16px !important;
                    background: white !important; 
                    box-shadow: 0 -4px 12px rgba(0,0,0,0.03) !important;
                    position: sticky; bottom: 0; z-index: 10;
                }
                .stream-squad-chat .str-chat__message-input-inner {
                    gap: 12px; align-items: flex-end; background: transparent !important;
                    padding: 0 !important; border: none !important;
                }
                .stream-squad-chat .str-chat__textarea textarea {
                    background: #f1f3f4 !important; border: 1px solid #e8eaed !important;
                    border-radius: 20px !important; font-size: 15px !important;
                    padding: 10px 18px !important; box-shadow: none !important;
                    transition: all 0.2s ease;
                    max-height: 150px !important;
                    line-height: 1.5 !important;
                }
                .stream-squad-chat .str-chat__textarea textarea:focus {
                    background: white !important; border-color: #0ea5e9 !important;
                }
                
                .stream-squad-chat .str-chat__message-list {
                    background: #e5e7eb/40 !important; 
                    padding: 24px 20px !important;
                    scrollbar-width: thin;
                }
                /* Bubble Fix: Prevent vertical text */
                .stream-squad-chat .str-chat__message-bubble {
                    border-radius: 18px 18px 18px 4px !important;
                    font-size: 15px !important; 
                    display: block !important;
                    min-width: 80px !important;
                    max-width: 85% !important;
                    width: auto !important;
                    border: none !important; 
                    padding: 9px 13px !important;
                    position: relative;
                    word-wrap: break-word !important;
                    white-space: normal !important;
                }
                .stream-squad-chat .str-chat__message--me .str-chat__message-bubble {
                    background: #0ea5e9 !important; color: white !important;
                    border-radius: 18px 18px 4px 18px !important;
                    box-shadow: 0 1px 2px rgba(0,0,0,0.12) !important;
                    margin-left: auto;
                }
                .stream-squad-chat .str-chat__message-text-inner {
                    padding-bottom: 4px;
                    display: inline-block !important;
                    width: 100% !important;
                }
                .stream-squad-chat .str-chat__li--me { justify-content: flex-end; }
                .stream-squad-chat .str-chat__avatar { border-radius: 50% !important; }
                
                /* Telegram style status inside bubble */
                .stream-squad-chat .str-chat__message-simple-status { 
                    float: right;
                    margin-top: 2px;
                    margin-left: 8px;
                    font-size: 10px;
                    opacity: 0.7;
                }
                
                @media (max-width: 640px) {
                    .stream-squad-chat .str-chat__message-bubble { max-width: 90% !important; }
                }
            `}</style>
        </div>
    )
}

// ─── Socket Chat Fallback ───
interface ChatMessage {
    _id: string
    text: string
    senderId: string
    senderName: string
    createdAt: string
    status: 'sent' | 'delivered' | 'seen'
}

function SocketChatView({ squadId }: { squadId: string }) {
    const [messages, setMessages] = useState<ChatMessage[]>([])
    const [text, setText] = useState("")
    const [onlineUsers, setOnlineUsers] = useState<string[]>([])
    const currentUser = getCurrentUser()
    const userId = (currentUser?._id || currentUser?.id || "") as string
    const userName = currentUser?.fullName || "You"
    const bottomRef = useRef<HTMLDivElement>(null)
    const socketRef = useRef<any>(null)

    useEffect(() => {
        const socket = initializeSocket(userId)
        socketRef.current = socket

        // Join the squad room
        socket.emit("join-squad", squadId)

        // Listen for messages
        socket.on("new-squad-message", (msg: any) => {
            setMessages(prev => [...prev, {
                _id: msg._id || Date.now().toString(),
                text: msg.text || msg.content,
                senderId: msg.senderId,
                senderName: msg.senderName || "Member",
                createdAt: msg.createdAt || new Date().toISOString(),
                status: 'delivered'
            }])
            // Send acknowledgement
            socket.emit("message-seen", { senderId: msg.senderId })
        })

        socket.on("getOnlineUsers", (users: string[]) => {
            setOnlineUsers(users)
        })

        socket.on("message-seen", (data: any) => {
            setMessages(prev => prev.map(m => m.senderId === userId ? { ...m, status: 'seen' } : m))
        })

        return () => {
            socket.off("new-squad-message")
            socket.off("getOnlineUsers")
            socket.off("message-seen")
        }
    }, [squadId, userId])

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: "smooth" })
    }, [messages])

    const handleSend = () => {
        if (!text.trim() || !socketRef.current) return

        const msgId = Date.now().toString()
        const msg: ChatMessage = {
            _id: msgId,
            text: text.trim(),
            senderId: userId,
            senderName: userName,
            createdAt: new Date().toISOString(),
            status: 'sent'
        }

        // Emit to socket
        socketRef.current.emit("send-squad-message", {
            squadId,
            message: { ...msg, text: msg.text }, // Use text for backward compatibility
        })

        // Add locally
        setMessages(prev => [...prev, msg])
        setText("")

        // Simulate delivered after short delay
        setTimeout(() => {
            setMessages(prev => prev.map(m => m._id === msgId ? { ...m, status: 'delivered' } : m))
        }, 800)
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Header */}
            <div className="flex items-center gap-3 px-5 py-3 border-b border-slate-100 bg-white/80 backdrop-blur-md sticky top-0 z-10 shrink-0">
                <div className="relative">
                    <div className="w-8 h-8 rounded-xl bg-sky-50 flex items-center justify-center text-sky-600">
                        <Hash className="w-4 h-4" />
                    </div>
                    <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-emerald-500 rounded-full border-2 border-white shadow-sm" />
                </div>
                <div className="flex flex-col">
                    <span className="text-[13px] font-bold text-slate-800 tracking-tight">Squad Chat</span>
                    <span className="text-[10px] text-slate-400 font-bold uppercase tracking-wider">{onlineUsers.length} active now</span>
                </div>
                <div className="ml-auto flex items-center gap-2">
                    <div className="flex -space-x-2">
                        {onlineUsers.slice(0, 3).map((_, i) => (
                            <div key={i} className="w-6 h-6 rounded-lg bg-slate-100 border-2 border-white flex items-center justify-center text-[10px] font-black text-slate-400 overflow-hidden shadow-sm">
                                <User className="w-3 h-3" />
                            </div>
                        ))}
                        {onlineUsers.length > 3 && (
                            <div className="w-6 h-6 rounded-lg bg-sky-50 border-2 border-white flex items-center justify-center text-[9px] font-bold text-sky-600 shadow-sm">
                                +{onlineUsers.length - 3}
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Messages */}
            <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-4">
                {messages.length === 0 && (
                    <div className="flex flex-col items-center justify-center h-full gap-4 text-center opacity-50">
                        <div className="w-16 h-16 rounded-3xl bg-slate-50 flex items-center justify-center">
                            <MessageBubbleIcon className="w-8 h-8 text-slate-300" />
                        </div>
                        <div>
                            <p className="text-sm font-black text-slate-400">No signals found</p>
                            <p className="text-[10px] text-slate-300 font-bold uppercase tracking-widest mt-1">Start the transmission below</p>
                        </div>
                    </div>
                )}
                {messages.map((msg, idx) => {
                    const isMe = msg.senderId === userId
                    const showName = !isMe && (idx === 0 || messages[idx - 1].senderId !== msg.senderId)

                    return (
                        <div key={msg._id} className={cn("flex flex-col mb-1", isMe ? "items-end" : "items-start")}>
                            {showName && (
                                <p className="text-[10px] font-black text-sky-600/80 mb-1 ml-1 uppercase tracking-wider">{msg.senderName}</p>
                            )}
                            <div className={cn(
                                "relative group px-4 py-2.5 rounded-2xl transition-all duration-200 shadow-sm",
                                isMe
                                    ? "bg-sky-600 text-white rounded-tr-sm min-w-[100px] max-w-[85%]"
                                    : "bg-slate-50 text-slate-700 rounded-tl-sm border border-slate-100 min-w-[100px] max-w-[85%]"
                            )}>
                                <p className="text-[14px] leading-relaxed font-medium">{msg.text}</p>

                                <div className={cn(
                                    "flex items-center gap-1.5 mt-1.5 justify-end",
                                    isMe ? "text-white/60" : "text-slate-400"
                                )}>
                                    <span className="text-[9px] font-bold">
                                        {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    {isMe && (
                                        <div className="flex">
                                            {msg.status === 'sent' && <Check className="w-3 h-3" />}
                                            {msg.status === 'delivered' && <CheckCheck className="w-3 h-3" />}
                                            {msg.status === 'seen' && <CheckCheck className="w-3 h-3 text-emerald-300" />}
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )
                })}
                <div ref={bottomRef} className="h-4" />
            </div>

            {/* Input Overlay at bottom */}
            <div className="shrink-0 pt-2 pb-4 px-4 bg-white border-t border-slate-100 sticky bottom-0 z-20">
                <div className="max-w-4xl mx-auto flex items-end gap-2 bg-slate-50 p-1.5 rounded-3xl border border-slate-200 focus-within:border-sky-300 focus-within:ring-4 focus-within:ring-sky-500/5 transition-all">
                    <textarea
                        value={text}
                        onChange={e => setText(e.target.value)}
                        onKeyDown={e => e.key === "Enter" && !e.shiftKey && (e.preventDefault(), handleSend())}
                        placeholder="Broadcast message..."
                        className="flex-1 min-h-[36px] max-h-32 px-3 py-2 bg-transparent text-sm text-slate-800 placeholder:text-slate-400 outline-none resize-none scrollbar-hide"
                        rows={1}
                        style={{ height: 'auto' }}
                        onInput={(e) => {
                            const target = e.target as HTMLTextAreaElement;
                            target.style.height = 'auto';
                            target.style.height = `${target.scrollHeight}px`;
                        }}
                    />
                    <button
                        onClick={handleSend}
                        disabled={!text.trim()}
                        className="w-10 h-10 shrink-0 rounded-2xl bg-sky-600 hover:bg-sky-700 disabled:bg-slate-200 disabled:text-slate-400 text-white flex items-center justify-center transition-all active:scale-95 shadow-lg shadow-sky-600/20 mb-0.5"
                    >
                        <Send className="w-4 h-4" />
                    </button>
                </div>
            </div>
        </div>
    )
}

function MessageBubbleIcon({ className }: { className?: string }) {
    return (
        <svg className={className} viewBox="0 0 24 24" fill="none">
            <path d="M21 11.5C21.0034 12.8199 20.6951 14.1219 20.1 15.3C19.3944 16.7118 18.3098 17.8992 16.9674 18.7293C15.6251 19.5594 14.0782 19.9994 12.5 20C11.1801 20.0035 9.87812 19.6951 8.7 19.1L3 21L4.9 15.3C4.30493 14.1219 3.99656 12.8199 4 11.5C4.00061 9.92179 4.44061 8.37488 5.27072 7.03258C6.10083 5.69028 7.28825 4.6056 8.7 3.90003C9.87812 3.30496 11.1801 2.99659 12.5 3.00003H13C15.0843 3.11502 17.053 3.99479 18.5291 5.47089C20.0052 6.94699 20.885 8.91568 21 11V11.5Z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    )
}

// ─── Main Component ───
export function GroupChatTab({ squadId }: GroupChatTabProps) {
    const { chatClient, isReady } = useStream()
    const [useFallback, setUseFallback] = useState(false)

    // If Stream Chat client is available & connected, and no fallback triggered, use it
    if (chatClient && isReady && !useFallback) {
        return <StreamChatView squadId={squadId} chatClient={chatClient} onFail={() => setUseFallback(true)} />
    }

    // Fallback to socket-based chat
    return <SocketChatView squadId={squadId} />
}
