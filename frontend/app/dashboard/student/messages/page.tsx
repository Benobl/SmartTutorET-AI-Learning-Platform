"use client"

import { Search, Send, Phone, Video, MoreVertical, Paperclip, Smile, ChevronRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { cn } from "@/lib/utils"
import { useState } from "react"

const CONTACTS = [
  { id: 1, name: "Dr. Kebede Kassaye", role: "Mathematics Tutor", avatar: "KK", online: true, lastMsg: "Don't forget the assignment.", time: "10:30 AM" },
  { id: 2, name: "Prof. Liya Tekle", role: "Physics Tutor", avatar: "LT", online: false, lastMsg: "The lab report looks good.", time: "Yesterday" },
  { id: 3, name: "Ms. Bethlehem Assefa", role: "English Tutor", avatar: "BA", online: true, lastMsg: "See you in class tomorrow.", time: "2 days ago" },
]

const MESSAGES = [
  { id: 1, text: "Hello Sarah, how's the calculus homework going?", sender: "tutor", time: "10:25 AM" },
  { id: 2, text: "Hi Dr. Kebede! It's going well, but I'm stuck on the third problem about limits.", sender: "me", time: "10:28 AM" },
  { id: 3, text: "Don't forget the assignment, it's due tomorrow.", sender: "tutor", time: "10:30 AM" },
]

export default function StudentMessages() {
  const [selectedContact, setSelectedContact] = useState(CONTACTS[0])
  const [showMobileChat, setShowMobileChat] = useState(false)

  return (
    <div className="h-[calc(100vh-12rem)] flex gap-6 animate-in fade-in slide-in-from-bottom-4 duration-700 relative overflow-hidden">
      {/* Contacts Sidebar */}
      <div className={cn(
        "w-full md:w-80 flex flex-col gap-4 transition-all duration-300",
        showMobileChat ? "hidden md:flex" : "flex"
      )}>
        <div className="relative group">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
          <Input
            placeholder="Search chats..."
            className="bg-white/5 border-white/10 text-white pl-10 h-11 rounded-2xl focus:ring-sky-500/50 transition-all"
          />
        </div>

        <ScrollArea className="flex-1 rounded-3xl border border-white/10 bg-white/5 p-2">
          <div className="space-y-1">
            {CONTACTS.map((contact) => (
              <button
                key={contact.id}
                onClick={() => {
                  setSelectedContact(contact)
                  setShowMobileChat(true)
                }}
                className={cn(
                  "w-full p-3 rounded-2xl flex items-center gap-3 transition-all group text-left",
                  selectedContact.id === contact.id ? "bg-sky-500/10 border-sky-500/20 border shadow-lg shadow-sky-500/5" : "hover:bg-white/5 border border-transparent"
                )}
              >
                <div className="relative">
                  <div className="w-11 h-11 rounded-xl bg-gradient-to-br from-slate-800 to-slate-900 flex items-center justify-center text-sm font-bold text-white border border-white/5 group-hover:scale-105 transition-transform">
                    {contact.avatar}
                  </div>
                  {contact.online && (
                    <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-emerald-500 rounded-full border-2 border-slate-950" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex justify-between items-start mb-0.5">
                    <h4 className="text-sm font-bold text-white truncate">{contact.name}</h4>
                    <span className="text-[10px] text-white/20 font-bold">{contact.time}</span>
                  </div>
                  <p className="text-xs text-white/40 truncate line-clamp-1">{contact.lastMsg}</p>
                </div>
              </button>
            ))}
          </div>
        </ScrollArea>
      </div>

      {/* Chat Area */}
      <div className={cn(
        "flex-1 flex flex-col rounded-3xl border border-white/10 bg-white/5 overflow-hidden shadow-2xl transition-all duration-300",
        showMobileChat ? "flex" : "hidden md:flex"
      )}>
        {/* Chat Header */}
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
            <div className="w-10 h-10 rounded-xl bg-slate-800 flex items-center justify-center text-xs font-bold text-white border border-white/5">
              {selectedContact.avatar}
            </div>
            <div>
              <h4 className="text-sm font-bold text-white">{selectedContact.name}</h4>
              <p className="text-[10px] text-sky-400 font-bold uppercase tracking-widest">{selectedContact.role}</p>
            </div>
          </div>
          <div className="flex items-center gap-1">
            <Button variant="ghost" size="icon" className="hidden sm:flex text-white/40 hover:text-white rounded-xl hover:bg-white/5">
              <Phone className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="hidden sm:flex text-white/40 hover:text-white rounded-xl hover:bg-white/5">
              <Video className="w-4 h-4" />
            </Button>
            <Button variant="ghost" size="icon" className="text-white/40 hover:text-white rounded-xl hover:bg-white/5">
              <MoreVertical className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Messages List */}
        <ScrollArea className="flex-1 p-6">
          <div className="space-y-6">
            <div className="text-center">
              <span className="text-[10px] text-white/20 font-bold uppercase tracking-[0.2em] bg-white/5 px-3 py-1 rounded-full border border-white/5">Today</span>
            </div>
            {MESSAGES.map((msg) => (
              <div key={msg.id} className={cn(
                "flex flex-col max-w-[85%] md:max-w-[70%]",
                msg.sender === "me" ? "ml-auto items-end" : "items-start"
              )}>
                <div className={cn(
                  "p-4 rounded-2xl text-sm leading-relaxed shadow-lg",
                  msg.sender === "me"
                    ? "bg-sky-500 text-white rounded-tr-none"
                    : "bg-white/5 text-white/80 border border-white/5 rounded-tl-none"
                )}>
                  {msg.text}
                </div>
                <span className="text-[10px] text-white/20 font-bold mt-1.5 px-1 uppercase tracking-wider">{msg.time}</span>
              </div>
            ))}
          </div>
        </ScrollArea>

        {/* Chat Input */}
        <div className="p-4 bg-white/[0.02] border-t border-white/5">
          <div className="relative group">
            <div className="absolute left-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
              <Button variant="ghost" size="icon" className="hidden xs:flex w-8 h-8 text-white/20 hover:text-white rounded-lg">
                <Paperclip className="w-4 h-4" />
              </Button>
              <Button variant="ghost" size="icon" className="w-8 h-8 text-white/20 hover:text-white rounded-lg">
                <Smile className="w-4 h-4" />
              </Button>
            </div>
            <Input
              placeholder={`Message ${selectedContact.name.split(' ')[1]}...`}
              className="bg-white/5 border-white/5 text-white pl-12 xs:pl-24 pr-12 h-12 rounded-2xl focus:ring-sky-500/30 transition-all border-0 shadow-none text-sm"
            />
            <button className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 bg-sky-500 text-white rounded-xl flex items-center justify-center hover:bg-sky-400 transition-colors shadow-lg shadow-sky-500/20">
              <Send className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
