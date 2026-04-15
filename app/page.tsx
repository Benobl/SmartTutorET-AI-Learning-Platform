"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  GraduationCap, ArrowRight, Menu, X, Brain, ChevronRight,
  Sparkles, Users, TrendingUp, Award, Zap, BarChart3, Heart,
  Globe2, Video, Calculator, Atom, Book, FlaskConical, Languages,
  History, Target, Rocket, MessageSquare, Facebook, Twitter,
  Instagram, Linkedin, Youtube, PlayCircle, Moon, Sun, Star,
  ArrowUpRight, Send, Bot, Search, CheckCircle2, Lightbulb,
  BadgeCheck, Plus, Minus, BookOpen, Activity, Shield,
} from "lucide-react"
import { cn } from "@/lib/utils"

/* ─── Data ─── */
const ALL_FEATURES = [
  { icon: Brain, title: "Adaptive AI Tutor", desc: "Personalized paths that evolve in real-time with your pace and strengths.", benefits: ["24/7 AI Tutor", "Personalized Plans", "Instant Resolution"], accent: "#3B82F6" },
  { icon: Target, title: "National Exam Prep", desc: "Full prep for Ethiopian national exams — timed mocks, past papers, analytics.", benefits: ["Papers 2010–2025", "Mock Exams", "Score Analytics"], accent: "#8B5CF6" },
  { icon: Users, title: "Collaborative Learning", desc: "AI-matched study groups and peer discussions for deeper retention.", benefits: ["Smart Groups", "Peer Reviews", "Group Projects"], accent: "#EC4899" },
  { icon: BarChart3, title: "Performance Analytics", desc: "Live dashboards: track progress, map weaknesses, visualize exam readiness.", benefits: ["Live Progress", "Weakness Map", "Goal Tracking"], accent: "#10B981" },
  { icon: Video, title: "Live Expert Classes", desc: "Real-time sessions with top Ethiopian educators. Rewatch anytime.", benefits: ["Live Q&A", "Replays", "Expert Coaches"], accent: "#F59E0B" },
  { icon: Rocket, title: "Gamified Learning", desc: "Earn XP, unlock badges, climb leaderboards. Build daily streaks that stick.", benefits: ["XP & Badges", "Leaderboards", "Streak Rewards"], accent: "#06B6D4" },
]

const BASE_TESTIMONIALS = [
  { name: "Abebe Kebede", grade: "Grade 12", text: "Went from 65% to 92% in Mathematics in 3 months. The AI tutor is genuinely brilliant!", avatar: "AK", subject: "Mathematics" },
  { name: "Selam Tesfaye", grade: "Grade 11", text: "Physics simulations made every concept click instantly. Absolute best platform for Ethiopian students.", avatar: "ST", subject: "Physics" },
  { name: "Henok Mulugeta", grade: "Grade 10", text: "AI study groups connected me with top performers. Collaborative learning changed my results completely.", avatar: "HM", subject: "Chemistry" },
  { name: "Biniyam Solomon", grade: "Grade 12", text: "National exam mocks are elite level. My confidence before exams is now sky-high.", avatar: "BS", subject: "English" },
  { name: "Lydia Mekonnen", grade: "Grade 9", text: "Transitioning to high school was so smooth with the foundation lessons. Highly recommended!", avatar: "LM", subject: "Biology" },
  { name: "Dawit Alemu", grade: "Grade 11", text: "Having a personal AI tutor 24/7 transformed my study habits — and my grades.", avatar: "DA", subject: "History" },
]
const N = BASE_TESTIMONIALS.length // 6

// Triple-copy for seamless infinite carousel
const CAROUSEL_ITEMS = [...BASE_TESTIMONIALS, ...BASE_TESTIMONIALS, ...BASE_TESTIMONIALS]

const SUBJECTS = [
  { name: "Mathematics", icon: Calculator, color: "#3B82F6", students: 2345 },
  { name: "Physics", icon: Atom, color: "#8B5CF6", students: 1890 },
  { name: "Chemistry", icon: FlaskConical, color: "#EC4899", students: 1678 },
  { name: "Biology", icon: Book, color: "#10B981", students: 1456 },
  { name: "English", icon: Languages, color: "#F59E0B", students: 2123 },
  { name: "History", icon: History, color: "#6366F1", students: 1234 },
]
const COURSES = [
  { grade: "Grade 12", subject: "Advanced Mathematics", teacher: "Ato Daniel Abebe", students: "2.4K", rating: 4.9, emoji: "🧮", tag: "Most Popular" },
  { grade: "Grade 11", subject: "Physics — Mechanics", teacher: "Dr. Lemlem Hailu", students: "1.8K", rating: 4.8, emoji: "⚛️", tag: "Live Sessions" },
  { grade: "Grade 10", subject: "Organic Chemistry", teacher: "Ms. Sara Johnson", students: "3.1K", rating: 4.9, emoji: "🔬", tag: "Top Rated" },
  { grade: "Grade 9", subject: "Intro to Biology", teacher: "Dr. Alem Bekele", students: "2.2K", rating: 4.7, emoji: "🧬", tag: "Beginner" },
  { grade: "Grade 12", subject: "English Literature", teacher: "Ms. Hiwot Desta", students: "1.5K", rating: 4.8, emoji: "📖", tag: "Exam Focused" },
  { grade: "Grade 11", subject: "Ethiopian History", teacher: "Ato Yonas Alemu", students: "980", rating: 4.7, emoji: "🏛️", tag: "New" },
]

