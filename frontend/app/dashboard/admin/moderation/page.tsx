"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Shield, AlertCircle, RefreshCw, Eye, CheckCircle2, Flag, X } from "lucide-react";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

export default function AdminModerationPage() {
    const [flags, setFlags] = useState<any[]>([]);
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [loading, setLoading] = useState(true);

    const fetchData = async () => {
        try {
            setLoading(true);
            const res = await adminApi.getFlags();
            setFlags(res.data);
        } catch (error) {
            console.error("Failed to fetch flags", error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchData();
    }, []);

    const handleRefresh = async () => {
        setIsRefreshing(true);
        await fetchData();
        setIsRefreshing(false);
        toast({ title: "Queue Refreshed", description: "Latest incident reports synchronized." });
    };

    const handleResolveFlag = async (id: string, type: string) => {
        try {
            await adminApi.resolveFlag(id);
            toast({ title: "Incident Resolved", description: `Issue [${type}] has been archived.` });
            fetchData();
        } catch (error: any) {
            toast({ title: "Error", description: error.message, variant: "destructive" });
        }
    };

    const handleInvestigateFlag = (id: string, type: string) => {
        toast({ title: "Investigation Initialized", description: `Security protocol active for ${type}.` });
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
                            <CardDescription className="text-slate-500 font-bold mt-1 uppercase tracking-widest text-[10px]">Monitor platform health and content reports</CardDescription>
                        </div>
                        <Button
                            onClick={handleRefresh}
                            disabled={isRefreshing}
                            className="bg-slate-900 hover:bg-sky-600 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 group transition-all active:scale-95 disabled:opacity-70"
                        >
                            <RefreshCw className={cn("w-4 h-4 mr-3 group-hover:scale-110 transition-transform", isRefreshing && "animate-spin")} />
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
                                {loading && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">
                                            Synchronizing Safety Database...
                                        </td>
                                    </tr>
                                )}
                                {!loading && flags.map((flag) => (
                                    <tr key={flag._id} className="hover:bg-slate-50/80 transition-colors group">
                                        <td className="py-5 px-8">
                                            <div className="flex items-center gap-3">
                                                <div className={cn("w-2 h-8 rounded-full", flag.severity === 'high' ? 'bg-rose-500' : flag.severity === 'medium' ? 'bg-amber-500' : 'bg-emerald-500')} />
                                                <div>
                                                    <p className="text-sm font-black text-slate-800 leading-tight uppercase">{flag.type}</p>
                                                    <p className="text-[10px] text-slate-400 font-bold uppercase tracking-wider mt-0.5">{flag.reason || 'Reported Incident'}</p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={cn("text-[9px] font-black rounded-lg px-2.5 py-1 uppercase tracking-[0.15em] border-0", 
                                                    flag.severity === "high" ? "bg-rose-100 text-rose-600" : 
                                                    flag.severity === "medium" ? "bg-amber-100 text-amber-600" : 
                                                    "bg-emerald-100 text-emerald-600"
                                                )}
                                            >
                                                {flag.severity}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8 text-xs text-slate-500 font-black uppercase tracking-wider">
                                            {flag.reporter?.name || 'System'}
                                        </td>
                                        <td className="py-5 px-8 text-xs text-slate-400 font-bold">
                                            {new Date(flag.createdAt).toLocaleString()}
                                        </td>
                                        <td className="py-5 px-8">
                                            <Badge
                                                className={cn("text-[10px] font-black rounded-lg px-2.5 py-1 uppercase tracking-wider border-0", 
                                                    flag.status === "pending" ? "bg-blue-50 text-blue-600 animate-pulse" : 
                                                    flag.status === "resolved" ? "bg-emerald-500 text-white" : 
                                                    "bg-violet-100 text-violet-600"
                                                )}
                                            >
                                                {flag.status}
                                            </Badge>
                                        </td>
                                        <td className="py-5 px-8">
                                            <div className="flex gap-2">
                                                {flag.status === "pending" && (
                                                    <Button
                                                        size="sm"
                                                        onClick={() => handleResolveFlag(flag._id, flag.type)}
                                                        className="h-9 px-4 bg-emerald-500 hover:bg-emerald-600 text-white rounded-xl font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/10"
                                                    >
                                                        Resolve
                                                    </Button>
                                                )}
                                                <Button
                                                    variant="ghost"
                                                    size="sm"
                                                    onClick={() => handleInvestigateFlag(flag._id, flag.type)}
                                                    className="h-9 px-4 rounded-xl font-black text-[10px] uppercase tracking-widest text-slate-400 hover:bg-slate-100 transition-all"
                                                >
                                                    Investigate
                                                </Button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                                {!loading && flags.length === 0 && (
                                    <tr>
                                        <td colSpan={6} className="py-20 text-center font-black text-slate-300 uppercase tracking-widest">
                                            Platform Integrity 100% - No Active Incidents
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
