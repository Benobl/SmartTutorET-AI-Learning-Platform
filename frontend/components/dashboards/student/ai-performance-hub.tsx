"use client"

import { useState, useEffect } from "react"
import {
  Zap, Target, TrendingUp, Sparkles, BrainCircuit,
  AlertCircle, CheckCircle2, BarChart3, RefreshCw,
  X, Award, BookOpen, Clock, Flame, ChevronRight
} from "lucide-react"
import { aiApi } from "@/lib/api"
import { Button } from "@/components/ui/button"
import * as DialogPrimitive from "@radix-ui/react-dialog"

interface AIPerformanceHubProps {
  isOpen: boolean
  onOpenChange: (open: boolean) => void
}

function getGradeInfo(score: number) {
  if (score >= 85) return { label: "Distinction", color: "#34d399", glow: "rgba(52,211,153,0.4)", arc: "#34d399" }
  if (score >= 70) return { label: "Merit",       color: "#38bdf8", glow: "rgba(56,189,248,0.4)", arc: "#38bdf8" }
  if (score >= 50) return { label: "Pass",         color: "#fbbf24", glow: "rgba(251,191,36,0.4)",  arc: "#fbbf24" }
  return             { label: "At Risk",           color: "#f87171", glow: "rgba(248,113,113,0.4)", arc: "#f87171" }
}

function AnimatedCircle({ value, loading }: { value: number; loading: boolean }) {
  const size = 180
  const strokeW = 10
  const r = (size - strokeW * 2) / 2
  const circ = 2 * Math.PI * r
  const offset = circ * (1 - Math.min(100, Math.max(0, value)) / 100)
  const g = getGradeInfo(value)

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg width={size} height={size} style={{ position: "absolute", top: 0, left: 0, transform: "rotate(-90deg)" }}>
        {/* Track */}
        <circle cx={size/2} cy={size/2} r={r} fill="none" stroke="rgba(255,255,255,0.07)" strokeWidth={strokeW} />
        {/* Glow */}
        {!loading && (
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={g.glow} strokeWidth={strokeW + 6}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ filter: "blur(6px)", transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        )}
        {/* Main arc */}
        {!loading && (
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke={g.arc} strokeWidth={strokeW}
            strokeDasharray={circ} strokeDashoffset={offset}
            strokeLinecap="round"
            style={{ transition: "stroke-dashoffset 1.4s cubic-bezier(0.34,1.56,0.64,1)" }}
          />
        )}
        {/* Spinner when loading */}
        {loading && (
          <circle
            cx={size/2} cy={size/2} r={r} fill="none"
            stroke="#38bdf8" strokeWidth={strokeW}
            strokeDasharray={`${circ * 0.25} ${circ * 0.75}`}
            strokeLinecap="round"
            style={{ animation: "spin 1s linear infinite", transformOrigin: "center" }}
          />
        )}
      </svg>
      <div style={{ position: "relative", zIndex: 1, textAlign: "center" }}>
        <div style={{ fontSize: 40, fontWeight: 900, color: "#fff", letterSpacing: "-2px", lineHeight: 1 }}>
          {loading ? "…" : `${Math.round(value)}%`}
        </div>
        <div style={{ fontSize: 10, fontWeight: 800, color: g.color, textTransform: "uppercase", letterSpacing: "0.15em", marginTop: 6 }}>
          {loading ? "Analyzing" : g.label}
        </div>
      </div>
    </div>
  )
}

const REC_ICONS = [TrendingUp, Target, Zap, BookOpen, Flame]
const REC_ACCENT = ["#38bdf8", "#818cf8", "#fbbf24", "#34d399", "#f87171"]

