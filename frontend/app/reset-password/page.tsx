"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff, ArrowLeft } from "lucide-react"
import { AuthBackground, AuthCard, PasswordStrength } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api"
import Image from "next/image"

const resetPasswordSchema = z.object({
    password: z.string()
        .min(8, "Email or password is incorrect")
        .regex(/^[^\s]+$/, "Email or password is incorrect"), // No spaces
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Email or password is incorrect",
    path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

import { Suspense } from "react"

export default function ResetPasswordPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <ResetPasswordContent />
        </Suspense>
    )
}

function ResetPasswordContent() {
    const router = useRouter()
    const searchParams = useSearchParams()
    const token = searchParams.get("token")

    const [showPassword, setShowPassword] = useState(false)
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        watch,
        formState: { errors },
    } = useForm<ResetPasswordFormValues>({
        resolver: zodResolver(resetPasswordSchema),
    })

    const password = watch("password", "")

    const onSubmit = async (data: ResetPasswordFormValues) => {
        if (!token) {
            setError("Invalid or expired token")
            return
        }

        setIsLoading(true)
        setError(null)

        try {
            await authApi.resetPassword(token, { password: data.password })
            setSuccess(true)

            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err: any) {
            setError(err.message || "Unable to reset password. Link may be expired.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthBackground imageSrc="/auth/premium-library-bg.png">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <AuthCard>
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="flex flex-col items-center mb-8 text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl mb-6 ring-4 ring-white/10">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-2 tracking-tight">Set New Password</h1>
                                <p className="text-base text-white/50 leading-relaxed">
                                    Ensure your account is secure with a strong new password.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {!token && (
                                <div className="mb-6 p-4 rounded-xl bg-amber-500/10 border border-amber-500/20 flex items-center gap-3 text-amber-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>No reset token found in URL. This link may be invalid.</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-2">
                                <div className="space-y-2">
                                    <Label className="text-white/80 ml-1 font-medium">New Password</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                                            <Lock className="w-full h-full" />
                                        </div>
                                        <Input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 pr-12 py-7 rounded-2xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/30 text-lg",
                                                errors.password && "border-red-500/50"
                                            )}
                                        />
                                        <button
                                            type="button"
                                            onClick={() => setShowPassword(!showPassword)}
                                            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                                        >
                                            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                                        </button>
                                    </div>
                                    <PasswordStrength password={password} />
                                    {errors.password && (
                                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
                                    )}
                                </div>

                                <div className="space-y-2">
                                    <Label className="text-white/80 ml-1 font-medium">Confirm New Password</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                                            <Lock className="w-full h-full" />
                                        </div>
                                        <Input
                                            {...register("confirmPassword")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 py-7 rounded-2xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/30 text-lg",
                                                errors.confirmPassword && "border-red-500/50"
                                            )}
                                        />
                                    </div>
                                    {errors.confirmPassword && (
                                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.confirmPassword.message}</p>
                                    )}
                                </div>

                                <Button
                                    type="submit"
                                    disabled={isLoading || !token}
                                    className="w-full py-7 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-sky-500/25 group border-0 mt-4"
                                >
                                    <span className="flex items-center gap-3 justify-center">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Resetting...
                                            </>
                                        ) : (
                                            <>
                                                Update Password
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>

                            {/* Back to Login */}
                            <div className="mt-8 text-center">
                                <Link
                                    href="/login"
                                    className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group px-4 py-2 rounded-xl hover:bg-white/5 font-medium"
                                >
                                    <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                                    Back to Login
                                </Link>
                            </div>
                        </>
                    ) : (
                        <div className="text-center py-6 animate-in fade-in zoom-in duration-500 px-4">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-4">Password Updated</h1>
                            <p className="text-white/60 mb-10 leading-relaxed text-lg">
                                Your account is secure again. You'll be redirected shortly.
                            </p>
                            <Button
                                asChild
                                className="w-full py-7 rounded-2xl bg-sky-500 hover:bg-sky-400 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-sky-500/25"
                            >
                                <Link href="/login">Go to Login Now</Link>
                            </Button>
                        </div>
                    )}
                </AuthCard>
            </div>
        </AuthBackground>
    )
}
