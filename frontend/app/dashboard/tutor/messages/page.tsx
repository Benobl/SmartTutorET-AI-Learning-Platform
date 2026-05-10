"use client"

import { useState } from "react"
import { Search, Plus, Loader2, Video, Phone, MoreVertical, ChevronRight, MessageCircle, VideoOff } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useStream } from "@/components/providers/StreamProvider"
import {
    Chat, Channel, MessageList, MessageInput,
    Window, Thread, ChannelList
} from "stream-chat-react"
import "stream-chat-react/dist/css/v2/index.css"
import { getCurrentUser } from "@/lib/auth-utils"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { userApi } from "@/lib/api"
import { useEffect } from "react"

export default function TeacherMessagesPage() {
    const { chatClient, videoClient, isReady } = useStream()
    const [selectedChannel, setSelectedChannel] = useState<any>(null)
    const [showMobileChat, setShowMobileChat] = useState(false)
    const [isSearchOpen, setIsSearchOpen] = useState(false)
    const [searchQuery, setSearchQuery] = useState("")
    const [searchResults, setSearchResults] = useState<any[]>([])
    const [isSearching, setIsSearching] = useState(false)
    const currentUser = getCurrentUser()

    useEffect(() => {
        if (searchQuery.length > 2) {
            const timer = setTimeout(async () => {
                setIsSearching(true)
                try {
                    const studentRes = await userApi.getAllStudents()
                    const allStudents = studentRes.data || []
                    const filtered = allStudents.filter((u: any) =>
                        (u._id || u.id) !== currentUser?._id &&
                        (u.fullName || u.name || "").toLowerCase().includes(searchQuery.toLowerCase())
                    )
                    setSearchResults(filtered)
                } catch (error) {
                    console.error("Search error:", error)
                } finally {
                    setIsSearching(false)
                }
            }, 500)
            return () => clearTimeout(timer)
        } else {
            setSearchResults([])
        }
    }, [searchQuery, currentUser?._id])

    if (!isReady || !chatClient || !currentUser) {
        return (
            <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-xl">
                <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
                <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Establishing Tutor Hub...</p>
            </div>
        )
    }

    const filters: any = { type: 'messaging', members: { $in: [currentUser._id || currentUser.id] } }
    const sort: any = { last_message_at: -1 }

    const startNewChat = async (targetUser: any) => {
        try {
            const cid = [currentUser._id || currentUser.id, targetUser._id || targetUser.id].sort().join('-')
            const channel = chatClient.channel('messaging', cid, {
                members: [currentUser._id || currentUser.id, targetUser._id || targetUser.id],
            })
            await channel.create()
            setSelectedChannel(channel)
            setIsSearchOpen(false)
            setSearchQuery("")
            setShowMobileChat(true)
        } catch (error) {
            console.error("Error starting chat:", error)
        }
    }

    return (
        <div className="h-[calc(100vh-12rem)] flex gap-6 stream-chat-advanced">
            <Chat client={chatClient} theme="str-chat__theme-light">
                {/* Left Sidebar: Contacts */}
                <div className={cn(
                    "w-full md:w-[360px] flex flex-col transition-all duration-500 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden",
                    showMobileChat ? "hidden md:flex" : "flex"
                )}>
                    {/* Sidebar Header */}
                    <div className="p-6 pb-4 border-b border-slate-50">
                        <div className="flex items-center justify-between mb-4">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 tracking-tight">Tutor Comms <span className="text-sky-500">🎓</span></h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Student Support Network</p>
                            </div>
                            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm border border-sky-100">
                                <Plus className="w-5 h-5" />
                            </button>
                        </div>

                        <div className="relative group">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within:text-sky-500 transition-colors" />
                            <Input
                                placeholder="Search students..."
                                className="bg-slate-50 border-transparent text-slate-800 pl-11 h-12 rounded-2xl focus:bg-white focus:border-sky-300 transition-all text-xs font-medium"
                            />
                        </div>
                    </div>

                    {/* Channel List */}
                    <div className="flex-1 overflow-hidden">
                        <ChannelList
                            filters={filters}
                            sort={sort}
                            Preview={(props) => (
                                <div
                                    onClick={() => {
                                        if (props.setActiveChannel) props.setActiveChannel(props.channel);
                                        setShowMobileChat(true);
                                    }}
                                    className={cn(
                                        "mx-3 my-1 p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 relative group",
                                        props.active ? "bg-sky-50 border border-sky-100 shadow-sm" : "border border-transparent"
                                    )}
                                >
                                    <div className="relative">
                                        <Avatar className="w-12 h-12 rounded-2xl border-2 border-white shadow-sm">
                                            <AvatarImage src={(props.channel.data?.image as string) || (Object.values(props.channel.state.members).find((m: any) => m.user_id !== chatClient.userID) as any)?.user?.image} />
                                            <AvatarFallback className="bg-slate-100 text-sky-600 font-black">
                                                {((props.channel.data?.name as string) || (Object.values(props.channel.state.members).find((m: any) => m.user_id !== chatClient.userID) as any)?.user?.name || "S")[0]}
                                            </AvatarFallback>
                                        </Avatar>
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="flex items-center justify-between mb-0.5">
                                            <h4 className="text-sm font-bold text-slate-800 truncate">
                                                {(props.channel.data?.name as string) || (Object.values(props.channel.state.members).find((m: any) => m.user_id !== chatClient.userID) as any)?.user?.name || "Student Session"}
                                            </h4>
                                            <span className="text-[10px] text-slate-400 font-bold whitespace-nowrap">
                                                {props.latestMessage ? new Date((props.latestMessage as any).created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : ""}
                                            </span>
                                        </div>
                                        <p className="text-[11px] text-slate-500 truncate font-medium">
                                            {(props.latestMessage as any)?.text || "Started a new transmission..."}
                                        </p>
                                    </div>
                                    {props.unread && props.unread > 0 && (
                                        <div className="bg-sky-600 text-white text-[9px] font-black w-5 h-5 rounded-full flex items-center justify-center shadow-lg shadow-sky-600/20">
                                            {props.unread}
                                        </div>
                                    )}
                                </div>
                            )}
                        />
                    </div>
                </div>

                {/* Right Area: Chat Window */}
                <div className={cn(
                    "flex-1 flex flex-col rounded-[40px] border border-slate-100 bg-white shadow-2xl relative overflow-hidden transition-all duration-500",
                    showMobileChat ? "flex" : "hidden md:flex"
                )}>
                    {selectedChannel ? (
                        <Channel channel={selectedChannel}>
                            <Window>
                                {/* Header */}
                                <div className="px-6 py-4 border-b border-slate-100 bg-white/80 backdrop-blur-md flex items-center justify-between z-20">
                                    <div className="flex items-center gap-4">
                                        <Button variant="ghost" size="icon" className="md:hidden text-slate-400" onClick={() => setShowMobileChat(false)}>
                                            <ChevronRight className="w-5 h-5 rotate-180" />
                                        </Button>
                                        <div className="relative">
                                            <div className="w-11 h-11 rounded-2xl bg-sky-50 flex items-center justify-center border border-sky-100 text-sky-600 font-black shadow-inner overflow-hidden">
                                                <Avatar className="w-full h-full">
                                                    <AvatarImage src={(selectedChannel.data?.image as string) || (Object.values(selectedChannel.state.members).find((m: any) => m.user_id !== chatClient.userID) as any)?.user?.image} />
                                                    <AvatarFallback>S</AvatarFallback>
                                                </Avatar>
                                            </div>
                                            <span className="absolute -top-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                                        </div>
                                        <div className="flex flex-col">
                                            <h4 className="text-sm font-black text-slate-800 tracking-tight">
                                                {(selectedChannel.data?.name as string) || (Object.values(selectedChannel.state.members).find((m: any) => m.user_id !== chatClient.userID) as any)?.user?.name || "Student"}
                                            </h4>
                                            <div className="flex items-center gap-1.5">
                                                <span className="text-[10px] text-emerald-500 font-bold uppercase tracking-widest">Active Now</span>
                                                <span className="w-1 h-1 bg-slate-300 rounded-full" />
                                                <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest">Encrypted Hub</span>
                                            </div>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all active:scale-90"><Video className="w-5 h-5" /></Button>
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-slate-400 hover:text-sky-600 hover:bg-sky-50 transition-all active:scale-90"><Phone className="w-5 h-5" /></Button>
                                        <div className="w-px h-6 bg-slate-100 mx-1" />
                                        <Button variant="ghost" size="icon" className="w-10 h-10 rounded-2xl text-slate-400"><MoreVertical className="w-5 h-5" /></Button>
                                    </div>
                                </div>

                                <div className="flex-1 bg-[#f4f7f9] pattern-dots relative">
                                    <MessageList />
                                </div>

                                <MessageInput focus />
                            </Window>
                            <Thread />
                        </Channel>
                    ) : (
                        <div className="flex flex-col items-center justify-center h-full gap-6 text-center pattern-dots bg-[#f4f7f9]">
                            <div className="w-24 h-24 rounded-[48px] bg-white shadow-2xl flex items-center justify-center text-slate-300 relative group overflow-hidden">
                                <MessageCircle className="w-10 h-10 relative z-10 -rotate-6 transition-transform group-hover:scale-110" />
                            </div>
                            <div className="max-w-xs space-y-2">
                                <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Student Link Pending</p>
                                <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Select a student sequence to begin <br /> instructional guidance.</p>
                            </div>
                            <Button onClick={() => setIsSearchOpen(true)} className="rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] px-6 py-2 shadow-lg shadow-sky-600/20 active:scale-95 transition-all">START INSTRUCTION</Button>
                        </div>
                    )}
                </div>
            </Chat>

            {/* Global Search Dialog */}
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
                <DialogContent className="bg-white border-0 text-slate-900 rounded-[40px] p-0 overflow-hidden max-w-md shadow-2xl ring-1 ring-black/5">
                    <div className="p-8 bg-slate-50 border-b border-slate-100 pb-0">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Locate <span className="text-sky-500">Student</span></DialogTitle>
                        </DialogHeader>

                        <div className="my-6 relative">
                            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
                            <Input
                                placeholder="Search student name..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="bg-white border-slate-200 text-slate-800 pl-12 h-14 rounded-2xl text-sm font-medium focus:ring-sky-500/20"
                            />
                        </div>
                    </div>
                    <ScrollArea className="h-96 p-4">
                        {isSearching ? (
                            <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                                <p className="mt-4 text-[9px] font-black uppercase tracking-widest">Scanning Academy Records...</p>
                            </div>
                        ) : searchResults.length > 0 ? (
                            <div className="space-y-2">
                                {searchResults.map((user) => (
                                    <button
                                        key={user._id}
                                        onClick={() => startNewChat(user)}
                                        className="w-full p-4 rounded-3xl flex items-center gap-4 hover:bg-slate-50 transition-all group border border-transparent hover:border-slate-100"
                                    >
                                        <Avatar className="w-12 h-12 rounded-2xl shadow-sm ring-2 ring-white">
                                            <AvatarImage src={user.profilePic} />
                                            <AvatarFallback className="bg-sky-50 text-sky-600 font-bold uppercase">{user.fullName?.substring(0, 2) || user.name?.substring(0, 2) || "S"}</AvatarFallback>
                                        </Avatar>
                                        <div className="flex-1 text-left min-w-0">
                                            <h4 className="text-sm font-black text-slate-800 truncate">{user.fullName || user.name}</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{user.role || 'Scholar'}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 opacity-0 group-hover:opacity-100 transition-all flex items-center justify-center">
                                            <ChevronRight className="w-5 h-5" />
                                        </div>
                                    </button>
                                ))}
                            </div>
                        ) : searchQuery.length > 2 ? (
                            <div className="flex flex-col items-center justify-center h-full py-24 opacity-30 text-slate-400">
                                <VideoOff className="w-10 h-10 mb-4" />
                                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Students Located</p>
                            </div>
                        ) : (
                            <div className="flex flex-col items-center justify-center h-full py-24 opacity-20 text-slate-300">
                                <Search className="w-12 h-12" />
                            </div>
                        )}
                    </ScrollArea>
                </DialogContent>
            </Dialog>
        </div>
    )
}
