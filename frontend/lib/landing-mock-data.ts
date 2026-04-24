/**
 * ╔══════════════════════════════════════════════════════════════════════════╗
 * ║           LANDING PAGE — CENTRALIZED MOCK DATA                        ║
 * ║                                                                        ║
 * ║   Single source of truth for all data displayed on the landing page.   ║
 * ║   Backend team: replace each export with a real API call.              ║
 * ║   Every section is marked with TODO comments for easy discovery.       ║
 * ╚══════════════════════════════════════════════════════════════════════════╝
 */

import {
    Brain, Target, Users, BarChart3, Video, Rocket,
    Calculator, Atom, FlaskConical, Book, Languages, History,
    Award, Facebook, Twitter, Instagram, Linkedin, Youtube,
} from "lucide-react"

// ─────────────────────────────────────────────────────────────────────────────
// ─── NAVIGATION ──────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/navigation
 * Navigation items shown in the top navbar and mobile menu.
 */
export const NAV_ITEMS = ["Home", "Features", "Courses", "Testimonials", "About"]

// ─────────────────────────────────────────────────────────────────────────────
// ─── HERO SECTION ────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API / CMS
 * Endpoint: GET /api/landing/hero
 * Hero section content: badge, headline, subtitle, and call-to-action labels.
 */
export const HERO_CONTENT = {
    badge: "Ethiopia's #1 AI Platform for High Schools",
    headline: {
        line1: "Master Your",
        line2: "Future",
        line3: "With SmartAI.",
    },
    subtitle:
        "Empowering Ethiopian students with personalized AI learning, live classes, and exam excellence.",
    primaryCTA: "Join For Free",
    secondaryCTA: "Watch Demo",
}

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/stats
 * Hero stat micro-cards shown on the right side of the hero section.
 * Each item maps to a Lucide icon component.
 */
