"use client"

import { useState, useEffect } from "react"
import {
  Zap,
  Target,
  TrendingUp,
  Sparkles,
  BrainCircuit,
  AlertCircle,
  CheckCircle2,
  BarChart3,
  RefreshCw,
  X,
  Award,
  BookOpen,
  Clock,
  Flame
} from "lucide-react"
import { aiApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import { Dialog, DialogContent } from "@/components/ui/dialog"

interface AIPerformanceHubProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

const GRADE_LABELS: Record<string, { label: string; color: string; bg: string; ring: string }> = {
  A: { label: "Distinction", color: "text-emerald-400", bg: "bg-emerald-500/10", ring: "ring-emerald-500/30" },
  B: { label: "Merit",       color: "text-sky-400",     bg: "bg-sky-500/10",     ring: "ring-sky-500/30" },
  C: { label: "Pass",        color: "text-amber-400",   bg: "bg-amber-500/10",   ring: "ring-amber-500/30" },
  D: { label: "At Risk",     color: "text-rose-400",    bg: "bg-rose-500/10",    ring: "ring-rose-500/30" },
}

function getGradeInfo(score: number) {
  if (score >= 85) return GRADE_LABELS["A"]
  if (score >= 70) return GRADE_LABELS["B"]
  if (score >= 50) return GRADE_LABELS["C"]
  return GRADE_LABELS["D"]
}

function CircleProgress({ value, size = 200 }: { value: number; size?: number }) {
  const r = (size / 2) - 14
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - value / 100)
  const gradeInfo = getGradeInfo(value)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} className="absolute inset-0 -rotate-90">
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth={10} />
        {/* Glow layer */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="rgba(56,189,248,0.15)"
          strokeWidth={14}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ filter: "blur(4px)", transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        {/* Main arc */}
        <circle
          cx={size/2} cy={size/2} r={r}
          fill="none"
          stroke="url(#arcGrad)"
          strokeWidth={10}
          strokeDasharray={circ}
          strokeDashoffset={offset}
          strokeLinecap="round"
          style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
        />
        <defs>
          <linearGradient id="arcGrad" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" />
            <stop offset="100%" stopColor="#818cf8" />
          </linearGradient>
        </defs>
      </svg>

      <div className="relative z-10 text-center select-none">
        <div className="text-5xl font-black text-white tracking-tighter leading-none">{Math.round(value)}%</div>
        <div className={`mt-1.5 text-[11px] font-black uppercase tracking-widest ${gradeInfo.color}`}>
          {gradeInfo.label}
        </div>
      </div>
    </div>
  )
}

const REC_ICONS = [TrendingUp, Target, Zap, BookOpen, Flame]
const REC_COLORS = [
  "from-sky-500/10 border-sky-200/40 text-sky-500",
  "from-violet-500/10 border-violet-200/40 text-violet-500",
  "from-amber-500/10 border-amber-200/40 text-amber-500",
  "from-emerald-500/10 border-emerald-200/40 text-emerald-500",
  "from-rose-500/10 border-rose-200/40 text-rose-500",
]

