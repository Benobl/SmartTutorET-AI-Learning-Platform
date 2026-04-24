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

const resetPasswordSchema = z.object({
    password: z.string().min(8, "Password must be at least 8 characters"),
    confirmPassword: z.string()
}).refine((data) => data.password === data.confirmPassword, {
    message: "Passwords don't match",
    path: ["confirmPassword"],
})

type ResetPasswordFormValues = z.infer<typeof resetPasswordSchema>

export default function ResetPasswordPage() {
    const router = useRouter()
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
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            setSuccess(true)

            setTimeout(() => {
                router.push("/login")
            }, 3000)
        } catch (err) {
            setError("An error occurred while resetting your password. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthBackground imageSrc="/auth/reset-password-bg.png">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                <AuthCard>
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Reset Password</h1>
                                <p className="text-white/60">Choose a strong new password for your account</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
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
                                                "bg-white/5 border-white/10 text-white pl-11 pr-12 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth",
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
                                                "bg-white/5 border-white/10 text-white pl-11 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth",
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
                                    disabled={isLoading}
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
