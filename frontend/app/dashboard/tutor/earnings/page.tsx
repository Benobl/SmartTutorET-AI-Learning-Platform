"use client"

import {
    DollarSign, TrendingUp, BarChart3, CreditCard,
    ArrowUpRight, Wallet, ChevronRight, Calendar,
    Sparkles, ArrowRight, Download, PieChart,
    Users, BookOpen, Clock, Loader2
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { useState, useEffect } from "react"
import { paymentApi } from "@/lib/api"
import { format } from "date-fns"

export default function TeacherEarnings() {
    const [earningsData, setEarningsData] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchEarnings = async () => {
            try {
                const res = await paymentApi.getTutorEarnings()
                if (res.success) {
                    setEarningsData(res.data)
                }
            } catch (error) {
                console.error("Error fetching earnings:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchEarnings()
    }, [])

    if (loading) {
        return (
            <div className="flex flex-col h-[calc(100vh-12rem)] items-center justify-center bg-white/50 backdrop-blur-sm rounded-[40px]">
                <Loader2 className="w-8 h-8 text-slate-200 animate-spin" />
                <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Loading Financials</p>
            </div>
        )
    }

    const { totalRevenue = 0, tutorEarnings = 0, transactions = [] } = earningsData || {}
    const pendingBalance = transactions.filter((t: any) => t.status === 'pending').reduce((acc: number, t: any) => acc + (t.tutorAmount || 0), 0)

    return (
        <div className="max-w-7xl mx-auto space-y-16 py-8 animate-in fade-in duration-700">

            {/* Clean Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-8 px-4">
                <div className="space-y-4">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-emerald-400 shadow-[0_0_10px_rgba(52,211,153,0.5)]" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Live Earnings Ledger</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Financial <span className="font-semibold text-slate-900">Overview</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                        A clean analysis of your teaching revenue and distributed payouts.
                    </p>
                </div>

                <div className="flex items-center gap-3">
                    <Button variant="outline" className="h-12 px-6 rounded-full border-slate-100 bg-white text-slate-500 font-bold text-[10px] uppercase tracking-widest hover:bg-slate-50 hover:text-slate-900 transition-all shadow-sm">
                        <Download className="w-3.5 h-3.5 mr-2" /> Export CSV
                    </Button>
                    <Button className="h-12 px-8 rounded-full bg-slate-900 text-white font-bold text-[10px] uppercase tracking-widest shadow-lg shadow-slate-200 hover:bg-sky-600 transition-all">
                        Request Payout
                    </Button>
                </div>
            </div>

            {/* Minimal Stats Bar */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 px-4">
                {[
                    { label: "Total Revenue", value: `ETB ${totalRevenue.toLocaleString()}`, sub: "Gross intake" },
                    { label: "Pending Split", value: `ETB ${pendingBalance.toLocaleString()}`, sub: "Processing" },
                    { label: "Available to Payout", value: `ETB ${tutorEarnings.toLocaleString()}`, sub: "Your net 70%", highlighted: true },
                ].map((stat, i) => (
                    <div key={i} className={cn(
                        "p-10 rounded-[32px] transition-all duration-500",
                        stat.highlighted 
                            ? "bg-white border border-slate-100 shadow-xl shadow-slate-100" 
                            : "bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-lg"
                    )}>
                        <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{stat.label}</p>
                        <h3 className={cn("text-3xl font-semibold tracking-tight", stat.highlighted ? "text-slate-900" : "text-slate-700")}>
                            {stat.value}
                        </h3>
                        <p className="text-[10px] font-medium text-slate-400 mt-1">{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* Split Visualization Section */}
            <div className="mx-4 p-12 rounded-[48px] bg-slate-50 border border-slate-100 relative overflow-hidden group">
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[radial-gradient(circle_at_center,rgba(255,255,255,0.8)_0%,transparent_70%)] opacity-50" />
                <div className="relative z-10 flex flex-col items-center text-center space-y-12">
                    <div className="space-y-2">
                        <h3 className="text-sm font-black text-slate-400 uppercase tracking-[0.3em]">Revenue Distribution Model</h3>
                        <div className="flex items-center justify-center gap-8">
                            <div className="text-center">
                                <p className="text-4xl font-light text-slate-800">70<span className="text-lg font-medium text-slate-400">%</span></p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">Tutor Share</p>
                            </div>
                            <div className="w-px h-10 bg-slate-200" />
                            <div className="text-center">
                                <p className="text-4xl font-light text-slate-800">30<span className="text-lg font-medium text-slate-400">%</span></p>
                                <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest">System Fee</p>
                            </div>
                        </div>
                    </div>

                    {/* Minimal Visual Progress */}
                    <div className="w-full max-w-2xl h-1.5 bg-slate-200 rounded-full overflow-hidden flex shadow-inner">
                        <div className="h-full bg-slate-900 transition-all duration-1000" style={{ width: '70%' }} />
                        <div className="h-full bg-slate-400 transition-all duration-1000" style={{ width: '30%' }} />
                    </div>
                </div>
            </div>

            {/* Activity Table - Modernized */}
            <div className="space-y-8 px-4 pb-20">
                <div className="flex items-center justify-between border-b border-slate-100 pb-6">
                    <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Transaction Ledger</h3>
                    <div className="flex items-center gap-4 text-[10px] font-bold text-slate-400 uppercase tracking-widest">
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-emerald-400" /> Completed</span>
                        <span className="flex items-center gap-1.5"><div className="w-1.5 h-1.5 rounded-full bg-amber-400" /> Pending</span>
                    </div>
                </div>

                <div className="space-y-4">
                    {transactions.length === 0 ? (
                        <div className="py-20 text-center rounded-[32px] border border-dashed border-slate-200">
                            <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">No transaction records found</p>
                        </div>
                    ) : (
                        transactions.map((tx: any) => (
                            <div key={tx._id} className="group p-6 rounded-[28px] bg-white border border-slate-100 hover:border-slate-200 hover:shadow-xl hover:shadow-slate-200/20 transition-all flex flex-col md:flex-row md:items-center justify-between gap-6">
                                <div className="flex items-center gap-6">
                                    <div className="w-14 h-14 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-300 group-hover:bg-sky-700 group-hover:text-white transition-all">
                                        <Calendar className="w-5 h-5" />
                                    </div>
                                    <div className="space-y-1">
                                        <h4 className="text-base font-semibold text-slate-800 tracking-tight">{tx.student?.fullName || tx.student?.name || "Student"}</h4>
                                        <p className="text-[10px] font-medium text-slate-400 uppercase tracking-wider">
                                            {tx.subject?.title || "Course"} <span className="mx-2 text-slate-200">|</span> {format(new Date(tx.createdAt), 'MMM dd, yyyy')}
                                        </p>
                                    </div>
                                </div>

                                <div className="flex items-center justify-between md:justify-end gap-10">
                                    <div className="text-right space-y-1">
                                        <p className="text-lg font-semibold text-slate-900 leading-none">ETB {tx.tutorAmount?.toLocaleString()}</p>
                                        <p className="text-[9px] font-black text-slate-300 uppercase tracking-[0.2em]">Tutor Portion</p>
                                    </div>
                                    <div className={cn(
                                        "px-4 py-1.5 rounded-full text-[9px] font-black uppercase tracking-widest border",
                                        tx.status === 'completed' 
                                            ? "bg-emerald-50 text-emerald-600 border-emerald-100" 
                                            : "bg-amber-50 text-amber-600 border-amber-100"
                                    )}>
                                        {tx.status}
                                    </div>
                                    <button className="hidden md:flex w-10 h-10 rounded-full bg-slate-50 text-slate-300 hover:bg-sky-600 hover:text-white transition-all items-center justify-center shadow-inner">
                                        <ArrowRight className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </div>
        </div>
    )
}

function SettingsIcon({ className }: { className?: string }) {
    return <svg className={className} fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={2}>
        <path strokeLinecap="round" strokeLinejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z" />
        <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
    </svg>
}
