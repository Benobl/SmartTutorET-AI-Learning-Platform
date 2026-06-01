"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, ArrowRight, Lock, Mail, ArrowLeft, Chrome, AlertCircle, CheckCircle2, ShieldAlert } from "lucide-react"
import { AuthBackground, AuthCard } from "@/components/auth-components"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

import { loginUser, setAuthCookies } from "@/lib/auth-utils"
import { authApi } from "@/lib/api"

const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/

const loginSchema = z.object({
  email: z.string()
    .min(1, "Email is required")
    .email("Invalid email format"),
  password: z.string().min(1, "Password is required"),
})

type LoginFormValues = z.infer<typeof loginSchema>

import { Suspense } from "react"

export default function LoginPage() {
  return (
    <Suspense fallback={
      <div className="flex h-screen w-screen items-center justify-center bg-[#0a0e27]">
        <div className="flex flex-col items-center gap-4">
          <div className="h-10 w-10 animate-spin rounded-full border-4 border-sky-500 border-t-transparent" />
        </div>
      </div>
    }>
      <LoginForm />
    </Suspense>
  )
}

function LoginForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
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
      const user = await loginUser(data.email, data.password);

      if (user && !('error' in user)) {
        setSuccess(`Welcome back! Redirecting...`)

        const callbackUrl = searchParams.get('callbackUrl')

        const redirectPath = callbackUrl || (
          user.role === "admin" ? "/dashboard/admin" :
            user.role === "tutor" ? "/dashboard/tutor" :
              user.role === "manager" ? "/dashboard/manager" :
                "/dashboard/student"
        );

        setTimeout(() => {
          window.location.href = redirectPath;
        }, 800);
      } else {
        setError(user && 'error' in user ? (user.error as string) : "Invalid email or password");
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during login. Please try again.");
    } finally {
      setIsLoading(false)
    }
  }

  const handleGoogleLogin = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const clientId = process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID;
      if (!clientId || clientId.includes("your-google-client-id-here")) {
        setError("Google Sign-In is not configured yet (client_id missing in environment). Please log in with your seeded email and password.");
        setIsLoading(false);
        return;
      }

      if (typeof window !== "undefined" && (window as any).google) {
        (window as any).google.accounts.id.initialize({
          client_id: clientId,
          context: 'signin',
          ux_mode: 'popup',
          callback: async (response: any) => {
            try {
              const res = await authApi.googleLogin(response.credential);
              if (res.success && res.data) {
                const user = res.data;
                localStorage.setItem("smarttutor_user", JSON.stringify(user));
                if (res.token) {
                  localStorage.setItem("token", res.token);
                  setAuthCookies(res.token, user.role);
                }
                setSuccess(`Welcome back! Redirecting...`);

                const callbackUrl = searchParams.get('callbackUrl');

                const redirectPath = callbackUrl || (
                  user.role === "admin" ? "/dashboard/admin" :
                    user.role === "tutor" ? "/dashboard/tutor" :
                      user.role === "manager" ? "/dashboard/manager" :
                        "/dashboard/student"
                );

                setTimeout(() => {
                  window.location.href = redirectPath;
                }, 800);
              } else {
                setError("Invalid credentials");
              }
            } catch (err: any) {
              setError(err.message || "Google authentication failed");
            } finally {
              setIsLoading(false);
            }
          }
        });

        (window as any).google.accounts.id.prompt();
      } else {
        setError("Google Sign-In is temporarily unavailable (Google SDK not loaded)");
        setIsLoading(false);
      }
    } catch (err) {
      setError("Authentication failed");
      setIsLoading(false);
    }
  }

  return (
    <AuthBackground imageSrc="/auth/premium-library-bg.png">
      <meta name="referrer" content="no-referrer-when-downgrade" />
      <div className="w-full max-w-md animate-in fade-in zoom-in duration-500">

        <AuthCard >
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-4">
              <div className="w-14 h-14 rounded-[1rem] bg-white flex items-center justify-center shadow-xl overflow-hidden hover:scale-105 transition-all duration-500">
                <Image src="/logo.png" alt="SmartTutorET Logo" width={56} height={56} priority />
              </div>
            </Link>
            <h1 className="text-2xl font-bold text-white mb-1.5">Welcome Back</h1>
            <p className="text-white/60 text-xs">Sign in to continue your learning journey</p>
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
          {process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID && process.env.NEXT_PUBLIC_GOOGLE_CLIENT_ID !== "your-google-client-id-here" && (
            <Button
              type="button"
              variant="outline"
              onClick={handleGoogleLogin}
              className="w-full mb-2 h-11 rounded-lg bg-transparent border border-white/10 hover:border-white/20 text-white hover:bg-white/5 transition-all duration-300 gap-2 text-xs"
            >
              <Chrome className="w-4 h-4 text-white/80" />
              Continue with Google
            </Button>
          )}

          <div className="relative flex items-center py-5 mb-1">
            <div className="flex-grow border-t border-white/10"></div>
            <span className="flex-shrink-0 mx-4 text-[10px] text-white/50 uppercase">Or continue with email</span>
            <div className="flex-grow border-t border-white/10"></div>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            <div className="space-y-1.5">
              <Label className="text-white/80 ml-1 text-xs">Email Address</Label>
              <div className="relative group">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 group-focus-within:text-sky-400 transition-colors" />
                <Input
                  {...register("email")}
                  placeholder="name@example.com"
                  className={cn(
                    "bg-transparent border border-white/10 hover:border-white/20 focus:border-sky-500/50 backdrop-blur-md text-white pl-10 h-11 rounded-lg text-sm focus:ring-sky-500/50 transition-smooth placeholder:text-white/30",
                    errors.email && "border-red-500/50 focus:ring-red-500/50"
                  )}
                />
              </div>
              {errors.email && (
                <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <div className="flex justify-between items-center px-1">
                <Label className="text-white/80 text-xs">Password</Label>
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
                    "bg-transparent border border-white/10 hover:border-white/20 focus:border-sky-500/50 backdrop-blur-md text-white pl-10 pr-10 h-11 rounded-lg text-sm focus:ring-sky-500/50 transition-smooth placeholder:text-white/30",
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
              className="w-full h-11 rounded-lg bg-[#0ea5e9] hover:bg-sky-400 text-white font-semibold text-sm transition-smooth shadow-lg shadow-sky-500/20 group"
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

          <div className="mt-6 text-center text-[11px] text-white/60">
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