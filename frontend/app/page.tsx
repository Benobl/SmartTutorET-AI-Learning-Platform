"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import {
  CheckCircle2,
  Users,
  Zap,
  TrendingUp,
  BookOpen,
  Award,
  ArrowRight,
  Star,
  Sparkles,
  Menu,
  X,
  Brain,
  Target,
  Rocket,
  Globe,
  Clock,
  Shield,
  MessageSquare,
  Video,
  FileText,
  Phone,
  Mail,
  MapPin,
  Facebook,
  Twitter,
  Instagram,
  Linkedin,
  Youtube,
  Heart,
  ChevronRight,
  ExternalLink,
  PlayCircle,
  BarChart3,
  Download,
  Calendar,
  Headphones,
  GraduationCap,
  Lightbulb,
  Bookmark,
  Share2,
  ThumbsUp,
  Eye,
  Globe2,
  TabletSmartphone,
  Cloud,
  Lock,
  Bell,
  Settings,
  UserPlus,
  VideoIcon,
  Mic,
  PenTool,
  FileCode,
  Calculator,
  Atom,
  Music,
  Palette,
  Dumbbell,
  Coffee,
  Moon,
  Sun,
  Book,
  History,
  Code,
} from "lucide-react"

// HeartIcon alias for use in feature cards
const HeartIcon = Heart

