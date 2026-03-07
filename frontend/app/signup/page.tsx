"use client"

import { useState } from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Eye, EyeOff, ArrowRight, ArrowLeft, Mail, Lock, User, GraduationCap, Users, BookOpen, Briefcase, Award, Calendar, BookMarked, School, Upload } from "lucide-react"

export default function SignupPage() {
  const router = useRouter()
  const [isLoading, setIsLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirm, setShowConfirm] = useState(false)
  const [userType, setUserType] = useState<"student" | "teacher">("student")

  // Student form data
  const [studentFormData, setStudentFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    grade: "",
    school: "",
    subject: "",
    learningGoals: ""
  })

  // Teacher form data
  const [teacherFormData, setTeacherFormData] = useState({
    email: "",
    password: "",
    confirmPassword: "",
    firstName: "",
    lastName: "",
    degree: "",
    fieldOfExpertise: "",
    yearsOfExperience: "",
    subject: "",
    availability: [] as string[],
    teachingLicense: "",
    examScore: "",
    degreeFile: null as File | null
  })

  const studentSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "History", "Geography", "Computer Science",
    "Economics", "Art", "Music", "Physical Education"
  ]

  const teacherSubjects = [
    "Mathematics", "Physics", "Chemistry", "Biology",
    "English", "History", "Geography", "Computer Science",
    "Economics", "Art", "Music", "Physical Education"
  ]

  const availabilityDays = ["Monday", "Tuesday", "Wednesday", "Thursday", "Friday", "Saturday", "Sunday"]
  const degrees = ["Bachelor's Degree", "Master's Degree", "PhD", "Diploma", "Teaching Certificate", "Other"]
  const experienceYears = ["0-2 years", "3-5 years", "6-10 years", "11-15 years", "15+ years"]

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // Form validation
    if (userType === "student") {
      if (studentFormData.password !== studentFormData.confirmPassword) {
        alert("Passwords don't match!")
        setIsLoading(false)
        return
      }
    } else {
      if (teacherFormData.password !== teacherFormData.confirmPassword) {
        alert("Passwords don't match!")
        setIsLoading(false)
        return
      }
    }

    // Simulate API call
    await new Promise(resolve => setTimeout(resolve, 1500))

    // Redirect based on user type
    if (userType === "student") {
      router.push("/dashboard/student")
    } else {
      router.push("/dashboard/teacher")
    }

    setIsLoading(false)
  }

  const handleStudentChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setStudentFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleTeacherChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setTeacherFormData(prev => ({
      ...prev,
      [e.target.name]: e.target.value
    }))
  }

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      // Check file type
      const validTypes = ['application/pdf', 'image/jpeg', 'image/png']
      if (!validTypes.includes(file.type)) {
        alert('Please upload a PDF, JPEG, or PNG file')
        return
      }

      // Check file size (5MB max)
      if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB')
        return
      }

      setTeacherFormData(prev => ({
        ...prev,
        degreeFile: file
      }))
    }
  }

  const toggleAvailability = (day: string) => {
    setTeacherFormData(prev => ({
      ...prev,
      availability: prev.availability.includes(day)
        ? prev.availability.filter(d => d !== day)
        : [...prev.availability, day]
    }))
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0A1929] via-[#1B5A6C] to-[#223347] flex items-center justify-center p-4 relative overflow-hidden">
      {/* Animated Background */}
      <div className="absolute inset-0 overflow-hidden">
        <div className="absolute top-0 left-0 w-96 h-96 bg-[#3D7FA2]/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-[#206687]/10 rounded-full blur-3xl animate-pulse" style={{ animationDelay: "1s" }}></div>
      </div>

      {/* Floating Elements */}
      <div className="absolute top-10 left-10 w-8 h-8 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 animate-float"></div>
      <div className="absolute bottom-10 right-10 w-12 h-12 rounded-xl bg-white/10 backdrop-blur-sm border border-white/20 animate-float" style={{ animationDelay: "1s" }}></div>

      {/* Signup Card Container */}
      <div className="relative w-full max-w-2xl">
        {/* Back to Home Button */}
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

        {/* Signup Card */}
        <div className="relative rounded-3xl bg-gradient-to-br from-white/5 to-white/0 backdrop-blur-lg p-2 shadow-2xl overflow-hidden group">
          {/* Glowing Border Effect */}
          <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2]/20 via-[#206687]/10 to-[#1B5A6C]/20 rounded-3xl blur-xl group-hover:blur-2xl transition-all duration-500"></div>
          <div className="absolute inset-0 border-2 border-transparent rounded-3xl bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] bg-clip-border p-[2px]">
            <div className="absolute inset-0 bg-gradient-to-r from-[#3D7FA2] via-[#206687] to-[#1B5A6C] rounded-3xl blur-lg opacity-50 group-hover:opacity-70 transition-opacity"></div>
          </div>

          {/* Form Content */}
          <div className="relative bg-gradient-to-br from-[#1B5A6C]/30 via-[#223347]/20 to-[#2E4360]/10 rounded-3xl p-8">
            {/* Header */}
            <div className="text-center mb-8">
              <div className="inline-flex items-center gap-3 justify-center mb-4">
                <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#3D7FA2] to-[#206687] flex items-center justify-center shadow-lg">
                  <Users className="w-7 h-7 text-white" />
                </div>
                <div className="text-left">
                  <h1 className="text-2xl font-bold bg-gradient-to-r from-white to-white/80 bg-clip-text text-transparent">
                    Join SmartTutorET
                  </h1>
                  <p className="text-sm text-white/60">
                    {userType === "student" ? "Start your learning journey" : "Share your knowledge and inspire"}
                  </p>
                </div>
              </div>
            </div>

            {/* User Type Selection */}
            <div className="mb-8">
              <p className="text-sm font-medium text-white mb-4">I'm signing up as...</p>
              <div className="grid grid-cols-2 gap-4">
                <button
                  type="button"
                  onClick={() => setUserType("student")}
                  className={`py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    userType === "student"
                    ? 'bg-gradient-to-r from-blue-500 to-cyan-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {userType === "student" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-500 to-cyan-500 opacity-50 blur-xl" />
                  )}
                  <div className="relative z-10">
                    <div className="text-2xl mb-2">👨‍🎓 Student</div>
                    <div className="text-xs opacity-80">Learn with expert tutors</div>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setUserType("teacher")}
                  className={`py-4 rounded-xl transition-all duration-300 relative overflow-hidden ${
                    userType === "teacher"
                    ? 'bg-gradient-to-r from-emerald-500 to-teal-500 text-white shadow-lg'
                    : 'bg-white/5 text-white/60 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {userType === "teacher" && (
                    <div className="absolute inset-0 bg-gradient-to-r from-emerald-500 to-teal-500 opacity-50 blur-xl" />
                  )}
                  <div className="relative z-10">
                    <div className="text-2xl mb-2">👨‍🏫 Teacher</div>
                    <div className="text-xs opacity-80">Teach and inspire students</div>
                  </div>
                </button>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Name Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    First Name *
                  </label>
                  <input
                    type="text"
                    name="firstName"
                    required
                    placeholder="John"
                    value={userType === "student" ? studentFormData.firstName : teacherFormData.firstName}
                    onChange={userType === "student" ? handleStudentChange : handleTeacherChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <User className="w-4 h-4" />
                    Last Name *
                  </label>
                  <input
                    type="text"
                    name="lastName"
                    required
                    placeholder="Doe"
                    value={userType === "student" ? studentFormData.lastName : teacherFormData.lastName}
                    onChange={userType === "student" ? handleStudentChange : handleTeacherChange}
                    disabled={isLoading}
                    className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                  />
                </div>
              </div>

              {/* Email Field */}
              <div className="space-y-2">
                <label className="text-sm font-medium text-white flex items-center gap-2">
                  <Mail className="w-4 h-4" />
                  Email Address *
                </label>
                <input
                  type="email"
                  name="email"
                  required
                  placeholder={userType === "student" ? "student@example.com" : "teacher@example.com"}
                  value={userType === "student" ? studentFormData.email : teacherFormData.email}
                  onChange={userType === "student" ? handleStudentChange : handleTeacherChange}
                  disabled={isLoading}
                  className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                />
              </div>

              {/* STUDENT SPECIFIC FIELDS */}
              {userType === "student" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Grade Level */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <GraduationCap className="w-4 h-4" />
                        Grade Level *
                      </label>
                      <select
                        name="grade"
                        value={studentFormData.grade}
                        onChange={handleStudentChange}
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                      >
                        <option value="">Select your grade</option>
                        {Array.from({ length: 12 }, (_, i) => i + 1).map((grade) => (
                          <option key={grade} value={grade}>
                            Grade {grade}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* School Name */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <School className="w-4 h-4" />
                        School Name
                      </label>
                      <input
                        type="text"
                        name="school"
                        placeholder="Enter your school name"
                        value={studentFormData.school}
                        onChange={handleStudentChange}
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                      />
                    </div>
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Main Subject of Interest *
                    </label>
                    <select
                      name="subject"
                      value={studentFormData.subject}
                      onChange={handleStudentChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                    >
                      <option value="">Select a subject</option>
                      {studentSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Learning Goals */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Learning Goals (Optional)
                    </label>
                    <textarea
                      name="learningGoals"
                      placeholder="What are your learning objectives?"
                      value={studentFormData.learningGoals}
                      onChange={handleStudentChange}
                      disabled={isLoading}
                      rows={2}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15 resize-none"
                    />
                  </div>
                </>
              )}

              {/* TEACHER SPECIFIC FIELDS */}
              {userType === "teacher" && (
                <>
                  <div className="grid grid-cols-2 gap-4">
                    {/* Degree Level */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <BookMarked className="w-4 h-4" />
                        Highest Degree *
                      </label>
                      <select
                        name="degree"
                        value={teacherFormData.degree}
                        onChange={handleTeacherChange}
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                      >
                        <option value="">Select degree</option>
                        {degrees.map((degree) => (
                          <option key={degree} value={degree}>
                            {degree}
                          </option>
                        ))}
                      </select>
                    </div>

                    {/* Years of Experience */}
                    <div className="space-y-2">
                      <label className="text-sm font-medium text-white flex items-center gap-2">
                        <Briefcase className="w-4 h-4" />
                        Years of Experience *
                      </label>
                      <select
                        name="yearsOfExperience"
                        value={teacherFormData.yearsOfExperience}
                        onChange={handleTeacherChange}
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                      >
                        <option value="">Select experience</option>
                        {experienceYears.map((years) => (
                          <option key={years} value={years}>
                            {years}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>

                  {/* Field of Expertise */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Briefcase className="w-4 h-4" />
                      Field of Expertise *
                    </label>
                    <input
                      type="text"
                      name="fieldOfExpertise"
                      placeholder="e.g., Mathematics, Physics, Computer Science"
                      value={teacherFormData.fieldOfExpertise}
                      onChange={handleTeacherChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                    />
                  </div>

                  {/* Subject Selection */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <BookOpen className="w-4 h-4" />
                      Main Subject to Teach *
                    </label>
                    <select
                      name="subject"
                      value={teacherFormData.subject}
                      onChange={handleTeacherChange}
                      required
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                    >
                      <option value="">Select a subject</option>
                      {teacherSubjects.map((subject) => (
                        <option key={subject} value={subject}>
                          {subject}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Degree Upload */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Upload className="w-4 h-4" />
                      Upload Degree Certificate *
                    </label>
                    <div className="relative">
                      <input
                        type="file"
                        accept=".pdf,.jpg,.jpeg,.png"
                        onChange={handleFileUpload}
                        required
                        disabled={isLoading}
                        className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white file:mr-4 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-sm file:font-medium file:bg-emerald-500 file:text-white hover:file:bg-emerald-600 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300"
                      />
                      {teacherFormData.degreeFile && (
                        <div className="mt-2 text-sm text-emerald-400 flex items-center gap-2">
                          ✓ Uploaded: {teacherFormData.degreeFile.name}
                        </div>
                      )}
                      <p className="mt-1 text-xs text-white/60">
                        Upload PDF, JPG, or PNG files (Max 5MB)
                      </p>
                    </div>
                  </div>

                  {/* Teaching License */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Teaching License/Certification (Optional)
                    </label>
                    <input
                      type="text"
                      name="teachingLicense"
                      placeholder="License number or certification"
                      value={teacherFormData.teachingLicense}
                      onChange={handleTeacherChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                    />
                  </div>

                  {/* Exam Score */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Award className="w-4 h-4" />
                      Qualification Exam Score (Optional)
                    </label>
                    <input
                      type="number"
                      name="examScore"
                      min="0"
                      max="100"
                      placeholder="Enter your exam score (0-100)"
                      value={teacherFormData.examScore}
                      onChange={handleTeacherChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm transition-all duration-300 focus:bg-white/15"
                    />
                  </div>

                  {/* Availability */}
                  <div className="space-y-2">
                    <label className="text-sm font-medium text-white flex items-center gap-2">
                      <Calendar className="w-4 h-4" />
                      Teaching Availability (Select all that apply)
                    </label>
                    <div className="flex flex-wrap gap-2">
                      {availabilityDays.map((day) => (
                        <button
                          key={day}
                          type="button"
                          onClick={() => toggleAvailability(day)}
                          className={`px-4 py-2 rounded-lg text-sm transition-all duration-300 ${
                            teacherFormData.availability.includes(day)
                              ? 'bg-teal-500 text-white'
                              : 'bg-white/5 text-white/60 hover:bg-white/10 hover:text-white'
                          }`}
                        >
                          {day}
                        </button>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {/* Password Fields */}
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showPassword ? "text" : "password"}
                      name="password"
                      required
                      minLength={6}
                      placeholder="Minimum 6 characters"
                      value={userType === "student" ? studentFormData.password : teacherFormData.password}
                      onChange={userType === "student" ? handleStudentChange : handleTeacherChange}
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

                <div className="space-y-2">
                  <label className="text-sm font-medium text-white flex items-center gap-2">
                    <Lock className="w-4 h-4" />
                    Confirm Password *
                  </label>
                  <div className="relative">
                    <input
                      type={showConfirm ? "text" : "password"}
                      name="confirmPassword"
                      required
                      minLength={6}
                      placeholder="Confirm your password"
                      value={userType === "student" ? studentFormData.confirmPassword : teacherFormData.confirmPassword}
                      onChange={userType === "student" ? handleStudentChange : handleTeacherChange}
                      disabled={isLoading}
                      className="w-full px-4 py-3 rounded-xl bg-white/10 border border-white/20 text-white placeholder-white/40 focus:outline-none focus:ring-2 focus:ring-[#3D7FA2] backdrop-blur-sm pr-12 transition-all duration-300 focus:bg-white/15"
                    />
                    <button
                      type="button"
                      onClick={() => setShowConfirm(!showConfirm)}
                      className="absolute right-3 top-1/2 transform -translate-y-1/2 text-white/40 hover:text-white/60 transition-colors"
                    >
                      {showConfirm ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                    </button>
                  </div>
                </div>
              </div>

              {/* Terms Agreement */}
              <label className="flex items-start gap-3 cursor-pointer group">
                <div className="relative mt-1">
                  <input
                    type="checkbox"
                    required
                    className="sr-only"
                  />
                  <div className="w-5 h-5 rounded-md bg-white/10 border border-white/20 group-hover:border-[#3D7FA2] transition-all duration-300 flex items-center justify-center">
                    <div className="w-3 h-3 rounded bg-[#3D7FA2] opacity-0 group-has-[:checked]:opacity-100 transition-opacity"></div>
                  </div>
                </div>
                <span className="text-sm text-white/60 group-hover:text-white/80 transition-colors">
                  I agree to the{" "}
                  <a href="/terms" className="text-[#3D7FA2] hover:text-[#206687] font-semibold transition-colors">
                    Terms of Service
                  </a>{" "}
                  and{" "}
                  <a href="/privacy" className="text-[#3D7FA2] hover:text-[#206687] font-semibold transition-colors">
                    Privacy Policy
                  </a>
                </span>
              </label>

              {/* Submit Button */}
              <Button
                type="submit"
                disabled={isLoading}
                className={`w-full rounded-xl text-white border-0 shadow-lg hover:shadow-xl py-4 transition-all duration-300 group relative overflow-hidden ${
                  userType === "student"
                    ? "bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600"
                    : "bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-600 hover:to-teal-600"
                }`}
              >
                <div className={`absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  userType === "student"
                    ? "bg-gradient-to-r from-blue-600 to-cyan-600"
                    : "bg-gradient-to-r from-emerald-600 to-teal-600"
                }`}></div>
                <span className="relative z-10 flex items-center justify-center gap-2">
                  {isLoading ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white/20 border-t-white rounded-full animate-spin" />
                      Creating {userType} Account...
                    </>
                  ) : (
                    <>
                      Create {userType === "student" ? "Student" : "Teacher"} Account
                      <ArrowRight className="w-4 h-4 group-hover:translate-x-1 transition-transform" />
                    </>
                  )}
                </span>
              </Button>

              {/* Sign In Link */}
              <div className="text-center pt-4">
                <p className="text-white/60 text-sm">
                  Already have an account?{" "}
                  <Link href="/login" className="text-[#3D7FA2] hover:text-[#206687] font-semibold transition-colors">
                    Sign in
                  </Link>
                </p>
              </div>
            </form>
          </div>
        </div>

        {/* Footer */}
        <div className="mt-6 text-center">
          <p className="text-xs text-white/40">
            By signing up, you agree to our{" "}
            <a href="/terms" className="text-white/60 hover:text-white transition-colors">
              Terms
            </a>{" "}
            and{" "}
            <a href="/privacy" className="text-white/60 hover:text-white transition-colors">
              Privacy Policy
            </a>
          </p>
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

        select {
          background-image: url("data:image/svg+xml,%3Csvg xmlns='http://www.w3.org/2000/svg' width='16' height='16' viewBox='0 0 24 24' fill='none' stroke='%23ffffff' stroke-width='2' stroke-linecap='round' stroke-linejoin='round'%3E%3Cpath d='m6 9 6 6 6-6'/%3E%3C/svg%3E");
          background-repeat: no-repeat;
          background-position: right 1rem center;
          background-size: 16px;
          padding-right: 3rem;
        }

        /* Custom file input styling */
        input[type="file"]::-webkit-file-upload-button {
          background-color: #10b981;
          color: white;
          padding: 8px 16px;
          border-radius: 8px;
          border: none;
          cursor: pointer;
        }

        input[type="file"]::-webkit-file-upload-button:hover {
          background-color: #059669;
        }
      `}</style>
    </div>
  )
}