/* ─── Scroll-reveal hook ─── */
function useScrollReveal() {
  useEffect(() => {
    const els = document.querySelectorAll(".sr, .sr-l, .sr-r, .sr-s")
    const io = new IntersectionObserver((entries) => {
      entries.forEach(e => { if (e.isIntersecting) { e.target.classList.add("in-view"); io.unobserve(e.target) } })
    }, { threshold: 0.1, rootMargin: "0px 0px -48px 0px" })
    els.forEach(el => io.observe(el))
    return () => io.disconnect()
  })
}

/* ─── Wave components ─── */
// Gentle wave (inspired by image 1 — WildBLOOM organic curves)
function WaveGentle({ fill = "#ffffff", flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <div className={cn("absolute left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none z-10", flip ? "top-0 rotate-180" : "bottom-0")}>
      <svg viewBox="0 0 1440 90" preserveAspectRatio="none" className="block w-full h-14 lg:h-20" style={{ fill }}>
        <path d="M0,45 C120,90 280,0 480,45 C680,90 820,20 1000,55 C1120,75 1280,30 1440,45 L1440,90 L0,90 Z" />
      </svg>
    </div>
  )
}

// Dramatic wave (inspired by image 2 — IVASAP large bold curves)
function WaveDramatic({ fill = "#ffffff", flip = false }: { fill?: string; flip?: boolean }) {
  return (
    <div className={cn("absolute left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none z-10", flip ? "top-0 rotate-180" : "bottom-0")}>
      <svg viewBox="0 0 1440 140" preserveAspectRatio="none" className="block w-full h-24 lg:h-36" style={{ fill }}>
        <path d="M0,0 C360,140 1080,140 1440,0 L1440,140 L0,140 Z" />
      </svg>
    </div>
  )
}

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [isDarkMode, setIsDarkMode] = useState(true)
  const [scrolled, setScrolled] = useState(false)
  const [showAll, setShowAll] = useState(false)

  // Infinite carousel: start at the middle copy (index = N = 6)
  const [tIdx, setTIdx] = useState(N)
  const [animated, setAnimated] = useState(true)
  const timerRef = useRef<NodeJS.Timeout | null>(null)
  const jumpPending = useRef(false)

  useScrollReveal()
  useEffect(() => { document.documentElement.classList.toggle("dark", isDarkMode) }, [isDarkMode])
  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  // After a transition ends, check if we need to silently jump to the real copy
  const afterTransition = (nextIdx: number) => {
    setTimeout(() => {
      if (nextIdx >= N * 2) {
        setAnimated(false)
        setTIdx(nextIdx - N)
        setTimeout(() => setAnimated(true), 20)
      } else if (nextIdx < N) {
        setAnimated(false)
        setTIdx(nextIdx + N)
        setTimeout(() => setAnimated(true), 20)
      }
    }, 720)
  }

  const go = (dir: 1 | -1) => {
    if (timerRef.current) clearInterval(timerRef.current)
    const next = tIdx + dir
    setAnimated(true)
    setTIdx(next)
    afterTransition(next)
    startAutoPlay()
  }

  const startAutoPlay = () => {
    timerRef.current = setInterval(() => {
      setTIdx(prev => {
        const next = prev + 1
        afterTransition(next)
        return next
      })
    }, 3800)
  }

  useEffect(() => {
    startAutoPlay()
    return () => { if (timerRef.current) clearInterval(timerRef.current) }
  }, [])

  const dark = isDarkMode
  const visibleFeatures = showAll ? ALL_FEATURES : ALL_FEATURES.slice(0, 3)

  return (
    <div style={{ background: dark ? "#020617" : "#f8fafc" }} className="min-h-screen transition-colors duration-500 overflow-x-hidden text-slate-900 dark:text-slate-100">

      {/* ── NAVBAR ── */}
      <header className={cn("fixed top-0 inset-x-0 z-[100] transition-all duration-300",
        scrolled ? (dark ? "bg-slate-950/90 backdrop-blur-2xl border-b border-slate-800/50 shadow-xl shadow-black/30" : "bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 shadow-md") : "bg-transparent")}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30 group-hover:scale-110 transition-transform">
              <GraduationCap className="w-6 h-6 text-white" />
            </div>
            <span className="text-xl font-black tracking-tight">SmartTutor<span className="text-blue-400">ET</span></span>
          </Link>
          <nav className="hidden lg:flex items-center gap-1">
            {["Features", "Courses", "Testimonials", "About"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-blue-400 hover:bg-blue-400/8 transition-all">{item}</a>
            ))}
          </nav>
          <div className="flex items-center gap-3">
            <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-slate-800 border border-slate-200 dark:border-slate-700 hover:scale-110 active:scale-90 transition-all">
              {dark ? <Sun className="w-5 h-5 text-amber-400" /> : <Moon className="w-5 h-5 text-slate-500" />}
            </button>
            <div className="hidden lg:flex gap-3">
              <Link href="/login"><Button variant="ghost" className="font-bold text-slate-500 hover:text-blue-400 rounded-xl h-10">Sign In</Button></Link>
              <Link href="/signup">
                <Button className="bg-blue-500 hover:bg-blue-400 text-white font-black rounded-xl h-10 px-7 shadow-lg shadow-blue-500/20 hover:-translate-y-0.5 transition-all">
                  Get Started <ArrowRight className="ml-2 w-4 h-4" />
                </Button>
              </Link>
            </div>
            <button onClick={() => setMobileMenuOpen(!mobileMenuOpen)} className="lg:hidden p-2 rounded-xl bg-slate-100 dark:bg-slate-800">
              {mobileMenuOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>
        {mobileMenuOpen && (
          <div className="lg:hidden absolute top-20 inset-x-0 bg-white dark:bg-slate-900 border-b border-slate-100 dark:border-slate-800 p-6 shadow-2xl space-y-3">
            {["Features", "Courses", "Testimonials", "About"].map(item => (
              <a key={item} href={`#${item.toLowerCase()}`} onClick={() => setMobileMenuOpen(false)} className="block p-3.5 rounded-2xl font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all">{item}</a>
            ))}
            <div className="grid grid-cols-2 gap-3 pt-4 border-t border-slate-100 dark:border-slate-800">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-2xl h-12 font-bold">Sign In</Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-2xl h-12 bg-blue-500 text-white font-black">Join Free</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ── HERO ── */}
      <section style={{ background: dark ? "#020617" : "#f8fafc" }} className="relative pt-44 pb-48 lg:pt-56 lg:pb-56 overflow-hidden">
        <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-blue-500/8 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/4 pointer-events-none" />
        <div className="absolute bottom-0 right-0 w-[600px] h-[600px] bg-violet-500/6 rounded-full blur-[180px] translate-x-1/3 translate-y-1/4 pointer-events-none" />

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            {/* Left */}
            <div className="sr-l space-y-9">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em]">
                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                Ethiopia's #1 AI Platform for High Schools
              </div>
              <h1 className="text-5xl lg:text-6xl xl:text-[70px] font-black leading-[0.88] tracking-tighter">
                Master Your<br />Future<br />
                <span className="bg-gradient-to-r from-blue-400 via-blue-300 to-violet-400 bg-clip-text text-transparent">
                  With SmartTutorET.
                </span>
              </h1>
              <p className="text-lg text-slate-500 dark:text-slate-400 font-medium max-w-md leading-relaxed">
                AI tutoring, live expert classes, and smart analytics — built for Ethiopian students in Grades 9–12.
              </p>
              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-14 px-9 rounded-2xl bg-blue-400 hover:bg-blue-300 text-white font-black text-base shadow-2xl shadow-blue-400/35 hover:-translate-y-1 transition-all group border-0">
                    Start Learning Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-14 px-9 rounded-2xl border-2 border-slate-200 dark:border-slate-800 font-bold text-base hover:border-blue-400/40 hover:bg-blue-400/5 transition-all">
                  <PlayCircle className="mr-2 w-5 h-5 text-blue-400" /> Watch Demo
                </Button>
              </div>
              <div className="flex items-center gap-10 pt-2">
                {[{ val: "15K+", label: "Students" }, { val: "98%", label: "Pass Rate" }, { val: "24/7", label: "AI Support" }].map((s, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-blue-400 mb-1">{s.val}</div>
                    <div className="text-[10px] font-black uppercase tracking-[0.2em] text-slate-400">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right: Creative AI Card */}
            <div className="sr-r relative">
              <div className="absolute -inset-8 bg-gradient-to-br from-blue-500/15 via-violet-500/10 to-pink-500/8 rounded-[64px] blur-3xl" />
              <div className={cn("relative rounded-[44px] overflow-hidden shadow-2xl", dark ? "bg-slate-900 border border-slate-800" : "bg-white border border-slate-200")}>
                <div className="flex items-center justify-between px-7 pt-6 pb-5 border-b border-slate-100 dark:border-slate-800">
                  <div className="flex items-center gap-3">
                    <div className="relative">
                      <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/30">
                        <Bot className="w-5 h-5 text-white" />
                      </div>
                      <div className="absolute -bottom-0.5 -right-0.5 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-white dark:border-slate-900 animate-pulse" />
                    </div>
                    <div>
                      <div className={cn("text-sm font-black", dark ? "text-white" : "text-slate-900")}>SmartTutor AI</div>
                      <div className="text-[10px] text-emerald-400 font-black uppercase tracking-widest">Active · Grade 12</div>
                    </div>
                  </div>
                  <div className={cn("flex items-center gap-1.5 px-3 py-1.5 rounded-full text-[10px] font-black", dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-500")}>
                    <Activity className="w-3 h-3 text-blue-400" /> AI Thinking...
                  </div>
                </div>

                <div className="p-7 space-y-4">
                  <div className="flex gap-3 items-end max-w-[85%]">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className={cn("rounded-3xl rounded-bl-sm px-5 py-3.5 text-sm font-medium leading-relaxed", dark ? "bg-slate-800 text-slate-200" : "bg-slate-100 text-slate-700")}>
                      👋 Hey! Ready to crush Calculus today?
                    </div>
                  </div>
                  <div className="flex gap-3 items-end flex-row-reverse max-w-[80%] ml-auto">
                    <div className="w-7 h-7 rounded-xl bg-violet-400/15 flex items-center justify-center flex-shrink-0">
                      <span className="text-[9px] font-black text-violet-400">You</span>
                    </div>
                    <div className="rounded-3xl rounded-br-sm px-5 py-3.5 text-sm font-bold bg-blue-500 text-white shadow-lg shadow-blue-500/25">
                      Yes! Explain Derivatives simply 📐
                    </div>
                  </div>
                  <div className="flex gap-3 items-end max-w-[92%]">
                    <div className="w-7 h-7 rounded-xl bg-blue-500/15 flex items-center justify-center flex-shrink-0">
                      <Brain className="w-3.5 h-3.5 text-blue-400" />
                    </div>
                    <div className={cn("rounded-3xl rounded-bl-sm px-5 py-4 text-sm font-medium leading-relaxed border-l-[3px] border-blue-400", dark ? "bg-slate-800 text-slate-200" : "bg-slate-50 text-slate-700")}>
                      A <span className="text-blue-400 font-black">derivative</span> = rate of change. <br />
                      <span className="font-mono text-xs mt-1 block opacity-70">d/dx(xⁿ) = n·xⁿ⁻¹</span>
                    </div>
                  </div>

                  <div className={cn("rounded-2xl p-5 space-y-3", dark ? "bg-slate-800/70 border border-slate-700/40" : "bg-slate-50 border border-slate-200")}>
                    <div className="flex items-center justify-between mb-1">
                      <span className="text-[10px] font-black uppercase tracking-widest text-slate-400">Today's Momentum</span>
                      <span className="text-[10px] font-black text-amber-400">🔥 5-Day Streak</span>
                    </div>
                    {[{ s: "Calculus", p: 74, c: "#3B82F6" }, { s: "Physics", p: 58, c: "#8B5CF6" }, { s: "Chemistry", p: 91, c: "#10B981" }].map((x, i) => (
                      <div key={i} className="space-y-1.5">
                        <div className="flex justify-between text-xs font-black">
                          <span className={dark ? "text-slate-300" : "text-slate-600"}>{x.s}</span>
                          <span style={{ color: x.c }}>{x.p}%</span>
                        </div>
                        <div className={cn("h-1.5 rounded-full overflow-hidden", dark ? "bg-slate-700" : "bg-slate-200")}>
                          <div className="h-full rounded-full transition-all duration-1000" style={{ width: `${x.p}%`, background: x.c }} />
                        </div>
                      </div>
                    ))}
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {["Explain this 🤔", "Give me a quiz ✏️", "Study plan 📅"].map(chip => (
                      <button key={chip} className={cn("px-4 py-2 rounded-full text-xs font-black border transition-all hover:scale-105 active:scale-95", dark ? "bg-slate-800 border-slate-700 text-slate-300 hover:border-blue-400 hover:text-blue-400" : "bg-white border-slate-200 text-slate-500 hover:border-blue-400 hover:text-blue-500")}>{chip}</button>
                    ))}
                  </div>

                  <div className={cn("flex gap-3 rounded-2xl p-2.5", dark ? "bg-slate-800" : "bg-slate-100")}>
                    <div className="flex-1 flex items-center gap-2 px-3 text-xs text-slate-400 font-medium">
                      <Search className="w-3.5 h-3.5 flex-shrink-0" /> Ask your AI tutor anything...
                    </div>
                    <button className="w-9 h-9 rounded-xl bg-blue-500 hover:bg-blue-400 flex items-center justify-center text-white shadow-lg shadow-blue-500/30 active:scale-90 transition-all">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              </div>
              <div className={cn("absolute -top-5 -right-5 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl border animate-float", dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span className={cn("text-xs font-black", dark ? "text-white" : "text-slate-800")}>AI-Powered</span>
              </div>
              <div className={cn("absolute -bottom-5 -left-5 flex items-center gap-2 px-4 py-2.5 rounded-2xl shadow-2xl border animate-float-slow", dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                <Shield className="w-4 h-4 text-emerald-400" />
                <span className={cn("text-xs font-black", dark ? "text-white" : "text-slate-800")}>98% Success</span>
              </div>
            </div>
          </div>
        </div>

        {/* Dramatic wave bottom — IVASAP style */}
        <WaveDramatic fill={dark ? "#0f172a" : "#ffffff"} />
      </section>

      {/* ── FEATURES ── */}
      <section id="features" style={{ background: dark ? "#0f172a" : "#ffffff" }} className="pt-16 pb-44 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
          <div className="text-center mb-20 sr space-y-5">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400 text-[11px] font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Platform Features
            </div>
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.9]">
              Smart Tools For <span className="text-blue-400">Fast Learning</span>
            </h2>
            <p className={cn("text-lg font-medium max-w-xl mx-auto leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
              AI + expert teaching working together to help you achieve top grades.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
            {visibleFeatures.map((f, i) => (
              <div
                key={f.title}
                className={cn(
                  "group sr p-9 rounded-[40px] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer",
                  dark ? "bg-white/5 border-slate-800 hover:border-blue-400/30 hover:bg-slate-800/60" : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white"
                )}
                style={{ transitionDelay: `${(i % 3) * 80}ms` }}
              >
                <div className="w-14 h-14 rounded-3xl flex items-center justify-center mb-8 group-hover:scale-110 group-hover:rotate-6 transition-all duration-500" style={{ backgroundColor: `${f.accent}18`, border: `1.5px solid ${f.accent}30` }}>
                  <f.icon className="w-7 h-7" style={{ color: f.accent }} />
                </div>
                <h3 className="text-xl font-black mb-3 group-hover:text-blue-400 transition-colors">{f.title}</h3>
                <p className={cn("text-sm font-medium mb-7 leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>{f.desc}</p>
                <div className="space-y-2.5">
                  {f.benefits.map(b => (
                    <div key={b} className="flex items-center gap-3 text-sm font-bold">
                      <CheckCircle2 className="w-4 h-4 flex-shrink-0" style={{ color: f.accent }} />
                      <span className={dark ? "text-slate-300" : "text-slate-600"}>{b}</span>
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Single centered toggle */}
          <div className="flex justify-center mt-14 sr">
            <button
              onClick={() => setShowAll(p => !p)}
              className={cn(
                "group flex items-center gap-3 px-10 py-4 rounded-full font-black text-sm transition-all duration-300 active:scale-95 border-2 hover:-translate-y-1 shadow-lg",
                showAll
                  ? "border-slate-300 dark:border-slate-700 text-slate-500 dark:text-slate-400 hover:border-red-400 hover:text-red-400 bg-white dark:bg-transparent"
                  : "border-blue-400/30 hover:border-blue-400 text-blue-400 bg-blue-400/8 hover:bg-blue-400 hover:text-white hover:shadow-blue-400/30"
              )}
            >
              {showAll
                ? <><Minus className="w-4 h-4" /> View Less</>
                : <><Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> View All 6 Features</>
              }
            </button>
          </div>
        </div>

        {/* Gentle wave — WildBLOOM style */}
        <WaveGentle fill={dark ? "#020617" : "#f1f5f9"} />
      </section>

      {/* ── SUBJECTS + COURSES ── */}
      <section id="courses" style={{ background: dark ? "#020617" : "#f1f5f9" }} className="pt-12 pb-48 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-16 sr space-y-5">
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight">
              All Subjects. <span className="text-blue-400">One Platform.</span>
            </h2>
          </div>

          {/* Diagonal wave-banner — inspired by image 1 */}
          <div className="relative mb-16 sr overflow-hidden rounded-3xl">
            <div className="flex items-center gap-0 overflow-hidden">
              {/* Repeating marquee band */}
              <div className={cn("w-full py-4 flex items-center gap-12 overflow-hidden relative", dark ? "bg-slate-900" : "bg-white")}>
                <div className="flex items-center gap-10 animate-marquee whitespace-nowrap">
                  {[...SUBJECTS, ...SUBJECTS, ...SUBJECTS].map((s, i) => {
                    const Icon = s.icon
                    return (
                      <div key={i} className="flex items-center gap-2.5 flex-shrink-0">
                        <Icon className="w-4 h-4 flex-shrink-0" style={{ color: s.color }} />
                        <span className={cn("text-sm font-black uppercase tracking-widest", dark ? "text-slate-300" : "text-slate-600")}>{s.name}</span>
                        <span className="text-slate-400 mx-2">·</span>
                      </div>
                    )
                  })}
                </div>
              </div>
            </div>
          </div>

          {/* Subject pills */}
          <div className="flex flex-wrap justify-center gap-4 mb-20 sr">
            {SUBJECTS.map((s, i) => {
              const Icon = s.icon
              return (
                <div key={i} className={cn("group flex items-center gap-3 px-6 py-3.5 rounded-full border-2 cursor-pointer transition-all duration-300 hover:-translate-y-1 hover:shadow-xl active:scale-95", dark ? "bg-slate-900 border-slate-800 hover:border-blue-400" : "bg-white border-slate-200 hover:border-blue-400")} style={{ transitionDelay: `${i * 50}ms` }}>
                  <div className="w-8 h-8 rounded-full flex items-center justify-center transition-transform group-hover:scale-110" style={{ background: `${s.color}20` }}>
                    <Icon className="w-4 h-4" style={{ color: s.color }} />
                  </div>
                  <span className={cn("font-black text-sm group-hover:text-blue-400 transition-colors", dark ? "text-slate-300" : "text-slate-700")}>{s.name}</span>
                  <span className="text-[10px] font-black text-slate-400">{(s.students / 1000).toFixed(1)}K</span>
                </div>
              )
            })}
          </div>

          {/* Courses — no top border */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {COURSES.map((c, i) => (
              <div key={i} className={cn("group sr rounded-[36px] overflow-hidden border-2 border-transparent cursor-pointer transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl", dark ? "bg-slate-900 hover:border-blue-400/20" : "bg-white hover:border-blue-200 hover:shadow-blue-100")} style={{ transitionDelay: `${(i % 3) * 80}ms` }}>
                <div className="p-8">
                  <div className="flex items-start justify-between mb-5">
                    <span className="text-5xl">{c.emoji}</span>
                    <div className="flex flex-col items-end gap-2">
                      <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-400/10 text-blue-400">{c.grade}</span>
                      <span className={cn("px-3 py-1 rounded-full text-[10px] font-black uppercase", dark ? "bg-slate-800 text-slate-400" : "bg-slate-100 text-slate-400")}>{c.tag}</span>
                    </div>
                  </div>
                  <h3 className={cn("text-xl font-black mb-2 group-hover:text-blue-400 transition-colors", dark ? "text-white" : "text-slate-900")}>{c.subject}</h3>
                  <p className="text-slate-400 text-sm font-bold mb-6">By {c.teacher}</p>
                  <div className={cn("flex items-center justify-between pt-5 border-t", dark ? "border-slate-800" : "border-slate-100")}>
                    <div className="flex items-center gap-1.5 text-sm font-bold text-slate-400"><Users className="w-4 h-4" /> {c.students}</div>
                    <div className="flex items-center gap-1 text-amber-400 font-black text-sm"><Star className="w-4 h-4 fill-amber-400" /> {c.rating}</div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        <WaveDramatic fill={dark ? "#0f172a" : "#ffffff"} />
      </section>

      {/* ── AI TUTOR SECTION ── */}
      <section style={{ background: dark ? "#0f172a" : "#ffffff" }} className="pt-20 pb-48 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute top-1/3 right-0 w-80 h-80 bg-violet-500/5 rounded-full blur-[120px]" />
          <div className="absolute bottom-1/3 left-0 w-80 h-80 bg-pink-500/5 rounded-full blur-[120px]" />
        </div>

        <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
          <div className="grid lg:grid-cols-2 gap-24 items-center">
            <div className="sr-l space-y-10">
              <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-violet-400/10 border border-violet-400/20 text-violet-400">
                <Brain className="w-4 h-4" /> Next-Gen AI Integration
              </div>
              <h2 className="text-6xl lg:text-7xl font-black leading-[0.85] tracking-tighter">
                Train Your<br />Brain With<br /><span className="text-violet-400">SmartAI.</span>
              </h2>
              <p className={cn("text-xl font-medium max-w-xl leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
                One conversation to find your perfect tutor, get visual explanations, and build your entire study plan automatically.
              </p>
              <div className={cn("p-8 rounded-[40px] border space-y-6", dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                <div className="flex items-start gap-5">
                  <div className="w-12 h-12 rounded-3xl bg-violet-400/15 border border-violet-400/20 flex items-center justify-center flex-shrink-0">
                    <Lightbulb className="w-6 h-6 text-violet-400" />
                  </div>
                  <div className="space-y-3">
                    <p className={cn("font-black text-base leading-snug", dark ? "text-white" : "text-slate-800")}>"Which tutor is best for Grade 12 Physics?"</p>
                    <div className={cn("p-5 rounded-2xl text-sm font-medium leading-relaxed border-l-[3px] border-violet-400", dark ? "bg-slate-800 text-slate-200" : "bg-white text-slate-600 shadow-sm")}>
                      🏆 Scanning 500+ educators... <strong className="text-violet-400">Dr. Alem Bekele</strong> — 99% success rate, live in 20 min. <span className="text-blue-400 cursor-pointer">Book now?</span>
                    </div>
                  </div>
                </div>
              </div>
              <div className="flex flex-wrap gap-3">
                {["Find a Tutor", "Explain a Topic", "Build Study Plan", "Mock Exam Help"].map(tag => (
                  <span key={tag} className={cn("px-5 py-2.5 rounded-full text-sm font-black border cursor-pointer transition-all hover:scale-105 active:scale-95 hover:border-violet-400 hover:text-violet-400", dark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-slate-100 border-slate-200 text-slate-500")}>{tag}</span>
                ))}
              </div>
            </div>

            <div className="sr-r relative">
              <div className="absolute -inset-6 bg-violet-500/6 rounded-[72px] blur-2xl pointer-events-none" />
              <div className={cn("relative rounded-[56px] overflow-hidden shadow-2xl border", dark ? "bg-slate-900 border-slate-800" : "bg-slate-50 border-slate-200")}>
                <div className={cn("flex items-center justify-between px-8 pt-8 pb-6 border-b", dark ? "border-slate-800" : "border-slate-200")}>
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 rounded-3xl bg-violet-400/15 border border-violet-400/20 flex items-center justify-center">
                      <Bot className="w-6 h-6 text-violet-400" />
                    </div>
                    <div>
                      <div className={cn("font-black text-base", dark ? "text-white" : "text-slate-900")}>SmartTutor AI</div>
                      <div className="text-[10px] text-violet-400 font-black uppercase tracking-widest flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-violet-400 animate-pulse inline-block" /> Training In Progress
                      </div>
                    </div>
                  </div>
                  <BadgeCheck className="w-6 h-6 text-violet-400" />
                </div>
                <div className="p-8 space-y-6">
                  <div className={cn("relative rounded-2xl border-2 transition-all focus-within:border-violet-400", dark ? "bg-slate-800 border-slate-700" : "bg-white border-slate-200")}>
                    <input type="text" placeholder="Find a tutor or ask anything..." className="w-full h-14 bg-transparent px-5 pr-14 text-sm font-bold placeholder:text-slate-400 focus:outline-none" />
                    <button className="absolute right-3 top-2.5 w-9 h-9 bg-violet-400 hover:bg-violet-300 rounded-xl flex items-center justify-center text-white transition-all active:scale-90">
                      <Send className="w-4 h-4" />
                    </button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      { icon: Target, label: "Find Best Tutor", color: "#8B5CF6" },
                      { icon: BookOpen, label: "Study Plan", color: "#3B82F6" },
                      { icon: Award, label: "Practice Test", color: "#10B981" },
                      { icon: Lightbulb, label: "Explain Topic", color: "#F59E0B" },
                    ].map(t => (
                      <button key={t.label} className={cn("flex items-center gap-3 p-4 rounded-2xl font-black text-sm border-2 border-transparent transition-all hover:-translate-y-0.5 hover:shadow-lg active:scale-95", dark ? "bg-slate-800 text-slate-300" : "bg-white text-slate-600 shadow-sm")}>
                        <t.icon className="w-5 h-5 flex-shrink-0" style={{ color: t.color }} />
                        <span className="text-xs">{t.label}</span>
                      </button>
                    ))}
                  </div>
                  <div className={cn("flex items-center gap-3 p-4 rounded-2xl", dark ? "bg-slate-800" : "bg-slate-100")}>
                    <div className="flex gap-1.5 flex-shrink-0">
                      {["#3B82F6", "#8B5CF6", "#EC4899", "#10B981", "#F59E0B"].map((c, i) => (
                        <div key={c} className="w-2 h-2 rounded-full" style={{ background: c, animation: `bounce ${0.8 + i * 0.15}s infinite` }} />
                      ))}
                    </div>
                    <p className="text-xs font-bold text-slate-400">Trained on the full Ethiopian curriculum — all grades & subjects</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        <WaveGentle fill={dark ? "#020617" : "#f1f5f9"} />
      </section>

      {/* ── TESTIMONIALS ── */}
      <section id="testimonials" style={{ background: dark ? "#020617" : "#f1f5f9" }} className="pt-12 pb-48 relative">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20 sr space-y-5">
            <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">
              Real Impact. <span className="text-blue-400">Real Success.</span>
            </h2>
            <p className={cn("text-lg font-medium", dark ? "text-slate-400" : "text-slate-500")}>
              15,000+ students across Ethiopia. Here's what they say.
            </p>
          </div>

          {/* Infinite Carousel */}
          <div className="sr-s relative group">
            <div className="overflow-hidden">
              <div
                className="flex"
                style={{
                  transform: `translateX(-${tIdx * (100 / 3)}%)`,
                  transition: animated ? "transform 0.7s cubic-bezier(0.25, 1, 0.5, 1)" : "none",
                }}
              >
                {CAROUSEL_ITEMS.map((t, i) => (
                  <div key={i} className="min-w-[100%] lg:min-w-[33.333%] px-3 py-4">
                    <div className={cn("flex flex-col justify-between p-8 rounded-[36px] border-2 border-transparent transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full", dark ? "bg-slate-900 hover:border-blue-400/20" : "bg-white hover:border-blue-200 hover:shadow-blue-50")}>
                      <div className="space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex gap-1">
                            {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                          </div>
                          <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-400/10 text-blue-400">{t.subject}</span>
                        </div>
                        <p className={cn("text-sm font-bold italic leading-relaxed line-clamp-3", dark ? "text-slate-300" : "text-slate-600")}>"{t.text}"</p>
                      </div>
                      <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-slate-800">
                        <div className="w-12 h-12 rounded-2xl bg-blue-500 flex items-center justify-center text-white font-black text-base shadow-lg shadow-blue-500/20 flex-shrink-0">
                          {t.avatar}
                        </div>
                        <div className="min-w-0">
                          <p className={cn("font-black text-sm truncate", dark ? "text-white" : "text-slate-900")}>{t.name}</p>
                          <p className="text-[10px] text-blue-400 font-black uppercase tracking-widest truncate">{t.grade}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            <button onClick={() => go(-1)} className={cn("absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl z-20 hover:bg-blue-400 hover:border-blue-400 hover:text-white", dark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500")}>
              <ChevronRight className="w-5 h-5 rotate-180" />
            </button>
            <button onClick={() => go(1)} className={cn("absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl z-20 hover:bg-blue-400 hover:border-blue-400 hover:text-white", dark ? "bg-slate-900 border-slate-800 text-slate-400" : "bg-white border-slate-200 text-slate-500")}>
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots — based on base 6 */}
          <div className="flex justify-center gap-3 mt-10">
            {BASE_TESTIMONIALS.map((_, i) => (
              <button key={i} onClick={() => { setTIdx(N + i); if (timerRef.current) clearInterval(timerRef.current); startAutoPlay() }}
                className={cn("h-1.5 rounded-full transition-all duration-500", (tIdx % N) === i ? "w-10 bg-blue-400 shadow-lg shadow-blue-400/40" : "w-1.5 bg-slate-300 dark:bg-slate-700 hover:bg-blue-300")} />
            ))}
          </div>
        </div>

        <WaveDramatic fill={dark ? "#0f172a" : "#ffffff"} />
      </section>

      {/* ── CTA — Dramatic with radial rings ── */}
      <section style={{ background: dark ? "#0f172a" : "#ffffff" }} className="pt-20 pb-44 relative overflow-hidden">
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[900px] h-[900px] rounded-full border border-blue-400/6 animate-spin-slow" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[650px] h-[650px] rounded-full border border-violet-400/8" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[400px] h-[400px] rounded-full border border-pink-400/10" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[200px] h-[200px] rounded-full bg-blue-400/5 blur-3xl" />
          <div className="absolute top-1/3 right-1/3 w-3 h-3 rounded-full bg-blue-400/60 animate-pulse" />
          <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-violet-400/60 animate-bounce-slow" />
          <div className="absolute top-2/3 left-2/3 w-2 h-2 rounded-full bg-pink-400/60 animate-float" />
          <div className="absolute top-1/4 right-1/4 w-1.5 h-1.5 rounded-full bg-emerald-400/60 animate-float-slow" />
        </div>

        <div className="max-w-5xl mx-auto px-6 lg:px-12 text-center relative z-10">
          <div className="sr-s space-y-12">
            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-[11px] font-black uppercase tracking-widest">
              <Rocket className="w-4 h-4" /> Join 15,000+ Ethiopian Students
            </div>

            <div>
              <h2 className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.82] mb-4">
                Your Success<br />Story Starts
              </h2>
              {/* Outlined "Today." */}
              <h2
                className="text-7xl lg:text-9xl font-black tracking-tighter leading-[0.82]"
                style={{ WebkitTextStroke: `2px ${dark ? "#3B82F6" : "#2563EB"}`, color: "transparent" }}
              >
                Today.
              </h2>
            </div>

            <p className={cn("text-xl font-medium max-w-xl mx-auto leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
              Free forever plan. No credit card needed. Ethiopia's most powerful AI tutor starts here.
            </p>

            <div className="flex flex-col sm:flex-row gap-5 justify-center items-center">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-12 rounded-3xl bg-blue-400 hover:bg-blue-300 text-white font-black text-lg shadow-2xl shadow-blue-400/35 hover:-translate-y-1.5 transition-all group border-0">
                  Get Started Free
                  <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-2 transition-transform" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-3xl border-2 border-slate-200 dark:border-slate-700 font-black text-lg hover:border-blue-400/60 hover:bg-blue-400/5 transition-all">
                  Sign In
                </Button>
              </Link>
            </div>

            <div className="flex flex-wrap justify-center gap-8">
              {["Free Forever Plan", "No Credit Card", "Expert Ethiopian Tutors", "98% Pass Rate"].map(item => (
                <div key={item} className="flex items-center gap-2 text-sm font-bold text-slate-500">
                  <CheckCircle2 className="w-4 h-4 text-blue-400 flex-shrink-0" />{item}
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ── FOOTER ── */}
      <footer className={cn("py-24 border-t", dark ? "bg-slate-950 border-slate-800" : "bg-slate-50 border-slate-100")}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
            <div className="space-y-8">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-blue-500 flex items-center justify-center shadow-lg shadow-blue-500/25">
                  <GraduationCap className="w-6 h-6 text-white" />
                </div>
                <span className="text-xl font-black tracking-tight">SmartTutor<span className="text-blue-400">ET</span></span>
              </Link>
              <p className="text-slate-500 font-medium leading-relaxed text-sm max-w-xs">
                Ethiopia's premier AI platform for high school excellence — Grades 9 to 12.
              </p>
              <div className="flex gap-3">
                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                  <a key={i} href="#" className="w-10 h-10 rounded-xl bg-slate-100 dark:bg-slate-900 border border-slate-200 dark:border-slate-800 flex items-center justify-center text-slate-400 hover:text-blue-400 hover:scale-110 active:scale-90 transition-all">
                    <Icon className="w-4 h-4" />
                  </a>
                ))}
              </div>
            </div>
            {[
              { title: "Learning", links: ["Grade 9", "Grade 10", "Grade 11", "Grade 12", "National Exams"] },
              { title: "Platform", links: ["Features", "AI Tutor", "Live Classes", "Practice Tests", "Pricing"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact", "Privacy Policy"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[10px] font-black uppercase tracking-[0.3em] text-slate-400 mb-6">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <Link href="#" className="text-slate-500 hover:text-blue-400 font-bold text-sm transition-colors hover:translate-x-1 inline-block">{link}</Link>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>
          <div className="pt-10 border-t border-slate-100 dark:border-slate-800 flex flex-col md:flex-row items-center justify-between gap-6">
            <p className="text-slate-400 text-sm font-bold">© 2026 SmartTutorET. Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline mx-1" /> in Addis Ababa.</p>
            <div className="flex items-center gap-2 text-slate-400">
              <Globe2 className="w-4 h-4" />
              <span className="text-xs font-black uppercase tracking-[0.2em]">Amharic / English</span>
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
