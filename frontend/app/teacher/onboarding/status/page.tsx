"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
    Clock, CheckCircle2, XCircle, ShieldCheck,
    ArrowRight, MessageSquare, Mail, GraduationCap,
    Sparkles, RefreshCw, FileText
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

export default function ApplicationStatus() {
    const router = useRouter()
    const [status, setStatus] = useState<'pending' | 'approved' | 'rejected'>('approved') // Toggle for demo

    return (
        <div className="min-h-screen bg-slate-50 p-6 lg:p-12 flex items-center justify-center relative overflow-hidden">
            {/* Background Effects */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/30 rounded-full blur-3xl -mr-96 -mt-96" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50/20 rounded-full blur-3xl -ml-64 -mb-64" />

            <div className="w-full max-w-2xl bg-white rounded-[48px] shadow-2xl shadow-indigo-500/5 border border-slate-100 p-10 lg:p-16 relative z-10 text-center">

                {/* Icon Display */}
                <div className="mb-10 flex justify-center">
                    {status === 'pending' ? (
                        <div className="w-24 h-24 rounded-[32px] bg-indigo-50 border border-indigo-100 flex items-center justify-center animate-pulse">
                            <Clock className="w-10 h-10 text-indigo-500" />
                        </div>
                    ) : status === 'approved' ? (
                        <div className="relative">
                            <div className="w-24 h-24 rounded-[32px] bg-emerald-50 border border-emerald-100 flex items-center justify-center animate-bounce">
                                <CheckCircle2 className="w-10 h-10 text-emerald-500" />
                            </div>
                            <div className="absolute -top-2 -right-2 w-8 h-8 rounded-full bg-white border border-emerald-100 flex items-center justify-center shadow-lg">
                                <Sparkles className="w-4 h-4 text-emerald-500" />
                            </div>
                        </div>
                    ) : (
                        <div className="w-24 h-24 rounded-[32px] bg-rose-50 border border-rose-100 flex items-center justify-center">
                            <XCircle className="w-10 h-10 text-rose-500" />
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="space-y-6 mb-12">
                    <h1 className="text-4xl font-black text-slate-900 uppercase tracking-tight">
                        {status === 'pending' && "Reviewing Your Excellence"}
                        {status === 'approved' && "Welcome, Academic Leader"}
                        {status === 'rejected' && "Application Outcome"}
                    </h1>

                    <p className="text-slate-500 font-medium leading-relaxed max-w-sm mx-auto">
                        {status === 'pending' && "Our academic board is reviewing your qualification exam results and verification documents. This usually takes 24-48 hours."}
                        {status === 'approved' && "Congratulations! You have been verified as a SmartTutorET Elite Educator. Your dashboard is now ready for exploration."}
                        {status === 'rejected' && "After careful review, we cannot proceed with your application at this time. Please see the comments below for more details."}
                    </p>
                </div>

                {/* Status Specific Actions */}
                <div className="space-y-4">
                    {status === 'approved' ? (
                        <Button
                            onClick={() => router.push("/dashboard/teacher")}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 group"
                        >
                            Enter Educator Dashboard
                            <ArrowRight className="w-4 h-4 ml-3 group-hover:translate-x-1.5 transition-transform" />
                        </Button>
                    ) : status === 'pending' ? (
                        <div className="flex gap-4">
                            <Button
                                variant="outline"
                                className="flex-1 h-16 rounded-2xl border-slate-100 font-black uppercase tracking-widest text-[10px] text-slate-500"
                            >
                                <Mail className="w-4 h-4 mr-2" /> Contact Admin
                            </Button>
                            <Button
                                onClick={() => setStatus('approved')} // DEMO TOGGLE
                                className="flex-1 h-16 rounded-2xl bg-slate-900 text-white font-black uppercase tracking-widest text-[10px]"
                            >
                                <RefreshCw className="w-4 h-4 mr-2" /> Refresh Status
                            </Button>
                        </div>
                    ) : (
                        <Button
                            variant="outline"
                            className="w-full h-16 rounded-2xl border-rose-100 flex items-center justify-center gap-3 font-black uppercase tracking-widest text-xs text-rose-500 bg-rose-50/30"
                        >
                            <MessageSquare className="w-4 h-4" /> View Feedback
                        </Button>
                    )}
                </div>

                {/* Verification Checkpoints */}
                <div className="mt-16 pt-10 border-t border-slate-50 grid grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="flex flex-col items-center gap-2 opacity-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Registration</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-100">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500" />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Exam Passed</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <ShieldCheck className={cn("w-5 h-5", status === 'approved' ? "text-emerald-500" : "text-slate-400")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Admin Check</span>
                    </div>
                    <div className="flex flex-col items-center gap-2 opacity-50">
                        <GraduationCap className={cn("w-5 h-5", status === 'approved' ? "text-emerald-500" : "text-slate-400")} />
                        <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Final Approval</span>
                    </div>
                </div>
            </div>
        </div>
    )
}
