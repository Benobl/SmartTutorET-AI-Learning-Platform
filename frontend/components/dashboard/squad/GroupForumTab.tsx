"use client"

import { useState, useEffect } from "react"
import { MessageCircle, Heart, Plus, User, Clock, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { groupApi, fetchWithAuth } from "@/lib/api"
import { cn } from "@/lib/utils"
import { toast } from "@/hooks/use-toast"

interface GroupForumTabProps {
    squadId: string
}

export function GroupForumTab({ squadId }: GroupForumTabProps) {
    const [forumId, setForumId] = useState<string | null>(null)
    const [threads, setThreads] = useState<any[]>([])
    const [isCreating, setIsCreating] = useState(false)
    const [newThread, setNewThread] = useState({ title: "", content: "" })
    const [activeThread, setActiveThread] = useState<any>(null)
    const [posts, setPosts] = useState<any[]>([])
    const [reply, setReply] = useState("")

    useEffect(() => {
        const initForum = async () => {
            try {
                const forumData = await groupApi.getForums(squadId)
                if (forumData.data && forumData.data.length > 0) {
                    setForumId(forumData.data[0]._id)
                    fetchThreads(forumData.data[0]._id)
                }
            } catch (error) {
                console.error("Failed to init forum:", error)
            }
        }
        initForum()
    }, [squadId])

    const fetchThreads = async (fid: string) => {
        try {
            const data = await groupApi.getThreads(fid)
            setThreads(data.data || [])
        } catch (error) {
            console.error("Failed to fetch threads:", error)
        }
    }

    const handleCreateThread = async () => {
        if (!newThread.title || !newThread.content || !forumId) return
        try {
            await groupApi.createThread(forumId, newThread)
            setIsCreating(false)
            setNewThread({ title: "", content: "" })
            fetchThreads(forumId)
            toast({ title: "Observation Logged", description: "Your discussion has been planted." })
        } catch (error) {
            toast({ title: "Failed", description: "Discussion initialization failed.", variant: "destructive" })
        }
    }

    const selectThread = async (thread: any) => {
        setActiveThread(thread)
        try {
            // Need a getPosts endpoint or similar. For now assume threads return posts if populated or fetch via threadId
            // The service has getThreadPosts(threadId)
            const data = await fetchWithAuth(`/groups/threads/${thread._id}/posts`) // Assuming this route exists or adding it
            setPosts(data.data || [])
        } catch (error) {
            console.error("Failed to fetch posts:", error)
        }
    }

    const handleSendPost = async () => {
        if (!reply.trim() || !activeThread) return
        try {
            const newPost = await groupApi.createPost(activeThread._id, reply)
            setPosts([...posts, newPost.data])
            setReply("")
            toast({ title: "Contribution Noted" })
        } catch (error) {
            toast({ title: "Failed to post", variant: "destructive" })
        }
    }

    return (
        <div className="flex gap-6 h-[500px]">
            {/* Thread List */}
            <div className="w-1/3 flex flex-col bg-white rounded-3xl border border-slate-100 overflow-hidden shadow-sm">
                <div className="p-4 border-b border-slate-50 flex items-center justify-between">
                    <h4 className="text-[10px] font-black uppercase tracking-widest text-slate-400">Discussion Pulse</h4>
                    <Button
                        size="icon"
                        variant="ghost"
                        onClick={() => setIsCreating(true)}
                        className="w-8 h-8 rounded-lg bg-sky-50 text-sky-600 hover:bg-sky-100"
                    >
                        <Plus className="w-4 h-4" />
                    </Button>
                </div>
                <div className="flex-1 overflow-y-auto p-2 space-y-1 custom-scrollbar">
                    {threads.map(thread => (
                        <button
                            key={thread._id}
                            onClick={() => selectThread(thread)}
                            className={cn(
                                "w-full p-4 rounded-2xl text-left transition-all duration-200 group",
                                activeThread?._id === thread._id ? "bg-sky-50 border border-sky-100" : "hover:bg-slate-50"
                            )}
                        >
                            <h5 className={cn("text-xs font-black uppercase truncate italic", activeThread?._id === thread._id ? "text-sky-700" : "text-slate-700")}>{thread.title}</h5>
                            <div className="flex items-center gap-2 mt-2 text-[8px] font-bold text-slate-400 tracking-tighter uppercase">
                                <Clock className="w-3 h-3" /> {new Date(thread.createdAt).toLocaleDateString()}
                            </div>
                        </button>
                    ))}
                    {threads.length === 0 && (
                        <div className="py-20 text-center space-y-2">
                            <MessageCircle className="w-8 h-8 text-slate-100 mx-auto" />
                            <p className="text-[9px] font-black text-slate-300 uppercase tracking-widest">No active thoughts...</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Conversation View */}
            <div className="flex-1 bg-white rounded-3xl border border-slate-100 overflow-hidden flex flex-col shadow-sm">
                {activeThread ? (
                    <>
                        <div className="p-6 border-b border-slate-50 bg-slate-50/30">
                            <h4 className="text-xl font-black text-slate-900 italic uppercase leading-none mb-2">{activeThread.title}</h4>
                            <p className="text-sm font-medium text-slate-500 leading-relaxed pr-10">{activeThread.content}</p>
                        </div>
                        <div className="flex-1 overflow-y-auto p-6 space-y-6 custom-scrollbar">
                            {posts.map(post => (
                                <div key={post._id} className="flex gap-4 group">
                                    <div className="w-10 h-10 rounded-2xl bg-slate-100 flex items-center justify-center font-black text-[10px] text-slate-400 shrink-0">
                                        {post.author.fullName[0]}
                                    </div>
                                    <div className="space-y-1.5 flex-1">
                                        <div className="flex items-center gap-2">
                                            <span className="text-[10px] font-black text-slate-900">{post.author.fullName}</span>
                                            <span className="text-[8px] font-bold text-slate-400">JUST NOW</span>
                                        </div>
                                        <p className="text-sm text-slate-600 leading-relaxed bg-slate-50 p-4 rounded-3xl rounded-tl-none border border-slate-100 shadow-sm">{post.content}</p>
                                    </div>
                                </div>
                            ))}
                        </div>
                        <div className="p-4 bg-slate-50 border-t border-slate-100 flex gap-2">
                            <Input
                                placeholder="Add your perspective..."
                                value={reply}
                                onChange={(e) => setReply(e.target.value)}
                                className="h-12 bg-white rounded-xl border-slate-200"
                            />
                            <Button onClick={handleSendPost} className="h-12 rounded-xl bg-sky-600 hover:bg-sky-700">
                                <Plus className="w-4 h-4 mr-2" /> Contribute
                            </Button>
                        </div>
                    </>
                ) : isCreating ? (
                    <div className="p-10 space-y-8 animate-in zoom-in-95 duration-300">
                        <div className="space-y-2">
                            <h4 className="text-2xl font-black text-slate-900 uppercase italic italic">Initialize <span className="text-sky-600">Observation</span></h4>
                            <p className="text-xs font-medium text-slate-400">Share a thought or start a deep-dive session.</p>
                        </div>
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Thought Header</label>
                                <Input
                                    placeholder="e.g. The Entropy Constant in Squad Beta"
                                    value={newThread.title}
                                    onChange={(e) => setNewThread({ ...newThread, title: e.target.value })}
                                    className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold"
                                />
                            </div>
                            <div className="space-y-2">
                                <label className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Detail Matrix</label>
                                <Textarea
                                    placeholder="Provide context for the squad..."
                                    value={newThread.content}
                                    onChange={(e) => setNewThread({ ...newThread, content: e.target.value })}
                                    className="min-h-[120px] rounded-2xl bg-slate-50 border-slate-100 font-medium pt-4"
                                />
                            </div>
                            <div className="flex gap-4 pt-4">
                                <Button onClick={() => setIsCreating(false)} variant="outline" className="flex-1 h-14 rounded-2xl font-black text-xs uppercase tracking-widest">Abort</Button>
                                <Button onClick={handleCreateThread} className="flex-1 h-14 rounded-2xl bg-sky-600 hover:bg-sky-700 font-black text-xs uppercase tracking-widest">Execute</Button>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="flex-1 flex flex-col items-center justify-center text-center p-20 space-y-6">
                        <div className="w-20 h-20 rounded-[32px] bg-slate-50 border border-slate-100 flex items-center justify-center">
                            <MessageCircle className="w-10 h-10 text-sky-200" />
                        </div>
                        <div className="space-y-2">
                            <h5 className="text-lg font-black text-slate-700 uppercase italic">Selection Required</h5>
                            <p className="text-xs text-slate-400 font-medium max-w-[240px]">Select a discussion from the left or create a new perspective.</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}
