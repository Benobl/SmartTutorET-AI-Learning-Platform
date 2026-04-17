"use client"

import { User, Mail, GraduationCap, School, MapPin, Camera, Save, Shield, Bell, ChevronRight, BookOpen, AlertCircle } from "lucide-react"
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

export default function StudentProfile() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        setUser(getCurrentUser())
    }, [])

    const initials = user ? `${user.firstName[0]}${user.lastName[0]}` : "U"
    const fullName = user ? `${user.firstName} ${user.lastName}` : "Authenticated User"
    const firstName = user ? user.firstName : ""
    const lastName = user ? user.lastName : ""
    const email = user ? user.email : "user@example.com"
    const grade = user ? user.grade : "12"

    return (
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-3xl font-bold text-white mb-1">My Profile</h1>
                    <p className="text-white/40 text-sm">Manage your personal information and student preferences.</p>
                </div>
                <Button className="bg-sky-500 hover:bg-sky-400 text-white rounded-xl gap-2 shadow-lg shadow-sky-500/20 px-6 font-semibold">
                    <Save className="w-4 h-4" />
                    Save Changes
                </Button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Left Side: Photo & Quick Nav */}
                <div className="space-y-6">
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/5 flex flex-col items-center text-center group relative overflow-hidden">
                        <div className="absolute inset-0 bg-gradient-to-br from-sky-500/5 to-indigo-500/5 transition-opacity opacity-0 group-hover:opacity-100 duration-500" />
                        <div className="relative mb-6">
                            <div className="w-32 h-32 rounded-3xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center text-4xl font-bold text-white shadow-2xl shadow-sky-500/20 group-hover:scale-105 transition-transform duration-500">
                                {initials}
                            </div>
                            <button className="absolute -bottom-2 -right-2 p-3 bg-slate-900 border border-white/10 text-white rounded-2xl shadow-xl hover:bg-sky-500 transition-colors">
                                <Camera className="w-4 h-4" />
                            </button>
                        </div>
                        <h3 className="text-xl font-bold text-white mb-1">{fullName}</h3>
                        <p className="text-xs text-white/40 font-bold uppercase tracking-widest bg-white/5 px-3 py-1 rounded-full inline-block border border-white/5">
                            Grade {grade} Student
                        </p>
                    </div>

                    <div className="p-2 rounded-3xl border border-white/10 bg-white/5 space-y-1">
                        {[
                            { label: "Personal Info", icon: User, active: true },
                            { label: "Accounts & Security", icon: Shield },
                            { label: "Notifications", icon: Bell },
                            { label: "Billing & Plans", icon: BookOpen },
                        ].map((item) => (
                            <button
                                key={item.label}
                                className={cn(
                                    "w-full p-3.5 rounded-2xl flex items-center justify-between transition-all group",
                                    item.active ? "bg-sky-500/10 text-sky-400 border border-sky-500/20 shadow-lg shadow-sky-500/5" : "text-white/40 hover:bg-white/5 border border-transparent"
                                )}
                            >
                                <div className="flex items-center gap-3">
                                    <item.icon className={cn("w-4 h-4", item.active ? "text-sky-400" : "text-white/30")} />
                                    <span className="text-sm font-semibold">{item.label}</span>
                                </div>
                                <ChevronRight className={cn("w-4 h-4", item.active ? "text-sky-400" : "text-white/10")} />
                            </button>
                        ))}
                    </div>
                </div>

                {/* Right Side: Form */}
                <div className="lg:col-span-2 space-y-6">
                    <div className="p-8 rounded-3xl border border-white/10 bg-white/5 space-y-8">
                        <div>
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <User className="w-5 h-5 text-sky-400" />
                                Personal Information
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white/60 ml-1 text-xs uppercase tracking-widest font-bold">First Name</Label>
                                    <Input defaultValue={firstName} className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-sky-500/30" />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-white/60 ml-1 text-xs uppercase tracking-widest font-bold">Last Name</Label>
                                    <Input defaultValue={lastName} className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-sky-500/30" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-white/60 ml-1 text-xs uppercase tracking-widest font-bold">Email Address</Label>
                                    <Input defaultValue={email} className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-sky-500/30" />
                                </div>
                                <div className="space-y-2 md:col-span-2">
                                    <Label className="text-white/60 ml-1 text-xs uppercase tracking-widest font-bold">Bio</Label>
                                    <Textarea
                                        defaultValue={`Grade ${grade} student passionate about learning and growth.`}
                                        className="bg-white/5 border-white/10 text-white min-h-[100px] rounded-xl focus:ring-sky-500/30 resize-none p-4"
                                    />
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5">
                            <h4 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
                                <GraduationCap className="w-5 h-5 text-sky-400" />
                                Academic Details
                            </h4>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label className="text-white/60 ml-1 text-xs uppercase tracking-widest font-bold">Current Grade</Label>
                                    <Select defaultValue={grade}>
                                        <SelectTrigger className="bg-white/5 border-white/10 text-white h-12 rounded-xl focus:ring-sky-500/30">
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent className="bg-slate-900 border-white/10 text-white">
                                            {[9, 10, 11, 12].map(g => (
                                                <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                                            ))}
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>
                        </div>

                        <div className="pt-8 border-t border-white/5 flex items-center justify-between">
                            <div className="flex items-center gap-3">
                                <div className="p-3 rounded-2xl bg-amber-500/10 text-amber-400">
                                    <AlertCircle className="w-5 h-5" />
                                </div>
                                <div>
                                    <p className="text-sm font-bold text-white">Profile Completion</p>
                                    <p className="text-xs text-white/40">Complete your bio and add an avatar to get discovered.</p>
                                </div>
                            </div>
                            <span className="text-lg font-bold text-white">85%</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
