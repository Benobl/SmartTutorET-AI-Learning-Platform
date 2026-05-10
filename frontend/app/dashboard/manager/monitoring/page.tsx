"use client"

import { useState, useEffect } from "react"
import { 
    Users, 
    TrendingUp, 
    PieChart, 
    Download, 
    Search,
    Filter,
    ShieldCheck,
    GraduationCap,
    Clock,
    CheckCircle,
    ArrowLeft,
    FileText,
    BarChart3,
    Activity,
    ChevronRight,
    SearchX
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { toast } from "sonner"
import { getUsers, getStudentProgress, exportToPDF } from "@/lib/manager-utils"
import Link from "next/link"

export default function Monitoring() {
    const [users, setUsers] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [searchQuery, setSearchQuery] = useState("")
    const [selectedStudent, setSelectedStudent] = useState<any>(null)
    const [progressData, setProgressData] = useState<any[]>([])
    const [isFetchingProgress, setIsFetchingProgress] = useState(false)
    const [selectedGrade, setSelectedGrade] = useState<string>("all")

    const fetchData = async () => {
        setLoading(true)
        const data = await getUsers()
        setUsers(data)
        setLoading(false)
    }

    useEffect(() => {
        fetchData()
    }, [])

    const viewProgress = async (student: any) => {
        setSelectedStudent(student)
        setIsFetchingProgress(true)
        const data = await getStudentProgress(student._id)
        setProgressData(data)
        setIsFetchingProgress(false)
    }

    const filteredUsers = users.filter(u => {
        const matchesSearch = u.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
            u.role.toLowerCase().includes(searchQuery.toLowerCase());
        
        const matchesGrade = selectedGrade === "all" || u.grade === selectedGrade;
        
        return matchesSearch && matchesGrade;
    })

    const stats = {
        total: users.length,
        students: users.filter(u => u.role === 'student').length,
        tutors: users.filter(u => u.role === 'tutor').length,
        admins: users.filter(u => u.role === 'admin' || u.role === 'manager').length
    }

    const handleExport = () => {
        const columns = ['name', 'email', 'role', 'createdAt']
        const data = filteredUsers.map(u => ({
            ...u,
            createdAt: new Date(u.createdAt).toLocaleDateString()
        }))
        exportToPDF(data, columns, "System User Registry", "user_registry")
        toast.success("User registry exported as PDF.")
    }

    return (
        <div className="space-y-8">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <div className="flex items-center gap-2 mb-1">
                        <Link href="/dashboard/manager" className="p-1.5 hover:bg-slate-100 rounded-lg transition-colors text-slate-400">
                            <ArrowLeft className="w-4 h-4" />
                        </Link>
                        <Badge className="bg-blue-100 text-blue-700 hover:bg-blue-100 border-none px-2 py-0.5 text-[10px] font-bold uppercase tracking-wider">
                            Real-time Analytics
                        </Badge>
                    </div>
                    <h1 className="text-3xl font-black text-slate-900 tracking-tight">System Monitoring</h1>
                    <p className="text-slate-500 font-medium">Track user engagement and student curriculum progress</p>
                </div>

                <div className="flex items-center gap-3">
                    <Button 
                        onClick={handleExport}
                        variant="outline" 
                        className="rounded-2xl border-2 border-slate-100 hover:bg-slate-50 font-bold text-slate-600 gap-2 h-11 px-6 shadow-sm"
                    >
                        <Download className="w-4 h-4" /> Export Report
                    </Button>
                </div>
            </div>

            {/* Quick Stats Grid */}
            <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: 'Total Users', value: stats.total, icon: Users, color: 'blue' },
                    { label: 'Students', value: stats.students, icon: GraduationCap, color: 'indigo' },
                    { label: 'Tutors', value: stats.tutors, icon: ShieldCheck, color: 'purple' },
                    { label: 'Active Admins', value: stats.admins, icon: Activity, color: 'emerald' },
                ].map((stat, idx) => (
                    <Card key={idx} className="rounded-[24px] border-2 border-slate-100 shadow-sm overflow-hidden group hover:border-blue-200 transition-all">
                        <CardContent className="p-5 flex items-center gap-4">
                            <div className={`w-12 h-12 rounded-2xl bg-${stat.color}-50 text-${stat.color}-500 flex items-center justify-center group-hover:scale-110 transition-transform`}>
                                <stat.icon className="w-6 h-6" />
                            </div>
                            <div>
                                <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest">{stat.label}</p>
                                <p className="text-2xl font-black text-slate-800 tracking-tight">{stat.value}</p>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
                {/* User List Area */}
                <div className="lg:col-span-8 space-y-4">
                    <Card className="rounded-[32px] border-2 border-slate-100 shadow-xl shadow-slate-200/40 overflow-hidden bg-white">
                        <CardHeader className="p-6 border-b border-slate-50">
                            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                                <CardTitle className="text-lg font-black text-slate-800 flex items-center gap-2">
                                    <BarChart3 className="w-5 h-5 text-blue-500" />
                                    User Registry
                                </CardTitle>
                                <div className="flex flex-col md:flex-row items-center gap-3">
                                    <select 
                                        className="h-10 px-4 rounded-xl border border-slate-100 bg-slate-50/50 text-xs font-bold text-slate-600 focus:ring-blue-500/20"
                                        value={selectedGrade}
                                        onChange={(e) => setSelectedGrade(e.target.value)}
                                    >
                                        <option value="all">All Grades</option>
                                        <option value="9">Grade 9</option>
                                        <option value="10">Grade 10</option>
                                        <option value="11">Grade 11</option>
                                        <option value="12">Grade 12</option>
                                    </select>
                                    <div className="relative group">
                                        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 group-focus-within:text-blue-500 transition-colors" />
                                        <Input 
                                            placeholder="Filter by name or email..." 
                                            className="pl-10 w-full md:w-[260px] rounded-xl border-slate-100 focus:border-blue-400 focus:ring-blue-400/10 transition-all bg-slate-50/50 h-10"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                        />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>
                        <CardContent className="p-0">
                            <div className="overflow-x-auto">
                                <table className="w-full text-left">
                                    <thead>
                                        <tr className="bg-slate-50/50 text-slate-400 text-[10px] font-black uppercase tracking-widest">
                                            <th className="px-6 py-4">User Identity</th>
                                            <th className="px-6 py-4 text-center">Role</th>
                                            <th className="px-6 py-4 text-center">Status</th>
                                            <th className="px-6 py-4 text-right">Actions</th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-slate-50">
                                        {loading ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-12 text-center">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-8 h-8 border-4 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-3" />
                                                        <span className="text-xs font-bold text-slate-400 uppercase tracking-widest">Loading Users...</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : filteredUsers.length === 0 ? (
                                            <tr>
                                                <td colSpan={4} className="px-6 py-20 text-center">
                                                    <div className="flex flex-col items-center opacity-40">
                                                        <SearchX className="w-12 h-12 mb-2" />
                                                        <span className="text-sm font-bold text-slate-400">No users found matching your search</span>
                                                    </div>
                                                </td>
                                            </tr>
                                        ) : (
                                            filteredUsers.map((user) => (
                                                <tr key={user._id} className="hover:bg-blue-50/30 transition-colors group">
                                                    <td className="px-6 py-4">
                                                        <div className="flex items-center gap-3">
                                                            <div className="w-9 h-9 rounded-xl bg-slate-100 flex items-center justify-center text-slate-400 group-hover:bg-blue-100 group-hover:text-blue-500 transition-colors font-bold uppercase text-xs">
                                                                {user.name.charAt(0)}
                                                            </div>
                                                            <div className="min-w-0">
                                                                <p className="text-sm font-bold text-slate-700 truncate">{user.name}</p>
                                                                <p className="text-[11px] font-medium text-slate-400 truncate">{user.email}</p>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <Badge variant="outline" className={`text-[10px] font-black uppercase px-2 py-0 border-none ${
                                                            user.role === 'admin' || user.role === 'manager' ? 'bg-emerald-50 text-emerald-600' :
                                                            user.role === 'tutor' ? 'bg-purple-50 text-purple-600' : 'bg-blue-50 text-blue-600'
                                                        }`}>
                                                            {user.role}
                                                        </Badge>
                                                    </td>
                                                    <td className="px-6 py-4 text-center">
                                                        <div className="flex items-center justify-center">
                                                            <div className={`w-1.5 h-1.5 rounded-full ${user.isApproved ? 'bg-emerald-500 ring-4 ring-emerald-500/10' : 'bg-slate-300'}`} />
                                                        </div>
                                                    </td>
                                                    <td className="px-6 py-4 text-right">
                                                        {user.role === 'student' && (
                                                            <Button 
                                                                onClick={() => viewProgress(user)}
                                                                size="sm" 
                                                                className="rounded-lg bg-blue-50 hover:bg-blue-100 text-blue-600 font-bold border-0 shadow-none h-8 px-3"
                                                            >
                                                                Track Progress
                                                            </Button>
                                                        )}
                                                    </td>
                                                </tr>
                                            ))
                                        )}
                                    </tbody>
                                </table>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Progress Details Area */}
                <div className="lg:col-span-4 space-y-6">
                    {selectedStudent ? (
                        <Card className="rounded-[32px] border-2 border-blue-500/20 shadow-2xl shadow-blue-500/5 overflow-hidden animate-in fade-in slide-in-from-right-8 duration-500 bg-white">
                            <CardHeader className="p-6 bg-blue-50/50 border-b border-blue-100/50 relative">
                                <button 
                                    onClick={() => setSelectedStudent(null)}
                                    className="absolute top-4 right-4 p-1 hover:bg-blue-100 rounded-lg text-blue-400 transition-colors"
                                >
                                    <XCircle className="w-5 h-5" />
                                </button>
                                <p className="text-[10px] font-black text-blue-500 uppercase tracking-widest mb-1">Student Progress</p>
                                <h3 className="text-xl font-black text-slate-800 leading-tight">{selectedStudent.name}</h3>
                                <p className="text-xs font-medium text-slate-500">{selectedStudent.email}</p>
                            </CardHeader>
                            <CardContent className="p-6">
                                <div className="space-y-4">
                                    <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest flex items-center gap-2">
                                        <Layers className="w-3 h-3" /> Enrolled Subjects
                                    </p>
                                    
                                    {isFetchingProgress ? (
                                        <div className="py-12 flex flex-col items-center">
                                            <div className="w-6 h-6 border-2 border-blue-100 border-t-blue-500 rounded-full animate-spin mb-2" />
                                            <span className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Fetching Data...</span>
                                        </div>
                                    ) : progressData.length === 0 ? (
                                        <div className="bg-slate-50 rounded-3xl p-8 text-center border border-dashed border-slate-200">
                                            <p className="text-sm font-bold text-slate-400 italic mb-1">No Active Enrollments</p>
                                            <p className="text-[10px] text-slate-300 font-medium leading-relaxed">This student hasn't joined any curriculum subjects yet.</p>
                                        </div>
                                    ) : (
                                        <div className="space-y-3">
                                            {progressData.map((subject, idx) => (
                                                <div key={idx} className="group p-4 rounded-2xl bg-slate-50 border border-slate-100 hover:border-blue-200 hover:bg-white transition-all shadow-sm shadow-slate-100/50">
                                                    <div className="flex items-center justify-between mb-2">
                                                        <h4 className="font-black text-slate-700 text-sm">{subject.title}</h4>
                                                        <Badge className="bg-blue-100 text-blue-600 border-none text-[8px] font-black uppercase px-2">Active</Badge>
                                                    </div>
                                                    <div className="flex items-center gap-2 text-[10px] font-bold text-slate-400">
                                                        <ShieldCheck className="w-3 h-3" />
                                                        Tutor: {subject.tutor?.name}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    )}
                                </div>

                                <div className="mt-8 pt-6 border-t border-slate-50">
                                    <Button className="w-full rounded-2xl bg-slate-900 hover:bg-sky-600 text-white font-black uppercase tracking-widest text-[10px] h-12 border-0 shadow-lg shadow-slate-900/20">
                                        Generate Full Report
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    ) : (
                        <div className="h-full flex flex-col items-center justify-center p-8 bg-slate-50/50 rounded-[40px] border-2 border-dashed border-slate-200 text-center">
                            <div className="w-20 h-20 bg-white rounded-[24px] shadow-xl shadow-slate-200/40 flex items-center justify-center mb-6 ring-8 ring-white/50">
                                <Activity className="w-10 h-10 text-slate-200" />
                            </div>
                            <h3 className="text-lg font-black text-slate-400 mb-2">Select a Student</h3>
                            <p className="text-xs text-slate-300 font-bold max-w-[180px] leading-relaxed uppercase tracking-widest">
                                Click on "Track Progress" in the table to view detailed curriculum engagement.
                            </p>
                        </div>
                    )}
                </div>
            </div>
        </div>
    )
}
import { Layers, XCircle } from "lucide-react"
