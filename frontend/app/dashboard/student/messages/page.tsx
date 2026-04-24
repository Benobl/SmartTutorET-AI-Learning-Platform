"use client"

import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ChevronRight, Check, CheckCheck, MessageSquare } from "lucide-react"
import { toast } from "@/hooks/use-toast"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState, useEffect, useRef } from "react"
import { getSocket, initializeSocket } from "@/lib/socket"
import { fetchWithAuth } from "@/lib/api"

// Note: In a real app, get user from auth context or localStorage
const getAuthData = () => {
  if (typeof window !== "undefined") {
    const userStr = localStorage.getItem("user");
    const token = localStorage.getItem("token");
    return {
      user: userStr ? JSON.parse(userStr) : { id: "guest", fullName: "Guest User" },
      token
    };
  }
  return { user: { id: "guest", fullName: "Guest User" }, token: null };
};

export default function StudentMessages() {
  const { user } = getAuthData();
  const [contacts, setContacts] = useState<any[]>([])
  const [selectedContact, setSelectedContact] = useState<any>(null)
  const [showMobileChat, setShowMobileChat] = useState(false)
  const [messages, setMessages] = useState<any[]>([])
  const [newMessage, setNewMessage] = useState("")
  const [searchEmail, setSearchEmail] = useState("")
  const [isTyping, setIsTyping] = useState(false)
  const [typingUsers, setTypingUsers] = useState<string[]>([])
  const socketRef = useRef<any>(null)

  useEffect(() => {
    if (user.id === "guest") return;

    // Fetch initial contacts (e.g. recent chats or friends)
    const fetchFriends = async () => {
      const auth = getAuthData();
      if (!auth.token) {
        console.log("No token found, skipping fetchFriends");
        return;
      }
      try {
        const friends = await fetchWithAuth("/users/students"); // Or a more specific endpoint
        setContacts(friends.map((f: any) => ({
          id: f._id,
          name: f.fullName,
          avatar: f.fullName[0],
          email: f.email,
          online: true
        })));
      } catch (err) { console.error(err); }
    };
    fetchFriends();

    const socket = initializeSocket(user.id)
    socketRef.current = socket

    socket.on("newMessage", (message: any) => {
      setMessages((prev) => [...prev, { ...message, sender: "tutor", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "received" }])
      // Send seen event
      socket.emit("message-seen", { senderId: message.senderId || selectedContact?.id });
    })

    socket.on("typing", (data: any) => {
      setTypingUsers(prev => [...new Set([...prev, data.senderId])]);
    })

    socket.on("stop-typing", (data: any) => {
      setTypingUsers(prev => prev.filter(id => id !== data.senderId));
    })

    socket.on("message-seen", (data: any) => {
      setMessages(prev => prev.map(m => m.sender === "me" ? { ...m, status: "seen" } : m));
    })

    return () => {
      socket.off("newMessage")
      socket.off("typing")
      socket.off("stop-typing")
      socket.off("message-seen")
    }
  }, [user.id])

  const handleSearchUser = async () => {
    if (!searchEmail.trim()) return;
    try {
      const foundUser = await fetchWithAuth(`/users/search?email=${searchEmail}`);
      const contact = {
        id: foundUser._id,
        name: foundUser.fullName,
        avatar: foundUser.fullName[0],
        email: foundUser.email,
        online: true
      };
      setContacts(prev => {
        if (prev.find(c => c.id === contact.id)) return prev;
        return [contact, ...prev];
      });
      setSelectedContact(contact);
    } catch (err) {
      toast({
        title: "Transmission Failed",
        description: "No student found with this signature (email).",
        variant: "destructive"
      });
      console.error("Not Found", "No user found with this email.");
    }
  }

  const handleSendMessage = () => {
    if (!newMessage.trim() || !selectedContact) return

    const msgData = {
      receiverId: selectedContact.id.toString(),
      message: { text: newMessage, id: Date.now(), sender: "me" }
    }

    socketRef.current.emit("sendMessage", msgData)
    setMessages((prev) => [...prev, { id: Date.now(), text: newMessage, sender: "me", time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }), status: "sent" }])
    setNewMessage("")
    socketRef.current.emit("stop-typing", { receiverId: selectedContact.id });
  }

  const handleTyping = (e: any) => {
    setNewMessage(e.target.value);
    if (!selectedContact) return;
    socketRef.current.emit("typing", { receiverId: selectedContact.id });

    // debounce stop typing
    clearTimeout((window as any).typingTimeout);
    (window as any).typingTimeout = setTimeout(() => {
      socketRef.current.emit("stop-typing", { receiverId: selectedContact.id });
    }, 2000);
  }

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden bg-[#0F172A] p-6 rounded-[48px] border border-slate-800 shadow-2xl">
      {/* Sidebar - Contacts List */}
      <div className={cn(
        "w-full md:w-[350px] flex flex-col gap-6",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="space-y-4">
          <div className="relative group">
            <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500 group-focus-within:text-sky-500 transition-colors" />
            <Input
              placeholder="Search by email (e.g. student@test.com)"
              value={searchEmail}
              onChange={(e) => setSearchEmail(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleSearchUser()}
              className="bg-slate-800/50 border-slate-700 text-white pl-12 h-14 rounded-2xl focus:ring-sky-500/30 transition-all shadow-none text-sm placeholder:text-slate-500"
            />
          </div>

          {contacts.length === 0 && (
            <div className="px-2 py-4">
              <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-4">Suggested Transmission</p>
              <div className="space-y-2">
                {["nebil@test.com", "sarah@test.com"].map(email => (
                  <button
                    key={email}
                    onClick={() => { setSearchEmail(email); }}
                    className="w-full text-left p-3 rounded-xl hover:bg-slate-800/50 border border-transparent hover:border-slate-700 transition-all text-[11px] text-slate-400 font-bold"
                  >
                    {email}
                  </button>
                ))}
              </div>
            </div>
          )}
        </div>

        <ScrollArea className="flex-1 rounded-3xl border border-slate-800 bg-slate-900/50 p-2">
          <div className="space-y-1">
            {contacts.map((contact: any) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact)
                  setShowMobileChat(true)
                }}
                className={cn(
                  "w-full p-4 rounded-2xl flex items-center gap-3 transition-all group text-left",
                  selectedContact?.id === contact.id ? "bg-sky-500/20 border-sky-500/30 border shadow-lg shadow-sky-500/10" : "hover:bg-slate-800/50 border border-transparent"
                )}
              >
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-sm">
                    {contact.avatar}
                  </div>
                  {contact.online && <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-center mb-0.5">
                    <h3 className="text-sm font-bold text-white truncate group-hover:text-sky-400 transition-colors">{contact.name}</h3>
                  </div>
                  <p className="text-[11px] text-slate-400 truncate leading-relaxed">{contact.email}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Main Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col bg-slate-900/80 rounded-[32px] border border-slate-800 overflow-hidden shadow-2xl relative",
        !showMobileChat ? "hidden md:flex" : "flex"
      )}>
        {!selectedContact ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-10">
            <div className="w-24 h-24 rounded-3xl bg-slate-800 border border-slate-700 flex items-center justify-center mb-8 shadow-inner">
              <MessageSquare className="w-12 h-12 text-sky-500/40" />
            </div>
            <h2 className="text-2xl font-black text-white mb-3 uppercase tracking-tight">Encrypted Terminal</h2>
            <p className="text-sm text-slate-400 max-w-xs leading-relaxed font-bold uppercase tracking-widest text-[10px]">Initialize connection via email search to begin transmission.</p>
          </div>
        ) : (
          <>
            {/* Chat Header */}
            <div className="p-5 md:p-7 border-b border-slate-800 flex items-center justify-between bg-slate-900/50 backdrop-blur-md">
              <div className="flex items-center gap-4">
                <Button variant="ghost" size="icon" onClick={() => setShowMobileChat(false)} className="md:hidden text-slate-400 hover:text-white rounded-xl">
                  <ChevronRight className="w-5 h-5 rotate-180" />
                </Button>
                <div className="relative">
                  <div className="w-12 h-12 rounded-xl bg-slate-800 border border-slate-700 flex items-center justify-center text-sky-400 font-bold text-lg">
                    {selectedContact.avatar}
                  </div>
                  <div className="absolute -bottom-1 -right-1 w-3.5 h-3.5 bg-emerald-500 border-2 border-slate-900 rounded-full" />
                </div>
                <div>
                  <h3 className="text-base font-black text-white leading-tight uppercase tracking-wide">{selectedContact.name}</h3>
                  <div className="flex items-center gap-2 mt-1">
                    {typingUsers.includes(selectedContact.id) ? (
                      <span className="flex items-center gap-1.5">
                        <span className="w-1.5 h-1.5 bg-sky-500 rounded-full animate-pulse" />
                        <p className="text-[10px] text-sky-400 font-black uppercase tracking-widest">Typing Signals...</p>
                      </span>
                    ) : (
                      <p className="text-[10px] text-emerald-500 font-black uppercase tracking-widest">Connection Active</p>
                    )}
                  </div>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="icon" className="w-11 h-11 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 rounded-2xl border border-transparent hover:border-sky-500/20 transition-all">
                  <Phone className="w-5 h-5" />
                </Button>
                <Button variant="ghost" size="icon" className="w-11 h-11 text-slate-400 hover:text-sky-500 hover:bg-sky-500/10 rounded-2xl border border-transparent hover:border-sky-500/20 transition-all">
                  <Video className="w-5 h-5" />
                </Button>
                <div className="w-px h-6 bg-slate-800 mx-2" />
                <Button variant="ghost" size="icon" className="w-11 h-11 text-slate-400 hover:text-white rounded-2xl transition-all">
                  <MoreVertical className="w-5 h-5" />
                </Button>
              </div>
            </div>

            {/* Messages List */}
            <ScrollArea className="flex-1 p-6 md:p-8 bg-slate-950/30">
              <div className="space-y-8">
                {messages.map((msg) => (
                  <div key={msg.id} className={cn(
                    "flex flex-col max-w-[85%] md:max-w-[70%] group/msg",
                    msg.sender === "me" ? "ml-auto items-end" : "items-start"
                  )}>
                    <div className={cn(
                      "p-5 rounded-3xl text-sm font-medium leading-relaxed tracking-wide shadow-xl transition-all",
                      msg.sender === "me"
                        ? "bg-sky-600 text-white rounded-tr-none shadow-sky-900/20"
                        : "bg-slate-800 text-slate-100 border border-slate-700 rounded-tl-none shadow-black/20"
                    )}>
                      {msg.text}
                    </div>
                    <div className="flex items-center gap-2 mt-2 px-1 opacity-40 group-hover/msg:opacity-100 transition-opacity">
                      <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">{msg.time}</span>
                      {msg.sender === "me" && (
                        msg.status === "seen" ? <CheckCheck className="w-3.5 h-3.5 text-sky-400" /> : <Check className="w-3.5 h-3.5 text-slate-500" />
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>

            {/* Chat Input */}
            <div className="p-6 bg-slate-900/50 border-t border-slate-800 backdrop-blur-md">
              <div className="relative group/input">
                <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
                  <Button variant="ghost" size="icon" className="w-10 h-10 text-slate-500 hover:text-white rounded-xl hover:bg-slate-800 transition-all">
                    <Paperclip className="w-5 h-5" />
                  </Button>
                </div>
                <Input
                  placeholder={`Compose message to ${selectedContact.name.split(' ')[0]}...`}
                  value={newMessage}
                  onChange={handleTyping}
                  onKeyPress={(e) => e.key === 'Enter' && handleSendMessage()}
                  className="bg-slate-950 border-slate-700 text-white pl-16 pr-16 h-14 rounded-[20px] focus:ring-sky-500/30 transition-all border shadow-2xl text-sm placeholder:text-slate-600"
                />
                <button
                  onClick={handleSendMessage}
                  className="absolute right-3 top-1/2 -translate-y-1/2 w-10 h-10 bg-sky-600 text-white rounded-xl flex items-center justify-center hover:bg-sky-500 transition-all shadow-lg shadow-sky-900/40 active:scale-95">
                  <Send className="w-5 h-5" />
                </button>
              </div>
            </div>
          </>
        )}
      </div>
    </div>
  )
}
