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

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;

const forgotPasswordSchema = z.object({
    email: z.string()
        .email("Email or password is incorrect")
        .regex(emailRegex, "Email or password is incorrect"),
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
            // Always show success to prevent enumeration
            setSuccess(true)
        } catch (err: any) {
            // Mask errors
            setSuccess(true)
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
                                <h1 className="text-3xl font-bold text-white mb-3 tracking-tight">Forgot Password?</h1>
                                <p className="text-base text-white/50 leading-relaxed">
                                    Enter your email address and we'll send you a secure link to reset your password.
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
                                                Sending Link...
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

                            {/* Back to Login - Inside the card */}
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
                            <h1 className="text-2xl font-bold text-white mb-4">Check Your Mailbox</h1>
                            <p className="text-white/60 mb-10 leading-relaxed">
                                We've sent a secure reset link to your email. 
                                <span className="block mt-4 text-emerald-400/80 text-sm">Please check your spam folder if you don't see it.</span>
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
