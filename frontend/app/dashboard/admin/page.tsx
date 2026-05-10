"use client";

import { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Users,
  BookOpen,
  DollarSign,
  AlertCircle,
  TrendingUp,
  Shield,
  Download,
} from "lucide-react";
import {
  AreaChart,
  Area,
  XAxis,
  Tooltip,
  ResponsiveContainer,
} from "recharts";
import { adminApi } from "@/lib/api";
import { toast } from "@/hooks/use-toast";
import { cn } from "@/lib/utils";

const fmt = (n: number) => (n || 0).toLocaleString();
const usd = (val: number) =>
  new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
  }).format(val || 0);

export default function AdminDashboard() {
  const [stats, setStats] = useState<any>(null);
  const [applications, setApplications] = useState<any[]>([]);
  const [analytics, setAnalytics] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchData = async () => {
    try {
      setLoading(true);
      const [statsRes, appRes, analyticsRes] = await Promise.all([
        adminApi.getStats(),
        adminApi.getPendingTutors(),
        adminApi.getAnalytics("year"),
      ]);

      setStats(statsRes.data);
      setApplications(appRes.data);
      setAnalytics(analyticsRes.data);
    } catch (error) {
      console.error("Dashboard fetch error", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleApproveTutor = async (id: string) => {
    try {
      await adminApi.approveTutor(id);
      toast({ title: "Approved", description: "Tutor onboarded" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const handleRejectTutor = async (id: string) => {
    try {
      await adminApi.rejectTutor(id, "Rejected by admin");
      toast({ title: "Rejected", description: "Tutor rejected" });
      fetchData();
    } catch (err: any) {
      toast({ title: "Error", description: err.message, variant: "destructive" });
    }
  };

  const statCards = [
    {
      label: "Total Students",
      value: stats ? fmt(stats.totalStudents) : "...",
      icon: Users,
      color: "text-sky-500",
      bg: "bg-sky-50",
    },
    {
      label: "Active Subjects",
      value: stats ? String(stats.activeSubjects) : "...",
      icon: BookOpen,
      color: "text-indigo-500",
      bg: "bg-indigo-50",
    },
    {
      label: "Revenue",
      value: stats ? usd(stats.revenue) : "...",
      icon: DollarSign,
      color: "text-emerald-500",
      bg: "bg-emerald-50",
    },
    {
      label: "Pending Tutors",
      value: stats ? String(stats.pendingTutors) : "...",
      icon: AlertCircle,
      color: "text-rose-500",
      bg: "bg-rose-50",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto space-y-16 animate-in fade-in duration-700 pb-32 pt-4">

      {/* HEADER */}
      <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-8 px-4">
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <div className="w-2 h-2 rounded-full bg-slate-900 shadow-[0_0_10px_rgba(0,0,0,0.1)]" />
            <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-slate-400">Platform Governance</span>
          </div>
          <h1 className="text-5xl font-light text-slate-800 tracking-tight leading-none">
            Admin <span className="font-semibold text-slate-900">Console</span>
          </h1>
          <p className="text-slate-400 text-sm font-medium leading-relaxed max-w-md">
            Manage institutional standards, monitor growth analytics, and verify academic credentials.
          </p>
        </div>

        <Button variant="outline" className="h-12 px-8 rounded-full border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest shadow-sm">
          <Download className="w-4 h-4 mr-2" />
          Export System Report
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-8 px-4">
        {statCards.map((s, i) => (
          <div key={i} className="p-10 rounded-[32px] bg-slate-50/50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500 group">
            <p className="text-[9px] font-black text-slate-400 uppercase tracking-widest mb-2">{s.label}</p>
            <h3 className="text-3xl font-semibold text-slate-900 tracking-tight">{s.value}</h3>
            <div className="flex items-center gap-2 mt-2">
              <div className="w-1 h-1 rounded-full bg-slate-200" />
              <p className="text-[9px] font-medium text-slate-400 uppercase">System Sync: Live</p>
            </div>
          </div>
        ))}
      </div>

      {/* ANALYTICS SECTION */}
      <div className="px-4">
        <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-slate-900 rounded-full" />
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Growth Trajectory</h4>
            </div>
            <div className="flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-slate-900" />
              <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Enrollment Variance</span>
            </div>
          </div>
          <div className="h-[320px] w-full">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <defs>
                  <linearGradient id="growthGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0f172a" stopOpacity={0.05}/>
                    <stop offset="95%" stopColor="#0f172a" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <XAxis 
                  dataKey="month" 
                  axisLine={false} 
                  tickLine={false} 
                  tick={{fill: '#94a3b8', fontSize: 10, fontWeight: 700}}
                  dy={10}
                />
                <Tooltip 
                  contentStyle={{borderRadius: '24px', border: 'none', boxShadow: '0 20px 50px rgba(0,0,0,0.1)', padding: '20px'}}
                  itemStyle={{fontSize: '12px', fontWeight: '800', color: '#0f172a'}}
                />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#0f172a"
                  strokeWidth={2}
                  fillOpacity={1}
                  fill="url(#growthGradient)"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>

      {/* TUTOR APPLICATIONS */}
      <div className="px-4">
        <div className="p-10 rounded-[48px] bg-white border border-slate-100 shadow-sm space-y-10">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="w-1 h-6 bg-slate-900 rounded-full" />
              <h4 className="text-[11px] font-black text-slate-900 uppercase tracking-[0.3em]">Pending Verifications</h4>
            </div>
            <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{applications.length} Queue Total</span>
          </div>

          <div className="space-y-4">
            {loading ? (
              <div className="py-12 text-center animate-pulse">
                <p className="text-[10px] font-black text-slate-300 uppercase tracking-widest">Syncing with Registry...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="py-20 text-center bg-slate-50 rounded-[32px] border border-dashed border-slate-200">
                 <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">No pending applications</p>
              </div>
            ) : (
              applications.map((app) => (
                <div
                  key={app._id}
                  className="group flex flex-col md:flex-row md:items-center justify-between p-8 rounded-[32px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-500"
                >
                  <div className="flex items-center gap-6">
                    <div className="w-14 h-14 rounded-2xl bg-white border border-slate-100 flex items-center justify-center text-slate-300 group-hover:text-slate-900 transition-colors">
                      <Users className="w-6 h-6" />
                    </div>
                    <div>
                      <p className="text-sm font-bold text-slate-900">{app.name}</p>
                      <p className="text-[10px] font-medium text-slate-400 uppercase tracking-widest">{app.email}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 mt-6 md:mt-0">
                    <Button
                      onClick={() => handleApproveTutor(app._id)}
                      className="h-11 px-6 rounded-xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-sky-600 transition-all shadow-lg shadow-slate-200"
                    >
                      Verify Access
                    </Button>
                    <Button
                      onClick={() => handleRejectTutor(app._id)}
                      variant="outline"
                      className="h-11 px-6 rounded-xl border-slate-100 bg-white text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-rose-500 transition-all"
                    >
                      Deny
                    </Button>
                  </div>
                </div>
              ))
            )}
          </div>
        </div>
      </div>

    </div>
  );
}