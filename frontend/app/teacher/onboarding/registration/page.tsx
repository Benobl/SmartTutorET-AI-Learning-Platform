"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
    User, Mail, BookOpen, GraduationCap, Briefcase,
    Upload, ArrowRight, CheckCircle2, Sparkles,
    FileText, ShieldCheck, ChevronRight
} from "lucide-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useToast } from "@/hooks/use-toast"

const GRADES = ["Grade 9", "Grade 10", "Grade 11", "Grade 12"]

export default function TeacherRegistration() {
    const router = useRouter()
    const { toast } = useToast()
    const [selectedGrades, setSelectedGrades] = useState<string[]>([])
    const [isSubmitting, setIsSubmitting] = useState(false)

    const toggleGrade = (grade: string) => {
        setSelectedGrades(prev =>
            prev.includes(grade) ? prev.filter(g => g !== grade) : [...prev, grade]
        )
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        // Mock submission delay
        setTimeout(() => {
            setIsSubmitting(false)
            toast({
                title: "Application Received",
                description: "Proceeding to qualification exam...",
            })
            router.push("/teacher/onboarding/qualification-exam")
        }, 1500)
    }

    return (
        <div className="min-h-screen bg-slate-50 flex items-center justify-center p-6 lg:p-12 relative overflow-hidden">
            {/* Background Accents */}
            <div className="absolute top-0 right-0 w-[800px] h-[800px] bg-indigo-50/50 rounded-full blur-3xl -mr-96 -mt-96 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[600px] h-[600px] bg-sky-50/50 rounded-full blur-3xl -ml-64 -mb-64" />

            <div className="w-full max-w-5xl grid grid-cols-1 lg:grid-cols-2 bg-white rounded-[48px] shadow-2xl shadow-indigo-500/5 border border-slate-100 overflow-hidden relative z-10">

                {/* Visual Left Side */}
                <div className="hidden lg:flex flex-col justify-between p-16 bg-slate-900 text-white relative">
                    <div className="absolute top-0 left-0 w-full h-full bg-[url('https://images.unsplash.com/photo-1524178232363-1fb2b075b655?q=80&w=2070&auto=format&fit=crop')] bg-cover bg-center mix-blend-overlay opacity-20" />

                    <div className="relative z-10">
                        <div className="flex items-center gap-3 mb-10">
                            <div className="w-12 h-12 bg-indigo-500 rounded-2xl flex items-center justify-center shadow-lg shadow-indigo-500/20">
                                <GraduationCap className="w-6 h-6" />
                            </div>
                            <span className="font-black text-xl tracking-tighter uppercase italic">SmartTutor<span className="text-indigo-400">ET</span></span>
                        </div>

                        <div className="space-y-6">
                            <h2 className="text-5xl font-black leading-[1.1] tracking-tighter uppercase">
                                Empower <span className="text-indigo-400">Ethiopian</span> Students
                            </h2>
                            <p className="text-slate-400 text-lg font-medium leading-relaxed max-w-sm">
                                Join our network of elite educators. Teach Grade 9-12 with AI-powered tools and reach thousands of students nationwide.
                            </p>
                        </div>
                    </div>

                    <div className="relative z-10 space-y-8">
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-indigo-500 transition-colors">
                                <ShieldCheck className="w-6 h-6 text-indigo-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-xs tracking-widest text-slate-300">Verified System</h4>
                                <p className="text-sm font-medium text-slate-500">Secure & professional hiring flow</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-5 group">
                            <div className="w-12 h-12 rounded-2xl bg-white/10 flex items-center justify-center group-hover:bg-sky-500 transition-colors">
                                <Sparkles className="w-6 h-6 text-sky-400 group-hover:text-white" />
                            </div>
                            <div>
                                <h4 className="font-black uppercase text-xs tracking-widest text-slate-300">AI-Enhanced</h4>
                                <p className="text-sm font-medium text-slate-500">Adaptive teaching & grading tools</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Form Right Side */}
                <div className="p-10 lg:p-16 overflow-y-auto max-h-[90vh]">
                    <div className="mb-12">
                        <h3 className="text-3xl font-black text-slate-900 uppercase tracking-tight mb-2">Teacher Registration</h3>
                        <p className="text-slate-500 font-bold text-xs uppercase tracking-widest flex items-center gap-2">
                            Step 1 of 3: Profile Setup <ChevronRight className="w-3 h-3 text-indigo-500" />
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-10">
                        {/* Section: Basic Info */}
                        <div className="space-y-6">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Full Name</Label>
                                    <div className="relative">
                                        <User className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            placeholder="Abebe Kebede"
                                            className="h-14 pl-14 rounded-2xl border-slate-100 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                                <div className="space-y-3">
                                    <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Email Address</Label>
                                    <div className="relative">
                                        <Mail className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                        <Input
                                            type="email"
                                            placeholder="abebe@smarttutor.et"
                                            className="h-14 pl-14 rounded-2xl border-slate-100 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
                                            required
                                        />
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Subject Specialization</Label>
                                <div className="relative">
                                    <BookOpen className="absolute left-5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
                                    <Input
                                        placeholder="e.g. Physics, Mathematics, Biology"
                                        className="h-14 pl-14 rounded-2xl border-slate-100 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm"
                                        required
                                    />
                                </div>
                            </div>
                        </div>

                        {/* Section: Grade Targeting */}
                        <div className="space-y-4">
                            <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Grades you can teach (Ethiopian Curriculum)</Label>
                            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                {GRADES.map(grade => (
                                    <button
                                        key={grade}
                                        type="button"
                                        onClick={() => toggleGrade(grade)}
                                        className={cn(
                                            "h-14 rounded-2xl border font-black text-[10px] uppercase tracking-widest transition-all",
                                            selectedGrades.includes(grade)
                                                ? "bg-indigo-600 border-indigo-600 text-white shadow-xl shadow-indigo-500/20"
                                                : "bg-white border-slate-100 text-slate-400 hover:border-indigo-200 hover:bg-indigo-50/30"
                                        )}
                                    >
                                        {grade}
                                    </button>
                                ))}
                            </div>
                        </div>

                        {/* Section: Experience & Docs */}
                        <div className="space-y-6">
                            <div className="space-y-3">
                                <Label className="text-[10px] font-black uppercase tracking-widest text-slate-400 ml-1">Teaching Experience (Brief)</Label>
                                <div className="relative">
                                    <Briefcase className="absolute left-5 top-6 w-4 h-4 text-slate-400" />
                                    <textarea
                                        placeholder="Tell us about your background..."
                                        className="w-full min-h-[120px] pl-14 pr-6 py-5 rounded-2xl border-slate-100 font-bold bg-slate-50 focus:bg-white focus:ring-4 focus:ring-indigo-500/5 transition-all text-sm outline-none"
                                        required
                                    />
                                </div>
                            </div>

                            <div className="p-8 rounded-3xl border border-dashed border-slate-200 bg-slate-50 flex flex-col items-center justify-center gap-4 group hover:bg-indigo-50 hover:border-indigo-200 transition-all cursor-pointer">
                                <div className="w-14 h-14 rounded-2xl bg-white flex items-center justify-center shadow-sm group-hover:scale-110 transition-transform">
                                    <Upload className="w-6 h-6 text-indigo-500" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[10px] font-black uppercase tracking-widest text-slate-900">Upload Verification Docs</p>
                                    <p className="text-xs text-slate-400 mt-1 font-medium">Degrees, Certifications, or ID (PDF/JPG)</p>
                                </div>
                            </div>
                        </div>

                        {/* Submit Button */}
                        <Button
                            disabled={isSubmitting}
                            className="w-full h-16 rounded-2xl bg-indigo-600 hover:bg-indigo-700 text-white font-black uppercase tracking-widest text-xs shadow-2xl shadow-indigo-500/20 group overflow-hidden relative"
                        >
                            {isSubmitting ? (
                                <div className="flex items-center gap-3">
                                    <div className="w-5 h-5 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                                    Processing...
                                </div>
                            ) : (
                                <div className="flex items-center justify-center gap-3">
                                    Submit Application
                                    <ArrowRight className="w-4 h-4 group-hover:translate-x-2 transition-transform" />
                                </div>
                            )}
                        </Button>

                        <p className="text-center text-[10px] font-black text-slate-400 uppercase tracking-widest py-4">
                            By joining, you agree to the SmartTutorET Educator Terms.
                        </p>
                    </form>
                </div>
            </div>
        </div>
    )
}