export default function LandingPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [hoveredFeature, setHoveredFeature] = useState<number | null>(null)
  const [activeTab, setActiveTab] = useState("all")

  // Color gradients for cards (applied as default, not just on hover)
  const cardGradients = [
    "from-[#3D7FA2] to-[#206687]",
    "from-[#1B5A6C] to-[#294B61]",
    "from-[#206687] to-[#103255]",
    "from-[#294B61] to-[#2E4360]",
    "from-[#3D7FA2] to-[#1B5A6C]",
    "from-[#206687] to-[#3D7FA2]",
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#1B5A6C] to-[#223347] overflow-x-hidden">
      {/* Enhanced Header */}
      <header className="sticky top-0 z-50 w-full backdrop-blur-2xl bg-gradient-to-b from-white/10 to-white/5 border-b border-white/10">
        <div className="absolute inset-0 bg-gradient-to-r from-[#1B5A6C]/20 via-[#294B61]/10 to-[#2E4360]/20" />

        <div className="relative">
          {/* Top Bar */}
          <div className="container mx-auto px-6 md:px-12 py-2">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2 text-xs text-white/60">
                <div className="flex items-center gap-1">
                  <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  <span>🎓 12,543 Students Learning Now</span>
                </div>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">⭐ 98% Success Rate</span>
              </div>

              <div className="flex items-center gap-4 text-xs">
                <button className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
                  <Globe2 className="w-3 h-3" />
                  🇪🇹 Amharic
                </button>
                <div className="hidden md:flex items-center gap-4">
                  <a href="#" className="flex items-center gap-1 text-white/60 hover:text-white transition-colors">
                    <Headphones className="w-3 h-3" />
                    Grade 9-12 Support
                  </a>
                </div>
              </div>
            </div>
          </div>

          {/* Main Navigation */}
          <div className="container mx-auto px-6 md:px-12">
            <div className="flex items-center justify-between h-20">
              {/* Logo */}
              <div className="flex items-center gap-3 group cursor-pointer">
                <div className="relative">
                  <div className="w-12 h-12 rounded-2xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center shadow-lg group-hover:scale-105 transition-transform">
                    <GraduationCap className="w-6 h-6 text-white" />
                  </div>
                  <div className="absolute -inset-1 bg-gradient-to-r from-[#3D7FA2] to-[#206687] rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
                </div>
                <div>
                  <div className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    SmartTutor<span className="text-[#3D7FA2]">ET</span>
                  </div>
                  <div className="text-xs text-white/60 -mt-1">Grades 9-12 Learning Platform</div>
                </div>
              </div>

              {/* Desktop Navigation - Updated to match sections */}
              <nav className="hidden lg:flex items-center gap-1">
                {[
                  { label: "Home", icon: "🏠", badge: null },
                  { label: "Features", icon: "✨", badge: "AI" },
                  { label: "Courses", icon: "📚", badge: "9-12" },
                  { label: "Subjects", icon: "🧪", badge: "8+" },
                  { label: "For Schools", icon: "🏫", badge: null },
                  { label: "About", icon: "👥", badge: null },
                ].map((item) => (
                  <a
                    key={item.label}
                    href={`#${item.label.toLowerCase().replace(" ", "-")}`}
                    className="relative group"
                  >
                    <div className="flex items-center gap-2 px-6 py-3 rounded-2xl transition-all duration-300 hover:bg-white/10 hover:scale-105">
                      <span>{item.icon}</span>
                      <span className="text-sm font-medium text-white/90 group-hover:text-white">
                        {item.label}
                      </span>
                      {item.badge && (
                        <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white">
                          {item.badge}
                        </span>
                      )}
                    </div>
                    <div className="absolute bottom-0 left-1/2 transform -translate-x-1/2 w-6 h-0.5 bg-gradient-to-r from-[#3D7FA2] to-[#206687] rounded-full opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </a>
                ))}
              </nav>

              {/* CTA Buttons */}
              <div className="hidden lg:flex items-center gap-3">
                <Link href="/login">
                  <Button
                    variant="ghost"
                    className="rounded-full border border-white/20 bg-white/5 hover:bg-white/10 text-white px-6 backdrop-blur-sm"
                  >
                    Sign In
                  </Button>
                </Link>
                <Link href="/signup">
                  <Button
                    className="rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] hover:from-[#206687] hover:to-[#103255] text-white shadow-lg hover:shadow-xl px-6 transition-all duration-300 group"
                  >
                    Start Learning
                    <ArrowRight className="w-4 h-4 ml-2 group-hover:translate-x-1 transition-transform" />
                  </Button>
                </Link>
              </div>

              {/* Mobile Menu Button */}
              <button
                className="lg:hidden p-3 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              >
                {mobileMenuOpen ? (
                  <X className="w-6 h-6 text-white" />
                ) : (
                  <Menu className="w-6 h-6 text-white" />
                )}
              </button>
            </div>
          </div>
        </div>

        {/* Enhanced Mobile Navigation */}
        {mobileMenuOpen && (
          <div className="lg:hidden">
            <div className="absolute top-full left-0 right-0 bg-gradient-to-b from-[#2E4360]/95 to-[#223347]/95 backdrop-blur-2xl border-t border-white/10 rounded-b-3xl shadow-2xl mx-4 overflow-hidden">
              <div className="p-6">
                <div className="space-y-1">
                  {[
                    { label: "Home", icon: "🏠", desc: "Welcome page", badge: null },
                    { label: "Features", icon: "✨", desc: "AI-powered tools", badge: "AI" },
                    { label: "Courses", icon: "📚", desc: "Grade 9-12 courses", badge: "1-12" },
                    { label: "Subjects", icon: "🧪", desc: "8+ subjects", badge: "8+" },
                    { label: "For Schools", icon: "🏫", desc: "School packages", badge: null },
                    { label: "About", icon: "👥", desc: "Our story", badge: null },
                  ].map((item) => (
                    <a
                      key={item.label}
                      href={`#${item.label.toLowerCase().replace(" ", "-")}`}
                      className="flex items-center gap-4 p-4 rounded-2xl hover:bg-white/10 transition-all duration-300 group"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3D7FA2]/20 to-[#206687]/20 flex items-center justify-center">
                        <span className="text-lg">{item.icon}</span>
                      </div>
                      <div className="flex-1">
                        <div className="flex items-center gap-2">
                          <div className="font-medium text-white">{item.label}</div>
                          {item.badge && (
                            <span className="px-2 py-0.5 text-xs rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white">
                              {item.badge}
                            </span>
                          )}
                        </div>
                        <div className="text-sm text-white/60">{item.desc}</div>
                      </div>
                      <ChevronRight className="w-5 h-5 text-white/40 group-hover:text-white/60" />
                    </a>
                  ))}
                </div>

                <div className="mt-8 pt-6 border-t border-white/20">
                  <div className="grid grid-cols-2 gap-3">
                    <Link href="/login" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        variant="outline"
                        className="w-full rounded-xl border-white/20 bg-white/5 text-white hover:bg-white/10 h-12"
                      >
                        Sign In
                      </Button>
                    </Link>
                    <Link href="/signup" onClick={() => setMobileMenuOpen(false)}>
                      <Button
                        className="w-full rounded-xl bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white h-12"
                      >
                        Start Free
                      </Button>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Enhanced Hero Section */}
      <section className="relative px-6 md:px-12 py-20 md:py-32 overflow-hidden">
        {/* Animated Background */}
        <div className="absolute inset-0 overflow-hidden">
          <div className="absolute top-20 -left-20 w-96 h-96 bg-[#3D7FA2]/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute bottom-20 -right-20 w-96 h-96 bg-[#206687]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>

          {/* Floating particles */}
          {[...Array(15)].map((_, i) => (
            <div
              key={i}
              className="absolute w-2 h-2 rounded-full bg-white/20"
              style={{
                top: `${Math.random() * 100}%`,
                left: `${Math.random() * 100}%`,
                animation: `float ${3 + Math.random() * 4}s ease-in-out infinite`,
                animationDelay: `${Math.random() * 2}s`,
              }}
            />
          ))}
        </div>

        <div className="relative container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              {/* Interactive Badge */}
              <div className="inline-flex items-center gap-3 px-5 py-2.5 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 w-fit group hover:bg-white/15 transition-all duration-300 cursor-pointer hover:scale-105">
                <div className="relative">
                  <Sparkles className="w-5 h-5 text-white animate-spin-slow" />
                </div>
                <span className="text-sm font-medium text-white">🎓 Ethiopia's #1 Grade 1-12 Platform</span>
                <ChevronRight className="w-4 h-4 text-white/60 group-hover:text-white transition-colors" />
              </div>

              {/* Headline with Typing Effect */}
              <div className="space-y-6">
                <h1 className="text-5xl md:text-6xl lg:text-7xl font-bold leading-tight text-white">
                  Learn <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] animate-gradient">Smarter</span>,
                  <br />
                  From <span className="text-white">Grade 9</span> to <span className="text-white">12</span>
                </h1>
                <p className="text-xl text-white/80 leading-relaxed max-w-2xl">
                  Ethiopia's premier AI-powered learning platform for all grades. Personalized tutoring, comprehensive curriculum, and exam preparation for every student.
                </p>
              </div>

              {/* Interactive CTA Buttons */}
              <div className="flex flex-col sm:flex-row gap-4 pt-8">
                <Link href="/signup">
                  <Button
                    size="lg"
                    className="rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] hover:from-[#206687] hover:to-[#103255] text-white border-0 shadow-lg hover:shadow-xl px-8 transition-all duration-300 group relative overflow-hidden"
                  >
                    <span className="relative z-10 flex items-center">
                      🚀 Start Free Trial
                      <ArrowRight className="w-5 h-5 ml-3 group-hover:translate-x-1 transition-transform" />
                    </span>
                    <div className="absolute inset-0 bg-gradient-to-r from-[#206687] to-[#103255] opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </Button>
                </Link>
                <Link href="#courses">
                  <Button
                    size="lg"
                    variant="outline"
                    className="rounded-full border-white/30 text-white hover:bg-white/10 bg-transparent px-8 group"
                  >
                    <div className="flex items-center">
                      <BookOpen className="w-5 h-5 mr-2 group-hover:scale-110 transition-transform" />
                      Browse Courses
                    </div>
                  </Button>
                </Link>
              </div>

              {/* Real-time Stats */}
              <div className="grid grid-cols-3 gap-4 pt-12">
                {[
                  { value: "12,543", label: "Students", icon: "👨‍🎓", color: "#3D7FA2" },
                  { value: "98%", label: "Success Rate", icon: "📈", color: "#206687" },
                  { value: "9-12", label: "All Grades", icon: "🎯", color: "#1B5A6C" },
                ].map((stat, idx) => (
                  <div key={idx} className="text-center p-4 rounded-2xl bg-white/5 backdrop-blur-sm border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    {/* Glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 blur-lg transition-opacity duration-300" />
                    <div className="relative z-10 text-2xl font-bold text-white group-hover:scale-110 transition-transform" style={{ color: stat.color }}>
                      {stat.value}
                    </div>
                    <div className="relative z-10 text-sm text-white/60 mt-1 flex items-center justify-center gap-1">
                      <span>{stat.icon}</span>
                      {stat.label}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Interactive Hero Dashboard */}
            <div className="relative">
              <div className="relative rounded-[40px] bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-lg p-2 shadow-2xl overflow-hidden group">
                {/* Glowing Border Effect */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2]/20 via-[#206687]/10 to-[#1B5A6C]/20 rounded-[40px] blur-xl group-hover:blur-2xl transition-all duration-500" />
                <div className="absolute inset-0 border-2 border-transparent rounded-[40px] bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px]">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-[40px] blur-lg opacity-50 group-hover:opacity-70 transition-opacity" />
                </div>

                {/* Dashboard Content */}
                <div className="relative bg-gradient-to-br from-[#1B5A6C]/30 via-[#223347]/20 to-[#2E4360]/10 rounded-[38px] p-6 md:p-8">
                  {/* Dashboard Header */}
                  <div className="flex items-center justify-between mb-8">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center">
                        <Brain className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <div className="text-white font-semibold">Student Dashboard</div>
                        <div className="text-xs text-white/60">Grade 8 • All Subjects</div>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                      <span className="text-xs text-white/60">Active</span>
                    </div>
                  </div>

                  {/* Interactive Course Cards */}
                  <div className="space-y-4 mb-6">
                    {[
                      { title: "Grade 12 Mathematics", progress: 85, color: "#3D7FA2", icon: "🧮" },
                      { title: "Grade 12 Science", progress: 62, color: "#206687", icon: "⚛️" },
                      { title: "Grade 12 English", progress: 78, color: "#1B5A6C", icon: "🔤" },
                    ].map((course, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden"
                      >
                        {/* Glowing effect on hover */}
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 blur-lg transition-opacity duration-300" />

                        <div className="relative z-10 flex items-center justify-between mb-2">
                          <div className="flex items-center gap-3">
                            <span className="text-xl">{course.icon}</span>
                            <div className="text-white font-medium">{course.title}</div>
                          </div>
                          <div className="text-sm text-white/60 group-hover:text-white transition-colors">
                            {course.progress}%
                          </div>
                        </div>
                        <div className="relative z-10 h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 group-hover:scale-y-125"
                            style={{
                              width: `${course.progress}%`,
                              background: `linear-gradient(90deg, ${course.color}, ${course.color}80)`
                            }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>

                  {/* Live Session Notification */}
                  <div className="p-4 rounded-2xl bg-gradient-to-r from-[#3D7FA2]/20 to-[#206687]/20 border border-white/10 relative overflow-hidden group">
                    {/* Glowing background */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 blur-lg transition-opacity duration-300" />

                    <div className="relative z-10 flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Video className="w-5 h-5 text-white" />
                        </div>
                        <div>
                          <div className="text-white font-semibold">Live Session: Mathematics</div>
                          <div className="text-xs text-white/60">Starting in 5 minutes</div>
                        </div>
                      </div>
                      <Button size="sm" className="rounded-full bg-white/10 hover:bg-white/20 text-white border-0">
                        Join Now
                      </Button>
                    </div>
                  </div>
                </div>
              </div>

              {/* Floating Achievement Badges */}
              <div className="absolute -top-4 -right-4">
                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-yellow-500/20 to-orange-500/20 backdrop-blur-sm border border-yellow-500/30 flex items-center justify-center animate-bounce shadow-lg shadow-yellow-500/20">
                  <Award className="w-8 h-8 text-yellow-400" />
                </div>
              </div>
              <div className="absolute -bottom-4 -left-4">
                <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-green-500/20 to-emerald-500/20 backdrop-blur-sm border border-green-500/30 flex items-center justify-center animate-bounce shadow-lg shadow-green-500/20" style={{ animationDelay: "0.5s" }}>
                  <TrendingUp className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* 🎯 AI-Powered Features Section */}
      <section id="features" className="relative px-6 md:px-12 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#1B5A6C]/10 to-transparent" />

        <div className="relative container mx-auto">
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-[#3D7FA2]/20 to-[#206687]/20 border border-[#3D7FA2]/30">
              <Zap className="w-4 h-4 text-[#3D7FA2]" />
              <span className="text-sm font-medium text-white">Powered by Advanced AI</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Transform <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C]">Learning</span> Experience
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              SmartTutorET combines cutting-edge AI technology with proven educational methodologies for Grades 1-12.
            </p>
          </div>

          {/* Feature Categories */}
          <div className="flex flex-wrap justify-center gap-4 mb-12">
            {["all", "ai", "collaboration", "analytics", "resources", "wellness"].map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-6 py-3 rounded-full font-medium transition-all duration-300 ${activeTab === tab
                  ? 'bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white shadow-lg'
                  : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>

          {/* Feature Grid with Enhanced Cards */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                category: "ai",
                icon: Brain,
                title: "Adaptive AI Tutor",
                description: "Personalized learning paths that adjust to your pace, strengths, and weaknesses in real-time.",
                features: ["24/7 Availability", "Instant Feedback", "Personalized Quizzes", "Learning Pattern Analysis"],
                badge: "AI",
                gradientIndex: 0
              },
              {
                category: "collaboration",
                icon: Users,
                title: "Smart Study Groups",
                description: "AI-matched study partners and collaborative learning environments with real-time tools.",
                features: ["Video Sessions", "Shared Whiteboard", "Group Assignments", "Peer Review"],
                badge: "Social",
                gradientIndex: 1
              },
              {
                category: "analytics",
                icon: BarChart3,
                title: "Learning Analytics",
                description: "Comprehensive insights into your progress with predictive analytics and recommendations.",
                features: ["Progress Tracking", "Performance Predictions", "Weakness Analysis", "Study Recommendations"],
                badge: "Data",
                gradientIndex: 2
              },
              {
                category: "resources",
                icon: BookOpen,
                title: "Dynamic Resource Library",
                description: "Thousands of curated resources including videos, interactive simulations, and practice exercises.",
                features: ["Video Lessons", "Interactive Exercises", "PDF Notes", "Offline Access"],
                badge: "Library",
                gradientIndex: 3
              },
              {
                category: "wellness",
                icon: HeartIcon,
                title: "Emotional Wellness",
                description: "Built-in tools for stress management, motivation tracking, and mental health support.",
                features: ["Mood Tracking", "Stress Management", "Motivation Tools", "Counseling Access"],
                badge: "Wellness",
                gradientIndex: 4
              },
              {
                category: "ai",
                icon: Rocket,
                title: "Gamified Learning",
                description: "Earn badges, climb leaderboards, and unlock achievements while learning.",
                features: ["Achievement Badges", "Leaderboards", "Learning Streaks", "Reward System"],
                badge: "Fun",
                gradientIndex: 5
              },
            ].map((feature, idx) => (
              <div
                key={idx}
                onMouseEnter={() => setHoveredFeature(idx)}
                onMouseLeave={() => setHoveredFeature(null)}
                className={`group p-8 rounded-[32px] backdrop-blur-sm transition-all duration-500 hover:scale-[1.02] hover:shadow-2xl cursor-pointer relative overflow-hidden ${activeTab === "all" || activeTab === feature.category ? "block" : "hidden"
                  }`}
              >
                {/* Glowing Border and Background - Applied as default */}
                <div className={`absolute inset-0 bg-gradient-to-br ${cardGradients[feature.gradientIndex]} opacity-20 rounded-[32px]`} />
                <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-[32px]" />
                <div className="absolute inset-0 border-2 border-transparent rounded-[32px] bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px] opacity-30">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-[32px] blur-md opacity-30" />
                </div>

                {/* Content */}
                <div className="relative z-10">
                  {/* Badge */}
                  <div className="flex justify-between items-start mb-6">
                    <div className={`w-16 h-16 rounded-2xl bg-gradient-to-br ${cardGradients[feature.gradientIndex]} flex items-center justify-center transition-transform duration-500 group-hover:scale-110 group-hover:rotate-3 shadow-lg`}>
                      <feature.icon className="w-8 h-8 text-white" />
                    </div>
                    <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/80 backdrop-blur-sm">
                      {feature.badge}
                    </span>
                  </div>

                  <h3 className="text-xl font-bold text-white mb-4">{feature.title}</h3>
                  <p className="text-white/70 leading-relaxed mb-6">{feature.description}</p>

                  {/* Feature List */}
                  <ul className="space-y-3 mb-6">
                    {feature.features.map((item, i) => (
                      <li key={i} className="flex items-center gap-3 text-sm text-white/80 group-hover:text-white transition-colors">
                        <div className="w-2 h-2 rounded-full bg-[#3D7FA2]" />
                        {item}
                      </li>
                    ))}
                  </ul>

                  {/* Interactive Button */}
                  <div className="flex items-center justify-between pt-6 border-t border-white/20">
                    <div className="text-sm text-[#3D7FA2] flex items-center gap-2 group-hover:gap-3 transition-all">
                      <span>Explore Feature</span>
                      <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
                    </div>
                    <div className="flex items-center gap-2 text-white/40 text-sm">
                      <Eye className="w-4 h-4" />
                      <span>1.2K</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 📚 Interactive Course Catalog */}
      <section id="courses" className="relative px-6 md:px-12 py-24 bg-gradient-to-b from-[#223347] to-[#1B5A6C]">
        <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-transparent to-[#223347]" />

        <div className="relative container mx-auto">
          <div className="text-center space-y-6 max-w-4xl mx-auto mb-16">
            <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-[#3D7FA2]/20 to-[#206687]/20 border border-[#3D7FA2]/30">
              <GraduationCap className="w-4 h-4 text-[#3D7FA2]" />
              <span className="text-sm font-medium text-white">Comprehensive Curriculum</span>
            </div>
            <h2 className="text-4xl md:text-5xl font-bold text-white">
              Explore <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D7FA2] to-[#206687]">Grade 1-12</span> Courses
            </h2>
            <p className="text-xl text-white/80 max-w-3xl mx-auto">
              Complete coverage of Ethiopian curriculum for all grades. From basic literacy to advanced subjects.
            </p>
          </div>

          {/* Course Categories */}
          <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-6 gap-4 mb-12">
            {[

              { icon: "9️⃣", label: "Grade 9-10", count: 40, color: "#1B5A6C" },
              { icon: "🔟", label: "Grade 11-12", count: 32, color: "#294B61" },
              { icon: "🧮", label: "Mathematics", count: 72, color: "#2E4360" },
              { icon: "🔬", label: "Science", count: 56, color: "#3D7FA2" },
            ].map((category, idx) => (
              <Link key={idx} href={`/courses/${category.label.toLowerCase().replace(/[^a-z]/g, '-')}`}>
                <div className="p-6 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group text-center relative overflow-hidden">
                  {/* Glowing effect */}
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 blur-lg transition-opacity duration-300" />

                  <div className="relative z-10 text-3xl mb-3 group-hover:scale-110 transition-transform">{category.icon}</div>
                  <div className="relative z-10 text-white font-medium">{category.label}</div>
                  <div className="relative z-10 text-sm text-white/60 mt-1">{category.count} courses</div>
                </div>
              </Link>
            ))}
          </div>

          {/* Enhanced Featured Courses with Glowing Borders */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                title: "Grade 5 Mathematics",
                instructor: "Mr. Daniel Abebe",
                rating: 4.8,
                students: 1890,
                duration: "36 weeks",
                level: "Beginner",
                color: "#3D7FA2",
                gradient: "from-[#3D7FA2] via-[#206687] to-[#1B5A6C]",
                icon: Calculator,
                grade: "5"
              },
              {
                title: "Grade 9 Physics",
                instructor: "Dr. Lemlem Hailu",
                rating: 4.9,
                students: 1567,
                duration: "40 weeks",
                level: "Intermediate",
                color: "#206687",
                gradient: "from-[#206687] via-[#1B5A6C] to-[#294B61]",
                icon: Atom,
                grade: "9"
              },
              {
                title: "Grade 11 English",
                instructor: "Ms. Sara Johnson",
                rating: 4.7,
                students: 2345,
                duration: "38 weeks",
                level: "Advanced",
                color: "#1B5A6C",
                gradient: "from-[#1B5A6C] via-[#294B61] to-[#2E4360]",
                icon: Book,
                grade: "11"
              },
            ].map((course, idx) => {
              const Icon = course.icon
              return (
                <Link key={idx} href={`/courses/${course.title.toLowerCase().replace(/ /g, '-')}`}>
                  <div className="group rounded-3xl backdrop-blur-sm overflow-hidden hover:shadow-2xl transition-all duration-500 relative cursor-pointer">
                    {/* Glowing Border and Background - Applied as default */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${course.gradient} opacity-20 rounded-3xl`} />
                    <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-white/0 rounded-3xl" />
                    <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px] opacity-40">
                      <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-3xl blur-lg opacity-40" />
                    </div>

                    {/* Course Header */}
                    <div className="relative p-6">
                      <div className="relative z-10 flex items-start justify-between mb-4">
                        <div className="w-14 h-14 rounded-2xl bg-white/10 backdrop-blur-sm flex items-center justify-center shadow-lg">
                          <Icon className="w-7 h-7 text-white" />
                        </div>
                        <div className="flex flex-col items-end gap-2">
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/20 text-white backdrop-blur-sm">
                            Grade {course.grade}
                          </span>
                          <span className="px-3 py-1 rounded-full text-xs font-medium bg-white/10 text-white/90 backdrop-blur-sm">
                            {course.level}
                          </span>
                        </div>
                      </div>
                      <h3 className="relative z-10 text-xl font-bold text-white mb-2">{course.title}</h3>
                      <p className="relative z-10 text-white/60 text-sm">By {course.instructor}</p>
                    </div>

                    {/* Course Details */}
                    <div className="relative p-6">
                      {/* Stats */}
                      <div className="grid grid-cols-3 gap-4 mb-6">
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{course.rating}</div>
                          <div className="text-xs text-white/60">Rating</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{course.students.toLocaleString()}</div>
                          <div className="text-xs text-white/60">Students</div>
                        </div>
                        <div className="text-center">
                          <div className="text-lg font-bold text-white">{course.duration}</div>
                          <div className="text-xs text-white/60">Duration</div>
                        </div>
                      </div>

                      {/* Progress Bar */}
                      <div className="space-y-2 mb-6">
                        <div className="flex justify-between text-sm text-white/60">
                          <span>Course Progress</span>
                          <span>65%</span>
                        </div>
                        <div className="h-2 bg-white/10 rounded-full overflow-hidden">
                          <div
                            className="h-full rounded-full transition-all duration-500 group-hover:scale-y-125"
                            style={{
                              width: "65%",
                              background: `linear-gradient(90deg, ${course.color}, ${course.color}80)`
                            }}
                          />
                        </div>
                      </div>

                      {/* CTA Button */}
                      <Button className="w-full rounded-xl bg-gradient-to-r from-white/10 to-white/5 hover:from-white/20 hover:to-white/10 text-white border border-white/20 group-hover:scale-105 transition-transform relative overflow-hidden">
                        <span className="relative z-10 flex items-center justify-center">
                          <PlayCircle className="w-5 h-5 mr-2" />
                          View Course
                        </span>
                        <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-20 transition-opacity" />
                      </Button>
                    </div>
                  </div>
                </Link>
              )
            })}
          </div>

          {/* View All Courses */}
          <div className="text-center mt-12">
            <Link href="/courses">
              <Button
                variant="outline"
                className="rounded-full border-white/30 text-white hover:bg-white/10 px-8 py-6 text-lg group relative overflow-hidden"
              >
                <span className="relative z-10 flex items-center">
                  Browse All Courses (Grade -12)
                  <ArrowRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity" />
              </Button>
            </Link>
          </div>
        </div>
      </section>

      {/* 🤖 AI Demo Section */}
      <section id="live-demo" className="relative px-6 md:px-12 py-24">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent via-[#294B61]/10 to-transparent" />

        <div className="relative container mx-auto">
          <div className="grid lg:grid-cols-2 gap-16 items-center">
            <div className="space-y-8">
              <div className="inline-flex items-center gap-3 px-5 py-2 rounded-full bg-gradient-to-r from-[#3D7FA2]/20 to-[#206687]/20 border border-[#3D7FA2]/30">
                <Zap className="w-4 h-4 text-[#3D7FA2]" />
                <span className="text-sm font-medium text-white">AI-Powered Learning</span>
              </div>

              <h2 className="text-4xl md:text-5xl font-bold text-white">
                Experience <span className="text-transparent bg-clip-text bg-gradient-to-r from-[#3D7FA2] to-[#206687]">Smart Learning</span>
              </h2>

              <p className="text-xl text-white/80">
                Our AI tutor understands context, explains concepts in multiple ways, and provides personalized feedback for every grade level.
              </p>

              {/* Demo Features */}
              <div className="space-y-6">
                {[
                  { icon: "💬", title: "Natural Conversations", desc: "Chat with AI like a human tutor" },
                  { icon: "📊", title: "Step-by-Step Solutions", desc: "Detailed explanations for complex problems" },
                  { icon: "🎯", title: "Personalized Feedback", desc: "Tailored suggestions based on your learning style" },
                ].map((feature, idx) => (
                  <div key={idx} className="flex items-center gap-4 p-4 rounded-2xl bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-300 cursor-pointer group relative overflow-hidden">
                    {/* Glowing effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 blur-lg transition-opacity" />

                    <div className="relative z-10 text-2xl group-hover:scale-110 transition-transform">{feature.icon}</div>
                    <div className="relative z-10 flex-1">
                      <div className="text-white font-semibold">{feature.title}</div>
                      <div className="text-sm text-white/60">{feature.desc}</div>
                    </div>
                    <ChevronRight className="relative z-10 w-5 h-5 text-white/40 group-hover:text-white/60" />
                  </div>
                ))}
              </div>

              <Button className="rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white px-8 py-6 text-lg group relative overflow-hidden">
                <span className="relative z-10 flex items-center">
                  <PlayCircle className="w-6 h-6 mr-3" />
                  Watch Full Demo
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-[#206687] to-[#103255] opacity-0 group-hover:opacity-100 transition-opacity" />
              </Button>
            </div>

            {/* AI Chat Demo */}
            <div className="relative">
              <div className="relative rounded-[32px] bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-lg p-2 shadow-2xl overflow-hidden group">
                {/* Glowing Border */}
                <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2]/20 via-[#206687]/10 to-[#1B5A6C]/20 rounded-[32px] blur-xl group-hover:blur-2xl transition-all" />
                <div className="absolute inset-0 border-2 border-transparent rounded-[32px] bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px] opacity-40">
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-[32px] blur-md opacity-40" />
                </div>

                <div className="relative bg-gradient-to-br from-[#1B5A6C]/30 via-[#223347]/20 to-[#2E4360]/10 rounded-[28px] p-6">
                  {/* Chat Header */}
                  <div className="flex items-center gap-3 mb-6">
                    <div className="relative">
                      <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center">
                        <Brain className="w-6 h-6 text-white" />
                      </div>
                      <div className="absolute -bottom-1 -right-1 w-4 h-4 rounded-full bg-green-500 border-2 border-[#1B5A6C]" />
                    </div>
                    <div>
                      <div className="text-white font-semibold">AI Tutor</div>
                      <div className="text-xs text-white/60">Online • Ready to help</div>
                    </div>
                  </div>

                  {/* Chat Messages */}
                  <div className="space-y-4 mb-6">
                    {/* User Message */}
                    <div className="flex justify-end">
                      <div className="max-w-[80%] p-4 rounded-2xl rounded-br-none bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white">
                        Can you explain fractions for Grade 4?
                      </div>
                    </div>

                    {/* AI Response */}
                    <div className="flex gap-3">
                      <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center flex-shrink-0">
                        <Brain className="w-4 h-4 text-white" />
                      </div>
                      <div className="flex-1">
                        <div className="p-4 rounded-2xl rounded-tl-none bg-white/5 text-white">
                          Think of fractions like <span className="text-[#3D7FA2] font-semibold">pizza slices</span>! If you have a pizza cut into 8 equal slices, and you eat 3 slices, you've eaten <span className="text-[#3D7FA2] font-semibold">3/8</span> of the pizza!

                          <div className="mt-4 p-3 rounded-xl bg-white/10">
                            <div className="text-sm text-white/60 mb-2">Visual Example:</div>
                            <div className="font-mono text-sm">
                              🍕 = 8 slices<br />
                              🍕🍕🍕 = 3 slices eaten<br />
                              Fraction = 3/8
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Input Area */}
                  <div className="flex gap-3">
                    <input
                      type="text"
                      placeholder="Ask AI Tutor anything..."
                      className="flex-1 px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2]"
                    />
                    <Button className="rounded-xl bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white">
                      Send
                    </Button>
                  </div>
                </div>
              </div>

              {/* Floating Stats */}
              <div className="absolute -top-4 -right-4">
                <div className="px-4 py-2 rounded-full bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white text-sm font-medium shadow-lg">
                  🤖 AI Powered
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Enhanced Footer */}
      <footer className="relative bg-gradient-to-b from-[#0A1929] via-[#1B5A6C] to-[#223347] mt-32">
        {/* Wave Divider */}
        <div className="absolute -top-32 left-0 right-0 h-32 overflow-hidden">
          <svg
            className="absolute w-full h-full"
            viewBox="0 0 1200 120"
            preserveAspectRatio="none"
          >
            <path
              d="M0,0V46.29c47.79,22.2,103.59,32.17,158,28,70.36-5.37,136.33-33.31,206.8-37.5C438.64,32.43,512.34,53.67,583,72.05c69.27,18,138.3,24.88,209.4,13.08,36.15-6,69.85-17.84,104.45-29.34C989.49,25,1113-14.29,1200,52.47V0Z"
              fill="url(#footer-gradient)"
              opacity="0.8"
            />
            <defs>
              <linearGradient
                id="footer-gradient"
                x1="600"
                y1="0"
                x2="600"
                y2="120"
                gradientUnits="userSpaceOnUse"
              >
                <stop stopColor="#2E4360" />
                <stop offset="1" stopColor="#0A1929" />
              </linearGradient>
            </defs>
          </svg>
        </div>

        {/* Main Footer Content */}
        <div className="relative container mx-auto px-6 md:px-12 pt-32 pb-12">
          <div className="grid lg:grid-cols-2 gap-12 mb-16">
            {/* Left Column - Brand & Description */}
            <div className="space-y-8">
              <div className="flex items-center gap-4">
                <div className="relative">
                  <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center shadow-xl">
                    <GraduationCap className="w-8 h-8 text-white" />
                  </div>
                  <div className="absolute -inset-2 bg-gradient-to-r from-[#3D7FA2] to-[#206687] rounded-2xl blur opacity-30" />
                </div>
                <div>
                  <h2 className="text-3xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    SmartTutor<span className="text-[#3D7FA2]">ET</span>
                  </h2>
                  <p className="text-white/60 text-sm">Ethiopia's Premier Grade 1-12 Platform</p>
                </div>
              </div>

              <p className="text-white/70 max-w-md leading-relaxed">
                Empowering Ethiopian students from Grade 1 to 12 with AI-powered personalized learning,
                comprehensive curriculum coverage, and exam preparation for academic excellence.
              </p>

              {/* Newsletter Subscription */}
              <div className="space-y-4">
                <h3 className="text-white font-semibold">Get Study Tips</h3>
                <div className="flex flex-col sm:flex-row gap-3">
                  <input
                    type="email"
                    placeholder="Your email address"
                    className="flex-1 px-6 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 backdrop-blur-sm focus:outline-none focus:ring-2 focus:ring-[#3D7FA2]"
                  />
                  <Button className="rounded-xl bg-gradient-to-r from-[#3D7FA2] to-[#206687] hover:from-[#206687] hover:to-[#103255] text-white px-8">
                    Subscribe
                  </Button>
                </div>
                <p className="text-white/50 text-xs">
                  Weekly study tips and exam strategies
                </p>
              </div>
            </div>

            {/* Right Column - Links Grid */}
            <div className="grid grid-cols-2 md:grid-cols-3 gap-8">
              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg">Grades</h3>
                <ul className="space-y-3">
                  {["Grade 1-4", "Grade 5-8", "Grade 9-10", "Grade 11-12", "All Grades"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                      >
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg">Subjects</h3>
                <ul className="space-y-3">
                  {["Mathematics", "Science", "English", "Amharic", "Social Studies", "ICT"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                      >
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>

              <div className="space-y-6">
                <h3 className="text-white font-semibold text-lg">Support</h3>
                <ul className="space-y-3">
                  {["Help Center", "Contact Us", "FAQ", "For Schools", "Parents"].map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="flex items-center gap-2 text-white/60 hover:text-white transition-colors group"
                      >
                        <ChevronRight className="w-4 h-4 opacity-0 group-hover:opacity-100 transition-opacity" />
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>

          {/* Bottom Bar */}
          <div className="border-t border-white/10 pt-12">
            <div className="flex flex-col md:flex-row justify-between items-center gap-6">
              {/* Contact Info */}
              <div className="flex flex-wrap gap-6 text-sm text-white/60">
                <div className="flex items-center gap-2">
                  <Phone className="w-4 h-4" />
                  <span>+251 11 123 4567</span>
                </div>
                <div className="flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  <span>support@smarttutoret.et</span>
                </div>
                <div className="flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  <span>Addis Ababa, Ethiopia</span>
                </div>
              </div>

              {/* Social Links */}
              <div className="flex items-center gap-4">
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                  aria-label="Facebook"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Facebook className="w-5 h-5 text-white/60 group-hover:text-white relative z-10" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                  aria-label="Twitter"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Twitter className="w-5 h-5 text-white/60 group-hover:text-white relative z-10" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                  aria-label="Instagram"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Instagram className="w-5 h-5 text-white/60 group-hover:text-white relative z-10" />
                </a>
                <a
                  href="#"
                  className="w-10 h-10 rounded-xl bg-white/10 hover:bg-white/20 border border-white/20 flex items-center justify-center transition-all duration-300 group relative overflow-hidden"
                  aria-label="YouTube"
                >
                  <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity" />
                  <Youtube className="w-5 h-5 text-white/60 group-hover:text-white relative z-10" />
                </a>
              </div>
            </div>

            {/* Copyright & Links */}
            <div className="mt-8 flex flex-col md:flex-row justify-between items-center gap-4 text-sm text-white/40">
              <div className="flex items-center gap-2">
                <span>© 2026 SmartTutorET. All rights reserved.</span>
                <span className="hidden md:inline">•</span>
                <span className="hidden md:inline">Made with <Heart className="w-4 h-4 inline text-red-400" /> for Ethiopian students</span>
              </div>

              <div className="flex items-center gap-6">
                <a href="#" className="hover:text-white transition-colors">
                  Privacy Policy
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Terms of Service
                </a>
                <a href="#" className="hover:text-white transition-colors">
                  Cookie Policy
                </a>
              </div>
            </div>

            {/* Mobile Copyright */}
            <div className="mt-4 md:hidden text-center text-sm text-white/40">
              <p>Made with <Heart className="w-4 h-4 inline text-red-400" /> for Ethiopian students</p>
            </div>
          </div>
        </div>

        {/* Floating CTA */}
        <div className="fixed bottom-6 right-6 z-40">
          <Link href="/signup">
            <button className="group relative">
              <div className="absolute -inset-1 bg-gradient-to-r from-[#3D7FA2] to-[#206687] rounded-2xl blur opacity-30 group-hover:opacity-50 transition-opacity" />
              <div className="relative flex items-center gap-3 px-6 py-4 rounded-2xl bg-gradient-to-r from-[#3D7FA2] to-[#206687] text-white shadow-2xl hover:shadow-3xl transition-all duration-300 group">
                <GraduationCap className="w-5 h-5" />
                <span className="font-medium">Start Free</span>
              </div>
            </button>
          </Link>
        </div>
      </footer>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-20px);
          }
        }

        @keyframes spin-slow {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        @keyframes gradient-x {
          0%, 100% {
            background-position: 0% 50%;
          }
          50% {
            background-position: 100% 50%;
          }
        }

        .animate-float {
          animation: float 6s ease-in-out infinite;
        }

        .animate-spin-slow {
          animation: spin-slow 3s linear infinite;
        }

        .animate-gradient {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }

        .animate-gradient-x {
          background-size: 200% 200%;
          animation: gradient-x 3s ease infinite;
        }
      `}</style>
    </div>
  )
}
