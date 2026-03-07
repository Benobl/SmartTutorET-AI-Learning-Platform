"use client";

import { AdminHeader } from "@/components/dashboards/admin/header";
import { AdminSidebar } from "@/components/dashboards/admin/sidebar";
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
import {
  Activity,
  AlertCircle,
  BarChart3,
  BookOpen,
  Clock,
  Cpu,
  Database,
  DollarSign,
  Download,
  Eye,
  FileText,
  Filter,
  MessageSquare,
  Network,
  PieChart as PieChartIcon,
  RefreshCw,
  Server, Star,
  Settings,
  Shield,
  TrendingUp,
  Users,
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

const userGrowthData = [
  { month: "Jan", students: 150, tutors: 12, instructors: 5, revenue: 4250 },
  { month: "Feb", students: 280, tutors: 24, instructors: 8, revenue: 6820 },
  { month: "Mar", students: 420, tutors: 35, instructors: 12, revenue: 10250 },
  { month: "Apr", students: 580, tutors: 48, instructors: 18, revenue: 14580 },
  { month: "May", students: 750, tutors: 62, instructors: 25, revenue: 18750 },
  { month: "Jun", students: 920, tutors: 78, instructors: 32, revenue: 23420 },
  { month: "Jul", students: 1120, tutors: 94, instructors: 40, revenue: 28900 },
  {
    month: "Aug",
    students: 1350,
    tutors: 112,
    instructors: 48,
    revenue: 34500,
  },
  {
    month: "Sep",
    students: 1620,
    tutors: 130,
    instructors: 55,
    revenue: 41200,
  },
  {
    month: "Oct",
    students: 1920,
    tutors: 150,
    instructors: 62,
    revenue: 48500,
  },
  {
    month: "Nov",
    students: 2250,
    tutors: 172,
    instructors: 70,
    revenue: 56200,
  },
  {
    month: "Dec",
    students: 2540,
    tutors: 195,
    instructors: 78,
    revenue: 64580,
  },
];

const tutorApplicationsData = [
  { status: "Pending Review", count: 8, color: "#FF9800" },
  { status: "Approved", count: 45, color: "#4CAF50" },
  { status: "Interview", count: 5, color: "#2196F3" },
  { status: "Rejected", count: 3, color: "#F44336" },
  { status: "On Hold", count: 2, color: "#9C27B0" },
];

const userDistributionData = [
  { type: "Students", count: 2540, color: "#307995", percentage: 89 },
  { type: "Tutors", count: 195, color: "#4CAF50", percentage: 7 },
  { type: "Instructors", count: 78, color: "#9C27B0", percentage: 3 },
  { type: "Admins", count: 12, color: "#FF9800", percentage: 1 },
];

const pendingApplications = [
  {
    id: 1,
    name: "Dr. Alemayehu Tekle",
    subjects: ["Mathematics", "Physics"],
    appliedDate: "2024-01-15",
    status: "pending",
    rating: 4.8,
    experience: "8 years",
    country: "Ethiopia",
    priority: "high",
  },
  {
    id: 2,
    name: "Aster Gebre",
    subjects: ["Biology", "Chemistry"],
    appliedDate: "2024-01-18",
    status: "pending",
    rating: 4.9,
    experience: "6 years",
    country: "Ethiopia",
    priority: "medium",
  },
  {
    id: 3,
    name: "Sarah Johnson",
    subjects: ["English Literature"],
    appliedDate: "2024-01-20",
    status: "pending",
    rating: 4.6,
    experience: "10 years",
    country: "USA",
    priority: "low",
  },
  {
    id: 4,
    name: "Michael Chen",
    subjects: ["Computer Science", "Mathematics"],
    appliedDate: "2024-01-22",
    status: "pending",
    rating: 4.7,
    experience: "5 years",
    country: "Canada",
    priority: "high",
  },
];

const systemHealth = [
  {
    name: "Server Status",
    status: "healthy",
    value: "99.8%",
    icon: Server,
    color: "#4CAF50",
  },
  {
    name: "Database",
    status: "healthy",
    value: "100%",
    icon: Database,
    color: "#2196F3",
  },
  {
    name: "API Response",
    status: "warning",
    value: "120ms",
    icon: Cpu,
    color: "#FF9800",
  },
  {
    name: "Uptime",
    status: "healthy",
    value: "45 days",
    icon: Clock,
    color: "#9C27B0",
  },
  {
    name: "Memory Usage",
    status: "healthy",
    value: "68%",
    icon: Activity,
    color: "#607D8B",
  },
  {
    name: "Network",
    status: "healthy",
    value: "1.2Gbps",
    icon: Network,
    color: "#795548",
  },
];

const contentFlags = [
  {
    id: 1,
    type: "Inappropriate Content",
    reported: 2,
    severity: "medium",
    timestamp: "2h ago",
    status: "pending",
  },
  {
    id: 2,
    type: "Spam Messages",
    reported: 5,
    severity: "low",
    timestamp: "4h ago",
    status: "resolved",
  },
  {
    id: 3,
    type: "Copyright Violation",
    reported: 1,
    severity: "high",
    timestamp: "6h ago",
    status: "pending",
  },
  {
    id: 4,
    type: "Harassment Report",
    reported: 3,
    severity: "high",
    timestamp: "1d ago",
    status: "investigating",
  },
  {
    id: 5,
    type: "Fake Profile",
    reported: 4,
    severity: "medium",
    timestamp: "2d ago",
    status: "resolved",
  },
];

const revenueData = [
  { month: "Jan", revenue: 4250, platformFee: 425 },
  { month: "Feb", revenue: 6820, platformFee: 682 },
  { month: "Mar", revenue: 10250, platformFee: 1025 },
  { month: "Apr", revenue: 14580, platformFee: 1458 },
  { month: "May", revenue: 18750, platformFee: 1875 },
  { month: "Jun", revenue: 23420, platformFee: 2342 },
  { month: "Jul", revenue: 28900, platformFee: 2890 },
  { month: "Aug", revenue: 34500, platformFee: 3450 },
  { month: "Sep", revenue: 41200, platformFee: 4120 },
  { month: "Oct", revenue: 48500, platformFee: 4850 },
  { month: "Nov", revenue: 56200, platformFee: 5620 },
  { month: "Dec", revenue: 64580, platformFee: 6458 },
];

const ADMIN_TABS = [
  { id: "overview", label: "Overview", icon: "📊" },
  { id: "users", label: "Users", icon: "👥" },
  { id: "tutors", label: "Tutors", icon: "🎓" },
  { id: "moderation", label: "Moderation", icon: "🛡️" },
  { id: "revenue", label: "Revenue", icon: "💰" },
  { id: "system", label: "System", icon: "⚙️" },
];

export default function AdminDashboard() {
  const [activeTab, setActiveTab] = useState("overview");
  const [hoveredApplication, setHoveredApplication] = useState<number | null>(
    null,
  );
  const [dateRange, setDateRange] = useState("year");

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <AdminSidebar />

      <div className="flex-1 overflow-auto">
        <AdminHeader />

        <main className="container px-4 md:px-8 py-8 space-y-8">
          {/* Header Section */}
          <div className="space-y-4">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <h1 className="text-3xl md:text-4xl font-bold text-[#1D2637]">
                  Admin Dashboard
                </h1>
                <p className="text-gray-600">
                  Monitor platform performance, manage users, and track system
                  health
                </p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-gradient-to-r from-blue-500 to-blue-600 text-white border-0">
                  <Shield className="w-4 h-4" />
                  <span>Admin Panel</span>
                </Badge>
                <Button variant="outline" className="gap-2">
                  <Download className="w-4 h-4" />
                  Export Report
                </Button>
              </div>
            </div>

            {/* Date Range Filter */}
            <div className="flex items-center justify-between bg-white p-4 rounded-lg border shadow-sm">
              <div className="flex items-center gap-2">
                <Filter className="w-4 h-4 text-gray-500" />
                <span className="text-sm font-medium text-gray-700">
                  Filter by:
                </span>
              </div>
              <div className="flex gap-2">
                {["day", "week", "month", "year"].map((range) => (
                  <Button
                    key={range}
                    variant={dateRange === range ? "default" : "outline"}
                    size="sm"
                    onClick={() => setDateRange(range)}
                    className={`capitalize ${dateRange === range ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}`}
                  >
                    {range}
                  </Button>
                ))}
              </div>
            </div>
          </div>

          {/* Stats Overview */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {[
              {
                icon: Users,
                label: "Total Users",
                value: "2,825",
                change: "+15.2%",
                color: "from-blue-500 to-blue-600",
                bgColor: "bg-blue-50",
                iconColor: "text-blue-600",
              },
              {
                icon: BookOpen,
                label: "Active Courses",
                value: "84",
                change: "+8 courses",
                color: "from-emerald-500 to-emerald-600",
                bgColor: "bg-emerald-50",
                iconColor: "text-emerald-600",
              },
              {
                icon: DollarSign,
                label: "Platform Revenue",
                value: "$24,580",
                change: "+22.5%",
                color: "from-purple-500 to-purple-600",
                bgColor: "bg-purple-50",
                iconColor: "text-purple-600",
              },
              {
                icon: AlertCircle,
                label: "Pending Actions",
                value: "16",
                change: "3 high priority",
                color: "from-amber-500 to-amber-600",
                bgColor: "bg-amber-50",
                iconColor: "text-amber-600",
              },
            ].map((metric, idx) => (
              <Card
                key={idx}
                className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-6">
                    <div
                      className={`p-3 rounded-xl ${metric.bgColor} ${metric.iconColor}`}
                    >
                      <metric.icon className="w-6 h-6" />
                    </div>
                    <Badge variant="secondary" className="text-xs font-medium">
                      {metric.change}
                    </Badge>
                  </div>
                  <div className="space-y-2">
                    <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                      {metric.label}
                    </p>
                    <p className="text-2xl md:text-3xl font-bold text-gray-900">
                      {metric.value}
                    </p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Tab Navigation */}
          <div className="flex flex-wrap gap-2 border-b-2 border-gray-200 pb-4">
            {ADMIN_TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`px-6 py-3 rounded-lg font-semibold text-sm transition-all duration-300 ease-out flex items-center gap-2 ${
                  activeTab === tab.id
                    ? "bg-gradient-to-r from-blue-500 to-blue-600 text-white shadow-lg"
                    : "text-gray-600 hover:text-blue-600 hover:bg-gray-50"
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
              <div className="grid lg:grid-cols-2 gap-6">
                {/* User Growth Chart */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <TrendingUp className="w-5 h-5 text-blue-600" />
                      User Growth Trend
                    </CardTitle>
                    <CardDescription>
                      Monthly platform growth statistics
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <AreaChart data={userGrowthData}>
                          <CartesianGrid
                            strokeDasharray="3 3"
                            stroke="#f0f0f0"
                          />
                          <XAxis
                            dataKey="month"
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                          />
                          <YAxis
                            stroke="#666"
                            fontSize={12}
                            tickLine={false}
                            axisLine={false}
                          />
                          <Tooltip
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                              boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                            }}
                          />
                          <Area
                            type="monotone"
                            dataKey="students"
                            stroke="#307995"
                            fill="#307995"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                          <Area
                            type="monotone"
                            dataKey="tutors"
                            stroke="#4CAF50"
                            fill="#4CAF50"
                            fillOpacity={0.2}
                            strokeWidth={2}
                          />
                        </AreaChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* User Distribution */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <PieChartIcon className="w-5 h-5 text-purple-600" />
                      User Distribution
                    </CardTitle>
                    <CardDescription>
                      Platform user type breakdown
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={userDistributionData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ type, percentage }) =>
                              `${type}: ${percentage}%`
                            }
                            outerRadius={100}
                            innerRadius={60}
                            dataKey="count"
                          >
                            {userDistributionData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [`${value} users`, "Count"]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>
              </div>

              {/* Quick Stats */}
              <div className="grid md:grid-cols-4 gap-4">
                {[
                  {
                    label: "Avg. Session Time",
                    value: "45 min",
                    change: "+5min",
                    icon: Clock,
                  },
                  {
                    label: "Avg. Rating",
                    value: "4.8/5",
                    change: "+0.2",
                    icon: Star,
                  },
                  {
                    label: "Success Rate",
                    value: "94%",
                    change: "+2%",
                    icon: TrendingUp,
                  },
                  {
                    label: "Support Tickets",
                    value: "18",
                    change: "-5",
                    icon: MessageSquare,
                  },
                ].map((stat, idx) => (
                  <Card
                    key={idx}
                    className="border-0 shadow-md hover:shadow-lg transition-shadow"
                  >
                    <CardContent className="p-6">
                      <div className="flex items-center gap-3 mb-4">
                        <div className="p-2 rounded-lg bg-gray-100 text-gray-700">
                          <stat.icon className="w-5 h-5" />
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                      <div className="space-y-1">
                        <p className="text-sm font-medium text-gray-500">
                          {stat.label}
                        </p>
                        <p className="text-2xl font-bold text-gray-900">
                          {stat.value}
                        </p>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* Users Tab */}
          {activeTab === "users" && (
            <div className="space-y-6">
              <div className="grid md:grid-cols-3 gap-6">
                {userDistributionData.map((user, idx) => (
                  <Card key={idx} className="border-0 shadow-lg">
                    <CardContent className="p-6">
                      <div className="flex items-center justify-between mb-4">
                        <div className="space-y-1">
                          <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                            {user.type}
                          </p>
                          <p className="text-3xl font-bold text-gray-900">
                            {user.count.toLocaleString()}
                          </p>
                        </div>
                        <div
                          className="w-12 h-12 rounded-lg flex items-center justify-center"
                          style={{ backgroundColor: `${user.color}20` }}
                        >
                          <span
                            className="text-xl"
                            style={{ color: user.color }}
                          >
                            {user.type === "Students"
                              ? "📚"
                              : user.type === "Tutors"
                                ? "🎓"
                                : user.type === "Instructors"
                                  ? "👨‍🏫"
                                  : "🔐"}
                          </span>
                        </div>
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Percentage</span>
                          <span
                            className="font-bold"
                            style={{ color: user.color }}
                          >
                            {user.percentage}%
                          </span>
                        </div>
                        <Progress
                          value={user.percentage}
                          className="h-2"
                          style={{ backgroundColor: `${user.color}20` }}
                        />
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* User Activity Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Activity className="w-5 h-5 text-emerald-600" />
                    Daily Active Users
                  </CardTitle>
                  <CardDescription>
                    Last 30 days user engagement
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={userGrowthData.slice(-6)}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                        />
                        <Bar
                          dataKey="students"
                          fill="#307995"
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>
            </div>
          )}

          {/* Tutors Tab */}
          {activeTab === "tutors" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* Applications Pipeline */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <BarChart3 className="w-5 h-5 text-blue-600" />
                      Applications Pipeline
                    </CardTitle>
                    <CardDescription>
                      Tutor application status distribution
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <div className="h-80">
                      <ResponsiveContainer width="100%" height="100%">
                        <PieChart>
                          <Pie
                            data={tutorApplicationsData}
                            cx="50%"
                            cy="50%"
                            labelLine={false}
                            label={({ status, count }) => `${status}: ${count}`}
                            outerRadius={100}
                            innerRadius={50}
                            dataKey="count"
                          >
                            {tutorApplicationsData.map((entry, index) => (
                              <Cell key={`cell-${index}`} fill={entry.color} />
                            ))}
                          </Pie>
                          <Tooltip
                            formatter={(value) => [
                              `${value} applications`,
                              "Count",
                            ]}
                            contentStyle={{
                              backgroundColor: "white",
                              border: "1px solid #e5e7eb",
                              borderRadius: "8px",
                            }}
                          />
                          <Legend />
                        </PieChart>
                      </ResponsiveContainer>
                    </div>
                  </CardContent>
                </Card>

                {/* Pending Applications */}
                <Card className="border-0 shadow-lg">
                  <CardHeader className="flex flex-row items-center justify-between">
                    <div>
                      <CardTitle>Pending Applications</CardTitle>
                      <CardDescription>
                        Require immediate attention
                      </CardDescription>
                    </div>
                    <Badge
                      variant="outline"
                      className="bg-amber-50 text-amber-700 border-amber-200"
                    >
                      8 Pending
                    </Badge>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {pendingApplications.map((app) => (
                      <div
                        key={app.id}
                        onMouseEnter={() => setHoveredApplication(app.id)}
                        onMouseLeave={() => setHoveredApplication(null)}
                        className={`p-4 rounded-lg border transition-all ${
                          hoveredApplication === app.id
                            ? "border-blue-200 bg-blue-50 shadow-md"
                            : "border-gray-200"
                        }`}
                      >
                        <div className="flex items-start justify-between">
                          <div className="flex-1 space-y-2">
                            <div className="flex items-center gap-2">
                              <h4 className="font-semibold text-gray-900">
                                {app.name}
                              </h4>
                              <Badge
                                className={`text-xs ${
                                  app.priority === "high"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : app.priority === "medium"
                                      ? "bg-amber-100 text-amber-700 border-amber-200"
                                      : "bg-blue-100 text-blue-700 border-blue-200"
                                }`}
                              >
                                {app.priority}
                              </Badge>
                            </div>
                            <p className="text-sm text-gray-600">
                              {app.subjects.join(", ")}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-500">
                              <span>⭐ {app.rating}</span>
                              <span>📅 {app.experience}</span>
                              <span>📍 {app.country}</span>
                            </div>
                            <p className="text-xs text-gray-400">
                              Applied: {app.appliedDate}
                            </p>
                          </div>
                          <div className="flex flex-col gap-2">
                            <Button
                              size="sm"
                              className="bg-gradient-to-r from-blue-500 to-blue-600"
                            >
                              Review
                            </Button>
                            <Button size="sm" variant="outline">
                              <Eye className="w-3 h-3 mr-1" />
                              View
                            </Button>
                          </div>
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>
              </div>
            </div>
          )}

          {/* Moderation Tab */}
          {activeTab === "moderation" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div>
                      <CardTitle className="flex items-center gap-2">
                        <Shield className="w-5 h-5 text-purple-600" />
                        Content Moderation
                      </CardTitle>
                      <CardDescription>
                        Recent content flags and reports
                      </CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm">
                        <RefreshCw className="w-3 h-3 mr-1" />
                        Refresh
                      </Button>
                      <Button
                        size="sm"
                        className="bg-gradient-to-r from-purple-500 to-purple-600"
                      >
                        <Filter className="w-3 h-3 mr-1" />
                        Filter
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Type
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Reports
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Severity
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Status
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Timestamp
                          </th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">
                            Actions
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        {contentFlags.map((flag) => (
                          <tr
                            key={flag.id}
                            className="border-b hover:bg-gray-50 transition-colors"
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">
                                {flag.type}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge variant="outline" className="bg-gray-100">
                                {flag.reported} reports
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={`text-xs ${
                                  flag.severity === "high"
                                    ? "bg-red-100 text-red-700 border-red-200"
                                    : flag.severity === "medium"
                                      ? "bg-amber-100 text-amber-700 border-amber-200"
                                      : "bg-green-100 text-green-700 border-green-200"
                                }`}
                              >
                                {flag.severity}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                variant="outline"
                                className={`text-xs ${
                                  flag.status === "pending"
                                    ? "bg-blue-50 text-blue-700 border-blue-200"
                                    : flag.status === "resolved"
                                      ? "bg-green-50 text-green-700 border-green-200"
                                      : "bg-purple-50 text-purple-700 border-purple-200"
                                }`}
                              >
                                {flag.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-500">
                                {flag.timestamp}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex gap-2">
                                <Button size="sm" variant="outline">
                                  Review
                                </Button>
                                <Button size="sm" variant="ghost">
                                  <Eye className="w-3 h-3" />
                                </Button>
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

          {/* Revenue Tab */}
          {activeTab === "revenue" && (
            <div className="space-y-6">
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-emerald-600" />
                    Revenue Overview
                  </CardTitle>
                  <CardDescription>
                    Monthly revenue and platform fees
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={revenueData}>
                        <CartesianGrid strokeDasharray="3 3" stroke="#f0f0f0" />
                        <XAxis
                          dataKey="month"
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                        />
                        <YAxis
                          stroke="#666"
                          fontSize={12}
                          tickLine={false}
                          axisLine={false}
                        />
                        <Tooltip
                          contentStyle={{
                            backgroundColor: "white",
                            border: "1px solid #e5e7eb",
                            borderRadius: "8px",
                          }}
                          formatter={(value) => [`$${value}`, "Amount"]}
                        />
                        <Legend />
                        <Line
                          type="monotone"
                          dataKey="revenue"
                          stroke="#4CAF50"
                          strokeWidth={3}
                          dot={{ r: 4 }}
                          activeDot={{ r: 6 }}
                        />
                        <Line
                          type="monotone"
                          dataKey="platformFee"
                          stroke="#2196F3"
                          strokeWidth={2}
                          strokeDasharray="5 5"
                          dot={{ r: 3 }}
                        />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Revenue Stats */}
              <div className="grid md:grid-cols-3 gap-4">
                {[
                  {
                    label: "Total Revenue",
                    value: "$64,580",
                    change: "+22.5%",
                    color: "text-emerald-600",
                  },
                  {
                    label: "Platform Fees",
                    value: "$6,458",
                    change: "+22.5%",
                    color: "text-blue-600",
                  },
                  {
                    label: "Avg. Transaction",
                    value: "$45.80",
                    change: "+8.2%",
                    color: "text-purple-600",
                  },
                ].map((stat, idx) => (
                  <Card key={idx} className="border-0 shadow-md">
                    <CardContent className="p-6">
                      <div className="space-y-2">
                        <p className="text-sm font-medium text-gray-500">
                          {stat.label}
                        </p>
                        <p className={`text-2xl font-bold ${stat.color}`}>
                          {stat.value}
                        </p>
                        <Badge variant="outline" className="text-xs">
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          )}

          {/* System Tab */}
          {activeTab === "system" && (
            <div className="space-y-6">
              <div className="grid lg:grid-cols-2 gap-6">
                {/* System Health */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Activity className="w-5 h-5 text-emerald-600" />
                      System Health
                    </CardTitle>
                    <CardDescription>
                      Real-time system performance metrics
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    {systemHealth.map((item, idx) => (
                      <div key={idx} className="space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-3">
                            <div
                              className="p-2 rounded-lg"
                              style={{
                                backgroundColor: `${item.color}20`,
                                color: item.color,
                              }}
                            >
                              <item.icon className="w-4 h-4" />
                            </div>
                            <span className="text-sm font-medium text-gray-700">
                              {item.name}
                            </span>
                          </div>
                          <Badge
                            className={`text-xs ${
                              item.status === "healthy"
                                ? "bg-green-100 text-green-700 border-green-200"
                                : item.status === "warning"
                                  ? "bg-amber-100 text-amber-700 border-amber-200"
                                  : "bg-red-100 text-red-700 border-red-200"
                            }`}
                          >
                            {item.value}
                          </Badge>
                        </div>
                        <div className="relative h-2 rounded-full bg-gray-200 overflow-hidden">
                          <div
                            className="absolute top-0 left-0 h-full rounded-full"
                            style={{
                              width:
                                item.status === "healthy"
                                  ? "100%"
                                  : item.status === "warning"
                                    ? "70%"
                                    : "30%",
                              backgroundColor: item.color,
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </CardContent>
                </Card>

                {/* Quick Actions */}
                <Card className="border-0 shadow-lg">
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <Settings className="w-5 h-5 text-blue-600" />
                      Quick Actions
                    </CardTitle>
                    <CardDescription>
                      Common administrative tasks
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {[
                      {
                        label: "Export Reports",
                        icon: Download,
                        variant: "default",
                      },
                      {
                        label: "Manage Users",
                        icon: Users,
                        variant: "outline",
                      },
                      {
                        label: "View System Logs",
                        icon: FileText,
                        variant: "outline",
                      },
                      {
                        label: "Backup Database",
                        icon: Database,
                        variant: "outline",
                      },
                      {
                        label: "System Settings",
                        icon: Settings,
                        variant: "outline",
                      },
                      {
                        label: "Force Refresh Cache",
                        icon: RefreshCw,
                        variant: "destructive",
                      },
                    ].map((action, idx) => (
                      <Button
                        key={idx}
                        variant={action.variant as any}
                        className={`w-full justify-start ${action.variant === "default" ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}`}
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
        </main>
      </div>
    </div>
  );
}
