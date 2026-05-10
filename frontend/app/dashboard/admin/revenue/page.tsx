"use client";

import { useState, useEffect, Suspense } from "react";
import { useSearchParams } from "next/navigation";
import { cn } from "@/lib/utils";
import {
    TrendingUp, DollarSign, BookOpen, Users,
    ArrowUpRight, BarChart2, CreditCard, CheckCircle2, Clock
} from "lucide-react";
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip,
    ResponsiveContainer, BarChart, Bar
} from "recharts";
import { adminApi, paymentApi } from "@/lib/api";

function RevenueContent() {
    const searchParams = useSearchParams();
    const range = searchParams.get("range") || "year";

    const [stats, setStats] = useState<any>(null);
    const [earnings, setEarnings] = useState<any>(null);
    const [analytics, setAnalytics] = useState<any[]>([]);
    const [transactions, setTransactions] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchData = async () => {
            try {
                setLoading(true);
                const [statsRes, analyticsRes, earningsRes] = await Promise.allSettled([
                    adminApi.getStats(),
                    adminApi.getAnalytics(range),
                    paymentApi.getAdminEarnings()
                ]);

                if (statsRes.status === "fulfilled") setStats(statsRes.value?.data || statsRes.value);
                if (analyticsRes.status === "fulfilled") setAnalytics(analyticsRes.value?.data || analyticsRes.value || []);
                if (earningsRes.status === "fulfilled") {
                    const data = earningsRes.value?.data || earningsRes.value;
                    setEarnings(data);
                    setTransactions(data?.transactions || []);
                }
            } catch (error) {
                console.error("Revenue data fetch failed", error);
            } finally {
                setLoading(false);
            }
        };
        fetchData();
    }, [range]);

    const totalRevenue = earnings?.totalRevenue || 0;
    const totalFees = earnings?.adminEarnings || 0;
    const totalStudents = stats?.totalStudents || 0;
    const activeCourses = stats?.activeSubjects || 0;

    const statCards = [
        {
            label: "Gross Revenue",
            value: `ETB ${totalRevenue.toLocaleString()}`,
            sub: "Total platform volume",
            icon: DollarSign,
            highlighted: false,
        },
        {
            label: "Platform Commission",
            value: `ETB ${totalFees.toLocaleString()}`,
            sub: "Your net 30% share",
            icon: TrendingUp,
            highlighted: true,
        },
        {
            label: "Active Courses",
            value: activeCourses.toLocaleString(),
            sub: "Live & approved subjects",
            icon: BookOpen,
            highlighted: false,
        },
        {
            label: "Total Students",
            value: totalStudents.toLocaleString(),
            sub: "Registered learners",
            icon: Users,
            highlighted: false,
        },
    ];

    if (loading) {
        return (
            <div className="flex flex-col h-[60vh] items-center justify-center bg-white/50 backdrop-blur-sm rounded-[40px]">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
                <p className="mt-4 text-[10px] font-medium uppercase tracking-[0.2em] text-slate-400">Analyzing Financial Data</p>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto space-y-12 py-4 animate-in fade-in duration-700">

            {/* ── Header ─────────────────────────────────── */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform Economics</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        System <span className="font-semibold text-slate-900">Revenue</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium max-w-sm leading-relaxed">
                        Real-time financial metrics and platform commission analytics.
                    </p>
                </div>
                <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-sky-50 border border-sky-100">
                    <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                    <span className="text-[10px] font-black text-sky-700 uppercase tracking-widest">Live Data</span>
                </div>
            </div>

            {/* ── Stat Cards ─────────────────────────────── */}
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-6 px-4">
                {statCards.map((stat, i) => (
                    <div
                        key={i}
                        className={cn(
                            "p-8 rounded-[28px] transition-all duration-300 group",
                            stat.highlighted
                                ? "bg-slate-900 text-white shadow-2xl shadow-slate-200"
                                : "bg-white border border-slate-100 hover:border-sky-100 hover:shadow-lg hover:shadow-sky-50"
                        )}
                    >
                        <div className="flex items-start justify-between mb-6">
                            <p className={cn(
                                "text-[9px] font-black uppercase tracking-widest",
                                stat.highlighted ? "text-slate-400" : "text-slate-400"
                            )}>{stat.label}</p>
                            <div className={cn(
                                "w-9 h-9 rounded-xl flex items-center justify-center",
                                stat.highlighted ? "bg-white/10" : "bg-slate-50 group-hover:bg-sky-50 transition-colors"
                            )}>
                                <stat.icon className={cn(
                                    "w-4 h-4",
                                    stat.highlighted ? "text-white" : "text-slate-400 group-hover:text-sky-600 transition-colors"
                                )} />
                            </div>
                        </div>
                        <p className={cn(
                            "text-3xl font-bold tracking-tight",
                            stat.highlighted ? "text-white" : "text-slate-900"
                        )}>{stat.value}</p>
                        <p className={cn(
                            "text-[10px] font-medium mt-2",
                            stat.highlighted ? "text-slate-400" : "text-slate-400"
                        )}>{stat.sub}</p>
                    </div>
                ))}
            </div>

            {/* ── Charts ─────────────────────────────────── */}
            <div className="grid lg:grid-cols-2 gap-6 px-4">
                {/* Revenue Stream */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 tracking-tight">Revenue Stream</h3>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1">Monthly ETB volume</p>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={analytics}>
                                <defs>
                                    <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.12} />
                                        <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "white", border: "1px solid #f1f5f9", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", fontWeight: 700, fontSize: "12px" }}
                                />
                                <Area type="monotone" dataKey="revenue" stroke="#0ea5e9" strokeWidth={2.5} fillOpacity={1} fill="url(#colorRev)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Student Volume */}
                <div className="p-8 rounded-[32px] bg-white border border-slate-100 shadow-sm space-y-6">
                    <div>
                        <h3 className="text-base font-semibold text-slate-900 tracking-tight">Student Volume</h3>
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.2em] mt-1">Monthly registrations</p>
                    </div>
                    <div className="h-[260px]">
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={analytics}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#cbd5e1', fontSize: 10, fontWeight: 700 }} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: "white", border: "1px solid #f1f5f9", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.05)", fontWeight: 700, fontSize: "12px" }}
                                    cursor={{ fill: '#f8fafc' }}
                                />
                                <Bar dataKey="students" fill="#e2e8f0" radius={[6, 6, 0, 0]} />
                            </BarChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* ── Transactions Ledger ─────────────────────── */}
            <div className="space-y-6 px-4 pb-24">
                <div className="flex items-center justify-between border-b border-slate-100 pb-5">
                    <div>
                        <h3 className="text-[11px] font-black text-slate-400 uppercase tracking-[0.2em]">Platform Ledger</h3>
                        <p className="text-xs text-slate-400 mt-1">{transactions.length} completed transaction{transactions.length !== 1 ? "s" : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 text-[10px] font-black text-slate-400 uppercase tracking-widest">
                        <CreditCard className="w-3.5 h-3.5" />
                        All Payments
                    </div>
                </div>

                {transactions.length === 0 ? (
                    <div className="py-20 text-center rounded-[28px] border border-dashed border-slate-200 bg-slate-50/20">
                        <BarChart2 className="w-8 h-8 text-slate-200 mx-auto mb-4" />
                        <p className="text-[10px] font-bold text-slate-300 uppercase tracking-[0.3em]">No transactions yet</p>
                    </div>
                ) : (
                    <div className="space-y-3">
                        {transactions.map((tx: any, i: number) => {
                            const tutorShare = tx.tutorAmount || tx.amount * 0.7;
                            const adminShare = tx.adminAmount || tx.amount * 0.3;
                            const date = tx.createdAt ? new Date(tx.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" }) : "—";
                            return (
                                <div
                                    key={tx._id || i}
                                    className="flex flex-col sm:flex-row sm:items-center justify-between p-6 rounded-[20px] bg-white border border-slate-100 hover:border-sky-100 hover:shadow-md transition-all duration-200 gap-4"
                                >
                                    {/* Left: student + subject */}
                                    <div className="flex items-center gap-4">
                                        <div className="w-10 h-10 rounded-2xl bg-slate-50 flex items-center justify-center shrink-0">
                                            <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                                        </div>
                                        <div>
                                            <p className="text-sm font-bold text-slate-900">
                                                {tx.student?.name || "Student"}
                                            </p>
                                            <p className="text-[10px] font-medium text-slate-400">
                                                {tx.subject?.title || "Course"} · {date}
                                            </p>
                                        </div>
                                    </div>

                                    {/* Right: amounts */}
                                    <div className="flex items-center gap-6 text-right">
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Total</p>
                                            <p className="text-sm font-bold text-slate-900">ETB {tx.amount?.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest">Tutor (70%)</p>
                                            <p className="text-sm font-semibold text-slate-600">ETB {tutorShare.toLocaleString()}</p>
                                        </div>
                                        <div>
                                            <p className="text-[9px] font-black text-sky-500 uppercase tracking-widest">Admin (30%)</p>
                                            <p className="text-sm font-bold text-sky-600">ETB {adminShare.toLocaleString()}</p>
                                        </div>
                                        <div className="px-3 py-1.5 rounded-xl bg-emerald-50 border border-emerald-100">
                                            <p className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Completed</p>
                                        </div>
                                    </div>
                                </div>
                            );
                        })}
                    </div>
                )}

                {/* Summary Footer */}
                {transactions.length > 0 && (
                    <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between p-6 rounded-[20px] bg-slate-900 text-white mt-4">
                        <div>
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Total Commission Earned</p>
                            <p className="text-2xl font-bold">ETB {totalFees.toLocaleString()}</p>
                        </div>
                        <div className="text-right mt-4 sm:mt-0">
                            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-1">Platform Gross Revenue</p>
                            <p className="text-2xl font-bold">ETB {totalRevenue.toLocaleString()}</p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}

export default function AdminRevenuePage() {
    return (
        <Suspense fallback={
            <div className="flex h-[60vh] items-center justify-center">
                <div className="w-8 h-8 border-2 border-slate-200 border-t-sky-600 rounded-full animate-spin" />
            </div>
        }>
            <RevenueContent />
        </Suspense>
    );
}
