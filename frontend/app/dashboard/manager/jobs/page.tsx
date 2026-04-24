"use client"

import { useState, useEffect } from "react"
import {
    Briefcase,
    Plus,
    Search,
    MoreVertical,
    Calendar,
    MapPin,
    Trash2,
    Edit,
    PlusCircle,
    CheckCircle2,
    Users,
    SearchX,
    ChevronRight,
    Loader2
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { getJobs, postJob, deleteJob } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function JobManagement() {
    const [jobs, setJobs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
    const [isDetailModalOpen, setIsDetailModalOpen] = useState(false)
    const [selectedJob, setSelectedJob] = useState<any>(null)
    const [isDeleting, setIsDeleting] = useState<string | null>(null)
    const [isPosting, setIsPosting] = useState(false)

    // Form state
    const [newJob, setNewJob] = useState({
        title: "",
        subject: "",
        grade: "",
        salaryRange: "",
        description: "",
        location: "Addis Ababa (On-site)",
        type: "Full-time"
    })

    const refreshJobs = () => {
        setJobs(getJobs())
    }

    useEffect(() => {
        refreshJobs()
    }, [])

    const handleCreateJob = async (e: React.FormEvent) => {
        e.preventDefault()
        if (!newJob.title || !newJob.subject) {
            return
        }
        setIsPosting(true)
        try {
            postJob(newJob)
            setIsCreateModalOpen(false)
            setNewJob({
                title: "",
                subject: "",
                grade: "",
                salaryRange: "",
                description: "",
                location: "Addis Ababa (On-site)",
                type: "Full-time"
            })
            refreshJobs()
            toast.success("Job vacancy posted successfully!")
        } finally {
            setIsPosting(false)
        }
    }

    const handleDelete = (id: string) => {
        setIsDeleting(id)
        setTimeout(() => {
            deleteJob(id)
            refreshJobs()
            setIsDeleting(null)
            toast.error("Job listing deleted.")
        }, 800)
    }

    const openDetails = (job: any) => {
        setSelectedJob(job)
        setIsDetailModalOpen(true)
    }

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative space-y-10 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
            {/* Mesh Background Accents */}
            <div className="absolute -top-24 -right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1 relative">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Job <span className="text-blue-500">Board</span></h1>
                    <p className="text-slate-400 font-medium">Manage open positions and track recruitment velocity.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-500 text-white rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                >
                    <Plus className="w-5 h-5" />
                    Create Vacancy
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="relative z-10">
                <div className="relative w-full max-w-[600px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search active listings by title or subject..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-14 rounded-2xl focus:ring-blue-500/30 shadow-sm border transition-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Jobs list */}
            <div className="space-y-4">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <Card key={job.id} className="bg-white border-slate-100 rounded-[35px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border shadow-sm group relative">
                            {/* Decorative Background Circles */}
                            <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/5 rounded-full -mr-16 -mt-16 blur-xl group-hover:bg-blue-500/10 transition-all" />

                            <CardContent className="p-0 relative z-10">
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="relative">
                                            <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white border border-blue-100 shadow-xl group-hover:scale-105 group-hover:rotate-3 transition-all duration-500">
                                                <Briefcase className="w-7 h-7" />
                                            </div>
                                            <div className="absolute -bottom-1 -right-1 w-5 h-5 bg-white rounded-full p-0.5 shadow-sm border-2 border-slate-50">
                                                <div className="w-full h-full bg-emerald-500 rounded-full animate-pulse" />
                                            </div>
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-black text-slate-800 leading-none">{job.title}</h3>
                                                <Badge className="bg-blue-50 text-blue-600 border-0 font-black px-3 py-1 rounded-full text-[9px] uppercase tracking-widest">{job.grade} Grade</Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[10px] font-black text-slate-400 uppercase tracking-widest pt-0.5">
                                                <span className="flex items-center gap-2"><div className="w-1.5 h-1.5 rounded-full bg-slate-200" /> {job.subject}</span>
                                                <span className="flex items-center gap-2 text-blue-500/80"><Users className="w-3.5 h-3.5" /> {job.applicantsCount} Applicants</span>
                                                <span className="flex items-center gap-2 text-emerald-600/80"><CheckCircle2 className="w-3.5 h-3.5" /> Functional</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => openDetails(job)}
                                            className="h-12 px-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all group/btn"
                                        >
                                            View Strategic Audit <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>
                                        <Button
                                            variant="ghost"
                                            onClick={() => handleDelete(job.id)}
                                            disabled={isDeleting === job.id}
                                            className="h-12 w-12 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-2xl border border-slate-50 transition-all active:scale-90"
                                        >
                                            {isDeleting === job.id ? <Loader2 className="w-5 h-5 animate-spin" /> : <Trash2 className="w-5 h-5" />}
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                        <SearchX className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-300">No Positions Found</h3>
                        <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.25em] mt-3 px-10 max-w-md mx-auto">There are currently no active job listings matching your search criteria.</p>
                    </div>
                )}
            </div>

            {/* Detail Modal */}
            <Dialog open={isDetailModalOpen} onOpenChange={setIsDetailModalOpen}>
                <DialogContent className="sm:max-w-[700px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    {selectedJob && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="p-10 bg-slate-50/50 border-b border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
                                <div className="relative z-10">
                                    <Badge className="bg-blue-500 text-white border-0 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest mb-6 shadow-lg shadow-blue-500/20">
                                        Strategic Placement
                                    </Badge>
                                    <h2 className="text-4xl font-black text-slate-800 leading-tight mb-2">{selectedJob.title}</h2>
                                    <p className="text-slate-400 font-bold uppercase tracking-widest text-xs flex items-center gap-2">
                                        {selectedJob.subject} Specialist • Grade {selectedJob.grade}
                                    </p>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Remuneration Package</p>
                                        <p className="text-slate-800 font-black">{selectedJob.salaryRange || 'Competitive (ETB)'}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Administrative Subject</p>
                                        <p className="text-slate-800 font-black">{selectedJob.subject}</p>
                                    </div>
                                </div>

                                <div className="space-y-4">
                                    <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] px-1">Engagement Strategy</h3>
                                    <p className="text-slate-600 leading-relaxed font-medium bg-slate-50 p-6 rounded-3xl border border-slate-100">{selectedJob.description || 'No detailed strategic overview provided for this operational role.'}</p>
                                </div>

                                <div className="pt-4 flex justify-end">
                                    <Button
                                        className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-14 px-10 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/20 transition-all font-black"
                                    >
                                        Initiate Contact
                                    </Button>
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Create Job Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    <div className="p-10 bg-slate-50/50 border-b border-slate-100">
                        <DialogHeader>
                            <DialogTitle className="text-3xl font-black text-slate-800 leading-none">Market Exposure</DialogTitle>
                            <p className="text-slate-400 font-medium text-sm mt-2">Publish a high-performance vacancy to attract world-class talent.</p>
                        </DialogHeader>
                    </div>

                    <form onSubmit={handleCreateJob} className="p-10 space-y-8">
                        <div className="space-y-6">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Professional Role Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Advanced Physics Consultant"
                                    className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Academic Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g. Physics"
                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={newJob.subject}
                                        onChange={(e) => setNewJob({ ...newJob, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grade" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Target</Label>
                                    <Input
                                        id="grade"
                                        placeholder="e.g. 10 - 12"
                                        className="bg-white border-slate-200 h-14 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-bold"
                                        value={newJob.grade}
                                        onChange={(e) => setNewJob({ ...newJob, grade: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Strategic Role Overview</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Synthesize the primary objectives and expectations for this position..."
                                    className="bg-white border-slate-200 rounded-2xl focus:ring-blue-500/30 text-slate-800 font-medium min-h-[140px] p-6 leading-relaxed"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="w-full sm:flex-none sm:w-40 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50 transition-all"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Discard
                            </Button>
                            <Button
                                type="submit"
                                disabled={isPosting}
                                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                            >
                                {isPosting ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Finalize & Dispatch"}
                            </Button>
                        </div>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
