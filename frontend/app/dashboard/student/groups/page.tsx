"use client"

import { useState } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { StudentSidebar } from "@/components/dashboards/student/sidebar"
import { StudentHeader } from "@/components/dashboards/student/header"
import { Users, Plus, MessageSquare, Video, Search } from "lucide-react"

const myGroups = [
  {
    id: 1,
    name: "Biology Warriors",
    members: 8,
    topic: "Human Anatomy & Physiology",
    avatar: "🧬",
    active: true,
    lastActivity: "2 hours ago",
  },
  {
    id: 2,
    name: "Math Enthusiasts",
    members: 12,
    topic: "Calculus & Algebra",
    avatar: "📐",
    active: true,
    lastActivity: "30 minutes ago",
  },
  {
    id: 3,
    name: "Chemistry Lab",
    members: 6,
    topic: "Organic Chemistry",
    avatar: "⚗️",
    active: false,
    lastActivity: "1 day ago",
  },
]

const suggestedGroups = [
  {
    id: 4,
    name: "Physics Forum",
    members: 15,
    topic: "Mechanics & Thermodynamics",
    avatar: "⚛️",
    joinable: true,
  },
  {
    id: 5,
    name: "English Literature Club",
    members: 10,
    topic: "Shakespeare & Modern Classics",
    avatar: "📖",
    joinable: true,
  },
  {
    id: 6,
    name: "History Explorers",
    members: 9,
    topic: "African & World History",
    avatar: "🏛️",
    joinable: true,
  },
]

export default function StudyGroupsPage() {
  const [searchQuery, setSearchQuery] = useState("")
  const [activeTab, setActiveTab] = useState<"my-groups" | "suggested">("my-groups")

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 overflow-auto">
        <StudentHeader />

        <main className="container px-4 md:px-8 py-8 space-y-8">
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-4xl font-bold">Study Groups</h1>
                <p className="text-muted-foreground">Learn together with peers and tutors</p>
              </div>
              <Button>
                <Plus className="w-4 h-4 mr-2" />
                Create Group
              </Button>
            </div>

            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
              <Input
                placeholder="Search groups by topic or name..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          <div className="flex gap-2 border-b border-border">
            <button
              onClick={() => setActiveTab("my-groups")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "my-groups"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Users className="w-4 h-4 inline mr-2" />
              My Groups ({myGroups.length})
            </button>
            <button
              onClick={() => setActiveTab("suggested")}
              className={`px-4 py-2 font-medium text-sm border-b-2 transition-colors ${
                activeTab === "suggested"
                  ? "border-primary text-primary"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              <Plus className="w-4 h-4 inline mr-2" />
              Suggested ({suggestedGroups.length})
            </button>
          </div>

          {activeTab === "my-groups" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {myGroups.map((group) => (
                <Card key={group.id} className="shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start justify-between">
                      <div className="flex items-center gap-3">
                        <div className="text-3xl">{group.avatar}</div>
                        <div>
                          <CardTitle className="text-lg">{group.name}</CardTitle>
                          <Badge variant={group.active ? "default" : "secondary"} className="text-xs mt-1">
                            {group.active ? "Active" : "Inactive"}
                          </Badge>
                        </div>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{group.topic}</p>
                      <p className="text-xs text-muted-foreground mt-1">Last active: {group.lastActivity}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{group.members} members</span>
                    </div>

                    <div className="flex gap-2 pt-2">
                      <Button className="flex-1" size="sm">
                        <MessageSquare className="w-4 h-4 mr-2" />
                        Chat
                      </Button>
                      <Button variant="outline" className="flex-1 bg-transparent" size="sm">
                        <Video className="w-4 h-4 mr-2" />
                        Video
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}

          {activeTab === "suggested" && (
            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {suggestedGroups.map((group) => (
                <Card key={group.id} className="shadow-sm hover:shadow-md transition-all overflow-hidden">
                  <CardHeader className="pb-3">
                    <div className="flex items-start gap-3">
                      <div className="text-3xl">{group.avatar}</div>
                      <div className="flex-1">
                        <CardTitle className="text-lg">{group.name}</CardTitle>
                        <Badge variant="outline" className="text-xs mt-1">
                          New Group
                        </Badge>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <p className="text-sm text-muted-foreground font-medium">{group.topic}</p>
                    </div>

                    <div className="flex items-center gap-2 text-sm">
                      <Users className="w-4 h-4 text-muted-foreground" />
                      <span>{group.members} members</span>
                    </div>

                    <Button className="w-full" size="sm">
                      Join Group
                    </Button>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </main>
      </div>
    </div>
  )
}
