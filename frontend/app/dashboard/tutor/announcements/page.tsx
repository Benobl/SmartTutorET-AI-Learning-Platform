"use client"

import { useState, useEffect } from "react"
import { announcementApi, courseApi } from "@/lib/api"
import { useToast } from "@/hooks/use-toast"
import { cn } from "@/lib/utils"
import { 
    Bell, 
    Plus, 
    Search, 
    Trash2, 
    Loader2, 
    AlertTriangle, 
    BookOpen, 
    Building2, 
    Globe, 
    Megaphone,
    Calendar,
    Pin,
    ArrowUpRight,
    Send,
    UserCircle2
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

export default function TutorAnnouncements() {
    const { toast } = useToast()
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
            toast({ title: "Error", description: "Failed to load announcements", variant: "destructive" })
        } finally {
            setLoading(false)
        }
    }

    const handleCreate = async () => {
        if (!newAnnouncement.title || !newAnnouncement.body) {
            toast({ title: "Missing Fields", description: "Please provide a title and content.", variant: "destructive" })
            return
        }
        try {
            await announcementApi.create(newAnnouncement)
            toast({ title: "Broadcast Sent!", description: "Your announcement is now live." })
            setIsCreateOpen(false)
            setNewAnnouncement({ title: "", body: "", category: "general", targetGrade: "" })
            loadAnnouncements()
        } catch (error: any) {
            toast({ title: "Error", description: error.message || "Failed to post announcement", variant: "destructive" })
        }
    }

    const handleDelete = async (id: string) => {
        try {
            await announcementApi.delete(id)
            toast({ title: "Deleted", description: "Announcement removed successfully." })
            loadAnnouncements()
        } catch (error) {
            toast({ title: "Error", description: "Failed to delete", variant: "destructive" })
        }
    }

    return (
        <div className="space-y-10 animate-in fade-in slide-in-from-bottom-6 duration-1000 pb-20">
            {/* Header */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-6 border-b border-slate-100/50">
                <div>
                    <div className="flex items-center gap-2 mb-3">
                        <span className="px-3 py-1 rounded-full bg-amber-50 text-amber-600 text-[10px] font-black uppercase tracking-widest border border-amber-100 italic">Broadcast Hub</span>
                        <Megaphone className="w-4 h-4 text-amber-400" />
                    </div>
                    <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                        Community <span className='text-amber-500'>Alerts</span>
                    </h1>
                    <p className="text-slate-500 text-sm font-medium max-w-md">
                        Broadcast critical updates, academic notices, and urgent alerts to your students.
                    </p>
                </div>

                <Button 
                    onClick={() => setIsCreateOpen(true)}
                    className="h-16 px-10 bg-slate-900 hover:bg-sky-600 text-white rounded-[32px] font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-2xl hover:scale-105 transition-all"
                >
                    <Plus className="w-5 h-5 text-amber-400" />
                    New Announcement
                </Button>
            </div>

            {/* List */}
            <div className="grid grid-cols-1 gap-6">
                {loading ? (
                    <div className="py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
                        <Loader2 className="w-12 h-12 text-amber-500 animate-spin mx-auto mb-6" />
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-lg mb-2">Syncing Alerts</h4>
                        <p className="text-slate-400 text-sm font-medium italic">Scanning the communication vault...</p>
                    </div>
                ) : announcements.length > 0 ? (
                    announcements.map((a) => {
                        const config = categoryConfig[a.category] || categoryConfig.general
                        return (
                            <div key={a._id} className="group p-8 rounded-[40px] bg-white border border-slate-100 hover:border-amber-200 hover:shadow-2xl hover:-translate-y-1 transition-all duration-700 relative overflow-hidden">
                                <div className="flex items-start justify-between relative z-10">
                                    <div className="flex gap-6">
                                        <div className={cn("w-16 h-16 rounded-[24px] flex items-center justify-center border shadow-sm shrink-0", `bg-${config.color}-50 border-${config.color}-100 text-${config.color}-500`)}>
                                            <config.icon className="w-8 h-8" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-2xl font-black text-slate-900 tracking-tight uppercase italic">{a.title}</h3>
                                                <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", `bg-${config.color}-50 text-${config.color}-600 border-${config.color}-100`)}>
                                                    {config.label}
                                                </span>
                                            </div>
                                            <p className="text-slate-500 font-medium leading-relaxed max-w-3xl pr-10">{a.body}</p>
                                            <div className="flex items-center gap-6 pt-4 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                                                <div className="flex items-center gap-1.5">
                                                    <Calendar className="w-3.5 h-3.5" />
                                                    {new Date(a.date || a.createdAt).toLocaleDateString()}
                                                </div>
                                                <div className="flex items-center gap-1.5">
                                                    <UserCircle2 className="w-3.5 h-3.5" />
                                                    {a.author || "Tutor"}
                                                </div>
                                                {a.targetGrade && (
                                                    <div className="flex items-center gap-1.5 text-indigo-500 italic">
                                                        <Globe className="w-3.5 h-3.5" />
                                                        Grade {a.targetGrade}
                                                    </div>
                                                )}
                                            </div>
                                        </div>
                                    </div>
                                    <Button 
                                        variant="ghost"
                                        size="icon"
                                        onClick={() => handleDelete(a._id)}
                                        className="h-12 w-12 rounded-2xl text-slate-300 hover:text-rose-500 hover:bg-rose-50 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </Button>
                                </div>
                            </div>
                        )
                    })
                ) : (
                    <div className="py-32 text-center bg-white rounded-[56px] border border-dashed border-slate-200">
                        <Megaphone className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h4 className="text-slate-900 font-black uppercase tracking-widest text-lg mb-2">Silence in the Hall</h4>
                        <p className="text-slate-400 text-sm font-medium italic">You haven't posted any announcements yet.</p>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            <Dialog open={isCreateOpen} onOpenChange={setIsCreateOpen}>
                <DialogContent className="max-w-2xl rounded-[48px] p-0 border-none overflow-hidden shadow-3xl bg-white">
                    <div className="bg-amber-500 p-10 relative overflow-hidden">
                        <div className="absolute -right-20 -top-20 w-64 h-64 bg-white/10 blur-3xl rounded-full" />
                        <DialogHeader className="relative z-10">
                            <div className="flex items-center gap-4 mb-4">
                                <div className="w-14 h-14 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center border border-white/30 shadow-xl">
                                    <Megaphone className="w-7 h-7 text-white" />
                                </div>
                                <div>
                                    <DialogTitle className="text-3xl font-black uppercase tracking-tight text-white italic">Broadcast Message</DialogTitle>
                                    <p className="text-white/70 font-black text-[10px] uppercase tracking-widest mt-1">Send a notification to your classroom</p>
                                </div>
                            </div>
                        </DialogHeader>
                    </div>

                    <div className="p-12 space-y-10">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject / Headline</label>
                            <Input 
                                placeholder="e.g. Midterm Exam Postponed"
                                className="h-16 rounded-[28px] bg-slate-50 border-slate-100 font-black text-sm px-6 italic"
                                value={newAnnouncement.title}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, title: e.target.value})}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-8">
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Category</label>
                                <select 
                                    className="w-full h-16 rounded-[28px] bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    value={newAnnouncement.category}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, category: e.target.value})}
                                >
                                    <option value="general">General Notification</option>
                                    <option value="exam">Exam Notice (Mid/Final)</option>
                                    <option value="holiday">Holiday/Break</option>
                                    <option value="schedule">Schedule Change</option>
                                    <option value="academic">Academic Update</option>
                                    <option value="administrative">Administrative</option>
                                </select>
                            </div>
                            <div className="space-y-3">
                                <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Target Grade (Optional)</label>
                                <select 
                                    className="w-full h-16 rounded-[28px] bg-slate-50 border border-slate-100 font-black text-[10px] uppercase tracking-widest px-6 outline-none focus:ring-2 focus:ring-amber-500/20"
                                    value={newAnnouncement.targetGrade}
                                    onChange={(e) => setNewAnnouncement({...newAnnouncement, targetGrade: e.target.value})}
                                >
                                    <option value="">All My Students</option>
                                    <option value="9">Grade 9</option>
                                    <option value="10">Grade 10</option>
                                    <option value="11">Grade 11</option>
                                    <option value="12">Grade 12</option>
                                </select>
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Message Body</label>
                            <Textarea 
                                placeholder="Type your announcement details here..."
                                className="min-h-[160px] rounded-[32px] bg-slate-50 border-slate-100 font-medium text-sm p-8 leading-relaxed"
                                value={newAnnouncement.body}
                                onChange={(e) => setNewAnnouncement({...newAnnouncement, body: e.target.value})}
                            />
                        </div>

                        <DialogFooter className="flex gap-4 pt-4 sm:justify-between">
                            <Button 
                                variant="ghost" 
                                onClick={() => setIsCreateOpen(false)}
                                className="h-16 px-10 rounded-full font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-50"
                            >
                                Discard
                            </Button>
                            <Button 
                                onClick={handleCreate}
                                className="h-16 px-12 bg-amber-500 hover:bg-amber-600 text-white rounded-full font-black text-[10px] uppercase tracking-widest shadow-2xl shadow-amber-500/20 flex items-center gap-3"
                            >
                                <Send className="w-4 h-4" />
                                Dispatch Alert
                            </Button>
                        </DialogFooter>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
