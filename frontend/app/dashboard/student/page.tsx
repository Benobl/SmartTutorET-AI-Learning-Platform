"use client";

import { StudentHeader } from "@/components/dashboards/student/header";
import { StudentSidebar } from "@/components/dashboards/student/sidebar";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import {
  Award,
  BookOpen,
  Calendar,
  Flame,
  Star,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Line,
  LineChart,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

const studyTimeData = [
  { day: "Mon", hours: 2.5 },
  { day: "Tue", hours: 3.2 },
  { day: "Wed", hours: 1.8 },
  { day: "Thu", hours: 4.1 },
  { day: "Fri", hours: 2.9 },
  { day: "Sat", hours: 5.2 },
  { day: "Sun", hours: 3.5 },
];

const progressData = [
  { subject: "Mathematics", progress: 75, color: "hsl(var(--color-primary))" },
  { subject: "English", progress: 82, color: "hsl(var(--color-secondary))" },
  { subject: "Biology", progress: 68, color: "hsl(var(--color-accent))" },
  { subject: "Chemistry", progress: 71, color: "hsl(var(--color-chart-4))" },
];

const TAB_SECTIONS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "progress", label: "Progress", icon: "📈" },
  { id: "subjects", label: "Subjects", icon: "📚" },
  { id: "sessions", label: "Sessions", icon: "📅" },
];

