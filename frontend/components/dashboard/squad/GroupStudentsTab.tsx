"use client"

import React, { useState } from "react"
import { Users, Search, MessageSquare, MoreVertical, Star, Shield, User, GraduationCap, MapPin, ExternalLink } from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { getCurrentUser } from "@/lib/auth-utils"

interface GroupStudentsTabProps {
    members: any[]
}

export function GroupStudentsTab({ members = [] }: GroupStudentsTabProps) {
    const [searchQuery, setSearchQuery] = useState("")
    const currentUser = getCurrentUser()
    const currentUserId = (currentUser?._id || currentUser?.id) as string

    const filteredMembers = members.filter(m => {
        const name = (m.fullName || m.name || "").toLowerCase()
        return name.includes(searchQuery.toLowerCase())
    })

    return (
        <div className="h-full flex flex-col bg-[#f8fafc] animate-in fade-in duration-500">
            {/* Header Area */}
            <div className="p-6 md:p-8 bg-white border-b border-slate-100 shadow-sm z-10">
                <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-6">
                    <div className="space-y-1">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-sky-50 text-sky-600 flex items-center justify-center shadow-sm">
                                <Users className="w-5 h-5" />
                            </div>
                            <h2 className="text-2xl font-black text-slate-900 tracking-tight">Squad Members</h2>
                        </div>
                        <p className="text-[11px] font-bold text-slate-400 uppercase tracking-[0.2em] ml-1">
                            {members.length} Intellectuals Enrolled in this Squad
                        </p>
                    </div>

                    <div className="relative group w-full md:w-80">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
                        <input
                            type="text"
                            placeholder="Search squad mates..."
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="w-full h-12 pl-11 pr-4 bg-slate-50 border-none rounded-2xl text-sm font-medium focus:ring-4 focus:ring-sky-500/5 focus:bg-white transition-all shadow-inner"
                        />
                    </div>
                </div>
            </div>

            {/* Scrollable Grid */}
            <div className="flex-1 overflow-y-auto p-6 md:p-8 scrollbar-hide">
                <div className="max-w-7xl mx-auto">
                    {filteredMembers.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-32 text-center">
                            <div className="w-24 h-24 rounded-[40px] bg-white shadow-xl flex items-center justify-center mb-6 text-slate-200">
                                <Users className="w-10 h-10" />
                            </div>
                            <h3 className="text-xl font-black text-slate-900 mb-1">No matches found</h3>
                            <p className="text-sm text-slate-400 font-medium italic">Try searching for a different name</p>
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
                                        className="group relative bg-white rounded-[32px] p-6 border border-slate-100 shadow-sm hover:shadow-2xl hover:border-sky-200 hover:-translate-y-1 transition-all duration-500 overflow-hidden"
                                    >
                                        {/* Background Decoration */}
                                        <div className="absolute -right-4 -top-4 w-24 h-24 bg-sky-50 rounded-full opacity-0 group-hover:opacity-100 group-hover:scale-150 transition-all duration-700 blur-2xl" />

                                        <div className="relative z-10">
                                            <div className="flex items-start justify-between mb-5">
                                                <div className="relative">
                                                    <div className="w-16 h-16 rounded-[24px] bg-slate-100 border-2 border-white shadow-lg overflow-hidden group-hover:scale-105 transition-transform duration-500">
                                                        {pic ? (
                                                            <img src={pic} className="w-full h-full object-cover" alt={name} />
                                                        ) : (
                                                            <div className="w-full h-full flex items-center justify-center text-sky-600 bg-sky-50 font-black text-xl uppercase">
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
                                                    {isMe && <span className="text-[8px] px-1.5 py-0.5 rounded-full bg-sky-100 text-sky-600 border border-sky-200 font-black tracking-tighter">YOU</span>}
                                                </div>
                                                <div className="flex items-center gap-1.5 text-slate-400">
                                                    <GraduationCap className="w-3 h-3" />
                                                    <span className="text-[10px] font-bold uppercase tracking-widest leading-none">{grade}</span>
                                                </div>
                                            </div>

                                            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-50">
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Role</span>
                                                    <div className="flex items-center gap-1">
                                                        {i === 0 ? <Shield className="w-2.5 h-2.5 text-amber-500" /> : <User className="w-2.5 h-2.5 text-sky-500" />}
                                                        <span className="text-[10px] font-black text-slate-700 truncate">{role}</span>
                                                    </div>
                                                </div>
                                                <div className="flex flex-col">
                                                    <span className="text-[8px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1">Status</span>
                                                    <div className="flex items-center gap-1">
                                                        <div className={cn("w-1.5 h-1.5 rounded-full", isMe ? "bg-sky-500" : "bg-emerald-400")} />
                                                        <span className="text-[10px] font-black text-slate-700">{isMe ? "Active Now" : "Online"}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div className="mt-6 flex gap-2">
                                                {!isMe ? (
                                                    <>
                                                        <Button 
                                                            variant="default" 
                                                            className="flex-1 h-10 rounded-xl bg-sky-600 hover:bg-sky-700 text-white shadow-lg shadow-sky-600/20 text-[10px] font-black uppercase tracking-widest gap-2"
                                                        >
                                                            <MessageSquare className="w-3 h-3" /> Chat
                                                        </Button>
                                                        <Button 
                                                            variant="outline" 
                                                            className="w-10 h-10 rounded-xl p-0 border-slate-100 hover:border-sky-200 hover:bg-sky-50 text-slate-400 hover:text-sky-600 transition-all"
                                                        >
                                                            <ExternalLink className="w-4 h-4" />
                                                        </Button>
                                                    </>
                                                ) : (
                                                    <Button 
                                                        variant="secondary" 
                                                        className="w-full h-10 rounded-xl bg-slate-50 text-slate-400 font-black text-[10px] uppercase tracking-widest border border-slate-100 cursor-default"
                                                    >
                                                        Your Profile
                                                    </Button>
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

        </div>
    )
}
