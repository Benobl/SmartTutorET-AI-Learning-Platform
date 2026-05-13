"use client"

import { useState, useEffect } from "react"
import { 
  Zap, 
  Target, 
  TrendingUp, 
  Sparkles, 
  ChevronRight, 
  BrainCircuit, 
  Activity,
  AlertCircle,
  CheckCircle2,
  BarChart3
} from "lucide-react"
import { cn } from "@/lib/utils"
import { aiApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"

interface AIPerformanceHubProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

export function AIPerformanceHub({ isOpen, onOpenChange }: AIPerformanceHubProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen) {
      fetchInsights()
    }
  }, [isOpen])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await aiApi.getPerformanceInsights()
      if (res.success) {
        setData(res.data)
      } else {
        throw new Error("Failed to load insights")
      }
    } catch (err: any) {
      console.error("AI Hub Error:", err)
      setError(err.message || "Unable to sync with Neural Engine")
    } finally {
      setLoading(false)
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl p-0 overflow-hidden bg-white border-none rounded-[32px] shadow-2xl">
        <div className="grid grid-cols-1 md:grid-cols-12 h-full min-h-[600px]">
          
          {/* Sidebar Area: Visual Summary */}
          <div className="md:col-span-5 bg-slate-900 p-10 text-white flex flex-col justify-between relative overflow-hidden">
            {/* Background Accent */}
            <div className="absolute -top-20 -left-20 w-64 h-64 bg-sky-500/20 blur-[100px] rounded-full" />
            <div className="absolute bottom-0 right-0 w-full h-1/2 bg-gradient-to-t from-sky-600/10 to-transparent" />

            <div className="relative z-10 space-y-8">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-500/10 border border-sky-500/20 flex items-center justify-center">
                  <BrainCircuit className="w-5 h-5 text-sky-400" />
                </div>
                <div>
                  <h3 className="text-sm font-black uppercase tracking-widest text-sky-400">Neural Engine</h3>
                  <p className="text-[10px] text-slate-400 font-bold uppercase tracking-tight">System Status: {loading ? "Analyzing..." : data?.status || "Live"}</p>
                </div>
              </div>

              <div className="space-y-2">
                <h2 className="text-4xl font-light tracking-tight leading-none">
                  Performance <span className="font-semibold block">Projection</span>
                </h2>
                <p className="text-slate-400 text-sm leading-relaxed max-w-[200px]">
                  Real-time academic forecasting powered by your behavioral metrics.
                </p>
              </div>

              <div className="pt-10">
                <div className="relative w-48 h-48 flex items-center justify-center">
                  <svg className="w-full h-full transform -rotate-90">
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="4"
                      fill="transparent"
                      className="text-slate-800"
                    />
                    <circle
                      cx="96"
                      cy="96"
                      r="88"
                      stroke="currentColor"
                      strokeWidth="8"
                      fill="transparent"
                      strokeDasharray={2 * Math.PI * 88}
                      strokeDashoffset={2 * Math.PI * 88 * (1 - (data?.predicted_grade || 0) / 100)}
                      className="text-sky-500 transition-all duration-1000 ease-out"
                      strokeLinecap="round"
                    />
                  </svg>
                  <div className="absolute inset-0 flex flex-col items-center justify-center text-center">
                    <span className="text-5xl font-black tracking-tighter">{loading ? "..." : Math.round(data?.predicted_grade || 0)}%</span>
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">Expected Result</span>
                  </div>
                </div>
              </div>
            </div>

            <div className="relative z-10 flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10">
              <div className="w-8 h-8 rounded-full bg-emerald-500/20 flex items-center justify-center">
                <CheckCircle2 className="w-4 h-4 text-emerald-400" />
              </div>
              <p className="text-[10px] font-medium text-slate-300">
                AI Confidence: <span className="text-white font-bold">{Math.round((data?.confidence_score || 0) * 100)}%</span> based on latest activity.
              </p>
            </div>
          </div>

          {/* Main Content Area: Insights & Recommendations */}
          <div className="md:col-span-7 bg-white p-10 flex flex-col">
            <DialogHeader className="mb-8">
              <DialogTitle className="text-2xl font-semibold text-slate-900 flex items-center gap-3">
                AI Insight Hub <Sparkles className="w-5 h-5 text-sky-500" />
              </DialogTitle>
            </DialogHeader>

            <div className="flex-1 space-y-8 overflow-y-auto pr-2 custom-scrollbar">
              
              {loading ? (
                <div className="space-y-6 animate-pulse">
                  {[1, 2, 3].map(i => (
                    <div key={i} className="h-24 bg-slate-50 rounded-3xl border border-slate-100" />
                  ))}
                </div>
              ) : error ? (
                <div className="py-20 text-center space-y-4">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center mx-auto">
                    <AlertCircle className="w-8 h-8 text-red-500" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 uppercase tracking-widest">{error}</p>
                  <Button onClick={fetchInsights} variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase">Retry Connection</Button>
                </div>
              ) : (
                <>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                       <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">Personalized Recommendations</h4>
                       <span className="px-2 py-0.5 rounded-full bg-sky-50 text-[10px] font-bold text-sky-600">Action Required</span>
                    </div>
                    
                    <div className="space-y-4">
                      {data?.recommendations?.map((rec: string, i: number) => (
                        <div key={i} className="group p-6 rounded-[24px] bg-slate-50 border border-transparent hover:bg-white hover:border-slate-100 hover:shadow-xl transition-all duration-300 flex items-start gap-4">
                          <div className="w-10 h-10 rounded-xl bg-white border border-slate-100 flex items-center justify-center text-slate-400 group-hover:text-sky-500 transition-colors shrink-0">
                            {i === 0 ? <TrendingUp className="w-5 h-5" /> : i === 1 ? <Target className="w-5 h-5" /> : <Zap className="w-5 h-5" />}
                          </div>
                          <p className="text-sm text-slate-600 font-medium leading-relaxed pt-2">
                            {rec}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-8 rounded-[32px] bg-slate-900 text-white space-y-4">
                    <div className="flex items-center gap-3">
                      <BarChart3 className="w-5 h-5 text-sky-400" />
                      <h4 className="text-xs font-bold uppercase tracking-widest">Growth Analytics</h4>
                    </div>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      Your recent engagement levels show a <span className="text-emerald-400 font-bold">12% increase</span> in active recall sessions. Keep this momentum for the upcoming mid-terms.
                    </p>
                    <div className="pt-4 flex items-center justify-between border-t border-white/5">
                      <div className="flex -space-x-2">
                        {[1, 2, 3].map(i => (
                          <div key={i} className="w-6 h-6 rounded-full border-2 border-slate-900 bg-slate-800" />
                        ))}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">2.4k students analyzed</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            <div className="mt-8 pt-8 border-t border-slate-100 flex items-center justify-between">
              <Button onClick={() => onOpenChange(false)} variant="ghost" className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900">
                Close Hub
              </Button>
              <Button className="h-12 px-8 rounded-2xl bg-slate-900 text-white text-[10px] font-black uppercase tracking-widest hover:bg-slate-800 transition-all shadow-xl shadow-slate-900/10">
                Export Analysis <ChevronRight className="w-4 h-4 ml-2" />
              </Button>
            </div>
          </div>

        </div>
      </DialogContent>
    </Dialog>
  )
}
