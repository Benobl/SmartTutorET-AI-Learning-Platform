"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, ArrowRight } from "lucide-react"
import { AuthBackground, AuthCard } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

const forgotPasswordSchema = z.object({
    email: z.string().email("Please enter a valid email address"),
})

type ForgotPasswordFormValues = z.infer<typeof forgotPasswordSchema>

export default function ForgotPasswordPage() {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState<string | null>(null)
    const [success, setSuccess] = useState(false)

    const {
        register,
        handleSubmit,
        formState: { errors },
    } = useForm<ForgotPasswordFormValues>({
        resolver: zodResolver(forgotPasswordSchema),
    })

    const onSubmit = async (data: ForgotPasswordFormValues) => {
        setIsLoading(true)
        setError(null)

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 1500))
            setSuccess(true)
        } catch (err) {
            setError("We couldn't find an account with that email address.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthBackground imageSrc="/auth/forgot-password-bg.png">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                {/* Back Button */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-4"
                >
                    <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center group-hover:bg-white/20 transition-smooth">
                        <ArrowLeft className="w-4 h-4" />
                    </div>
                    <span className="text-sm font-medium">Back to Login</span>
                </Link>

                <AuthCard>
                    {!success ? (
                        <>
                            {/* Header */}
                            <div className="text-center mb-8">
                                <h1 className="text-3xl font-bold text-white mb-2">Forgot Password</h1>
                                <p className="text-white/60">Enter your email and we'll send you a link to reset your password</p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
                                <div className="space-y-2">
                                    <Label className="text-white/80 ml-1">Email Address</Label>
                                    <div className="relative group">
                                        <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                                        <Input
                                            {...register("email")}
                                            placeholder="name@example.com"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth",
                                                errors.email && "border-red-500/50"
                                            )}
                                        />
                                    </div>
                                    {errors.email && (
                                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>
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
                                                Sending Link...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
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
                            <h1 className="text-2xl font-bold text-white mb-3">Check Your Email</h1>
                            <p className="text-white/60 mb-8 leading-relaxed">
                                We've sent a password reset link to your email address. Please follow the instructions to reset your password.
                            </p>
                            <Button
                                asChild
                                className="w-full py-6 rounded-xl bg-white/10 hover:bg-white/20 text-white font-medium border border-white/10 transition-smooth"
                            >
                                <Link href="/login">Return to Login</Link>
                            </Button>
                        </div>
                    )}
                </AuthCard>
            </div>
        </AuthBackground>
    )
}
