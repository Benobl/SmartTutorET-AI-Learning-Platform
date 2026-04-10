"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  Brain, Sparkles, ArrowRight, BookOpen, Users, BarChart3,
  GraduationCap, Menu, X, CheckCircle2, Star, ChevronRight,
  Zap, Play, Award, TrendingUp, Video, Clock, Rocket,
  Heart, ArrowUpRight, PenTool, Activity, Globe
} from "lucide-react"
import { cn } from "@/lib/utils"

/**
 * LANDING PAGE COMPONENT
 * 
 * Features a modern, high-impact design for SmartTutorET.
 * Includes:
 * - Glassmorphism Navbar (Synced with Dashboard)
 * - Hero Section with AI Mockup
 * - Feature Highlights
 * - Course Catalog (Grade 9-12)
 * - Student Testimonials
 */

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [scrolled, setScrolled] = useState(false)
  const [testimonialIndex, setTestimonialIndex] = useState(0)

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 20)
    window.addEventListener("scroll", onScroll)
    return () => window.removeEventListener("scroll", onScroll)
  }, [])

  const navLinks = [
    { label: "Features", href: "#features" },
    { label: "Courses", href: "#courses" },
    { label: "Testimonials", href: "#testimonials" },
    { label: "For Schools", href: "#schools" },
  ]

  const features = [
    { icon: Brain, title: "Adaptive AI Tutor", desc: "Personalized learning paths that evolve in real-time based on your strengths, weaknesses, and progress.", tag: "AI", color: "sky" },
    { icon: Video, title: "Live Sessions", desc: "Interactive live classes with expert Ethiopian teachers and instant Q&A support.", tag: "Live", color: "indigo" },
    { icon: BarChart3, title: "Smart Analytics", desc: "Deep performance insights with predictive analysis, weakness mapping, and exam readiness scores.", tag: "Data", color: "teal" },
    { icon: Users, title: "Study Squads", desc: "AI-matched collaborative groups with shared whiteboards, peer review, and group assignments.", tag: "Social", color: "sky" },
    { icon: Award, title: "Exam Preparation", desc: "Timed national exam mocks, past papers, and AI-scored feedback tailored to your grade level.", tag: "Exams", color: "indigo" },
    { icon: Rocket, title: "Gamified Learning", desc: "Earn XP, unlock badges, climb global leaderboards, and build unstoppable daily study streaks.", tag: "Fun", color: "teal" },
  ]

  const steps = [
    { step: "01", title: "Create Your Account", desc: "Sign up in 60 seconds. Select your grade and the subjects you want to master.", icon: GraduationCap },
    { step: "02", title: "Get Your AI Plan", desc: "Our AI assesses your level and builds a precise personalized study roadmap just for you.", icon: Brain },
    { step: "03", title: "Learn & Achieve", desc: "Attend live classes, crush AI quizzes, join study squads, and track your growth every day.", icon: TrendingUp },
  ]

  const courses = [
    { grade: "Grade 12", subject: "Mathematics", teacher: "Ato Daniel Abebe", students: "2.4K", rating: "4.9", accent: "sky", emoji: "🧮" },
    { grade: "Grade 11", subject: "Physics", teacher: "Dr. Lemlem Hailu", students: "1.8K", rating: "4.8", accent: "indigo", emoji: "⚛️" },
    { grade: "Grade 10", subject: "Chemistry", teacher: "Ms. Sara Johnson", students: "3.1K", rating: "4.9", accent: "teal", emoji: "🔬" },
    { grade: "Grade 9", subject: "Biology", teacher: "Dr. Alem Bekele", students: "2.2K", rating: "4.7", accent: "sky", emoji: "🧬" },
    { grade: "Grade 12", subject: "English", teacher: "Ms. Hiwot Desta", students: "1.5K", rating: "4.8", accent: "indigo", emoji: "📖" },
    { grade: "Grade 11", subject: "History", teacher: "Ato Yonas Alemu", students: "980", rating: "4.7", accent: "teal", emoji: "🏛️" },
  ]

  const testimonials = [
    { name: "Biniyam Solomon", grade: "Grade 12", score: "Entrance Score: 98%", text: "SmartTutorET completely transformed my study routine. The AI tutor knew exactly where I struggled. I went from 64% to 91% in Physics.", avatar: "BS", stars: 5 },
    { name: "Helena Tesfaye", grade: "Grade 11", score: "Mathematics: A+", text: "The live sessions are incredible. I can ask questions in real-time and the AI creates personalized quizzes right after each lesson. Revolutionary.", avatar: "HT", stars: 5 },
    { name: "Dagmawi Girma", grade: "Grade 10", score: "Biology: 89%", text: "The study squads connected me with top students. Collaborating on assignments while competing on the leaderboard is incredibly motivating.", avatar: "DG", stars: 5 },
  ]

  const accentClasses: Record<string, { badge: string; icon: string; border: string; strip: string }> = {
    sky: { badge: "bg-sky-50 text-sky-600 border-sky-100", icon: "bg-sky-50 text-sky-600 border-sky-100", border: "border-sky-100 hover:border-sky-200", strip: "bg-sky-600" },
    indigo: { badge: "bg-indigo-50 text-indigo-600 border-indigo-100", icon: "bg-indigo-50 text-indigo-600 border-indigo-100", border: "border-indigo-100 hover:border-indigo-200", strip: "bg-indigo-600" },
    teal: { badge: "bg-teal-50 text-teal-600 border-teal-100", icon: "bg-teal-50 text-teal-600 border-teal-100", border: "border-teal-100 hover:border-teal-200", strip: "bg-teal-600" },
  }

  return (
    <div className="min-h-screen bg-slate-50 text-slate-900 overflow-x-hidden">

      {/* ─── STICKY NAVBAR ─── */}
      <header className={cn(
        "fixed top-0 left-0 right-0 z-50 transition-all duration-300",
        // When scrolled, become more opaque white. 
        // When at top, use the dashboard's transparent glassmorphism style.
        scrolled
          ? "bg-white/90 backdrop-blur-2xl border-b border-slate-100 shadow-sm"
          : "bg-white/5 backdrop-blur-xl border-b border-white/5"
      )}>
        <div className="max-w-7xl mx-auto px-6 lg:px-12 h-20 flex items-center justify-between">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-3 group">
            <div className="relative">
              <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/25 group-hover:scale-110 transition-transform">
                <GraduationCap className="w-5 h-5 text-white" />
              </div>
              <div className="absolute -inset-1 bg-sky-600 rounded-2xl blur opacity-0 group-hover:opacity-30 transition-opacity" />
            </div>
            <div>
              <span className="text-lg font-black text-slate-900 tracking-tight">SmartTutor<span className="text-sky-600">ET</span></span>
              <p className="text-[9px] font-bold text-slate-400 uppercase tracking-widest -mt-0.5">Grades 9–12 Platform</p>
            </div>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden lg:flex items-center gap-1">
            {navLinks.map(link => (
              <a key={link.label} href={link.href}
                className="px-5 py-2.5 rounded-xl text-sm font-semibold text-slate-500 hover:text-sky-600 hover:bg-sky-50 transition-all duration-200">
                {link.label}
              </a>
            ))}
          </nav>

          {/* CTAs */}
          <div className="hidden lg:flex items-center gap-3">
            <Link href="/login">
              <Button variant="ghost" className="h-10 px-6 rounded-xl text-slate-500 hover:text-sky-600 hover:bg-sky-50 font-semibold text-sm">
                Sign In
              </Button>
            </Link>
            <Link href="/signup">
              <Button className="h-10 px-6 rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black text-sm shadow-lg shadow-sky-600/20 transition-all hover:scale-105">
                Start Free <ArrowRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          {/* Mobile Hamburger */}
          <button className="lg:hidden p-2.5 rounded-xl bg-slate-100 border border-slate-200" onClick={() => setMobileMenuOpen(!mobileMenuOpen)}>
            {mobileMenuOpen ? <X className="w-5 h-5 text-slate-600" /> : <Menu className="w-5 h-5 text-slate-600" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {mobileMenuOpen && (
          <div className="lg:hidden bg-white border-t border-slate-100 px-6 py-8 space-y-2 shadow-xl">
            {navLinks.map(link => (
              <a key={link.label} href={link.href} onClick={() => setMobileMenuOpen(false)}
                className="flex items-center gap-4 p-4 rounded-2xl hover:bg-sky-50 text-slate-600 hover:text-sky-600 transition-all font-semibold">
                <ChevronRight className="w-4 h-4" /> {link.label}
              </a>
            ))}
            <div className="pt-6 grid grid-cols-2 gap-3">
              <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                <Button variant="outline" className="w-full rounded-xl border-slate-200 text-slate-600 font-semibold">Sign In</Button>
              </Link>
              <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                <Button className="w-full rounded-xl bg-sky-600 hover:bg-sky-700 text-white font-black">Start Free</Button>
              </Link>
            </div>
          </div>
        )}
      </header>

      {/* ─── HERO ─── */}
      <section className="relative pt-32 pb-24 overflow-hidden">
        {/* Decorative blobs */}
        <div className="absolute -top-32 -right-32 w-[600px] h-[600px] bg-sky-100 rounded-full blur-[100px] opacity-60 pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-[400px] h-[400px] bg-indigo-100 rounded-full blur-[80px] opacity-50 pointer-events-none" />

        <div className="relative max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid lg:grid-cols-2 gap-20 items-center">

            {/* Left */}
            <div className="space-y-10">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[11px] font-black uppercase tracking-widest">
                <div className="w-2 h-2 rounded-full bg-sky-500 animate-pulse" />
                🇪🇹 Ethiopia's #1 AI Learning Platform for Grades 9–12
              </div>

              <div className="space-y-5">
                <h1 className="text-6xl lg:text-7xl xl:text-8xl font-black leading-[0.9] tracking-tight text-slate-900">
                  Learn
                  <span className="text-sky-600">.</span>
                  <br />
                  <span className="text-sky-600">Excel</span>
                  <span className="text-slate-900">.</span>
                  <br />
                  Achieve
                  <span className="text-sky-600">.</span>
                </h1>
                <p className="text-xl text-slate-500 leading-relaxed max-w-xl font-medium">
                  AI-powered tutoring, live expert classes, and smart analytics — built specifically for Ethiopian students in Grades 9–12.
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4">
                <Link href="/signup">
                  <Button size="lg" className="h-16 px-10 rounded-2xl bg-sky-600 hover:bg-sky-700 text-white font-black text-base shadow-2xl shadow-sky-600/25 transition-all hover:scale-105 group">
                    Start Free Today
                    <ArrowRight className="ml-3 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold text-base hover:bg-slate-50 hover:border-sky-200 hover:text-sky-600 transition-all group">
                  <Play className="mr-3 w-5 h-5 text-sky-500" />
                  Watch How It Works
                </Button>
              </div>

              {/* Stats row */}
              <div className="flex items-center gap-8 pt-2">
                {[
                  { val: "12K+", label: "Active Students" },
                  { val: "98%", label: "Pass Rate" },
                  { val: "200+", label: "Expert Teachers" },
                ].map((s, i) => (
                  <div key={i}>
                    <div className="text-3xl font-black text-sky-600">{s.val}</div>
                    <div className="text-[10px] font-bold text-slate-400 uppercase tracking-widest mt-1">{s.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Right — Dashboard Mockup */}
            <div className="relative hidden lg:block">
              <div className="absolute -inset-6 bg-sky-100/40 rounded-[72px] blur-2xl" />
              <div className="relative bg-white rounded-[48px] border border-slate-100 shadow-2xl shadow-slate-200/60 p-8 space-y-6">

                {/* Header */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
                      <Brain className="w-5 h-5 text-white" />
                    </div>
                    <div>
                      <div className="text-sm font-black text-slate-900">Student Dashboard</div>
                      <div className="text-[10px] text-slate-400 font-semibold uppercase tracking-widest">Grade 12 • Physics Track</div>
                    </div>
                  </div>
                  <span className="px-3 py-1 rounded-full bg-sky-50 text-sky-600 text-[10px] font-black uppercase tracking-widest border border-sky-100">Active</span>
                </div>

                {/* AI Insight */}
                <div className="p-5 rounded-[28px] bg-sky-50 border border-sky-100 flex items-center gap-4">
                  <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center flex-shrink-0 shadow-lg shadow-sky-600/20">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <p className="text-[9px] font-black uppercase tracking-widest text-sky-600 mb-0.5">AI Insight</p>
                    <p className="text-slate-700 font-semibold text-sm leading-snug">87% ready for National Exam. Focus on Electromagnetism next.</p>
                  </div>
                </div>

                {/* Course Progress */}
                <div className="space-y-5">
                  {[
                    { subject: "Physics", progress: 87, color: "bg-sky-500", emoji: "⚛️" },
                    { subject: "Mathematics", progress: 72, color: "bg-indigo-500", emoji: "🧮" },
                    { subject: "Chemistry", progress: 61, color: "bg-teal-500", emoji: "🔬" },
                  ].map((c, i) => (
                    <div key={i} className="space-y-2">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-slate-700 flex items-center gap-2">
                          <span>{c.emoji}</span>{c.subject}
                        </span>
                        <span className="text-sm font-black text-slate-900">{c.progress}%</span>
                      </div>
                      <div className="h-2 rounded-full bg-slate-100 overflow-hidden">
                        <div className={cn("h-full rounded-full transition-all", c.color)} style={{ width: `${c.progress}%` }} />
                      </div>
                    </div>
                  ))}
                </div>

                {/* Live Alert */}
                <div className="p-5 rounded-[28px] bg-emerald-50 border border-emerald-100 flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                    <div>
                      <p className="text-sm font-black text-slate-900">Live: Physics — Electromagnetism</p>
                      <p className="text-[10px] text-emerald-600 font-bold uppercase tracking-widest">Starts in 5 min • 43 students</p>
                    </div>
                  </div>
                  <Button size="sm" className="h-9 px-5 rounded-xl bg-emerald-500 hover:bg-emerald-600 text-white font-black text-[10px] uppercase tracking-widest shadow-lg shadow-emerald-500/20">
                    Join
                  </Button>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-5 -right-5 w-14 h-14 rounded-2xl bg-amber-50 border border-amber-100 flex items-center justify-center shadow-xl">
                  <Award className="w-7 h-7 text-amber-500" />
                </div>
                <div className="absolute -bottom-5 -left-5 w-12 h-12 rounded-2xl bg-sky-50 border border-sky-100 flex items-center justify-center shadow-xl">
                  <TrendingUp className="w-6 h-6 text-sky-600" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── CITY STRIP ─── */}
      <section className="py-8 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col md:flex-row items-center justify-center gap-6 md:gap-12 text-slate-400">
            <div className="flex items-center gap-3">
              <Globe className="w-5 h-5 text-sky-500" />
              <span className="text-xs font-black uppercase tracking-widest text-slate-600">Serving All Regions of Ethiopia</span>
            </div>
            <div className="h-4 w-px bg-slate-200 hidden md:block" />
            <div className="flex flex-wrap items-center justify-center gap-6 text-[11px] font-bold uppercase tracking-widest">
              <span className="text-slate-400">Offline Centers:</span>
              {["Addis Ababa", "Hawassa", "Dire Dawa", "Bahir Dar", "Mekelle", "Jimma"].map((city, i) => (
                <div key={i} className="flex items-center gap-1.5 hover:text-sky-600 transition-colors cursor-default">
                  <div className="w-1 h-1 rounded-full bg-sky-400" />
                  <span>{city}</span>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* ─── FEATURES ─── */}
      <section id="features" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center space-y-5 mb-20">
            <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-sky-50 border border-sky-100 text-sky-600 text-[11px] font-black uppercase tracking-widest">
              <Zap className="w-4 h-4" /> Powered by Advanced AI
            </div>
            <h2 className="text-5xl lg:text-6xl font-black leading-tight text-slate-900">
              Everything you need to<br />
              <span className="text-sky-600">master your grades</span>
            </h2>
            <p className="text-xl text-slate-400 max-w-2xl mx-auto leading-relaxed font-medium">
              SmartTutorET brings AI tutoring, live teaching, and collaborative tools into one seamless platform.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {features.map((f, i) => {
              const acc = accentClasses[f.color]
              return (
                <div key={i} className={cn(
                  "group p-8 rounded-[32px] bg-white border transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-slate-200/60 cursor-pointer",
                  acc.border
                )}>
                  <div className="flex items-start justify-between mb-6">
                    <div className={cn("w-14 h-14 rounded-2xl flex items-center justify-center border group-hover:scale-110 transition-transform shadow-sm", acc.icon)}>
                      <f.icon className="w-7 h-7" />
                    </div>
                    <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", acc.badge)}>
                      {f.tag}
                    </span>
                  </div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{f.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium text-sm">{f.desc}</p>
                  <div className="flex items-center gap-2 mt-8 pt-6 border-t border-slate-50 text-sky-600 text-sm font-black group-hover:gap-3 transition-all">
                    <span>Learn more</span>
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ─── */}
      <section className="py-32 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="text-center mb-20">
            <h2 className="text-5xl font-black text-slate-900 mb-4">Get started in <span className="text-sky-600">3 steps</span></h2>
            <p className="text-xl text-slate-400 font-medium">From signup to your first AI lesson in under 2 minutes.</p>
          </div>

          <div className="grid md:grid-cols-3 gap-10 relative">
            <div className="absolute top-14 left-[20%] right-[20%] h-px bg-sky-100 hidden md:block" />

            {steps.map((step, i) => (
              <div key={i} className="text-center space-y-6 relative">
                <div className="relative inline-flex flex-col items-center justify-center w-28 h-28 rounded-[32px] bg-sky-50 border border-sky-100 mx-auto shadow-lg shadow-sky-100/60">
                  <step.icon className="w-8 h-8 text-sky-600 mb-1" />
                  <span className="text-[10px] font-black text-sky-400 uppercase tracking-widest">{step.step}</span>
                </div>
                <div>
                  <h3 className="text-xl font-black text-slate-900 mb-3">{step.title}</h3>
                  <p className="text-slate-500 leading-relaxed font-medium">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── COURSES ─── */}
      <section id="courses" className="py-32 bg-slate-50">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="flex flex-col lg:flex-row lg:items-end justify-between gap-6 mb-16">
            <div className="space-y-4">
              <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-indigo-50 border border-indigo-100 text-indigo-600 text-[11px] font-black uppercase tracking-widest">
                <BookOpen className="w-4 h-4" /> Full Curriculum Coverage
              </div>
              <h2 className="text-5xl font-black text-slate-900">Popular Courses</h2>
            </div>
            <Link href="#courses">
              <Button variant="outline" className="h-12 px-8 rounded-2xl border-slate-200 bg-white text-slate-600 hover:bg-sky-50 hover:text-sky-600 hover:border-sky-200 font-bold transition-all">
                Browse All Courses <ChevronRight className="ml-2 w-4 h-4" />
              </Button>
            </Link>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {courses.map((c, i) => {
              const acc = accentClasses[c.accent]
              return (
                <div key={i} className={cn(
                  "group rounded-[28px] overflow-hidden border bg-white hover:shadow-xl hover:shadow-slate-200/60 transition-all duration-300 hover:scale-[1.02] cursor-pointer",
                  acc.border
                )}>
                  {/* Removed upper border strip for a cleaner look */}
                  <div className="p-7">
                    <div className="flex items-start justify-between mb-5">
                      <div className="text-4xl">{c.emoji}</div>
                      <span className={cn("px-3 py-1 rounded-full text-[9px] font-black uppercase tracking-widest border", acc.badge)}>{c.grade}</span>
                    </div>
                    <h3 className="text-lg font-black text-slate-900 mb-1">{c.grade} {c.subject}</h3>
                    <p className="text-slate-400 text-sm font-medium mb-6">By {c.teacher}</p>

                    <div className="flex items-center justify-between text-sm pt-4 border-t border-slate-50">
                      <div className="flex items-center gap-2 text-slate-400 font-semibold">
                        <Users className="w-4 h-4" /> {c.students} students
                      </div>
                      <div className="flex items-center gap-1 text-amber-500 font-black">
                        <Star className="w-4 h-4 fill-amber-400 text-amber-400" /> {c.rating}
                      </div>
                    </div>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ─── TESTIMONIALS ─── */}
      <section id="testimonials" className="py-32 bg-white border-y border-slate-100">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          {/* Carousel Header */}
          <div className="text-center mb-16">
            <h2 className="text-5xl md:text-6xl font-black text-slate-900 mb-6 tracking-tight">Loved by students across <span className="text-sky-600">Ethiopia</span></h2>
            <p className="text-lg md:text-xl text-slate-500 font-medium max-w-2xl mx-auto leading-relaxed">Hear directly from the students who are transforming their academic results with SmartTutorET.</p>
          </div>

          <div className="relative max-w-[1400px] mx-auto group">
            {/* Carousel Container */}
            <div className="overflow-hidden py-10">
              <div
                className="flex transition-transform duration-700 ease-[cubic-bezier(0.23,1,0.32,1)]"
                style={{
                  transform: `translateX(-${testimonialIndex * (100 / (typeof window !== 'undefined' && window.innerWidth < 1024 ? 1 : 3))}%)`
                }}
              >
                {testimonials.map((t, i) => (
                  <div key={i} className="w-full lg:w-1/3 flex-shrink-0 px-4">
                    <div className="h-full p-8 md:p-10 rounded-[32px] bg-white border border-slate-200 shadow-sm hover:shadow-md transition-all duration-300 group/card">
                      <div className="flex gap-1 mb-6">
                        {[...Array(t.stars)].map((_, s) => (
                          <Star key={s} className="w-4 h-4 fill-amber-400 text-amber-400" />
                        ))}
                      </div>
                      <p className="text-slate-600 leading-relaxed font-medium mb-10 text-lg">"{t.text}"</p>
                      <div className="flex items-center gap-4 pt-8 border-t border-slate-100">
                        <div className="w-14 h-14 rounded-2xl bg-sky-600 flex items-center justify-center text-white font-black text-lg shadow-sm">
                          {t.avatar}
                        </div>
                        <div>
                          <p className="font-black text-slate-900">{t.name}</p>
                          <p className="text-[10px] text-sky-600 font-bold uppercase tracking-widest">{t.grade} • {t.score}</p>
                        </div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Navigation Buttons - Simple Style */}
            <div className="absolute top-1/2 -translate-y-1/2 -left-4 -right-4 flex justify-between pointer-events-none transition-opacity duration-300">
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTestimonialIndex((prev) => (prev === 0 ? testimonials.length - 1 : prev - 1))}
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-600 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-5 h-5 rotate-180" />
              </Button>
              <Button
                variant="outline"
                size="icon"
                onClick={() => setTestimonialIndex((prev) => (prev === (typeof window !== 'undefined' && window.innerWidth < 1024 ? testimonials.length - 1 : testimonials.length - 3) ? 0 : prev + 1))}
                className="w-12 h-12 rounded-full bg-white shadow-sm border border-slate-200 text-slate-600 hover:text-sky-600 hover:border-sky-600 pointer-events-auto transition-all"
              >
                <ChevronRight className="w-5 h-5" />
              </Button>
            </div>

            {/* Pagination Dots */}
            <div className="flex justify-center gap-3 mt-12">
              {testimonials.map((_, i) => {
                // Adjust dots for desktop (only 2 slides if 3 cards/slide)
                const maxIndex = typeof window !== 'undefined' && window.innerWidth < 1024 ? testimonials.length : testimonials.length - 2;
                if (i >= maxIndex && typeof window !== 'undefined' && window.innerWidth >= 1024) return null;

                return (
                  <button
                    key={i}
                    onClick={() => setTestimonialIndex(i)}
                    className={cn(
                      "h-2.5 rounded-full transition-all duration-500",
                      testimonialIndex === i ? "w-10 bg-sky-600 shadow-lg shadow-sky-600/40" : "w-2.5 bg-slate-200 hover:bg-sky-200"
                    )}
                  />
                )
              })}
            </div>
          </div>
        </div>
      </section>

      {/* ─── CTA SECTION ─── */}
      <section className="py-24 bg-slate-50 border-t border-slate-200">
        <div className="max-w-7xl mx-auto px-6 lg:px-12 text-center">
          <div className="space-y-8 max-w-4xl mx-auto">
            <h2 className="text-5xl md:text-7xl font-black text-slate-900 leading-tight">
              Start Your <span className="text-sky-600">Success Story</span>
            </h2>
            <p className="text-xl text-slate-500 font-medium leading-relaxed">
              Join 12,000+ top Ethiopian students mastering their grades with AI-powered personalized learning.
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center pt-6">
              <Link href="/signup">
                <Button size="lg" className="h-16 px-10 rounded-2xl bg-sky-600 text-white hover:bg-sky-700 font-black text-base shadow-lg shadow-sky-600/20">
                  Start Free Today <ArrowRight className="ml-2 w-5 h-5" />
                </Button>
              </Link>
              <Link href="/login">
                <Button size="lg" variant="outline" className="h-16 px-10 rounded-2xl border-slate-200 bg-white text-slate-600 font-bold text-base hover:bg-slate-50 hover:text-sky-600 hover:border-sky-600 transition-all">
                  Sign In to Account
                </Button>
              </Link>
            </div>

            <div className="pt-12 flex flex-wrap justify-center gap-8 text-slate-400 text-sm font-bold border-t border-slate-200">
              <div className="flex items-center gap-2 italic">
                <CheckCircle2 className="w-5 h-5 text-sky-500" /> Free Forever Plan
              </div>
              <div className="flex items-center gap-2 italic">
                <CheckCircle2 className="w-5 h-5 text-sky-500" /> Expert Ethiopian Tutors
              </div>
              <div className="flex items-center gap-2 italic">
                <CheckCircle2 className="w-5 h-5 text-sky-500" /> 98% Success Rate
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ─── FOOTER ─── */}
      <footer className="bg-slate-900 py-16">
        <div className="max-w-7xl mx-auto px-6 lg:px-12">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-12">
            <div className="space-y-5">
              <Link href="/" className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-2xl bg-sky-600 flex items-center justify-center shadow-lg shadow-sky-600/30">
                  <GraduationCap className="w-5 h-5 text-white" />
                </div>
                <span className="text-lg font-black text-white">SmartTutor<span className="text-sky-400">ET</span></span>
              </Link>
              <p className="text-slate-400 text-sm leading-relaxed font-medium">
                Ethiopia's premier AI-powered learning platform for Grade 9–12 students.
              </p>
            </div>

            {[
              { title: "Platform", links: ["Features", "Courses", "Teachers", "Schools"] },
              { title: "Grades", links: ["Grade 9", "Grade 10", "Grade 11", "Grade 12"] },
              { title: "Company", links: ["About Us", "Blog", "Careers", "Contact"] },
            ].map((col, i) => (
              <div key={i}>
                <h4 className="text-[10px] font-black text-slate-500 uppercase tracking-widest mb-5">{col.title}</h4>
                <ul className="space-y-3">
                  {col.links.map(link => (
                    <li key={link}>
                      <a href="#" className="text-slate-400 hover:text-white text-sm font-medium transition-colors">{link}</a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="pt-8 border-t border-slate-800 flex flex-col md:flex-row items-center justify-between gap-4">
            <p className="text-slate-500 text-sm font-medium">© 2026 SmartTutorET. All rights reserved.</p>
            <div className="flex items-center gap-2 text-slate-500 text-sm">
              Made with <Heart className="w-4 h-4 text-rose-500 fill-rose-500 mx-1" /> in Ethiopia
            </div>
          </div>
        </div>
      </footer>
    </div>
  )
}
