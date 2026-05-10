"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Save, Globe, Shield, Bell, RefreshCw, CheckCircle2 } from "lucide-react";
import { toast } from "@/hooks/use-toast";
import { adminApi } from "@/lib/api";
import { cn } from "@/lib/utils";
import { Skeleton } from "@/components/ui/skeleton";

function Toggle({ value, onChange, color = "sky" }: { value: boolean; onChange: () => void; color?: string }) {
    return (
        <button
            type="button"
            onClick={onChange}
            className={cn(
                "relative w-12 h-7 rounded-full p-1 transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-offset-2",
                value
                    ? color === "rose" ? "bg-rose-500 focus:ring-rose-400"
                    : color === "amber" ? "bg-amber-500 focus:ring-amber-400"
                    : "bg-sky-500 focus:ring-sky-400"
                    : "bg-slate-200 focus:ring-slate-300"
            )}
        >
            <div className={cn(
                "w-5 h-5 bg-white rounded-full shadow-sm transition-all duration-300",
                value ? "translate-x-5" : "translate-x-0"
            )} />
        </button>
    );
}

function SettingRow({ label, description, value, onChange, color }: { label: string; description: string; value: boolean; onChange: () => void; color?: string }) {
    return (
        <div className="flex items-center justify-between p-5 rounded-2xl bg-slate-50 border border-slate-100 hover:border-slate-200 transition-all">
            <div>
                <p className="text-sm font-bold text-slate-800">{label}</p>
                <p className="text-[11px] text-slate-400 mt-0.5 leading-relaxed">{description}</p>
            </div>
            <Toggle value={value} onChange={onChange} color={color} />
        </div>
    );
}

