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
    Users
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
import { getJobs, postJob } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function JobManagement() {
    const [jobs, setJobs] = useState<any[]>([])
    const [searchQuery, setSearchQuery] = useState("")
    const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)

    // Form state
    const [newJob, setNewJob] = useState({
        title: "",
        subject: "",
        grade: "",
        salaryRange: "",
        description: ""
    })

    const refreshJobs = () => {
        setJobs(getJobs())
    }

    useEffect(() => {
        refreshJobs()
    }, [])

    const handleCreateJob = (e: React.FormEvent) => {
        e.preventDefault()
        if (!newJob.title || !newJob.subject) {
            return
        }
        postJob(newJob)
        setIsCreateModalOpen(false)
        setNewJob({ title: "", subject: "", grade: "", salaryRange: "", description: "" })
        refreshJobs()
        toast.success("Job vacancy posted successfully!")
    }

    const filteredJobs = jobs.filter(j =>
        j.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        j.subject.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 px-1">
                <div className="space-y-1">
                    <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Job Placements</h1>
                    <p className="text-slate-500 font-medium text-sm">Manage staff vacancies and incoming applications.</p>
                </div>
                <Button
                    onClick={() => setIsCreateModalOpen(true)}
                    className="bg-blue-600 hover:bg-blue-700 text-white rounded-xl gap-2 font-bold px-8 h-12 text-sm shadow-lg shadow-blue-500/10 transition-all"
                >
                    <Plus Circle className="w-5 h-5" />
                    Post New Vacancy
                </Button>
            </div>

            {/* Filter Bar */}
            <div className="flex flex-col md:flex-row gap-4">
                <div className="relative flex-1">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search active listings..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-12 rounded-xl focus:ring-blue-500/50 shadow-sm border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
            </div>

            {/* Jobs list */}
            <div className="grid grid-cols-1 gap-4">
                {filteredJobs.length > 0 ? (
                    filteredJobs.map((job) => (
                        <Card key={job.id} className="bg-white border-slate-200 rounded-3xl overflow-hidden hover:shadow-md transition-all duration-300 border shadow-sm group">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-6">
                                    <div className="flex items-center gap-6">
                                        <div className="w-14 h-14 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600 border border-blue-100">
                                            <Briefcase className="w-7 h-7" />
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-2">
                                                <h3 className="text-xl font-bold text-slate-900">{job.title}</h3>
                                                <Badge className="bg-emerald-50 text-emerald-600 border-0 font-bold px-2 py-0 text-[10px] uppercase tracking-widest">{job.status}</Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                                                <span className="flex items-center gap-2 font-semibold tracking-normal"><Calendar className="w-3.5 h-3.5 text-slate-300" /> Posted {job.postedAt}</span>
                                                <span className="flex items-center gap-2 font-semibold tracking-normal"><Users className="w-3.5 h-3.5 text-slate-300" /> {job.applicantsCount} Applicants</span>
                                                <span className="flex items-center gap-2 font-semibold tracking-normal text-blue-600"><MapPin className="w-3.5 h-3.5" /> Grade {job.grade}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button variant="ghost" className="h-10 px-4 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200">
                                            View Applicants
                                        </Button>
                                        <Button variant="ghost" className="h-10 w-10 p-0 text-slate-300 hover:text-rose-500 hover:bg-rose-50 rounded-lg border border-slate-100">
                                            <Trash2 className="w-5 h-5" />
                                        </Button>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
                        <Briefcase className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                        <h3 className="text-lg font-bold text-slate-400">No vacancies found</h3>
                        <p className="text-xs text-slate-300 mt-1 uppercase tracking-widest font-black">Post your first job to start hiring</p>
                    </div>
                )}
            </div>

            {/* Create Job Modal */}
            <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
                <DialogContent className="sm:max-w-[500px] bg-white rounded-3xl p-8 border-0 shadow-2xl">
                    <DialogHeader className="mb-6">
                        <DialogTitle className="text-2xl font-bold text-slate-900">Post New Vacancy</DialogTitle>
                        <p className="text-slate-500 text-sm">Describe the role, subject, and requirements for the new teacher.</p>
                    </DialogHeader>

                    <form onSubmit={handleCreateJob} className="space-y-6">
                        <div className="space-y-4">
                            <div className="space-y-2">
                                <Label htmlFor="title" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Job Title</Label>
                                <Input
                                    id="title"
                                    placeholder="e.g. Senior Physics Instructor"
                                    className="rounded-xl border-slate-200 h-12"
                                    value={newJob.title}
                                    onChange={(e) => setNewJob({ ...newJob, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label htmlFor="subject" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject</Label>
                                    <Input
                                        id="subject"
                                        placeholder="e.g. Physics"
                                        className="rounded-xl border-slate-200 h-12"
                                        value={newJob.subject}
                                        onChange={(e) => setNewJob({ ...newJob, subject: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label htmlFor="grade" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grade Level</Label>
                                    <Input
                                        id="grade"
                                        placeholder="e.g. 10-12"
                                        className="rounded-xl border-slate-200 h-12"
                                        value={newJob.grade}
                                        onChange={(e) => setNewJob({ ...newJob, grade: e.target.value })}
                                        required
                                    />
                                </div>
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="desc" className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Role Description</Label>
                                <Textarea
                                    id="desc"
                                    placeholder="Briefly describe the responsibilities..."
                                    className="rounded-xl border-slate-200 min-h-[100px]"
                                    value={newJob.description}
                                    onChange={(e) => setNewJob({ ...newJob, description: e.target.value })}
                                />
                            </div>
                        </div>

                        <DialogFooter className="pt-4 flex !justify-between gap-4">
                            <Button
                                type="button"
                                variant="ghost"
                                className="flex-1 rounded-xl h-12 font-bold border border-slate-100"
                                onClick={() => setIsCreateModalOpen(false)}
                            >
                                Cancel
                            </Button>
                            <Button
                                type="submit"
                                className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-12 font-bold shadow-lg shadow-blue-500/20"
                            >
                                Post Vacancy
                            </Button>
                        </DialogFooter>
                    </form>
                </DialogContent>
            </Dialog>
        </div>
    )
}
