"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { BookOpen, Video, FileText, Star, Filter, Search, Bookmark, Clock } from "lucide-react"
import { Input } from "@/components/ui/input"
import { cn } from "@/lib/utils"

const resources = [
  {
    id: 1,
    title: "Algebra Fundamentals - Complete Guide",
    type: "video",
    subject: "Mathematics",
    duration: "2.5 hours",
    rating: 4.8,
    downloads: 1250,
    instructor: "Dr. Alemayehu Tekle",
    offline: true,
    isSaved: false,
  },
  {
    id: 2,
    title: "Photosynthesis: From Light to Life",
    type: "interactive",
    subject: "Biology",
    duration: "45 minutes",
    rating: 4.9,
    downloads: 980,
    instructor: "Prof. Aster Gebre",
    offline: true,
    isSaved: false,
  },
  {
    id: 3,
    title: "Essay Writing Masterclass",
    type: "pdf",
    subject: "English",
    duration: "28 pages",
    rating: 4.7,
    downloads: 2100,
    instructor: "Sarah Johnson",
    offline: true,
    isSaved: false,
  },
  {
    id: 4,
    title: "Chemical Bonds: Theory & Practice",
    type: "video",
    subject: "Chemistry",
    duration: "1.8 hours",
    rating: 4.6,
    downloads: 750,
    instructor: "Dr. Kebede Mulatu",
    offline: false,
    isSaved: false,
  },
  {
    id: 5,
    title: "Physics Lab Experiments",
    type: "interactive",
    subject: "Physics",
    duration: "3 hours",
    rating: 4.9,
    downloads: 890,
    instructor: "Ahmed Hassan",
    offline: true,
    isSaved: false,
  },
  {
    id: 6,
    title: "African History Digital Book",
    type: "book",
    subject: "History",
    duration: "156 pages",
    rating: 4.8,
    downloads: 1520,
    instructor: "Dr. Hirut Tessema",
    offline: true,
    isSaved: false,
  },
]

const typeIcons = {
  video: <Video className="w-5 h-5" />,
  interactive: <BookOpen className="w-5 h-5" />,
  pdf: <FileText className="w-5 h-5" />,
  book: <BookOpen className="w-5 h-5" />,
}

