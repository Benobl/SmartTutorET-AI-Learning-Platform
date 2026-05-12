"use client"

import { useState, useEffect } from "react"
import { 
    CheckCircle, XCircle, Clock, Search, Filter, 
    CreditCard, User, BookOpen, ArrowRight,
    AlertCircle, RefreshCw, ChevronRight, ShieldCheck,
    Receipt, TrendingUp, DollarSign
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useToast } from "@/hooks/use-toast"
import { paymentApi } from "@/lib/api"
import { cn } from "@/lib/utils"
import { Skeleton } from "@/components/ui/skeleton"

export default function AdminApprovals() {
    const [pending, setPending] = useState<any[]>([])
    const [isLoading, setIsLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [processingId, setProcessingId] = useState<string | null>(null)
    const { toast } = useToast()

    const loadPending = async () => {
        setIsLoading(true)
        try {
            const response = await paymentApi.getPendingApprovals()
            if (response.success) {
                setPending(response.data)
            }
        } catch (error: any) {
            toast({
                title: "Error",
                description: "Failed to load pending approvals.",
                variant: "destructive"
            })
        } finally {
            setIsLoading(false)
        }
    }

    useEffect(() => {
        loadPending()
    }, [])

    const handleApprove = async (paymentId: string) => {
        setProcessingId(paymentId)
        try {
            const response = await paymentApi.approvePayment(paymentId)
            if (response.success) {
                toast({
                    title: "Enrollment Approved",
                    description: "Student has been enrolled and tutor credited.",
                    className: "bg-emerald-500 text-white"
                })
                setPending(prev => prev.filter(p => p._id !== paymentId))
            }
        } catch (error: any) {
            toast({
                title: "Approval Failed",
                description: error.message || "An error occurred during approval.",
                variant: "destructive"
            })
        } finally {
            setProcessingId(null)
        }
    }

    const filteredPending = pending.filter(p => 
        p.student?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.student?.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.subject?.title?.toLowerCase().includes(searchQuery.toLowerCase())
    )

    return (
        <div className="max-w-7xl mx-auto space-y-10 animate-in fade-in duration-700 pb-20 pt-4">
            
            {/* --- Header Section --- */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-2">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-indigo-600 shadow-[0_0_10px_rgba(79,70,229,0.4)]" />
                        <span className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">Financial Verification</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Payment <span className="font-semibold text-slate-900">Approvals</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium max-w-md">
                        Review and authorize course enrollments. Ensure Chapa receipts match before granting access.
                    </p>
                </div>

                <div className="flex items-center gap-4">
                    <div className="bg-slate-50 border border-slate-100 rounded-[22px] px-6 py-4 flex items-center gap-4 shadow-sm">
                        <div className="w-10 h-10 rounded-xl bg-amber-100 flex items-center justify-center text-amber-600">
                            <Clock className="w-5 h-5" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Pending Verification</p>
                            <p className="text-xl font-black text-slate-900">{pending.length}</p>
                        </div>
                    </div>
                    <Button 
                        onClick={loadPending}
                        variant="outline"
                        className="h-14 w-14 rounded-[22px] border-slate-200 hover:bg-slate-50 transition-all shadow-sm"
                    >
                        <RefreshCw className={cn("w-5 h-5 text-slate-400", isLoading && "animate-spin")} />
                    </Button>
                </div>
            </div>

            {/* --- Filters & Search --- */}
            <div className="relative group mx-2">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-indigo-500 transition-colors" />
                <Input 
                    value={searchQuery}
                    onChange={e => setSearchQuery(e.target.value)}
                    placeholder="Search by student name, email, or course title..."
                    className="bg-white border-slate-200 text-slate-900 pl-14 h-16 rounded-[24px] focus:ring-indigo-500/20 font-bold shadow-sm placeholder:text-slate-400 w-full"
                />
            </div>

            {/* --- Main Content --- */}
            {isLoading ? (
                <div className="space-y-4 px-2">
                    {[1, 2, 3].map(i => (
                        <Skeleton key={i} className="h-32 w-full rounded-[32px]" />
                    ))}
                </div>
            ) : filteredPending.length === 0 ? (
                <div className="py-32 flex flex-col items-center justify-center text-center space-y-6 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-100 mx-2">
                    <div className="w-24 h-24 rounded-full bg-white flex items-center justify-center shadow-xl shadow-slate-200/50">
                        <ShieldCheck className="w-10 h-10 text-slate-200" />
                    </div>
                    <div className="space-y-2">
                        <h3 className="text-xl font-black text-slate-900 uppercase tracking-widest">All Clear!</h3>
                        <p className="text-slate-400 text-sm font-medium max-w-xs mx-auto">
                            There are no payments awaiting approval at the moment. Good job staying on top of it!
                        </p>
                    </div>
                </div>
            ) : (
                <div className="grid grid-cols-1 gap-6 px-2">
                    {filteredPending.map(payment => (
                        <div 
                            key={payment._id}
                            className="group bg-white rounded-[32px] border border-slate-100 p-8 flex flex-col lg:flex-row lg:items-center justify-between gap-8 hover:border-indigo-200 hover:shadow-2xl hover:shadow-indigo-500/5 transition-all duration-500 shadow-sm"
                        >
                            <div className="flex flex-col sm:flex-row gap-8 flex-1">
                                {/* Student Info */}
                                <div className="space-y-4 min-w-[240px]">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-indigo-50 group-hover:text-indigo-500 transition-colors">
                                            <User className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{payment.student?.name}</p>
                                            <p className="text-[11px] font-bold text-slate-400">{payment.student?.email}</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-2 px-4 py-2 bg-slate-50 rounded-xl w-fit border border-slate-100">
                                        <CreditCard className="w-3.5 h-3.5 text-slate-400" />
                                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Ref: {payment.transactionId}</span>
                                    </div>
                                </div>

                                {/* Divider */}
                                <div className="hidden sm:block w-px h-16 bg-slate-100 self-center" />

                                {/* Course Info */}
                                <div className="space-y-4 flex-1">
                                    <div className="flex items-center gap-3">
                                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                                            <BookOpen className="w-6 h-6" />
                                        </div>
                                        <div>
                                            <p className="text-xs font-black text-slate-900 uppercase tracking-widest">{payment.subject?.title}</p>
                                            <p className="text-[11px] font-bold text-indigo-600 uppercase tracking-widest">Premium Curriculum</p>
                                        </div>
                                    </div>
                                    <div className="flex items-center gap-6">
                                        <div className="flex items-center gap-2">
                                            <DollarSign className="w-4 h-4 text-emerald-500" />
                                            <span className="text-lg font-black text-slate-900">{payment.amount} <span className="text-xs text-slate-400">ETB</span></span>
                                        </div>
                                        <div className="flex items-center gap-2 bg-emerald-50 px-3 py-1.5 rounded-xl border border-emerald-100">
                                            <TrendingUp className="w-3.5 h-3.5 text-emerald-600" />
                                            <span className="text-[10px] font-black text-emerald-700 uppercase tracking-widest">Split: 70/30</span>
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Actions */}
                            <div className="flex items-center gap-4 lg:pl-8 border-t lg:border-t-0 lg:border-l border-slate-50 pt-8 lg:pt-0">
                                <Button
                                    onClick={() => handleApprove(payment._id)}
                                    disabled={processingId === payment._id}
                                    className="h-16 px-10 rounded-[22px] bg-slate-900 hover:bg-indigo-600 text-white font-black text-xs uppercase tracking-widest flex items-center gap-3 shadow-xl shadow-slate-900/10 hover:shadow-indigo-500/20 transition-all active:scale-95 flex-1 sm:flex-none"
                                >
                                    {processingId === payment._id ? (
                                        <RefreshCw className="w-5 h-5 animate-spin" />
                                    ) : (
                                        <>
                                            <CheckCircle className="w-5 h-5" />
                                            Authorize Enrollment
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* --- Help Section --- */}
            <div className="mx-2 p-10 rounded-[40px] bg-gradient-to-br from-indigo-500 to-purple-600 text-white flex flex-col lg:flex-row items-center justify-between gap-10 shadow-2xl shadow-indigo-500/20 overflow-hidden relative group">
                <div className="absolute top-0 right-0 w-64 h-64 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2 blur-3xl group-hover:scale-110 transition-transform duration-700" />
                
                <div className="space-y-4 relative z-10">
                    <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                            <ShieldCheck className="w-6 h-6" />
                        </div>
                        <h4 className="text-xl font-black uppercase tracking-widest">Verification Policy</h4>
                    </div>
                    <p className="text-white/80 text-sm font-medium max-w-xl leading-relaxed">
                        By authorizing a payment, you confirm that the transaction has been cleared by Chapa. Enrollment is immediate, and revenue will be distributed: <span className="text-white font-black italic">70% to the Tutor</span> and <span className="text-white font-black italic">30% to the Institutional Treasury</span>.
                    </p>
                </div>

                <div className="flex flex-col gap-4 relative z-10 w-full sm:w-auto">
                    <div className="bg-white/10 backdrop-blur-md p-6 rounded-3xl border border-white/10 flex items-center gap-5">
                        <div className="w-12 h-12 rounded-2xl bg-white flex items-center justify-center text-indigo-600 shadow-xl">
                            <Receipt className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-white/60">Revenue Split</p>
                            <p className="text-lg font-black tracking-tight italic">Automated Distribution</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
