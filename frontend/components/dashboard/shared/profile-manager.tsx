"use client"

import { useState, useEffect } from "react"
import { User, Mail, Camera, Save, Shield, Bell, ChevronRight, Lock, Key, Loader2, CheckCircle2 } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { cn } from "@/lib/utils"
import { userApi, uploadApi } from "@/lib/api"
import { toast } from "sonner"

interface ProfileManagerProps {
    currentUser: any
    onUpdate?: (updatedUser: any) => void
}

export function ProfileManager({ currentUser, onUpdate }: ProfileManagerProps) {
    const [user, setUser] = useState(currentUser)
    const [activeSection, setActiveSection] = useState<"profile" | "security">("profile")
    const [isLoading, setIsLoading] = useState(false)
    const [isUploading, setIsUploading] = useState(false)

    // Form states
    const [formData, setFormData] = useState({
        name: currentUser?.name || "",
        email: currentUser?.email || "",
        bio: currentUser?.profile?.bio || "",
    })

    const [passwordData, setPasswordData] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    })

    useEffect(() => {
        if (currentUser) {
            setUser(currentUser)
            setFormData({
                name: currentUser.name || "",
                email: currentUser.email || "",
                bio: currentUser.profile?.bio || "",
            })
        }
    }, [currentUser])

    const handleProfileUpdate = async () => {
        try {
            setIsLoading(true)
            const res = await userApi.updateProfile({
                name: formData.name,
                email: formData.email,
                profile: { ...user.profile, bio: formData.bio }
            })

            if (res.success) {
                const updated = res.data
                setUser(updated)
                localStorage.setItem("smarttutor_user", JSON.stringify(updated))
                toast.success("Profile Updated", {
                    description: "Your personal information has been synchronized successfully."
                })
                if (onUpdate) onUpdate(updated)
            }
        } catch (error: any) {
            toast.error("Update Failed", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleChangePassword = async () => {
        if (passwordData.newPassword !== passwordData.confirmPassword) {
            return toast.error("Passwords Mismatch", { description: "The new password and confirmation do not match." })
        }

        try {
            setIsLoading(true)
            const res = await userApi.changePassword({
                currentPassword: passwordData.currentPassword,
                newPassword: passwordData.newPassword
            })

            if (res.success) {
                toast.success("Password Changed", {
                    description: "Your security credentials have been updated successfully."
                })
                setPasswordData({ currentPassword: "", newPassword: "", confirmPassword: "" })
            }
        } catch (error: any) {
            toast.error("Update Failed", { description: error.message })
        } finally {
            setIsLoading(false)
        }
    }

    const handleAvatarUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (!file) return

        try {
            setIsUploading(true)
            const res = await uploadApi.uploadDocument(file, "avatar")
            if (res.url) {
                const updatedProfile = { ...user.profile, avatar: res.url }
                const updateRes = await userApi.updateProfile({ profile: updatedProfile })
                
                if (updateRes.success) {
                    const updatedUser = updateRes.data
                    setUser(updatedUser)
                    localStorage.setItem("smarttutor_user", JSON.stringify(updatedUser))
                    toast.success("Avatar Updated", { description: "Your profile picture has been refreshed." })
                    if (onUpdate) onUpdate(updatedUser)
                }
            }
        } catch (error: any) {
            toast.error("Upload Failed", { description: error.message })
        } finally {
            setIsUploading(false)
        }
    }

    const initials = user?.name ? user.name.split(' ').map((n: string) => n[0]).join('').toUpperCase().slice(0, 2) : "U"

    return (
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in duration-700">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-8">
                <div className="flex items-center gap-6">
                    <div className="relative group">
                        <Avatar className="w-24 h-24 rounded-[32px] border border-slate-100 shadow-xl shadow-slate-100 group-hover:scale-105 transition-all duration-500">
                            <AvatarImage src={user?.profile?.avatar} className="object-cover" />
                            <AvatarFallback className="bg-slate-50 text-slate-400 text-2xl font-light">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <label className="absolute -bottom-2 -right-2 p-2.5 bg-white border border-slate-100 text-slate-400 rounded-2xl shadow-lg hover:text-slate-900 transition-all cursor-pointer hover:scale-110 active:scale-95 z-10">
                            {isUploading ? <Loader2 className="w-4 h-4 animate-spin text-sky-500" /> : <Camera className="w-4 h-4" />}
                            <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                        </label>
                    </div>
                    <div className="space-y-2">
                        <h1 className="text-4xl font-light text-slate-800 tracking-tight leading-none">
                            {user?.name?.split(' ')[0]} <span className="font-semibold text-slate-900">{user?.name?.split(' ').slice(1).join(' ')}</span>
                        </h1>
                        <div className="flex items-center gap-3">
                            <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400 bg-slate-50 px-3 py-1 rounded-full border border-slate-100">
                                {user?.role} Account
                            </span>
                            <div className="w-1 h-1 rounded-full bg-slate-200" />
                            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-emerald-500">Active Status</span>
                        </div>
                    </div>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        disabled={isLoading}
                        onClick={activeSection === "profile" ? handleProfileUpdate : handleChangePassword}
                        className="bg-slate-900 hover:bg-sky-600 text-white rounded-full h-12 px-8 font-bold text-[10px] uppercase tracking-widest gap-2 shadow-xl shadow-slate-200 transition-all"
                    >
                        {isLoading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                        Update {activeSection === "profile" ? "Profile" : "Security"}
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                {/* Sidebar */}
                <div className="lg:col-span-4 space-y-8">
                    <div className="p-3 rounded-[40px] border border-slate-100 bg-white shadow-sm space-y-1">
                        <button
                            onClick={() => setActiveSection("profile")}
                            className={cn(
                                "w-full p-5 rounded-[28px] flex items-center justify-between transition-all group text-left",
                                activeSection === "profile" ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-inner" : "text-slate-400 hover:bg-slate-50/50 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <User className={cn("w-4 h-4", activeSection === "profile" ? "text-slate-900" : "text-slate-300")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Account Settings</span>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", activeSection === "profile" ? "text-slate-900" : "text-slate-100")} />
                        </button>
                        <button
                            onClick={() => setActiveSection("security")}
                            className={cn(
                                "w-full p-5 rounded-[28px] flex items-center justify-between transition-all group text-left",
                                activeSection === "security" ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-inner" : "text-slate-400 hover:bg-slate-50/50 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <Shield className={cn("w-4 h-4", activeSection === "security" ? "text-slate-900" : "text-slate-300")} />
                                <span className="text-[10px] font-black uppercase tracking-widest">Security & Login</span>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", activeSection === "security" ? "text-slate-900" : "text-slate-100")} />
                        </button>
                    </div>

                    <div className="p-10 rounded-[40px] bg-slate-50 border border-slate-100 relative overflow-hidden group shadow-inner">
                        <div className="relative z-10 space-y-6">
                            <div>
                                <p className="text-[9px] font-black uppercase tracking-[0.3em] text-slate-400 mb-2">Account Integrity</p>
                                <div className="flex items-center gap-2">
                                    <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                                    <span className="text-xl font-light text-slate-800">Verified User</span>
                                </div>
                            </div>
                            <p className="text-[10px] text-slate-400 font-medium leading-relaxed">
                                Your account is secured with <span className="text-slate-700">JWT-based authentication</span> and protected by institutional encryption protocols.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="lg:col-span-8">
                    <div className={cn(
                        "p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm transition-all duration-500",
                        isLoading && "opacity-50 pointer-events-none"
                    )}>
                        {activeSection === "profile" ? (
                            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1 h-6 bg-slate-900 rounded-full" />
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Personal Identity</h4>
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Full Name</Label>
                                            <Input 
                                                value={formData.name}
                                                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                        <div className="space-y-3">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Email Address</Label>
                                            <Input 
                                                value={formData.email}
                                                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                        <div className="space-y-3 md:col-span-2">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Mission & Bio</Label>
                                            <Input 
                                                value={formData.bio}
                                                onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                className="bg-slate-50 border-transparent text-slate-900 h-14 px-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                            />
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in slide-in-from-right-4 duration-500">
                                <section className="space-y-8">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1 h-6 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30" />
                                        <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Credentials & Security</h4>
                                    </div>
                                    <div className="space-y-6">
                                        <div className="space-y-3">
                                            <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Current Password</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <Input 
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="bg-slate-50 border-transparent text-slate-900 h-14 pl-14 pr-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                                />
                                            </div>
                                        </div>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="space-y-3">
                                                <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">New Password</Label>
                                                <div className="relative">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <Input 
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="bg-slate-50 border-transparent text-slate-900 h-14 pl-14 pr-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-3">
                                                <Label className="text-[10px] text-slate-400 uppercase tracking-widest font-black ml-1">Confirm New Password</Label>
                                                <div className="relative">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <Input 
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="bg-slate-50 border-transparent text-slate-900 h-14 pl-14 pr-6 rounded-2xl focus:bg-white focus:border-slate-100 focus:ring-0 transition-all font-medium text-sm" 
                                                    />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    )
}
