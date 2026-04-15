"use client"

import { useState } from "react"
import Link from "next/link"
import Image from "next/image"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import {
  Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User,
  GraduationCap, Briefcase, CheckCircle2, AlertCircle,
  BookOpen, Calendar, Award, School, Upload, X
} from "lucide-react"
import { AuthBackground, AuthCard, PasswordStrength } from "@/components/auth-components"
import { useForm, Controller } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import * as z from "zod"
import { cn } from "@/lib/utils"

// Regex for letters only
const lettersOnly = /^[A-Za-z]+$/

const signupSchema = z.object({
  role: z.enum(["student", "tutor"]),
  firstName: z.string().min(2, "First name is too short").regex(lettersOnly, "Only letters are allowed"),
  lastName: z.string().min(2, "Last name is too short").regex(lettersOnly, "Only letters are allowed"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),

  // Student fields
  grade: z.string().optional(),
  schoolName: z.string().optional(),

  // Tutor fields
  degree: z.string().optional(),
  experience: z.coerce.number().min(0, "Experience must be 0 or more").max(50, "Experience cannot exceed 50 years").optional(),
  subject: z.string().optional(),
  availability: z.array(z.string()).optional(),
  degreeFile: z.any().optional(),
}).refine((data) => {
  if (data.role === "student") {
    return !!data.grade && !!data.schoolName
  }
  return true
}, {
  message: "Class is required",
  path: ["grade"]
}).refine((data) => {
  if (data.role === "student") {
    return !!data.schoolName
  }
  return true
}, {
  message: "School name is required",
  path: ["schoolName"]
}).refine((data) => {
  if (data.role === "tutor") {
    return !!data.degree && data.experience !== undefined && !!data.subject && (data.availability?.length || 0) > 0
  }
  return true
}, {
  message: "Degree is required",
  path: ["degree"]
}).refine((data) => {
  if (data.role === "tutor") {
    return data.experience !== undefined
  }
  return true
}, {
  message: "Experience is required",
  path: ["experience"]
}).refine((data) => {
  if (data.role === "tutor") {
    return !!data.subject
  }
  return true
}, {
  message: "Subject is required",
  path: ["subject"]
}).refine((data) => {
  if (data.role === "tutor") {
    return (data.availability?.length || 0) > 0
  }
  return true
}, {
  message: "Select at least one day",
  path: ["availability"]
})

type SignupFormValues = z.infer<typeof signupSchema>

const DAYS = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
const SUBJECTS = ["Mathematics", "Physics", "Chemistry", "Biology", "English", "History", "Geography", "ICT"]

