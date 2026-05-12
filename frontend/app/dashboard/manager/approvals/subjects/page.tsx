"use client"

import { useState, useEffect } from "react"
import { 
    BookOpen, 
    CheckCircle, 
    XCircle, 
    Clock, 
    User, 
    Layers, 
    Search,
    Filter,
    ShieldCheck,
    CreditCard,
    Sparkles,
    Eye,
    ChevronRight,
    ArrowLeft
} from "lucide-react"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { 
    Dialog, 
    DialogContent, 
    DialogHeader, 
    DialogTitle, 
    DialogFooter 
} from "@/components/ui/dialog"
import { toast } from "sonner"
import { getPendingSubjects, approveSubject, rejectSubject } from "@/lib/manager-utils"
import Link from "next/link"

export default function SubjectApprovals() {
    const [subjects, setSubjects] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedSubject, setSelectedSubject] = useState<any>(null)
    const [processingId, setProcessingId] = useState<string | null>(null)
    const [isRejectDialogOpen, setIsRejectDialogOpen] = useState(false)
    const [rejectionFeedback, setRejectionFeedback] = useState("")

    const fetchData = async () => {
        setLoading(true)
        const data = await getPendingSubjects()
        setSubjects(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const handleApprove = async (id: string) => {
        setProcessingId(id)
        const success = await approveSubject(id)
        if (success) {
            toast.success("Subject approved and published.")
            fetchData()
            setSelectedSubject(null)
        } else {
            toast.error("Failed to approve subject.")
        }
        setProcessingId(null)
    }

    const handleReject = async () => {
        if (!selectedSubject) return
        setProcessingId(selectedSubject._id)
        const success = await rejectSubject(selectedSubject._id, rejectionFeedback)
        if (success) {
            toast.error("Subject application rejected.")
            fetchData()
            setSelectedSubject(null)
            setIsRejectDialogOpen(false)
            setRejectionFeedback("")
        } else {
            toast.error("Failed to reject subject.")
        }
        setProcessingId(null)
    }

    const filteredSubjects = subjects.filter(s => 
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.tutor?.name.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/manager" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <Badge className="bg-amber-100 text-amber-700 hover:bg-amber-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Curriculum Review
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">Subject Approvals</h1>
                    <p className="text-slate-500 font-medium">Vet and approve new courses submitted by tutors</p>
                </div>

                <div className="flex items-center gap-3">
                    <div className="relative group">
                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                        <Input 
                            placeholder="Search subjects or tutors..." 
                            className="pl-10 w-full md:w-[300px] rounded-2xl border-slate-200 focus:border-blue-500 focus:ring-blue-500/10 transition-all bg-white shadow-sm"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* List Area */}
                <div className={`${selectedSubject ? 'lg:col-span-5' : 'lg:col-span-12'} space-y-4 transition-all duration-500`}>
                    {loading ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-slate-100 border-dashed">
                            <div className="w-12 h-12 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-4" />
                            <p className="text-slate-400 font-bold text-sm uppercase tracking-widest">Synchronizing Curriculum...</p>
                        </div>
                    ) : filteredSubjects.length === 0 ? (
                        <div className="flex flex-col items-center justify-center py-20 bg-white rounded-[32px] border-2 border-slate-100 border-dashed text-center px-6">
                            <div className="w-20 h-20 bg-slate-50 rounded-full flex items-center justify-center mb-6 ring-8 ring-slate-50/50">
                                <ShieldCheck className="w-10 h-10 text-slate-300" />
                            </div>
                            <h3 className="text-xl font-black text-slate-800 mb-2">Queue is Empty</h3>
                            <p className="text-slate-500 max-w-xs font-medium">All subjects have been reviewed. No pending items at the moment.</p>
                        </div>
                    ) : (
                        <div className="grid grid-cols-1 gap-4">
                            {filteredSubjects.map((subject) => (
                                <Card 
                                    key={subject._id}
                                    onClick={() => setSelectedSubject(subject)}
                                    className={`group cursor-pointer rounded-[32px] border-2 transition-all duration-300 overflow-hidden ${selectedSubject?._id === subject._id ? 'border-blue-500 shadow-xl shadow-blue-500/10 bg-blue-50/10' : 'border-slate-100 hover:border-blue-200 hover:shadow-lg bg-white'}`}
                                >
                                    <CardContent className="p-6">
                                        <div className="flex items-start justify-between gap-4">
                                            <div className="flex gap-4">
                                                <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-colors ${selectedSubject?._id === subject._id ? 'bg-blue-500 text-white' : 'bg-slate-100 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500'}`}>
                                                    <BookOpen className="w-7 h-7" />
                                                </div>
                                                <div className="min-w-0">
                                                    <div className="flex items-center gap-2 mb-1">
                                                        <Badge variant="outline" className="text-[10px] uppercase font-black border-slate-200 text-slate-500 py-0 px-2">
                                                            Grade {subject.grade || 'N/A'}
                                                        </Badge>
                                                        {subject.isPremium && (
                                                            <Badge className="bg-indigo-100 text-indigo-700 border-none text-[9px] uppercase font-black px-2">
                                                                Premium
                                                            </Badge>
                                                        )}
                                                    </div>
                                                    <h3 className="font-black text-slate-800 truncate text-lg group-hover:text-blue-600 transition-colors">{subject.title}</h3>
                                                    <div className="flex items-center gap-2 text-slate-400 mt-1">
                                                        <User className="w-3.5 h-3.5" />
                                                        <span className="text-xs font-bold">{subject.tutor?.name || 'Unknown Tutor'}</span>
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-2">
                                                <div className="flex items-center gap-1.5 text-amber-500 bg-amber-50 px-3 py-1 rounded-full border border-amber-100 shadow-sm shadow-amber-500/5">
                                                    <Clock className="w-3.5 h-3.5" />
                                                    <span className="text-[10px] font-black uppercase tracking-wider">Pending</span>
                                                </div>
                                                <ChevronRight className={`w-5 h-5 text-slate-300 transition-transform ${selectedSubject?._id === subject._id ? 'translate-x-1 text-blue-500' : ''}`} />
                                            </div>
                                        </div>
                                    </CardContent>
                                </Card>
                            ))}
                        </div>
                    )}
                </div>

                {/* Detail View Area */}
                {selectedSubject && (
                    <div className="lg:col-span-7 animate-in fade-in slide-in-from-right-8 duration-500">
                        <div className="bg-white rounded-[40px] border-2 border-slate-100 shadow-2xl shadow-slate-200/50 sticky top-8 overflow-hidden">
                            {/* Header Gradient */}
                            <div className="h-3 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500" />
                            
                            <div className="p-8">
                                <div className="flex justify-between items-start mb-8">
                                    <div className="space-y-1">
                                        <h2 className="text-2xl font-black text-slate-900 leading-tight">{selectedSubject.title}</h2>
                                        <div className="flex items-center gap-3">
                                            <div className="flex items-center gap-1.5 text-slate-500 font-bold text-sm">
                                                <User className="w-4 h-4" />
                                                <span>{selectedSubject.tutor?.name}</span>
                                            </div>
                                            <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                                            <div className="text-slate-400 font-bold text-sm">{selectedSubject.tutor?.email}</div>
                                        </div>
                                    </div>
                                    <button 
                                        onClick={() => setSelectedSubject(null)}
                                        className="p-2 hover:bg-slate-50 rounded-2xl transition-colors text-slate-400"
                                    >
                                        <XCircle className="w-6 h-6" />
                                    </button>
                                </div>

                                {/* Content Grid */}
                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-8">
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Grade</p>
                                        <span className="text-sm font-black text-slate-700">Grade {selectedSubject.grade}</span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Semester</p>
                                        <span className="text-sm font-black text-slate-700">{selectedSubject.semester || 'Full Year'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Stream</p>
                                        <span className="text-sm font-black text-slate-700">{selectedSubject.stream || 'Common'}</span>
                                    </div>
                                    <div className="bg-slate-50 p-4 rounded-3xl border border-slate-100">
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">Access</p>
                                        <span className={`text-sm font-black ${selectedSubject.isPremium ? 'text-indigo-600' : 'text-emerald-600'}`}>
                                            {selectedSubject.isPremium ? 'Premium' : 'Free'}
                                        </span>
                                    </div>
                                </div>

                                <div className="space-y-6">
                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Description</p>
                                        <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100 text-slate-600 font-medium leading-relaxed italic">
                                            "{selectedSubject.description || 'No description provided.'}"
                                        </div>
                                    </div>

                                    {/* Roadmap / Outline */}
                                    {selectedSubject.roadmap && (
                                        <div>
                                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Course Outline (Roadmap)</p>
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                                    <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-blue-500" />
                                                        Semester 1
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {selectedSubject.roadmap.semester1?.chapters?.length > 0 ? (
                                                            selectedSubject.roadmap.semester1.chapters.map((ch: string, i: number) => (
                                                                <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-3">
                                                                    <span className="text-slate-300 mt-0.5">0{i+1}</span>
                                                                    <span>{ch}</span>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="text-xs text-slate-400 italic">No chapters defined</li>
                                                        )}
                                                    </ul>
                                                </div>
                                                <div className="bg-slate-50 p-6 rounded-[32px] border border-slate-100">
                                                    <p className="text-[10px] font-black text-indigo-500 uppercase tracking-widest mb-4 flex items-center gap-2">
                                                        <span className="w-1.5 h-1.5 rounded-full bg-indigo-500" />
                                                        Semester 2
                                                    </p>
                                                    <ul className="space-y-2">
                                                        {selectedSubject.roadmap.semester2?.chapters?.length > 0 ? (
                                                            selectedSubject.roadmap.semester2.chapters.map((ch: string, i: number) => (
                                                                <li key={i} className="text-xs font-bold text-slate-600 flex items-start gap-3">
                                                                    <span className="text-slate-300 mt-0.5">0{i+1}</span>
                                                                    <span>{ch}</span>
                                                                </li>
                                                            ))
                                                        ) : (
                                                            <li className="text-xs text-slate-400 italic">No chapters defined</li>
                                                        )}
                                                    </ul>
                                                </div>
                                            </div>
                                        </div>
                                    )}

                                    <div>
                                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-3">Vetting Actions</p>
                                        <div className="flex flex-col sm:flex-row gap-4">
                                            <Button 
                                                disabled={processingId === selectedSubject._id}
                                                onClick={() => handleApprove(selectedSubject._id)}
                                                className="flex-1 h-16 rounded-2xl bg-emerald-500 hover:bg-emerald-600 text-white font-black uppercase tracking-widest text-xs shadow-xl shadow-emerald-500/20 border-0 group"
                                            >
                                                {processingId === selectedSubject._id ? (
                                                    <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                ) : (
                                                    <>
                                                        <CheckCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                                        Approve Course
                                                    </>
                                                )}
                                            </Button>
                                            <Button 
                                                variant="outline"
                                                disabled={processingId === selectedSubject._id}
                                                onClick={() => setIsRejectDialogOpen(true)}
                                                className="flex-1 h-16 rounded-2xl border-2 border-rose-100 hover:bg-rose-50 text-rose-500 font-black uppercase tracking-widest text-xs group"
                                            >
                                                <XCircle className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                                                Reject Entry
                                            </Button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Rejection Dialog */}
            <Dialog open={isRejectDialogOpen} onOpenChange={setIsRejectDialogOpen}>
                <DialogContent className="sm:max-w-[500px] rounded-[40px] border-slate-100 bg-white p-0 overflow-hidden shadow-2xl">
                    <div className="p-10 border-b border-slate-50">
                        <DialogHeader>
                            <DialogTitle className="text-xl font-black text-slate-900 uppercase italic">Reject <span className="text-rose-500">Framework</span></DialogTitle>
                            <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Provide feedback for the tutor</p>
                        </DialogHeader>
                    </div>
                    <div className="p-10 space-y-6">
                        <div className="space-y-3">
                            <label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Improvement Feedback</label>
                            <Textarea 
                                placeholder="Explain why this course framework was rejected and what needs to be improved..."
                                className="min-h-[150px] rounded-3xl bg-slate-50 border-transparent focus:bg-white focus:border-rose-100 transition-all font-medium text-sm p-6"
                                value={rejectionFeedback}
                                onChange={(e) => setRejectionFeedback(e.target.value)}
                            />
                        </div>
                    </div>
                    <div className="p-10 pt-4 flex gap-4">
                        <Button 
                            variant="outline" 
                            onClick={() => setIsRejectDialogOpen(false)}
                            className="flex-1 h-14 rounded-2xl border-slate-200 font-black uppercase tracking-widest text-[10px]"
                        >
                            Cancel
                        </Button>
                        <Button 
                            disabled={!rejectionFeedback.trim() || processingId === selectedSubject?._id}
                            onClick={handleReject}
                            className="flex-1 h-14 rounded-2xl bg-rose-500 hover:bg-rose-600 text-white font-black uppercase tracking-widest text-[10px] shadow-xl shadow-rose-500/20"
                        >
                            {processingId === selectedSubject?._id ? (
                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                            ) : (
                                "Confirm Rejection"
                            )}
                        </Button>
                    </div>
                </DialogContent>
            </Dialog>
        </div>
    )
}