export const HERO_STATS = [
    {
        iconKey: "Brain" as const,
        icon: Brain,
        title: "Adaptive AI Tutor",
        desc: "Personalized learning pace.",
    },
    {
        iconKey: "Users" as const,
        icon: Users,
        title: "24/7 Support",
        desc: "Top Ethiopian teachers.",
    },
    {
        iconKey: "Award" as const,
        icon: Award,
        title: "98% Exam Success",
        desc: "Grades 10 & 12 national exam focus.",
        fullWidth: true,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── PLATFORM FEATURES ──────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/features
 * Platform feature cards displayed in the "Smart Tools For Fast Learning" section.
 * Icons are Lucide React components — backend should return an iconKey string,
 * and the frontend will map it to the component.
 */
export const ALL_FEATURES = [
    {
        iconKey: "Brain" as const,
        icon: Brain,
        title: "Adaptive AI Tutor",
        desc: "Personalized paths that evolve in real-time with your pace and strengths.",
        benefits: ["24/7 AI Tutor", "Personalized Plans", "Instant Resolution"],
        accent: "#3B82F6",
    },
    {
        iconKey: "Target" as const,
        icon: Target,
        title: "National Exam Prep",
        desc: "Full prep for Ethiopian national exams — timed mocks, past papers, analytics.",
        benefits: ["Papers 2010–2025", "Mock Exams", "Score Analytics"],
        accent: "#8B5CF6",
    },
    {
        iconKey: "Users" as const,
        icon: Users,
        title: "Collaborative Learning",
        desc: "AI-matched study groups and peer discussions for deeper retention.",
        benefits: ["Smart Groups", "Peer Reviews", "Group Projects"],
        accent: "#EC4899",
    },
    {
        iconKey: "BarChart3" as const,
        icon: BarChart3,
        title: "Performance Analytics",
        desc: "Live dashboards: track progress, map weaknesses, visualize exam readiness.",
        benefits: ["Live Progress", "Weakness Map", "Goal Tracking"],
        accent: "#10B981",
    },
    {
        iconKey: "Video" as const,
        icon: Video,
        title: "Live Expert Classes",
        desc: "Real-time sessions with top Ethiopian educators. Rewatch anytime.",
        benefits: ["Live Q&A", "Replays", "Expert Coaches"],
        accent: "#F59E0B",
    },
    {
        iconKey: "Rocket" as const,
        icon: Rocket,
        title: "Gamified Learning",
        desc: "Earn XP, unlock badges, climb leaderboards. Build daily streaks that stick.",
        benefits: ["XP & Badges", "Leaderboards", "Streak Rewards"],
        accent: "#06B6D4",
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── SUBJECTS / COURSE SLIDER ───────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/subjects
 * Subject cards for the continuous marquee slider.
 * `students` = number of enrolled students (live count from backend).
 * `rating`  = average course rating.
 */
export const SUBJECTS = [
    {
        name: "Mathematics",
        iconKey: "Calculator" as const,
        icon: Calculator,
        color: "#3B82F6",
        students: 2345,
        emoji: "🧮",
        grade: "Grades 9-12",
        rating: 4.9,
    },
    {
        name: "Physics",
        iconKey: "Atom" as const,
        icon: Atom,
        color: "#8B5CF6",
        students: 1890,
        emoji: "⚛️",
        grade: "Grades 11-12",
        rating: 4.8,
    },
    {
        name: "Chemistry",
        iconKey: "FlaskConical" as const,
        icon: FlaskConical,
        color: "#EC4899",
        students: 1678,
        emoji: "🔬",
        grade: "Grades 10-12",
        rating: 4.9,
    },
    {
        name: "Biology",
        iconKey: "Book" as const,
        icon: Book,
        color: "#10B981",
        students: 1456,
        emoji: "🧬",
        grade: "Grades 9-12",
        rating: 4.7,
    },
    {
        name: "English",
        iconKey: "Languages" as const,
        icon: Languages,
        color: "#F59E0B",
        students: 2123,
        emoji: "📖",
        grade: "Grades 9-12",
        rating: 4.8,
    },
    {
        name: "History",
        iconKey: "History" as const,
        icon: History,
        color: "#6366F1",
        students: 1234,
        emoji: "🏛️",
        grade: "Grades 9-11",
        rating: 4.7,
    },
]

// ─────────────────────────────────────────────────────────────────────────────
// ─── TESTIMONIALS ───────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/testimonials
 * Student testimonials displayed in the carousel.
 * `avatar` = initials placeholder (replace with real profile image URLs from backend).
 */
export const BASE_TESTIMONIALS = [
    {
        name: "Abebe Kebede",
        grade: "Grade 12",
        text: "Went from 65% to 92% in Mathematics in 3 months. The AI tutor is genuinely brilliant!",
        avatar: "AK",
        subject: "Mathematics",
    },
    {
        name: "Selam Tesfaye",
        grade: "Grade 11",
        text: "Physics simulations made every concept click instantly. Absolute best platform for Ethiopian students.",
        avatar: "ST",
        subject: "Physics",
    },
    {
        name: "Henok Mulugeta",
        grade: "Grade 10",
        text: "AI study groups connected me with top performers. Collaborative learning changed my results completely.",
        avatar: "HM",
        subject: "Chemistry",
    },
    {
        name: "Biniyam Solomon",
        grade: "Grade 12",
        text: "National exam mocks are elite level. My confidence before exams is now sky-high.",
        avatar: "BS",
        subject: "English",
    },
    {
        name: "Lydia Mekonnen",
        grade: "Grade 9",
        text: "Transitioning to high school was so smooth with the foundation lessons. Highly recommended!",
        avatar: "LM",
        subject: "Biology",
    },
    {
        name: "Dawit Alemu",
        grade: "Grade 11",
        text: "Having a personal AI tutor 24/7 transformed my study habits — and my grades.",
        avatar: "DA",
        subject: "History",
    },
]

/**
 * TODO: REPLACE WITH BACKEND API
 * Endpoint: GET /api/landing/testimonials/stats
 * Testimonials section header stats.
 */
export const TESTIMONIAL_STATS = {
    totalStudents: "15,000+",
    tagline: "Real Impact. Real Success.",
}

// ─────────────────────────────────────────────────────────────────────────────
// ─── FOOTER ─────────────────────────────────────────────────────────────────
// ─────────────────────────────────────────────────────────────────────────────

/**
 * TODO: REPLACE WITH BACKEND API / CMS
 * Endpoint: GET /api/landing/footer
 * Footer content: links, social icons, brand tagline, copyright, and newsletter text.
 */
export const FOOTER_DATA = {
    brandTagline:
        "Ethiopia's premier AI platform for high school excellence — Grades 9 to 12.",
    socialLinks: [
        { iconKey: "Facebook" as const, icon: Facebook, href: "#" },
        { iconKey: "Twitter" as const, icon: Twitter, href: "#" },
        { iconKey: "Instagram" as const, icon: Instagram, href: "#" },
        { iconKey: "Linkedin" as const, icon: Linkedin, href: "#" },
        { iconKey: "Youtube" as const, icon: Youtube, href: "#" },
    ],
    platformLinks: ["AI Tutor", "Live Classes", "National Exams", "Resources"],
    companyLinks: ["About Success", "Our Story", "Contact Us", "Careers"],
    newsletter: {
        heading: "Newsletter",
        description:
            "Stay updated with the latest exam tips and platform updates.",
        placeholder: "Email",
    },
    copyright: "© 2026 SmartTutorET.",
    copyrightSuffix: "in Addis Ababa.",
    legalLinks: ["Privacy Policy", "Terms of Service"],
}
