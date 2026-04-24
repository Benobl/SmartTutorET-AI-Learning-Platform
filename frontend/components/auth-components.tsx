"use client"

import React from "react"
import Image from "next/image"
import { cn } from "@/lib/utils"
import { Check, X } from "lucide-react"

interface AuthBackgroundProps {
    imageSrc: string
    children: React.ReactNode
}

export function AuthBackground({ imageSrc, children }: AuthBackgroundProps) {
    return (
        <div className="relative h-screen w-full flex items-center justify-center p-4 md:p-8 overflow-hidden">
            {/* Background Image with optimized loading */}
            <div className="absolute inset-0 z-0">
                <Image
                    src={imageSrc}
                    alt="Authentication background"
                    fill
                    priority
                    className="object-cover"
                    quality={90}
                />
                {/* Modern Overlay Gradient for Readability */}
                <div className="absolute inset-0 bg-gradient-to-br from-slate-900/80 via-slate-900/60 to-slate-800/80 backdrop-blur-[2px]" />
            </div>

            {/* Content Area */}
            <div className="relative z-10 w-full flex justify-center items-center animate-in fade-in zoom-in duration-500">
                {children}
            </div>
        </div>
    )
}

interface AuthCardProps {
    children: React.ReactNode
    className?: string
}

export function AuthCard({ children, className }: AuthCardProps) {
    return (
        <div className={cn(
            "glass border-white/20 shadow-2xl rounded-3xl overflow-hidden transition-smooth hover:border-white/30",
            "bg-white/10 backdrop-blur-xl",
            className
        )}>
            <div className="p-8 md:p-10">
                {children}
            </div>
        </div>
    )
}

interface PasswordStrengthProps {
    password: string
}

export function PasswordStrength({ password }: PasswordStrengthProps) {
    const getStrength = (pass: string) => {
        let score = 0
        if (!pass) return 0
        if (pass.length >= 8) score++
        if (/[A-Z]/.test(pass)) score++
        if (/[0-9]/.test(pass)) score++
        if (/[^A-Za-z0-9]/.test(pass)) score++
        return score
    }

    const score = getStrength(password)
    const strengthLabels = ["Very Weak", "Weak", "Fair", "Strong", "Very Strong"]
    const strengthColors = [
        "bg-red-500",
        "bg-red-400",
        "bg-yellow-500",
        "bg-emerald-500",
        "bg-emerald-600"
    ]

    return (
        <div className="mt-2 space-y-2">
            <div className="flex justify-between items-center text-xs">
                <span className="text-white/60">Password Strength</span>
                <span className={cn(
                    "font-medium transition-colors",
                    score <= 1 ? "text-red-400" : score <= 2 ? "text-yellow-400" : "text-emerald-400"
                )}>
                    {strengthLabels[score]}
                </span>
            </div>
            <div className="h-1.5 w-full bg-white/10 rounded-full overflow-hidden flex gap-1">
                {[...Array(4)].map((_, i) => (
                    <div
                        key={i}
                        className={cn(
                            "h-full flex-1 transition-all duration-500 rounded-full",
                            i < score ? strengthColors[score] : "bg-white/5"
                        )}
                    />
                ))}
            </div>
            <div className="grid grid-cols-2 gap-x-4 gap-y-1 mt-2">
                <StrengthRule met={password.length >= 8} label="8+ characters" />
                <StrengthRule met={/[A-Z]/.test(password)} label="Upper case" />
                <StrengthRule met={/[0-9]/.test(password)} label="One number" />
                <StrengthRule met={/[^A-Za-z0-9]/.test(password)} label="Special char" />
            </div>
        </div>
    )
}

function StrengthRule({ met, label }: { met: boolean; label: string }) {
    return (
        <div className="flex items-center gap-1.5">
            {met ? (
                <Check className="w-3 h-3 text-emerald-400" />
            ) : (
                <X className="w-3 h-3 text-white/20" />
            )}
            <span className={cn(
                "text-[10px] transition-colors",
                met ? "text-emerald-400/80" : "text-white/40"
            )}>
                {label}
            </span>
        </div>
    )
}
