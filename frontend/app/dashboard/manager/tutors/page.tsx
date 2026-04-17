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
    ExternalLink,
    ShieldCheck,
    Eye,
    ChevronRight,
    SearchX,
    Loader2
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
} from "@/components/ui/dialog"
import { getPendingTutors, getAllTutors, approveTutor, rejectTutor } from "@/lib/manager-utils"
import { toast } from "sonner"

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function TutorApprovals() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<FilterStatus>('pending')
    const [tutors, setTutors] = useState<any[]>([])
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [docType, setDocType] = useState<'degree' | 'cv' | null>(null)
    const [isProcessing, setIsProcessing] = useState(false)

    const refreshData = () => {
        let data = getAllTutors()
        if (filter === 'pending') data = data.filter(t => t.status === 'pending')
        else if (filter === 'approved') data = data.filter(t => t.status === 'approved')
        else if (filter === 'rejected') data = data.filter(t => t.status === 'rejected')
        setTutors(data)
    }

    useEffect(() => {
        refreshData()
    }, [filter])

    const handleAction = async (id: string, name: string, action: 'approve' | 'reject') => {
        setIsProcessing(true)
        try {
            if (action === 'approve') {
                approveTutor(id)
                toast.success(`${name} has been approved!`)
            } else {
                rejectTutor(id)
                toast.error(`${name}'s application was rejected.`)
            }
            setReviewModalOpen(false)
            refreshData()
        } finally {
            setIsProcessing(false)
        }
    }

    const openReview = (tutor: any) => {
        setSelectedTutor(tutor)
        setReviewModalOpen(true)
        setDocType(null)
    }

    const filteredTutors = tutors.filter(t =>
        t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        t.subject?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="relative space-y-10 animate-in fade-in duration-500 pb-20 overflow-x-hidden">
            {/* Mesh Background Accents */}
            <div className="absolute -top-24 -right-20 w-96 h-96 bg-blue-400/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="space-y-2 px-1 relative">
                <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tutor <span className="text-blue-500">Registry</span></h1>
                <p className="text-slate-400 font-medium">Verify credentials and manage educator onboarding.</p>
            </div>

            {/* Controls */}
            <div className="flex flex-col lg:flex-row gap-6 items-center justify-between relative z-10">
                <div className="relative w-full lg:w-[480px]">
                    <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                    <Input
                        placeholder="Search by name, email, or subject..."
                        className="bg-white border-slate-200 text-slate-900 pl-11 h-14 rounded-2xl focus:ring-blue-500/30 shadow-sm border transaction-all"
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                    />
                </div>
                <div className="flex flex-wrap items-center gap-1.5 p-1.5 bg-white rounded-[20px] border border-slate-200 shadow-sm overflow-hidden mb-auto sm:mb-0">
                    {(['pending', 'approved', 'rejected', 'all'] as FilterStatus[]).map((tab) => (
                        <button
                            key={tab}
                            onClick={() => setFilter(tab)}
                            className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === tab ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-400 hover:text-slate-600 hover:bg-slate-50'}`}
                        >
                            {tab}
                        </button>
                    ))}
                </div>
            </div>

            {/* List */}
            <div className="space-y-4">
                {filteredTutors.length > 0 ? (
                    filteredTutors.map((tutor) => (
                        <Card key={tutor.id} className="bg-white border-slate-100 rounded-[35px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border shadow-sm group">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        <div className="w-16 h-16 rounded-[24px] bg-gradient-to-br from-blue-50 to-slate-50 flex items-center justify-center text-xl font-black text-blue-600 shadow-inner border border-blue-50">
                                            {tutor.firstName[0]}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-800 leading-none">{tutor.name}</h3>
                                                <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${tutor.status === 'pending' ? 'bg-amber-100 text-amber-600' : tutor.status === 'approved' ? 'bg-emerald-100 text-emerald-600' : 'bg-rose-100 text-rose-600'}`}>
                                                    {tutor.status}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-[11px] font-bold text-slate-400 uppercase tracking-widest pt-0.5">
                                                <span className="flex items-center gap-2 tracking-normal lowercase"><Mail className="w-3.5 h-3.5 text-slate-300" /> {tutor.email}</span>
                                                <span className="flex items-center gap-2 tracking-normal text-blue-500"><GraduationCap className="w-3.5 h-3.5" /> {tutor.subject} ({tutor.experience}y)</span>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3">
                                        <Button
                                            variant="ghost"
                                            onClick={() => openReview(tutor)}
                                            className="h-12 px-6 text-slate-400 hover:text-slate-800 hover:bg-slate-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100 transition-all group/btn"
                                        >
                                            View Profile <ChevronRight className="w-3.5 h-3.5 ml-1 group-hover/btn:translate-x-1 transition-transform" />
                                        </Button>

                                        {tutor.status === 'pending' && (
                                            <Button
                                                onClick={() => handleAction(tutor.id, tutor.name, 'approve')}
                                                disabled={isProcessing}
                                                className="bg-blue-600 hover:bg-blue-500 text-white rounded-2xl font-black px-8 h-12 text-[10px] uppercase tracking-widest shadow-xl shadow-blue-500/20 active:scale-95 transition-all"
                                            >
                                                {isProcessing ? <Loader2 className="w-4 h-4 animate-spin mr-2" /> : "Quick Approve"}
                                            </Button>
                                        )}

                                        {tutor.status === 'approved' && (
                                            <div className="flex items-center gap-2 text-emerald-600 font-black text-[10px] uppercase tracking-widest px-6 h-12 bg-emerald-50 rounded-2xl">
                                                <CheckCircle className="w-4 h-4" />
                                                Verified
                                            </div>
                                        )}

                                        {tutor.status === 'rejected' && (
                                            <div className="flex items-center gap-2 text-rose-500 font-black text-[10px] uppercase tracking-widest px-6 h-12 bg-rose-50 rounded-2xl">
                                                <XCircle className="w-4 h-4" />
                                                Rejected
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm animate-in fade-in zoom-in-95 duration-500">
                        <SearchX className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-300">No Records Found</h3>
                        <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.25em] mt-3 px-10 max-w-md mx-auto">There are currently no educator profiles matching your search criteria or filter state.</p>
                    </div>
                )}
            </div>

            {/* Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="sm:max-w-[700px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-3xl">
                    {selectedTutor && (
                        <div className="animate-in fade-in zoom-in-95 duration-500">
                            <div className="p-10 bg-slate-50/50 border-b border-slate-100 flex flex-col md:flex-row items-center gap-8 relative">
                                <div className="absolute top-6 right-8">
                                    <Badge className={`${selectedTutor.status === 'approved' ? 'bg-emerald-500' : selectedTutor.status === 'rejected' ? 'bg-rose-500' : 'bg-blue-600'} text-white border-0 font-black px-4 py-1.5 text-[10px] uppercase tracking-widest shadow-lg`}>
                                        {selectedTutor.status} Profile
                                    </Badge>
                                </div>
                                <div className="w-24 h-24 rounded-[30px] bg-white border-2 border-blue-100 flex items-center justify-center text-4xl font-black text-blue-600 shadow-xl shadow-blue-500/5">
                                    {selectedTutor.firstName[0]}
                                </div>
                                <div className="text-center md:text-left">
                                    <h2 className="text-3xl font-black text-slate-800 leading-none mb-2">{selectedTutor.name}</h2>
                                    <div className="flex flex-wrap items-center justify-center md:justify-start gap-4">
                                        <span className="text-blue-500 font-black text-xs tracking-widest uppercase flex items-center gap-2"><Mail className="w-3.5 h-3.5" />{selectedTutor.email}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="p-10 space-y-10">
                                {/* Details Grid */}
                                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Main Subject</p>
                                        <p className="text-slate-800 font-black">{selectedTutor.subject}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Education</p>
                                        <p className="text-slate-800 font-black">{selectedTutor.degree}</p>
                                    </div>
                                    <div className="p-6 rounded-3xl bg-slate-50 border border-slate-100 space-y-1">
                                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Practice</p>
                                        <p className="text-slate-800 font-black">{selectedTutor.experience} Years Active</p>
                                    </div>
                                </div>

                                {/* Simulated Document Viewers */}
                                <div className="space-y-4">
                                    <h3 className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-4 px-1 flex items-center gap-2">
                                        <FileSearch className="w-4 h-4 text-slate-300" /> Administrative Attachments
                                    </h3>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <button
                                            onClick={() => {
                                                setDocType(docType === 'degree' ? null : 'degree')
                                                window.open(`https://docs.google.com/viewer?url=https://example.com/${selectedTutor.degree || 'degree'}.pdf`, '_blank')
                                            }}
                                            className={`p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center gap-4 group ${docType === 'degree' ? 'border-blue-500 bg-blue-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${docType === 'degree' ? 'bg-blue-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                <GraduationCap className="w-5 h-5" />
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Credentials</p>
                                                <p className={`text-xs font-bold truncate max-w-[120px] ${docType === 'degree' ? 'text-blue-600' : 'text-slate-700'}`}>{selectedTutor.degree || 'academic_proof.pdf'}</p>
                                            </div>
                                            <ExternalLink className={`w-3.5 h-3.5 ml-auto transition-opacity ${docType === 'degree' ? 'opacity-100 text-blue-500' : 'opacity-20'}`} />
                                        </button>

                                        <button
                                            onClick={() => {
                                                setDocType(docType === 'cv' ? null : 'cv')
                                                window.open(`https://docs.google.com/viewer?url=https://example.com/cv_${selectedTutor.firstName}.pdf`, '_blank')
                                            }}
                                            className={`p-4 rounded-[20px] border-2 transition-all duration-300 flex items-center gap-4 group ${docType === 'cv' ? 'border-indigo-500 bg-indigo-50/30' : 'border-slate-100 bg-white hover:border-slate-200'}`}
                                        >
                                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center transition-colors ${docType === 'cv' ? 'bg-indigo-500 text-white' : 'bg-slate-50 text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500'}`}>
                                                <FileText className="w-5 h-5" />
                                            </div>
                                            <div className="text-left leading-tight">
                                                <p className="text-[9px] font-black uppercase tracking-widest text-slate-400">Biography</p>
                                                <p className={`text-xs font-bold truncate max-w-[120px] ${docType === 'cv' ? 'text-indigo-600' : 'text-slate-700'}`}>resume_v2.pdf</p>
                                            </div>
                                            <ExternalLink className={`w-3.5 h-3.5 ml-auto transition-opacity ${docType === 'cv' ? 'opacity-100 text-indigo-500' : 'opacity-20'}`} />
                                        </button>
                                    </div>
                                </div>

                                {/* Preview Area - Lighter Aesthetic */}
                                {docType && (
                                    <div className="p-8 rounded-[32px] bg-blue-50/50 border border-blue-100 animate-in slide-in-from-top-4 duration-500 text-center relative overflow-hidden">
                                        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-200/10 rounded-full blur-[80px] pointer-events-none" />
                                        <div className="flex flex-col items-center gap-6 relative z-10">
                                            <div className="w-16 h-16 rounded-3xl bg-white border-2 border-blue-100 flex items-center justify-center shadow-xl shadow-blue-500/5">
                                                <Loader2 className="w-8 h-8 text-blue-500 animate-spin" />
                                            </div>
                                            <div className="space-y-1">
                                                <h4 className="text-blue-900 font-black text-xs uppercase tracking-[0.2em]">Secure Viewer Active</h4>
                                                <p className="text-blue-400/80 text-[10px] font-bold uppercase tracking-widest">A NEW INSTANCE HAS BEEN OPENED FOR {docType.toUpperCase()} REVIEW</p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4">
                                    <Button
                                        variant="ghost"
                                        className="w-full sm:flex-none sm:w-40 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50"
                                        onClick={() => setReviewModalOpen(false)}
                                    >
                                        Close
                                    </Button>

                                    {selectedTutor.status === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => handleAction(selectedTutor.id, selectedTutor.name, 'reject')}
                                                disabled={isProcessing}
                                                className="w-full sm:flex-1 bg-rose-50 text-rose-500 border-2 border-rose-100 hover:bg-rose-100 rounded-2xl h-16 font-black uppercase tracking-widest text-[10px]"
                                            >
                                                Deny Application
                                            </Button>
                                            <Button
                                                onClick={() => handleAction(selectedTutor.id, selectedTutor.name, 'approve')}
                                                disabled={isProcessing}
                                                className="w-full sm:flex-1 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl h-16 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-blue-500/30 transition-all active:scale-95"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : "Approve Educator"}
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>
        </div>
    )
}
