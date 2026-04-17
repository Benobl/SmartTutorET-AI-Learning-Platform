"use client"

import { useState, useEffect, useRef } from "react"
import Link from "next/link"
import Image from "next/image"
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

import { ALL_FEATURES, BASE_TESTIMONIALS, SUBJECTS } from "@/lib/landing-data"

const N = BASE_TESTIMONIALS.length
const CAROUSEL_ITEMS = [...BASE_TESTIMONIALS, ...BASE_TESTIMONIALS, ...BASE_TESTIMONIALS]


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

/* ─── Modern AI UI Helper ─── */
function ModernAIUI({ dark }: { dark: boolean }) {
    return (
        <div className="relative w-full h-[400px] lg:h-[450px] flex items-center justify-center perspective-1000">
            <div className="absolute w-64 h-64 rounded-full bg-blue-500/10 blur-3xl animate-pulse" />
            <div className={cn(
                "relative z-10 w-48 h-48 rounded-[48px] border-4 flex items-center justify-center overflow-hidden backdrop-blur-2xl shadow-2xl animate-float",
                dark ? "border-white/10 bg-white/5 shadow-blue-500/10" : "border-blue-400/30 bg-white/10 shadow-blue-500/20"
            )}>
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-500/10 via-transparent to-violet-500/10" />
                <Bot className="w-20 h-20 text-blue-400" />
            </div>

            {/* Floating UI Elements */}
            <div className={cn(
                "absolute top-0 right-0 w-48 p-4 rounded-3xl backdrop-blur-xl border shadow-xl animate-float-delayed",
                dark ? "bg-white/5 border-white/10 shadow-black" : "bg-white/40 border-white/20 shadow-slate-200"
            )}>
                <div className="flex items-center gap-2 mb-2">
                    <Activity className="w-4 h-4 text-emerald-400" />
                    <span className="text-[10px] font-black uppercase text-slate-400">AI Accuracy</span>
                </div>
                <div className={cn("h-1 rounded-full overflow-hidden", dark ? "bg-white/10" : "bg-slate-100")}>
                    <div className="h-full bg-emerald-400 w-[98%] animate-shimmer" />
                </div>
            </div>

            <div className={cn(
                "absolute bottom-10 left-0 w-56 p-5 rounded-3xl backdrop-blur-xl border shadow-xl animate-float",
                dark ? "bg-white/5 border-white/10 shadow-black" : "bg-white/40 border-white/20 shadow-slate-200"
            )}>
                <div className="flex items-center gap-3 mb-3">
                    <div className="w-8 h-8 rounded-full bg-blue-500 flex items-center justify-center text-[10px] text-white font-black">AI</div>
                    <div className="flex-1 space-y-1">
                        <div className={cn("h-1.5 rounded-full w-full", dark ? "bg-white/10" : "bg-blue-400/20")} />
                        <div className={cn("h-1.5 rounded-full w-2/3", dark ? "bg-white/10" : "bg-blue-400/20")} />
                    </div>
                </div>
                <p className="text-[10px] font-bold text-slate-500 italic">"Generating your personalized study plan..."</p>
            </div>
        </div>
    )
}

