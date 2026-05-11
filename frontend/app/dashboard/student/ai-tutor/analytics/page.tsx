"use client"

import { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { 
    Brain, MessageSquare, Clock, 
    Target, TrendingUp, Award,
    BookOpen, Zap, AlertCircle
} from "lucide-react"
import {
    LineChart, Line, XAxis, YAxis, CartesianGrid, 
    Tooltip, ResponsiveContainer, BarChart, Bar,
    PieChart, Pie, Cell
} from 'recharts'
import { aiApi } from "@/lib/api"

const COLORS = ['#0ea5e9', '#6366f1', '#f43f5e', '#10b981', '#f59e0b']

export default function AIAnalyticsPage() {
    const [stats, setStats] = useState<any>(null)
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        // Mocking stats for now as it requires complex aggregation
        setTimeout(() => {
            setStats({
                totalQuestions: 154,
                studyHours: 12.5,
                conceptsMastered: 42,
                weakTopics: [
                    { name: "Derivatives", level: 35 },
                    { name: "Organic Chemistry", level: 42 },
                    { name: "Quantum Physics", level: 28 }
                ],
                subjectDistribution: [
                    { name: 'Math', value: 40 },
                    { name: 'Physics', value: 25 },
                    { name: 'Biology', value: 20 },
                    { name: 'Chemistry', value: 15 },
                ],
                weeklyActivity: [
                    { day: 'Mon', count: 12 },
                    { day: 'Tue', count: 18 },
                    { day: 'Wed', count: 15 },
                    { day: 'Thu', count: 22 },
                    { day: 'Fri', count: 30 },
                    { day: 'Sat', count: 10 },
                    { day: 'Sun', count: 5 },
                ]
            })
            setLoading(false)
        }, 1000)
    }, [])

    if (loading) return (
        <div className="flex h-full items-center justify-center">
            <Zap className="w-10 h-10 text-sky-500 animate-bounce" />
        </div>
    )

    return (
        <div className="p-8 space-y-10 animate-in fade-in duration-700 pb-20">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-6 bg-white p-10 rounded-[48px] border border-slate-100 shadow-sm">
                <div className="space-y-1">
                    <div className="flex items-center gap-2 mb-2">
                        <span className="px-2.5 py-0.5 rounded-full bg-indigo-50 text-indigo-600 text-[10px] font-black uppercase tracking-widest border border-indigo-100/50 italic">AI Insights</span>
                        <div className="w-1.5 h-1.5 rounded-full bg-indigo-500 animate-pulse" />
                    </div>
                    <h1 className="text-4xl font-black text-slate-900 tracking-tighter leading-tight italic">
                        Your Learning <span className="text-indigo-600">DNA</span>
                    </h1>
                    <p className="text-slate-400 font-medium text-sm italic">Tracking your intellectual growth powered by SmartTutor AI.</p>
                </div>
                
                <div className="flex gap-4">
                    <div className="px-6 py-4 rounded-3xl bg-slate-50 border border-slate-100 text-center">
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-widest mb-1 italic">IQ Projection</p>
                        <p className="text-2xl font-black text-slate-900 italic">124</p>
                    </div>
                    <div className="px-6 py-4 rounded-3xl bg-emerald-50 border border-emerald-100 text-center">
                        <p className="text-[10px] font-black text-emerald-400 uppercase tracking-widest mb-1 italic">Efficiency</p>
                        <p className="text-2xl font-black text-emerald-600 italic">88%</p>
                    </div>
                </div>
            </div>

            {/* Top Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                    { label: "Questions Asked", value: stats.totalQuestions, icon: MessageSquare, color: "text-sky-500", bg: "bg-sky-50" },
                    { label: "Study Time", value: `${stats.studyHours}h`, icon: Clock, color: "text-indigo-500", bg: "bg-indigo-50" },
                    { label: "Mastered Concepts", value: stats.conceptsMastered, icon: Award, color: "text-emerald-500", bg: "bg-emerald-50" },
                    { label: "Brain Power", value: "92%", icon: Zap, color: "text-amber-500", bg: "bg-amber-50" }
                ].map((card, i) => (
                    <motion.div 
                        key={i}
                        initial={{ y: 20, opacity: 0 }}
                        animate={{ y: 0, opacity: 1 }}
                        transition={{ delay: i * 0.1 }}
                        className="p-8 rounded-[40px] bg-white border border-slate-100 shadow-sm hover:shadow-xl transition-all group"
                    >
                        <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:scale-110 transition-transform", card.bg)}>
                            <card.icon className={cn("w-7 h-7", card.color)} />
                        </div>
                        <p className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] mb-1 italic">{card.label}</p>
                        <p className="text-3xl font-black text-slate-900 italic tracking-tighter">{card.value}</p>
                    </motion.div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Main Activity Chart */}
                <div className="lg:col-span-2 p-10 rounded-[56px] bg-white border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                        <TrendingUp className="w-6 h-6 text-indigo-500" />
                        Weekly Cognitive Engagement
                    </h3>
                    <div className="h-[300px] w-full">
                        <ResponsiveContainer width="100%" height="100%">
                            <LineChart data={stats.weeklyActivity}>
                                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
                                <XAxis dataKey="day" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 900, fontSize: 12}} dy={10} />
                                <YAxis axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontWeight: 900, fontSize: 12}} />
                                <Tooltip 
                                    contentStyle={{ borderRadius: '24px', border: 'none', boxShadow: '0 20px 25px -5px rgb(0 0 0 / 0.1)' }}
                                    itemStyle={{ fontWeight: 900, fontSize: '12px' }}
                                />
                                <Line 
                                    type="monotone" 
                                    dataKey="count" 
                                    stroke="#6366f1" 
                                    strokeWidth={6} 
                                    dot={{ r: 8, fill: '#6366f1', strokeWidth: 4, stroke: '#fff' }}
                                    activeDot={{ r: 10, fill: '#1e293b' }}
                                />
                            </LineChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Subject Distribution */}
                <div className="p-10 rounded-[56px] bg-white border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                        <BookOpen className="w-6 h-6 text-sky-500" />
                        Focus Distribution
                    </h3>
                    <div className="h-[250px] w-full relative">
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={stats.subjectDistribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="value"
                                >
                                    {stats.subjectDistribution.map((entry: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip />
                            </PieChart>
                        </ResponsiveContainer>
                        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 text-center pointer-events-none">
                            <p className="text-[10px] font-black text-slate-400 uppercase italic">Core</p>
                            <p className="text-xl font-black text-slate-900 italic">Subjects</p>
                        </div>
                    </div>
                    <div className="space-y-3">
                        {stats.subjectDistribution.map((s: any, i: number) => (
                            <div key={i} className="flex items-center justify-between">
                                <div className="flex items-center gap-3">
                                    <div className="w-3 h-3 rounded-full" style={{ backgroundColor: COLORS[i % COLORS.length] }} />
                                    <span className="text-xs font-black text-slate-600 uppercase tracking-widest italic">{s.name}</span>
                                </div>
                                <span className="text-xs font-black text-slate-900 italic">{s.value}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Weak Topics Analysis */}
                <div className="p-10 rounded-[56px] bg-white border border-slate-100 shadow-sm space-y-8">
                    <div className="flex items-center justify-between">
                        <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                            <AlertCircle className="w-6 h-6 text-red-500" />
                            Critical Attention Required
                        </h3>
                        <span className="px-3 py-1 rounded-full bg-red-50 text-[10px] font-black text-red-600 uppercase tracking-widest border border-red-100">Top 3</span>
                    </div>
                    <div className="space-y-6">
                        {stats.weakTopics.map((topic: any, i: number) => (
                            <div key={i} className="space-y-3">
                                <div className="flex items-center justify-between">
                                    <span className="text-sm font-black text-slate-700 italic">{topic.name}</span>
                                    <span className="text-xs font-black text-slate-400 italic">Proficiency: {topic.level}%</span>
                                </div>
                                <div className="h-4 bg-slate-50 rounded-full overflow-hidden p-1 border border-slate-100">
                                    <motion.div 
                                        initial={{ width: 0 }}
                                        animate={{ width: `${topic.level}%` }}
                                        className="h-full bg-gradient-to-r from-red-500 to-amber-500 rounded-full" 
                                    />
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="p-6 rounded-[32px] bg-sky-50 border border-sky-100">
                        <p className="text-[10px] font-black text-sky-600 uppercase tracking-widest mb-2 flex items-center gap-2 italic">
                            <Brain className="w-3 h-3" />
                            AI Recommendation
                        </p>
                        <p className="text-xs font-bold text-slate-600 italic leading-relaxed">
                            "You're making great progress in Biology, but your understanding of {stats.weakTopics[0].name} shows inconsistent patterns. I've prepared a specialized revision session for this topic."
                        </p>
                    </div>
                </div>

                {/* Adaptive Learning Progress */}
                <div className="p-10 rounded-[56px] bg-white border border-slate-100 shadow-sm space-y-8">
                    <h3 className="text-xl font-black text-slate-900 tracking-tight italic flex items-center gap-3">
                        <Target className="w-6 h-6 text-emerald-500" />
                        Adaptive Mastery Path
                    </h3>
                    <div className="grid grid-cols-2 gap-4">
                        {[
                            { label: "Vocabulary", score: 94, icon: BookOpen },
                            { label: "Formula Logic", score: 82, icon: Zap },
                            { label: "Critical Thinking", score: 76, icon: Brain },
                            { label: "Exam Technique", score: 88, icon: Target },
                        ].map((skill, i) => (
                            <div key={i} className="p-6 rounded-3xl bg-slate-50 border border-slate-100 flex items-center gap-4 group hover:bg-white hover:border-emerald-200 transition-all shadow-sm">
                                <div className="w-10 h-10 rounded-xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <skill.icon className="w-5 h-5 text-emerald-500" />
                                </div>
                                <div>
                                    <p className="text-[9px] font-black text-slate-400 uppercase italic mb-1">{skill.label}</p>
                                    <p className="text-lg font-black text-slate-900 italic">{skill.score}%</p>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="pt-4 border-t border-slate-50">
                        <div className="flex items-center justify-between text-xs font-black uppercase tracking-widest text-slate-400 mb-4 italic">
                            <span>Overall Intellectual Index</span>
                            <span className="text-indigo-600 italic">Grade A+ Level</span>
                        </div>
                        <div className="h-6 bg-slate-50 rounded-full overflow-hidden p-1.5 border border-slate-100">
                            <div className="h-full bg-gradient-to-r from-indigo-500 via-sky-500 to-emerald-500 rounded-full" style={{ width: '92%' }} />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    )
}
