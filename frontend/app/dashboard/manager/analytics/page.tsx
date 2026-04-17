"use client"

import {
    BarChart3,
    TrendingUp,
    Users,
    BookOpen,
    Briefcase,
    ArrowUpRight,
    ArrowDownRight,
    PieChart as PieChartIcon,
    Calendar,
    Filter,
    Download
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
    AreaChart,
    Area,
    XAxis,
    YAxis,
    CartesianGrid,
    Tooltip,
    ResponsiveContainer,
    BarChart,
    Bar,
    PieChart,
    Pie,
    Cell
} from 'recharts'
import { getFullExportData, exportToPDF } from "@/lib/manager-utils"
import { toast } from "sonner"

const enrollmentData = [
    { name: 'Jan', students: 400, tutors: 24 },
    { name: 'Feb', students: 520, tutors: 28 },
    { name: 'Mar', students: 480, tutors: 26 },
    { name: 'Apr', students: 610, tutors: 32 },
    { name: 'May', students: 780, tutors: 40 },
    { name: 'Jun', students: 950, tutors: 45 },
]

const courseDistData = [
    { name: 'Mathematics', value: 400 },
    { name: 'Physics', value: 300 },
    { name: 'English', value: 300 },
    { name: 'Biology', value: 200 },
]

const COLORS = ['#3b82f6', '#4f46e5', '#8b5cf6', '#ec4899']