export default function SignupPage() {
  const router = useRouter()
  const [showPassword, setShowPassword] = useState(false)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState<string | null>(null)
  const [role, setRole] = useState<"student" | "tutor">("student")
  const [fileName, setFileName] = useState<string | null>(null)
  const [step, setStep] = useState(1)

  const {
    register,
    handleSubmit,
    watch,
    setValue,
    control,
    trigger,
    formState: { errors },
  } = useForm<SignupFormValues>({
    resolver: zodResolver(signupSchema),
    defaultValues: {
      role: "student",
      availability: []
    }
  })

  const password = watch("password", "")
  const availability = watch("availability") || []

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const validTypes = ["application/pdf", "image/jpeg", "image/png"]
      if (!validTypes.includes(file.type)) {
        setError("Invalid file type. Please upload a PDF or Image.")
        setFileName(null)
        setValue("degreeFile", null)
        return
      }
      if (file.size > 5 * 1024 * 1024) { // 5MB limit
        setError("File size too large. Max 5MB.")
        setFileName(null)
        setValue("degreeFile", null)
        return
      }

      setFileName(file.name)
      setValue("degreeFile", file)
      setError(null)
    } else {
      setFileName(null)
      setValue("degreeFile", null)
    }
  }

  const toggleDay = (day: string) => {
    const current = availability || []
    const updated = current.includes(day)
      ? current.filter(d => d !== day)
      : [...current, day]
    setValue("availability", updated, { shouldValidate: true })
  }

  const nextStep = async () => {
    let fieldsToValidate: (keyof SignupFormValues)[] = []

    if (step === 1) {
      fieldsToValidate = ["firstName", "lastName", "email"]
    } else if (step === 2) {
      if (role === "student") {
        fieldsToValidate = ["grade", "schoolName"]
      } else {
        fieldsToValidate = ["degree", "experience", "subject"]
      }
    } else if (step === 3 && role === "tutor") {
      fieldsToValidate = ["availability"]
    }

    const isValid = await trigger(fieldsToValidate)
    if (isValid) {
      setStep(prev => prev + 1)
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }

  const prevStep = () => {
    setStep(prev => prev - 1)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  const onSubmit = async (data: SignupFormValues) => {
    setIsLoading(true)
    setError(null)
    setSuccess(null)

    try {
      console.log("Submitting:", data)
      await new Promise(resolve => setTimeout(resolve, 1500))

      setSuccess("Account created successfully! Welcome to SmartTutorET.")

      setTimeout(() => {
        router.push(role === "student" ? "/dashboard/student" : "/dashboard/tutor")
      }, 1500)
    } catch (err) {
      setError("An error occurred during signup. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const handleRoleChange = (newRole: "student" | "tutor") => {
    setRole(newRole)
    setValue("role", newRole)
    setError(null)
    setStep(1) // Reset to first step on role change
  }

  const stepItems = role === "student"
    ? [
      { number: 1, title: "Identity" },
      { number: 2, title: "Profile" },
      { number: 3, title: "Security" },
    ]
    : [
      { number: 1, title: "Identity" },
      { number: 2, title: "Expertise" },
      { number: 3, title: "Schedule" },
      { number: 4, title: "Security" },
    ]

  const totalSteps = stepItems.length

  return (
    <AuthBackground imageSrc="/auth/signup-bg.png">
      <div className="w-full max-w-xl animate-in fade-in zoom-in duration-500">
        <AuthCard>
          <div className="flex flex-col items-center mb-8">
            <Link href="/" className="mb-4">
              <div className="w-16 h-16 rounded-2xl bg-white flex items-center justify-center shadow-xl border border-white/20 overflow-hidden hover:scale-105 transition-all duration-500">
                <Image src="/logo.png" alt="SmartTutorET Logo" width={64} height={64} priority />
              </div>
            </Link>
            <h1 className="text-3xl font-bold text-white mb-2">Create Your Account</h1>
            <p className="text-white/60">Join the future of AI-powered learning in Ethiopia</p>
          </div>

          {/* Internal Back Button */}
          <div className="flex justify-start mb-2">
            <button
              onClick={step > 1 ? prevStep : () => router.push("/")}
              className="inline-flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
            >
              <div className="w-7 h-7 rounded-full bg-white/5 flex items-center justify-center group-hover:bg-white/10 transition-smooth border border-white/5">
                <ArrowLeft className="w-3.5 h-3.5" />
              </div>
              <span className="text-xs font-medium">{step === 1 ? "Back to Home" : "Previous Step"}</span>
            </button>
          </div>
          {/* Header */}
          <div className="text-center mb-6">
            <h1 className="text-3xl font-bold text-white mb-2">Create Account</h1>
            <p className="text-white/60">Step {step} of {totalSteps}: {stepItems[step - 1].title}</p>
          </div>

          {/* Progress Indicator */}
          <div className="flex items-center justify-between mb-8 px-4">
            {stepItems.map((item, idx) => (
              <div key={item.number} className="flex items-center flex-1 last:flex-none">
                <div className={cn(
                  "w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-smooth",
                  step === item.number
                    ? "bg-sky-500 text-white shadow-lg shadow-sky-500/20 scale-110"
                    : step > item.number
                      ? "bg-emerald-500 text-white"
                      : "bg-white/10 text-white/40"
                )}>
                  {step > item.number ? <CheckCircle2 className="w-5 h-5" /> : item.number}
                </div>
                {idx < stepItems.length - 1 && (
                  <div className={cn(
                    "h-[2px] flex-1 mx-2 transition-smooth",
                    step > item.number ? "bg-emerald-500" : "bg-white/10"
                  )} />
                )}
              </div>
            ))}
          </div>

          {/* Modern Role Selection Tabs (Only on Step 1) */}
          {step === 1 && (
            <div className="grid grid-cols-2 p-1.5 bg-white/5 rounded-2xl border border-white/10 mb-8 relative">
              <button
                onClick={() => handleRoleChange("student")}
                className={cn(
                  "relative flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all duration-500 z-10",
                  role === "student"
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {role === "student" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-sky-600 to-sky-400 rounded-xl shadow-[0_0_20px_rgba(14,165,233,0.3)] animate-in fade-in zoom-in-95 duration-300" />
                )}
                <GraduationCap className={cn("relative z-10 w-5 h-5 transition-transform duration-500", role === "student" && "scale-110")} />
                <span className="relative z-10 text-sm font-semibold">I&apos;m a Student</span>
              </button>
              <button
                onClick={() => handleRoleChange("tutor")}
                className={cn(
                  "relative flex items-center justify-center gap-3 py-3.5 rounded-xl transition-all duration-500 z-10",
                  role === "tutor"
                    ? "text-white"
                    : "text-white/40 hover:text-white/70"
                )}
              >
                {role === "tutor" && (
                  <div className="absolute inset-0 bg-gradient-to-r from-emerald-600 to-emerald-400 rounded-xl shadow-[0_0_20px_rgba(16,185,129,0.3)] animate-in fade-in zoom-in-95 duration-300" />
                )}
                <Briefcase className={cn("relative z-10 w-5 h-5 transition-transform duration-500", role === "tutor" && "scale-110")} />
                <span className="relative z-10 text-sm font-semibold">I&apos;m a Tutor</span>
              </button>
            </div>
          )}

          {/* Alert Messages */}
          {error && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-red-500/20 bg-red-500/10 p-4 text-sm text-red-400 animate-in fade-in slide-in-from-top-1">
              <AlertCircle className="h-5 w-5 flex-shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="mb-6 flex items-center gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 p-4 text-sm text-emerald-400 animate-in fade-in slide-in-from-top-1">
              <CheckCircle2 className="h-5 w-5 flex-shrink-0" />
              <p>{success}</p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
            {/* Step 1: Identity */}
            {step === 1 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="ml-1 text-white/80">First Name</Label>
                    <div className="group relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-sky-400" />
                      <Input
                        {...register("firstName")}
                        placeholder="John"
                        className={cn(
                          "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-sky-500/50",
                          errors.firstName && "border-red-500/50"
                        )}
                      />
                    </div>
                    {errors.firstName && (
                      <p className="ml-1 mt-1 text-[10px] text-red-400">{errors.firstName.message}</p>
                    )}
                  </div>
                  <div className="space-y-2">
                    <Label className="ml-1 text-white/80">Last Name</Label>
                    <div className="group relative">
                      <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-sky-400" />
                      <Input
                        {...register("lastName")}
                        placeholder="Doe"
                        className={cn(
                          "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-sky-500/50",
                          errors.lastName && "border-red-500/50"
                        )}
                      />
                    </div>
                    {errors.lastName && (
                      <p className="ml-1 mt-1 text-[10px] text-red-400">{errors.lastName.message}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label className="ml-1 text-white/80">Email Address</Label>
                  <div className="group relative">
                    <Mail className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-sky-400" />
                    <Input
                      {...register("email")}
                      placeholder="name@example.com"
                      className={cn(
                        "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-sky-500/50",
                        errors.email && "border-red-500/50"
                      )}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-red-400 text-xs mt-1 ml-1">{errors.email.message}</p>
                  )}
                </div>
              </div>
            )}

            {/* Step 2: Profile (Student) or Expertise (Tutor) */}
            {step === 2 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {role === "student" ? (
                  <>
                    <div className="space-y-2">
                      <Label className="ml-1 text-white/80">Class/Grade</Label>
                      <Controller
                        name="grade"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={cn(
                              "w-full rounded-xl border-white/10 bg-white/5 py-6 text-white focus:ring-sky-500/50",
                              errors.grade && "border-red-500/50"
                            )}>
                              <SelectValue placeholder="Select Class" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-slate-900 text-white">
                              {[9, 10, 11, 12].map(g => (
                                <SelectItem key={g} value={g.toString()}>Grade {g}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.grade && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.grade.message}</p>
                      )}
                    </div>
                    <div className="space-y-2">
                      <Label className="ml-1 text-white/80">School Name</Label>
                      <div className="group relative">
                        <School className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-white/40 transition-colors group-focus-within:text-sky-400" />
                        <Input
                          {...register("schoolName")}
                          placeholder="Enter school name"
                          className={cn(
                            "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-sky-500/50",
                            errors.schoolName && "border-red-500/50"
                          )}
                        />
                      </div>
                      {errors.schoolName && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.schoolName.message}</p>
                      )}
                    </div>
                  </>
                ) : (
                  <>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label className="ml-1 text-white/80">Degree</Label>
                        <div className="group relative">
                          <Award className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-emerald-400" />
                          <Input
                            {...register("degree")}
                            placeholder="e.g. BSc in Math"
                            className={cn(
                              "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-emerald-500/50",
                              errors.degree && "border-red-500/50"
                            )}
                          />
                        </div>
                        {errors.degree && (
                          <p className="text-red-400 text-xs mt-1 ml-1">{errors.degree.message}</p>
                        )}
                      </div>
                      <div className="space-y-2">
                        <Label className="ml-1 text-white/80">Experience (Years)</Label>
                        <div className="group relative">
                          <Calendar className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-emerald-400" />
                          <Input
                            {...register("experience")}
                            type="number"
                            placeholder="0-50"
                            className={cn(
                              "rounded-xl border-white/10 bg-white/5 py-6 pl-11 text-white transition-smooth placeholder:text-white/30 focus:ring-emerald-500/50",
                              errors.experience && "border-red-500/50"
                            )}
                          />
                        </div>
                        {errors.experience && (
                          <p className="text-red-400 text-xs mt-1 ml-1">{errors.experience.message}</p>
                        )}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <Label className="ml-1 text-white/80">Main Subject</Label>
                      <Controller
                        name="subject"
                        control={control}
                        render={({ field }) => (
                          <Select onValueChange={field.onChange} value={field.value}>
                            <SelectTrigger className={cn(
                              "w-full rounded-xl border-white/10 bg-white/5 py-6 text-white focus:ring-emerald-500/50",
                              errors.subject && "border-red-500/50"
                            )}>
                              <SelectValue placeholder="Select Subject" />
                            </SelectTrigger>
                            <SelectContent className="border-white/10 bg-slate-900 text-white">
                              {SUBJECTS.map(s => (
                                <SelectItem key={s} value={s}>{s}</SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        )}
                      />
                      {errors.subject && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.subject.message}</p>
                      )}
                    </div>
                  </>
                )}
              </div>
            )}

            {/* Step 3: Schedule (Tutor) or Security (Student) */}
            {step === 3 && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                {role === "tutor" ? (
                  <>
                    <div className="space-y-2">
                      <Label className="ml-1 text-white/80">Teaching Availability</Label>
                      <div className="flex flex-wrap gap-2">
                        {DAYS.map(day => (
                          <button
                            key={day}
                            type="button"
                            onClick={() => toggleDay(day)}
                            className={cn(
                              "rounded-lg px-3 py-1.5 text-xs font-medium transition-smooth",
                              availability.includes(day)
                                ? "bg-emerald-500 text-white shadow-lg shadow-emerald-500/20"
                                : "bg-white/5 text-white/40 hover:bg-white/10 hover:text-white"
                            )}
                          >
                            {day.slice(0, 3)}
                          </button>
                        ))}
                      </div>
                      {errors.availability && (
                        <p className="text-red-400 text-xs mt-1 ml-1">{errors.availability.message}</p>
                      )}
                    </div>

                    <div className="space-y-2">
                      <Label className="ml-1 text-white/80">Upload Degree (PDF/Images)</Label>
                      <div className="relative">
                        <input
                          type="file"
                          id="degree-upload"
                          className="hidden"
                          accept=".pdf,.jpg,.jpeg,.png"
                          onChange={handleFileChange}
                        />
                        <label
                          htmlFor="degree-upload"
                          className={cn(
                            "flex cursor-pointer items-center justify-center gap-3 rounded-xl border-2 border-dashed py-6 transition-smooth",
                            fileName
                              ? "border-emerald-500/50 bg-emerald-500/5 text-emerald-400"
                              : "border-white/10 text-white/40 hover:border-white/20 hover:text-white/60"
                          )}
                        >
                          {fileName ? (
                            <>
                              <CheckCircle2 className="h-5 w-5" />
                              <span className="max-w-[200px] truncate text-sm">{fileName}</span>
                              <X
                                className="ml-2 h-4 w-4 hover:text-red-400"
                                onClick={(e) => {
                                  e.preventDefault()
                                  e.stopPropagation()
                                  setFileName(null)
                                  setValue("degreeFile", null)
                                }}
                              />
                            </>
                          ) : (
                            <>
                              <Upload className="h-5 w-5" />
                              <span className="text-sm">Click to upload degree</span>
                            </>
                          )}
                        </label>
                      </div>
                    </div>
                  </>
                ) : (
                  <SecuritySection
                    register={register}
                    showPassword={showPassword}
                    setShowPassword={setShowPassword}
                    password={password}
                    errors={errors}
                  />
                )}
              </div>
            )}

            {/* Step 4: Security (Tutor) */}
            {step === 4 && role === "tutor" && (
              <div className="space-y-5 animate-in fade-in slide-in-from-right-4 duration-300">
                <SecuritySection
                  register={register}
                  showPassword={showPassword}
                  setShowPassword={setShowPassword}
                  password={password}
                  errors={errors}
                />
              </div>
            )}

            <div className="flex gap-4 pt-2">
              {step < totalSteps ? (
                <Button
                  type="button"
                  onClick={nextStep}
                  className={cn(
                    "group w-full border-0 py-6 font-semibold text-white transition-smooth shadow-lg",
                    role === "student"
                      ? "bg-sky-500 shadow-sky-500/20 hover:bg-sky-400"
                      : "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400"
                  )}
                >
                  <span className="flex items-center gap-2">
                    Continue to {stepItems[step].title}
                    <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                  </span>
                </Button>
              ) : (
                <Button
                  type="submit"
                  disabled={isLoading}
                  className={cn(
                    "group w-full border-0 py-6 font-semibold text-white transition-smooth shadow-lg",
                    role === "student"
                      ? "bg-sky-500 shadow-sky-500/20 hover:bg-sky-400"
                      : "bg-emerald-500 shadow-emerald-500/20 hover:bg-emerald-400"
                  )}
                >
                  <span className="flex items-center gap-2">
                    {isLoading ? (
                      <>
                        <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                        Creating Account...
                      </>
                    ) : (
                      <>
                        Create {role === "student" ? "Student" : "Tutor"} Account
                        <CheckCircle2 className="h-4 w-4 transition-transform group-hover:scale-110" />
                      </>
                    )}
                  </span>
                </Button>
              )}
            </div>
          </form>

          {/* Footer */}
          <div className="mt-8 text-center text-sm text-white/60">
            Already have an account?{" "}
            <Link
              href="/login"
              className="font-medium text-sky-400 transition-colors hover:text-sky-300"
            >
              Sign in here
            </Link>
          </div>
        </AuthCard>
      </div>
    </AuthBackground>
  )
}

function SecuritySection({ register, showPassword, setShowPassword, password, errors }: any) {
  return (
    <div className="space-y-5">
      <div className="space-y-2">
        <Label className="ml-1 text-white/80">Password</Label>
        <div className="group relative">
          <Lock className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-white/40 transition-colors group-focus-within:text-sky-400" />
          <Input
            {...register("password")}
            type={showPassword ? "text" : "password"}
            placeholder="••••••••"
            className={cn(
              "rounded-xl border-white/10 bg-white/5 py-6 pl-11 pr-12 text-white transition-smooth placeholder:text-white/30 focus:ring-sky-500/50",
              errors.password && "border-red-500/50"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-4 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/60"
          >
            {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
          </button>
        </div>
        <PasswordStrength password={password} />
        {errors.password && (
          <p className="ml-1 mt-1 text-xs text-red-400">{errors.password.message}</p>
        )}
      </div>

      <p className="px-4 text-center text-[11px] leading-relaxed text-white/40">
        By clicking "Create Account", you agree to our{" "}
        <Link href="/terms" className="text-sky-400/80 transition-colors hover:text-sky-400">Terms of Service</Link>
        {" "}and{" "}
        <Link href="/privacy" className="text-sky-400/80 transition-colors hover:text-sky-400">Privacy Policy</Link>.
      </p>
    </div>
  )
}
