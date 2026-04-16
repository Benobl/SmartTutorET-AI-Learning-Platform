"use client"

import { useState, useEffect } from "react"
import {
    Users,
    Search,
    CheckCircle,
    XCircle,
    FileText,
    GraduationCap,
    Clock,
    UserCheck,
    Mail,
    FileSearch,
    FileCheck,
    ExternalLink
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter
} from "@/components/ui/dialog"
import { getPendingTutors, getAllTutors, approveTutor } from "@/lib/manager-utils"
import { toast } from "sonner"

export default function TutorApprovals() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<'all' | 'pending'>('pending')
    const [tutors, setTutors] = useState<any[]>([])
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)

    const refreshData = () => {
        const data = filter === 'pending' ? getPendingTutors() : getAllTutors()
        setTutors(data)
    }

    useEffect(() => {
        refreshData()
    }, [filter])

    const handleApprove = (id: string, name: string) => {
        approveTutor(id)
        setReviewModalOpen(false)
        refreshData()
        toast.success(`${name} has been successfully approved!`)
    }

    const openReview = (tutor: any) => {
        setSelectedTutor(tutor)
        setReviewModalOpen(true)
    }

    const filteredTutors = tutors.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-10 animate-in fade-in duration-500">
            {/* Header */}
            <div className="space-y-2 px-1">
                <h1 className="text-3xl font-bold text-slate-900 tracking-tight">Tutor Vetting</h1>
                <p className="text-slate-500 font-medium">Review and verify professional credentials of educators.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col md:flex-row gap-6 items-center justify-between">
                <div className="relative w-full md:w-[450px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search current queue..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-12 rounded-xl focus:ring-blue-500/50 shadow-sm border"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex items-center gap-1.5 p-1.5 bg-white rounded-xl border border-slate-200 shadow-sm">
                    <button
                        onClick={() => setFilter('pending')}
                        className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'pending' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        Pending review
                    </button>
                    <button
                        onClick={() => setFilter('all')}
                        className={`px-6 py-2 rounded-lg text-[11px] font-black uppercase tracking-widest transition-all ${filter === 'all' ? 'bg-blue-600 text-white shadow-md shadow-blue-500/10' : 'text-slate-400 hover:text-slate-600'}`}
                    >
                        All Tutors
                    </button>
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredTutors.length > 0 ? (
                    filteredTutors.map((tutor) => (
                        <Card key={tutor.id} className="bg-white border-slate-200 rounded-3xl overflow-hidden hover:shadow-lg transition-all duration-300 border shadow-sm group">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-2xl bg-blue-50 flex items-center justify-center text-xl font-bold text-blue-700 shadow-sm border border-blue-100">
                                            {tutor.firstName[0]}
                                        </div>
                                        <div className="space-y-1">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-900 leading-none">{tutor.name}</h3>
                                                <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-2 py-0 ${tutor.status === 'pending' ? 'bg-amber-100 text-amber-700' : 'bg-emerald-100 text-emerald-700'}`}>
                                                    {tutor.status}
                                                </Badge>
                                            </div>
                                            <div className="flex items-center gap-6 text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-1">
                                                <span className="flex items-center gap-2 font-semibold tracking-normal"><Mail className="w-3.5 h-3.5 text-slate-300" /> {tutor.email}</span>
                                                <span className="flex items-center gap-2 font-semibold tracking-normal font-bold text-blue-600"><GraduationCap className="w-3.5 h-3.5" /> {tutor.subject}</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => openReview(tutor)}
                                            className="h-10 px-4 text-slate-400 hover:text-slate-900 hover:bg-slate-50 rounded-lg text-[10px] font-black uppercase tracking-widest border border-slate-200"
                                        >
                                            Review CV
                                        </Button>
                                        <div className="w-px h-6 bg-slate-100 mx-2" />
                                        {tutor.status === 'pending' ? (
                                            <Button
                                                onClick={() => handleApprove(tutor.id, tutor.name)}
                                                className="bg-blue-600 hover:bg-blue-700 text-white rounded-lg font-bold px-6 h-10 text-xs shadow-md shadow-blue-500/10"
                                            >
                                                Approve
                                            </Button>
                                        ) : (
                                            <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs px-4">
                                                <CheckCircle className="w-4 h-4" />
                                                Verified
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border border-dashed border-slate-200 shadow-sm">
                        <Users className="w-12 h-12 text-slate-200 mx-auto mb-6" />
                        <h3 className="text-lg font-bold text-slate-400">Registry clear</h3>
                        <p className="text-[10px] text-slate-300 font-black uppercase tracking-[0.2em] mt-2">Zero matching application records</p>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="sm:max-w-[600px] bg-white rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
                    {selectedTutor && (
                        <>
                            <div className="p-8 bg-blue-600 flex items-center gap-6">
                                <div className="w-20 h-20 rounded-2xl bg-white flex items-center justify-center text-3xl font-bold text-blue-600 shadow-xl">
                                    {selectedTutor.firstName[0]}
                                </div>
                                <div className="text-white">
                                    <h2 className="text-2xl font-bold tracking-tight">{selectedTutor.name}</h2>
                                    <p className="text-blue-100 font-medium text-sm">Professional Specialist in {selectedTutor.subject}</p>
                                    <div className="flex items-center gap-3 mt-3">
                                        <Badge className="bg-white/20 hover:bg-white/30 text-white border-0 font-bold px-3 py-1 text-[10px]">{selectedTutor.degree}</Badge>
                                        <Badge className="bg-emerald-500/20 text-emerald-100 border-0 font-bold px-3 py-1 text-[10px]">{selectedTutor.experience} Years of Practice</Badge>
                                    </div>
                                </div>
                            </div>
                            <div className="p-10 space-y-8">
                                <div className="space-y-3">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.2em] text-slate-400 flex items-center gap-2">
                                        <FileSearch className="w-4 h-4" /> Executive Summary
                                    </h3>
                                    <p className="text-slate-600 text-sm leading-relaxed p-6 bg-slate-50 rounded-2xl border border-slate-100 italic border-l-4 border-l-blue-500">
                                        "{selectedTutor.cvSummary || 'The applicant provided no executive biography.'}"
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-6">
                                    <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2 group hover:border-blue-200 transition-colors">
                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Academic Verification</h3>
                                        <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs">
                                            <FileCheck className="w-4 h-4" />
                                            Legitimacy Confirmed
                                        </div>
                                    </div>
                                    <div className="p-5 rounded-2xl border border-slate-100 bg-white shadow-sm space-y-2 group hover:border-blue-200 transition-colors">
                                        <h3 className="text-[9px] font-black uppercase tracking-widest text-slate-400">Institutional Email</h3>
                                        <div className="flex items-center gap-2 text-blue-600 font-bold text-xs truncate">
                                            <ExternalLink className="w-4 h-4" />
                                            {selectedTutor.email}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex items-center gap-4 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="flex-1 rounded-xl h-14 font-bold border border-slate-100 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                                        onClick={() => setReviewModalOpen(false)}
                                    >
                                        Close Review
                                    </Button>
                                    {selectedTutor.status === 'pending' && (
                                        <Button
                                            className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl h-14 font-bold shadow-lg shadow-blue-500/20"
                                            onClick={() => handleApprove(selectedTutor.id, selectedTutor.name)}
                                        >
                                            Grant Approval
                                        </Button>
                                    )}
                                </div>
                            </div>
                        </>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