export default function ManagerAnalytics() {

    const handleExport = () => {
        toast.success("Strategic data report generated.")
    }

    return (
        <div className="space-y-10 animate-in fade-in duration-700 pb-20 relative">
            {/* Mesh Background Accent */}
            <div className="absolute -top-20 -right-20 w-96 h-96 bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

            {/* Header */}
            <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-8 px-1">
                <div className="space-y-2">
                    <h1 className="text-4xl font-black text-slate-800 tracking-tight">Institutional <span className="text-blue-500">Intelligence</span></h1>
                    <p className="text-slate-400 font-medium">Quantify organizational performance and academic trajectory.</p>
                </div>
                <div className="flex items-center gap-4">
                    <Button
                        variant="outline"
                        onClick={handleExport}
                        className="bg-white border-slate-200 hover:bg-slate-50 text-slate-600 rounded-[20px] gap-2 font-black px-8 h-14 text-[11px] uppercase tracking-widest transition-all shadow-sm"
                    >
                        <Download className="w-5 h-5" />
                        Export Data
                    </Button>
                </div>
            </div>

            {/* Core Metrics */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 relative z-10">
                <Card className="bg-white border-slate-100 rounded-[35px] shadow-sm hover:shadow-xl hover:shadow-blue-500/5 transition-all p-8 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-blue-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    <div className="space-y-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-blue-50 flex items-center justify-center text-blue-600">
                            <Users className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Total Students</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">2,482</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-emerald-500 font-black text-[10px] uppercase tracking-widest">
                            <ArrowUpRight className="w-4 h-4" /> 12% vs last month
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-slate-100 rounded-[35px] shadow-sm hover:shadow-xl hover:shadow-indigo-500/5 transition-all p-8 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-indigo-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    <div className="space-y-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-indigo-50 flex items-center justify-center text-indigo-600">
                            <Briefcase className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Staff Capacity</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">142</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-indigo-500 font-black text-[10px] uppercase tracking-widest">
                            <ArrowUpRight className="w-4 h-4" /> 4 Added this week
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-slate-100 rounded-[35px] shadow-sm hover:shadow-xl hover:shadow-sky-500/5 transition-all p-8 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-sky-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    <div className="space-y-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-sky-50 flex items-center justify-center text-sky-600">
                            <BookOpen className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Course Reach</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">58</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-slate-400 font-black text-[10px] uppercase tracking-widest">
                            Stable Performance
                        </div>
                    </div>
                </Card>

                <Card className="bg-white border-slate-100 rounded-[35px] shadow-sm hover:shadow-xl hover:shadow-rose-500/5 transition-all p-8 flex flex-col justify-between group overflow-hidden relative">
                    <div className="absolute top-0 right-0 w-24 h-24 bg-rose-500/5 rounded-full -mr-12 -mt-12 transition-all group-hover:scale-110" />
                    <div className="space-y-4 relative z-10">
                        <div className="w-12 h-12 rounded-2xl bg-rose-50 flex items-center justify-center text-rose-600">
                            <TrendingUp className="w-6 h-6" />
                        </div>
                        <div>
                            <p className="text-[10px] font-black uppercase tracking-widest text-slate-400">Institutional Health</p>
                            <h3 className="text-3xl font-black text-slate-800 tracking-tight">94%</h3>
                        </div>
                        <div className="flex items-center gap-1.5 text-rose-500 font-black text-[10px] uppercase tracking-widest">
                            <ArrowDownRight className="w-4 h-4" /> 2% Drop in uptime
                        </div>
                    </div>
                </Card>
            </div>

            {/* Charts Section */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 relative z-10">
                {/* Large Trend Chart */}
                <Card className="lg:col-span-2 bg-white border-slate-100 rounded-[45px] shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <CardHeader className="p-10 border-b border-slate-50 flex flex-row items-center justify-between">
                        <div>
                            <CardTitle className="text-2xl font-black text-slate-800">Growth Projection</CardTitle>
                            <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Enrollment & Capacity Trends</p>
                        </div>
                        <Badge className="bg-blue-50 text-blue-600 border-0 font-black px-4 py-2 text-[9px] uppercase tracking-widest">Real-time Feed</Badge>
                    </CardHeader>
                    <CardContent className="h-[400px] p-10 pt-14">
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={enrollmentData}>
                                <defs>
                                    <linearGradient id="colorStudents" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.15} />
                                        <stop offset="95%" stopColor="#3b82f6" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis
                                    dataKey="name"
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    dy={10}
                                />
                                <YAxis
                                    axisLine={false}
                                    tickLine={false}
                                    tick={{ fill: '#94a3b8', fontSize: 10, fontWeight: 800 }}
                                    dx={-10}
                                />
                                <Tooltip
                                    contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                                    labelStyle={{ fontWeight: 900, marginBottom: '8px', color: '#1e293b' }}
                                />
                                <Area
                                    type="monotone"
                                    dataKey="students"
                                    stroke="#3b82f6"
                                    strokeWidth={4}
                                    fillOpacity={1}
                                    fill="url(#colorStudents)"
                                />
                            </AreaChart>
                        </ResponsiveContainer>
                    </CardContent>
                </Card>

                {/* Pie Chart Course distribution */}
                <Card className="bg-white border-slate-100 rounded-[45px] shadow-2xl shadow-slate-200/50 overflow-hidden">
                    <CardHeader className="p-10 border-b border-slate-50">
                        <CardTitle className="text-2xl font-black text-slate-800">Market Share</CardTitle>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mt-1">Course Domain Distribution</p>
                    </CardHeader>
                    <CardContent className="p-10">
                        <div className="h-[250px]">
                            <ResponsiveContainer width="100%" height="100%">
                                <PieChart>
                                    <Pie
                                        data={courseDistData}
                                        cx="50%"
                                        cy="50%"
                                        innerRadius={60}
                                        outerRadius={80}
                                        paddingAngle={10}
                                        dataKey="value"
                                    >
                                        {courseDistData.map((entry, index) => (
                                            <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} strokeWidth={0} />
                                        ))}
                                    </Pie>
                                    <Tooltip
                                        contentStyle={{ backgroundColor: '#fff', borderRadius: '24px', border: 'none', boxShadow: '0 25px 50px -12px rgb(0 0 0 / 0.1)' }}
                                    />
                                </PieChart>
                            </ResponsiveContainer>
                        </div>
                        <div className="space-y-4 mt-6">
                            {courseDistData.map((item, i) => (
                                <div key={item.name} className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[i] }} />
                                        <span className="text-[11px] font-black text-slate-600 uppercase tracking-widest">{item.name}</span>
                                    </div>
                                    <span className="text-[11px] font-black text-slate-400">{(item.value / 1200 * 100).toFixed(0)}%</span>
                                </div>
                            ))}
                        </div>
                    </CardContent>
                </Card>
            </div>
        </div>
    )
}
