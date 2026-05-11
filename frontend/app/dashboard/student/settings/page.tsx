"use client"

import { cn } from "@/lib/utils"
import { Settings, Moon, Sun, Bell, BellOff, Shield, Eye, EyeOff, User, Globe, Palette, Volume2, Sparkles, ChevronRight, Save } from "lucide-react"
import { useState } from "react"
import { Button } from "@/components/ui/button"
import { SecuritySettings } from "@/components/dashboard/settings/security-settings"

/**
 * Settings page — appearance, notifications, privacy, and account preferences.
 */

function ToggleSwitch({ enabled, onToggle, label, description }: {
    enabled: boolean
    onToggle: () => void
    label: string
    description: string
}) {
    return (
        <div className="flex items-center justify-between py-5 px-1 group transition-all">
            <div className="flex-1 min-w-0 mr-6">
                <p className="text-sm font-black text-slate-800 transition-colors group-hover:text-indigo-600 uppercase tracking-tight">{label}</p>
                <p className="text-[11px] text-slate-400 mt-1 font-bold uppercase tracking-widest leading-relaxed">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={cn(
                    "w-14 h-7.5 rounded-full p-1.5 transition-all duration-500 shrink-0 border",
                    enabled ? "bg-indigo-600 border-indigo-500 shadow-xl shadow-indigo-500/20" : "bg-slate-100 border-slate-200 shadow-inner"
                )}
            >
                <div className={cn(
                    "w-4.5 h-4.5 rounded-full bg-white shadow-xl transition-all duration-500",
                    enabled ? "translate-x-6 scale-110" : "translate-x-0"
                )} />
            </button>
        </div>
    )
}

