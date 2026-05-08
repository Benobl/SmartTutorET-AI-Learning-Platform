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
    <div className="space-y-8">

      {/* HEADER */}
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-black uppercase">
            Admin <span className="text-sky-500">Dashboard</span>
          </h1>
          <p className="text-sm text-slate-400">
            Platform Monitoring & Status
          </p>
        </div>

        <Button variant="outline" className="gap-2">
          <Download className="w-4 h-4" />
          Export
        </Button>
      </div>

      {/* STATS */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
        {statCards.map((s, i) => (
          <Card key={i}>
            <CardContent className="p-6">
              <div className="flex justify-between">
                <div className={cn("p-3 rounded-xl", s.bg, s.color)}>
                  <s.icon className="w-5 h-5" />
                </div>
              </div>
              <p className="text-xs font-bold text-slate-400 mt-3 uppercase">
                {s.label}
              </p>
              <p className="text-2xl font-black">{s.value}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* CHART */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-sky-500" />
            Growth Analytics
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-72">
            <ResponsiveContainer width="100%" height="100%">
              <AreaChart data={analytics}>
                <XAxis dataKey="month" />
                <Tooltip />
                <Area
                  type="monotone"
                  dataKey="students"
                  stroke="#0ea5e9"
                  fill="#e0f2fe"
                />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* TUTOR APPROVAL */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="w-5 h-5 text-rose-500" />
            Tutor Applications
          </CardTitle>
        </CardHeader>

        <CardContent>
          <div className="space-y-4">
            {loading && <p>Loading...</p>}

            {!loading &&
              applications.map((app) => (
                <div
                  key={app._id}
                  className="flex justify-between items-center border p-4 rounded-xl"
                >
                  <div>
                    <p className="font-bold">{app.name}</p>
                    <p className="text-xs text-slate-400">{app.email}</p>
                  </div>

                  <div className="flex gap-2">
                    <Button
                      onClick={() => handleApproveTutor(app._id)}
                      className="bg-emerald-500"
                    >
                      Approve
                    </Button>
                    <Button
                      onClick={() => handleRejectTutor(app._id)}
                      variant="outline"
                    >
                      Reject
                    </Button>
                  </div>
                </div>
              ))}
          </div>
        </CardContent>
      </Card>

    </div>
  );
}