export default function StudentDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredSubject, setHoveredSubject] = useState<number | null>(null);

  return (
    <div className="flex h-screen bg-gray-100">
      <StudentSidebar />

      <div className="flex-1 overflow-auto">
        <StudentHeader />

        <main className="container px-4 md:px-8 py-8 space-y-8">
          {/* Welcome Section */}
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <h1 className="text-3xl md:text-4xl font-bold text-[#1D2637]">
                Welcome back, Alex! 👋
              </h1>
              <p className="text-gray-600">
                You're making excellent progress. Keep pushing forward!
              </p>
            </div>
            <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-green-100 text-green-700">
              <TrendingUp className="w-4 h-4" />
              On Track
            </Badge>
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b border-border pb-4">
            {TAB_SECTIONS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-t-lg font-semibold text-sm transition-all duration-300 ease-out flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-card border-b-2 border-primary text-primary"
                    : "text-muted-foreground hover:text-foreground hover:bg-card/50"
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          {/* Overview Tab */}
          {activeTab === "overview" && (
            <div className="space-y-6">
              {/* Stats Grid */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
                {[
                  {
                    icon: TrendingUp,
                    label: "Study Time",
                    value: "42 hrs",
                    change: "+5 hrs this week",
                    bgColor: "#e8f0ff",
                    iconColor: "#4a90e2",
                  },
                  {
                    icon: Flame,
                    label: "Learning Streak",
                    value: "12 days",
                    change: "Keep it going!",
                    bgColor: "#fff4e6",
                    iconColor: "#f59e0b",
                  },
                  {
                    icon: Award,
                    label: "Average Grade",
                    value: "A-",
                    change: "+2% improvement",
                    bgColor: "#f0f9ff",
                    iconColor: "#0ea5e9",
                  },
                  {
                    icon: Star,
                    label: "Badges Earned",
                    value: "24",
                    change: "+3 new",
                    bgColor: "#ede9fe",
                    iconColor: "#8b5cf6",
                  },
                ].map((stat, idx) => (
                  <div
                    key={idx}
                    className="bg-white rounded-2xl p-6 shadow-md hover:shadow-xl border border-gray-200 transition-all duration-300 hover:scale-105"
                  >
                    <div className="flex flex-col items-center text-center mb-4">
                      <div
                        className="w-16 h-16 rounded-full flex items-center justify-center mb-3"
                        style={{ backgroundColor: stat.bgColor }}
                      >
                        <stat.icon
                          className="w-8 h-8"
                          style={{ color: stat.iconColor }}
                        />
                      </div>
                      <span className="text-xs font-semibold text-emerald-600 bg-emerald-50 px-3 py-1 rounded-full">
                        {stat.change}
                      </span>
                    </div>
                    <p className="text-xs md:text-sm text-gray-500 font-medium uppercase tracking-wide mb-2">
                      {stat.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-[#1a1f36]">
                      {stat.value}
                    </p>
                  </div>
                ))}
              </div>

              {/* Charts Grid */}
              <div className="grid lg:grid-cols-3 gap-6">
                {/* Study Time Chart */}
                <div className="lg:col-span-2 bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-6 shadow-lg border border-blue-100">
                  <div className="mb-4">
                    <h3 className="text-lg font-bold text-[#1D2637]">
                      Study Time Trend
                    </h3>
                    <p className="text-sm text-gray-600">
                      Daily study hours for the past week
                    </p>
                  </div>
                  <div className="h-80 -mx-6 -mb-6">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart
                        data={studyTimeData}
                        margin={{ top: 20, right: 30, left: 0, bottom: 20 }}
                      >
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="rgba(59, 130, 246, 0.2)"
                          vertical={false}
                        />
                        <XAxis
                          dataKey="day"
                          stroke="#64748b"
                          axisLine={{ stroke: "rgba(100, 116, 139, 0.2)" }}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#64748b"
                          axisLine={{ stroke: "rgba(100, 116, 139, 0.2)" }}
                          tickLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid rgba(59, 130, 246, 0.3)",
                            borderRadius: "12px",
                            padding: "12px",
                            boxShadow: "0 4px 20px rgba(0, 0, 0, 0.08)",
                          }}
                          labelStyle={{
                            color: "#1D2637",
                            fontWeight: "600",
                            fontSize: "14px",
                          }}
                          formatter={(value) => [
                            `${value} hours`,
                            "Study Time",
                          ]}
                        />
                        <Bar
                          dataKey="hours"
                          fill="#3b82f6"
                          radius={[8, 8, 0, 0]}
                          stroke="#2563eb"
                          strokeWidth={1}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                {/* Quick Stats */}
                <div className="space-y-4">
                  <div className="card-action shadow-card border border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">
                        Focus Score
                      </h4>
                      <span className="text-2xl font-bold text-accent">
                        87%
                      </span>
                    </div>
                    <Progress value={87} className="h-2" />
                  </div>

                  <div className="card-progress shadow-card border border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">
                        Completion
                      </h4>
                      <span className="text-2xl font-bold text-secondary">
                        62%
                      </span>
                    </div>
                    <Progress value={62} className="h-2" />
                  </div>

                  <div className="card-resource shadow-card border border-border/40 space-y-4">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold text-foreground text-sm">
                        Consistency
                      </h4>
                      <span className="text-2xl font-bold text-primary">
                        94%
                      </span>
                    </div>
                    <Progress value={94} className="h-2" />
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="card-resource shadow-card border border-border/40 space-y-6">
                <div className="flex items-center justify-between">
                  <div>
                    <h3 className="text-lg font-bold text-foreground">
                      AI Recommendations
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      Personalized content based on your learning
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="bg-transparent"
                  >
                    View All
                  </Button>
                </div>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                  {[
                    {
                      title: "Quadratic Equations",
                      type: "Video",
                      duration: "45 min",
                      icon: "📹",
                    },
                    {
                      title: "Photosynthesis",
                      type: "Interactive",
                      duration: "1h",
                      icon: "🔬",
                    },
                    {
                      title: "Essay Writing",
                      type: "PDF",
                      duration: "20 pgs",
                      icon: "📄",
                    },
                    {
                      title: "Chemical Bonds",
                      type: "Quiz",
                      duration: "15 min",
                      icon: "🧪",
                    },
                  ].map((resource, idx) => (
                    <div
                      key={idx}
                      className="p-4 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 hover:shadow-sm transition-all duration-300 cursor-pointer"
                    >
                      <div className="space-y-3 text-center">
                        <span className="text-3xl block">{resource.icon}</span>
                        <div>
                          <h4 className="font-semibold text-sm text-foreground">
                            {resource.title}
                          </h4>
                          <p className="text-xs text-muted-foreground mt-1">
                            {resource.duration}
                          </p>
                        </div>
                        <Badge
                          variant="secondary"
                          className="text-xs font-semibold mx-auto"
                        >
                          {resource.type}
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          )}

          {/* Progress Tab */}
          {activeTab === "progress" && (
            <div className="space-y-6">
              <div className="card-progress shadow-card border border-border/40">
                <div className="mb-6">
                  <h3 className="text-lg font-bold text-foreground mb-2">
                    Subject Progress
                  </h3>
                  <p className="text-sm text-muted-foreground">
                    Your current standing in each subject
                  </p>
                </div>
                <div className="space-y-6">
                  {progressData.map((subject, idx) => (
                    <div
                      key={idx}
                      onMouseEnter={() => setHoveredSubject(idx)}
                      onMouseLeave={() => setHoveredSubject(null)}
                      className={`space-y-2 p-4 rounded-lg transition-all ${hoveredSubject === idx ? "bg-primary/5" : ""}`}
                    >
                      <div className="flex items-center justify-between">
                        <span
                          className={`font-semibold text-sm transition-colors ${
                            hoveredSubject === idx
                              ? "text-primary"
                              : "text-foreground"
                          }`}
                        >
                          {subject.subject}
                        </span>
                        <span className="text-sm font-bold text-primary">
                          {subject.progress}%
                        </span>
                      </div>
                      <Progress value={subject.progress} className="h-3" />
                    </div>
                  ))}
                </div>
              </div>

              <div className="grid md:grid-cols-2 gap-6">
                <div className="card-stats shadow-card border border-border/40">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Weekly Progress
                  </h3>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={studyTimeData}>
                        <CartesianGrid
                          strokeDasharray="3 3"
                          stroke="hsl(var(--color-border))"
                        />
                        <XAxis
                          dataKey="day"
                          stroke="hsl(var(--color-muted-foreground))"
                        />
                        <YAxis stroke="hsl(var(--color-muted-foreground))" />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "hsl(var(--color-card))",
                            border: "1px solid hsl(var(--color-border))",
                            borderRadius: "12px",
                          }}
                        />
                        <Line
                          type="monotone"
                          dataKey="hours"
                          stroke="hsl(var(--color-secondary))"
                          strokeWidth={2}
                          dot={{ fill: "hsl(var(--color-secondary))", r: 4 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="card-achievement shadow-card border border-border/40">
                  <h3 className="text-lg font-bold text-foreground mb-6">
                    Milestones
                  </h3>
                  <div className="space-y-4">
                    {[
                      { label: "100 Study Hours", progress: 75, icon: "🎯" },
                      { label: "Perfect Score", progress: 45, icon: "⭐" },
                      { label: "Streak Master", progress: 80, icon: "🔥" },
                    ].map((milestone, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm font-semibold text-foreground flex items-center gap-2">
                            <span>{milestone.icon}</span> {milestone.label}
                          </span>
                          <span className="text-xs font-bold text-accent">
                            {milestone.progress}%
                          </span>
                        </div>
                        <Progress value={milestone.progress} className="h-2" />
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Subjects Tab */}
          {activeTab === "subjects" && (
            <div className="grid md:grid-cols-2 gap-6">
              {["Mathematics", "English", "Biology", "Chemistry"].map(
                (subject, idx) => (
                  <div
                    key={idx}
                    className="card-stats shadow-card border border-border/40 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h3 className="text-lg font-bold text-foreground">
                        {subject}
                      </h3>
                      <div className="w-10 h-10 rounded-lg flex items-center justify-center bg-primary/10 text-primary border border-primary/20">
                        <BookOpen className="w-5 h-5" />
                      </div>
                    </div>
                    <div className="space-y-3">
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Current Grade
                        </span>
                        <span className="font-bold text-primary">A-</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Topics Completed
                        </span>
                        <span className="font-bold text-secondary">18/24</span>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="text-muted-foreground">
                          Study Hours
                        </span>
                        <span className="font-bold text-accent">42h</span>
                      </div>
                    </div>
                    <Button
                      className="w-full text-sm bg-transparent"
                      variant="outline"
                    >
                      Continue Learning
                    </Button>
                  </div>
                ),
              )}
            </div>
          )}

          {/* Sessions Tab */}
          {activeTab === "sessions" && (
            <div className="space-y-6">
              <div className="card-action shadow-card border border-border/40 space-y-4">
                <h3 className="text-lg font-bold text-foreground">
                  Upcoming Sessions
                </h3>
                {[
                  {
                    tutor: "Sarah Johnson",
                    subject: "Mathematics",
                    time: "Today, 4:00 PM",
                    status: "upcoming",
                  },
                  {
                    tutor: "Ahmed Hassan",
                    subject: "Chemistry",
                    time: "Tomorrow, 2:00 PM",
                    status: "upcoming",
                  },
                  {
                    tutor: "Abeba Tesfaye",
                    subject: "English",
                    time: "Wed, 3:30 PM",
                    status: "upcoming",
                  },
                ].map((session, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border/60 hover:border-primary/50 hover:bg-primary/5 transition-all"
                  >
                    <div className="flex items-start justify-between">
                      <div className="space-y-2 flex-1">
                        <h4 className="font-semibold text-foreground">
                          {session.tutor}
                        </h4>
                        <p className="text-xs text-muted-foreground">
                          {session.subject}
                        </p>
                        <p className="text-xs font-medium text-secondary flex items-center gap-2">
                          <Calendar className="w-3 h-3" /> {session.time}
                        </p>
                      </div>
                      <Button className="text-xs">Join</Button>
                    </div>
                  </div>
                ))}
                <Button className="w-full mt-4 font-semibold">
                  + Book New Session
                </Button>
              </div>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
