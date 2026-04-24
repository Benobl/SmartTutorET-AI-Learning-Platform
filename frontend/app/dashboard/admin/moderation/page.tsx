"use client";

import { useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, RefreshCw, Eye, CheckCircle2, Flag } from "lucide-react";
import { contentFlags as initialFlags } from "@/lib/admin-mock-data";

export default function AdminModerationPage() {
    const [flags, setFlags] = useState(initialFlags);
    const [isRefreshing, setIsRefreshing] = useState(false);

    const handleRefresh = () => {
        setIsRefreshing(true);
        setTimeout(() => setIsRefreshing(false), 1000);
    };

    const handleResolveFlag = (id: number, type: string) => {
        setFlags((prev: any[]) => prev.map(f => f.id === id ? { ...f, status: 'resolved' as const } : f));
        alert(`Issue [${type}] has been successfully resolved and archived.`);
    };

    const handleInvestigateFlag = (id: number, type: string) => {
        setFlags((prev: any[]) => prev.map(f => f.id === id ? { ...f, status: 'investigating' as const } : f));
        alert(`Investigation protocol initiated for ${type}. Security team notified.`);
    };

    return (
        <div className="space-y-6">
            <Card className="border-0 shadow-xl rounded-[32px] overflow-hidden bg-white/50 backdrop-blur-xl border-white">
                <CardHeader className="bg-slate-50/50 border-b border-slate-100 p-8">
                    <div className="flex items-center justify-between">
                        <div>
                            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
                                <Shield className="w-6 h-6 text-violet-500" />
                                Integrity Center
                            </CardTitle>
                            <CardDescription className="text-slate-500 font-medium font-bold">Monitor platform health and content reports</CardDescription>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 group transition-all active:scale-95 disabled:opacity-70"
                        >
                            <RefreshCw className={`w-4 h-4 mr-3 group-hover:scale-110 transition-transform ${isRefreshing ? 'animate-spin' : ''}`} />
                            {isRefreshing ? "Refreshing..." : "Refresh Queue"}
                        </Button>
                    </div>
                </CardHeader>
                <CardContent className="p-0">
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead>
                                <tr className="border-b border-slate-100 bg-slate-50/30">
                                    {["Incident Type", "Severity", "Reporter", "Timestamp", "Status", "Actions"].map((h) => (
                                        <th key={h} className="text-left py-5 px-8 text-xs font-black text-slate-400 uppercase tracking-[0.2em]">
                                            {h}
                                        </th>
                                    ))}
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-slate-50">
                                {flags.map((flag) => (
                                    <tr key={flag.id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className={`w-2 h-8 rounded-full ${flag.severity === 'high' ? 'bg-rose-500' : flag.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500'}`} />
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight">{flag.type}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{flag.reported} Recent Reports</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={`text-[9px] font-black rounded-lg px-2.5 py-1 uppercase tracking-[0.15em] border-0 ${flag.severity === "high"
                                                    ? "bg-rose-100 text-rose-600"
                                                    : flag.severity === "medium"
                                                        ? "bg-amber-100 text-amber-600"
                                                        : "bg-emerald-100 text-emerald-600"
                                                    }`}
                                            >
                                                {flag.severity}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8 text-xs text-slate-500 font-black uppercase tracking-wider">{flag.reporter}</td>
                                        <td className="py-5 px-8 text-xs text-slate-400 font-bold">{flag.timestamp}</td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={`text-[10px] font-black rounded-lg px-2.5 py-1 uppercase tracking-wider border-0 ${flag.status === "pending"
                                                    ? "bg-blue-50 text-blue-600 animate-pulse"
                                                    : flag.status === "resolved"
                                                        ? "bg-emerald-500 text-white"
                                                        : "bg-violet-100 text-violet-600"
                                                    }`}
                                            >
                                                {flag.status}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex gap-2">
                                                {flag.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleResolveFlag(flag.id, flag.type)}
                                                        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleInvestigateFlag(flag.id, flag.type)}
                                                    className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                                                >
                                                    Investigate
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
