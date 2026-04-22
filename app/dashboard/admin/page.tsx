"use client";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useState, useEffect } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  Clock,
  DollarSign,
  MessageSquare,
  Shield,
  Star,
  TrendingUp,
  Users,
  Search,
  Download,
  FileText,
  Calendar
} from "lucide-react";
import { Input } from "@/components/ui/input";
import { exportToCSV, exportToPDF } from "@/lib/admin-utils";
import {
  Area,
  AreaChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminStats as allStats,
  userDistributionData,
  recentActivityLog,
} from "@/lib/admin-mock-data";
import {
  getStatsByTimeframe,
  getAnalyticsByTimeframe,
} from "@/lib/admin-utils";

/* ─── Helpers ─── */
const fmt = (n: number) => n.toLocaleString();
const usd = (n: number) => `$${n.toLocaleString()}`;

export default function AdminDashboard() {
  const router = useRouter();
  const pathname = usePathname();
  const searchParams = useSearchParams();
  const timeframe = (searchParams.get("timeframe") as any) || "year";
  const q = searchParams.get("q") || "";

  const [searchQuery, setSearchQuery] = useState(q);
  const [isGeneratingReport, setIsGeneratingReport] = useState(false);

  // Sync search query with URL after a small debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      const params = new URLSearchParams(searchParams.toString());
      if (searchQuery) params.set("q", searchQuery);
      else params.delete("q");
      router.push(`${pathname}?${params.toString()}`, { scroll: false });
    }, 300);
    return () => clearTimeout(timer);
  }, [searchQuery, pathname, router, searchParams]);

  const setTimeframe = (tf: string) => {
    const params = new URLSearchParams(searchParams.toString());
    params.set("timeframe", tf);
    router.push(`${pathname}?${params.toString()}`, { scroll: false });
  };

  const handleExport = async (format: 'pdf' | 'csv') => {
    setIsGeneratingReport(true);
    // Simulate report generation delay
    await new Promise(resolve => setTimeout(resolve, 1500));

    const dataToExport = allStats[timeframe as 'year' | 'month' | 'week'] || allStats.year;
    if (format === 'pdf') {
      exportToPDF([dataToExport], `Admin Overview - ${timeframe.toUpperCase()}`, `admin_overview_${timeframe}`);
    } else {
      exportToCSV([dataToExport], `admin_overview_${timeframe}`);
    }
    setIsGeneratingReport(false);
  };

  const currentStats = getStatsByTimeframe(timeframe);
  const currentAnalytics = getAnalyticsByTimeframe(timeframe);

  /* ─── Stat Cards Config ─── */
  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: fmt(currentStats.totalUsers),
      change: currentStats.growth,
      bg: "bg-blue-50",
      iconColor: "text-blue-600",
    },
    {
      icon: BookOpen,
      label: "Active Courses",
      value: String(allStats.year.totalStudents / 30 | 0),
      change: "+8 courses",
      bg: "bg-emerald-50",
      iconColor: "text-emerald-600",
    },
    {
      icon: DollarSign,
      label: "Revenue",
      value: usd(currentStats.platformRevenue),
      change: currentStats.growth,
      bg: "bg-violet-50",
      iconColor: "text-violet-600",
    },
    {
      icon: AlertCircle,
      label: "System Status",
      value: "Optimum",
      change: "No incidents",
      bg: "bg-amber-50",
      iconColor: "text-amber-600",
    },
  ];

  const quickStats = [
    { label: "Avg. Session", value: "45m", change: "+5m", icon: Clock },
    { label: "Avg. Rating", value: "4.8/5", change: "+0.2", icon: Star },
    { label: "Success Rate", value: "94%", change: "+2%", icon: TrendingUp },
    { label: "Tickets", value: "18", change: "-5", icon: MessageSquare },
  ];

  return (
    <div className="space-y-8 pb-20">
      {/* ── Dashboard Header ── */}
      <header className="bg-white/80 backdrop-blur-xl border border-slate-200/60 p-8 rounded-[40px] shadow-sm mb-10 transition-all duration-500 hover:shadow-md">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div>
            <h1 className="text-3xl font-black text-slate-900 tracking-tighter flex items-center gap-3">
              Admin <span className="text-blue-600">Overview</span>
              <span className="text-[10px] bg-blue-100 text-blue-600 px-3 py-1 rounded-full uppercase tracking-wider font-black border border-blue-200">
                Functional v2
              </span>
            </h1>
            <p className="text-slate-500 text-sm font-medium mt-1">
              Performance metrics and strategic platform analytics
            </p>
          </div>

          <div className="flex items-center gap-4">
            <div className="relative group">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
              <Input
                placeholder="Deep analytics search..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-72 pl-12 pr-4 h-12 rounded-[20px] border-slate-200 bg-white/50 focus:bg-white transition-all shadow-sm focus:shadow-md border-2 focus:border-blue-500/20"
              />
            </div>

            <div className="h-10 w-[1px] bg-slate-200/60 mx-2" />

            <div className="flex items-center gap-3">
              <Button
                variant="outline"
                onClick={() => handleExport('csv')}
                className="h-12 w-12 p-0 rounded-2xl border-slate-200 hover:bg-slate-50 hover:text-blue-600 transition-all shadow-sm active:scale-95"
              >
                <Download className="w-5 h-5" />
              </Button>
              <Button
                onClick={() => handleExport('pdf')}
                disabled={isGeneratingReport}
                className="bg-slate-900 hover:bg-slate-800 text-white rounded-2xl h-14 px-8 font-black text-xs uppercase tracking-widest shadow-xl shadow-slate-900/20 group transition-all active:scale-95 disabled:opacity-70"
              >
                {isGeneratingReport ? (
                  <Activity className="w-4 h-4 mr-3 animate-spin" />
                ) : (
                  <FileText className="w-4 h-4 mr-3 group-hover:scale-110 transition-transform" />
                )}
                {isGeneratingReport ? "Generating..." : "Generate Report"}
              </Button>
            </div>
          </div>
        </div>

        {/* ── Timeframe Filters ── */}
        <div className="flex items-center justify-between mt-10 pt-8 border-t border-slate-100/60">
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-blue-50 border border-blue-100/50 shadow-sm">
              <Calendar className="w-4 h-4 text-blue-500" />
              <span className="text-[10px] font-black text-blue-600 uppercase tracking-widest">Timeframe</span>
            </div>
            <div className="flex p-1.5 rounded-[22px] bg-slate-100/50 border border-slate-200/40 backdrop-blur-sm">
              {["day", "week", "month", "year"].map((r) => (
                <button
                  key={r}
                  onClick={() => setTimeframe(r)}
                  className={`
                    px-6 py-2 rounded-[18px] text-[10px] font-black transition-all duration-500 capitalize tracking-widest
                    ${timeframe === r
                      ? "bg-white text-blue-600 shadow-md shadow-blue-500/5 ring-1 ring-slate-200 scale-[1.05]"
                      : "text-slate-400 hover:text-slate-600 hover:bg-white/30"
                    }
                  `}
                >
                  {r}
                </button>
              ))}
            </div>
          </div>

          <div className="hidden lg:flex items-center gap-6">
            <div className="flex items-center gap-3 px-5 py-2.5 rounded-2xl bg-emerald-50/50 border border-emerald-100/50">
              <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse shadow-[0_0_12px_rgba(16,185,129,0.5)]" />
              <span className="text-[10px] font-black text-emerald-600 uppercase tracking-widest">System Operational</span>
            </div>
            <div className="flex items-center gap-2 text-slate-300">
              <div className="h-4 w-[1px] bg-slate-200" />
              <span className="text-[10px] font-black uppercase tracking-widest ml-2">Latency: 24ms</span>
            </div>
          </div>
        </div>
      </header>
      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((m, i) => (
          <Card
            key={i}
            className="overflow-hidden border-0 shadow-lg hover:shadow-2xl transition-all duration-300 rounded-[32px] group bg-white/70 backdrop-blur-xl border border-white"
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={`p-4 rounded-2xl ${m.bg} ${m.iconColor} group-hover:scale-110 transition-transform duration-500 shadow-inner`}
                >
                  <m.icon className="w-8 h-8" />
                </div>
                <Badge
                  variant="secondary"
                  className="text-xs font-black rounded-xl bg-white border border-slate-100 text-slate-500 shadow-sm px-3 py-1"
                >
                  {m.change}
                </Badge>
              </div>
              <p className="text-[11px] font-black text-slate-400 uppercase tracking-[0.25em] mb-1">
                {m.label}
              </p>
              <p className="text-4xl font-black text-slate-800 tracking-tight">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* User Growth Chart */}
        <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white overflow-hidden group">
          <CardHeader className="p-10 pb-0">
            <CardTitle className="flex items-center gap-3 text-2xl font-black text-slate-900 tracking-tight">
              <TrendingUp className="w-6 h-6 text-blue-500" />
              User Acquisition
            </CardTitle>
            <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Monthly platform expansion metrics</CardDescription>
          </CardHeader>
          <CardContent className="p-10 pt-6">
            <div className="h-72">
              <ResponsiveContainer width="100%" height="100%">
                <AreaChart data={currentAnalytics}>
                  <defs>
                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.15} />
                      <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                  <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                  <YAxis axisLine={false} tickLine={false} tick={{ fill: '#94a3b8', fontSize: 12, fontWeight: 700 }} />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "white",
                      border: "0",
                      borderRadius: "16px",
                      boxShadow: "0 10px 30px rgba(0,0,0,0.1)",
                      fontWeight: 800,
                    }}
                  />
                  <Area type="monotone" dataKey="students" stroke="#3B82F6" strokeWidth={4} fillOpacity={1} fill="url(#colorStudents)" />
                  <Area type="monotone" dataKey="tutors" stroke="#10B981" strokeWidth={3} fill="transparent" />
                </AreaChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>

        {/* Distribution & Activity */}
        <div className="space-y-8">
          <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white overflow-hidden">
            <CardHeader className="p-8 pb-0 flex flex-row items-center justify-between">
              <div>
                <CardTitle className="text-xl font-black text-slate-900 tracking-tight">Active Reach</CardTitle>
                <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">User type distribution</CardDescription>
              </div>
              <Activity className="w-5 h-5 text-indigo-500" />
            </CardHeader>
            <CardContent className="p-8">
              <div className="flex items-center gap-8">
                <div className="h-40 w-40 shrink-0">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={45}
                        outerRadius={70}
                        dataKey="count"
                        stroke="none"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                    </PieChart>
                  </ResponsiveContainer>
                </div>
                <div className="flex-1 space-y-3">
                  {userDistributionData.map((item, idx) => (
                    <div key={idx} className="flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <div className="w-2 h-2 rounded-full" style={{ backgroundColor: item.color }} />
                        <span className="text-xs font-black text-slate-600">{item.type}</span>
                      </div>
                      <span className="text-xs font-black text-slate-400">{item.percentage}%</span>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-2 gap-4">
            {quickStats.slice(0, 2).map((stat, idx) => (
              <Card key={idx} className="border-0 shadow-lg rounded-[28px] bg-white transition-all hover:scale-105 duration-300">
                <CardContent className="p-6 flex items-center gap-4">
                  <div className="w-12 h-12 rounded-2xl bg-slate-50 flex items-center justify-center text-slate-400">
                    <stat.icon className="w-5 h-5" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black uppercase text-slate-400 tracking-widest">{stat.label}</p>
                    <p className="text-xl font-black text-slate-800">{stat.value}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Activity */}
      <Card className="border-0 shadow-xl rounded-[40px] bg-white border-white overflow-hidden">
        <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-black text-slate-900 tracking-tight">System Ledger</CardTitle>
            <CardDescription className="font-bold text-slate-400 uppercase tracking-widest text-[10px]">Real-time administrative feed</CardDescription>
          </div>
          <Button variant="ghost" className="rounded-xl font-black text-[10px] uppercase tracking-widest text-blue-500">View History</Button>
        </CardHeader>
        <CardContent className="p-0">
          <div className="divide-y divide-slate-50">
            {recentActivityLog.map((item) => (
              <div
                key={item.id}
                className="flex items-center justify-between p-8 hover:bg-slate-50/50 transition-colors"
              >
                <div className="flex items-center gap-5">
                  <div
                    className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-inner ${item.type === "approval"
                      ? "bg-emerald-50 text-emerald-500"
                      : item.type === "moderation"
                        ? "bg-rose-50 text-rose-500"
                        : item.type === "system"
                          ? "bg-violet-50 text-violet-500"
                          : item.type === "revenue"
                            ? "bg-amber-50 text-amber-500"
                            : "bg-blue-50 text-blue-500"
                      }`}
                  >
                    {item.type === "approval" ? <Shield className="w-5 h-5" /> : <Activity className="w-5 h-5" />}
                  </div>
                  <div>
                    <p className="text-sm font-black text-slate-800 tracking-tight">{item.action}</p>
                    <p className="text-xs text-slate-400 font-bold uppercase tracking-wider mt-0.5">{item.user}</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.time}</span>
                  <div className="w-1.5 h-1.5 rounded-full bg-slate-200" />
                </div>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
