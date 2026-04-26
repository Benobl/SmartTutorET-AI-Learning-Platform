import {
  Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ChevronRight,
  MessageSquare, User as UserIcon, Loader2, VideoOff, PhoneIncoming, Plus, X as CloseIcon
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState, useEffect } from "react"
import { userApi } from "@/lib/api"
import { useStream } from "@/components/providers/StreamProvider"
import {
  Chat, Channel, ChannelHeader, MessageList, MessageInput,
  Window, Thread, ChannelList, ChannelListMessengerProps
} from "stream-chat-react"
import "stream-chat-react/dist/css/v2/index.css"
import { getCurrentUser } from "@/lib/auth-utils"
import { IndividualVideoCall } from "@/components/dashboard/stream/IndividualVideoCall"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function StudentMessages() {
  const { chatClient, videoClient, isReady } = useStream()
  const [selectedChannel, setSelectedChannel] = useState<any>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [activeCall, setActiveCall] = useState<any>(null)
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
          // Optimized: Fetching both students and tutors
          const [studentsRes, tutorsRes] = await Promise.all([
            userApi.getAllStudents(),
            userApi.getAllTutors()
          ])
          const allUsers = [...(studentsRes.data || []), ...(tutorsRes.data || [])]
          const filtered = allUsers.filter(u =>
            u._id !== currentUser?._id &&
            u.fullName.toLowerCase().includes(searchQuery.toLowerCase())
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
      <div className="flex flex-col h-[600px] items-center justify-center bg-slate-900/50 rounded-3xl border border-white/10">
        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mb-4" />
        <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Synchronizing Messages...</p>
      </div>
    )
  }

  const filters = { type: 'messaging', members: { $in: [currentUser._id] } }
  const sort: any = { last_message_at: -1 }

  const startNewChat = async (targetUser: any) => {
    try {
      const channel = chatClient.channel('messaging', {
        members: [currentUser._id, targetUser._id],
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

  const handleStartCall = async (type: 'video' | 'audio') => {
    if (!videoClient || !selectedChannel) return

    const members = Object.values(selectedChannel.state.members).map((m: any) => m.user_id)
    const callId = `call_${selectedChannel.id}_${Date.now()}`
    const call = videoClient.call("default", callId)

    try {
      await call.getOrCreate({
        data: {
          members: members.map(id => ({ user_id: id })),
          custom: { type }
        }
      })
      setActiveCall(call)
    } catch (error) {
      console.error("Error starting call:", error)
    }
  }

  if (activeCall) {
    return (
      <div className="h-[calc(100vh-12rem)] relative rounded-3xl overflow-hidden border border-white/10">
        <IndividualVideoCall
          call={activeCall}
          onLeave={() => setActiveCall(null)}
        />
      </div>
    )
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden stream-chat-custom">
      <Chat client={chatClient} theme="str-chat__theme-dark">
        {/* Contacts Sidebar */}
        <div className={cn(
          "w-full md:w-80 flex flex-col gap-4 transition-all duration-300",
          showMobileChat ? "hidden md:flex" : "flex"
        )}>
          <div className="flex items-center gap-2">
            <div className="relative flex-1 group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
              <Input
                placeholder="Search conversations..."
                className="bg-slate-900/50 border-white/10 text-white pl-10 h-11 rounded-2xl focus:ring-sky-500/50 transition-all border-0 shadow-none text-xs"
              />
            </div>
            <Dialog open={isSearchOpen} onOpenChange={setIsSearchOpen}>
              <DialogTrigger asChild>
                <Button size="icon" className="w-11 h-11 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white shadow-lg shadow-sky-500/20 flex-shrink-0">
                  <Plus className="w-5 h-5" />
                </Button>
              </DialogTrigger>
              <DialogContent className="bg-slate-950 border-white/10 text-white rounded-[32px] p-0 overflow-hidden max-w-sm">
                <div className="p-6 bg-slate-900/50 border-b border-white/5">
                  <DialogHeader>
                    <DialogTitle className="text-lg font-black uppercase italic tracking-tight">Search <span className="text-sky-400">Academy</span></DialogTitle>
                  </DialogHeader>
                  <div className="mt-4 relative translate-y-0">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40" />
                    <Input
                      placeholder="Enter peer name..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="bg-white/5 border-white/10 text-white pl-10 h-12 rounded-2xl focus:ring-sky-500/50"
                    />
                  </div>
                </div>
                <ScrollArea className="h-80 p-4">
                  {isSearching ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
                      <Loader2 className="w-6 h-6 animate-spin mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest leading-none">Scanning Databases...</p>
                    </div>
                  ) : searchResults.length > 0 ? (
                    <div className="space-y-1">
                      {searchResults.map((user) => (
                        <button
                          key={user._id}
                          onClick={() => startNewChat(user)}
                          className="w-full p-3 rounded-2xl flex items-center gap-3 hover:bg-white/5 transition-all group text-left border border-transparent hover:border-white/5"
                        >
                          <Avatar className="w-10 h-10 rounded-xl border border-white/10">
                            <AvatarImage src={user.profilePic} />
                            <AvatarFallback className="bg-slate-800 text-xs font-bold text-sky-400">{user.fullName.substring(0, 2).toUpperCase()}</AvatarFallback>
                          </Avatar>
                          <div className="flex-1 min-w-0">
                            <h4 className="text-xs font-bold text-white truncate">{user.fullName}</h4>
                            <p className="text-[8px] font-black text-slate-500 uppercase tracking-widest line-clamp-1">{user.role || 'Member'}</p>
                          </div>
                          <ChevronRight className="w-4 h-4 text-white/20 group-hover:text-sky-400 group-hover:translate-x-1 transition-all" />
                        </button>
                      ))}
                    </div>
                  ) : searchQuery.length > 2 ? (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-50">
                      <CloseIcon className="w-6 h-6 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest leading-none">No Peers Located</p>
                    </div>
                  ) : (
                    <div className="flex flex-col items-center justify-center h-full py-20 opacity-30">
                      <UserIcon className="w-8 h-8 mb-2" />
                      <p className="text-[8px] font-black uppercase tracking-widest leading-none">Awaiting Target Input</p>
                    </div>
                  )}
                </ScrollArea>
              </DialogContent>
            </Dialog>
          </div>

          <div className="flex-1 rounded-3xl border border-white/10 bg-slate-900/30 overflow-hidden">
            {(ChannelList as any) && (
              <ChannelList
                filters={filters}
                sort={sort}
                onSelect={(channel: any) => {
                  setSelectedChannel(channel)
                  setShowMobileChat(true)
                }}
              />
            )}
          </div>
        </div>

        {/* Chat Area */}
        <div className={cn(
          "flex-1 flex flex-col rounded-3xl border border-white/10 bg-slate-900/30 overflow-hidden shadow-2xl transition-all duration-300",
          showMobileChat ? "flex" : "hidden md:flex"
        )}>
          {selectedChannel ? (
            <Channel channel={selectedChannel}>
              <Window>
                <div className="p-4 border-b border-white/5 bg-white/[0.02] flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Button
                      variant="ghost"
                      size="icon"
                      className="md:hidden text-white/40 hover:text-white"
                      onClick={() => setShowMobileChat(false)}
                    >
                      <ChevronRight className="w-5 h-5 rotate-180" />
                    </Button>
                    <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center border border-sky-500/20">
                      <MessageSquare className="w-5 h-5 text-sky-400" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-white uppercase italic tracking-tight">Encryption <span className="text-sky-400">Active</span></h4>
                      <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest leading-none">Secure Peer Session</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-1">
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartCall('audio')}
                      className="hidden sm:flex text-white/40 hover:text-sky-400 rounded-xl hover:bg-sky-500/10"
                    >
                      <Phone className="w-4 h-4" />
                    </Button>
                    <Button
                      variant="ghost"
                      size="icon"
                      onClick={() => handleStartCall('video')}
                      className="hidden sm:flex text-white/40 hover:text-sky-400 rounded-xl hover:bg-sky-500/10"
                    >
                      <Video className="w-4 h-4" />
                    </Button>
                    <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-xl hover:bg-white/5">
                      <MoreVertical className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
                <MessageList />
                <MessageInput />
              </Window>
              <Thread />
            </Channel>
          ) : (
            <div className="flex flex-col items-center justify-center h-full text-slate-500 space-y-4">
              <div className="w-16 h-16 rounded-[24px] bg-sky-500/5 flex items-center justify-center border border-sky-500/10">
                <MessageSquare className="w-8 h-8 opacity-20" />
              </div>
              <p className="text-[10px] font-black uppercase tracking-widest px-12 text-center leading-relaxed">
                Establish a secure connection <br /> to begin collaborative session.
              </p>
            </div>
          )}
        </div>
      </Chat>
    </div>
  )
}
