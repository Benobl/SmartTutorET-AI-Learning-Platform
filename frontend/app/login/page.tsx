"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { SmartTutorBrand } from "@/components/brand-logo"
import { Eye, EyeOff, ArrowRight, Lock, Mail, ArrowLeft, Chrome } from "lucide-react"

export default function LoginPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [formData, setFormData] = useState({
    email: "",
    password: "",
  })

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1000))

    // Simple redirect logic
    if (formData.email.includes("admin")) {
      router.push("/dashboard/admin")
    } else if (formData.email.includes("tutor")) {
      router.push("/dashboard/tutor")
    } else {
      router.push("/dashboard/student")
    }

    setIsLoading(false)
  }

  const handleGoogleLogin = () => {
    // Handle Google OAuth login
    console.log("Google login clicked")
    // In real app, this would redirect to Google OAuth
  }

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#1B5A6C] to-[#223347] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3D7FA2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#206687]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] bg-gradient-to-r from-[#1B5A6C]/5 via-[#294B61]/5 to-[#2E4360]/5 rounded-full blur-3xl"></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "1s" }}></div>

      {/* Login Card Container */}
      <div className="relative w-full max-w-md">
        {/* Back to Home Button - Attractive Design */}
        <Link href="/">
          <div className="mb-8 flex items-center gap-2 group cursor-pointer">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-r from-[#3D7FA2]/20 to-[#206687]/20 flex items-center justify-center group-hover:from-[#3D7FA2]/30 group-hover:to-[#206687]/30 transition-all duration-300 border border-white/10">
              <ArrowLeft className="w-5 h-5 text-white/80 group-hover:text-white" />
            </div>
            <div>
              <div className="text-sm font-medium text-white/80 group-hover:text-white transition-colors">Back to Home</div>
              <div className="text-xs text-white/60 group-hover:text-white/80 transition-colors">Continue exploring SmartTutorET</div>
            </div>
          </div>
        </Link>

        {/* Login Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-lg p-2 shadow-2xl overflow-hidden group">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2]/20 via-[#206687]/10 to-[#1B5A6C]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
          </div>

          {/* Form Content */}
          <div className="relative bg-gradient-to-br from-[#1B5A6C]/30 via-[#223347]/20 to-[#2E4360]/10 rounded-3xl p-8">
            {/* Logo Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center shadow-lg">
                  <Lock className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Welcome Back
                  </h1>
                  <p className="text-sm text-white/60">Sign in to your SmartTutorET account</p>
                </div>
              </div>
            </div>

            {/* Google Login Button */}
            <Button
              type="button"
              onClick={handleGoogleLogin}
              className="w-full mb-6 rounded-xl bg-white/10 hover:bg-white/20 text-white border border-white/20 transition-all duration-300 group relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] opacity-0 group-hover:opacity-10 transition-opacity"></div>
              <div className="relative z-10 flex items-center justify-center gap-3">
                <Chrome className="w-5 h-5" />
                <span>Continue with Google</span>
              </div>
            </Button>

            {/* Divider */}
            <div className="relative mb-6">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-white/10"></div>
              </div>
              <div className="relative flex justify-center">
                <span className="px-4 bg-transparent text-sm text-white/60">Or continue with email</span>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Email Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder="student@example.com"
                  value={formData.email}
                  onChange={handleChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                />
              </div>

              {/* Password Input */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Lock className="w-4 h-4" />
                  Password
                </label>
                <div className="relative">
                  <input
                    type={showPassword ? "text" : "password"}
                    name="password"
                    required
                    placeholder="Enter your password"
                    value={formData.password}
                    onChange={handleChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm pr-12 transition-all duration-300 focus:bg-white/15"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                  >
                    {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                  </button>
                </div>
              </div>

              {/* Forgot Password */}
              <div className="flex justify-end">
                <Link href="/forgot-password" className="text-sm text-[#3D7FA2] hover:text-[#206687] transition-colors font-medium">
                  Forgot password?
                </Link>
              </div>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className="w-full rounded-xl bg-gradient-to-r from-[#3D7FA2] to-[#206687] hover:from-[#206687] hover:to-[#103255] text-white border-0 shadow-lg hover:shadow-xl py-4 transition-all duration-300 group relative overflow-hidden"
              >
                <div className="absolute inset-0 bg-gradient-to-r from-[#206687] to-[#103255] opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    <>
                      Sign In to Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

              {/* Sign Up Link */}
              <div className="text-center pt-4">
                <p className="text-white/60 text-sm">
                  New to SmartTutorET?{" "}
                  <Link href="/signup" className="text-[#3D7FA2] hover:text-[#206687] font-semibold transition-colors">
                    Create an account
                  </Link>
                </p>
              </div>
            </form>

            {/* Demo Accounts */}
            <div className="mt-8 pt-6 border-t border-white/10">
              <p className="text-sm text-white/60 text-center mb-4">Quick Demo Access</p>
              <div className="grid grid-cols-3 gap-3">
                {[
                  { email: "student@demo.com", label: "Student", color: "#3D7FA2" },
                  { email: "tutor@demo.com", label: "Tutor", color: "#206687" },
                  { email: "admin@demo.com", label: "Admin", color: "#1B5A6C" },
                ].map((account, idx) => (
                  <button
                    key={idx}
                    onClick={() => {
                      setFormData({ email: account.email, password: "demo123" })
                      handleSubmit({ preventDefault: () => {} } as React.FormEvent)
                    }}
                    className="py-3 rounded-xl bg-white/5 hover:bg-white/10 text-white text-sm transition-all duration-300 group relative overflow-hidden"
                  >
                    {/* Glowing effect */}
                    <div
                      className="absolute inset-0 opacity-0 group-hover:opacity-20 transition-opacity duration-300 rounded-xl blur-sm"
                      style={{ backgroundColor: account.color }}
                    ></div>
                    <span className="relative z-10">{account.label}</span>
                  </button>
                ))}
              </div>
              <p className="text-xs text-white/40 text-center mt-3">Password: demo123</p>
            </div>
          </div>
        </div>
      </div>

      {/* Animation Styles */}
      <style jsx global>{`
        @keyframes float {
          0%, 100% {
            transform: translateY(0px);
          }
          50% {
            transform: translateY(-10px);
          }
        }

        .animate-float {
          animation: float 3s ease-in-out infinite;
        }
      `}</style>
    </div>
  )
}