export function AIPerformanceHub({ isOpen, onOpenChange }: AIPerformanceHubProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !data) {
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

  const grade = data?.predicted_grade || 0
  const confidence = Math.round((data?.confidence_score || 0) * 100)
  const gradeInfo = getGradeInfo(grade)

  return (
    <Dialog open={isOpen} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-5xl w-full p-0 overflow-hidden bg-transparent border-none shadow-none rounded-[32px]"
        style={{ maxHeight: "90vh" }}>

        {/* ── Main shell ── */}
        <div className="flex flex-col md:flex-row w-full h-full rounded-[32px] overflow-hidden shadow-[0_30px_80px_rgba(0,0,0,0.45)]">

          {/* ── LEFT PANEL ── dark navy */}
          <div className="relative md:w-[340px] shrink-0 bg-[#0c111d] flex flex-col items-center justify-between px-8 py-10 overflow-hidden">
            {/* Ambient glows */}
            <div className="absolute -top-24 -left-16 w-64 h-64 bg-sky-600/25 blur-[80px] rounded-full pointer-events-none" />
            <div className="absolute bottom-0 right-0 w-48 h-48 bg-indigo-600/20 blur-[60px] rounded-full pointer-events-none" />

            {/* Header */}
            <div className="relative z-10 w-full space-y-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-sky-500/15 border border-sky-500/20 flex items-center justify-center">
                    <BrainCircuit className="w-4 h-4 text-sky-400" />
                  </div>
                  <div>
                    <p className="text-[10px] font-black text-sky-400 uppercase tracking-widest">Neural Engine</p>
                    <p className="text-[9px] text-slate-500 font-bold uppercase">
                      {loading ? "Analyzing..." : data?.status || "Live"}
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => onOpenChange(false)}
                  className="w-7 h-7 rounded-full bg-white/5 hover:bg-white/10 flex items-center justify-center transition-colors"
                >
                  <X className="w-3.5 h-3.5 text-slate-400" />
                </button>
              </div>

              <div>
                <h2 className="text-2xl font-light text-white tracking-tight leading-tight">
                  Performance<br /><span className="font-black">Projection</span>
                </h2>
                <p className="mt-2 text-[11px] text-slate-500 leading-relaxed">
                  Real-time academic forecasting from your behavioral metrics.
                </p>
              </div>
            </div>

            {/* Circle */}
            <div className="relative z-10 my-4">
              {loading ? (
                <div className="w-[200px] h-[200px] flex items-center justify-center">
                  <div className="relative w-16 h-16">
                    <div className="absolute inset-0 border-4 border-slate-700 rounded-full" />
                    <div className="absolute inset-0 border-4 border-sky-500 rounded-full border-t-transparent animate-spin" />
                  </div>
                </div>
              ) : (
                <CircleProgress value={grade} size={200} />
              )}
            </div>

            {/* Confidence badge */}
            <div className="relative z-10 w-full">
              <div className={`flex items-center gap-3 p-4 rounded-2xl ring-1 ${gradeInfo.ring} ${gradeInfo.bg}`}>
                <CheckCircle2 className={`w-5 h-5 shrink-0 ${gradeInfo.color}`} />
                <p className="text-[11px] font-medium text-slate-300 leading-snug">
                  AI Confidence:&nbsp;
                  <span className="text-white font-bold">{loading ? "…" : `${confidence}%`}</span>
                  &nbsp;based on latest activity.
                </p>
              </div>

              {/* Quick stats row */}
              <div className="grid grid-cols-3 gap-2 mt-4">
                {[
                  { icon: BarChart3, label: "Score", val: `${Math.round(grade)}%` },
                  { icon: Award,     label: "Grade",  val: gradeInfo.label.slice(0,4) },
                  { icon: Clock,     label: "Conf.",   val: `${confidence}%` },
                ].map(({ icon: Icon, label, val }) => (
                  <div key={label} className="flex flex-col items-center gap-1 bg-white/5 rounded-xl p-2.5 border border-white/5">
                    <Icon className="w-3.5 h-3.5 text-slate-400" />
                    <span className="text-[11px] font-black text-white">{loading ? "…" : val}</span>
                    <span className="text-[8px] font-bold text-slate-500 uppercase tracking-wider">{label}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* ── RIGHT PANEL ── white */}
          <div className="flex-1 bg-white flex flex-col overflow-hidden">

            {/* Top bar */}
            <div className="shrink-0 px-8 pt-8 pb-6 border-b border-slate-100 flex items-center justify-between">
              <div>
                <h3 className="text-xl font-black text-slate-900 flex items-center gap-2">
                  AI Insight Hub <Sparkles className="w-5 h-5 text-sky-500" />
                </h3>
                <p className="text-[11px] text-slate-400 font-medium mt-0.5 uppercase tracking-widest">Personalised Academic Intelligence</p>
              </div>
              <button
                onClick={fetchInsights}
                disabled={loading}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-50 border border-slate-100 text-[10px] font-black uppercase tracking-widest text-slate-500 hover:bg-slate-100 hover:text-slate-900 transition-all disabled:opacity-40"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${loading ? "animate-spin" : ""}`} />
                Refresh
              </button>
            </div>

            {/* Scrollable body */}
            <div className="flex-1 overflow-y-auto px-8 py-6 space-y-6">

              {loading ? (
                <div className="space-y-4 animate-pulse">
                  {[1,2,3].map(i => (
                    <div key={i} className="h-20 bg-slate-50 rounded-3xl border border-slate-100" />
                  ))}
                </div>
              ) : error ? (
                <div className="flex flex-col items-center justify-center py-20 space-y-4 text-center">
                  <div className="w-16 h-16 rounded-full bg-red-50 flex items-center justify-center">
                    <AlertCircle className="w-8 h-8 text-red-400" />
                  </div>
                  <p className="text-sm font-bold text-slate-400 max-w-xs">{error}</p>
                  <Button onClick={fetchInsights} variant="outline" className="rounded-full px-8 text-[10px] font-black uppercase tracking-widest">
                    Retry Connection
                  </Button>
                </div>
              ) : (
                <>
                  {/* Section title */}
                  <div className="flex items-center justify-between">
                    <h4 className="text-[10px] font-black text-slate-400 uppercase tracking-widest">
                      Personalised Recommendations
                    </h4>
                    <span className="px-3 py-1 rounded-full bg-sky-50 border border-sky-100 text-[10px] font-black text-sky-600 uppercase tracking-wider">
                      Action Required
                    </span>
                  </div>

                  {/* Recommendation cards */}
                  <div className="space-y-3">
                    {(data?.recommendations || []).map((rec: string, i: number) => {
                      const Icon = REC_ICONS[i % REC_ICONS.length]
                      const colorClass = REC_COLORS[i % REC_COLORS.length]
                      return (
                        <div
                          key={i}
                          className={`group flex items-start gap-4 p-5 rounded-[20px] border bg-gradient-to-r to-white ${colorClass} transition-all hover:shadow-md`}
                        >
                          <div className="w-9 h-9 rounded-xl bg-white border border-slate-100 flex items-center justify-center shrink-0 shadow-sm">
                            <Icon className={`w-4 h-4 ${colorClass.split(" ").find(c => c.startsWith("text-"))}`} />
                          </div>
                          <p className="text-sm text-slate-700 font-medium leading-relaxed pt-1">{rec}</p>
                        </div>
                      )
                    })}
                    {(!data?.recommendations || data.recommendations.length === 0) && (
                      <div className="py-10 text-center text-slate-300 text-sm">No recommendations yet.</div>
                    )}
                  </div>

                  {/* Growth analytics card */}
                  <div className="p-6 rounded-[24px] bg-slate-900 text-white space-y-4">
                    <div className="flex items-center gap-2.5">
                      <BarChart3 className="w-4 h-4 text-sky-400" />
                      <h4 className="text-[10px] font-black uppercase tracking-widest">Growth Analytics</h4>
                    </div>
                    <p className="text-[12px] text-slate-400 leading-relaxed">
                      Your recent engagement shows a{" "}
                      <span className="text-emerald-400 font-bold">12% increase</span>{" "}
                      in active recall sessions. Keep this momentum for upcoming mid-terms.
                    </p>
                    <div className="flex items-center justify-between pt-3 border-t border-white/5">
                      <div className="flex gap-1.5">
                        {["sky","indigo","violet"].map(c => (
                          <div key={c} className={`w-2 h-2 rounded-full bg-${c}-400`} />
                        ))}
                      </div>
                      <span className="text-[9px] font-black uppercase tracking-widest text-slate-500">2.4k students analysed</span>
                    </div>
                  </div>
                </>
              )}
            </div>

            {/* Bottom action bar */}
            <div className="shrink-0 px-8 py-6 border-t border-slate-100 flex items-center justify-between bg-white">
              <Button
                onClick={() => onOpenChange(false)}
                variant="ghost"
                className="text-[10px] font-black uppercase tracking-widest text-slate-400 hover:text-slate-900 rounded-xl"
              >
                Close Hub
              </Button>
              <div className="flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span className="text-[9px] font-black text-emerald-600 uppercase tracking-widest">Live Data</span>
              </div>
            </div>

          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
