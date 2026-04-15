"use client"

import { useState } from "react"
import { teacherAnnouncements, teacherCourses } from "@/lib/teacher-data"
import { cn } from "@/lib/utils"
import { Bell, Plus, Users, Eye, Pin, X, Check } from "lucide-react"
import { Input } from "@/components/ui/input"

export default function TeacherAnnouncementsPage() {
    const [composing, setComposing] = useState(false)
    const [form, setForm] = useState({ title: "", body: "", audience: "all", category: "general" as "academic" | "general" | "urgent" | "administrative" })
    const [sent, setSent] = useState(false)

    const handleSend = () => {
        if (!form.title || !form.body) return
        setSent(true)
        setComposing(false)
        setForm({ title: "", body: "", audience: "all", category: "general" })
        setTimeout(() => setSent(false), 4000)
    }

    const categoryColor = (cat: string) => {
        switch (cat) {
            case "academic": return "bg-sky-50 text-sky-600 border-sky-100"
            case "urgent": return "bg-red-50 text-red-600 border-red-100"
            case "administrative": return "bg-sky-50 text-sky-600 border-sky-100"
            default: return "bg-amber-50 text-amber-600 border-amber-100"
        }
    }

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <h1 className="text-3xl font-black text-slate-900 mb-1">Announcements</h1>
                    <p className="text-slate-500 text-sm font-medium">Send course and school-wide announcements to students.</p>
                </div>
                <button
                    onClick={() => setComposing(true)}
                    className="flex items-center gap-2 px-5 py-2.5 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-all shadow-md shadow-orange-500/20"
                >
                    <Plus className="w-4 h-4" />
                    New Announcement
                </button>
            </div>

            {/* Compose Modal */}
            {composing && (
                <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-sm p-4">
                    <div className="bg-white rounded-[32px] shadow-2xl p-8 w-full max-w-2xl animate-in fade-in zoom-in-95 duration-300">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-2xl font-black text-slate-900">New Announcement</h2>
                            <button onClick={() => setComposing(false)} className="p-2 rounded-xl hover:bg-slate-100 text-slate-400 transition-colors"><X className="w-5 h-5" /></button>
                        </div>
                        <div className="space-y-4">
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Title *</label>
                                <Input placeholder="e.g. Upcoming Exam Reminder" value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} className="rounded-xl h-11" />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Send To</label>
                                    <select value={form.audience} onChange={e => setForm(p => ({ ...p, audience: e.target.value }))} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium">
                                        <option value="all">All My Students</option>
                                        {teacherCourses.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                                    </select>
                                </div>
                                <div>
                                    <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Category</label>
                                    <select value={form.category} onChange={e => setForm(p => ({ ...p, category: e.target.value as any }))} className="w-full h-11 rounded-xl border border-input bg-background px-3 text-sm font-medium">
                                        <option value="general">General</option>
                                        <option value="academic">Academic</option>
                                        <option value="administrative">Administrative</option>
                                        <option value="urgent">Urgent</option>
                                    </select>
                                </div>
                            </div>
                            <div>
                                <label className="text-xs font-black text-slate-400 uppercase tracking-widest mb-1.5 block">Message *</label>
                                <textarea rows={5} placeholder="Write your announcement here..." value={form.body} onChange={e => setForm(p => ({ ...p, body: e.target.value }))} className="w-full rounded-xl border border-input bg-background px-3 py-2 text-sm resize-none" />
                            </div>
                            <div className="flex gap-3 pt-2">
                                <button onClick={() => setComposing(false)} className="flex-1 py-3 border border-slate-200 rounded-xl text-sm font-bold text-slate-600 hover:bg-slate-50 transition-colors">Cancel</button>
                                <button onClick={handleSend} className="flex-1 py-3 bg-orange-500 hover:bg-orange-400 text-white rounded-xl text-sm font-bold transition-colors shadow-md shadow-orange-500/20">Send Announcement</button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {sent && (
                <div className="flex items-center gap-3 p-4 bg-sky-50 rounded-2xl border border-sky-100 animate-in fade-in slide-in-from-top-2 duration-300">
                    <Check className="w-5 h-5 text-sky-600" />
                    <p className="text-sm font-bold text-sky-700">Announcement sent successfully to all students!</p>
                </div>
            )}

            {/* Sent Announcements */}
            <div className="space-y-4">
                <div className="flex items-center gap-3">
                    <div className="w-1.5 h-6 bg-orange-500 rounded-full" />
                    <h2 className="text-xl font-black text-slate-900">Sent Announcements</h2>
                </div>

                {teacherAnnouncements.map(ann => (
                    <div key={ann.id} className="bg-white rounded-3xl border border-slate-200 shadow-sm hover:shadow-md transition-all p-6 relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-orange-500/5 blur-3xl rounded-full opacity-0 group-hover:opacity-100 transition-opacity" />
                        <div className="flex items-start gap-4 relative z-10">
                            <div className="w-10 h-10 rounded-2xl bg-orange-50 border border-orange-100 flex items-center justify-center shrink-0">
                                {ann.pinned ? <Pin className="w-4 h-4 text-orange-500" /> : <Bell className="w-4 h-4 text-orange-500" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="flex items-start justify-between gap-4 mb-2 flex-wrap">
                                    <div className="flex items-center gap-3 flex-wrap">
                                        <h3 className="text-lg font-black text-slate-900">{ann.title}</h3>
                                        <span className={cn("text-[10px] font-black uppercase tracking-widest px-2.5 py-1 rounded-lg border", categoryColor(ann.category))}>
                                            {ann.category}
                                        </span>
                                        {ann.pinned && <span className="text-[10px] font-black text-amber-600 bg-amber-50 px-2 py-1 rounded-lg border border-amber-100">Pinned</span>}
                                    </div>
                                    <span className="text-xs text-slate-400 font-bold shrink-0">{ann.sentAt}</span>
                                </div>

                                <p className="text-sm text-slate-600 font-medium leading-relaxed mb-4 line-clamp-2">{ann.body}</p>

                                <div className="flex items-center justify-between flex-wrap gap-4">
                                    <div className="flex items-center gap-4 text-sm text-slate-500">
                                        <div className="flex items-center gap-1.5">
                                            <Users className="w-4 h-4" />
                                            <span className="font-bold">{ann.audienceLabel}</span>
                                        </div>
                                        <div className="flex items-center gap-1.5">
                                            <Eye className="w-4 h-4" />
                                            <span className="font-bold">{ann.readCount}/{ann.totalCount} read</span>
                                        </div>
                                    </div>
                                    {/* Read rate bar */}
                                    <div className="w-32">
                                        <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
                                            <div className="h-full bg-orange-400 rounded-full" style={{ width: `${Math.round((ann.readCount / ann.totalCount) * 100)}%` }} />
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}
