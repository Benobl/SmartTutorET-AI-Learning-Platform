"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { StudentSidebar } from "@/components/dashboards/student/sidebar"
import { StudentHeader } from "@/components/dashboards/student/header"
import { BookOpen, Video, FileText, Star, Filter, Search, Bookmark } from "lucide-react"
import { Input } from "@/components/ui/input"

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
    <div className="flex h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 overflow-auto">
        <StudentHeader />

        <main className="container px-4 md:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold text-foreground">Learning Resources</h1>
            <p className="text-muted-foreground">Curated videos, interactive lessons, PDFs, and digital books</p>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-muted-foreground" />
            <Input
              placeholder="Search resources..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 h-11 bg-input border-border focus-visible:border-primary"
            />
          </div>

          {/* Filters */}
          <div className="space-y-4">
            {/* Subject Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold flex items-center gap-2 text-foreground">
                <Filter className="w-4 h-4" />
                Filter by Subject
              </label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedSubject(null)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedSubject === null
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  All Subjects
                </button>
                {subjects.map((subject) => (
                  <button
                    key={subject}
                    onClick={() => setSelectedSubject(subject)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedSubject === subject
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {subject}
                  </button>
                ))}
              </div>
            </div>

            {/* Type Filter */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-foreground">Filter by Type</label>
              <div className="flex flex-wrap gap-2">
                <button
                  onClick={() => setSelectedType(null)}
                  className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                    selectedType === null
                      ? "bg-primary text-primary-foreground shadow-md"
                      : "bg-muted hover:bg-muted/80 text-foreground"
                  }`}
                >
                  All Types
                </button>
                {types.map((type) => (
                  <button
                    key={type.id}
                    onClick={() => setSelectedType(type.id)}
                    className={`px-4 py-2 rounded-full text-sm font-semibold transition-all ${
                      selectedType === type.id
                        ? "bg-primary text-primary-foreground shadow-md"
                        : "bg-muted hover:bg-muted/80 text-foreground"
                    }`}
                  >
                    {type.label}
                  </button>
                ))}
              </div>
            </div>
          </div>

          {/* Results Count */}
          <div className="text-sm text-muted-foreground font-medium">
            Showing <span className="text-primary font-bold">{filteredResources.length}</span> resources
          </div>

          {/* Resources Grid */}
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredResources.map((resource) => (
              <Card
                key={resource.id}
                onMouseEnter={() => setHoveredResource(resource.id)}
                onMouseLeave={() => setHoveredResource(null)}
                className="shadow-sm hover:shadow-md transition-all overflow-hidden border-border/60 hover:border-primary/30 hover:bg-card"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between mb-3">
                    <div className="w-11 h-11 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                      {typeIcons[resource.type as keyof typeof typeIcons]}
                    </div>
                    <Badge variant="secondary" className="text-xs font-semibold">
                      {resource.subject}
                    </Badge>
                  </div>
                  <CardTitle className="text-base font-bold line-clamp-2 text-foreground">{resource.title}</CardTitle>
                  <CardDescription className="text-xs mt-2 font-medium">{resource.instructor}</CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground font-medium">{resource.duration}</span>
                    <div className="flex items-center gap-1.5">
                      <Star className="w-4 h-4 text-accent fill-accent" />
                      <span className="font-bold text-foreground">{resource.rating}</span>
                    </div>
                  </div>

                  <div className="flex items-center justify-between text-xs text-muted-foreground font-semibold">
                    <span>{resource.downloads.toLocaleString()} downloads</span>
                    {resource.offline && (
                      <Badge variant="outline" className="text-xs font-bold">
                        Offline
                      </Badge>
                    )}
                  </div>

                  <div className="flex gap-2 pt-2">
                    <Button
                      className="flex-1 font-semibold text-sm"
                      size="sm"
                      onClick={() => {
                        /* Handle learn action */
                      }}
                    >
                      <BookOpen className="w-4 h-4 mr-2" />
                      Learn
                    </Button>
                    <Button
                      variant="outline"
                      className={`flex-1 bg-transparent font-semibold text-sm ${
                        savedResources.has(resource.id)
                          ? "border-primary/50 text-primary"
                          : "border-border/60 hover:border-primary/50"
                      }`}
                      size="sm"
                      onClick={() => toggleSave(resource.id)}
                    >
                      <Bookmark className={`w-4 h-4 mr-2 ${savedResources.has(resource.id) ? "fill-current" : ""}`} />
                      Save
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>

          {filteredResources.length === 0 && (
            <div className="text-center py-12 space-y-4">
              <BookOpen className="w-12 h-12 text-muted-foreground mx-auto opacity-50" />
              <h3 className="text-lg font-semibold text-foreground">No resources found</h3>
              <p className="text-muted-foreground">Try adjusting your search or filters</p>
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
