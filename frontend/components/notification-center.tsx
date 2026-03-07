"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { X, MessageSquare, CheckCircle2, AlertCircle, Info, Trash2 } from "lucide-react"

interface Notification {
  id: string
  type: "success" | "warning" | "error" | "info"
  title: string
  message: string
  timestamp: Date
  read: boolean
  action?: { label: string; href: string }
}

const notificationIcons = {
  success: <CheckCircle2 className="w-5 h-5" />,
  warning: <AlertCircle className="w-5 h-5" />,
  error: <AlertCircle className="w-5 h-5" />,
  info: <Info className="w-5 h-5" />,
}

const notificationColors = {
  success: "text-secondary",
  warning: "text-accent",
  error: "text-destructive",
  info: "text-primary",
}

export function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: "1",
      type: "success",
      title: "Session Completed",
      message: "Your tutoring session with Sarah Johnson was excellent. Rate this session.",
      timestamp: new Date(Date.now() - 5 * 60000),
      read: false,
      action: { label: "Rate Now", href: "#" },
    },
    {
      id: "2",
      type: "info",
      title: "New Study Material",
      message: "Algebra Fundamentals - Part 2 is now available in your learning hub.",
      timestamp: new Date(Date.now() - 20 * 60000),
      read: false,
    },
    {
      id: "3",
      type: "warning",
      title: "Application Status Update",
      message: "Your application status changed to 'Interview Scheduled'. Check your email for details.",
      timestamp: new Date(Date.now() - 2 * 60 * 60000),
      read: true,
    },
    {
      id: "4",
      type: "success",
      title: "Achievement Unlocked",
      message: "🏆 You earned the 'Speed Learner' badge! You completed 5 lessons today.",
      timestamp: new Date(Date.now() - 5 * 60 * 60000),
      read: true,
    },
  ])

  const [isOpen, setIsOpen] = useState(false)

  const unreadCount = notifications.filter((n) => !n.read).length

  const handleMarkAsRead = (id: string) => {
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)))
  }

  const handleDelete = (id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id))
  }

  return (
    <div className="relative">
      {/* Notification Bell */}
      <button onClick={() => setIsOpen(!isOpen)} className="relative p-2 hover:bg-muted rounded-lg transition-colors">
        <MessageSquare className="w-5 h-5" />
        {unreadCount > 0 && (
          <span className="absolute top-1 right-1 w-4 h-4 rounded-full bg-destructive text-white text-xs flex items-center justify-center font-bold">
            {unreadCount}
          </span>
        )}
      </button>

      {/* Notification Panel */}
      {isOpen && (
        <>
          <div className="fixed inset-0 z-40 md:hidden" onClick={() => setIsOpen(false)} />
          <div className="absolute right-0 top-12 w-96 max-w-[90vw] z-50">
            <Card className="shadow-lg rounded-lg">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
                <CardTitle>Notifications</CardTitle>
                <button onClick={() => setIsOpen(false)} className="p-1 hover:bg-muted rounded transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </CardHeader>

              <CardContent className="space-y-3 max-h-96 overflow-y-auto">
                {notifications.length === 0 ? (
                  <p className="text-sm text-muted-foreground text-center py-8">No notifications yet</p>
                ) : (
                  notifications.map((notif) => (
                    <div
                      key={notif.id}
                      className={`p-3 rounded-lg border transition-all ${
                        notif.read ? "border-border bg-card/50" : "border-primary/30 bg-primary/5"
                      }`}
                    >
                      <div className="flex gap-3">
                        <div className={`flex-shrink-0 ${notificationColors[notif.type]}`}>
                          {notificationIcons[notif.type]}
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="flex items-start justify-between gap-2">
                            <h4 className="font-semibold text-sm">{notif.title}</h4>
                            <button
                              onClick={() => handleDelete(notif.id)}
                              className="flex-shrink-0 p-1 hover:bg-muted rounded transition-colors"
                            >
                              <Trash2 className="w-3 h-3" />
                            </button>
                          </div>
                          <p className="text-xs text-muted-foreground mt-1">{notif.message}</p>
                          <div className="flex items-center justify-between mt-2">
                            <span className="text-xs text-muted-foreground">
                              {notif.timestamp.toLocaleTimeString([], {
                                hour: "2-digit",
                                minute: "2-digit",
                              })}
                            </span>
                            {notif.action && (
                              <Button
                                size="sm"
                                variant="link"
                                className="h-auto p-0"
                                onClick={() => handleMarkAsRead(notif.id)}
                              >
                                {notif.action.label}
                              </Button>
                            )}
                          </div>
                        </div>
                      </div>
                    </div>
                  ))
                )}
              </CardContent>
            </Card>
          </div>
        </>
      )}
    </div>
  )
}
