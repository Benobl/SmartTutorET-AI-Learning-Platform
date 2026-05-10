"use client"

import {
  Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ChevronRight,
  MessageSquare, User as UserIcon, Loader2, VideoOff, PhoneIncoming, Plus, X as CloseIcon, Hash, Check, CheckCheck, MessageCircle
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { userApi, chatApi } from "@/lib/api"
import { getCurrentUser } from "@/lib/auth-utils"
import { DirectChat } from "@/components/dashboard/chat/DirectChat"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function StudentMessages() {
  const [conversations, setConversations] = useState<any[]>([])
  const [selectedUser, setSelectedUser] = useState<any>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [isSearchOpen, setIsSearchOpen] = useState(false)
  const [searchQuery, setSearchQuery] = useState("")
  const [searchResults, setSearchResults] = useState<any[]>([])
  const [isSearching, setIsSearching] = useState(false)
  const [loading, setLoading] = useState(true)
  const currentUser = getCurrentUser()

  useEffect(() => {
    const fetchConversations = async () => {
      try {
        const res = await chatApi.getConversations()
        if (res.success) {
          setConversations(res.data)
        }
      } catch (error) {
        console.error("Error fetching conversations:", error)
      } finally {
        setLoading(false)
      }
    }
    fetchConversations()
  }, [])

  useEffect(() => {
    if (searchQuery.length > 2) {
      const timer = setTimeout(async () => {
        setIsSearching(true)
        try {
          const [studentsRes, tutorsRes] = await Promise.all([
            userApi.getAllStudents(),
            userApi.getAllTutors()
          ])
          const allUsers = [...(studentsRes.data || []), ...(tutorsRes.data || [])]
          const filtered = allUsers.filter(u =>
            (u._id || u.id) !== currentUser?._id &&
            u.fullName?.toLowerCase().includes(searchQuery.toLowerCase())
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

  const startNewChat = (user: any) => {
    setSelectedUser(user)
    if (!conversations.find(c => c._id === user._id)) {
      setConversations([user, ...conversations])
    }
    setIsSearchOpen(false)
    setSearchQuery("")
    setShowMobileChat(true)
  }

  if (loading || !currentUser) {
    return (
      <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center bg-white rounded-[40px] border border-slate-100 shadow-xl shadow-slate-200/50">
        <Loader2 className="w-12 h-12 text-sky-500 animate-spin" />
        <p className="mt-6 text-[10px] font-black uppercase tracking-[0.3em] text-slate-400">Loading Network...</p>
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6">
      {/* Left Sidebar: Conversations */}
      <div className={cn(
        "w-full md:w-[360px] flex flex-col transition-all duration-500 bg-white rounded-[40px] border border-slate-100 shadow-xl overflow-hidden",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="p-6 pb-4 border-b border-slate-50">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-black text-slate-900 tracking-tight">Messages <span className="text-sky-500">✨</span></h2>
              <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">Secure Peer Network</p>
            </div>
            <button onClick={() => setIsSearchOpen(true)} className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center hover:scale-110 transition-transform shadow-sm border border-sky-100">
              <Plus className="w-5 h-5" />
            </button>
          </div>

          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
            <Input
              placeholder="Search conversations..."
              className="bg-slate-50 border-transparent text-slate-800 pl-11 h-12 rounded-2xl focus:bg-white focus:border-sky-300 transition-all text-xs"
            />
          </div>
        </div>

        <ScrollArea className="flex-1">
          <div className="p-3 space-y-1">
            {conversations.length === 0 ? (
              <div className="py-20 text-center opacity-30">
                <MessageCircle className="w-10 h-10 mx-auto mb-3" />
                <p className="text-[10px] font-black uppercase">No Channels Active</p>
              </div>
            ) : (
              conversations.map((user) => (
                <div
                  key={user._id}
                  onClick={() => {
                    setSelectedUser(user)
                    setShowMobileChat(true)
                  }}
                  className={cn(
                    "p-3 rounded-2xl flex items-center gap-3 cursor-pointer transition-all hover:bg-slate-50 group",
                    selectedUser?._id === user._id ? "bg-sky-50 border border-sky-100" : "border border-transparent"
                  )}
                >
                  <div className="relative">
                    <Avatar className="w-12 h-12 rounded-2xl shadow-sm">
                      <AvatarImage src={user.profile?.avatar || user.profilePic} />
                      <AvatarFallback className="bg-slate-100 text-sky-600 font-black">
                        {(user.fullName || user.name || "U")[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-white rounded-full shadow-sm" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <h4 className="text-sm font-bold text-slate-800 truncate">{user.fullName || user.name}</h4>
                    <p className="text-[10px] text-slate-400 font-bold uppercase truncate">{user.role || "Scholar"}</p>
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </div>

      {/* Right Area: Chat Window */}
      <div className={cn(
        "flex-1 flex flex-col rounded-[40px] border border-slate-100 bg-white shadow-2xl relative overflow-hidden transition-all duration-500",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {selectedUser ? (
          <DirectChat 
            otherUser={selectedUser} 
            onBack={() => setShowMobileChat(false)} 
          />
        ) : (
          <div className="flex flex-col items-center justify-center h-full gap-6 text-center pattern-dots bg-[#f4f7f9]">
            <div className="w-24 h-24 rounded-[48px] bg-white shadow-2xl flex items-center justify-center text-slate-300">
              <MessageCircle className="w-10 h-10" />
            </div>
            <div className="max-w-xs space-y-2">
              <p className="text-xs font-black text-slate-400 uppercase tracking-[0.3em]">Neural Link Awaiting</p>
              <p className="text-[11px] text-slate-400 font-bold leading-relaxed">Select a peer sequence to begin <br /> bilateral knowledge exchange.</p>
            </div>
            <Button onClick={() => setIsSearchOpen(true)} className="rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-[10px] px-6 py-2 shadow-lg shadow-sky-600/20">ESTABLISH NEW LINK</Button>
          </div>
        )}
      </div>

      {/* Global Search Dialog */}
      <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
        <DialogContent className="bg-white border-0 text-slate-900 rounded-[40px] p-0 overflow-hidden max-w-md shadow-2xl">
          <div className="p-8 bg-slate-50 border-b border-slate-100">
            <DialogHeader>
              <DialogTitle className="text-2xl font-black text-slate-900 tracking-tight">Expand <span className="text-sky-500">Network</span></DialogTitle>
            </DialogHeader>
            <div className="mt-6 relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-300" />
              <Input
                placeholder="Search students or tutors..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="bg-white border-slate-200 text-slate-800 pl-12 h-14 rounded-2xl text-sm font-medium"
              />
            </div>
          </div>
          <ScrollArea className="h-96 p-4">
            {isSearching ? (
              <div className="flex flex-col items-center justify-center h-full py-20 opacity-40">
                <Loader2 className="w-8 h-8 animate-spin text-sky-500" />
                <p className="mt-4 text-[9px] font-black uppercase tracking-widest">Scanning records...</p>
              </div>
            ) : searchResults.length > 0 ? (
              <div className="space-y-2">
                {searchResults.map((user) => (
                  <button
                    key={user._id}
                    onClick={() => startNewChat(user)}
                    className="w-full p-4 rounded-3xl flex items-center gap-4 hover:bg-slate-50 transition-all group"
                  >
                    <Avatar className="w-12 h-12 rounded-2xl">
                      <AvatarImage src={user.profile?.avatar || user.profilePic} />
                      <AvatarFallback className="bg-sky-50 text-sky-600 font-bold uppercase">{(user.fullName || user.name || "U")[0]}</AvatarFallback>
                    </Avatar>
                    <div className="flex-1 text-left min-w-0">
                      <h4 className="text-sm font-black text-slate-800 truncate">{user.fullName || user.name}</h4>
                      <p className="text-[10px] font-bold text-slate-400 uppercase">{user.role || 'Scholar'}</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-slate-300 group-hover:text-sky-500" />
                  </button>
                ))}
              </div>
            ) : searchQuery.length > 2 ? (
              <div className="flex flex-col items-center justify-center h-full py-24 opacity-30 text-slate-400">
                <VideoOff className="w-10 h-10 mb-4" />
                <p className="text-[10px] font-black uppercase tracking-[0.2em]">No Targets Located</p>
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
