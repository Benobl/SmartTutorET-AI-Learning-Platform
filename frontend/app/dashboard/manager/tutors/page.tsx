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
    ExternalLink,
    ShieldCheck,
    Eye,
    SearchX,
    Loader2,
    Calendar,
    BookOpen,
    Award,
    Briefcase,
    AlertTriangle,
    Phone
} from "lucide-react"
import { toast } from "sonner"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Label } from "@/components/ui/label"
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog"
import { getAllTutors, approveTutor, rejectTutor } from "@/lib/manager-utils"

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected'

export default function TutorApprovals() {
    const [searchQuery, setSearchQuery] = useState("")
    const [filter, setFilter] = useState<FilterStatus>('pending')
    const [tutors, setTutors] = useState<any[]>([])
    const [selectedTutor, setSelectedTutor] = useState<any>(null)
    const [reviewModalOpen, setReviewModalOpen] = useState(false)
    const [rejectDialogOpen, setRejectDialogOpen] = useState(false)
    const [rejectReason, setRejectReason] = useState("")
    const [pendingRejectId, setPendingRejectId] = useState<string | null>(null)
    const [pendingRejectName, setPendingRejectName] = useState("")
    const [isProcessing, setIsProcessing] = useState(false)

    const refreshData = async () => {
        try {
            let data = await getAllTutors()
            if (!Array.isArray(data)) {
                setTutors([])
                return
            }
            
            if (filter === 'pending') {
                data = data.filter((t: any) => t.tutorStatus === 'pending' && !t.isApproved)
            } else if (filter === 'approved') {
                data = data.filter((t: any) => t.tutorStatus === 'approved' || t.isApproved)
            } else if (filter === 'rejected') {
                data = data.filter((t: any) => t.tutorStatus === 'rejected')
            }
            setTutors(data)
        } catch (error) {
            console.error("Failed to refresh tutors:", error)
            setTutors([])
        }
    }

    useEffect(() => {
        refreshData()
    }, [filter])

    const handleApprove = async (id: string, name: string) => {
        setIsProcessing(true)
        try {
            const success = await approveTutor(id)
            if (success) {
                toast.success(`✅ ${name} has been approved! An email has been sent to them.`)
                setReviewModalOpen(false)
                await refreshData()
            } else {
                toast.error(`Failed to approve ${name}.`)
            }
        } finally {
            setIsProcessing(false)
        }
    }

    const openRejectDialog = (id: string, name: string) => {
        setPendingRejectId(id)
        setPendingRejectName(name)
        setRejectReason("")
        setRejectDialogOpen(true)
    }

    const handleRejectConfirm = async () => {
        if (!pendingRejectId) return
        setIsProcessing(true)
        try {
            const success = await rejectTutor(pendingRejectId, rejectReason)
            if (success) {
                toast.error(`❌ ${pendingRejectName}'s application has been rejected. An email has been sent to them.`)
                setRejectDialogOpen(false)
                setReviewModalOpen(false)
                await refreshData()
            } else {
                toast.error(`Failed to reject ${pendingRejectName}.`)
            }
        } finally {
            setIsProcessing(false)
            setRejectReason("")
        }
    }

    const openReview = (tutor: any) => {
        setSelectedTutor(tutor)
        setReviewModalOpen(true)
    }

    const filteredTutors = tutors.filter(t =>
        (t.name || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
        (t.subjects || []).join(' ').toLowerCase().includes(searchQuery.toLowerCase())
    )

    const statusColor = (status: string) => {
        if (status === 'pending') return 'bg-amber-100 text-amber-600'
        if (status === 'approved') return 'bg-emerald-100 text-emerald-600'
        if (status === 'rejected') return 'bg-rose-100 text-rose-600'
        return 'bg-slate-100 text-slate-500'
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-500 pb-20">
            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Tutor <span className="text-blue-500">Registry</span></h1>
                    <p className="text-slate-400 font-medium">Review, approve, or reject educator applications.</p>
                </div>
                <div className="flex items-center gap-3">
                    {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(f => (
                        <button
                            key={f}
                            onClick={() => setFilter(f)}
                            className={`px-5 py-2.5 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all ${filter === f ? 'bg-blue-600 text-white shadow-xl shadow-blue-500/20' : 'bg-white border border-slate-100 text-slate-400 hover:border-blue-200 hover:text-blue-600'}`}
                        >
                            {f}
                        </button>
                    ))}
                </div>
            </div>

            {/* Search */}
            <div className="relative max-w-[600px]">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                <Input
                    placeholder="Search by name, email, or subject..."
                    className="bg-white border-slate-200 text-slate-900 pl-11 h-14 rounded-2xl focus:ring-blue-500/30 shadow-sm"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                />
            </div>

            {/* Tutor List */}
            <div className="space-y-4">
                {filteredTutors.length > 0 ? (
                    filteredTutors.map((tutor) => (
                        <Card key={tutor._id || tutor.id} className="bg-white border-slate-100 rounded-[35px] overflow-hidden hover:shadow-2xl hover:shadow-slate-200 transition-all duration-500 border shadow-sm group">
                            <CardContent className="p-0">
                                <div className="p-8 flex flex-col md:flex-row md:items-center justify-between gap-8">
                                    <div className="flex items-center gap-6">
                                        {/* Avatar */}
                                        <div className="w-16 h-16 rounded-[20px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-2xl font-black text-white shadow-xl shadow-blue-500/20 flex-shrink-0">
                                            {tutor.profile?.avatar ? (
                                                <img src={tutor.profile.avatar} alt={tutor.name} className="w-full h-full rounded-[20px] object-cover" />
                                            ) : (
                                                (tutor.name?.[0] || 'T').toUpperCase()
                                            )}
                                        </div>
                                        <div className="space-y-1.5">
                                            <div className="flex items-center gap-3">
                                                <h3 className="text-xl font-bold text-slate-800 leading-none">{tutor.name}</h3>
                                                <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusColor(tutor.tutorStatus)}`}>
                                                    {tutor.tutorStatus || 'unknown'}
                                                </Badge>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-x-5 gap-y-1 text-[11px] font-bold text-slate-400 uppercase tracking-widest">
                                                <span className="flex items-center gap-1.5 normal-case font-medium text-slate-500"><Mail className="w-3.5 h-3.5 text-slate-300" /> {tutor.email}</span>
                                                <span className="flex items-center gap-1.5 text-blue-500"><GraduationCap className="w-3.5 h-3.5" /> {(tutor.subjects || []).join(', ') || 'No subjects listed'}</span>
                                                {tutor.availability?.length > 0 && (
                                                    <span className="flex items-center gap-1.5 text-slate-400"><Calendar className="w-3.5 h-3.5" /> {tutor.availability.join(', ')}</span>
                                                )}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex items-center gap-3 flex-shrink-0">
                                        <Button
                                            onClick={() => openReview(tutor)}
                                            variant="ghost"
                                            className="h-12 px-6 text-slate-500 hover:text-blue-600 hover:bg-blue-50 rounded-2xl text-[10px] font-black uppercase tracking-widest border border-slate-100"
                                        >
                                            <Eye className="w-4 h-4 mr-2" /> View Profile
                                        </Button>
                                        {tutor.tutorStatus === 'pending' && (
                                            <>
                                                <Button
                                                    onClick={() => handleApprove(tutor._id || tutor.id, tutor.name)}
                                                    disabled={isProcessing}
                                                    className="h-12 px-6 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20"
                                                >
                                                    <CheckCircle className="w-4 h-4 mr-1.5" /> Approve
                                                </Button>
                                                <Button
                                                    onClick={() => openRejectDialog(tutor._id || tutor.id, tutor.name)}
                                                    disabled={isProcessing}
                                                    variant="ghost"
                                                    className="h-12 px-6 text-rose-400 hover:text-rose-600 hover:bg-rose-50 border border-rose-100 rounded-2xl font-black text-[10px] uppercase tracking-widest"
                                                >
                                                    <XCircle className="w-4 h-4 mr-1.5" /> Reject
                                                </Button>
                                            </>
                                        )}
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))
                ) : (
                    <div className="text-center py-32 bg-white rounded-[40px] border-2 border-dashed border-slate-100 shadow-sm">
                        <SearchX className="w-16 h-16 text-slate-100 mx-auto mb-6" />
                        <h3 className="text-2xl font-black text-slate-300">No Tutors Found</h3>
                        <p className="text-[10px] text-slate-200 font-black uppercase tracking-[0.25em] mt-3">No tutor records match your current filter or search.</p>
                    </div>
                )}
            </div>

            {/* Full Profile Review Modal */}
            <Dialog open={reviewModalOpen} onOpenChange={setReviewModalOpen}>
                <DialogContent className="sm:max-w-[750px] bg-white rounded-[40px] p-0 overflow-hidden border-0 shadow-2xl max-h-[90vh] overflow-y-auto">
                    {selectedTutor && (
                        <div className="animate-in fade-in zoom-in-95 duration-300">
                            {/* Modal Header */}
                            <div className="p-10 bg-gradient-to-br from-slate-50 to-blue-50/30 border-b border-slate-100 relative overflow-hidden">
                                <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full blur-[80px] pointer-events-none" />
                                <DialogHeader>
                                    <DialogTitle className="sr-only">Tutor Profile: {selectedTutor.name}</DialogTitle>
                                </DialogHeader>
                                <div className="flex flex-col md:flex-row items-center md:items-start gap-6 relative z-10">
                                    {/* Avatar */}
                                    <div className="w-24 h-24 rounded-[28px] bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-4xl font-black text-white shadow-2xl shadow-blue-500/20 flex-shrink-0 overflow-hidden">
                                        {selectedTutor.profile?.avatar ? (
                                            <img src={selectedTutor.profile.avatar} alt={selectedTutor.name} className="w-full h-full object-cover" />
                                        ) : (
                                            (selectedTutor.name?.[0] || 'T').toUpperCase()
                                        )}
                                    </div>
                                    <div className="text-center md:text-left flex-1">
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-3 mb-2">
                                            <h2 className="text-3xl font-black text-slate-800">{selectedTutor.name}</h2>
                                            <Badge className={`border-0 text-[10px] font-black uppercase tracking-widest px-3 py-1 rounded-full ${statusColor(selectedTutor.tutorStatus)}`}>
                                                {selectedTutor.tutorStatus}
                                            </Badge>
                                        </div>
                                        <div className="flex flex-wrap items-center justify-center md:justify-start gap-4 text-sm text-slate-500">
                                            <span className="flex items-center gap-1.5"><Mail className="w-4 h-4 text-blue-400" />{selectedTutor.email}</span>
                                            {selectedTutor.phone && <span className="flex items-center gap-1.5"><Phone className="w-4 h-4 text-blue-400" />{selectedTutor.phone}</span>}
                                        </div>
                                        <p className="text-xs text-slate-400 mt-1.5">
                                            Applied: {selectedTutor.createdAt ? new Date(selectedTutor.createdAt).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Modal Body */}
                            <div className="p-10 space-y-8">
                                {/* Info Grid */}
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                    <div className="p-5 rounded-3xl bg-blue-50/50 border border-blue-100 space-y-1.5">
                                        <p className="text-[9px] font-black text-blue-400 uppercase tracking-widest flex items-center gap-1.5"><BookOpen className="w-3 h-3" />Subjects</p>
                                        <p className="text-slate-800 font-black text-lg">{(selectedTutor.subjects || []).join(', ') || 'Not specified'}</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-emerald-50/50 border border-emerald-100 space-y-1.5">
                                        <p className="text-[9px] font-black text-emerald-500 uppercase tracking-widest flex items-center gap-1.5"><Award className="w-3 h-3" />Degree / Qualification</p>
                                        <p className="text-slate-800 font-black text-lg">{selectedTutor.documents?.degree || 'Not provided'}</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-amber-50/50 border border-amber-100 space-y-1.5">
                                        <p className="text-[9px] font-black text-amber-500 uppercase tracking-widest flex items-center gap-1.5"><Calendar className="w-3 h-3" />Availability</p>
                                        <p className="text-slate-800 font-bold">{(selectedTutor.availability || []).join(', ') || 'Not specified'}</p>
                                    </div>
                                    <div className="p-5 rounded-3xl bg-indigo-50/50 border border-indigo-100 space-y-1.5">
                                        <p className="text-[9px] font-black text-indigo-400 uppercase tracking-widest flex items-center gap-1.5"><Briefcase className="w-3 h-3" />Experience</p>
                                        <p className="text-slate-800 font-bold">{selectedTutor.skills || 'Not specified'}</p>
                                    </div>
                                </div>

                                {/* Bio */}
                                {selectedTutor.profile?.bio && (
                                    <div className="space-y-3">
                                        <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1">Professional Bio</h3>
                                        <p className="text-slate-600 text-sm leading-relaxed bg-slate-50 p-6 rounded-3xl border border-slate-100 italic">
                                            <span className="text-3xl text-slate-200 font-serif leading-none mr-1">"</span>
                                            {selectedTutor.profile.bio}
                                            <span className="text-3xl text-slate-200 font-serif leading-none ml-1">"</span>
                                        </p>
                                    </div>
                                )}

                                {/* Documents */}
                                <div className="space-y-3">
                                    <h3 className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] px-1 flex items-center gap-2">
                                        <FileSearch className="w-4 h-4" /> Uploaded Documents
                                    </h3>
                                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                        {/* Degree Certificate */}
                                        <div className={`p-5 rounded-3xl border-2 flex items-center gap-4 ${selectedTutor.documents?.degree ? 'border-blue-100 bg-blue-50/40' : 'border-slate-100 bg-slate-50/50'}`}>
                                            <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center flex-shrink-0">
                                                <GraduationCap className="w-6 h-6 text-blue-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Degree Certificate</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{selectedTutor.documents?.degree ? (selectedTutor.documents.degree.includes('/') ? selectedTutor.documents.degree.split('/').pop() : selectedTutor.documents.degree) : 'Not uploaded'}</p>
                                            </div>
                                            {selectedTutor.documents?.degree && (
                                                <Button 
                                                    onClick={() => {
                                                        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                                                        const path = selectedTutor.documents.degree;
                                                        if (path.includes('/') || path.includes('.')) {
                                                            const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                                                            console.log("Opening document:", url);
                                                            window.open(url, '_blank');
                                                        } else {
                                                            toast.info(`Qualification: ${path}`, {
                                                                description: "This is a text-based entry provided during registration.",
                                                                duration: 5000
                                                            });
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-blue-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-blue-600 transition-colors shadow-lg shadow-blue-500/20 border-0 h-auto"
                                                >
                                                    <Eye className="w-3 h-3" /> View
                                                </Button>
                                            )}
                                        </div>

                                        {/* CV */}
                                        <div className={`p-5 rounded-3xl border-2 flex items-center gap-4 ${selectedTutor.documents?.cv ? 'border-indigo-100 bg-indigo-50/40' : 'border-slate-100 bg-slate-50/50'}`}>
                                            <div className="w-12 h-12 rounded-2xl bg-indigo-100 flex items-center justify-center flex-shrink-0">
                                                <FileText className="w-6 h-6 text-indigo-500" />
                                            </div>
                                            <div className="flex-1 min-w-0">
                                                <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Resume / CV</p>
                                                <p className="text-sm font-bold text-slate-700 truncate">{selectedTutor.documents?.cv ? (selectedTutor.documents.cv.includes('/') ? selectedTutor.documents.cv.split('/').pop() : selectedTutor.documents.cv) : 'Not uploaded'}</p>
                                            </div>
                                            {selectedTutor.documents?.cv && (
                                                <Button 
                                                    onClick={() => {
                                                        const baseUrl = process.env.NEXT_PUBLIC_API_URL?.replace('/api', '') || 'http://localhost:5001';
                                                        const path = selectedTutor.documents.cv;
                                                        if (path.includes('/') || path.includes('.')) {
                                                            const url = path.startsWith('http') ? path : `${baseUrl}${path.startsWith('/') ? '' : '/'}${path}`;
                                                            window.open(url, '_blank');
                                                        } else {
                                                            toast.info(`Resume Detail: ${path}`, {
                                                                description: "This is a text-based entry provided during registration.",
                                                                duration: 5000
                                                            });
                                                        }
                                                    }}
                                                    className="flex items-center gap-2 px-4 py-2 bg-indigo-500 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-indigo-600 transition-colors shadow-lg shadow-indigo-500/20 border-0 h-auto"
                                                >
                                                    <ExternalLink className="w-3 h-3" /> Open
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Action Buttons */}
                                <div className="flex flex-col sm:flex-row items-center gap-4 pt-4 border-t border-slate-100">
                                    <Button
                                        variant="ghost"
                                        className="w-full sm:w-auto sm:flex-none px-8 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50"
                                        onClick={() => setReviewModalOpen(false)}
                                    >
                                        Close
                                    </Button>

                                    {selectedTutor.tutorStatus === 'pending' && (
                                        <>
                                            <Button
                                                onClick={() => openRejectDialog(selectedTutor._id || selectedTutor.id, selectedTutor.name)}
                                                disabled={isProcessing}
                                                className="w-full sm:flex-1 bg-rose-50 text-rose-500 border-2 border-rose-100 hover:bg-rose-500 hover:text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] transition-all"
                                            >
                                                <XCircle className="w-4 h-4 mr-2" /> Reject Application
                                            </Button>
                                            <Button
                                                onClick={() => handleApprove(selectedTutor._id || selectedTutor.id, selectedTutor.name)}
                                                disabled={isProcessing}
                                                className="w-full sm:flex-1 bg-emerald-500 hover:bg-emerald-400 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-2xl shadow-emerald-500/20 transition-all active:scale-95"
                                            >
                                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <CheckCircle className="w-4 h-4 mr-2" />}
                                                Approve Educator
                                            </Button>
                                        </>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}
                </DialogContent>
            </Dialog>

            {/* Rejection Reason Dialog */}
            <Dialog open={rejectDialogOpen} onOpenChange={setRejectDialogOpen}>
                <DialogContent className="sm:max-w-[480px] bg-white rounded-[32px] p-0 overflow-hidden border-0 shadow-2xl">
                    <div className="p-8 bg-rose-50/50 border-b border-rose-100">
                        <DialogHeader>
                            <DialogTitle className="text-2xl font-black text-slate-800 flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-rose-100 flex items-center justify-center">
                                    <AlertTriangle className="w-5 h-5 text-rose-500" />
                                </div>
                                Reject Application
                            </DialogTitle>
                        </DialogHeader>
                        <p className="text-slate-400 text-sm mt-2">
                            You are about to reject <strong className="text-slate-700">{pendingRejectName}</strong>'s application. A notification email will be sent to them.
                        </p>
                    </div>
                    <div className="p-8 space-y-6">
                        <div className="space-y-2">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Reason for Rejection <span className="text-slate-300">(Optional)</span></Label>
                            <Textarea
                                placeholder="e.g. Insufficient qualifications, incomplete documents, subject not available..."
                                className="bg-slate-50 border-slate-200 rounded-2xl resize-none min-h-[120px] text-slate-700 text-sm focus:ring-rose-500/30"
                                value={rejectReason}
                                onChange={(e) => setRejectReason(e.target.value)}
                            />
                            <p className="text-[10px] text-slate-400">This reason will be included in the rejection email sent to the tutor.</p>
                        </div>
                        <div className="flex gap-3">
                            <Button
                                variant="ghost"
                                className="flex-1 rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] text-slate-400 hover:bg-slate-50"
                                onClick={() => setRejectDialogOpen(false)}
                                disabled={isProcessing}
                            >
                                Cancel
                            </Button>
                            <Button
                                onClick={handleRejectConfirm}
                                disabled={isProcessing}
                                className="flex-1 bg-rose-500 hover:bg-rose-600 text-white rounded-2xl h-14 font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20 transition-all active:scale-95"
                            >
                                {isProcessing ? <Loader2 className="w-5 h-5 animate-spin mr-2" /> : <XCircle className="w-4 h-4 mr-2" />}
                                Confirm Rejection
                            </Button>
                        </div>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
