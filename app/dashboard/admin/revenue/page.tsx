"use client";

import { useSearchParams } from "next/navigation";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { DollarSign, TrendingUp, ArrowUpRight, ArrowDownRight, CreditCard } from "lucide-react";
import { revenueData } from "@/lib/admin-mock-data";
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from "recharts";

export default function AdminRevenuePage() {
    const searchParams = useSearchParams();
    const timeframe = searchParams.get("timeframe") || "year";

    const totalRevenue = revenueData.reduce((acc, curr) => acc + curr.revenue, 0);
    const totalFees = revenueData.reduce((acc, curr) => acc + curr.platformFee, 0);

    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                {[
                    { label: "Gross Revenue", value: `$${totalRevenue.toLocaleString()}`, change: "+12.5%", icon: DollarSign, color: "text-blue-500", bg: "bg-blue-50" },
                    { label: "Platform Commission", value: `$${totalFees.toLocaleString()}`, change: "+8.2%", icon: CreditCard, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Projection (Q4)", value: "$145,000", change: "+15%", icon: TrendingUp, color: "text-indigo-500", bg: "bg-indigo-50" },
                ].map((stat, idx) => (
                    <Card key={idx} className="border-0 shadow-xl rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-xl border-white hover:shadow-2xl transition-all">
                        <CardContent className="p-10">
                            <div className="flex items-start justify-between mb-8">
                                <div className={`p-4 rounded-[22px] ${stat.bg} ${stat.color} shadow-inner`}>
                                    <stat.icon className="w-8 h-8" />
                                </div>
                                <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-50 text-emerald-600">
                                    <ArrowUpRight className="w-4 h-4" />
                                    <span className="text-xs font-black">{stat.change}</span>
                                </div>
                            </div>
                            <p className="text-[11px] font-black uppercase tracking-[0.25em] text-slate-400 mb-2">{stat.label}</p>
                            <p className="text-4xl font-black text-slate-900 tracking-tight">{stat.value}</p>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid lg:grid-cols-2 gap-8">
                <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white">
                    <CardHeader className="p-10">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Revenue Stream</CardTitle>
                        <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Annual performance distribution</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-10">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <AreaChart data={revenueData}>
                                    <defs>
                                        <linearGradient id="colorRev" x1="0" y1="0" x2="0" y2="1">
                                            <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.2} />
                                            <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                                        </linearGradient>
                                    </defs>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} tickFormatter={(v) => `$${v / 1000}k`} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "white", border: "0", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontWeight: 800 }}
                                    />
                                    <Area type="monotone" dataKey="revenue" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorRev)" />
                                </AreaChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>

                <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white">
                    <CardHeader className="p-10">
                        <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">Platform Earnings</CardTitle>
                        <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Net yield from platform commission</CardDescription>
                    </CardHeader>
                    <CardContent className="px-6 pb-10">
                        <div className="h-[400px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <BarChart data={revenueData}>
                                    <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                    <XAxis dataKey="month" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                                    <Tooltip
                                        contentStyle={{ backgroundColor: "white", border: "0", borderRadius: "16px", boxShadow: "0 10px 30px rgba(0,0,0,0.1)", fontWeight: 800 }}
                                        cursor={{ fill: '#f8fafc' }}
                                    />
                                    <Bar dataKey="platformFee" fill="#6366f1" radius={[8, 8, 0, 0]} />
                                </BarChart>
                            </ResponsiveContainer>
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    );
}
