"use client"

import { useState } from "react"
import { Shield, Key, Eye, EyeOff, Check, AlertCircle, RefreshCw } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { userApi } from "@/lib/api"
import { toast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"

export function SecuritySettings() {
    const [loading, setLoading] = useState(false)
    const [showPass, setShowPass] = useState({ current: false, new: false, confirm: false })
    const [form, setForm] = useState({ currentPassword: "", newPassword: "", confirmPassword: "" })

    const handlePasswordChange = async (e: React.FormEvent) => {
        e.preventDefault()
        if (form.newPassword !== form.confirmPassword) {
            return toast({ title: "Validation Error", description: "Passwords do not match.", variant: "destructive" })
        }

        try {
            setLoading(true)
            await userApi.changePassword({ 
                currentPassword: form.currentPassword, 
                newPassword: form.newPassword 
            })
            toast({ title: "Security Updated", description: "Your password has been successfully rotated." })
            setForm({ currentPassword: "", newPassword: "", confirmPassword: "" })
        } catch (error: any) {
            toast({ title: "Update Failed", description: error.message || "Failed to change password.", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const passwordStrength = (pass: string) => {
        if (!pass) return 0
        let strength = 0
        if (pass.length > 8) strength += 25
        if (/[A-Z]/.test(pass)) strength += 25
        if (/[0-9]/.test(pass)) strength += 25
        if (/[^A-Za-z0-9]/.test(pass)) strength += 25
        return strength
    }

    const strength = passwordStrength(form.newPassword)

    return (
        <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
            <div className="flex items-center gap-4 mb-10">
                <div className="p-4 rounded-[20px] bg-indigo-50 text-indigo-600 border border-indigo-100 shadow-sm group-hover:scale-110 transition-transform">
                    <Shield className="w-6 h-6" />
                </div>
                <div>
                    <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Access Control</h3>
                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Manage Credentials & Safety</p>
                </div>
            </div>

            <form onSubmit={handlePasswordChange} className="space-y-6">
                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Current Password</Label>
                    <div className="relative">
                        <Input
                            type={showPass.current ? "text" : "password"}
                            value={form.currentPassword}
                            onChange={(e) => setForm({ ...form, currentPassword: e.target.value })}
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white transition-all font-bold pr-12"
                            placeholder="••••••••"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass({ ...showPass, current: !showPass.current })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                            {showPass.current ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">New Access Key</Label>
                    <div className="relative">
                        <Input
                            type={showPass.new ? "text" : "password"}
                            value={form.newPassword}
                            onChange={(e) => setForm({ ...form, newPassword: e.target.value })}
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white transition-all font-bold pr-12"
                            placeholder="••••••••"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass({ ...showPass, new: !showPass.new })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                            {showPass.new ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                    {/* Strength Meter */}
                    <div className="px-1 pt-2">
                        <div className="flex items-center justify-between mb-2">
                            <span className="text-[9px] font-black uppercase tracking-widest text-slate-400">Security Strength</span>
                            <span className={cn("text-[9px] font-black uppercase tracking-widest", 
                                strength < 50 ? "text-rose-500" : strength < 100 ? "text-amber-500" : "text-emerald-500"
                            )}>
                                {strength < 50 ? "Vulnerable" : strength < 100 ? "Standard" : "Bulletproof"}
                            </span>
                        </div>
                        <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden flex gap-0.5">
                            <div className={cn("h-full transition-all duration-500", strength >= 25 ? "bg-rose-500 w-1/4" : "w-0")} />
                            <div className={cn("h-full transition-all duration-500", strength >= 50 ? "bg-rose-500 w-1/4" : "w-0")} />
                            <div className={cn("h-full transition-all duration-500", strength >= 75 ? "bg-amber-500 w-1/4" : "w-0")} />
                            <div className={cn("h-full transition-all duration-500", strength >= 100 ? "bg-emerald-500 w-1/4" : "w-0")} />
                        </div>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-1">Confirm Identity Key</Label>
                    <div className="relative">
                        <Input
                            type={showPass.confirm ? "text" : "password"}
                            value={form.confirmPassword}
                            onChange={(e) => setForm({ ...form, confirmPassword: e.target.value })}
                            className="h-14 rounded-2xl border-slate-100 bg-slate-50/30 focus:bg-white transition-all font-bold pr-12"
                            placeholder="••••••••"
                            required
                        />
                        <button 
                            type="button" 
                            onClick={() => setShowPass({ ...showPass, confirm: !showPass.confirm })}
                            className="absolute right-4 top-1/2 -translate-y-1/2 text-slate-400 hover:text-indigo-500 transition-colors"
                        >
                            {showPass.confirm ? <EyeOff className="w-4.5 h-4.5" /> : <Eye className="w-4.5 h-4.5" />}
                        </button>
                    </div>
                </div>

                <Button 
                    type="submit" 
                    disabled={loading || strength < 25}
                    className="w-full h-16 rounded-[24px] bg-slate-900 text-white font-black uppercase tracking-[0.2em] text-xs shadow-2xl hover:scale-[1.02] active:scale-95 transition-all flex items-center gap-3"
                >
                    {loading ? <RefreshCw className="w-4.5 h-4.5 animate-spin" /> : <Key className="w-4.5 h-4.5" />}
                    Rotate Access Key
                </Button>
            </form>
        </div>
    )
}
