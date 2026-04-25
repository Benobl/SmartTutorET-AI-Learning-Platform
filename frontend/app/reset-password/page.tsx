"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Lock, CheckCircle2, AlertCircle, ArrowRight, Eye, EyeOff } from "lucide-react"
import { AuthBackground, AuthCard, PasswordStrength } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

import { useSearchParams } from "next/navigation"
import { authApi } from "@/lib/api"
import Image from "next/image"

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
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
            setError("Invalid or expired reset token.")
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
            setError(err.message || "An error occurred while resetting your password. Please try again.")
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
                            <div className="flex flex-col items-center mb-8 text-center">
                                <Link href="/login" className="mb-4">
                                    <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-white/20">
                                        <Image src="/logo.png" alt="Logo" width={64} height={64} priority />
                                    </div>
                                </Link>
                                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                                <p className="text-white/60">Choose a strong new password for your account</p>
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
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                                <div className="space-y-2">
                                    <Label className="text-white/80 ml-1">New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                                        <Input
                                            {...register("password")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 pr-12 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/40",
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
                                    <Label className="text-white/80 ml-1">Confirm New Password</Label>
                                    <div className="relative group">
                                        <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                                        <Input
                                            {...register("confirmPassword")}
                                            type={showPassword ? "text" : "password"}
                                            placeholder="••••••••"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/40",
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
                                    className="w-full py-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-semibold transition-smooth shadow-lg shadow-sky-500/20 group"
                                >
                                    <span className="flex items-center gap-2">
                                        {isLoading ? (
                                            <>
                                                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                                                Updating Password...
                                            </>
                                        ) : (
                                            <>
                                                Reset Password
                                                <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-4 animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6 border border-emerald-500/30">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-3">Password Updated</h1>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                Your password has been successfully reset. You will be redirected to the login page in a few seconds.
                            </p>
                            <Button
                                asChild
                                className="w-full py-6 rounded-xl bg-sky-500 hover:bg-sky-400 text-white font-medium shadow-lg shadow-sky-500/20 transition-smooth"
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
