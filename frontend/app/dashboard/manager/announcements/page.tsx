"use client"

import { useState, useEffect } from "react"
import { announcementApi } from "@/lib/api"
import { toast } from "sonner"
import { cn } from "@/lib/utils"
import { 
    Bell, Plus, Trash2, Loader2, AlertTriangle, 
    BookOpen, Building2, Megaphone, Calendar, 
    Globe, Send, UserCircle2, RefreshCw, GraduationCap
} from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from "@/components/ui/dialog"

const categoryConfig: any = {
    exam: { label: "Exam Notice", icon: BookOpen, color: "rose" },
    holiday: { label: "Holiday", icon: Calendar, color: "emerald" },
    schedule: { label: "Schedule Change", icon: RefreshCw, color: "amber" },
    academic: { label: "Academic", icon: GraduationCap, color: "sky" },
    administrative: { label: "Registrar", icon: Building2, color: "indigo" },
    general: { label: "General", icon: Bell, color: "slate" },
}

export default function ManagerAnnouncements() {
    const [announcements, setAnnouncements] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isCreateOpen, setIsCreateOpen] = useState(false)
    const [newAnnouncement, setNewAnnouncement] = useState({
        title: "",
        body: "",
        category: "general",
        targetGrade: ""
    })

    useEffect(() => {
        loadAnnouncements()
    }, [])

    const loadAnnouncements = async () => {
        try {
            setLoading(true)
            const res = await announcementApi.getAll()
            setAnnouncements(res.data || [])
        } catch (error) {
            toast.error("Failed to load announcements")
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newAnnouncement.title || !newAnnouncement.body) {
            toast.error("Please provide a title and content.")
            return
        }
        try {
            await announcementApi.create(newAnnouncement)
            toast.success("Global broadcast dispatched successfully!")
            setIsCreateOpen(false)
            setNewAnnouncement({ title: "", body: "", category: "general", targetGrade: "" })
            loadAnnouncements()
        } catch (error: any) {
            toast.error(error.message || "Failed to post announcement")
        }
    }

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this announcement?")) return
        try {
            await announcementApi.delete(id)
            toast.success("Announcement archived.")
            loadAnnouncements()
        } catch (error) {
            toast.error("Failed to delete announcement")
        }
    }

    return (
        <div className="max-w-7xl mx-auto space-y-10 py-4 animate-in fade-in duration-700 pb-24">
            
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Institutional Broadcast</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Broadcast <span className="font-semibold text-slate-900">Center</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Dispatch critical updates and notices to the entire student community.
                    </p>
                </div>
                <div className="flex items-center gap-3">
                    <Button 
                        onClick={loadAnnouncements}
                        variant="outline"
                        className="rounded-2xl h-12 px-5 border-slate-100 hover:bg-sky-50 hover:border-sky-200 transition-all"
                    >
                        <RefreshCw className={cn("w-4 h-4 text-slate-400", loading && "animate-spin")} />
                    </Button>
                    <Button 
                        onClick={() => setIsCreateOpen(true)}
                        className="rounded-2xl h-12 px-7 bg-sky-500 hover:bg-sky-600 text-white font-black text-xs uppercase tracking-widest shadow-lg shadow-sky-200 flex items-center gap-2"
                    >
                        <Plus className="w-4 h-4" />
                        New Broadcast
                    </Button>
                </div>
            </div>

            {/* List */}
            <div className="px-4 space-y-5">
                {loading ? (
                    <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <Loader2 className="w-10 h-10 text-sky-500 animate-spin mx-auto mb-4" />
                        <p className="text-slate-400 font-black text-[10px] uppercase tracking-widest">Syncing Broadcast Feed...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((a) => {
                        const config = categoryConfig[a.category] || categoryConfig.general
                        return (
                            <div key={a._id} className="group p-8 rounded-[32px] bg-white border border-slate-100 hover:border-sky-200 hover:shadow-xl transition-all duration-500 relative overflow-hidden">
                                <div className="flex flex-col lg:flex-row lg:items-start justify-between gap-8">
                                    <div className="flex gap-6">
                                        <div className={cn(
                                            "w-14 h-14 rounded-2xl flex items-center justify-center shrink-0 border shadow-sm",
                                            config.color === "sky" ? "bg-sky-50 border-sky-100 text-sky-500" :
                                            config.color === "emerald" ? "bg-emerald-50 border-emerald-100 text-emerald-500" :
                                            config.color === "rose" ? "bg-rose-50 border-rose-100 text-rose-500" : "bg-amber-50 border-amber-100 text-amber-500"
                                        )}>
                                            <config.icon className="w-6 h-6" />
                                        </div>
                                        <div className="space-y-2">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-900 tracking-tight">{a.title}</h3>
                                                <span className={cn(
                                                    "px-2.5 py-0.5 rounded-lg text-[9px] font-black uppercase tracking-widest border",
                                                    config.color === "sky" ? "bg-sky-50 text-sky-600 border-sky-100" :
                                                    config.color === "emerald" ? "bg-emerald-50 text-emerald-600 border-emerald-100" :
                                                    config.color === "rose" ? "bg-rose-50 text-rose-600 border-rose-100" : "bg-amber-50 text-amber-600 border-amber-100"
                                                )}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-medium leading-relaxed max-w-4xl">{a.body}</p>
                                            <div className="flex items-center gap-6 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(a.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <UserCircle2 className="w-3.5 h-3.5" />
                                                    {a.createdBy?.name || "Manager"}
                                                </div>
                                                {a.targetGrade ? (
                                                    <div className="flex items-center gap-1.5 text-sky-500">
                                                        <Globe className="w-3.5 h-3.5" />
                                                        Grade {a.targetGrade}
                                                    </div>
                                                ) : (
                                                    <div className="flex items-center gap-1.5 text-emerald-500">
                                                        <Globe className="w-3.5 h-3.5" />
                                                        Global Broadcast
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(a._id)}
                                        className="h-10 w-10 rounded-xl text-slate-200 hover:text-rose-500 hover:bg-rose-50 transition-all self-end lg:self-start"
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="py-32 text-center bg-white rounded-[40px] border border-dashed border-slate-200">
                        <Megaphone className="w-12 h-12 text-slate-100 mx-auto mb-4" />
                        <p className="text-sm font-bold text-slate-700">No active broadcasts</p>
                        <p className="text-[10px] text-slate-400 uppercase tracking-widest mt-1">Dispatch your first institutional alert above.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl rounded-[40px] p-0 border-none overflow-hidden shadow-3xl bg-white">
                    <div className="bg-sky-500 p-10 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
                        <DialogHeader className="relative z-10">
                            <div className="flex items-center gap-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                                    <Megaphone className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tight text-white leading-none">New Broadcast</DialogTitle>
                                    <p className="text-white/70 font-black text-[10px] uppercase tracking-widest mt-2">Institutional Alert System</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-10 space-y-8">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Broadcast Headline</label>
                            <Input 
                                placeholder="e.g. System Maintenance or Holiday Notice"
                                className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold text-sm px-6"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-6">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Alert Category</label>
                                <select 
                                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 outline-none focus:ring-2 focus:ring-sky-500/20"
                                    value={newAnnouncement.category}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                                >
                                    <option value="general">General Notification</option>
                                    <option value="exam">Exam Notice (Mid/Final)</option>
                                    <option value="holiday">Holiday/Break</option>
                                    <option value="schedule">Schedule Change</option>
                                    <option value="academic">Academic Update</option>
                                    <option value="administrative">Registrar/Admin</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Audience</label>
                                <select 
                                    className="w-full h-14 rounded-2xl bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 outline-none focus:ring-2 focus:ring-sky-500/20"
                                    value={newAnnouncement.targetGrade}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, targetGrade: e.target.value})}
                                >
                                    <option value="">All Students (Global)</option>
                                    <option value="9">Grade 9 Students</option>
                                    <option value="10">Grade 10 Students</option>
                                    <option value="11">Grade 11 Students</option>
                                    <option value="12">Grade 12 Students</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Content</label>
                            <Textarea 
                                placeholder="Type the full announcement message here..."
                                className="min-h-[160px] rounded-3xl bg-slate-50 border-slate-100 font-medium text-sm p-6 leading-relaxed"
                                value={newAnnouncement.body}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, body: e.target.value})}
                            />
                        </div>

                        <DialogFooter className="flex gap-4 pt-4">
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsCreateOpen(false)}
                                className="h-14 flex-1 rounded-2xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                            >
                                Discard
                            </Button>
                            <Button 
                                onClick={handleCreate}
                                className="h-14 flex-1 bg-sky-500 hover:bg-sky-600 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-xl shadow-sky-500/20 flex items-center justify-center gap-3"
                            >
                                <Send className="w-4 h-4" />
                                Dispatch Broadcast
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