export function AIPerformanceHub({ isOpen, onOpenChange }: AIPerformanceHubProps) {
  const [loading, setLoading] = useState(false)
  const [data, setData] = useState<any>(null)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    if (isOpen && !data) fetchInsights()
  }, [isOpen])

  const fetchInsights = async () => {
    try {
      setLoading(true)
      setError(null)
      const res = await aiApi.getPerformanceInsights()
      if (res.success) setData(res.data)
      else throw new Error("Failed to load insights")
    } catch (err: any) {
      setError(err.message || "Unable to sync with Neural Engine")
    } finally {
      setLoading(false)
    }
  }

  const grade = data?.predicted_grade || 0
  const confidence = Math.round((data?.confidence_score || 0) * 100)
  const g = getGradeInfo(grade)
  const recs: string[] = data?.recommendations || []

  return (
    <DialogPrimitive.Root open={isOpen} onOpenChange={onOpenChange}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          style={{
            position: "fixed", inset: 0,
            background: "rgba(0,0,0,0.65)",
            backdropFilter: "blur(6px)",
            zIndex: 50,
            display: "flex", alignItems: "center", justifyContent: "center",
            padding: "16px"
          }}
        >
          <DialogPrimitive.Content
            aria-describedby={undefined}
            style={{
              position: "relative",
              width: "100%",
              maxWidth: 900,
              maxHeight: "calc(100vh - 32px)",
              borderRadius: 28,
              overflow: "hidden",
              display: "flex",
              flexDirection: "row",
              boxShadow: "0 40px 100px rgba(0,0,0,0.5)",
              outline: "none"
            }}
          >
            <DialogPrimitive.Title style={{ position: "absolute", width: 1, height: 1, overflow: "hidden", opacity: 0 }}>
              AI Performance Hub
            </DialogPrimitive.Title>

            {/* ══════════ LEFT PANEL ══════════ */}
            <div style={{
              width: 300, flexShrink: 0,
              background: "linear-gradient(160deg, #0c111d 0%, #0f172a 100%)",
              display: "flex", flexDirection: "column",
              padding: "32px 28px",
              position: "relative", overflow: "hidden"
            }}>
              {/* Ambient glows */}
              <div style={{ position:"absolute", top:-60, left:-40, width:200, height:200, background:"rgba(56,189,248,0.18)", borderRadius:"50%", filter:"blur(60px)", pointerEvents:"none" }} />
              <div style={{ position:"absolute", bottom:0, right:-20, width:160, height:160, background:"rgba(129,140,248,0.15)", borderRadius:"50%", filter:"blur(50px)", pointerEvents:"none" }} />

              {/* Header */}
              <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between", marginBottom:24, position:"relative", zIndex:1 }}>
                <div style={{ display:"flex", alignItems:"center", gap:10 }}>
                  <div style={{ width:36, height:36, borderRadius:12, background:"rgba(56,189,248,0.12)", border:"1px solid rgba(56,189,248,0.2)", display:"flex", alignItems:"center", justifyContent:"center" }}>
                    <BrainCircuit style={{ width:18, height:18, color:"#38bdf8" }} />
                  </div>
                  <div>
                    <div style={{ fontSize:9, fontWeight:900, color:"#38bdf8", textTransform:"uppercase", letterSpacing:"0.2em" }}>Neural Engine</div>
                    <div style={{ fontSize:9, color:"rgba(148,163,184,0.7)", fontWeight:700, textTransform:"uppercase", letterSpacing:"0.1em" }}>
                      {loading ? "Analyzing…" : data?.status || "Live"}
                    </div>
                  </div>
                </div>
                <DialogPrimitive.Close
                  style={{ width:28, height:28, borderRadius:"50%", background:"rgba(255,255,255,0.06)", border:"1px solid rgba(255,255,255,0.08)", display:"flex", alignItems:"center", justifyContent:"center", cursor:"pointer", color:"rgba(148,163,184,0.7)" }}
                >
                  <X style={{ width:14, height:14 }} />
                </DialogPrimitive.Close>
              </div>

              {/* Title */}
              <div style={{ marginBottom:28, position:"relative", zIndex:1 }}>
                <div style={{ fontSize:22, fontWeight:300, color:"#fff", lineHeight:1.2 }}>Performance</div>
                <div style={{ fontSize:22, fontWeight:900, color:"#fff", lineHeight:1.2 }}>Projection</div>
                <div style={{ fontSize:11, color:"rgba(148,163,184,0.6)", marginTop:8, lineHeight:1.5 }}>
                  Real-time academic forecasting powered by your behavioral metrics.
                </div>
              </div>

              {/* Circle */}
              <div style={{ display:"flex", justifyContent:"center", marginBottom:28, position:"relative", zIndex:1 }}>
                <AnimatedCircle value={grade} loading={loading} />
              </div>

              {/* 3 stat chips */}
              <div style={{ display:"grid", gridTemplateColumns:"1fr 1fr 1fr", gap:8, marginBottom:20, position:"relative", zIndex:1 }}>
                {[
                  { label:"Score",  val: `${Math.round(grade)}%` },
                  { label:"Grade",  val: g.label.slice(0,4) },
                  { label:"Conf.",  val: `${confidence}%` },
                ].map(({ label, val }) => (
                  <div key={label} style={{ background:"rgba(255,255,255,0.04)", border:"1px solid rgba(255,255,255,0.06)", borderRadius:12, padding:"10px 0", textAlign:"center" }}>
                    <div style={{ fontSize:13, fontWeight:900, color:"#fff" }}>{loading ? "…" : val}</div>
                    <div style={{ fontSize:8, fontWeight:700, color:"rgba(148,163,184,0.5)", textTransform:"uppercase", letterSpacing:"0.12em", marginTop:3 }}>{label}</div>
                  </div>
                ))}
              </div>

              {/* Confidence badge */}
              <div style={{ background:"rgba(255,255,255,0.04)", border:`1px solid ${g.color}30`, borderRadius:16, padding:"12px 14px", display:"flex", alignItems:"center", gap:10, position:"relative", zIndex:1 }}>
                <CheckCircle2 style={{ width:16, height:16, color:g.color, flexShrink:0 }} />
                <span style={{ fontSize:11, color:"rgba(203,213,225,0.85)", lineHeight:1.4 }}>
                  AI Confidence: <strong style={{ color:"#fff" }}>{loading ? "…" : `${confidence}%`}</strong> based on latest activity.
                </span>
              </div>
            </div>

            {/* ══════════ RIGHT PANEL ══════════ */}
            <div style={{ flex:1, background:"#fff", display:"flex", flexDirection:"column", minWidth:0 }}>
              {/* Top bar */}
              <div style={{ padding:"28px 32px 22px", borderBottom:"1px solid #f1f5f9", flexShrink:0, display:"flex", alignItems:"flex-start", justifyContent:"space-between", gap:16 }}>
                <div>
                  <div style={{ fontSize:20, fontWeight:900, color:"#0f172a", display:"flex", alignItems:"center", gap:8 }}>
                    AI Insight Hub <Sparkles style={{ width:18, height:18, color:"#38bdf8" }} />
                  </div>
                  <div style={{ fontSize:10, color:"#94a3b8", fontWeight:700, letterSpacing:"0.15em", textTransform:"uppercase", marginTop:4 }}>
                    Personalised Academic Intelligence
                  </div>
                </div>
                <button
                  onClick={fetchInsights}
                  disabled={loading}
                  style={{
                    display:"flex", alignItems:"center", gap:6, padding:"8px 14px",
                    borderRadius:12, border:"1px solid #e2e8f0",
                    background:"#f8fafc", cursor:"pointer",
                    fontSize:10, fontWeight:800, color:"#64748b",
                    textTransform:"uppercase", letterSpacing:"0.12em",
                    opacity: loading ? 0.5 : 1, flexShrink:0
                  }}
                >
                  <RefreshCw style={{ width:13, height:13, animation: loading ? "spin 1s linear infinite" : "none" }} />
                  Refresh
                </button>
              </div>

              {/* Scrollable body */}
              <div style={{ flex:1, overflowY:"auto", padding:"24px 32px", display:"flex", flexDirection:"column", gap:16 }}>

                {loading ? (
                  <div style={{ display:"flex", flexDirection:"column", gap:12 }}>
                    {[1,2,3].map(i => (
                      <div key={i} style={{ height:80, borderRadius:20, background:"#f8fafc", border:"1px solid #f1f5f9", animation:"pulse 1.5s ease-in-out infinite" }} />
                    ))}
                  </div>
                ) : error ? (
                  <div style={{ flex:1, display:"flex", flexDirection:"column", alignItems:"center", justifyContent:"center", gap:16, textAlign:"center", padding:"40px 0" }}>
                    <div style={{ width:60, height:60, borderRadius:"50%", background:"#fef2f2", display:"flex", alignItems:"center", justifyContent:"center" }}>
                      <AlertCircle style={{ width:30, height:30, color:"#f87171" }} />
                    </div>
                    <p style={{ fontSize:13, color:"#94a3b8", fontWeight:600, maxWidth:260 }}>{error}</p>
                    <button
                      onClick={fetchInsights}
                      style={{ padding:"10px 28px", borderRadius:999, border:"1px solid #e2e8f0", background:"#fff", fontSize:10, fontWeight:900, color:"#334155", cursor:"pointer", textTransform:"uppercase", letterSpacing:"0.1em" }}
                    >
                      Retry Connection
                    </button>
                  </div>
                ) : (
                  <>
                    {/* Section header */}
                    <div style={{ display:"flex", alignItems:"center", justifyContent:"space-between" }}>
                      <span style={{ fontSize:10, fontWeight:900, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.18em" }}>
                        Personalised Recommendations
                      </span>
                      <span style={{ padding:"3px 12px", borderRadius:999, background:"#eff6ff", border:"1px solid #bfdbfe", fontSize:10, fontWeight:800, color:"#2563eb", textTransform:"uppercase", letterSpacing:"0.1em" }}>
                        Action Required
                      </span>
                    </div>

                    {/* Recommendation cards */}
                    <div style={{ display:"flex", flexDirection:"column", gap:10 }}>
                      {recs.map((rec, i) => {
                        const Icon = REC_ICONS[i % REC_ICONS.length]
                        const accent = REC_ACCENT[i % REC_ACCENT.length]
                        return (
                          <div
                            key={i}
                            style={{
                              display:"flex", alignItems:"flex-start", gap:14,
                              padding:"16px 18px",
                              borderRadius:18,
                              border:"1px solid #f1f5f9",
                              background:"#f8fafc",
                              transition:"box-shadow 0.2s"
                            }}
                          >
                            <div style={{ width:36, height:36, borderRadius:10, background:`${accent}15`, border:`1px solid ${accent}25`, display:"flex", alignItems:"center", justifyContent:"center", flexShrink:0 }}>
                              <Icon style={{ width:16, height:16, color:accent }} />
                            </div>
                            <p style={{ fontSize:13, color:"#475569", fontWeight:500, lineHeight:1.6, paddingTop:2 }}>{rec}</p>
                          </div>
                        )
                      })}
                      {recs.length === 0 && (
                        <div style={{ textAlign:"center", color:"#cbd5e1", fontSize:13, padding:"40px 0" }}>No recommendations yet.</div>
                      )}
                    </div>

                    {/* Analytics card */}
                    <div style={{ background:"#0f172a", borderRadius:22, padding:"22px 24px", color:"#fff" }}>
                      <div style={{ display:"flex", alignItems:"center", gap:8, marginBottom:10 }}>
                        <BarChart3 style={{ width:15, height:15, color:"#38bdf8" }} />
                        <span style={{ fontSize:10, fontWeight:900, textTransform:"uppercase", letterSpacing:"0.15em", color:"#fff" }}>Growth Analytics</span>
                      </div>
                      <p style={{ fontSize:12, color:"rgba(148,163,184,0.85)", lineHeight:1.6 }}>
                        Your recent engagement shows a <strong style={{ color:"#34d399" }}>12% increase</strong> in active recall sessions. Keep this momentum for upcoming mid-terms.
                      </p>
                      <div style={{ borderTop:"1px solid rgba(255,255,255,0.06)", marginTop:14, paddingTop:12, display:"flex", justifyContent:"flex-end" }}>
                        <span style={{ fontSize:9, fontWeight:800, color:"rgba(100,116,139,0.7)", textTransform:"uppercase", letterSpacing:"0.12em" }}>2.4k students analysed</span>
                      </div>
                    </div>
                  </>
                )}
              </div>

              {/* Footer */}
              <div style={{ padding:"18px 32px", borderTop:"1px solid #f1f5f9", flexShrink:0, display:"flex", alignItems:"center", justifyContent:"space-between", background:"#fff" }}>
                <DialogPrimitive.Close
                  style={{ fontSize:10, fontWeight:900, color:"#94a3b8", textTransform:"uppercase", letterSpacing:"0.12em", background:"none", border:"none", cursor:"pointer", padding:"8px 0" }}
                >
                  Close Hub
                </DialogPrimitive.Close>
                <div style={{ display:"flex", alignItems:"center", gap:8 }}>
                  <div style={{ width:7, height:7, borderRadius:"50%", background:"#34d399", animation:"pulse 2s ease-in-out infinite" }} />
                  <span style={{ fontSize:9, fontWeight:900, color:"#10b981", textTransform:"uppercase", letterSpacing:"0.14em" }}>Live Data</span>
                </div>
              </div>
            </div>

          </DialogPrimitive.Content>
        </DialogPrimitive.Overlay>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
