"use client"

import React, { useState } from "react"
import { Users, Search, MessageSquare, MoreVertical, Shield, User, GraduationCap, ExternalLink, X } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-utils"
import { DirectChat } from "@/components/dashboard/chat/DirectChat"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface GroupStudentsTabProps {
    members: any[]
}

export function GroupStudentsTab({ members = [] }: GroupStudentsTabProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedUser, setSelectedUser] = useState<any | null>(null)
    const currentUser = getCurrentUser()
    const currentUserId = (currentUser?._id || currentUser?.id) as string

    const filteredMembers = members.filter(m => {
        const name = (m.fullName || m.name || "").toLowerCase()
        return name.includes(searchQuery.toLowerCase())
    })

    return (
        <div className="h-full flex flex-col bg-white animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="p-8 bg-white border-b border-slate-100 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-slate-900 text-white flex items-center justify-center shadow-lg">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Squad Members</h2>
                        </div>
                        <p className="text-[10px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                            {members.length} Intellectuals in this Hub
                        </p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-600 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search squad mates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border border-slate-100 rounded-2xl text-xs font-medium outline-none focus:ring-4 focus:ring-sky-500/5 focus:bg-white focus:border-sky-300 transition-all shadow-sm"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-8 scrollbar-hide">
                <div className="max-w-7xl mx-auto">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-24 h-24 rounded-[40px] bg-slate-50 border border-dashed border-slate-200 flex items-center justify-center mb-6 text-slate-300">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-widest">No scholars found</h3>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                            {filteredMembers.map((member, i) => {
                                const mid = (member._id || member.id || member) as string
                                const isMe = mid === currentUserId
                                const name = member.fullName || member.name || "Scholar"
                                const pic = member.profilePic || member.pic || ""
                                const role = member.role || (i === 0 ? "Squad Leader" : "Member")
                                const grade = member.grade ? `Grade ${member.grade}` : "High Scholar"
                                
                                return (
                                    <div 
                                        key={mid}
                                        className="group relative bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:shadow-slate-200/50 hover:border-sky-200 hover:-translate-y-1.5 transition-all duration-500 overflow-hidden"
                                    >
                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-6">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-[24px] bg-slate-50 border-2 border-white shadow-md overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                                        {pic ? (
                                                            <img src={pic} className="w-full h-full object-cover" alt={name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sky-600 bg-sky-50 font-black text-xl uppercase italic">
                                                                {name[0]}
                                                            </div>
                                                        )}
                                                    </div>
                                                    <span className={cn(
                                                        "absolute -bottom-1 -right-1 w-5 h-5 rounded-full border-4 border-white shadow-sm",
                                                        isMe ? "bg-sky-500" : "bg-emerald-400 animate-pulse"
                                                    )} />
                                                </div>
                                                <button className="p-2 rounded-xl hover:bg-slate-50 text-slate-300 hover:text-slate-600 transition-colors">
                                                    <MoreVertical className="w-4 h-4" />
                                                </button>
                                            </div>

                                            <div className="space-y-1 mb-6">
                                                <div className="flex items-center gap-2">
                                                    <h4 className="text-base font-black text-slate-900 truncate tracking-tight">{name}</h4>
                                                    {isMe && <span className="text-[8px] px-2 py-0.5 rounded-full bg-slate-900 text-white font-black tracking-widest">YOU</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <GraduationCap className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{grade}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-6 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Rank</span>
                                                    <div className="flex items-center gap-1.5">
                                                        {i === 0 ? <Shield className="w-3 h-3 text-amber-500" /> : <User className="w-3 h-3 text-sky-500" />}
                                                        <span className="text-[10px] font-black text-slate-700 truncate uppercase">{role}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Presence</span>
                                                    <div className="flex items-center gap-1.5">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isMe ? "bg-sky-500" : "bg-emerald-400")} />
                                                        <span className="text-[10px] font-black text-slate-700 uppercase">{isMe ? "Online" : "Active"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-8 flex gap-2">
                                                {!isMe ? (
                                                    <>
                                                        <Button 
                                                            variant="default" 
                                                            onClick={() => setSelectedUser(member)}
                                                            className="flex-1 h-11 rounded-2xl bg-slate-900 hover:bg-slate-800 text-white shadow-xl shadow-slate-100 text-[10px] font-black uppercase tracking-widest gap-2 active:scale-95 transition-all"
                                                        >
                                                            <MessageSquare className="w-3.5 h-3.5" /> Message
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-11 h-11 rounded-2xl p-0 border-slate-100 hover:border-sky-200 hover:bg-sky-50 text-slate-300 hover:text-sky-600 transition-all"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <div className="w-full h-11 rounded-2xl bg-slate-50 flex items-center justify-center text-[9px] font-black text-slate-300 uppercase tracking-[0.2em] border border-slate-100">
                                                        Personal Profile
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                )
                            })}
                        </div>
                    )}
                </div>
            </div>

            {/* DIRECT CHAT MODAL */}
            <Dialog open={!!selectedUser} onOpenChange={() => setSelectedUser(null)}>
                <DialogContent className="max-w-2xl h-[80vh] p-0 overflow-hidden border-none rounded-[40px] shadow-2xl">
                    {selectedUser && (
                        <div className="flex flex-col h-full bg-white relative">
                            <button 
                                onClick={() => setSelectedUser(null)}
                                className="absolute top-4 right-6 z-[60] w-10 h-10 rounded-2xl bg-white/10 hover:bg-white/20 backdrop-blur-md text-white flex items-center justify-center transition-all"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="flex-1 min-h-0">
                                <DirectChat otherUser={selectedUser} onBack={() => setSelectedUser(null)} />
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

        </div>
    )
}