export default function StudentSettings() {
    const [settings, setSettings] = useState({
        darkMode: false,
        emailNotifs: true,
        pushNotifs: true,
        assignmentReminders: true,
        announcementAlerts: true,
        gradeAlerts: true,
        soundEffects: false,
        profileVisibility: true,
        showEmail: false,
        showAttendance: true,
        twoFactor: false,
    })

    const toggle = (key: keyof typeof settings) => {
        setSettings((prev) => ({ ...prev, [key]: !prev[key] }))
    }

    return (
        <div className="max-w-5xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10 pb-6 border-b border-slate-100/50">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100">Preference Control</span>
                            <Sparkles className="w-4 h-4 text-amber-400 fill-amber-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Platform <span className='text-indigo-500'>Settings</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Tailor your academic experience, security, and interface preferences.
                        </p>
                    </div>
                </div>

                <div className="flex items-center gap-4">
                    <Button className="h-14 px-10 bg-indigo-600 text-white rounded-[22px] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-transform">
                        <Save className="w-4.5 h-4.5" />
                        Save Changes
                    </Button>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Appearance & Interface */}
                <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 rounded-[20px] bg-violet-50 text-violet-600 border border-violet-100 shadow-sm group-hover:scale-110 transition-transform">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Appearance</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Interface Customization</p>
                        </div>
                    </div>
                    <div className="space-y-2 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.darkMode}
                            onToggle={() => toggle("darkMode")}
                            label="Onyx Mode"
                            description="High contrast dark theme for low light environments"
                        />
                        <ToggleSwitch
                            enabled={settings.soundEffects}
                            onToggle={() => toggle("soundEffects")}
                            label="Tactile Audio"
                            description="Subtle haptic sound feedback for interactions"
                        />
                    </div>
                </div>

                {/* Account Summary Card */}
                <div className="p-10 rounded-[48px] bg-slate-900 text-white shadow-2xl relative overflow-hidden group">
                    <div className="absolute -right-10 -bottom-10 w-48 h-48 bg-indigo-500/20 blur-3xl rounded-full" />
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 rounded-[20px] bg-white/5 border border-white/10 text-indigo-400 shadow-sm transition-transform group-hover:rotate-12">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-white leading-tight uppercase tracking-tight">Identity</h3>
                            <p className="text-[10px] text-indigo-300/60 font-black uppercase tracking-[0.2em] mt-1">Verified Academic Profile</p>
                        </div>
                    </div>
                    <div className="space-y-5">
                        {[
                            { label: "Student ID", value: "STU-2024-001" },
                            { label: "Institutional Email", value: "sarah.j@smarttutor.edu" },
                            { label: "Membership Tier", value: "Premium Scholar" },
                            { label: "Region Access", value: "Ethiopia (Africa/Addis_Ababa)" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-1 group/item">
                                <span className="text-[10px] font-black text-indigo-200/40 uppercase tracking-widest group-hover/item:text-indigo-200 transition-colors">{item.label}</span>
                                <span className="text-xs font-black text-white">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-8 border-t border-white/5">
                        <Button variant="ghost" className="w-full h-14 rounded-[20px] bg-white/5 border border-white/10 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-white/10 hover:border-white/20">
                            Request Credential Update
                        </Button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Notifications & Connectivity */}
                <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 rounded-[20px] bg-sky-50 text-sky-600 border border-sky-100 shadow-sm group-hover:animate-bounce">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">System Alerts</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Communication Channels</p>
                        </div>
                    </div>
                    <div className="space-y-2 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.emailNotifs}
                            onToggle={() => toggle("emailNotifs")}
                            label="Email Briefings"
                            description="Weekly academic summaries and system news"
                        />
                        <ToggleSwitch
                            enabled={settings.pushNotifs}
                            onToggle={() => toggle("pushNotifs")}
                            label="Real-time Pings"
                            description="Instant browser alerts for high-priority items"
                        />
                        <ToggleSwitch
                            enabled={settings.assignmentReminders}
                            onToggle={() => toggle("assignmentReminders")}
                            label="Deadline Guardian"
                            description="Advanced reminders for approaching submission dates"
                        />
                    </div>
                </div>

                {/* Privacy & Shield */}
                <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10 hover:shadow-2xl transition-all duration-700 relative overflow-hidden group">
                    <div className="flex items-center gap-4 mb-10">
                        <div className="p-4 rounded-[20px] bg-emerald-50 text-emerald-600 border border-emerald-100 shadow-sm group-hover:scale-110 transition-transform">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-xl font-black text-slate-900 leading-tight uppercase tracking-tight">Security Shield</h3>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-[0.2em] mt-1">Safety & Data Control</p>
                        </div>
                    </div>
                    <div className="space-y-2 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.profileVisibility}
                            onToggle={() => toggle("profileVisibility")}
                            label="Discovery Mode"
                            description="Allow peers to find your profile in searches"
                        />
                        <ToggleSwitch
                            enabled={settings.twoFactor}
                            onToggle={() => toggle("twoFactor")}
                            label="Guardian Auth (2FA)"
                            description="Multi-factor authentication for enhanced security"
                        />
                    </div>
                </div>
            </div>

            {/* Security Settings Section */}
            <div className="grid grid-cols-1 gap-8">
                 <SecuritySettings />
            </div>

            {/* Danger Zone */}
            <div className="p-12 rounded-[56px] bg-rose-50/40 border border-rose-100 shadow-sm relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Volume2 className="w-32 h-32 text-rose-500" />
                </div>
                <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-10 relative z-10">
                    <div className="max-w-xl">
                        <h3 className="text-2xl font-black text-rose-900 leading-tight uppercase tracking-tight mb-2">Terminal Actions</h3>
                        <p className="text-sm text-rose-700/60 font-medium leading-relaxed">
                            Irreversible modification of your academic footprint. Please proceed with extreme caution as data recovery is not possible once confirmed.
                        </p>
                    </div>
                    <div className="flex flex-wrap gap-4 shrink-0">
                        <Button variant="outline" className="h-14 px-8 rounded-[22px] bg-white border-rose-100 text-rose-600 font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-50 shadow-sm">
                            Deactivate Session
                        </Button>
                        <Button className="h-14 px-8 rounded-[22px] bg-rose-600 text-white font-black text-[10px] uppercase tracking-[0.2em] hover:bg-rose-700 shadow-2xl shadow-rose-600/30">
                            Permanent Termination
                        </Button>
                    </div>
                </div>
            </div>
        </div>
    )
}