export default function AdminSettingsPage() {
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [settings, setSettings] = useState<any>(null);
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        const load = async () => {
            try {
                const res = await adminApi.getSettings();
                setSettings(res?.data || res);
            } catch (error) {
                console.error("Failed to load settings", error);
                toast({ title: "Load Error", description: "Could not load settings from server.", variant: "destructive" });
            } finally {
                setIsLoading(false);
            }
        };
        load();
    }, []);

    const handleSave = async () => {
        if (!settings) return;
        setIsSaving(true);
        try {
            await adminApi.updateSettings(settings);
            setSaved(true);
            setTimeout(() => setSaved(false), 3000);
            toast({ title: "Settings Saved ✓", description: "Platform configuration updated successfully.", className: "bg-emerald-500 text-white" });
        } catch (error: any) {
            toast({ title: "Save Failed", description: error.message || "Could not save settings.", variant: "destructive" });
        } finally {
            setIsSaving(false);
        }
    };

    const update = (key: string, value: any) => setSettings((prev: any) => ({ ...prev, [key]: value }));
    const toggleAlert = (key: string) => setSettings((prev: any) => ({
        ...prev,
        alertProfile: { ...prev.alertProfile, [key]: !prev.alertProfile?.[key] }
    }));

    return (
        <div className="max-w-5xl mx-auto space-y-10 py-4 animate-in fade-in duration-700">

            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-end justify-between gap-6 px-4">
                <div className="space-y-3">
                    <div className="flex items-center gap-3">
                        <div className="w-2 h-2 rounded-full bg-slate-900" />
                        <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Admin Configuration</span>
                    </div>
                    <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
                        Platform <span className="font-semibold text-slate-900">Settings</span>
                    </h1>
                    <p className="text-slate-400 text-sm font-medium leading-relaxed">
                        Control platform-wide parameters, security protocols and notification preferences.
                    </p>
                </div>
                <Button
                    onClick={handleSave}
                    disabled={isSaving || isLoading || !settings}
                    className={cn(
                        "rounded-2xl h-12 px-8 font-black text-xs uppercase tracking-widest shadow-lg transition-all",
                        saved
                            ? "bg-emerald-500 hover:bg-emerald-600 text-white shadow-emerald-200"
                            : "bg-sky-500 hover:bg-sky-600 text-white shadow-sky-200"
                    )}
                >
                    {saved ? (
                        <><CheckCircle2 className="w-4 h-4 mr-2" /> Saved</>
                    ) : isSaving ? (
                        <><RefreshCw className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                    ) : (
                        <><Save className="w-4 h-4 mr-2" /> Save Settings</>
                    )}
                </Button>
            </div>

            {isLoading ? (
                <div className="px-4 space-y-5">
                    {Array(3).fill(0).map((_, i) => <Skeleton key={i} className="h-32 w-full rounded-[24px]" />)}
                </div>
            ) : !settings ? (
                <div className="px-4 py-20 text-center text-slate-400 text-sm">Could not load settings. Please refresh.</div>
            ) : (
                <div className="grid lg:grid-cols-3 gap-6 px-4">
                    <div className="lg:col-span-2 space-y-6">

                        {/* Identity & Brand */}
                        <div className="p-8 rounded-[28px] bg-white border border-slate-100 shadow-sm space-y-6">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-sky-50 flex items-center justify-center">
                                    <Globe className="w-4 h-4 text-sky-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Identity & Brand</h2>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Public-facing platform metadata</p>
                                </div>
                                <span className={cn(
                                    "ml-auto px-3 py-1 rounded-xl text-[9px] font-black uppercase tracking-widest",
                                    settings.maintenanceMode
                                        ? "bg-amber-50 text-amber-600 border border-amber-100"
                                        : "bg-emerald-50 text-emerald-600 border border-emerald-100"
                                )}>
                                    {settings.maintenanceMode ? "Maintenance" : "Operational"}
                                </span>
                            </div>
                            <div className="grid md:grid-cols-2 gap-5">
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Platform Name</Label>
                                    <Input
                                        value={settings.platformName || ""}
                                        onChange={e => update("platformName", e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium text-sm focus:ring-sky-500/20"
                                        placeholder="SmartTutorET"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400">Support Email</Label>
                                    <Input
                                        value={settings.supportEmail || ""}
                                        onChange={e => update("supportEmail", e.target.value)}
                                        className="h-12 rounded-xl bg-slate-50 border-slate-100 font-medium text-sm focus:ring-sky-500/20"
                                        placeholder="support@smarttutoret.com"
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Security Protocols */}
                        <div className="p-8 rounded-[28px] bg-white border border-slate-100 shadow-sm space-y-4">
                            <div className="flex items-center gap-3 mb-2">
                                <div className="w-9 h-9 rounded-xl bg-indigo-50 flex items-center justify-center">
                                    <Shield className="w-4 h-4 text-indigo-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Security Protocols</h2>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Global access control mechanisms</p>
                                </div>
                            </div>

                            <SettingRow
                                label="Two-Factor Authentication"
                                description="Force 2FA for all administrative accounts"
                                value={!!settings.twoFactorEnabled}
                                onChange={() => update("twoFactorEnabled", !settings.twoFactorEnabled)}
                            />
                            <SettingRow
                                label="Registration Lockdown"
                                description="Temporarily disable new student registrations"
                                value={!!settings.registrationLockdown}
                                onChange={() => update("registrationLockdown", !settings.registrationLockdown)}
                                color="rose"
                            />
                            <SettingRow
                                label="Maintenance Mode"
                                description="Restrict public access during major updates"
                                value={!!settings.maintenanceMode}
                                onChange={() => update("maintenanceMode", !settings.maintenanceMode)}
                                color="amber"
                            />
                        </div>
                    </div>

                    {/* Alert Profile */}
                    <div className="space-y-6">
                        <div className="p-8 rounded-[28px] bg-white border border-slate-100 shadow-sm">
                            <div className="flex items-center gap-3 mb-6">
                                <div className="w-9 h-9 rounded-xl bg-violet-50 flex items-center justify-center">
                                    <Bell className="w-4 h-4 text-violet-500" />
                                </div>
                                <div>
                                    <h2 className="text-sm font-bold text-slate-900">Alert Profile</h2>
                                    <p className="text-[10px] text-slate-400 uppercase tracking-widest">Notification settings</p>
                                </div>
                            </div>
                            <div className="space-y-5">
                                {[
                                    { id: "systemVitals", label: "System Vitals", desc: "Get notified about server health" },
                                    { id: "fraudDetection", label: "Fraud Detection", desc: "Suspicious payment activity alerts" },
                                    { id: "newRegistry", label: "New Registrations", desc: "Alert on new tutor signups" },
                                ].map(alert => (
                                    <div key={alert.id} className="flex items-start justify-between gap-4">
                                        <div>
                                            <p className="text-xs font-bold text-slate-800">{alert.label}</p>
                                            <p className="text-[10px] text-slate-400 mt-0.5">{alert.desc}</p>
                                        </div>
                                        <Toggle
                                            value={!!settings.alertProfile?.[alert.id]}
                                            onChange={() => toggleAlert(alert.id)}
                                        />
                                    </div>
                                ))}
                            </div>
                        </div>

                        {/* Save reminder */}
                        <div className="p-6 rounded-[24px] bg-sky-50 border border-sky-100">
                            <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-1">Remember</p>
                            <p className="text-xs text-sky-700 leading-relaxed">
                                Changes are only applied after you click <strong>Save Settings</strong>. Toggling switches does not auto-save.
                            </p>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
