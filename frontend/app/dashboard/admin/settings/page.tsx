"use client";

import { useState, useEffect } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Settings, Shield, Globe, Lock, Save, Bell } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { toast } from "@/hooks/use-toast";

import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const settingsRes = await adminApi.getSettings();
                setSettings(settingsRes.data);
            } catch (error) {
                console.error("Failed to load architecture data", error);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, []);

    const handleSave = async () => {
        setIsSaving(true);
        try {
            await adminApi.updateSettings(settings);
            toast({ title: "Architecture Synchronized", description: "Global parameters successfully persisted." });
        } catch (error: any) {
            toast({ title: "Sync Failure", description: error.message, variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const toggleAlert = (key: string) => {
        setSettings({
            ...settings,
            alertProfile: {
                ...settings.alertProfile,
                [key]: !settings.alertProfile[key]
            }
        });
    };


    return (
        <div className="space-y-8">
            <div className="flex justify-between items-end px-2">
                <div>
                    <h2 className="text-3xl font-black text-slate-800 tracking-tight">System <span className="text-sky-500">Architecture</span></h2>
                    <p className="text-slate-400 font-medium uppercase tracking-widest text-[10px] mt-1">Control platform-wide parameters and security protocols</p>
                </div>
                <Button 
                    onClick={handleSave}
                    disabled={isSaving}
                    className="bg-sky-500 hover:bg-sky-600 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-sky-500/20 group transition-all"
                >
                    <Save className="w-4 h-4 mr-3" />
                    {isSaving ? "Synchronizing..." : "Push Configuration"}
                </Button>
            </div>

            {isLoading ? (
                <div className="py-20 text-center font-black text-slate-300 uppercase tracking-widest animate-pulse">Scanning Grid Infrastructure...</div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-8">
                    <div className="lg:col-span-2 space-y-8">
                        <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white overflow-hidden">
                            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4">
                                        <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                            <Globe className="w-5 h-5 text-sky-500" />
                                        </div>
                                        <div>
                                            <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tighter">Identity & Brand</CardTitle>
                                            <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Public-facing platform metadata</CardDescription>
                                        </div>
                                    </div>
                                    <Badge className={cn("rounded-lg px-2.5 py-1 font-black text-[9px] uppercase tracking-widest", settings.maintenanceMode ? "bg-rose-50 text-rose-500" : "bg-emerald-50 text-emerald-500")}>
                                        {settings.maintenanceMode ? "Maintenance Active" : "Operational"}
                                    </Badge>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-6">
                                <div className="grid md:grid-cols-2 gap-6">
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Platform Name</Label>
                                        <Input 
                                            value={settings.platformName} 
                                            onChange={(e) => setSettings({ ...settings, platformName: e.target.value })}
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" 
                                        />
                                    </div>
                                    <div className="space-y-2">
                                        <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 px-1">Support Endpoint</Label>
                                        <Input 
                                            value={settings.supportEmail} 
                                            onChange={(e) => setSettings({ ...settings, supportEmail: e.target.value })}
                                            className="h-14 rounded-2xl bg-slate-50 border-slate-100 font-bold" 
                                        />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white overflow-hidden">
                            <CardHeader className="p-10 border-b border-slate-50 bg-slate-50/30">
                                <div className="flex items-center gap-4">
                                    <div className="p-3 bg-white rounded-2xl shadow-sm border border-slate-100">
                                        <Shield className="w-5 h-5 text-sky-500" />
                                    </div>
                                    <div>
                                        <CardTitle className="text-lg font-black text-slate-900 uppercase tracking-tighter">Security Protocols</CardTitle>
                                        <CardDescription className="text-slate-400 font-bold text-[10px] uppercase tracking-widest">Global access control mechanisms</CardDescription>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className="p-10 space-y-4">
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase">Two-Factor Authentication</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">Force 2FA for all administrative accounts</p>
                                    </div>
                                    <div 
                                        onClick={() => setSettings({ ...settings, twoFactorEnabled: !settings.twoFactorEnabled })}
                                        className={cn("w-12 h-7 rounded-full p-1 cursor-pointer transition-all", settings.twoFactorEnabled ? "bg-sky-500" : "bg-slate-200")}
                                    >
                                        <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-all", settings.twoFactorEnabled ? "ml-auto" : "ml-0")} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase">Registry Lockdown</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">Temporarily disable new student registrations</p>
                                    </div>
                                    <div 
                                        onClick={() => setSettings({ ...settings, registrationLockdown: !settings.registrationLockdown })}
                                        className={cn("w-12 h-7 rounded-full p-1 cursor-pointer transition-all", settings.registrationLockdown ? "bg-rose-500" : "bg-slate-200")}
                                    >
                                        <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-all", settings.registrationLockdown ? "ml-auto" : "ml-0")} />
                                    </div>
                                </div>
                                <div className="flex items-center justify-between p-6 rounded-3xl bg-slate-50 border border-slate-100/50">
                                    <div>
                                        <p className="text-xs font-black text-slate-800 uppercase">Maintenance Mode</p>
                                        <p className="text-[10px] text-slate-400 font-bold tracking-tight">Public access restriction for major updates</p>
                                    </div>
                                    <div 
                                        onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                        className={cn("w-12 h-7 rounded-full p-1 cursor-pointer transition-all", settings.maintenanceMode ? "bg-amber-500" : "bg-slate-200")}
                                    >
                                        <div className={cn("w-5 h-5 bg-white rounded-full shadow-sm transition-all", settings.maintenanceMode ? "ml-auto" : "ml-0")} />
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    <div className="space-y-8">

                        <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white p-10">
                             <div className="flex items-center gap-3 mb-8">
                                 <Bell className="w-5 h-5 text-indigo-500" />
                                 <h3 className="text-sm font-black text-slate-900 uppercase tracking-widest">Alert Profile</h3>
                             </div>
                             <div className="space-y-6">
                                {[
                                    { id: 'systemVitals', label: 'System Vitals' },
                                    { id: 'fraudDetection', label: 'Fraud Detection' },
                                    { id: 'newRegistry', label: 'New Registry' }
                                ].map((alert) => (
                                    <div 
                                        key={alert.id} 
                                        onClick={() => toggleAlert(alert.id)}
                                        className="flex items-center gap-4 group cursor-pointer"
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-lg border-2 transition-all flex items-center justify-center",
                                            settings.alertProfile?.[alert.id] ? "bg-indigo-500 border-indigo-500" : "border-slate-100 bg-slate-50 group-hover:border-slate-200"
                                        )}>
                                            {settings.alertProfile?.[alert.id] && <div className="w-2 h-2 bg-white rounded-full" />}
                                        </div>
                                        <span className={cn("text-[11px] font-black uppercase tracking-widest transition-colors", settings.alertProfile?.[alert.id] ? "text-slate-900" : "text-slate-400 group-hover:text-slate-500")}>
                                            {alert.label}
                                        </span>
                                    </div>
                                ))}
                             </div>
                        </Card>
                    </div>
                </div>
            )}
        </div>
    );
}
