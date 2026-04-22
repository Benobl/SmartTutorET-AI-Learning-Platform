"use client";

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Bell, Database, Globe, Lock, Cpu } from "lucide-react";

export default function AdminSettingsPage() {
    return (
        <div className="space-y-8 max-w-4xl">
            <div>
                <h2 className="text-3xl font-black text-slate-800 tracking-tight">System <span className="text-blue-500">Settings</span></h2>
                <p className="text-slate-400 font-medium">Fine-tune platform parameters and security protocols.</p>
            </div>

            <div className="grid gap-6">
                {[
                    { title: "General Configuration", description: "Platform name, logo, and global contact details.", icon: Globe },
                    { title: "Security & Authentication", description: "MFA requirements, password policies, and admin access levels.", icon: Shield },
                    { title: "Data Management", description: "Backup schedules, retention policies, and storage limits.", icon: Database },
                    { title: "Notification Engine", description: "Configure automated emails, SMS, and in-app alerts.", icon: Bell },
                    { title: "API & Integrations", description: "Manage third-party service tokens and webhooks.", icon: Cpu },
                ].map((item, idx) => (
                    <Card key={idx} className="border-0 shadow-lg rounded-[28px] bg-white border border-slate-100 hover:shadow-xl transition-all group overflow-hidden">
                        <CardContent className="p-8 flex items-center justify-between gap-8">
                            <div className="flex items-center gap-6">
                                <div className="w-14 h-14 rounded-2xl bg-slate-50 text-slate-400 group-hover:bg-blue-50 group-hover:text-blue-500 transition-colors flex items-center justify-center shadow-inner">
                                    <item.icon className="w-7 h-7" />
                                </div>
                                <div>
                                    <h3 className="text-lg font-black text-slate-800">{item.title}</h3>
                                    <p className="text-sm font-medium text-slate-400">{item.description}</p>
                                </div>
                            </div>
                            <Button variant="outline" className="rounded-xl h-12 px-6 font-black text-[11px] uppercase tracking-widest border-slate-200">
                                Configure
                            </Button>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <Card className="border-0 shadow-xl rounded-[32px] bg-rose-50 border border-rose-100 overflow-hidden">
                <CardContent className="p-8 flex items-center justify-between">
                    <div className="flex items-center gap-6">
                        <div className="w-14 h-14 rounded-2xl bg-rose-100 text-rose-500 flex items-center justify-center">
                            <Lock className="w-7 h-7" />
                        </div>
                        <div>
                            <h3 className="text-lg font-black text-rose-900">Advanced Lockdown</h3>
                            <p className="text-sm font-medium text-rose-600/70">Immediately restrict all external access to the platform.</p>
                        </div>
                    </div>
                    <Button className="bg-rose-600 hover:bg-rose-700 text-white rounded-xl h-12 px-8 font-black text-[11px] uppercase tracking-widest shadow-xl shadow-rose-900/20 transition-all active:scale-95">
                        Trigger Protocol
                    </Button>
                </CardContent>
            </Card>
        </div>
    );
}
