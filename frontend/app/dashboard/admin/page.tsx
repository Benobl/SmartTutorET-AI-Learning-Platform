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
import { Progress } from "@/components/ui/progress";
import { cn } from "@/lib/utils";
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  CheckCircle2,
  Clock,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  RefreshCw,
  Search,
  Shield,
  Star,
  TrendingUp,
  Users,
  XCircle,
  Database,
  Settings,
} from "lucide-react";
import { useState } from "react";
import {
  Area,
  AreaChart,
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Legend,
  Line,
  LineChart,
  Pie,
  PieChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";
import {
  adminStats,
  userGrowthData,
  userDistributionData,
  tutorApplicationsData,
  pendingApplications as initialApplications,
  contentFlags as initialFlags,
  systemHealth,
  revenueData,
  recentActivityLog,
  ADMIN_TABS,
} from "@/lib/admin-mock-data";

/* ─── Helpers ─── */
const fmt = (n: number) => n.toLocaleString();
const usd = (n: number) => `$${n.toLocaleString()}`;

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [dateRange, setDateRange] = useState("year");
  const [searchQuery, setSearchQuery] = useState("");

  // ── Functional state ──
  const [applications, setApplications] = useState(initialApplications);
  const [flags, setFlags] = useState(initialFlags);

  const handleApprove = (id: string | number) => {
    setApplications((prev) =>
      prev.map((a) => ((a.id as any) === id ? { ...a, status: "approved" as any } : a))
    );
  };

  const handleReject = (id: string | number) => {
    setApplications((prev) =>
      prev.map((a) => ((a.id as any) === id ? { ...a, status: "rejected" as any } : a))
    );
  };

  const handleResolve = (id: string | number) => {
    setFlags((prev) =>
      prev.map((f) => ((f.id as any) === id ? { ...f, status: "resolved" as any } : f))
    );
  };

  const handleInvestigate = (id: string | number) => {
    setFlags((prev) =>
      prev.map((f) =>
        (f.id as any) === id ? { ...f, status: "investigating" as any } : f
      )
    );
  };

  const pendingApps = applications.filter((a) => a.status === "pending");
  const pendingFlags = flags.filter((f) => f.status === "pending");

  /* ─── Stat Cards Config (Minimalist) ─── */
  const statCards = [
    {
      icon: Users,
      label: "Total Users",
      value: fmt(adminStats.totalUsers),
      change: "+15.2%",
      color: "text-sky-500",
      bg: "bg-sky-50/50",
    },
    {
      icon: BookOpen,
      label: "Active Courses",
      value: String(adminStats.activeCourses),
      change: "+8 courses",
      color: "text-indigo-500",
      bg: "bg-indigo-50/50",
    },
    {
      icon: DollarSign,
      label: "Platform Revenue",
      value: usd(adminStats.platformRevenue),
      change: "+22.5%",
      color: "text-emerald-500",
      bg: "bg-emerald-50/50",
    },
    {
      icon: AlertCircle,
      label: "Pending Actions",
      value: String(pendingApps.length + pendingFlags.length),
      change: `${pendingFlags.filter((f) => f.severity === "high").length} high priority`,
      color: "text-rose-500",
      bg: "bg-rose-50/50",
    },
  ];

  const quickStats = [
    { label: "Avg. Session", value: adminStats.avgSessionTime, change: "+5m", icon: Clock },
    { label: "Avg. Rating", value: `${adminStats.avgRating}/5`, change: "+0.2", icon: Star },
    { label: "Success Rate", value: `${adminStats.successRate}%`, change: "+2%", icon: TrendingUp },
    { label: "Tickets", value: String(adminStats.supportTickets), change: "-5", icon: MessageSquare },
  ];

  return (
    <div className="space-y-8">
      {/* ── Header ── */}
      <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 pb-2">
        <div>
          <div className="flex items-center gap-3 mb-2">
            <h1 className="text-4xl font-black text-slate-900 tracking-tight uppercase">
              Overview
            </h1>
            <div className="h-1.5 w-1.5 rounded-full bg-sky-500 animate-pulse mt-1" />
          </div>
          <p className="text-slate-400 text-sm font-medium tracking-wide">
            PLATFORM MONITORING & SYSTEM STATUS
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative hidden md:block">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
            <input
              type="search"
              placeholder="Search..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-56 pl-10 pr-4 py-2 rounded-xl border border-slate-200 bg-white text-sm font-medium focus:outline-none focus:ring-2 focus:ring-blue-500/20 focus:border-blue-300"
            />
          </div>
          <Button variant="outline" className="gap-2 rounded-xl font-bold">
            <Download className="w-4 h-4" />
            Export
          </Button>
        </div>
      </div>

      {/* ── Date Range Filter ── */}
      {/* ── Minimalist Toggle ── */}
      <div className="flex gap-2">
        {["day", "week", "month", "year"].map((range) => (
          <button
            key={range}
            onClick={() => setDateRange(range)}
            className={cn(
              "px-4 py-1.5 rounded-lg text-xs font-black uppercase tracking-widest transition-all",
              dateRange === range
                ? "bg-slate-900 text-white shadow-lg shadow-slate-900/10"
                : "bg-white text-slate-400 hover:text-slate-600 border border-slate-100"
            )}
          >
            {range}
          </button>
        ))}
      </div>

      {/* ── Stat Cards ── */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {statCards.map((m, i) => (
          <Card
            key={i}
            className="overflow-hidden border border-slate-100 bg-white shadow-sm hover:shadow-md transition-all duration-300 rounded-[32px] group"
          >
            <CardContent className="p-8">
              <div className="flex items-start justify-between mb-6">
                <div
                  className={cn(
                    "w-12 h-12 rounded-2xl flex items-center justify-center transition-all group-hover:scale-110",
                    m.bg, m.color
                  )}
                >
                  <m.icon className="w-6 h-6" />
                </div>
                <Badge
                  variant="outline"
                  className="text-[10px] font-black uppercase tracking-widest border-slate-100 text-slate-400 rounded-lg px-2"
                >
                  {m.change}
                </Badge>
              </div>
              <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.1em] mb-1.5">
                {m.label}
              </p>
              <p className="text-3xl font-black text-slate-900 tracking-tight">{m.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* ── Tab Navigation (Simplified) ── */}
      <div className="flex flex-wrap gap-2 border-b border-slate-100 pb-2">
        {ADMIN_TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={cn(
              "px-5 py-3 font-black text-[10px] uppercase tracking-widest transition-all relative",
              activeTab === tab.id
                ? "text-slate-900 border-b-2 border-sky-500"
                : "text-slate-400 hover:text-slate-600"
            )}
          >
            {tab.label}
            {tab.id === "tutors" && pendingApps.length > 0 && (
              <span className="ml-2 px-1.5 py-0.5 rounded-md bg-rose-50 text-rose-500 text-[10px] font-black border border-rose-100">
                {pendingApps.length}
              </span>
            )}
          </button>
        ))}
      </div>

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── OVERVIEW TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "overview" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* User Growth Chart */}
            <Card className="border border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-black uppercase tracking-widest">
                  <TrendingUp className="w-4 h-4 text-sky-500" />
                  User Growth
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={userGrowthData}>
                      <defs>
                        <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="#0ea5e9" stopOpacity={0.1} />
                          <stop offset="95%" stopColor="#0ea5e9" stopOpacity={0} />
                        </linearGradient>
                      </defs>
                      <XAxis dataKey="month" stroke="#94a3b8" fontSize={10} tickLine={false} axisLine={false} />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #f1f5f9",
                          borderRadius: "16px",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)",
                          fontSize: "10px",
                          fontWeight: 900,
                          textTransform: "uppercase"
                        }}
                      />
                      <Area type="monotone" dataKey="students" stroke="#0ea5e9" fill="url(#colorStudents)" strokeWidth={3} />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* User Distribution */}
            {/* User Distribution (Simplified) */}
            <Card className="border border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
              <CardHeader className="border-b border-slate-50 pb-4">
                <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-black uppercase tracking-widest">
                  <Users className="w-4 h-4 text-indigo-500" />
                  Demographics
                </CardTitle>
              </CardHeader>
              <CardContent className="pt-8">
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={userDistributionData}
                        cx="50%"
                        cy="50%"
                        innerRadius={60}
                        outerRadius={80}
                        paddingAngle={5}
                        dataKey="count"
                      >
                        {userDistributionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} stroke="none" />
                        ))}
                      </Pie>
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "white",
                          border: "1px solid #f1f5f9",
                          borderRadius: "12px",
                          fontSize: "10px",
                          fontWeight: 900,
                          textTransform: "uppercase"
                        }}
                      />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Quick Stats */}
          {/* Quick Stats (Refined) */}
          <div className="grid md:grid-cols-4 gap-6">
            {quickStats.map((stat, idx) => (
              <Card key={idx} className="border border-slate-100 shadow-sm rounded-3xl bg-white hover:border-slate-200 transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-9 h-9 rounded-xl bg-slate-50 flex items-center justify-center text-slate-400">
                      <stat.icon className="w-4 h-4" />
                    </div>
                    <span className="text-[10px] font-black text-emerald-500 uppercase">
                      {stat.change}
                    </span>
                  </div>
                  <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1">{stat.label}</p>
                  <p className="text-2xl font-black text-slate-900">{stat.value}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Recent Activity */}
          {/* Recent Activity (Clean) */}
          <Card className="border border-slate-100 shadow-sm rounded-[32px] overflow-hidden bg-white">
            <CardHeader className="border-b border-slate-50 pb-4">
              <CardTitle className="flex items-center gap-2 text-slate-900 text-sm font-black uppercase tracking-widest">
                <Activity className="w-4 h-4 text-emerald-500" />
                Live Log
              </CardTitle>
            </CardHeader>
            <CardContent className="p-0">
              <div className="divide-y divide-slate-50">
                {recentActivityLog.map((item) => (
                  <div
                    key={item.id}
                    className="flex items-center justify-between p-6 hover:bg-slate-50/50 transition-colors"
                  >
                    <div className="flex items-center gap-4">
                      <div
                        className={cn(
                          "w-2 h-2 rounded-full",
                          item.type === "approval" ? "bg-emerald-400" :
                            item.type === "moderation" ? "bg-rose-400" :
                              item.type === "system" ? "bg-sky-400" : "bg-slate-300"
                        )}
                      />
                      <div>
                        <p className="text-xs font-black text-slate-900 uppercase tracking-tight">{item.action}</p>
                        <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-0.5">{item.user}</p>
                      </div>
                    </div>
                    <span className="text-[10px] font-black text-slate-300 uppercase tracking-widest">{item.time}</span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── USERS TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "users" && (
        <div className="space-y-6">
          <div className="grid md:grid-cols-4 gap-5">
            {userDistributionData.map((user, idx) => (
              <Card key={idx} className="border-0 shadow-lg rounded-2xl hover:shadow-xl transition-all">
                <CardContent className="p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="w-12 h-12 rounded-xl flex items-center justify-center text-xl" style={{ backgroundColor: `${user.color}15` }}>
                      {user.type === "Students" ? "📚" : user.type === "Tutors" ? "🎓" : user.type === "Instructors" ? "👨‍🏫" : "🔐"}
                    </div>
                    <Badge className="font-bold text-xs rounded-lg" style={{ backgroundColor: `${user.color}15`, color: user.color, border: `1px solid ${user.color}30` }}>
                      {user.percentage}%
                    </Badge>
                  </div>
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider">{user.type}</p>
                  <p className="text-3xl font-black text-slate-900">{fmt(user.count)}</p>
                  <Progress value={user.percentage} className="h-1.5 mt-3" />
                </CardContent>
              </Card>
            ))}
          </div>

          {/* User Activity Chart */}
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <Activity className="w-5 h-5 text-emerald-500" />
                Daily Active Users
              </CardTitle>
              <CardDescription>Last 6 months engagement</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={userGrowthData.slice(-6)}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontWeight: 600 }} />
                    <Bar dataKey="students" fill="#3B82F6" radius={[6, 6, 0, 0]} />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── TUTORS TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "tutors" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* Applications Pipeline */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <BarChart3 className="w-5 h-5 text-blue-500" />
                  Applications Pipeline
                </CardTitle>
                <CardDescription>Tutor application status</CardDescription>
              </CardHeader>
              <CardContent>
                <div className="h-72">
                  <ResponsiveContainer width="100%" height="100%">
                    <PieChart>
                      <Pie
                        data={tutorApplicationsData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ status, count }) => `${status}: ${count}`}
                        outerRadius={95}
                        innerRadius={50}
                        dataKey="count"
                        strokeWidth={2}
                        stroke="#fff"
                      >
                        {tutorApplicationsData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={entry.color} />
                        ))}
                      </Pie>
                      <Tooltip
                        formatter={(value) => [`${value} applications`, "Count"]}
                        contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontWeight: 600 }}
                      />
                      <Legend />
                    </PieChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Pending Applications */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader className="flex flex-row items-center justify-between">
                <div>
                  <CardTitle className="text-slate-900">Pending Applications</CardTitle>
                  <CardDescription>Require immediate attention</CardDescription>
                </div>
                <Badge className="bg-amber-50 text-amber-700 border-amber-200 font-bold rounded-lg">
                  {pendingApps.length} Pending
                </Badge>
              </CardHeader>
              <CardContent className="space-y-3">
                {applications.map((app) => (
                  <div
                    key={app.id}
                    className={`p-4 rounded-xl border transition-all duration-300 ${app.status === "approved"
                      ? "border-emerald-200 bg-emerald-50/50"
                      : app.status === "rejected"
                        ? "border-red-200 bg-red-50/50"
                        : "border-slate-200 hover:border-blue-200 hover:bg-blue-50/30 hover:shadow-md"
                      }`}
                  >
                    <div className="flex items-start justify-between">
                      <div className="flex-1 space-y-1.5">
                        <div className="flex items-center gap-2 flex-wrap">
                          <h4 className="font-bold text-slate-900">{app.name}</h4>
                          <Badge
                            className={`text-[10px] font-bold rounded-md ${app.status === "approved"
                              ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                              : app.status === "rejected"
                                ? "bg-red-100 text-red-700 border-red-200"
                                : app.priority === "high"
                                  ? "bg-red-100 text-red-700 border-red-200"
                                  : app.priority === "medium"
                                    ? "bg-amber-100 text-amber-700 border-amber-200"
                                    : "bg-blue-100 text-blue-700 border-blue-200"
                              }`}
                          >
                            {app.status === "pending" ? app.priority : app.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-slate-500 font-medium">
                          {app.subjects.join(", ")} · {app.degree}
                        </p>
                        <div className="flex items-center gap-4 text-xs text-slate-400 font-bold">
                          <span>⭐ {app.rating}</span>
                          <span>📅 {app.experience}</span>
                          <span>📍 {app.country}</span>
                        </div>
                      </div>
                      {app.status === "pending" && (
                        <div className="flex gap-2 ml-3">
                          <Button
                            size="sm"
                            onClick={() => handleApprove(app.id)}
                            className="bg-emerald-500 hover:bg-emerald-600 text-white rounded-lg font-bold shadow-md shadow-emerald-500/20"
                          >
                            <CheckCircle2 className="w-3.5 h-3.5 mr-1" />
                            Approve
                          </Button>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleReject(app.id)}
                            className="border-red-200 text-red-600 hover:bg-red-50 rounded-lg font-bold"
                          >
                            <XCircle className="w-3.5 h-3.5 mr-1" />
                            Reject
                          </Button>
                        </div>
                      )}
                      {app.status !== "pending" && (
                        <Badge
                          className={`text-xs font-bold rounded-lg ${app.status === "approved"
                            ? "bg-emerald-100 text-emerald-700"
                            : "bg-red-100 text-red-700"
                            }`}
                        >
                          {app.status === "approved" ? "✓ Approved" : "✗ Rejected"}
                        </Badge>
                      )}
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── MODERATION TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "moderation" && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="flex items-center gap-2 text-slate-900">
                    <Shield className="w-5 h-5 text-violet-500" />
                    Content Moderation
                  </CardTitle>
                  <CardDescription>Content flags and reports</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button variant="outline" size="sm" className="rounded-lg font-bold">
                    <RefreshCw className="w-3 h-3 mr-1" />
                    Refresh
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-slate-100">
                      {["Type", "Reports", "Severity", "Status", "Source", "Time", "Actions"].map((h) => (
                        <th key={h} className="text-left py-3 px-4 text-xs font-bold text-slate-400 uppercase tracking-wider">
                          {h}
                        </th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {flags.map((flag) => (
                      <tr key={flag.id} className="border-b border-slate-50 hover:bg-slate-50 transition-colors">
                        <td className="py-3 px-4">
                          <span className="font-bold text-slate-800 text-sm">{flag.type}</span>
                        </td>
                        <td className="py-3 px-4">
                          <Badge variant="outline" className="bg-slate-100 font-bold rounded-md text-xs">
                            {flag.reported} reports
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`text-[10px] font-bold rounded-md ${flag.severity === "high"
                              ? "bg-red-100 text-red-700 border-red-200"
                              : flag.severity === "medium"
                                ? "bg-amber-100 text-amber-700 border-amber-200"
                                : "bg-emerald-100 text-emerald-700 border-emerald-200"
                              }`}
                          >
                            {flag.severity}
                          </Badge>
                        </td>
                        <td className="py-3 px-4">
                          <Badge
                            className={`text-[10px] font-bold rounded-md ${flag.status === "pending"
                              ? "bg-blue-50 text-blue-700 border-blue-200"
                              : flag.status === "resolved"
                                ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                                : "bg-violet-50 text-violet-700 border-violet-200"
                              }`}
                          >
                            {flag.status}
                          </Badge>
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-500 font-medium">
                          {flag.reporter}
                        </td>
                        <td className="py-3 px-4 text-xs text-slate-400 font-bold">
                          {flag.timestamp}
                        </td>
                        <td className="py-3 px-4">
                          <div className="flex gap-2">
                            {flag.status === "pending" && (
                              <>
                                <Button
                                  size="sm"
                                  onClick={() => handleInvestigate(flag.id)}
                                  className="h-7 text-xs rounded-lg font-bold bg-violet-500 hover:bg-violet-600"
                                >
                                  <Eye className="w-3 h-3 mr-1" />
                                  Investigate
                                </Button>
                                <Button
                                  size="sm"
                                  variant="outline"
                                  onClick={() => handleResolve(flag.id)}
                                  className="h-7 text-xs rounded-lg font-bold border-emerald-200 text-emerald-600 hover:bg-emerald-50"
                                >
                                  <CheckCircle2 className="w-3 h-3 mr-1" />
                                  Resolve
                                </Button>
                              </>
                            )}
                            {flag.status === "investigating" && (
                              <Button
                                size="sm"
                                onClick={() => handleResolve(flag.id)}
                                className="h-7 text-xs rounded-lg font-bold bg-emerald-500 hover:bg-emerald-600"
                              >
                                <CheckCircle2 className="w-3 h-3 mr-1" />
                                Resolve
                              </Button>
                            )}
                            {flag.status === "resolved" && (
                              <span className="text-xs font-bold text-emerald-500">✓ Resolved</span>
                            )}
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
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── REVENUE TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "revenue" && (
        <div className="space-y-6">
          <Card className="border-0 shadow-lg rounded-2xl">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-slate-900">
                <DollarSign className="w-5 h-5 text-emerald-500" />
                Revenue Overview
              </CardTitle>
              <CardDescription>Monthly revenue &amp; platform fees</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="h-72">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={revenueData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                    <XAxis dataKey="month" stroke="#94a3b8" fontSize={12} tickLine={false} />
                    <YAxis stroke="#94a3b8" fontSize={12} tickLine={false} axisLine={false} />
                    <Tooltip
                      formatter={(value) => [`$${value}`, "Amount"]}
                      contentStyle={{ backgroundColor: "white", border: "1px solid #e2e8f0", borderRadius: "12px", fontWeight: 600 }}
                    />
                    <Legend />
                    <Line type="monotone" dataKey="revenue" stroke="#10B981" strokeWidth={3} dot={{ r: 4 }} activeDot={{ r: 6 }} />
                    <Line type="monotone" dataKey="platformFee" stroke="#3B82F6" strokeWidth={2} strokeDasharray="5 5" dot={{ r: 3 }} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Revenue Stats */}
          <div className="grid md:grid-cols-3 gap-5">
            {[
              { label: "Total Revenue", value: usd(adminStats.platformRevenue), change: "+22.5%", color: "text-emerald-600", bg: "bg-emerald-50" },
              { label: "Platform Fees", value: "$6,458", change: "+22.5%", color: "text-blue-600", bg: "bg-blue-50" },
              { label: "Avg. Transaction", value: "$45.80", change: "+8.2%", color: "text-violet-600", bg: "bg-violet-50" },
            ].map((stat, idx) => (
              <Card key={idx} className="border-0 shadow-md rounded-2xl hover:shadow-lg transition-all">
                <CardContent className="p-6">
                  <p className="text-xs font-bold text-slate-400 uppercase tracking-wider mb-1">{stat.label}</p>
                  <p className={`text-3xl font-black ${stat.color}`}>{stat.value}</p>
                  <Badge variant="outline" className="text-xs font-bold mt-2 rounded-md">{stat.change}</Badge>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      )}

      {/* ══════════════════════════════════════════════════════════════════ */}
      {/* ── SYSTEM TAB ── */}
      {/* ══════════════════════════════════════════════════════════════════ */}
      {activeTab === "system" && (
        <div className="space-y-6">
          <div className="grid lg:grid-cols-2 gap-6">
            {/* System Health */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Activity className="w-5 h-5 text-emerald-500" />
                  System Health
                </CardTitle>
                <CardDescription>Real-time performance metrics</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                {systemHealth.map((item, idx) => (
                  <div key={idx} className="space-y-2">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div
                          className="p-2 rounded-lg"
                          style={{ backgroundColor: `${item.color}15`, color: item.color }}
                        >
                          <item.icon className="w-4 h-4" />
                        </div>
                        <span className="text-sm font-bold text-slate-700">{item.name}</span>
                      </div>
                      <Badge
                        className={`text-[10px] font-bold rounded-md ${item.status === "healthy"
                          ? "bg-emerald-100 text-emerald-700 border-emerald-200"
                          : item.status === "warning"
                            ? "bg-amber-100 text-amber-700 border-amber-200"
                            : "bg-red-100 text-red-700 border-red-200"
                          }`}
                      >
                        {item.value}
                      </Badge>
                    </div>
                    <div className="relative h-1.5 rounded-full bg-slate-100 overflow-hidden">
                      <div
                        className="absolute top-0 left-0 h-full rounded-full transition-all duration-1000"
                        style={{
                          width: item.status === "healthy" ? "100%" : item.status === "warning" ? "70%" : "30%",
                          backgroundColor: item.color,
                        }}
                      />
                    </div>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Quick Actions */}
            <Card className="border-0 shadow-lg rounded-2xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-slate-900">
                  <Settings className="w-5 h-5 text-blue-500" />
                  Quick Actions
                </CardTitle>
                <CardDescription>Common administrative tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-2.5">
                {[
                  { label: "Export Reports", icon: Download, variant: "default" as const },
                  { label: "Manage Users", icon: Users, variant: "outline" as const },
                  { label: "View System Logs", icon: FileText, variant: "outline" as const },
                  { label: "Backup Database", icon: Database, variant: "outline" as const },
                  { label: "System Settings", icon: Settings, variant: "outline" as const },
                  { label: "Force Refresh Cache", icon: RefreshCw, variant: "destructive" as const },
                ].map((action, idx) => (
                  <Button
                    key={idx}
                    variant={action.variant}
                    className={`w-full justify-start rounded-xl font-bold ${action.variant === "default"
                      ? "bg-gradient-to-r from-blue-500 to-blue-600 shadow-md shadow-blue-500/20"
                      : ""
                      }`}
                  >
                    <action.icon className="w-4 h-4 mr-2" />
                    {action.label}
                  </Button>
                ))}
              </CardContent>
            </Card>
          </div>
        </div>
      )}
    </div>
  );
}
