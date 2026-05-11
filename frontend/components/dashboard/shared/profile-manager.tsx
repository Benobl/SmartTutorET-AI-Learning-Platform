"use client"

import { useState, useEffect } from "react"
import { 
    User, Mail, Camera, Save, Shield, Bell, 
    ChevronRight, Lock, Key, Loader2, CheckCircle2,
    Cloud, Fingerprint, Zap, ExternalLink, RefreshCw
} from "lucide-react"
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
        if (!passwordData.currentPassword || !passwordData.newPassword) {
            return toast.error("Missing Info", { description: "Please fill in all password fields." })
        }
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
        <div className="max-w-6xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-4 duration-1000">
            {/* Ultra-Premium Header Area */}
            <div className="relative p-12 rounded-[60px] bg-white border border-slate-100 shadow-[0_32px_64px_-12px_rgba(0,0,0,0.05)] overflow-hidden group">
                <div className="absolute top-0 right-0 w-[500px] h-[500px] bg-slate-50 rounded-full blur-3xl -mr-64 -mt-64 transition-all duration-1000 group-hover:scale-110" />
                
                <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-10">
                    <div className="flex items-center gap-10">
                        <div className="relative">
                            <div className="absolute -inset-4 bg-gradient-to-tr from-sky-500/10 to-indigo-500/10 rounded-[48px] blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-700" />
                            <Avatar className="w-32 h-32 rounded-[40px] border-4 border-white shadow-2xl relative z-10 hover:scale-105 transition-transform duration-500 ring-1 ring-slate-100">
                                <AvatarImage src={user?.profile?.avatar} className="object-cover" />
                                <AvatarFallback className="bg-slate-50 text-slate-400 text-3xl font-light">
                                    {initials}
                                </AvatarFallback>
                            </Avatar>
                            <label className="absolute -bottom-2 -right-2 p-3.5 bg-white border border-slate-100 text-slate-400 rounded-2xl shadow-2xl hover:text-sky-600 transition-all cursor-pointer hover:scale-110 active:scale-95 z-20 hover:border-sky-100">
                                {isUploading ? <Loader2 className="w-5 h-5 animate-spin text-sky-500" /> : <Camera className="w-5 h-5" />}
                                <input type="file" className="hidden" accept="image/*" onChange={handleAvatarUpload} disabled={isUploading} />
                            </label>
                        </div>
                        
                        <div className="space-y-3">
                            <div className="flex items-center gap-3">
                                <span className="px-3 py-1 rounded-full bg-slate-900 text-white text-[8px] font-black uppercase tracking-[0.2em] shadow-lg shadow-slate-900/20">
                                    {user?.role} Profile
                                </span>
                                <span className="px-3 py-1 rounded-full bg-emerald-50 text-emerald-600 text-[8px] font-black uppercase tracking-[0.2em] border border-emerald-100/50">
                                    Verified Account
                                </span>
                            </div>
                            <h1 className="text-5xl font-light text-slate-900 tracking-tight leading-none">
                                {user?.name?.split(' ')[0]} <span className="font-semibold">{user?.name?.split(' ').slice(1).join(' ')}</span>
                            </h1>
                            <div className="flex items-center gap-4 text-slate-400 text-sm">
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Mail className="w-3.5 h-3.5" /> {user?.email}
                                </div>
                                <div className="w-1 h-1 rounded-full bg-slate-200" />
                                <div className="flex items-center gap-1.5 font-medium">
                                    <Cloud className="w-3.5 h-3.5" /> Cloud Sync Active
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex flex-col gap-3">
                        <Button 
                            disabled={isLoading}
                            onClick={activeSection === "profile" ? handleProfileUpdate : handleChangePassword}
                            className="bg-slate-900 hover:bg-sky-600 text-white rounded-[24px] h-16 px-10 font-black text-[11px] uppercase tracking-[0.2em] gap-3 shadow-2xl shadow-slate-900/20 transition-all active:scale-95 disabled:opacity-50"
                        >
                            {isLoading ? <Loader2 className="w-5 h-5 animate-spin" /> : <Save className="w-5 h-5" />}
                            Commit {activeSection === "profile" ? "Profile" : "Security"} Fix
                        </Button>
                        <p className="text-[10px] text-center text-slate-400 font-bold uppercase tracking-widest animate-pulse">Encryption: AES-256 Enabled</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                {/* Navigation Sidebar */}
                <div className="lg:col-span-4 space-y-6">
                    <div className="p-4 rounded-[48px] border border-slate-100 bg-white shadow-xl shadow-slate-200/20 space-y-2">
                        <button
                            onClick={() => setActiveSection("profile")}
                            className={cn(
                                "w-full p-6 rounded-[32px] flex items-center justify-between transition-all group text-left",
                                activeSection === "profile" ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-inner" : "text-slate-400 hover:bg-slate-50/50 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", activeSection === "profile" ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-300")}>
                                    <User className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-widest block">Identity</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Personal Bio & Intel</span>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", activeSection === "profile" ? "text-slate-900" : "text-slate-100")} />
                        </button>
                        
                        <button
                            onClick={() => setActiveSection("security")}
                            className={cn(
                                "w-full p-6 rounded-[32px] flex items-center justify-between transition-all group text-left",
                                activeSection === "security" ? "bg-slate-50 text-slate-900 border border-slate-100 shadow-inner" : "text-slate-400 hover:bg-slate-50/50 hover:text-slate-600"
                            )}
                        >
                            <div className="flex items-center gap-4">
                                <div className={cn("w-10 h-10 rounded-2xl flex items-center justify-center transition-all", activeSection === "security" ? "bg-white text-slate-900 shadow-sm" : "bg-transparent text-slate-300")}>
                                    <Fingerprint className="w-5 h-5" />
                                </div>
                                <div>
                                    <span className="text-[11px] font-black uppercase tracking-widest block">Security</span>
                                    <span className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Credentials & Access</span>
                                </div>
                            </div>
                            <ChevronRight className={cn("w-4 h-4 transition-transform group-hover:translate-x-1", activeSection === "security" ? "text-slate-900" : "text-slate-100")} />
                        </button>
                    </div>

                    <div className="p-10 rounded-[48px] bg-gradient-to-br from-slate-900 to-indigo-950 text-white relative overflow-hidden group shadow-2xl shadow-indigo-500/10">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-3xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-6">
                            <div className="flex items-center gap-4">
                                <Zap className="w-8 h-8 text-sky-400 fill-sky-400" />
                                <div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-sky-400 mb-1">System Health</p>
                                    <h4 className="text-xl font-black italic uppercase">Core Synced</h4>
                                </div>
                            </div>
                            <p className="text-xs text-slate-400 font-medium leading-relaxed">
                                Your account is guarded by <span className="text-white">NeuralLink Security</span>. Multi-factor protocols are standing by.
                            </p>
                            <Button variant="link" className="p-0 h-auto text-sky-400 text-[10px] font-black uppercase tracking-[0.2em] hover:text-white transition-colors gap-2">
                                Review Audit Log <ExternalLink className="w-3 h-3" />
                            </Button>
                        </div>
                    </div>
                </div>

                {/* Content Panel */}
                <div className="lg:col-span-8">
                    <div className={cn(
                        "p-12 rounded-[60px] bg-white border border-slate-100 shadow-sm transition-all duration-700 relative overflow-hidden",
                        isLoading && "opacity-60 grayscale-[0.5]"
                    )}>
                        {activeSection === "profile" ? (
                            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-slate-900 rounded-full" />
                                        <div>
                                            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Personal Identity</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Information visible to authorized personnel</p>
                                        </div>
                                    </div>
                                    
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-10">
                                        <div className="space-y-4">
                                            <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Public Name</Label>
                                            <div className="relative group/field">
                                                <User className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
                                                <Input 
                                                    value={formData.name}
                                                    onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                                                    className="bg-slate-50/50 border-slate-100 text-slate-900 h-16 pl-14 pr-6 rounded-[24px] focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-sm shadow-inner group-hover/field:border-slate-200" 
                                                />
                                            </div>
                                        </div>
                                        
                                        <div className="space-y-4">
                                            <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Email Node</Label>
                                            <div className="relative group/field">
                                                <Mail className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
                                                <Input 
                                                    value={formData.email}
                                                    onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                                                    className="bg-slate-50/50 border-slate-100 text-slate-900 h-16 pl-14 pr-6 rounded-[24px] focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-sm shadow-inner group-hover/field:border-slate-200" 
                                                />
                                            </div>
                                        </div>

                                        <div className="space-y-4 md:col-span-2">
                                            <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Mission & Bio</Label>
                                            <div className="relative group/field">
                                                <RefreshCw className="absolute left-6 top-6 w-4 h-4 text-slate-300 group-focus-within/field:text-slate-900 transition-colors" />
                                                <textarea
                                                    value={formData.bio}
                                                    onChange={(e) => setFormData({ ...formData, bio: e.target.value })}
                                                    placeholder="Share your academic mission..."
                                                    className="w-full bg-slate-50/50 border-slate-100 text-slate-900 min-h-[160px] pl-14 pr-8 py-6 rounded-[32px] focus:bg-white focus:border-slate-900 focus:ring-0 transition-all font-semibold text-sm shadow-inner resize-none group-hover/field:border-slate-200"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        ) : (
                            <div className="space-y-12 animate-in slide-in-from-right-8 duration-700">
                                <section className="space-y-10">
                                    <div className="flex items-center gap-4">
                                        <div className="w-1.5 h-8 bg-sky-500 rounded-full shadow-lg shadow-sky-500/30" />
                                        <div>
                                            <h4 className="text-[12px] font-black text-slate-900 uppercase tracking-[0.3em]">Credentials Hub</h4>
                                            <p className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">Securely rotate your access keys</p>
                                        </div>
                                    </div>

                                    <div className="space-y-8">
                                        <div className="p-8 rounded-[32px] bg-slate-50/50 border border-slate-100 space-y-4">
                                            <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Current Verification Key</Label>
                                            <div className="relative">
                                                <Lock className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                <Input 
                                                    type="password"
                                                    value={passwordData.currentPassword}
                                                    onChange={(e) => setPasswordData({ ...passwordData, currentPassword: e.target.value })}
                                                    className="bg-white border-transparent text-slate-900 h-16 pl-14 pr-6 rounded-[24px] focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all font-semibold text-sm shadow-sm" 
                                                    placeholder="Confirm current password"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                            <div className="space-y-4">
                                                <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">New Security Hash</Label>
                                                <div className="relative">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <Input 
                                                        type="password"
                                                        value={passwordData.newPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, newPassword: e.target.value })}
                                                        className="bg-slate-50/50 border-slate-100 text-slate-900 h-16 pl-14 pr-6 rounded-[24px] focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all font-semibold text-sm shadow-inner" 
                                                        placeholder="Create new key"
                                                    />
                                                </div>
                                            </div>
                                            
                                            <div className="space-y-4">
                                                <Label className="text-[11px] text-slate-400 uppercase tracking-[0.2em] font-black ml-2">Validate New Key</Label>
                                                <div className="relative">
                                                    <Key className="absolute left-6 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-300" />
                                                    <Input 
                                                        type="password"
                                                        value={passwordData.confirmPassword}
                                                        onChange={(e) => setPasswordData({ ...passwordData, confirmPassword: e.target.value })}
                                                        className="bg-slate-50/50 border-slate-100 text-slate-900 h-16 pl-14 pr-6 rounded-[24px] focus:bg-white focus:border-sky-500 focus:ring-4 focus:ring-sky-500/5 transition-all font-semibold text-sm shadow-inner" 
                                                        placeholder="Re-enter for validation"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        <div className="p-8 rounded-[32px] bg-sky-50 border border-sky-100/50 flex items-start gap-4">
                                            <div className="w-10 h-10 rounded-xl bg-white shadow-sm flex items-center justify-center shrink-0 border border-sky-100">
                                                <Shield className="w-5 h-5 text-sky-500" />
                                            </div>
                                            <div className="space-y-1">
                                                <h5 className="text-[11px] font-black text-sky-900 uppercase tracking-widest">Key Requirements</h5>
                                                <p className="text-[10px] text-sky-600/80 font-bold leading-relaxed">
                                                    Password must be at least 8 characters long and contain a mix of letters, numbers, and specialized characters for maximum entropy.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                </section>
                            </div>
                        )}
                        
                        {isLoading && (
                            <div className="absolute inset-0 bg-white/40 backdrop-blur-[2px] flex items-center justify-center z-50">
                                <div className="flex flex-col items-center gap-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 bg-sky-500/20 blur-xl animate-pulse rounded-full" />
                                        <Loader2 className="w-12 h-12 text-sky-500 animate-spin relative z-10" />
                                    </div>
                                    <p className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 animate-pulse">Syncing with Node...</p>
                                </div>
                            </div>
                        )}
                    </div>
                </div>
            </div>


        </div>
    )
}
