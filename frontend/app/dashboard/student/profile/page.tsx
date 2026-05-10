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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700 pb-20 pt-8">
            {/* Clean Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8 px-4">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="w-24 h-24 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 group-hover:scale-105 transition-all duration-500">
                            <AvatarImage src={user?.profile?.avatar} />
                            <AvatarFallback className="bg-slate-50 text-slate-400 text-2xl font-light">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <button className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-100 text-slate-400 rounded-2xl shadow-lg hover:text-slate-900 transition-colors z-10">
                            <Camera className="w-4 h-4" />
                        </button>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-light text-slate-800 tracking-tight leading-none">
                            {firstName} <span className="font-semibold text-slate-900">{lastName}</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                Grade {grade} Scholar
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Active Status</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button variant="outline" className="bg-white border-slate-100 text-slate-400 hover:text-slate-900 rounded-full h-12 px-6 font-bold text-[10px] uppercase tracking-widest transition-all">
                        Discard Changes
                    </Button>
                    <Button className="bg-slate-900 hover:bg-sky-600 text-white rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-200 transition-all">
                        <Save className="w-4 h-4" />
                        Update Profile
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 px-4">
                {/* Left Sidebar: Navigation */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="p-3 rounded-[40px] border border-slate-100 bg-white shadow-sm space-y-1">
                        {[
                            { label: "Identity & Bio", icon: User, active: true },
                            { label: "Security & Login", icon: Shield },
                            { label: "Notifications", icon: Bell },
                            { label: "Academic Records", icon: BookOpen },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={cn(
                                    "w-full p-5 rounded-[28px] flex items-center justify-between transition-all group",
                                    item.active ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-inner" : "text-slate-400 hover:bg-slate-50/50 hover:text-slate-600"
                                )}
                            >
                                <div className="flex items-center gap-4">
                                    <item.icon className={cn("w-4 h-4", item.active ? "text-slate-900" : "text-slate-300")} />
                                    <span className="text-[10px] font-black uppercase tracking-widest">{item.label}</span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", item.active ? "text-slate-900" : "text-slate-100")} />
                            </button>
                        ))}
                    </div>

                    <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                        <div className="relative z-10 space-y-6">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Profile Maturity</p>
                                <h4 className="text-3xl font-light text-slate-800">85<span className="text-sm font-medium text-slate-400">%</span></h4>
                            </div>
                            <div className="h-1.5 w-full bg-slate-200 rounded-full overflow-hidden">
                                <div className="h-full bg-slate-900 w-[85%] rounded-full transition-all duration-1000" />
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Complete your academic history to unlock <span className="text-slate-700">personalized insights</span>.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Right Area: Forms */}
                <div className="lg:col-span-8 space-y-8">
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm relative overflow-hidden">
                        <div className="relative z-10 space-y-12">
                            <section className="space-y-8">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Personal Identity</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">First Name</Label>
                                        <Input 
                                            defaultValue={firstName} 
                                            className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Last Name</Label>
                                        <Input 
                                            defaultValue={lastName} 
                                            className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Email Address</Label>
                                        <Input 
                                            defaultValue={email} 
                                            className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                        />
                                    </div>
                                    <div className="space-y-3 md:col-span-2">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Mission Statement (Bio)</Label>
                                        <Textarea
                                            defaultValue={`Grade ${grade} student passionate about learning and growth.`}
                                            className="bg-slate-50 border-transparent text-slate-900 min-h-[120px] rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all p-6 font-medium text-sm resize-none"
                                        />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-8 pt-8 border-t border-slate-50">
                                <div className="flex items-center gap-4">
                                    <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                    <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Academic Standing</h4>
                                </div>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Grade Level</Label>
                                        <Select defaultValue={grade}>
                                            <SelectTrigger className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 transition-all font-medium text-sm">
                                                <SelectValue />
                                            </SelectTrigger>
                                            <SelectContent className="bg-white border-slate-100 text-slate-900 rounded-2xl p-1 shadow-2xl">
                                                {[9, 10, 11, 12].map(g => (
                                                    <SelectItem key={g} value={g.toString()} className="rounded-xl focus:bg-slate-50">
                                                        Grade {g}
                                                    </SelectItem>
                                                ))}
                                            </SelectContent>
                                        </Select>
                                    </div>
                                    <div className="space-y-3">
                                        <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Academic Stream</Label>
                                        <div className="flex items-center gap-2 p-1.5 bg-slate-50 rounded-2xl border border-slate-100">
                                            {["Natural", "Social", "Common"].map((s) => (
                                                <button 
                                                    key={s}
                                                    className={cn(
                                                        "flex-1 h-11 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all",
                                                        s === "Natural" ? "bg-white text-slate-900 shadow-sm border border-slate-100" : "text-slate-400 hover:text-slate-600"
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
                </div>
            </div>
        </div>
    )
}
