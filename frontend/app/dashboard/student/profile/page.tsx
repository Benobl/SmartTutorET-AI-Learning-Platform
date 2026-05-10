"use client"

import { User, Mail, GraduationCap, Camera, Save, Shield, Bell, ChevronRight, BookOpen, AlertCircle, MapPin, AtSign, Calendar, Sparkles } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select"
import { cn } from "@/lib/utils"
import { getCurrentUser } from "@/lib/auth-utils"
import { useState, useEffect } from "react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"

export default function StudentProfile() {
    const [user, setUser] = useState<any>(null)
    const [isLoading, setIsLoading] = useState(false)

    useEffect(() => {
        setUser(getCurrentUser())
    }, [])

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : "U"
    const fullName = user?.name || "Authenticated User"
    const firstName = user?.name?.split(' ')[0] || ""
    const lastName = user?.name?.split(' ').slice(1).join(' ') || ""
    const email = user ? user.email : "user@example.com"
    const grade = user ? user.grade : "12"

    return (
        <div className="max-w-6xl mx-auto space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 bg-slate-900/50 p-6 rounded-[2.5rem] border border-white/5 backdrop-blur-xl">
                <div className="flex items-center gap-5">
                    <div className="relative group">
                        <Avatar className="w-20 h-20 rounded-[2rem] border-2 border-sky-500/30 shadow-2xl shadow-sky-500/20 group-hover:scale-105 transition-all duration-500">
                            <AvatarImage src={user?.profile?.avatar} />
                            <AvatarFallback className="bg-gradient-to-br from-sky-500 to-indigo-600 text-white text-2xl font-black">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute -bottom-1 -right-1 p-2 bg-slate-900 border border-white/10 text-white rounded-xl shadow-xl hover:bg-sky-500 transition-colors z-10">
                            <Camera className="w-3.5 h-3.5" />
                        </button>
                    </div>
                    <div>
                        <h1 className="text-2xl font-black text-white tracking-tight flex items-center gap-2">
                            {fullName}
                            <span className="p-1 rounded-lg bg-sky-500/10 text-sky-400">
                                <Sparkles className="w-4 h-4" />
                            </span>
                        </h1>
                        <div className="flex items-center gap-3 mt-1">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-white/40 bg-white/5 px-2.5 py-1 rounded-lg border border-white/5">
                                Grade {grade} Student
                            </span>
                            <span className="w-1 h-1 bg-white/10 rounded-full" />
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-sky-400">Active Scholar</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-transparent border-white/10 text-white hover:bg-white/5 rounded-2xl h-12 px-6 font-bold text-xs uppercase tracking-widest transition-all">
                        Discard
                    </Button>
                    <Button className="bg-sky-500 hover:bg-sky-400 text-white rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest gap-2 shadow-xl shadow-sky-500/20 active:scale-95 transition-all">
                        <Save className="w-4 h-4" />
                        Sync Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
                {/* Left Sidebar: Navigation & Quick Stats */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-2 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-md space-y-1">
                        {[
                            { label: "Identity & Bio", icon: User, active: true },
                            { label: "Security Hub", icon: Shield },
                            { label: "Transmission Prefs", icon: Bell },
                            { label: "Academic Vault", icon: BookOpen },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={cn(
                                    "w-full p-4 rounded-3xl flex items-center justify-between transition-all group",
                                    item.active ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5" : "text-white/40 hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <div className={cn("p-2 rounded-xl transition-colors", item.active ? "bg-sky-500/20" : "bg-white/5 group-hover:bg-white/10")}>
                                        <item.icon className={cn("w-4 h-4", item.active ? "text-sky-400" : "text-white/30")} />
                                    </div>
                                    <span className="text-xs font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", item.active ? "text-sky-400" : "text-white/10")} />
                            </button>
                        ))}
                    </div>

                    <div className="p-6 rounded-[2.5rem] border border-white/10 bg-gradient-to-br from-sky-500/10 to-indigo-600/10 backdrop-blur-md relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-4 opacity-10 group-hover:scale-110 transition-transform duration-700">
                            <Sparkles className="w-20 h-20 text-sky-400" />
                        </div>
                        <div className="relative z-10">
                            <div className="flex items-center justify-between mb-4">
                                <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400">Scholar Progress</p>
                                <span className="text-xl font-black text-white">85%</span>
                            </div>
                            <div className="h-2 w-full bg-white/5 rounded-full overflow-hidden border border-white/5">
                                <div className="h-full bg-gradient-to-r from-sky-500 to-indigo-500 w-[85%] rounded-full shadow-[0_0_15px_rgba(14,165,233,0.5)]" />
                            </div>
                            <p className="text-[10px] text-white/40 font-medium mt-4 leading-relaxed">
                                Complete your <span className="text-white">academic history</span> to unlock personalized study recommendations.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Area: Content Forms */}
                <div className="lg:col-span-8 space-y-6">
                    <div className="p-8 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-md relative overflow-hidden">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-sky-500/5 blur-[100px] rounded-full -mr-32 -mt-32" />
                        
                        <div className="relative z-10 space-y-8">
                            <section>
                                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <div className="w-8 h-px bg-white/10" />
                                    Personal Identity
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">First Name</Label>
                                        <div className="relative group">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-sky-500 transition-colors" />
                                            <Input 
                                                defaultValue={firstName} 
                                                className="bg-white/5 border-white/10 text-white h-12 pl-12 rounded-2xl focus:ring-sky-500/20 focus:border-sky-500/30 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">Last Name</Label>
                                        <div className="relative group">
                                            <AtSign className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-sky-500 transition-colors" />
                                            <Input 
                                                defaultValue={lastName} 
                                                className="bg-white/5 border-white/10 text-white h-12 pl-12 rounded-2xl focus:ring-sky-500/20 focus:border-sky-500/30 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">Universal Contact (Email)</Label>
                                        <div className="relative group">
                                            <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/20 group-focus-within:text-sky-500 transition-colors" />
                                            <Input 
                                                defaultValue={email} 
                                                className="bg-white/5 border-white/10 text-white h-12 pl-12 rounded-2xl focus:ring-sky-500/20 focus:border-sky-500/30 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                    </div>
                                    <div className="space-y-2.5 md:col-span-2">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">Scholar Mission (Bio)</Label>
                                        <Textarea
                                            defaultValue={`Grade ${grade} student passionate about learning and growth.`}
                                            className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-2xl focus:ring-sky-500/20 focus:border-sky-500/30 transition-all p-4 font-medium text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="pt-8 border-t border-white/5">
                                <h4 className="text-xs font-black text-white/40 uppercase tracking-[0.3em] mb-6 flex items-center gap-3">
                                    <div className="w-8 h-px bg-white/10" />
                                    Academic Standing
                                </h4>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">Current Grade Level</Label>
                                        <Select defaultValue={grade}>
                                            <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-2xl focus:ring-sky-500/20 transition-all font-medium text-sm">
                                                <div className="flex items-center gap-3">
                                                    <GraduationCap className="w-4 h-4 text-sky-400" />
                                                    <SelectValue />
                                                </div>
                                            </SelectTrigger>
                                            <SelectContent className="bg-slate-900 border-white/10 text-white rounded-2xl p-1">
                                                {[9, 10, 11, 12].map(g => (
                                                    <SelectItem key={g} value={g.toString()} className="rounded-xl focus:bg-sky-500/10 focus:text-sky-400">
                                                        Grade {g} - High School
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-2.5">
                                        <Label className="text-[10px] text-white/40 uppercase tracking-widest font-black ml-1">Academic Stream</Label>
                                        <div className="flex items-center gap-2 p-1 bg-white/5 rounded-2xl border border-white/5">
                                            {["Natural", "Social", "Common"].map((s) => (
                                                <button 
                                                    key={s}
                                                    className={cn(
                                                        "flex-1 h-10 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        s === "Natural" ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20" : "text-white/40 hover:bg-white/5"
                                                    )}
                                                >
                                                    {s}
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </section>
                        </div>
                    </div>

                    {/* Quick Action Footer Card */}
                    <div className="p-6 rounded-[2.5rem] border border-white/10 bg-slate-900/40 backdrop-blur-md flex flex-col md:flex-row items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                            <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-500">
                                <AlertCircle className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-sm font-black text-white">Trust & Security</p>
                                <p className="text-[10px] text-white/40 font-medium">Your data is encrypted using end-to-end industry standards.</p>
                            </div>
                        </div>
                        <Button variant="ghost" className="text-[10px] font-black uppercase tracking-[0.2em] text-white/60 hover:text-white hover:bg-white/5 rounded-xl h-10">
                            Download Academic Data
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
