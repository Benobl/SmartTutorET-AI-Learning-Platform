"use client"

import { BarChart3, TrendingUp, Users, BookOpen, Briefcase } from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"

export default function ManagerAnalytics() {
    return (
        <div className="space-y-8 animate-in fade-in duration-500">
            <div>
                <h1 className="text-3xl font-bold text-slate-900 mb-2">Institutional Analytics</h1>
                <p className="text-slate-500 font-medium">Performance metrics and enrollment trends.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <Card className="bg-white border-slate-200 rounded-2xl shadow-sm border p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
                        <TrendingUp className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Growth Trends</h3>
                        <p className="text-sm text-slate-400">Monthly enrollment increase of 12%</p>
                    </div>
                </Card>
                <Card className="bg-white border-slate-200 rounded-2xl shadow-sm border p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-indigo-50 flex items-center justify-center text-indigo-600">
                        <Users className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Tutor Retention</h3>
                        <p className="text-sm text-slate-400">95% satisfaction rate among staff</p>
                    </div>
                </Card>
                <Card className="bg-white border-slate-200 rounded-2xl shadow-sm border p-6 flex flex-col items-center justify-center text-center gap-4">
                    <div className="w-16 h-16 rounded-full bg-sky-50 flex items-center justify-center text-sky-600">
                        <BookOpen className="w-8 h-8" />
                    </div>
                    <div>
                        <h3 className="text-lg font-bold">Course Engagement</h3>
                        <p className="text-sm text-slate-400">Average 4.8/5.0 student rating</p>
                    </div>
                </Card>
            </div>

            <div className="p-12 text-center bg-slate-50 border border-dashed border-slate-200 rounded-[40px]">
                <BarChart3 className="w-12 h-12 text-slate-200 mx-auto mb-4" />
                <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">Advanced data visualizations coming soon</p>
            </div>
        </div>
    )
}
