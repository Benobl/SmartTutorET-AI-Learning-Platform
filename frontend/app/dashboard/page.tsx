"use client"

import { getCurrentUser } from "@/lib/auth-utils"
import { useState, useEffect } from "react"

export default function DashboardPage() {
    const [user, setUser] = useState<any>(null)

    useEffect(() => {
        setUser(getCurrentUser())
    }, [])

    const userName = user ? (user.name?.split(' ')[0] || user.name) : "User"

    return (
        <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
            <div>
                <h1 className="text-4xl font-bold text-white mb-2">Welcome back, {userName}! 👋</h1>
                <p className="text-white/40">Here&apos;s what&apos;s happening with your students today.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {[
                    { label: "Total Students", value: "124", change: "+12%", color: "sky" },
                    { label: "Active Courses", value: "8", change: "0%", color: "emerald" },
                    { label: "Hours Taught", value: "1.2k", change: "+18%", color: "indigo" },
                    { label: "Earnings", value: "$4.5k", change: "+24%", color: "rose" },
                ].map((stat) => (
                    <div key={stat.label} className="p-6 rounded-3xl bg-white/5 border border-white/10 hover:bg-white/10 transition-colors group">
                        <p className="text-sm text-white/40 mb-1">{stat.label}</p>
                        <div className="flex items-end justify-between">
                            <h3 className="text-2xl font-bold text-white">{stat.value}</h3>
                            <span className={`text-xs font-medium px-2 py-1 rounded-full bg-${stat.color}-500/10 text-${stat.color}-400`}>
                                {stat.change}
                            </span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                <div className="lg:col-span-2 space-y-4">
                    <div className="flex items-center justify-between">
                        <h2 className="text-xl font-bold text-white">Recent Activity</h2>
                        <button className="text-sky-400 text-sm hover:underline">View All</button>
                    </div>
                    <div className="rounded-3xl border border-white/10 bg-white/5 overflow-hidden">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="p-4 border-b border-white/5 last:border-0 flex items-center gap-4 hover:bg-white/5 transition-colors">
                                <div className="w-10 h-10 rounded-xl bg-sky-500/10 flex items-center justify-center">
                                    <div className="w-2 h-2 rounded-full bg-sky-500" />
                                </div>
                                <div className="flex-1">
                                    <p className="text-sm font-medium text-white">New student enrollment</p>
                                    <p className="text-xs text-white/40">A new student enrolled in Mathematics Grade 10</p>
                                </div>
                                <span className="text-xs text-white/20">2h ago</span>
                            </div>
                        ))}
                    </div>
                </div>

                <div className="space-y-4">
                    <h2 className="text-xl font-bold text-white">Upcoming Sessions</h2>
                    <div className="space-y-3">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="p-4 rounded-3xl border border-white/10 bg-white/5 space-y-3">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-slate-800 flex items-center justify-center text-xs font-bold">
                                        MK
                                    </div>
                                    <div>
                                        <p className="text-sm font-medium text-white">Michael Khan</p>
                                        <p className="text-xs text-white/40">Physics • 10:00 AM</p>
                                    </div>
                                </div>
                                <button className="w-full py-2.5 bg-sky-500 hover:bg-sky-400 text-white text-xs font-semibold rounded-xl transition-smooth shadow-lg shadow-sky-500/20">
                                    Join Session
                                </button>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}
