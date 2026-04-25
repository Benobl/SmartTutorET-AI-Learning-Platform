"use client"

import { useState } from "react"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { ArrowLeft, Mail, CheckCircle2, AlertCircle, ArrowRight, Lock } from "lucide-react"
import { AuthBackground, AuthCard } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"
import { authApi } from "@/lib/api"
import Image from "next/image"

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
            await authApi.forgotPassword(data.email)
            setSuccess(true)
        } catch (err: any) {
            setError(err.message || "We couldn't connect to the server. Please try again.")
        } finally {
            setIsLoading(false)
        }
    }

    return (
        <AuthBackground imageSrc="/auth/premium-signup-bg.png">
            <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
                {/* Back Link - Now above the card as requested */}
                <Link
                    href="/login"
                    className="inline-flex items-center gap-2 text-white/60 hover:text-white transition-colors group mb-6 ml-2"
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
                            <div className="flex flex-col items-center mb-8 text-center px-4">
                                <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-sky-500 to-indigo-600 flex items-center justify-center shadow-xl mb-6 ring-4 ring-white/10">
                                    <Lock className="w-8 h-8 text-white" />
                                </div>
                                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Forgot Password?</h1>
                                <p className="text-base text-white/50 leading-relaxed">
                                    No worries, we'll send you reset instructions.
                                </p>
                            </div>

                            {/* Error Message */}
                            {error && (
                                <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-shake">
                                    <AlertCircle className="w-5 h-5 flex-shrink-0" />
                                    <p>{error}</p>
                                </div>
                            )}

                            {/* Form */}
                            <form onSubmit={handleSubmit(onSubmit)} className="space-y-6 px-2">
                                <div className="space-y-2">
                                    <Label className="text-white/80 ml-1 font-medium">Email Address</Label>
                                    <div className="relative group">
                                        <div className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors pointer-events-none">
                                            <Mail className="w-full h-full" />
                                        </div>
                                        <Input
                                            {...register("email")}
                                            placeholder="Enter your email"
                                            className={cn(
                                                "bg-white/5 border-white/10 text-white pl-11 py-7 rounded-2xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/30 text-lg",
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
                                    className="w-full py-7 rounded-2xl bg-gradient-to-r from-sky-500 to-indigo-600 hover:from-sky-400 hover:to-indigo-500 text-white font-bold text-lg transition-all duration-300 shadow-xl shadow-sky-500/25 group border-0"
                                >
                                    <span className="flex items-center gap-3 justify-center">
                                        {isLoading ? (
                                            <>
                                                <div className="w-5 h-5 border-3 border-white/30 border-t-white rounded-full animate-spin" />
                                                Sending...
                                            </>
                                        ) : (
                                            <>
                                                Send Reset Link
                                                <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </span>
                                </Button>
                            </form>
                        </>
                    ) : (
                        <div className="text-center py-6 animate-in fade-in zoom-in duration-500 px-4">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-8 border border-emerald-500/30 shadow-lg shadow-emerald-500/10">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-4">Check Your Mailbox</h1>
                            <p className="text-white/60 mb-10 leading-relaxed text-lg">
                                We've sent a secure reset link to your email. It should arrive in the next minute.
                            </p>
                            <Button
                                asChild
                                className="w-full py-7 rounded-2xl bg-white/10 hover:bg-white/15 text-white font-bold transition-all duration-300 border border-white/10 hover:border-white/20 shadow-xl"
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