/* ─── Continuous Marquee ─── */
function ContinuousMarquee({ items, dark }: { items: any[]; dark: boolean }) {
    return (
        <div className="relative flex overflow-hidden py-10 select-none">
            <div className="flex gap-6 animate-marquee">
                {[...items, ...items, ...items, ...items].map((item, i) => (
                    <div
                        key={i}
                        className={cn(
                            "flex-shrink-0 w-64 p-6 rounded-[32px] border transition-all hover:-translate-y-1 hover:shadow-xl",
                            dark ? "bg-[#14172A] border-white/5 shadow-2xl" : "bg-white border-slate-100 shadow-sm"
                        )}
                    >
                        <div className="flex items-center gap-4 mb-4">
                            <span className="text-3xl">{item.emoji}</span>
                            <div>
                                <div className="text-[10px] font-black uppercase text-blue-400">{item.grade}</div>
                                <div className={cn("font-black text-sm", dark ? "text-white" : "text-slate-900")}>{item.subject}</div>
                            </div>
                        </div>
                        <div className="flex items-center justify-between text-[10px] font-bold text-slate-400">
                            <div className="flex items-center gap-1"><Users className="w-3 h-3" /> {item.students} Students</div>
                            <div className="flex items-center gap-0.5"><Star className="w-3 h-3 fill-amber-400 text-amber-400" /> {item.rating}</div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ─── AI Chat FAB ─── */
function AIChatFAB({ dark }: { dark: boolean }) {
    const [isOpen, setIsOpen] = useState(false)

    return (
        <div className="fixed bottom-8 right-8 z-[200]">
            {isOpen && (
                <div className={cn(
                    "absolute bottom-20 right-0 w-[350px] h-[480px] rounded-[40px] overflow-hidden shadow-2xl border border-white/5 animate-in fade-in slide-in-from-bottom-5 flex flex-col",
                    dark ? "bg-[#18181b]" : "bg-white"
                )}>
                    <div className="bg-blue-500 p-6 flex items-center justify-between text-white shadow-lg">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 rounded-2xl bg-white/20 backdrop-blur-md flex items-center justify-center">
                                <Bot className="w-6 h-6" />
                            </div>
                            <div className="font-black tracking-tight">SmartBot AI</div>
                        </div>
                        <button onClick={() => setIsOpen(false)} className="hover:rotate-90 transition-transform">
                            <X className="w-5 h-5" />
                        </button>
                    </div>
                    <div className="flex-1 p-6 overflow-y-auto space-y-4">
                        <div className={cn("inline-block p-4 rounded-3xl rounded-tl-none text-sm font-medium", dark ? "bg-white/5 text-slate-300" : "bg-slate-100 text-slate-600")}>
                            Hi there! 👋 I'm your SmartTutor assistant. How can I help you excel today?
                        </div>
                    </div>
                    <div className="p-5 border-t border-slate-100 dark:border-white/5">
                        <div className="relative">
                            <input
                                type="text"
                                placeholder="Ask me anything..."
                                className={cn("w-full h-14 rounded-2xl px-5 pr-14 text-sm font-bold focus:outline-none", dark ? "bg-white/5 text-white" : "bg-slate-50 text-slate-900")}
                            />
                            <button className="absolute right-2 top-2 w-10 h-10 rounded-xl bg-blue-500 flex items-center justify-center text-white shadow-lg shadow-blue-500/30">
                                <Send className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            )}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-16 h-16 rounded-[24px] bg-blue-500 hover:bg-blue-400 text-white flex items-center justify-center shadow-2xl shadow-blue-500/40 transition-all hover:scale-110 active:scale-95 group relative overflow-hidden"
            >
                <div className="absolute inset-0 bg-gradient-to-tr from-blue-600 to-blue-400 opacity-0 group-hover:opacity-100 transition-opacity" />
                {isOpen ? <X className="w-7 h-7 relative z-10" /> : <Bot className="w-7 h-7 relative z-10" />}
            </button>
        </div>
    )
}

/* ─── Neural Console (Advanced AI Interface) ─── */
function NeuralConsole({ dark }: { dark: boolean }) {
    const [text, setText] = useState("")
    const fullText = "I've analyzed your Grade 12 Chemistry gaps. I created a 4-week national exam plan with 3 mock tests, visual concept maps, and daily 30-min AI review sessions. Ready to start today?"

    useEffect(() => {
        let i = 0
        const interval = setInterval(() => {
            setText(fullText.slice(0, i))
            i++
            if (i > fullText.length) clearInterval(interval)
        }, 35)
        return () => clearInterval(interval)
    }, [])

    const aiCards = [
        { icon: Brain, label: "Adaptive Plan", val: "Generated", color: "#8B5CF6" },
        { icon: Target, label: "Mock Tests", val: "3 Ready", color: "#3B82F6" },
        { icon: TrendingUp, label: "Score Boost", val: "+34%", color: "#10B981" },
        { icon: Zap, label: "AI Sessions", val: "Daily", color: "#F59E0B" },
    ]

    return (
        <div className={cn(
            "relative rounded-[48px] overflow-hidden border shadow-2xl transition-all duration-700",
            dark ? "bg-[#111520] border-white/5 shadow-black" : "bg-white border-slate-100 shadow-slate-200"
        )}>
            {/* Top: AI Brain Header */}
            <div className={cn("p-8 border-b flex items-center justify-between", dark ? "border-white/5" : "border-slate-100")}>
                <div className="flex items-center gap-4">
                    <div className="w-12 h-12 rounded-2xl bg-violet-500 flex items-center justify-center text-white shadow-lg shadow-violet-500/40 relative">
                        <Bot className="w-6 h-6" />
                        <span className="absolute -top-1 -right-1 w-3.5 h-3.5 rounded-full bg-emerald-400 border-2 border-[#111113]" />
                    </div>
                    <div>
                        <div className="text-[10px] font-black uppercase text-violet-400 tracking-widest">SmartAI Neural Engine</div>
                        <div className={cn("font-black text-base", dark ? "text-white" : "text-slate-900")}>Analyzing your curriculum...</div>
                    </div>
                </div>
                <div className="flex items-center gap-2 px-3 py-1.5 rounded-full bg-emerald-400/10 border border-emerald-400/20">
                    <div className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                    <span className="text-[10px] font-black uppercase text-emerald-400">Live</span>
                </div>
            </div>

            {/* Stat cards row */}
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-px">
                {aiCards.map((c, i) => (
                    <div key={i} className={cn("p-5 flex flex-col gap-2 border-b", dark ? "border-white/5" : "border-slate-100")}>
                        <div className="w-8 h-8 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${c.color}18` }}>
                            <c.icon className="w-4 h-4" style={{ color: c.color }} />
                        </div>
                        <div className={cn("text-lg font-black", dark ? "text-white" : "text-slate-900")}>{c.val}</div>
                        <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest">{c.label}</div>
                    </div>
                ))}
            </div>

            {/* Chat area */}
            <div className="p-8 space-y-6">
                {/* User message */}
                <div className="flex justify-end">
                    <div className={cn("px-5 py-3 rounded-3xl rounded-br-sm text-sm font-semibold max-w-xs", dark ? "bg-blue-500/20 text-blue-200" : "bg-blue-50 text-blue-800")}>
                        Find me a Grade 12 Chemistry tutor and build my exam plan.
                    </div>
                </div>
                {/* AI response */}
                <div className="flex gap-3 items-start">
                    <div className="w-8 h-8 rounded-xl bg-violet-500 flex items-center justify-center text-white flex-shrink-0 shadow-lg shadow-violet-500/20">
                        <Bot className="w-4 h-4" />
                    </div>
                    <div className={cn("flex-1 px-5 py-4 rounded-3xl rounded-tl-sm text-sm font-medium leading-relaxed", dark ? "bg-white/5 text-slate-300" : "bg-slate-50 text-slate-600")}>
                        <span className="text-violet-400 font-black">SmartBot: </span>{text}
                        <span className="inline-block w-2 h-4 ml-1 bg-violet-400 animate-pulse" />
                    </div>
                </div>
            </div>

            {/* Input */}
            <div className={cn("px-8 pb-8")}>
                <div className="relative group">
                    <div className="absolute -inset-0.5 bg-gradient-to-r from-violet-500 to-blue-500 rounded-2xl blur opacity-0 group-focus-within:opacity-30 transition-opacity" />
                    <div className={cn("relative flex items-center h-14 rounded-2xl px-5 border gap-3", dark ? "bg-white/5 border-white/10" : "bg-slate-50 border-slate-200")}>
                        <Search className="w-4 h-4 text-slate-500 flex-shrink-0" />
                        <input
                            type="text"
                            placeholder="Ask: Explain photosynthesis for my Grade 11 exam..."
                            className={cn("flex-1 bg-transparent text-sm font-medium focus:outline-none", dark ? "text-white placeholder:text-slate-600" : "text-slate-900 placeholder:text-slate-400")}
                        />
                        <button className="w-8 h-8 rounded-xl bg-violet-500 hover:bg-violet-400 text-white flex items-center justify-center shadow-md shadow-violet-500/20 transition-all active:scale-90 flex-shrink-0">
                            <Send className="w-4 h-4" />
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

function MiniStatCard({ icon: Icon, title, desc, dark }: { icon: any; title: string; desc: string; dark: boolean }) {
    return (
        <div className={cn(
            "flex items-start gap-4 p-5 rounded-[28px] border transition-all hover:scale-[1.02] hover:shadow-2xl",
            dark ? "bg-[#18181b] border-white/5 shadow-black" : "bg-white border-slate-100 shadow-sm"
        )}>
            <div className="w-10 h-10 rounded-xl bg-blue-500/10 flex items-center justify-center flex-shrink-0">
                <Icon className="w-5 h-5 text-blue-500" />
            </div>
            <div>
                <h4 className={cn("text-sm font-black mb-1", dark ? "text-white" : "text-slate-900")}>{title}</h4>
                <p className="text-[11px] font-bold text-slate-400 leading-tight">{desc}</p>
            </div>
        </div>
    )
}

function WaveEvangadi({ fill = "#ffffff", className }: { fill?: string; className?: string }) {
    return (
        <div className={cn("absolute left-0 right-0 w-full overflow-hidden leading-[0] pointer-events-none z-10 bottom-0", className)}>
            <svg data-name="Layer 1" xmlns="http://www.w3.org/2000/svg" viewBox="0 0 1200 120" preserveAspectRatio="none" className="block w-full h-20 lg:h-28">
                <path d="M985.66,92.83C906.67,72,823.78,31,743.84,14.19c-82.26-17.34-168.06-16.33-250.45.39-57.84,11.73-114,31.07-172,41.86A600.21,600.21,0,0,1,0,27.35V120H1200V95.8C1132.19,118.92,1055.71,111.31,985.66,92.83Z" fill={fill} />
            </svg>
        </div>
    )
}

/* ─── Smooth scroll helper ─── */
function smoothScrollTo(id: string) {
    const el = document.getElementById(id)
    if (el) el.scrollIntoView({ behavior: "smooth", block: "start" })
}

export default function LandingPage() {
    const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
    const [isDarkMode, setIsDarkMode] = useState(true)
    const [scrolled, setScrolled] = useState(false)
    const [showAll, setShowAll] = useState(false)

    const [tIdx, setTIdx] = useState(N)
    const [animated, setAnimated] = useState(true)
    const timerRef = useRef<NodeJS.Timeout | null>(null)

    useScrollReveal()
    useEffect(() => { document.documentElement.classList.toggle("dark", isDarkMode) }, [isDarkMode])
    useEffect(() => {
        // Smooth scroll via CSS
        document.documentElement.style.scrollBehavior = "smooth"
        const fn = () => setScrolled(window.scrollY > 20)
        window.addEventListener("scroll", fn)
        return () => window.removeEventListener("scroll", fn)
    }, [])

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
        <div style={{ background: dark ? "#0d0f1e" : "#f8fafc" }} className="min-h-screen transition-colors duration-500 overflow-x-hidden text-slate-900 dark:text-slate-100">

            {/* ── NAVBAR ── */}
            <header className={cn("fixed top-0 inset-x-0 z-[100] transition-all duration-300",
                scrolled ? (dark ? "bg-[#09090b]/80 backdrop-blur-2xl border-b border-white/5 shadow-2xl shadow-black" : "bg-white/90 backdrop-blur-2xl border-b border-slate-200/60 shadow-md") : "bg-transparent")}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
                    <Link href="/" className="flex items-center gap-3 group">
                        <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 shrink-0 overflow-hidden transition-transform group-hover:scale-110">
                            <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
                        </div>
                        <span className="text-xl font-black tracking-tight">SmartTutor<span className="text-blue-400">ET</span></span>
                    </Link>
                    <nav className="hidden lg:flex items-center gap-1">
                        {[
                            { label: "Home", id: "hero" },
                            { label: "Features", id: "features" },
                            { label: "Subjects", id: "courses" },
                            { label: "AI Tutor", id: "aitutor" },
                            { label: "Testimonials", id: "testimonials" },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { smoothScrollTo(item.id); setMobileMenuOpen(false) }}
                                className="px-5 py-2 rounded-xl text-sm font-bold text-slate-500 hover:text-blue-400 hover:bg-blue-400/8 transition-all"
                            >{item.label}</button>
                        ))}
                    </nav>
                    <div className="flex items-center gap-3">
                        <button onClick={() => setIsDarkMode(!isDarkMode)} className="p-2.5 rounded-xl bg-slate-100 dark:bg-[#18181b] border border-slate-200 dark:border-white/5 hover:scale-110 active:scale-90 transition-all">
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
                    <div className={cn("lg:hidden absolute top-20 inset-x-0 border-b p-6 shadow-2xl space-y-3", dark ? "bg-[#0d0f1e] border-white/5" : "bg-white border-slate-100")}>
                        {[
                            { label: "Home", id: "hero" },
                            { label: "Features", id: "features" },
                            { label: "Subjects", id: "courses" },
                            { label: "AI Tutor", id: "aitutor" },
                            { label: "Testimonials", id: "testimonials" },
                        ].map(item => (
                            <button
                                key={item.id}
                                onClick={() => { smoothScrollTo(item.id); setMobileMenuOpen(false) }}
                                className="w-full text-left p-3.5 rounded-2xl font-bold hover:bg-blue-50 dark:hover:bg-blue-500/10 transition-all"
                            >{item.label}</button>
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
            <section id="hero" className="relative min-h-screen flex items-center pt-24 pb-32">
                {/* Ambient blobs */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                    <div className="absolute top-0 left-0 w-[700px] h-[700px] bg-blue-500/10 rounded-full blur-[200px] -translate-x-1/3 -translate-y-1/4" />
                    <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-violet-500/8 rounded-full blur-[180px] translate-x-1/4 translate-y-1/4" />
                </div>

                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20 w-full">
                    <div className="grid lg:grid-cols-2 gap-12 xl:gap-20 items-start w-full">

                        {/* Left column */}
                        <div className="sr-l space-y-8 lg:pt-16">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-blue-400/10 border border-blue-400/20 text-blue-400 text-[11px] font-black uppercase tracking-[0.2em]">
                                <div className="w-1.5 h-1.5 rounded-full bg-blue-400 animate-pulse" />
                                Ethiopia's #1 AI Platform for High Schools
                            </div>
                            <h1 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.88] tracking-tighter">
                                Study Smarter.<br />Score Higher.<br />
                                <span className={cn("bg-gradient-to-r bg-clip-text text-transparent", dark ? "from-blue-400 to-violet-400" : "from-blue-600 to-violet-600")}>
                                    AI-Powered.
                                </span>
                            </h1>
                            <p className="text-lg text-slate-500 dark:text-slate-400 font-semibold max-w-md leading-relaxed">
                                Ethiopia's smartest learning platform for Grades 9–12. Personalized AI paths, live expert sessions, and national exam mastery — all in one place.
                            </p>
                            <div className="flex flex-col sm:flex-row gap-4">
                                <Link href="/signup">
                                    <Button size="lg" className="h-14 px-10 rounded-2xl bg-blue-500 hover:bg-blue-400 text-white font-black text-base shadow-2xl shadow-blue-500/40 hover:-translate-y-1 transition-all group border-0">
                                        Start Learning Free <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                    </Button>
                                </Link>
                                <Button
                                    size="lg"
                                    variant="outline"
                                    onClick={() => smoothScrollTo("aitutor")}
                                    className={cn("h-14 px-10 rounded-2xl border-2 font-black text-base hover:-translate-y-1 transition-all", dark ? "border-white/10 text-white hover:bg-white/5" : "border-slate-200 text-slate-700 hover:bg-slate-50")}
                                >
                                    <PlayCircle className="mr-3 w-5 h-5 text-blue-500" /> See AI in Action
                                </Button>
                            </div>
                            {/* Trust row */}
                            <div className="flex items-center gap-6 pt-2">
                                <div className="flex -space-x-2">
                                    {[
                                        { initials: "AK", bg: "#3B82F6" },
                                        { initials: "ST", bg: "#bca1fbff" },
                                        { initials: "HM", bg: "#7df0c9ff" },
                                        { initials: "BS", bg: "#93C5FD" },
                                    ].map((a, i) => (
                                        <div key={i} className="w-8 h-8 rounded-full flex items-center justify-center text-[9px] font-black text-white" style={{ backgroundColor: a.bg }}>{a.initials}</div>
                                    ))}
                                </div>
                                <p className="text-xs font-bold text-slate-500"><span className={cn("font-black", dark ? "text-white" : "text-slate-900")}>15,000+</span> students already learning</p>
                            </div>
                        </div>

                        {/* Right column — AI UI + stat cards, shifted to align from top so cards show */}
                        <div className="sr-r hidden lg:flex flex-col gap-6">
                            <div className="relative z-10">
                                <ModernAIUI dark={dark} />
                            </div>
                            {/* Stat cards — displayed in a row, shifted up slightly so all visible */}
                            <div className="grid grid-cols-3 gap-3 -mt-4">
                                <MiniStatCard dark={dark} icon={Brain} title="Adaptive AI" desc="Personalized learning pace" />
                                <MiniStatCard dark={dark} icon={Users} title="24/7 Support" desc="Top Ethiopian teachers" />
                                <MiniStatCard dark={dark} icon={Award} title="98% Pass Rate" desc="Grade 10 & 12 national exams" />
                            </div>
                        </div>
                    </div>
                </div>

                <WaveEvangadi fill={dark ? "#09090b" : "#ffffff"} className="z-20" />
            </section>

            {/* ── COURSE SLIDER (Continuous Marquee) ── */}
            <section id="courses" className={cn("pt-32 pb-10", dark ? "bg-[#0D0F1E]" : "bg-white")}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center mb-10">
                    <h2 className="text-2xl font-black tracking-tight text-slate-400 uppercase tracking-[0.2em]">Explore Our Subjects</h2>
                </div>
                <ContinuousMarquee items={SUBJECTS} dark={dark} />
            </section>

            {/* ── FEATURES ── */}
            <section id="features" style={{ background: dark ? "#111520" : "#ffffff" }} className="pt-24 pb-32 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
                    <div className="text-center mb-20 sr space-y-5">
                        <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-violet-400/10 border border-violet-400/20 text-violet-400 text-[11px] font-black uppercase tracking-widest">
                            <Zap className="w-4 h-4" /> Platform Features
                        </div>
                        <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-[0.9]">
                            Smart Tools For <span className="text-blue-400">Fast Learning</span>
                        </h2>
                    </div>

                    <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-7">
                        {visibleFeatures.map((f, i) => (
                            <div
                                key={f.title}
                                className={cn(
                                    "group sr p-9 rounded-[40px] border transition-all duration-500 hover:-translate-y-2 hover:shadow-2xl cursor-pointer",
                                    dark ? "bg-[#14172a] border-white/5 hover:border-blue-400/30 hover:bg-[#16193a]" : "bg-slate-50 border-slate-100 hover:border-blue-200 hover:bg-white"
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

                    <div className="flex justify-center mt-14 sr">
                        <button
                            onClick={() => { setShowAll(p => !p); if (!showAll) setTimeout(() => smoothScrollTo("features"), 50) }}
                            className={cn(
                                "group flex items-center gap-3 px-10 py-4 rounded-full font-black text-sm transition-all duration-300 active:scale-95 border-2 hover:-translate-y-1 shadow-lg",
                                showAll
                                    ? (dark ? "border-white/10 text-slate-400 hover:border-red-400 hover:text-red-400 bg-transparent" : "border-slate-300 text-slate-500 hover:border-red-400 hover:text-red-400 bg-white")
                                    : "border-blue-400/30 hover:border-blue-400 text-blue-400 bg-blue-400/8 hover:bg-blue-400 hover:text-white hover:shadow-blue-400/30"
                            )}
                        >
                            {showAll
                                ? <><Minus className="w-4 h-4" /> Show Less</>
                                : <><Plus className="w-4 h-4 group-hover:rotate-90 transition-transform duration-300" /> View All 6 Features</>
                            }
                        </button>
                    </div>
                </div>
            </section>

            {/* ── AI TUTOR SECTION ── */}
            <section id="aitutor" style={{ background: dark ? "#0d0f1e" : "#fafafa" }} className="pt-20 pb-32 relative overflow-hidden">
                <div className="max-w-7xl mx-auto px-6 lg:px-12 relative z-20">
                    <div className="grid lg:grid-cols-2 gap-16 xl:gap-24 items-center">
                        <div className="sr-l space-y-8">
                            <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full text-[11px] font-black uppercase tracking-[0.2em] bg-violet-400/10 border border-violet-400/20 text-violet-400">
                                <Brain className="w-4 h-4" /> SmartAI Interactive
                            </div>
                            <h2 className="text-5xl lg:text-6xl xl:text-7xl font-black leading-[0.88] tracking-tighter">
                                Your Personal<br /><span className="text-violet-400">AI Brain Coach.</span>
                            </h2>
                            <p className={cn("text-lg font-semibold max-w-xl leading-relaxed", dark ? "text-slate-400" : "text-slate-500")}>
                                One conversation is all it takes. SmartAI finds the right tutor, explains any concept visually, and builds your complete national exam roadmap in seconds.
                            </p>
                            <div className="grid grid-cols-2 gap-4">
                                {[
                                    { icon: Lightbulb, text: "Visual concept explanations", color: "#F59E0B" },
                                    { icon: BadgeCheck, text: "AI-verified tutors only", color: "#10B981" },
                                    { icon: BookOpen, text: "National curriculum aligned", color: "#3B82F6" },
                                    { icon: Zap, text: "Instant 24/7 responses", color: "#8B5CF6" },
                                ].map((item, i) => (
                                    <div key={i} className={cn("flex items-center gap-3 p-4 rounded-2xl border", dark ? "bg-white/3 border-white/5" : "bg-white border-slate-100")}>
                                        <div className="w-8 h-8 rounded-xl flex items-center justify-center flex-shrink-0" style={{ backgroundColor: `${item.color}15` }}>
                                            <item.icon className="w-4 h-4" style={{ color: item.color }} />
                                        </div>
                                        <span className={cn("text-xs font-bold", dark ? "text-slate-300" : "text-slate-700")}>{item.text}</span>
                                    </div>
                                ))}
                            </div>
                        </div>

                        <div className="sr-r">
                            <NeuralConsole dark={dark} />
                        </div>
                    </div>
                </div>
            </section>

            {/* ── TESTIMONIALS ── */}
            <section id="testimonials" style={{ background: dark ? "#111520" : "#f1f5f9" }} className="pt-24 pb-48 relative">
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="text-center mb-20 sr space-y-5">
                        <h2 className="text-5xl lg:text-6xl font-black tracking-tight leading-none">
                            Real Impact. <span className="text-blue-400">Real Success.</span>
                        </h2>
                        <p className={cn("text-lg font-bold", dark ? "text-slate-400" : "text-slate-500")}>
                            15,000+ students across Ethiopia.
                        </p>
                    </div>

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
                                        <div className={cn("flex flex-col justify-between p-8 rounded-[40px] border transition-all duration-500 hover:-translate-y-1 hover:shadow-xl cursor-pointer h-full", dark ? "bg-[#14172a] border-white/5 hover:border-blue-400/20 shadow-2xl" : "bg-white border-slate-100 hover:border-blue-200 hover:shadow-blue-50")}>
                                            <div className="space-y-4">
                                                <div className="flex items-center justify-between">
                                                    <div className="flex gap-1">
                                                        {[...Array(5)].map((_, s) => <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />)}
                                                    </div>
                                                    <span className="px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest bg-blue-400/10 text-blue-400">{t.subject}</span>
                                                </div>
                                                <p className={cn("text-sm font-bold italic leading-relaxed", dark ? "text-slate-300" : "text-slate-600")}>"{t.text}"</p>
                                            </div>
                                            <div className="flex items-center gap-4 pt-6 mt-6 border-t border-slate-100 dark:border-white/5">
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
                        <button onClick={() => go(-1)} className={cn("absolute -left-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl z-20 hover:bg-blue-400 hover:border-blue-400 hover:text-white", dark ? "bg-[#18181b] border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500")}>
                            <ChevronRight className="w-5 h-5 rotate-180" />
                        </button>
                        <button onClick={() => go(1)} className={cn("absolute -right-5 top-1/2 -translate-y-1/2 w-12 h-12 rounded-2xl flex items-center justify-center border-2 transition-all shadow-xl z-20 hover:bg-blue-400 hover:border-blue-400 hover:text-white", dark ? "bg-[#18181b] border-white/5 text-slate-400" : "bg-white border-slate-200 text-slate-500")}>
                            <ChevronRight className="w-5 h-5" />
                        </button>
                    </div>
                </div>
            </section>

            {/* ── FOOTER ── */}
            <footer className={cn("py-24 border-t", dark ? "bg-[#0d0f1e] border-white/5" : "bg-slate-50 border-slate-100")}>
                <div className="max-w-7xl mx-auto px-6 lg:px-12">
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-16 mb-20">
                        <div className="space-y-8">
                            <Link href="/" className="flex items-center gap-3">
                                <div className="w-10 h-10 rounded-2xl bg-white flex items-center justify-center shadow-lg border border-slate-100 shrink-0 overflow-hidden">
                                    <Image src="/logo.png" alt="Logo" width={40} height={40} className="w-full h-full object-contain" />
                                </div>
                                <span className="text-xl font-black tracking-tight">SmartTutor<span className="text-blue-400">ET</span></span>
                            </Link>
                            <p className="text-slate-500 font-bold leading-relaxed text-sm max-w-xs">
                                Ethiopia's premier AI platform for high school excellence — Grades 9 to 12.
                            </p>
                            <div className="flex gap-4">
                                {[Facebook, Twitter, Instagram, Linkedin, Youtube].map((Icon, i) => (
                                    <a key={i} href="#" className={cn("w-10 h-10 rounded-xl flex items-center justify-center transition-all", dark ? "bg-[#14172a] text-slate-400 hover:text-blue-400" : "bg-slate-100 text-slate-400 hover:text-blue-400")}>
                                        <Icon className="w-5 h-5" />
                                    </a>
                                ))}
                            </div>
                        </div>
                        <div>
                            <h4 className={cn("font-black text-sm uppercase tracking-widest mb-8", dark ? "text-white" : "text-slate-900")}>Platform</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                {["AI Tutor", "Live Classes", "National Exams", "Resources"].map(item => (
                                    <li key={item}><a href="#" className="hover:text-blue-400 transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className={cn("font-black text-sm uppercase tracking-widest mb-8", dark ? "text-white" : "text-slate-900")}>Company</h4>
                            <ul className="space-y-4 text-sm font-bold text-slate-500">
                                {["About Success", "Our Story", "Contact Us", "Careers"].map(item => (
                                    <li key={item}><a href="#" className="hover:text-blue-400 transition-colors">{item}</a></li>
                                ))}
                            </ul>
                        </div>
                        <div>
                            <h4 className={cn("font-black text-sm uppercase tracking-widest mb-8", dark ? "text-white" : "text-slate-900")}>Newsletter</h4>
                            <p className="text-sm font-bold text-slate-500 mb-6">Stay updated with the latest exam tips and platform updates.</p>
                            <div className="flex gap-2">
                                <input type="email" placeholder="Email" className={cn("flex-1 h-12 rounded-xl px-4 text-sm font-bold focus:outline-none", dark ? "bg-[#14172a] border-white/5" : "bg-white border-slate-200 border")} />
                                <Button className="h-12 w-12 rounded-xl bg-blue-500 text-white"><ArrowUpRight className="w-5 h-5" /></Button>
                            </div>
                        </div>
                    </div>
                    <div className="pt-10 border-t border-slate-100 dark:border-white/5 flex flex-col md:flex-row items-center justify-between gap-6">
                        <p className="text-slate-400 text-sm font-bold">© 2026 SmartTutorET. Made with <Heart className="w-3.5 h-3.5 text-rose-400 fill-rose-400 inline mx-1" /> in Addis Ababa.</p>
                        <div className="flex gap-8 text-xs font-black text-slate-400 uppercase tracking-widest">
                            <a href="#" className="hover:text-blue-400">Privacy Policy</a>
                            <a href="#" className="hover:text-blue-400">Terms of Service</a>
                        </div>
                    </div>
                </div>
            </footer>

            {/* ── Floating AI Button ── */}
            <AIChatFAB dark={dark} />
        </div>
    )
}
