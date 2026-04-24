import {
    Brain, Target, Users, BarChart3, Video, Rocket,
    Calculator, Atom, FlaskConical, Book, Languages, History, Star
} from "lucide-react"

/* ─── Data ─── */
export const ALL_FEATURES = [
    {
        icon: Brain,
        title: "Adaptive AI Tutor",
        desc: "Personalized paths that evolve in real-time with your pace and strengths.",
        benefits: ["24/7 AI Tutor", "Personalized Plans", "Instant Resolution"],
        accent: "#3B82F6"
    },
    {
        icon: Target,
        title: "National Exam Prep",
        desc: "Full prep for Ethiopian national exams — timed mocks, past papers, analytics.",
        benefits: ["Papers 2010–2025", "Mock Exams", "Score Analytics"],
        accent: "#8B5CF6"
    },
    {
        icon: Users,
        title: "Collaborative Learning",
        desc: "AI-matched study groups and peer discussions for deeper retention.",
        benefits: ["Smart Groups", "Peer Reviews", "Group Projects"],
        accent: "#EC4899"
    },
    {
        icon: BarChart3,
        title: "Performance Analytics",
        desc: "Live dashboards: track progress, map weaknesses, visualize exam readiness.",
        benefits: ["Live Progress", "Weakness Map", "Goal Tracking"],
        accent: "#10B981"
    },
    {
        icon: Video,
        title: "Live Expert Classes",
        desc: "Real-time sessions with top Ethiopian educators. Rewatch anytime.",
        benefits: ["Live Q&A", "Replays", "Expert Coaches"],
        accent: "#F59E0B"
    },
    {
        icon: Rocket,
        title: "Gamified Learning",
        desc: "Earn XP, unlock badges, climb leaderboards. Build daily streaks that stick.",
        benefits: ["XP & Badges", "Leaderboards", "Streak Rewards"],
        accent: "#06B6D4"
    },
]

export const BASE_TESTIMONIALS = [
    { name: "Abebe Kebede", grade: "Grade 12", text: "Went from 65% to 92% in Mathematics in 3 months. The AI tutor is genuinely brilliant!", avatar: "AK", subject: "Mathematics" },
    { name: "Selam Tesfaye", grade: "Grade 11", text: "Physics simulations made every concept click instantly. Absolute best platform for Ethiopian students.", avatar: "ST", subject: "Physics" },
    { name: "Henok Mulugeta", grade: "Grade 10", text: "AI study groups connected me with top performers. Collaborative learning changed my results completely.", avatar: "HM", subject: "Chemistry" },
    { name: "Biniyam Solomon", grade: "Grade 12", text: "National exam mocks are elite level. My confidence before exams is now sky-high.", avatar: "BS", subject: "English" },
    { name: "Lydia Mekonnen", grade: "Grade 9", text: "Transitioning to high school was so smooth with the foundation lessons. Highly recommended!", avatar: "LM", subject: "Biology" },
    { name: "Dawit Alemu", grade: "Grade 11", text: "Having a personal AI tutor 24/7 transformed my study habits — and my grades.", avatar: "DA", subject: "History" },
]

export const SUBJECTS = [
    { name: "Mathematics", icon: Calculator, color: "#3B82F6", students: 2345, emoji: "🧮", grade: "Grades 9-12", rating: 4.9 },
    { name: "Physics", icon: Atom, color: "#8B5CF6", students: 1890, emoji: "⚛️", grade: "Grades 11-12", rating: 4.8 },
    { name: "Chemistry", icon: FlaskConical, color: "#EC4899", students: 1678, emoji: "🔬", grade: "Grades 10-12", rating: 4.9 },
    { name: "Biology", icon: Book, color: "#10B981", students: 1456, emoji: "🧬", grade: "Grades 9-12", rating: 4.7 },
    { name: "English", icon: Languages, color: "#F59E0B", students: 2123, emoji: "📖", grade: "Grades 9-12", rating: 4.8 },
    { name: "History", icon: History, color: "#6366F1", students: 1234, emoji: "🏛️", grade: "Grades 9-11", rating: 4.7 },
]