export default function ResourcesPage() {
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null)
  const [selectedType, setSelectedType] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [savedResources, setSavedResources] = useState<Set<number>>(new Set())
  const [hoveredResource, setHoveredResource] = useState<number | null>(null)

  const subjects = ["Mathematics", "Biology", "Chemistry", "English", "Physics", "History"]
  const types = [
    { id: "video", label: "Videos" },
    { id: "interactive", label: "Interactive" },
    { id: "pdf", label: "PDFs" },
    { id: "book", label: "Books" },
  ]

  const filteredResources = resources.filter((resource) => {
    if (selectedSubject && resource.subject !== selectedSubject) return false
    if (selectedType && resource.type !== selectedType) return false
    if (searchQuery && !resource.title.toLowerCase().includes(searchQuery.toLowerCase())) return false
    return true
  })

  const toggleSave = (id: number) => {
    setSavedResources((prev) => {
      const newSet = new Set(prev)
      if (newSet.has(id)) newSet.delete(id)
      else newSet.add(id)
      return newSet
    })
  }

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700">
      {/* Page Header */}
      <div>
        <h1 className="text-3xl font-bold text-slate-900 mb-1">Learning Resources</h1>
        <p className="text-slate-500 text-sm font-medium">Curated videos, interactive lessons, PDFs, and digital books.</p>
      </div>

      {/* Search Bar */}
      <div className="relative group max-w-2xl">
        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-400 group-focus-within:text-sky-500 transition-colors" />
        <Input
          placeholder="Explore subjects, topics, or tutors..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-12 h-14 bg-white border-slate-200 rounded-[20px] shadow-sm focus-visible:ring-sky-500/20 focus-visible:border-sky-500 transition-all font-medium text-slate-900"
        />
        <div className="absolute right-4 top-1/2 -translate-y-1/2 flex items-center gap-2">
          <span className="text-[10px] font-bold text-slate-300 uppercase tracking-widest bg-slate-50 px-2 py-1 rounded-md border border-slate-100 uppercase hidden sm:block">Quick Search</span>
        </div>
      </div>

      {/* Filters */}
      <div className="space-y-6 pt-4">
        {/* Subject Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-4 bg-sky-500 rounded-full" />
            <label className="text-sm font-bold text-slate-600">Select Subject</label>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedSubject(null)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
                selectedSubject === null
                  ? "bg-sky-500 text-white border-sky-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              All Subjects
            </button>
            {subjects.map((subject) => (
              <button
                key={subject}
                onClick={() => setSelectedSubject(subject)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
                  selectedSubject === subject
                    ? "bg-sky-500 text-white border-sky-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}
              >
                {subject}
              </button>
            ))}
          </div>
        </div>

        {/* Type Filter */}
        <div className="space-y-3">
          <div className="flex items-center gap-3 px-1">
            <div className="w-1 h-4 bg-indigo-500 rounded-full" />
            <label className="text-sm font-bold text-slate-600">Material Type</label>
          </div>
          <div className="flex flex-wrap gap-2.5">
            <button
              onClick={() => setSelectedType(null)}
              className={cn(
                "px-5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
                selectedType === null
                  ? "bg-indigo-500 text-white border-indigo-600"
                  : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
              )}
            >
              All Formats
            </button>
            {types.map((type) => (
              <button
                key={type.id}
                onClick={() => setSelectedType(type.id)}
                className={cn(
                  "px-5 py-2 rounded-xl text-xs font-bold transition-all border shadow-sm",
                  selectedType === type.id
                    ? "bg-indigo-500 text-white border-indigo-600"
                    : "bg-white text-slate-500 border-slate-200 hover:bg-slate-50"
                )}
              >
                {type.label}
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Results Count */}
      <div className="flex items-center justify-between px-1">
        <div className="text-xs text-slate-400 font-bold uppercase tracking-widest">
          Library Archive • <span className="text-sky-600">{filteredResources.length} Found</span>
        </div>
        <div className="flex items-center gap-2">
          <button className="p-2 rounded-lg bg-white border border-slate-200 text-slate-400 hover:text-sky-500 hover:border-sky-200 transition-all shadow-sm">
            <Filter className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Resources Grid */}
      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredResources.map((resource) => (
          <Card
            key={resource.id}
            onMouseEnter={() => setHoveredResource(resource.id)}
            onMouseLeave={() => setHoveredResource(null)}
            className="rounded-[32px] shadow-sm hover:shadow-xl transition-all duration-500 overflow-hidden border-slate-200 hover:border-sky-200 hover:bg-card group"
          >
            <CardHeader className="pb-4 relative">
              <div className="absolute top-0 right-0 w-32 h-32 bg-sky-500/5 blur-3xl rounded-full" />
              <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="w-12 h-12 rounded-2xl bg-slate-50 border border-slate-100 text-sky-500 flex items-center justify-center shadow-sm group-hover:scale-110 group-hover:bg-sky-500 group-hover:text-white transition-all duration-500">
                  {typeIcons[resource.type as keyof typeof typeIcons]}
                </div>
                <Badge className="bg-sky-50 text-sky-600 border-sky-100 text-[10px] font-black uppercase tracking-widest rounded-lg px-2.5 py-1 shadow-sm">
                  {resource.subject}
                </Badge>
              </div>
              <CardTitle className="text-lg font-black line-clamp-2 text-slate-900 group-hover:text-sky-600 transition-colors leading-tight">{resource.title}</CardTitle>
              <CardDescription className="text-xs mt-2 font-bold text-slate-400 flex items-center gap-2">
                <div className="w-6 h-6 rounded-full bg-slate-100 flex items-center justify-center text-[10px] text-slate-500 font-black tracking-tighter shadow-inner">
                  {resource.instructor.split(' ').map(n => n[0]).join('')}
                </div>
                {resource.instructor}
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-5 relative z-10">
              <div className="flex items-center justify-between text-xs font-bold border-y border-slate-50 py-3">
                <div className="flex items-center gap-2 text-slate-500">
                  <Clock className="w-4 h-4 text-slate-300" />
                  {resource.duration}
                </div>
                <div className="flex items-center gap-1.5 px-2 py-1 bg-amber-50 rounded-lg border border-amber-100">
                  <Star className="w-4 h-4 text-amber-500 fill-amber-500" />
                  <span className="font-black text-amber-700">{resource.rating}</span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-2">
                <div className="text-[10px] text-slate-400 font-black uppercase tracking-widest flex items-center gap-2">
                  <FileText className="w-3.5 h-3.5" />
                  {resource.downloads.toLocaleString()} Accesses
                </div>
                {resource.offline && (
                  <div className="flex items-center gap-1 text-[9px] font-black text-emerald-600 uppercase tracking-widest bg-emerald-50 px-2 py-0.5 rounded-md border border-emerald-100">
                    <div className="w-1 h-1 bg-emerald-500 rounded-full animate-pulse" />
                    Offline Ready
                  </div>
                )}
              </div>

              <div className="flex gap-3 pt-2">
                <Button
                  className="flex-1 font-bold text-xs h-11 rounded-2xl bg-sky-500 hover:bg-sky-600 transition-all shadow-lg shadow-sky-500/20 group-hover:scale-[1.02]"
                  size="sm"
                  onClick={() => {/* Handle learn action */ }}
                >
                  <BookOpen className="w-4 h-4 mr-2" />
                  Study Now
                </Button>
                <button
                  className={cn(
                    "w-11 h-11 rounded-2xl flex items-center justify-center transition-all border shadow-sm",
                    savedResources.has(resource.id)
                      ? "bg-indigo-500 border-indigo-600 text-white shadow-indigo-500/20"
                      : "bg-white border-slate-200 text-slate-400 hover:border-indigo-200 hover:text-indigo-500"
                  )}
                  onClick={() => toggleSave(resource.id)}
                >
                  <Bookmark className={cn("w-5 h-5", savedResources.has(resource.id) ? "fill-current" : "")} />
                </button>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {filteredResources.length === 0 && (
        <div className="text-center py-24 space-y-4 bg-white border border-slate-200 rounded-[40px] shadow-sm">
          <div className="w-20 h-20 rounded-full bg-slate-50 flex items-center justify-center mx-auto mb-6 border border-slate-100">
            <Search className="w-10 h-10 text-slate-200" />
          </div>
          <h3 className="text-xl font-black text-slate-900">No resources found</h3>
          <p className="text-slate-400 font-bold text-sm">We couldn't find anything matching your search. <br />Try different terms or browse all subjects.</p>
          <button
            onClick={() => { setSearchQuery(""); setSelectedSubject(null); setSelectedType(null); }}
            className="text-sky-600 font-bold text-xs hover:underline mt-4"
          >
            Clear all filters
          </button>
        </div>
      )}
    </div>
  )
}
