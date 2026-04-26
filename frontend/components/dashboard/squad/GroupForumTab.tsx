"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Plus, ChevronLeft, Loader2, Send, User } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { groupApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"
import { getCurrentUser } from "@/lib/auth-utils"
import { initializeSocket } from "@/lib/socket"

interface GroupForumTabProps {
    squadId: string
}

export function GroupForumTab({ squadId }: GroupForumTabProps) {
    const currentUser = getCurrentUser()
    const userId = currentUser?._id || currentUser?.id || ""
    const socket = initializeSocket(userId)
    const [forumId, setForumId] = useState<string | null>(null)
    const [threads, setThreads] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [creating, setCreating] = useState(false)
    const [newThread, setNewThread] = useState({ title: "", content: "" })
    const [activeThread, setActiveThread] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [reply, setReply] = useState("")
    const [replying, setReplying] = useState(false)

    useEffect(() => {
        let mounted = true
        const init = async () => {
            setLoading(true)
            try {
                const fd = await groupApi.getForums(squadId)
                const forums = fd.data || fd
                const fid = forums?.[0]?._id || forums?._id
                if (mounted && fid) {
                    setForumId(fid)
                    const td = await groupApi.getThreads(fid)
                    setThreads(td.data || td || [])
                }
            } catch (e) {
                console.error("[Forum] Init Error:", e)
            } finally {
                if (mounted) setLoading(false)
            }
        }
        init()
        return () => { mounted = false }
    }, [squadId])

    const openThread = async (thread: any) => {
        setActiveThread(thread)
        try {
            const data = await groupApi.getPosts(thread._id)
            setPosts(data.data || [])
        } catch (e) { console.error(e) }
    }

    // Real-time synchronization
    useEffect(() => {
        if (!socket || !squadId) return

        const join = () => socket.emit("join-squad", squadId)
        if (socket.connected) join()
        socket.on("connect", join)

        socket.on("forum-thread-created", (newThread: any) => {
            setThreads(prev => {
                if (prev.find(t => t._id === newThread._id)) return prev
                return [newThread, ...prev]
            })
        })

        return () => {
            socket.off("connect", join)
            socket.off("forum-thread-created")
        }
    }, [socket, squadId])

    const handleCreate = async () => {
        const titleTrimmed = newThread.title.trim()
        if (!titleTrimmed || !forumId) {
            console.error("[Forum] Validation Failed:", { titleTrimmed, forumId, squadId })
            toast({
                title: "Cannot post thread",
                description: !forumId ? "Forum is still loading..." : "Please enter a valid title.",
                variant: "destructive"
            })
            return
        }
        setCreating(true)
        try {
            const res = await groupApi.createThread(forumId, { ...newThread, title: titleTrimmed })
            const created = res.data || res
            setThreads(prev => [created, ...prev])

            // Broadcast to squad
            if (socket) {
                socket.emit("new-forum-thread", { squadId, thread: created })
            }

            setNewThread({ title: "", content: "" })
            toast({ title: "Discussion started!" })
        } catch (e) {
            console.error("[Forum] Create Error:", e)
            toast({ title: "Failed to create thread", variant: "destructive" })
        } finally { setCreating(false) }
    }

    const handleReply = async () => {
        if (!reply.trim() || !activeThread) return
        setReplying(true)
        try {
            await groupApi.createPost(activeThread._id, reply)
            const data = await groupApi.getPosts(activeThread._id)
            setPosts(data.data || [])
            setReply("")
        } catch (e) {
            toast({ title: "Failed to reply", variant: "destructive" })
        } finally { setReplying(false) }
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-full">
                <Loader2 className="w-6 h-6 text-sky-500 animate-spin" />
            </div>
        )
    }

    if (activeThread) {
        return (
            <div className="flex flex-col h-full bg-white">
                {/* Thread header */}
                <div className="flex items-center gap-3 px-4 py-3 border-b border-slate-100 bg-slate-50 shrink-0">
                    <Button variant="ghost" size="icon" onClick={() => setActiveThread(null)} className="rounded-xl h-8 w-8 text-slate-500">
                        <ChevronLeft className="w-4 h-4" />
                    </Button>
                    <div className="flex-1 min-w-0">
                        <p className="font-black text-sm text-slate-900 truncate">{activeThread.title}</p>
                        <p className="text-[10px] text-slate-400">{posts.length} replies</p>
                    </div>
                </div>
                {/* Posts */}
                <div className="flex-1 min-h-0 overflow-y-auto p-4 space-y-3">
                    {/* Original post */}
                    <div className="p-4 rounded-2xl bg-sky-50 border border-sky-100">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="w-6 h-6 rounded-lg bg-sky-200 flex items-center justify-center text-sky-700 font-black text-[10px]">
                                {activeThread.author?.fullName?.[0] || "A"}
                            </div>
                            <span className="text-xs font-bold text-sky-800">{activeThread.author?.fullName || "Author"}</span>
                        </div>
                        <p className="text-sm text-slate-700 leading-relaxed">{activeThread.content}</p>
                    </div>
                    {posts.map((post: any) => (
                        <div key={post._id} className="p-4 rounded-2xl bg-white border border-slate-100 shadow-sm hover:shadow-md transition-all duration-300">
                            <div className="flex items-center gap-2.5 mb-2.5">
                                <div className="w-7 h-7 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500 font-bold text-[11px] border border-slate-200">
                                    {post.author?.fullName?.[0] || "U"}
                                </div>
                                <div className="flex flex-col">
                                    <span className="text-[11px] font-bold text-slate-700 leading-none">{post.author?.fullName || "Member"}</span>
                                    <span className="text-[8px] text-slate-400 font-semibold uppercase tracking-wider mt-0.5">Response</span>
                                </div>
                            </div>
                            <p className="text-[13px] text-slate-600 leading-relaxed font-medium pl-1">{post.content}</p>
                        </div>
                    ))}
                    {posts.length === 0 && (
                        <p className="text-center text-xs text-slate-400 py-8">No replies yet. Be the first to respond!</p>
                    )}
                </div>
                {/* Reply input */}
                <div className="shrink-0 p-3 border-t border-slate-100 bg-white">
                    <div className="flex items-center gap-2">
                        <Input value={reply} onChange={e => setReply(e.target.value)}
                            placeholder="Write a reply..."
                            className="flex-1 h-10 rounded-xl text-sm border-slate-200"
                            onKeyDown={e => e.key === "Enter" && !e.shiftKey && handleReply()} />
                        <Button size="icon" onClick={handleReply} disabled={replying || !reply.trim()}
                            className="w-10 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shrink-0">
                            {replying ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
                        </Button>
                    </div>
                </div>
            </div>
        )
    }

    return (
        <div className="flex flex-col h-full bg-white">
            {/* Create Thread */}
            <div className="p-4 border-b border-slate-100 space-y-2 shrink-0">
                <Input value={newThread.title} onChange={e => setNewThread(p => ({ ...p, title: e.target.value }))}
                    placeholder="Start a new discussion..." className="h-10 rounded-xl text-sm border-slate-200" />
                {newThread.title.trim() && (
                    <div className="space-y-2 animate-in fade-in slide-in-from-top-2">
                        <Textarea value={newThread.content} onChange={e => setNewThread(p => ({ ...p, content: e.target.value }))}
                            placeholder="Add context..." className="text-sm rounded-xl border-slate-200 min-h-[70px] resize-none" />
                        <div className="flex justify-end gap-2">
                            <Button variant="outline" size="sm" onClick={() => setNewThread({ title: "", content: "" })} className="rounded-xl text-xs h-9 px-4">Cancel</Button>
                            <Button size="sm" onClick={handleCreate} disabled={creating}
                                className="rounded-xl bg-sky-600 hover:bg-sky-700 text-white text-xs h-9 px-6 font-bold shadow-md shadow-sky-600/20">
                                {creating ? <Loader2 className="w-3 h-3 animate-spin mr-1.5" /> : <Plus className="w-3.5 h-3.5 mr-1.5" />} Post Thread
                            </Button>
                        </div>
                    </div>
                )}
            </div>
            {/* Thread list */}
            <div className="flex-1 min-h-0 overflow-y-auto p-3 space-y-2">
                {threads.length === 0 ? (
                    <div className="flex flex-col items-center justify-center h-full gap-3 py-16">
                        <MessageCircle className="w-10 h-10 text-slate-200" />
                        <p className="text-sm text-slate-400 font-semibold">No discussions yet</p>
                        <p className="text-xs text-slate-300">Start the first thread above</p>
                    </div>
                ) : (
                    threads.map(thread => (
                        <button key={thread._id} onClick={() => openThread(thread)}
                            className="w-full text-left p-4 rounded-2xl bg-slate-50/50 hover:bg-white border border-slate-100 hover:border-sky-100 hover:shadow-xl hover:shadow-sky-500/5 transition-all duration-300 group">
                            <div className="flex items-start gap-4">
                                <div className="w-10 h-10 rounded-xl bg-sky-50 text-sky-600 flex items-center justify-center font-bold text-sm shrink-0 border border-sky-100 group-hover:bg-sky-600 group-hover:text-white transition-all duration-300">
                                    {thread.author?.fullName?.[0] || "A"}
                                </div>
                                <div className="flex-1 min-w-0">
                                    <div className="flex items-center gap-2 mb-1">
                                        <p className="font-bold text-sm text-slate-800 leading-tight truncate tracking-tight group-hover:text-sky-600 transition-colors">{thread.title}</p>
                                        <span className="px-1.5 py-0.5 bg-sky-50 text-sky-500 rounded text-[8px] font-black uppercase tracking-widest border border-sky-100/50">Topic</span>
                                    </div>
                                    <p className="text-[11px] text-slate-400 line-clamp-1 font-medium italic">"{thread.content}"</p>
                                    <div className="flex items-center gap-4 mt-3">
                                        <span className="flex items-center gap-1.5 text-[10px] text-slate-400 font-bold">
                                            <MessageCircle className="w-3.5 h-3.5 text-sky-400" />
                                            {thread.posts?.length || 0} participants
                                        </span>
                                        <span className="text-[10px] text-slate-300 font-bold ml-auto">{new Date(thread.createdAt).toLocaleDateString()}</span>
                                    </div>
                                </div>
                            </div>
                        </button>
                    ))
                )}
            </div>
        </div>
    )
}
