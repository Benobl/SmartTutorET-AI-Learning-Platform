"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { TutorSidebar } from "@/components/dashboards/tutor/sidebar"
import { TutorHeader } from "@/components/dashboards/tutor/header"
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar, PieChart, Pie, Cell } from "recharts"
import { Clock, Users, DollarSign, CheckCircle2, Mail, Star, Calendar, TrendingUp, Activity, Shield, Eye, MessageSquare, UserCheck, BarChart3, PieChart as PieChartIcon } from "lucide-react"

const earningsData = [
  { month: "Jan", earnings: 1450, students: 8 },
  { month: "Feb", earnings: 1820, students: 10 },
  { month: "Mar", earnings: 2140, students: 12 },
  { month: "Apr", earnings: 1980, students: 11 },
  { month: "May", earnings: 2560, students: 14 },
  { month: "Jun", earnings: 2340, students: 13 },
  { month: "Jul", earnings: 2870, students: 15 },
]

const subjectDistributionData = [
  { name: "Mathematics", value: 35, color: "#307995" },
  { name: "Physics", value: 25, color: "#4CAF50" },
  { name: "Chemistry", value: 20, color: "#FF9800" },
  { name: "Biology", value: 15, color: "#9C27B0" },
  { name: "Other", value: 5, color: "#F44336" },
]

const studentsData = [
  { name: "Abebe Tadesse", grade: "Grade 10", subject: "Math", status: "Active", rating: 4.8, sessions: 24 },
  { name: "Marta Bekele", grade: "Grade 11", subject: "Physics", status: "Active", rating: 4.9, sessions: 18 },
  { name: "Yohannes Kemal", grade: "Grade 9", subject: "Chemistry", status: "Inactive", rating: 4.7, sessions: 12 },
  { name: "Helen Girma", grade: "Grade 12", subject: "Math", status: "Active", rating: 4.6, sessions: 30 },
  { name: "Samuel Tekle", grade: "Grade 10", subject: "Biology", status: "Active", rating: 4.5, sessions: 15 },
]

const sessionStats = [
  { label: "Completed", value: "42", change: "+8%" },
  { label: "Upcoming", value: "12", change: "+3" },
  { label: "Cancelled", value: "3", change: "-1" },
  { label: "Rescheduled", value: "7", change: "+2" },
]

