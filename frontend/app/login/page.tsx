"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Lock, Mail, ArrowLeft, Chrome, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"
import { AuthBackground, AuthCard } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

const loginSchema = z.object({
  email: z.string().email("Please enter a valid email address"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

export default function LoginPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
  })

  const onSubmit = async (data: LoginFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      // Simulate API call
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess("Login successful! Redirecting...")

      // Simple redirect logic based on data
      setTimeout(() => {
        if (data.email.includes("admin")) {
          router.push("/dashboard/admin")
        } else if (data.email.includes("tutor")) {
          router.push("/dashboard/tutor")
        } else {
          router.push("/dashboard/student")
        }
      }, 1000)
    } catch (err) {
      setError("Invalid email or password. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = () => {
    console.log("Google login clicked")
  }

  return (
    <AuthBackground imageSrc="/auth/premium-library-bg.png">
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">
        {/* Back Button */}


        <AuthCard>
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-white/20 overflow-hidden group-hover:scale-105 transition-all duration-500">
                <Image src="/logo.png" alt="SmartTutorET Logo" width={64} height={64} priority />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Welcome Back</h1>
            <p className="text-white/60">Sign in to continue your learning journey</p>
          </div>

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 p-4 rounded-xl bg-red-500/10 border border-red-500/20 flex items-center gap-3 text-red-400 text-sm animate-in fade-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 p-4 rounded-xl bg-emerald-500/10 border border-emerald-500/20 flex items-center gap-3 text-emerald-400 text-sm animate-in fade-in slide-in-from-top-2">
              <CheckCircle2 className="w-5 h-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Social Login */}
          <Button
            type="button"
            variant="outline"
            onClick={handleGoogleLogin}
            className="w-full mb-6 py-6 rounded-xl bg-white/5 border-white/20 text-white hover:bg-white/10 hover:border-white/30 transition-smooth gap-3"
          >
            <Chrome className="w-5 h-5" />
            Continue with Google
          </Button>

          <div className="relative mb-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-white/10"></div>
            </div>
            <div className="relative flex justify-center text-xs uppercase">
              <span className="bg-transparent px-2 text-white/40">Or continue with email</span>
            </div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-2">
              <Label className="text-white/80 ml-1">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                <Input
                  {...register("email")}
                  placeholder="name@example.com"
                  className={cn(
                    "bg-white/5 border-white/10 text-white pl-11 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth placeholder:text-white/40",
                    errors.email && "border-red-500/50 focus:ring-red-500/50"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <div className="flex justify-between items-center px-1">
                <Label className="text-white/80">Password</Label>
                <Link
                  href="/forgot-password"
                  className="text-xs text-sky-400 hover:text-sky-300 transition-colors"
                >
                  Forgot password?
                </Link>
              </div>
              <div className="relative group">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                <Input
                  {...register("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  className={cn(
                    "bg-white/5 border-white/10 text-white pl-11 pr-12 py-6 rounded-xl focus:ring-sky-500/50 transition-smooth",
                    errors.password && "border-red-500/50 focus:ring-red-500/50"
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
              {errors.password && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.password.message}</p>
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
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In
                    <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </span>
            </Button>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/60">
            Don't have an account?{" "}
            <Link
              href="/signup"
              className="text-sky-400 hover:text-sky-300 font-medium transition-colors"
            >
              Sign up for free
            </Link>
          </div>
        </AuthCard>
      </div>
    </AuthBackground>
  )
}