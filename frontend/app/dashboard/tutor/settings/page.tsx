"use client"

import {
    Settings, User, Bell, Shield,
    CreditCard, Globe, Sparkles, ChevronRight,
    ArrowUpRight, Mail, Lock, Smartphone,
    CheckCircle2, AlertCircle
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { tutorProfile as mockTeacherData } from "@/lib/mock-data"

export default function TeacherSettings() {
    return (
        <div className="max-w-4xl mx-auto space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header */}
            <div className="space-y-6">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-slate-50 text-slate-600 text-[10px] font-black uppercase tracking-widest border border-slate-100">Profile & Security</span>
                        <Settings className="w-4 h-4 text-slate-400 group-hover:rotate-45 transition-transform" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                        Account <span className='text-sky-600'>Settings</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Manage your educator profile, notification preferences, and account security settings.
                    </p>
                </div>
            </div>

            {/* Settings Sections */}
            <div className="space-y-8">

                {/* Profile Card */}
                <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/10">
                    <div className="flex items-center gap-8 mb-10">
                        <div className="w-24 h-24 rounded-[32px] bg-sky-50 border border-sky-100 p-1 flex items-center justify-center relative group cursor-pointer">
                            <div className="w-full h-full rounded-2xl bg-sky-500 flex items-center justify-center text-white font-black text-2xl uppercase">
                                AK
                            </div>
                            <div className="absolute -bottom-2 -right-2 w-10 h-10 rounded-full bg-white border border-sky-100 flex items-center justify-center shadow-lg opacity-0 group-hover:opacity-100 transition-opacity">
                                <Sparkles className="w-4 h-4 text-sky-500" />
                            </div>
                        </div>
                        <div>
                            <h3 className="text-2xl font-black text-slate-900 uppercase italic leading-none mb-2">{mockTeacherData.personal.name}</h3>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                <Shield className="w-3.5 h-3.5 text-sky-500" /> Verified Elite Educator
                            </p>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Full Name</label>
                            <input defaultValue={mockTeacherData.personal.name} className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/5 transition-all" />
                        </div>
                        <div className="space-y-4">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-widest px-4">Email Address</label>
                            <input defaultValue="abebe.kebede@smarttutor.et" className="w-full h-14 px-6 rounded-2xl bg-slate-50 border border-slate-100 font-bold text-sm focus:outline-none focus:ring-4 focus:ring-sky-500/5 transition-all" />
                        </div>
                    </div>
                </div>

                {/* Notifications & Preferences */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                    {[
                        { title: "Notifications", icon: Bell, items: ["Email Alerts", "Push Notifications", "Student Messages"] },
                        { title: "Security", icon: Lock, items: ["Two-Factor Auth", "Session History", "Change Password"] },
                    ].map((section, idx) => (
                        <div key={idx} className="p-8 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/5 space-y-8">
                            <div className="flex items-center gap-4">
                                <div className="w-12 h-12 rounded-2xl bg-slate-50 text-slate-400 flex items-center justify-center border border-slate-100"><section.icon className="w-6 h-6" /></div>
                                <h3 className="text-[11px] font-black uppercase tracking-widest text-slate-900">{section.title}</h3>
                            </div>
                            <div className="space-y-2">
                                {section.items.map(item => (
                                    <div key={item} className="flex items-center justify-between p-4 rounded-2xl hover:bg-slate-50 transition-all cursor-pointer group">
                                        <span className="text-[13px] font-black text-slate-600 group-hover:text-sky-600 transition-colors uppercase italic">{item}</span>
                                        <div className="w-10 h-5 bg-slate-200 rounded-full relative p-1"><div className="w-3 h-3 bg-white rounded-full shadow-sm" /></div>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>

                {/* Footer Actions */}
                <div className="pt-8 flex flex-col sm:flex-row items-center justify-between gap-6 border-t border-slate-100">
                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest italic flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" /> Finalize your changes before leaving this page.
                    </p>
                    <div className="flex gap-4 w-full sm:w-auto">
                        <Button variant="outline" className="flex-1 sm:flex-none h-14 px-8 rounded-2xl border-slate-100 font-black text-[10px] uppercase tracking-widest text-slate-400">Discard</Button>
                        <Button className="flex-1 sm:flex-none h-14 px-8 rounded-2xl bg-sky-600 text-white font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20 hover:scale-105 transition-all">Save Profile Changes</Button>
                    </div>
                </div>
            </div>

        </div>
    )
}
