"use client"

import type React from "react"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { SmartTutorBrand } from "@/components/brand-logo"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { AlertCircle, CheckCircle2, Upload, ArrowRight } from "lucide-react"

type Step = "personal" | "subjects" | "documents" | "review"

export default function TutorSignupPage() {
  const router = useRouter()
  const [currentStep, setCurrentStep] = useState<Step>("personal")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isLoading, setIsLoading] = useState(false)

  const [formData, setFormData] = useState({
    firstName: "",
    lastName: "",
    email: "",
    phone: "",
    password: "",
    subjects: [] as string[],
    skills: "",
    cv: null as File | null,
    degree: null as File | null,
    certifications: null as File | null,
  })

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData((prev) => ({
      ...prev,
      [e.target.name]: e.target.value,
    }))
    setError("")
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      setFormData((prev) => ({
        ...prev,
        [e.target.name]: file,
      }))
    }
  }

  const handleSubjectToggle = (subject: string) => {
    setFormData((prev) => ({
      ...prev,
      subjects: prev.subjects.includes(subject)
        ? prev.subjects.filter((s) => s !== subject)
        : [...prev.subjects, subject],
    }))
  }

  const validateStep = (step: Step) => {
    switch (step) {
      case "personal":
        if (!formData.firstName || !formData.lastName || !formData.email || !formData.phone || !formData.password) {
          setError("Please fill in all personal details")
          return false
        }
        break
      case "subjects":
        if (formData.subjects.length === 0) {
          setError("Please select at least one subject")
          return false
        }
        if (!formData.skills) {
          setError("Please describe your skill strengths")
          return false
        }
        break
      case "documents":
        if (!formData.cv || !formData.degree) {
          setError("Please upload CV and degree certificate")
          return false
        }
        break
    }
    return true
  }

  const handleNext = () => {
    if (!validateStep(currentStep)) return

    const steps: Step[] = ["personal", "subjects", "documents", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex < steps.length - 1) {
      setCurrentStep(steps[currentIndex + 1])
      setError("")
    }
  }

  const handlePrevious = () => {
    const steps: Step[] = ["personal", "subjects", "documents", "review"]
    const currentIndex = steps.indexOf(currentStep)
    if (currentIndex > 0) {
      setCurrentStep(steps[currentIndex - 1])
      setError("")
    }
  }

  const handleSubmit = async () => {
    if (!validateStep("review")) return

    setIsLoading(true)
    try {
      // Simulated submission
      await new Promise((resolve) => setTimeout(resolve, 2000))
      setSuccess("Application submitted successfully! Status: Pending Review")
      setTimeout(() => {
        router.push("/dashboard/tutor?status=pending")
      }, 2000)
    } catch (err) {
      setError("Failed to submit application. Please try again.")
    } finally {
      setIsLoading(false)
    }
  }

  const steps = [
    { id: "personal", title: "Personal Info", icon: "👤" },
    { id: "subjects", title: "Subjects", icon: "📚" },
    { id: "documents", title: "Documents", icon: "📄" },
    { id: "review", title: "Review", icon: "✓" },
  ]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-secondary/5 py-12 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Header */}
        <div className="text-center space-y-4">
          <Link href="/" className="inline-block">
            <SmartTutorBrand />
          </Link>
          <h1 className="text-3xl font-bold">Become a SmartTutorET Tutor</h1>
          <p className="text-muted-foreground">Join our community of expert educators</p>
        </div>

        {/* Progress Indicator */}
        <div className="flex items-center justify-between gap-4">
          {steps.map((step, idx) => {
            const isActive = step.id === currentStep
            const isCompleted = ["personal", "subjects", "documents"].includes(step.id) && step.id !== currentStep
            const stepIndex = steps.findIndex((s) => s.id === step.id)
            const currentIndex = steps.findIndex((s) => s.id === currentStep)

            return (
              <div key={step.id} className="flex-1">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center font-bold transition-all ${
                      isActive || isCompleted ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground"
                    }`}
                  >
                    {isCompleted ? <CheckCircle2 className="w-6 h-6" /> : step.icon}
                  </div>
                  <div className="flex-1 hidden sm:block">
                    <p className="text-sm font-medium">{step.title}</p>
                  </div>
                </div>
                {idx < steps.length - 1 && (
                  <div className={`h-1 ml-5 mt-2 rounded-full ${isCompleted ? "bg-primary" : "bg-border"}`} />
                )}
              </div>
            )
          })}
        </div>

        {/* Form Card */}
        <Card className="shadow-sm">
          <CardHeader>
            <CardTitle className="text-2xl">
              {currentStep === "personal" && "Tell us about yourself"}
              {currentStep === "subjects" && "What do you teach?"}
              {currentStep === "documents" && "Upload your credentials"}
              {currentStep === "review" && "Review your application"}
            </CardTitle>
            <CardDescription>
              {currentStep === "personal" && "We need some basic information"}
              {currentStep === "subjects" && "Select the subjects you're expert in"}
              {currentStep === "documents" && "Upload CV and degree certificates"}
              {currentStep === "review" && "Make sure everything is correct before submitting"}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-6">
            {error && (
              <div className="flex gap-3 p-4 rounded-lg bg-destructive/10 border border-destructive/20">
                <AlertCircle className="w-5 h-5 text-destructive flex-shrink-0 mt-0.5" />
                <p className="text-sm text-destructive">{error}</p>
              </div>
            )}

            {success && (
              <div className="flex gap-3 p-4 rounded-lg bg-secondary/10 border border-secondary/20">
                <CheckCircle2 className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5" />
                <p className="text-sm text-secondary">{success}</p>
              </div>
            )}

            {currentStep === "personal" && (
              <form className="space-y-5">
                <div className="grid md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="firstName">First Name</Label>
                    <Input
                      id="firstName"
                      name="firstName"
                      placeholder="John"
                      value={formData.firstName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="lastName">Last Name</Label>
                    <Input
                      id="lastName"
                      name="lastName"
                      placeholder="Doe"
                      value={formData.lastName}
                      onChange={handleChange}
                      required
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="email">Email Address</Label>
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    placeholder="john@example.com"
                    value={formData.email}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="phone">Phone Number</Label>
                  <Input
                    id="phone"
                    name="phone"
                    placeholder="+251 (0) 9xx xxx xxx"
                    value={formData.phone}
                    onChange={handleChange}
                    required
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    name="password"
                    type="password"
                    placeholder="••••••••"
                    value={formData.password}
                    onChange={handleChange}
                    required
                  />
                </div>
              </form>
            )}

            {currentStep === "subjects" && (
              <form className="space-y-6">
                <div className="space-y-3">
                  <Label>Subjects you can teach (select at least 1)</Label>
                  <div className="grid grid-cols-2 gap-3">
                    {[
                      "Mathematics",
                      "Physics",
                      "Chemistry",
                      "Biology",
                      "English",
                      "History",
                      "Geography",
                      "Computer Science",
                    ].map((subject) => (
                      <button
                        key={subject}
                        type="button"
                        onClick={() => handleSubjectToggle(subject)}
                        className={`p-3 rounded-lg border-2 transition-all text-sm font-medium ${
                          formData.subjects.includes(subject)
                            ? "border-primary bg-primary/10 text-primary"
                            : "border-border hover:border-primary/50"
                        }`}
                      >
                        {subject}
                      </button>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="skills">Skill Strengths</Label>
                  <textarea
                    id="skills"
                    name="skills"
                    placeholder="Describe your expertise, teaching style, and specializations..."
                    value={formData.skills}
                    onChange={handleChange}
                    className="w-full p-3 rounded-lg border border-border bg-background text-foreground text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50 min-h-32"
                    required
                  />
                </div>
              </form>
            )}

            {currentStep === "documents" && (
              <form className="space-y-6">
                <div className="space-y-2">
                  <Label htmlFor="cv">CV/Resume (PDF)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <input id="cv" name="cv" type="file" accept=".pdf" onChange={handleFileChange} className="hidden" />
                    <label htmlFor="cv" className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload CV</p>
                      <p className="text-xs text-muted-foreground">PDF files only, max 5MB</p>
                      {formData.cv && <p className="text-xs text-secondary mt-2">✓ {formData.cv.name}</p>}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="degree">Degree Certificate (PDF)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <input
                      id="degree"
                      name="degree"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="degree" className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload degree</p>
                      <p className="text-xs text-muted-foreground">PDF files only, max 5MB</p>
                      {formData.degree && <p className="text-xs text-secondary mt-2">✓ {formData.degree.name}</p>}
                    </label>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="certifications">Additional Certifications (Optional)</Label>
                  <div className="border-2 border-dashed border-border rounded-lg p-6 text-center cursor-pointer hover:bg-primary/5 transition-colors">
                    <input
                      id="certifications"
                      name="certifications"
                      type="file"
                      accept=".pdf"
                      onChange={handleFileChange}
                      className="hidden"
                    />
                    <label htmlFor="certifications" className="cursor-pointer block">
                      <Upload className="w-8 h-8 mx-auto mb-2 text-muted-foreground" />
                      <p className="text-sm font-medium">Click to upload certifications</p>
                      <p className="text-xs text-muted-foreground">PDF files only, max 5MB</p>
                      {formData.certifications && (
                        <p className="text-xs text-secondary mt-2">✓ {formData.certifications.name}</p>
                      )}
                    </label>
                  </div>
                </div>
              </form>
            )}

            {currentStep === "review" && (
              <div className="space-y-6">
                <div className="p-4 rounded-lg border border-secondary/20 bg-secondary/5 space-y-4">
                  <h3 className="font-semibold text-foreground">Personal Information</h3>
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">Name</p>
                      <p className="font-medium">
                        {formData.firstName} {formData.lastName}
                      </p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">Email</p>
                      <p className="font-medium">{formData.email}</p>
                    </div>
                    <div>
                      <p className="text-muted-foreground text-xs uppercase">Phone</p>
                      <p className="font-medium">{formData.phone}</p>
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-accent/20 bg-accent/5 space-y-4">
                  <h3 className="font-semibold text-foreground">Teaching Details</h3>
                  <div>
                    <p className="text-muted-foreground text-xs uppercase mb-2">Subjects</p>
                    <div className="flex flex-wrap gap-2">
                      {formData.subjects.map((subject) => (
                        <span
                          key={subject}
                          className="px-3 py-1 rounded-full bg-primary/10 text-primary text-xs font-medium"
                        >
                          {subject}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>

                <div className="p-4 rounded-lg border border-border bg-card space-y-4">
                  <h3 className="font-semibold text-foreground">Documents</h3>
                  <ul className="space-y-2 text-sm">
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span>CV: {formData.cv?.name}</span>
                    </li>
                    <li className="flex items-center gap-2">
                      <CheckCircle2 className="w-4 h-4 text-secondary" />
                      <span>Degree: {formData.degree?.name}</span>
                    </li>
                    {formData.certifications && (
                      <li className="flex items-center gap-2">
                        <CheckCircle2 className="w-4 h-4 text-secondary" />
                        <span>Certifications: {formData.certifications.name}</span>
                      </li>
                    )}
                  </ul>
                </div>

                <div className="p-4 rounded-lg border border-border bg-muted/50">
                  <p className="text-sm text-muted-foreground">
                    By submitting this application, you agree to our{" "}
                    <a href="#" className="text-primary hover:underline">
                      Terms of Service
                    </a>{" "}
                    and{" "}
                    <a href="#" className="text-primary hover:underline">
                      Privacy Policy
                    </a>
                  </p>
                </div>
              </div>
            )}

            {/* Action Buttons */}
            <div className="flex gap-3 pt-4">
              {currentStep !== "personal" && (
                <Button variant="outline" onClick={handlePrevious} className="flex-1 bg-transparent">
                  Previous
                </Button>
              )}
              {currentStep !== "review" && (
                <Button onClick={handleNext} className="flex-1">
                  Next
                  <ArrowRight className="w-4 h-4 ml-2" />
                </Button>
              )}
              {currentStep === "review" && (
                <Button onClick={handleSubmit} disabled={isLoading} className="flex-1">
                  {isLoading ? "Submitting..." : "Submit Application"}
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Sign In Link */}
        <p className="text-center text-sm text-muted-foreground">
          Already a tutor?{" "}
          <Link href="/login" className="text-primary hover:text-primary/80 font-semibold">
            Sign in here
          </Link>
        </p>
      </div>
    </div>
  )
}
