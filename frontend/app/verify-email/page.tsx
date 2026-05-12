"use client"

import { useEffect, useState } from "react"
import { useSearchParams, useRouter } from "next/navigation"
import { authApi } from "@/lib/api"
import { AuthBackground, AuthCard } from "@/components/auth-components"
import { CheckCircle2, XCircle, Loader2, ArrowRight } from "lucide-react"
import { Button } from "@/components/ui/button"
import Link from "next/link"
import { Suspense } from "react"

export default function VerifyEmailPage() {
    return (
        <Suspense fallback={<div className="min-h-screen bg-slate-950" />}>
            <VerifyEmailContent />
        </Suspense>
    )
}

function VerifyEmailContent() {
    const searchParams = useSearchParams()
    const router = useRouter()
    const token = searchParams.get("token")
    
    const [status, setStatus] = useState<"loading" | "success" | "error">("loading")
    const [message, setMessage] = useState("Verifying your email...")

    useEffect(() => {
        if (!token) {
            setStatus("error")
            setMessage("No verification token found.")
            return
        }

        const verify = async () => {
            try {
                // Call backend (the route expects path param, but we pass it from query)
                await authApi.verifyEmail(token)
                setStatus("success")
                setMessage("Your email has been verified successfully!")
                
                // Auto redirect to login after 3 seconds
                setTimeout(() => {
                    router.push("/login")
                }, 3000)
            } catch (err: any) {
                setStatus("error")
                setMessage(err.message || "Verification failed. The link may be invalid or expired.")
            }
        }

        verify()
    }, [token, router])

    return (
        <AuthBackground imageSrc="/auth/premium-library-bg.png">
            <div className="w-full max-w-md">
                <AuthCard className="text-center">
                    {status === "loading" && (
                        <div className="py-8 flex flex-col items-center">
                            <Loader2 className="w-16 h-16 text-sky-500 animate-spin mb-6" />
                            <h1 className="text-2xl font-bold text-white mb-2">Verifying Email</h1>
                            <p className="text-white/60">{message}</p>
                        </div>
                    )}

                    {status === "success" && (
                        <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mb-8 border border-emerald-500/30">
                                <CheckCircle2 className="w-10 h-10 text-emerald-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-4">Email Verified!</h1>
                            <p className="text-white/60 mb-10 leading-relaxed">
                                Thank you for verifying your email. Your account is now active and ready to use.
                            </p>
                            <Button asChild className="w-full py-7 rounded-2xl bg-emerald-500 hover:bg-emerald-400 text-white font-bold text-lg">
                                <Link href="/login" className="flex items-center gap-2">
                                    Continue to Login
                                    <ArrowRight className="w-5 h-5" />
                                </Link>
                            </Button>
                        </div>
                    )}

                    {status === "error" && (
                        <div className="py-8 flex flex-col items-center animate-in fade-in zoom-in duration-500">
                            <div className="w-20 h-20 bg-red-500/20 rounded-full flex items-center justify-center mb-8 border border-red-500/30">
                                <XCircle className="w-10 h-10 text-red-400" />
                            </div>
                            <h1 className="text-2xl font-bold text-white mb-4">Verification Failed</h1>
                            <p className="text-red-400/80 mb-10 leading-relaxed">
                                {message}
                            </p>
                            <div className="flex flex-col gap-4 w-full">
                                <Button asChild variant="outline" className="w-full py-7 rounded-2xl border-white/10 text-white hover:bg-white/5">
                                    <Link href="/signup">Back to Sign Up</Link>
                                </Button>
                                <Button asChild variant="ghost" className="text-sky-400 hover:text-sky-300">
                                    <Link href="/login">Return to Login</Link>
                                </Button>
                            </div>
                        </div>
                    )}
                </AuthCard>
            </div>
        </AuthBackground>
    )
}
