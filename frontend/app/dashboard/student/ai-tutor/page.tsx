"use client"

import type React from "react"

import { useState, useRef, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card } from "@/components/ui/card"
import { StudentSidebar } from "@/components/dashboards/student/sidebar"
import { StudentHeader } from "@/components/dashboards/student/header"
import { Send, Lightbulb, Brain, Loader } from "lucide-react"

interface Message {
  id: string
  role: "user" | "assistant"
  content: string
  timestamp: Date
}

const suggestedTopics = [
  { icon: "📐", label: "Quadratic Equations", subject: "Mathematics" },
  { icon: "🧬", label: "Cell Division & Mitosis", subject: "Biology" },
  { icon: "⚛️", label: "Chemical Bonding", subject: "Chemistry" },
  { icon: "🎭", label: "Shakespeare's Plays", subject: "English" },
]

export default function AITutorPage() {
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "1",
      role: "assistant",
      content:
        "Hello! I'm your AI Study Assistant. I can help you with homework, explain difficult concepts, and answer any academic questions. What would you like to learn about today?",
      timestamp: new Date(),
    },
  ])
  const [input, setInput] = useState("")
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!input.trim()) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: "user",
      content: input,
      timestamp: new Date(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput("")
    setIsLoading(true)

    // Simulate AI response delay
    setTimeout(() => {
      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: "assistant",
        content: `That's a great question about "${input}"! Let me help you understand this better. 

**Core Concept:** The fundamental principle you should understand first is the foundational idea that everything else builds upon.

**Practical Application:** In real-world scenarios, this concept is used in many ways. Here are some common examples that will help you understand how this works in practice.

**Common Mistakes:** Students often struggle with this part. Remember that the key is to avoid these common pitfalls.

**Practice Exercise:** Try applying this to a similar problem. This will help you solidify your understanding.

Would you like me to explain any of these points in more detail? I can also provide worked examples or create practice problems for you.`,
        timestamp: new Date(),
      }
      setMessages((prev) => [...prev, assistantMessage])
      setIsLoading(false)
    }, 1200)
  }

  const handleSuggestedTopic = (label: string) => {
    setInput(`Explain ${label}`)
  }

  return (
    <div className="flex h-screen bg-background">
      <StudentSidebar />

      <div className="flex-1 overflow-hidden flex flex-col">
        <StudentHeader />

        <div className="flex-1 overflow-auto flex flex-col">
          <main className="flex-1 container px-4 md:px-8 py-8 flex flex-col max-w-4xl mx-auto w-full">
            {messages.length === 1 ? (
              // Welcome State
              <div className="flex-1 flex flex-col items-center justify-center space-y-8 py-8">
                <div className="text-center space-y-4">
                  <div className="w-20 h-20 rounded-2xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center mx-auto shadow-md">
                    <Brain className="w-10 h-10 text-white" />
                  </div>
                  <h1 className="text-3xl md:text-4xl font-bold text-foreground">AI Study Assistant</h1>
                  <p className="text-muted-foreground max-w-2xl text-lg">
                    Get instant help with any subject, homework, or concept. Your AI tutor is here 24/7 to support your
                    learning.
                  </p>
                </div>

                {/* Suggested Topics */}
                <div className="w-full max-w-2xl space-y-4">
                  <p className="text-sm font-semibold text-muted-foreground text-center uppercase tracking-wide">
                    Popular Topics
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {suggestedTopics.map((topic, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSuggestedTopic(topic.label)}
                        className="p-4 rounded-xl border border-border hover:border-primary/50 hover:bg-primary/5 transition-all text-left group card-hover"
                      >
                        <div className="flex items-start gap-3">
                          <span className="text-2xl">{topic.icon}</span>
                          <div className="flex-1 space-y-1">
                            <p className="font-semibold text-sm group-hover:text-primary transition-colors text-foreground">
                              {topic.label}
                            </p>
                            <p className="text-xs text-muted-foreground font-medium">{topic.subject}</p>
                          </div>
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Tips */}
                <Card className="p-4 border-secondary/30 bg-gradient-to-br from-secondary/10 to-transparent max-w-2xl w-full shadow-sm">
                  <div className="flex gap-3">
                    <Lightbulb className="w-5 h-5 text-secondary flex-shrink-0 mt-0.5 font-bold" />
                    <div className="space-y-2">
                      <p className="font-semibold text-sm text-foreground">Pro Tips:</p>
                      <ul className="text-muted-foreground space-y-1.5 text-xs font-medium">
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-secondary"></span>
                          Ask follow-up questions for deeper understanding
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-secondary"></span>
                          Request worked examples or practice problems
                        </li>
                        <li className="flex items-center gap-2">
                          <span className="w-1 h-1 rounded-full bg-secondary"></span>
                          Ask for explanations of difficult concepts
                        </li>
                      </ul>
                    </div>
                  </div>
                </Card>
              </div>
            ) : (
              // Chat State
              <div className="flex-1 space-y-4 overflow-y-auto pb-6">
                {messages.map((message) => (
                  <div key={message.id} className={`flex ${message.role === "user" ? "justify-end" : "justify-start"}`}>
                    <div
                      className={`max-w-xs lg:max-w-md rounded-2xl px-4 py-3 shadow-sm animate-in fade-in ${
                        message.role === "user"
                          ? "bg-primary text-primary-foreground rounded-br-none"
                          : "bg-card border border-border rounded-bl-none"
                      }`}
                    >
                      <p className="text-sm leading-relaxed whitespace-pre-wrap text-pretty">{message.content}</p>
                      <p className={`text-xs mt-2 ${message.role === "user" ? "opacity-70" : "text-muted-foreground"}`}>
                        {message.timestamp.toLocaleTimeString([], {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </p>
                    </div>
                  </div>
                ))}
                {isLoading && (
                  <div className="flex justify-start">
                    <div className="bg-card border border-border rounded-2xl rounded-bl-none px-4 py-3 shadow-sm">
                      <div className="flex gap-2 items-center">
                        <Loader className="w-4 h-4 text-primary animate-spin" />
                        <span className="text-sm text-muted-foreground font-medium">AI is thinking...</span>
                      </div>
                    </div>
                  </div>
                )}
                <div ref={messagesEndRef} />
              </div>
            )}
          </main>

          {/* Input Area */}
          <div className="border-t border-border bg-card/80 backdrop-blur supports-[backdrop-filter]:bg-card/60">
            <div className="container px-4 md:px-8 py-4 max-w-4xl mx-auto w-full">
              <form onSubmit={handleSendMessage} className="flex gap-3">
                <Input
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  placeholder="Ask me anything about your studies..."
                  disabled={isLoading}
                  className="flex-1 h-11 bg-input border-border focus-visible:border-primary"
                />
                <Button
                  type="submit"
                  disabled={isLoading || !input.trim()}
                  size="icon"
                  className="h-11 w-11 font-semibold"
                >
                  <Send className="w-4 h-4" />
                </Button>
              </form>
              <p className="text-xs text-muted-foreground mt-3 text-center font-medium">
                AI Assistant can make mistakes. Always verify important information with your teacher or textbook.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
