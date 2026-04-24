"use client"

import {
    DollarSign, TrendingUp, BarChart3, CreditCard,
    ArrowUpRight, Wallet, ChevronRight, Calendar,
    Sparkles, ArrowRight, Download, PieChart,
    Users, BookOpen, Clock
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

const MOCK_TRANSACTIONS = [
    { id: "t1", date: "Oct 24, 2026", student: "Biniyam Solomon", course: "Physics G12", amount: "$45.00", status: "completed" },
    { id: "t2", date: "Oct 22, 2026", student: "Helena Tadesse", course: "Math G11", amount: "$30.00", status: "completed" },
    { id: "t3", date: "Oct 20, 2026", student: "Dagmawi Girma", course: "Biology G10", amount: "$25.00", status: "pending" },
]

export default function TeacherEarnings() {
    return (
        <div className="space-y-12 animate-in fade-in slide-in-from-bottom-6 duration-1000">

            {/* Header Section */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-10">
                <div className="space-y-6">
                    <div>
                        <div className="flex items-center gap-2 mb-3">
                            <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Financial Hub</span>
                            <Sparkles className="w-4 h-4 text-sky-400 fill-sky-400" />
                        </div>
                        <h1 className="text-4xl lg:text-5xl font-black text-slate-900 tracking-tight leading-none mb-3 uppercase">
                            Revenue & <span className='text-sky-600'>Payouts</span>
                        </h1>
                        <p className="text-slate-500 text-sm font-medium max-w-md">
                            Track your teaching earnings, manage payout schedules, and analyze your most profitable courses.
                        </p>
                    </div>

                    <div className="flex items-center gap-4">
                        <Button className="h-14 px-8 rounded-2xl bg-slate-900 text-white font-black text-[10px] uppercase tracking-widest flex items-center gap-2.5 shadow-xl hover:scale-105 transition-transform">
                            <ArrowUpRight className="w-4 h-4 text-sky-400" /> Request Payout
                        </Button>
                        <Button variant="outline" className="h-14 px-8 rounded-2xl border-slate-100 bg-white text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 hover:bg-sky-50/50 transition-all">
                            <Download className="w-4 h-4 mr-2" /> Export Statement
                        </Button>
                    </div>
                </div>

                <div className="flex flex-wrap items-center gap-4">
                    <div className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-xl shadow-slate-200/20 flex flex-col justify-between min-w-[240px] min-h-[160px]">
                        <div className="flex items-center justify-between mb-4">
                            <div className="w-12 h-12 rounded-2xl bg-sky-50 text-sky-500 flex items-center justify-center border border-sky-100">
                                <Wallet className="w-6 h-6" />
                            </div>
                            <span className="text-[10px] font-black text-emerald-500 bg-emerald-50 px-2 py-1 rounded-full">+12.4%</span>
                        </div>
                        <div>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1.5">Available Balance</p>
                            <h2 className="text-3xl font-black text-slate-900">$1,240.00</h2>
                        </div>
                    </div>
                </div>
            </div>

            {/* Main Financial Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-10">

                {/* Left Column: Charts & Overview */}
                <div className="xl:col-span-2 space-y-10">

                    {/* Performance Stats Cards */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        {[
                            { label: "Total Revenue", value: "$4,520", icon: DollarSign, color: "sky" },
                            { label: "Pending", value: "$320", icon: Clock, color: "slate" },
                            { label: "Paid Out", value: "$3,200", icon: CreditCard, color: "indigo" },
                        ].map((stat, i) => (
                            <div key={i} className="p-6 rounded-[32px] bg-white border border-slate-100 shadow-sm flex items-center gap-5 group hover:border-sky-100 transition-all">
                                <div className={cn("w-12 h-12 rounded-xl flex items-center justify-center border transition-all", `bg-${stat.color}-50 text-${stat.color}-500 border-${stat.color}-100 group-hover:bg-${stat.color}-500 group-hover:text-white`)}>
                                    <stat.icon className="w-6 h-6" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest leading-none mb-1">{stat.label}</p>
                                    <h4 className="text-lg font-black text-slate-900">{stat.value}</h4>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Revenue Forecast / Chart Area */}
                    <div className="p-12 rounded-[56px] bg-sky-600 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-white/10 blur-3xl rounded-full -mr-32 -mt-32 transition-transform duration-[4000ms] group-hover:scale-110" />
                        <div className="relative z-10 space-y-10">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-2xl font-black uppercase italic tracking-tight">Earnings <span className="text-sky-200">Forecast</span></h3>
                                    <p className="text-xs text-sky-100 font-bold uppercase tracking-widest mt-1">October 2026 Prediction</p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-black text-white leading-none">$2,100</p>
                                    <p className="text-[9px] font-black uppercase tracking-widest text-sky-200 mt-1">Est. End of Month</p>
                                </div>
                            </div>

                            {/* Mock Chart Visualization */}
                            <div className="flex items-end justify-between h-48 gap-4 px-4">
                                {[35, 65, 45, 80, 55, 90, 70, 85, 60, 95].map((height, i) => (
                                    <div key={i} className="flex-1 flex flex-col items-center gap-3">
                                        <div
                                            className="w-full bg-white/20 hover:bg-white/40 transition-all duration-700 rounded-t-xl"
                                            style={{ height: `${height}%` }}
                                        />
                                        <span className="text-[8px] font-black text-sky-200 uppercase">Oct {i + 15}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* Transaction History */}
                    <div className="space-y-6">
                        <div className="flex items-center justify-between">
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-[0.2em]">Recent Activity</h3>
                            <button className="text-[10px] font-black text-sky-500 uppercase tracking-widest flex items-center gap-1.5 group">
                                Full History <ChevronRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                            </button>
                        </div>
                        <div className="rounded-[40px] bg-white border border-slate-100 overflow-hidden shadow-xl shadow-slate-200/5">
                            {MOCK_TRANSACTIONS.map((tx, idx) => (
                                <div key={tx.id} className={cn("p-6 flex items-center justify-between hover:bg-slate-50 transition-all", idx !== MOCK_TRANSACTIONS.length - 1 && "border-b border-slate-50")}>
                                    <div className="flex items-center gap-6">
                                        <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center border border-slate-100">
                                            <Calendar className="w-5 h-5 text-slate-400" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-black text-slate-900 leading-none mb-1">{tx.student}</p>
                                            <p className="text-[10px] font-bold text-slate-400">{tx.course} • {tx.date}</p>
                                        </div>
                                    </div>
                                    <div className="text-right flex items-center gap-6">
                                        <div>
                                            <p className="text-[13px] font-black text-slate-900">{tx.amount}</p>
                                            <p className={cn("text-[9px] font-black uppercase tracking-widest", tx.status === 'completed' ? "text-emerald-500" : "text-amber-500 text-pulse")}>{tx.status}</p>
                                        </div>
                                        <button className="w-10 h-10 rounded-xl bg-slate-50 text-slate-300 hover:text-sky-500 hover:bg-white hover:shadow-md transition-all flex items-center justify-center">
                                            <ArrowRight className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Right Column: Payouts & Settings */}
                <div className="space-y-10">

                    {/* Payout Method Card */}
                    <div className="p-10 rounded-[48px] bg-slate-900 text-white relative overflow-hidden group">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/20 blur-2xl rounded-full -mr-16 -mt-16" />
                        <div className="relative z-10 space-y-8">
                            <div className="flex items-center justify-between">
                                <h3 className="text-lg font-black uppercase italic tracking-tight">Payout Method</h3>
                                <div className="p-2 rounded-lg bg-white/5 border border-white/10"><SettingsIcon className="w-4 h-4 text-slate-400" /></div>
                            </div>
                            <div className="p-6 rounded-3xl bg-white/5 border border-white/10 space-y-4">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-xl bg-sky-500 flex items-center justify-center text-white"><ArrowUpRight className="w-5 h-5" /></div>
                                        <div>
                                            <p className="text-[11px] font-black text-white leading-none mb-1">CBE Birr Account</p>
                                            <p className="text-[9px] font-medium text-slate-500 tracking-wider">**** 8291</p>
                                        </div>
                                    </div>
                                    <div className="w-2 h-2 rounded-full bg-emerald-500" />
                                </div>
                            </div>
                            <Button className="w-full h-14 rounded-2xl bg-white text-slate-900 font-black text-[10px] uppercase tracking-widest shadow-xl hover:scale-105 transition-all">
                                Change Bank Details
                            </Button>
                        </div>
                    </div>

                    {/* Analytics Teaser */}
                    <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-xl shadow-slate-200/5 space-y-8">
                        <div>
                            <h3 className="text-xs font-black text-slate-400 uppercase tracking-widest mb-2">Subject Performance</h3>
                            <p className="text-[10px] font-bold text-slate-500">Revenue contribution per grade level</p>
                        </div>
                        <div className="space-y-5">
                            {[
                                { label: "Grade 12 Physics", percent: 45, color: "bg-sky-500" },
                                { label: "Grade 11 Math", percent: 35, color: "bg-indigo-500" },
                                { label: "Grade 10 Biology", percent: 20, color: "bg-rose-500" },
                            ].map((item, i) => (
                                <div key={i} className="space-y-2">
                                    <div className="flex justify-between text-[10px] font-black uppercase">
                                        <span className="text-slate-900">{item.label}</span>
                                        <span className="text-slate-400">{item.percent}%</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-slate-100 rounded-full overflow-hidden">
                                        <div className={cn("h-full rounded-full", item.color)} style={{ width: `${item.percent}%` }} />
                                    </div>
                                </div>
                            ))}
                        </div>
                        <Button variant="outline" className="w-full h-12 rounded-xl border-slate-100 text-slate-400 font-black text-[10px] uppercase tracking-widest hover:text-sky-600 transition-all">
                            Detailed Breakdown <ArrowRight className="w-3.5 h-3.5 ml-2" />
                        </Button>
                    </div>

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