export default function TutorDashboard() {
  const [tutorStatus] = useState<"pending" | "approved" | "verified">("verified")
  const [hoveredStudent, setHoveredStudent] = useState<number | null>(null)
  const [activeChart, setActiveChart] = useState<"earnings" | "students">("earnings")

  return (
    <div className="flex min-h-screen bg-gradient-to-br from-gray-50 to-blue-50">
      <TutorSidebar />

      <div className="flex-1 overflow-auto">
        <TutorHeader />

        <main className="container px-4 md:px-8 py-8 space-y-8">
          {/* Dashboard Header with Stats */}
          <div className="space-y-6">
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
              <div className="space-y-2">
                <div className="flex items-center gap-3">
                  <h1 className="text-3xl md:text-4xl font-bold text-[#1D2637]">Tutor Dashboard</h1>
                  <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-gradient-to-r from-green-500 to-emerald-600 text-white border-0">
                    <Shield className="w-4 h-4" />
                    <span>PRO</span>
                  </Badge>
                </div>
                <p className="text-gray-600">Monitor your tutoring performance and student engagement</p>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <Badge className="flex items-center gap-2 px-4 py-2 text-base bg-green-100 text-green-700 border border-green-200">
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Verified Tutor</span>
                </Badge>
                <Badge variant="outline" className="px-4 py-2 text-base">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  <span>Rank: Top 5%</span>
                </Badge>
              </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {[
                {
                  icon: Users,
                  label: "Active Students",
                  value: "12",
                  change: "+2 this month",
                  color: "from-blue-500 to-blue-600",
                  bgColor: "bg-blue-50",
                  iconColor: "text-blue-600"
                },
                {
                  icon: DollarSign,
                  label: "Monthly Earnings",
                  value: "$2,870",
                  change: "+12.5% from last month",
                  color: "from-emerald-500 to-emerald-600",
                  bgColor: "bg-emerald-50",
                  iconColor: "text-emerald-600"
                },
                {
                  icon: Star,
                  label: "Average Rating",
                  value: "4.8/5",
                  change: "98% satisfaction",
                  color: "from-amber-500 to-amber-600",
                  bgColor: "bg-amber-50",
                  iconColor: "text-amber-600"
                },
                {
                  icon: Activity,
                  label: "Total Sessions",
                  value: "64",
                  change: "87% completion rate",
                  color: "from-purple-500 to-purple-600",
                  bgColor: "bg-purple-50",
                  iconColor: "text-purple-600"
                },
              ].map((stat, idx) => (
                <Card key={idx} className="overflow-hidden border-0 shadow-lg hover:shadow-xl transition-all duration-300">
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-6">
                      <div className={`p-3 rounded-xl ${stat.bgColor} ${stat.iconColor}`}>
                        <stat.icon className="w-6 h-6" />
                      </div>
                      <Badge variant="secondary" className="text-xs font-medium">
                        {stat.change}
                      </Badge>
                    </div>
                    <div className="space-y-2">
                      <p className="text-sm font-medium text-gray-500 uppercase tracking-wide">
                        {stat.label}
                      </p>
                      <p className="text-2xl md:text-3xl font-bold text-gray-900">{stat.value}</p>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className="grid lg:grid-cols-3 gap-6">
            {/* Left Column - Charts */}
            <div className="lg:col-span-2 space-y-6">
              {/* Earnings/Students Chart */}
              <Card className="border-0 shadow-lg">
                <CardHeader className="pb-3">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                    <div>
                      <CardTitle className="text-xl">Performance Overview</CardTitle>
                      <CardDescription>Monthly earnings and student growth</CardDescription>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant={activeChart === "earnings" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveChart("earnings")}
                        className={`${activeChart === "earnings" ? "bg-gradient-to-r from-blue-500 to-blue-600" : ""}`}
                      >
                        <DollarSign className="w-4 h-4 mr-2" />
                        Earnings
                      </Button>
                      <Button
                        variant={activeChart === "students" ? "default" : "outline"}
                        size="sm"
                        onClick={() => setActiveChart("students")}
                        className={`${activeChart === "students" ? "bg-gradient-to-r from-emerald-500 to-emerald-600" : ""}`}
                      >
                        <Users className="w-4 h-4 mr-2" />
                        Students
                      </Button>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="h-80">
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={earningsData}>
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
                            boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                          }}
                          formatter={(value) => [`$${value}`, "Earnings"]}
                        />
                        <Bar
                          dataKey={activeChart === "earnings" ? "earnings" : "students"}
                          fill={activeChart === "earnings" ? "#307995" : "#4CAF50"}
                          radius={[4, 4, 0, 0]}
                        />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </CardContent>
              </Card>

              {/* Session Statistics */}
              <div className="grid md:grid-cols-4 gap-4">
                {sessionStats.map((stat, idx) => (
                  <Card key={idx} className="border-0 shadow-md hover:shadow-lg transition-shadow">
                    <CardContent className="p-4">
                      <div className="text-center space-y-2">
                        <p className="text-sm text-gray-500 font-medium">{stat.label}</p>
                        <p className="text-2xl font-bold text-gray-900">{stat.value}</p>
                        <Badge variant="outline" className={`text-xs ${stat.change.startsWith('+') ? 'text-green-600' : 'text-red-600'}`}>
                          {stat.change}
                        </Badge>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>

              {/* Students Table */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <UserCheck className="w-5 h-5" />
                    My Students
                  </CardTitle>
                  <CardDescription>Active and inactive students with their performance metrics</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="overflow-x-auto">
                    <table className="w-full">
                      <thead>
                        <tr className="border-b">
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Student</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Grade & Subject</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Status</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Rating</th>
                          <th className="text-left py-3 px-4 text-sm font-medium text-gray-500">Sessions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {studentsData.map((student, idx) => (
                          <tr
                            key={idx}
                            className="border-b hover:bg-gray-50 transition-colors"
                            onMouseEnter={() => setHoveredStudent(idx)}
                            onMouseLeave={() => setHoveredStudent(null)}
                          >
                            <td className="py-3 px-4">
                              <div className="font-medium text-gray-900">{student.name}</div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm text-gray-600">
                                {student.grade} - {student.subject}
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <Badge
                                className={`${student.status === "Active"
                                  ? "bg-green-100 text-green-700 border-green-200"
                                  : "bg-gray-100 text-gray-700 border-gray-200"
                                }`}
                              >
                                {student.status}
                              </Badge>
                            </td>
                            <td className="py-3 px-4">
                              <div className="flex items-center gap-1">
                                <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                                <span className="font-bold text-gray-900">{student.rating}</span>
                              </div>
                            </td>
                            <td className="py-3 px-4">
                              <div className="text-sm font-medium text-gray-900">{student.sessions}</div>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                  <Button variant="outline" className="w-full mt-4">
                    View All Students
                  </Button>
                </CardContent>
              </Card>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Subject Distribution */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <PieChartIcon className="w-5 h-5" />
                    Subject Distribution
                  </CardTitle>
                  <CardDescription>Subjects taught by popularity</CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="h-64">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={subjectDistributionData}
                          cx="50%"
                          cy="50%"
                          labelLine={false}
                          label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                          outerRadius={80}
                          fill="#8884d8"
                          dataKey="value"
                        >
                          {subjectDistributionData.map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry.color} />
                          ))}
                        </Pie>
                        <Tooltip
                          formatter={(value) => [`${value}%`, "Share"]}
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

              {/* Messages */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-blue-50 to-white">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MessageSquare className="w-5 h-5 text-blue-600" />
                    Recent Messages
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      from: "Abebe Tadesse",
                      message: "Can we schedule an extra session for trigonometry?",
                      time: "2 mins ago",
                      unread: true
                    },
                    {
                      from: "Marta Bekele",
                      message: "Thank you for the help with the physics problem!",
                      time: "1 hour ago",
                      unread: false
                    },
                    {
                      from: "Parent - Mr. Tekle",
                      message: "Regarding Samuel's progress report...",
                      time: "3 hours ago",
                      unread: true
                    },
                  ].map((msg, idx) => (
                    <div
                      key={idx}
                      className={`p-4 rounded-lg border space-y-2 transition-all hover:shadow-md ${msg.unread ? 'bg-white border-blue-200' : 'bg-gray-50 border-gray-200'}`}
                    >
                      <div className="flex items-start justify-between">
                        <p className="font-semibold text-gray-900">{msg.from}</p>
                        {msg.unread && (
                          <div className="w-2 h-2 rounded-full bg-blue-500"></div>
                        )}
                      </div>
                      <p className="text-sm text-gray-600 line-clamp-2">{msg.message}</p>
                      <p className="text-xs text-gray-500">{msg.time}</p>
                    </div>
                  ))}
                  <Button className="w-full bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700">
                    Reply to All Messages
                  </Button>
                </CardContent>
              </Card>

              {/* Upcoming Sessions */}
              <Card className="border-0 shadow-lg">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Clock className="w-5 h-5 text-purple-600" />
                    Upcoming Sessions
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {[
                    {
                      student: "Abebe Tadesse",
                      time: "Today, 4:00 PM",
                      subject: "Mathematics",
                      duration: "1.5 hours",
                      type: "Online"
                    },
                    {
                      student: "Marta Bekele",
                      time: "Tomorrow, 2:00 PM",
                      subject: "Physics",
                      duration: "2 hours",
                      type: "In-person"
                    },
                    {
                      student: "Helen Girma",
                      time: "Tomorrow, 5:00 PM",
                      subject: "Calculus",
                      duration: "1 hour",
                      type: "Online"
                    },
                  ].map((session, idx) => (
                    <div key={idx} className="p-4 rounded-lg border border-gray-200 space-y-2 hover:bg-gray-50 transition-colors">
                      <div className="flex items-start justify-between">
                        <div>
                          <p className="font-semibold text-gray-900">{session.student}</p>
                          <p className="text-sm text-gray-600">{session.subject}</p>
                        </div>
                        <Badge variant="outline" className="text-xs">
                          {session.type}
                        </Badge>
                      </div>
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium text-purple-600">{session.time}</span>
                        <span className="text-gray-500">{session.duration}</span>
                      </div>
                    </div>
                  ))}
                </CardContent>
              </Card>

              {/* Profile Strength */}
              <Card className="border-0 shadow-lg bg-gradient-to-br from-gray-50 to-white">
                <CardHeader>
                  <CardTitle>Profile Strength</CardTitle>
                  <CardDescription>Complete your profile to attract more students</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Profile Completeness</span>
                      <span className="font-bold text-green-600">92%</span>
                    </div>
                    <Progress value={92} className="h-2 bg-gray-200" />
                  </div>
                  <div className="space-y-2">
                    <div className="flex justify-between text-sm">
                      <span className="font-medium text-gray-700">Response Rate</span>
                      <span className="font-bold text-blue-600">98%</span>
                    </div>
                    <Progress value={98} className="h-2 bg-gray-200" />
                  </div>
                  <Button variant="outline" className="w-full">
                    Complete Profile
                  </Button>
                </CardContent>
              </Card>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
