"use client"

import type React from "react"
import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { StudentSidebar } from "@/components/dashboards/student/sidebar"
import { StudentHeader } from "@/components/dashboards/student/header"
import { Send, Search, Phone, Video, Info } from "lucide-react"

interface Message {
  id: string
  sender: string
  content: string
  timestamp: Date
  isOwn: boolean
  avatar: string
}

interface Conversation {
  id: string
  name: string
  avatar: string
  status: "online" | "offline"
  lastMessage: string
  timestamp: Date
  unread: boolean
}

const conversations: Conversation[] = [
  {
    id: "1",
    name: "Sarah Johnson",
    avatar: "👩‍🏫",
    status: "online",
    lastMessage: "Great work on that last assignment!",
    timestamp: new Date(Date.now() - 5 * 60000),
    unread: true,
  },
  {
    id: "2",
    name: "Abebe Tadesse",
    avatar: "👨‍🎓",
    status: "online",
    lastMessage: "Want to study together tomorrow?",
    timestamp: new Date(Date.now() - 20 * 60000),
    unread: true,
  },
  {
    id: "3",
    name: "Ahmed Hassan",
    avatar: "👨‍🏫",
    status: "offline",
    lastMessage: "Your quiz score is 95/100",
    timestamp: new Date(Date.now() - 2 * 60 * 60000),
    unread: false,
  },
  {
    id: "4",
    name: "Marta Bekele",
    avatar: "👩‍🎓",
    status: "offline",
    lastMessage: "Thanks for helping with the project",
    timestamp: new Date(Date.now() - 5 * 60 * 60000),
    unread: false,
  },
]

const initialMessages: Message[] = [
  {
    id: "1",
    sender: "Sarah Johnson",
    content: "Hi! How are you progressing with the Mathematics course?",
    timestamp: new Date(Date.now() - 30 * 60000),
    isOwn: false,
    avatar: "👩‍🏫",
  },
  {
    id: "2",
    sender: "You",
    content: "Hi Sarah! It's going really well. I finished the algebra module and scored 92%!",
    timestamp: new Date(Date.now() - 25 * 60000),
    isOwn: true,
    avatar: "👨‍🎓",
  },
  {
    id: "3",
    sender: "Sarah Johnson",
    content: "That's fantastic! Your dedication is really showing. Ready to move to calculus?",
    timestamp: new Date(Date.now() - 20 * 60000),
    isOwn: false,
    avatar: "👩‍🏫",
  },
  {
    id: "4",
    sender: "You",
    content: "Yes, definitely! When can we schedule a session?",
    timestamp: new Date(Date.now() - 15 * 60000),
    isOwn: true,
    avatar: "👨‍🎓",
  },
  {
    id: "5",
    sender: "Sarah Johnson",
    content: "Great work on that last assignment!",
    timestamp: new Date(Date.now() - 5 * 60000),
    isOwn: false,
    avatar: "👩‍🏫",
  },
]

export default function MessagesPage() {
  const [selectedConversation, setSelectedConversation] = useState<Conversation | null>(conversations[0])
  const [messages, setMessages] = useState<Message[]>(initialMessages)
  const [input, setInput] = useState("")
  const [searchQuery, setSearchQuery] = useState("")
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const newMessage: Message = {
      id: Date.now().toString(),
      sender: "You",
      content: input,
      timestamp: new Date(),
      isOwn: true,
      avatar: "👨‍🎓",
    }

    setMessages((prev) => [...prev, newMessage])
    setInput("")

    setTimeout(() => {
      const reply: Message = {
        id: (Date.now() + 1).toString(),
        sender: selectedConversation?.name || "User",
        content: "That sounds great! Let's schedule a session for next week.",
        timestamp: new Date(),
        isOwn: false,
        avatar: selectedConversation?.avatar || "👨",
      }
      setMessages((prev) => [...prev, reply])
    }, 1500)
  }

  const filteredConversations = conversations.filter(
    (c) =>
      c.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      c.lastMessage.toLowerCase().includes(searchQuery.toLowerCase()),
  )

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 overflow-hidden flex flex-col">
        <StudentHeader />

        <div className="flex-1 overflow-hidden flex">
          <div className="w-64 border-r border-border flex flex-col bg-card/50">
            <div className="p-4 border-b border-border">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <input
                  type="search"
                  placeholder="Search messages..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-lg border border-border bg-background text-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/50"
                />
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              {filteredConversations.map((conv) => (
                <button
                  key={conv.id}
                  onClick={() => setSelectedConversation(conv)}
                  className={`w-full p-4 border-b border-border text-left transition-colors hover:bg-muted ${
                    selectedConversation?.id === conv.id ? "bg-primary/10" : ""
                  }`}
                >
                  <div className="flex items-start gap-3">
                    <div className="relative flex-shrink-0">
                      <div className="text-2xl">{conv.avatar}</div>
                      <div
                        className={`absolute bottom-0 right-0 w-3 h-3 rounded-full border-2 border-card ${
                          conv.status === "online" ? "bg-secondary" : "bg-muted"
                        }`}
                      />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className={`font-medium text-sm ${conv.unread ? "font-semibold" : ""}`}>{conv.name}</p>
                      <p className="text-xs text-muted-foreground truncate">{conv.lastMessage}</p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {conv.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                      </p>
                    </div>
                    {conv.unread && <div className="w-2 h-2 rounded-full bg-primary flex-shrink-0 mt-2" />}
                  </div>
                </button>
              ))}
            </div>
          </div>

          {selectedConversation ? (
            <div className="flex-1 flex flex-col">
              <div className="border-b border-border bg-card/80 backdrop-blur p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="text-3xl">{selectedConversation.avatar}</div>
                  <div>
                    <h2 className="font-semibold">{selectedConversation.name}</h2>
                    <p className="text-xs text-muted-foreground">
                      {selectedConversation.status === "online" ? "Active now" : "Offline"}
                    </p>
                  </div>
                </div>
                <div className="flex gap-2">
                  <Button size="icon" variant="ghost">
                    <Phone className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Video className="w-5 h-5" />
                  </Button>
                  <Button size="icon" variant="ghost">
                    <Info className="w-5 h-5" />
                  </Button>
                </div>
              </div>

              <div className="flex-1 overflow-y-auto p-6 space-y-4">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.isOwn ? "justify-end" : "justify-start"}`}>
                    <div className={`flex gap-2 max-w-xs ${message.isOwn ? "flex-row-reverse" : "flex-row"}`}>
                      <div className="text-2xl flex-shrink-0">{message.avatar}</div>
                      <div>
                        <div
                          className={`rounded-lg px-4 py-2 ${
                            message.isOwn
                              ? "bg-primary text-primary-foreground"
                              : "bg-muted text-foreground rounded-bl-none"
                          }`}
                        >
                          <p className="text-sm">{message.content}</p>
                        </div>
                        <p className="text-xs text-muted-foreground mt-1">
                          {message.timestamp.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })}
                        </p>
                      </div>
                    </div>
                  </div>
                ))}
                <div ref={messagesEndRef} />
              </div>

              <div className="border-t border-border bg-card/80 backdrop-blur p-4">
                <form onSubmit={handleSendMessage} className="flex gap-3">
                  <Input
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    placeholder="Type a message..."
                    className="flex-1"
                  />
                  <Button type="submit" size="icon">
                    <Send className="w-4 h-4" />
                  </Button>
                </form>
              </div>
            </div>
          ) : (
            <div className="flex-1 flex items-center justify-center">
              <p className="text-muted-foreground">Select a conversation to start chatting</p>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}
