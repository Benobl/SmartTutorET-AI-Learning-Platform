"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { StudentSidebar } from "@/components/dashboards/student/sidebar"
import { StudentHeader } from "@/components/dashboards/student/header"
import { Trophy, Star, Zap } from "lucide-react"

const achievements = [
  {
    id: 1,
    icon: "🏅",
    title: "First Steps",
    description: "Complete your first study session",
    unlocked: true,
    unlockedDate: "2024-01-05",
    progress: 100,
  },
  {
    id: 2,
    icon: "🔥",
    title: "7-Day Streak",
    description: "Study for 7 consecutive days",
    unlocked: true,
    unlockedDate: "2024-01-12",
    progress: 100,
  },
  {
    id: 3,
    icon: "⭐",
    title: "Perfect Score",
    description: "Get 100% on a quiz",
    unlocked: false,
    progress: 60,
  },
  {
    id: 4,
    icon: "🚀",
    title: "Speed Learner",
    description: "Complete 5 lessons in one day",
    unlocked: false,
    progress: 40,
  },
  {
    id: 5,
    icon: "🤝",
    title: "Team Player",
    description: "Join a study group",
    unlocked: true,
    unlockedDate: "2024-01-10",
    progress: 100,
  },
  {
    id: 6,
    icon: "🏆",
    title: "Top Scorer",
    description: "Rank in top 10 of leaderboard",
    unlocked: false,
    progress: 75,
  },
  {
    id: 7,
    icon: "📚",
    title: "Book Worm",
    description: "Read 10 learning materials",
    unlocked: false,
    progress: 60,
  },
  {
    id: 8,
    icon: "🎯",
    title: "Goal Master",
    description: "Complete all monthly goals",
    unlocked: false,
    progress: 80,
  },
]

const badges = [
  { icon: "🥇", label: "Math Master", students: "Top 5% in Mathematics" },
  { icon: "🧪", label: "Science Ace", students: "Top 10% in Sciences" },
  { icon: "📖", label: "Language Expert", students: "Advanced English Proficiency" },
  { icon: "💪", label: "Consistency King", students: "7+ Day Study Streak" },
]

export default function AchievementsPage() {
  const unlockedCount = achievements.filter((a) => a.unlocked).length
  const totalPoints = unlockedCount * 150

  return (
    <div className="flex h-screen bg-background">
      {/* Sidebar */}
      <StudentSidebar />

      {/* Main Content */}
      <div className="flex-1 overflow-auto">
        {/* Header */}
        <StudentHeader />

        {/* Achievements Content */}
        <main className="container px-4 md:px-8 py-8 space-y-8">
          {/* Page Header */}
          <div className="space-y-4">
            <h1 className="text-4xl font-bold">Achievements & Badges</h1>
            <p className="text-muted-foreground">Track your progress and celebrate your learning milestones</p>
          </div>

          {/* Stats */}
          <div className="grid md:grid-cols-3 gap-4">
            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Achievements Unlocked</p>
                    <p className="text-3xl font-bold mt-2">
                      {unlockedCount}/{achievements.length}
                    </p>
                  </div>
                  <Trophy className="w-12 h-12 text-accent" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Total Points</p>
                    <p className="text-3xl font-bold mt-2">{totalPoints}</p>
                  </div>
                  <Star className="w-12 h-12 text-primary" />
                </div>
              </CardContent>
            </Card>

            <Card className="shadow-sm">
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground font-medium">Badges Earned</p>
                    <p className="text-3xl font-bold mt-2">{badges.length}</p>
                  </div>
                  <Zap className="w-12 h-12 text-secondary" />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Badges Section */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Special Badges</CardTitle>
              <CardDescription>Earned through exceptional performance</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
                {badges.map((badge, idx) => (
                  <div
                    key={idx}
                    className="p-4 rounded-lg border border-border text-center space-y-3 hover:shadow-sm transition-all"
                  >
                    <div className="text-4xl">{badge.icon}</div>
                    <h3 className="font-semibold">{badge.label}</h3>
                    <p className="text-xs text-muted-foreground">{badge.students}</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Achievements Grid */}
          <div className="space-y-6">
            <h2 className="text-2xl font-bold">All Achievements</h2>
            <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-4">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`shadow-sm transition-all ${
                    achievement.unlocked
                      ? "border-primary/30 bg-gradient-to-br from-primary/5 to-transparent"
                      : "opacity-75 border-border"
                  }`}
                >
                  <CardContent className="p-6 space-y-4">
                    <div className="flex items-start justify-between">
                      <div className="text-4xl">{achievement.icon}</div>
                      {achievement.unlocked && <Badge>Unlocked</Badge>}
                    </div>

                    <div className="space-y-2">
                      <h3 className="font-semibold">{achievement.title}</h3>
                      <p className="text-sm text-muted-foreground">{achievement.description}</p>
                    </div>

                    <div className="space-y-2">
                      <Progress value={achievement.progress} className="h-2" />
                      <p className="text-xs text-muted-foreground text-right">{achievement.progress}%</p>
                    </div>

                    {achievement.unlocked && (
                      <p className="text-xs text-primary font-medium">Unlocked {achievement.unlockedDate}</p>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Leaderboard Preview */}
          <Card className="shadow-sm">
            <CardHeader>
              <CardTitle>Weekly Leaderboard</CardTitle>
              <CardDescription>Top 5 performers this week</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {[
                  { rank: 1, name: "Abebe Tadesse", points: 2450, badge: "🥇" },
                  { rank: 2, name: "Marta Bekele", points: 2320, badge: "🥈" },
                  { rank: 3, name: "Yohannes Kemal", points: 2180, badge: "🥉" },
                  { rank: 4, name: "You", points: 1850, badge: "4️⃣" },
                  { rank: 5, name: "Hirut Dessie", points: 1720, badge: "5️⃣" },
                ].map((student) => (
                  <div key={student.rank} className="flex items-center gap-4 p-3 rounded-lg border border-border">
                    <span className="text-2xl">{student.badge}</span>
                    <div className="flex-1">
                      <p className="font-medium">{student.name}</p>
                      <p className="text-sm text-muted-foreground">Position #{student.rank}</p>
                    </div>
                    <p className="text-lg font-bold text-primary">{student.points} pts</p>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </main>
      </div>
    </div>
  )
}
