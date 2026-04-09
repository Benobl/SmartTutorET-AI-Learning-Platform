"use client"

import { cn } from "@/lib/utils"
import { Settings, Moon, Sun, Bell, BellOff, Shield, Eye, EyeOff, User, Globe, Palette, Volume2 } from "lucide-react"
import { useState } from "react"

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
        <div className="flex items-center justify-between py-4 px-1 group">
            <div className="flex-1 min-w-0 mr-4">
                <p className="text-sm font-bold text-slate-800 group-hover:text-sky-600 transition-colors">{label}</p>
                <p className="text-xs text-slate-400 mt-0.5 font-medium">{description}</p>
            </div>
            <button
                onClick={onToggle}
                className={cn(
                    "w-12 h-6.5 rounded-full p-1 transition-all duration-300 shrink-0",
                    enabled ? "bg-sky-500 shadow-md shadow-sky-500/20" : "bg-slate-200"
                )}
            >
                <div className={cn(
                    "w-4.5 h-4.5 rounded-full bg-white shadow-sm transition-all duration-300",
                    enabled ? "translate-x-5.5" : "translate-x-0"
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
        <div className="max-w-4xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-1">Settings & Preferences</h1>
                <p className="text-slate-500 text-sm font-medium">Manage your dashboard experience, privacy, and account security.</p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Appearance */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-violet-50 text-violet-500 border border-violet-100 shadow-sm">
                            <Palette className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">Appearance</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Visual Experience</p>
                        </div>
                    </div>
                    <div className="space-y-1 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.darkMode}
                            onToggle={() => toggle("darkMode")}
                            label="Dark Mode"
                            description="Use dark theme throughout the dashboard"
                        />
                        <ToggleSwitch
                            enabled={settings.soundEffects}
                            onToggle={() => toggle("soundEffects")}
                            label="Sound Effects"
                            description="Play subtle sounds for interactions"
                        />
                    </div>
                </div>

                {/* Account Info */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-amber-50 text-amber-500 border border-amber-100 shadow-sm">
                            <User className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">Account</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Profile Details</p>
                        </div>
                    </div>
                    <div className="space-y-4">
                        {[
                            { label: "Student ID", value: "STU-2024-001" },
                            { label: "Official Email", value: "sarah.jones@example.com" },
                            { label: "Member Since", value: "September 2023" },
                            { label: "Current Plan", value: "Premium Student" },
                        ].map((item) => (
                            <div key={item.label} className="flex items-center justify-between py-1 px-1">
                                <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest">{item.label}</span>
                                <span className="text-xs font-black text-slate-700">{item.value}</span>
                            </div>
                        ))}
                    </div>
                    <div className="mt-8 pt-4 border-t border-slate-50 flex gap-3">
                        <button className="flex-1 py-3 rounded-2xl bg-slate-50 border border-slate-200 text-slate-600 text-[11px] font-black uppercase tracking-widest hover:bg-white hover:border-sky-200 hover:text-sky-600 transition-all shadow-sm">
                            Manage Identity
                        </button>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Notifications */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-sky-50 text-sky-500 border border-sky-100 shadow-sm">
                            <Bell className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">Notifications</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Alert Preferences</p>
                        </div>
                    </div>
                    <div className="space-y-1 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.emailNotifs}
                            onToggle={() => toggle("emailNotifs")}
                            label="Email Updates"
                            description="Crucial news sent to your inbox"
                        />
                        <ToggleSwitch
                            enabled={settings.pushNotifs}
                            onToggle={() => toggle("pushNotifs")}
                            label="Push Alerts"
                            description="Real-time browser notifications"
                        />
                        <ToggleSwitch
                            enabled={settings.assignmentReminders}
                            onToggle={() => toggle("assignmentReminders")}
                            label="Assignment Deadlines"
                            description="Reminders for pending work"
                        />
                        <ToggleSwitch
                            enabled={settings.announcementAlerts}
                            onToggle={() => toggle("announcementAlerts")}
                            label="Class Announcements"
                            description="Instant news from tutors"
                        />
                    </div>
                </div>

                {/* Privacy & Security */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all">
                    <div className="flex items-center gap-3 mb-6">
                        <div className="p-3 rounded-2xl bg-emerald-50 text-emerald-500 border border-emerald-100 shadow-sm">
                            <Shield className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-slate-900 leading-tight">Security</h3>
                            <p className="text-[11px] text-slate-400 font-bold uppercase tracking-widest">Safety & Privacy</p>
                        </div>
                    </div>
                    <div className="space-y-1 divide-y divide-slate-50">
                        <ToggleSwitch
                            enabled={settings.profileVisibility}
                            onToggle={() => toggle("profileVisibility")}
                            label="Public Profile"
                            description="Visible to other platform members"
                        />
                        <ToggleSwitch
                            enabled={settings.showAttendance}
                            onToggle={() => toggle("showAttendance")}
                            label="Share Attendance"
                            description="Allow tutors to access records"
                        />
                        <ToggleSwitch
                            enabled={settings.twoFactor}
                            onToggle={() => toggle("twoFactor")}
                            label="2FA Security"
                            description="Enhanced login authentication"
                        />
                        <div className="py-4 px-1 flex items-center justify-between">
                            <div className="flex-1 min-w-0 mr-4">
                                <p className="text-sm font-bold text-slate-800">Password</p>
                                <p className="text-[10px] text-slate-400 mt-0.5 font-bold uppercase tracking-widest">Last changed 3 months ago</p>
                            </div>
                            <button className="px-4 py-1.5 bg-slate-50 border border-slate-200 text-slate-600 text-[10px] font-black uppercase tracking-widest rounded-lg hover:bg-sky-50 hover:border-sky-200 hover:text-sky-600 transition-all shadow-sm">
                                Change
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            {/* Danger Zone */}
            <div className="p-8 rounded-[32px] bg-red-50/30 border border-red-100 shadow-sm">
                <div className="flex items-center justify-between flex-wrap gap-4">
                    <div className="flex items-start gap-4">
                        <div className="p-3 rounded-2xl bg-red-50 text-red-500 border border-red-100 shadow-sm">
                            <Volume2 className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-red-900 leading-tight">Danger Zone</h3>
                            <p className="text-sm text-red-700/60 font-medium">Irreversible actions regarding your account data.</p>
                        </div>
                    </div>
                    <div className="flex gap-3 ml-auto">
                        <button className="px-6 py-3 rounded-2xl bg-white border border-red-100 text-red-600 text-xs font-black uppercase tracking-widest hover:bg-red-50 transition-all shadow-sm">
                            Deactivate Account
                        </button>
                        <button className="px-6 py-3 rounded-2xl bg-red-600 text-white text-xs font-black uppercase tracking-widest hover:bg-red-700 transition-all shadow-lg shadow-red-600/20">
                            Delete Permanent
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}
