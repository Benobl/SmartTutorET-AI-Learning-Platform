"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { systemHealth } from "@/lib/admin-mock-data";
import { Activity, Server, Database, Cpu, Clock, Network, CheckCircle2, AlertTriangle } from "lucide-react";
import { Badge } from "@/components/ui/badge";

export default function AdminSystemPage() {
    return (
        <div className="space-y-8">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {systemHealth.map((item, idx) => (
                    <Card key={idx} className="border-0 shadow-xl rounded-[32px] bg-white border-white overflow-hidden group hover:shadow-2xl transition-all">
                        <CardContent className="p-8">
                            <div className="flex items-center justify-between mb-6">
                                <div className="p-4 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors shadow-inner">
                                    <item.icon className="w-8 h-8" />
                                </div>
                                <Badge className={`text-[10px] font-black rounded-lg px-2.5 py-1 uppercase tracking-widest ${item.status === 'healthy' ? 'bg-emerald-500 text-white' : 'bg-amber-500 text-white'}`}>
                                    {item.status}
                                </Badge>
                            </div>
                            <h3 className="text-sm font-black text-slate-400 uppercase tracking-widest mb-1">{item.name}</h3>
                            <p className="text-3xl font-black text-slate-900 tracking-tight">{item.value}</p>

                            <div className="mt-6 pt-6 border-t border-slate-50">
                                <div className="flex justify-between items-center mb-2">
                                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Efficiency</span>
                                    <span className="text-xs font-black text-slate-700">98%</span>
                                </div>
                                <div className="h-1.5 w-full bg-slate-50 rounded-full overflow-hidden">
                                    <div className="h-full bg-blue-500 w-[98%] rounded-full" />
                                </div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-0 shadow-xl rounded-[40px] bg-slate-900 text-white overflow-hidden">
                <CardContent className="p-12 relative">
                    <div className="absolute top-0 right-0 w-96 h-96 bg-blue-500/10 rounded-full blur-[100px] -translate-y-1/2 translate-x-1/4" />
                    <div className="relative z-10 flex flex-col md:flex-row items-center justify-between gap-10">
                        <div className="space-y-4">
                            <h2 className="text-4xl font-black tracking-tight">Mainframe <span className="text-blue-400">Stable</span></h2>
                            <p className="text-slate-400 font-medium max-w-md italic">The platform architecture is operating at peak efficiency across all distributed nodes in the region.</p>
                            <div className="flex gap-4 pt-2">
                                <Badge className="bg-blue-500/20 text-blue-400 border-blue-500/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Uptime: 45 Days</Badge>
                                <Badge className="bg-emerald-500/20 text-emerald-400 border-emerald-500/30 px-4 py-2 rounded-xl text-xs font-black uppercase tracking-widest">Security: Level 5</Badge>
                            </div>
                        </div>
                        <div className="w-32 h-32 rounded-[40px] border-4 border-emerald-500/30 flex items-center justify-center animate-pulse">
                            <CheckCircle2 className="w-16 h-16 text-emerald-500" />
                        </div>
                    </div>
                </CardContent>
            </Card>
        </div>
    );
}
