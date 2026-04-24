"use client"

import { Button } from "@/components/ui/button"
import { Bell, Search, User, Menu, ChevronDown } from "lucide-react"
import { useState } from "react"

export function StudentHeader() {
  const [isSearchOpen, setIsSearchOpen] = useState(false)

  return (
    <>
      <header className="sticky top-0 z-[100] w-full border-b border-slate-200/40 bg-white/70 backdrop-blur-md">
        <div className="flex h-16 items-center justify-between px-4 sm:px-6 lg:px-8">
          {/* Mobile menu button - visible on mobile */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            aria-label="Menu"
          >
            <Menu className="h-5 w-5" />
          </Button>

          {/* Logo/Brand - visible on mobile, hidden on larger screens */}
          <div className="flex items-center gap-2 md:hidden">
            <span className="font-semibold text-lg bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
              StudentHub
            </span>
          </div>

          {/* Search section - desktop */}
          <div className="hidden md:flex md:flex-1 md:max-w-2xl lg:max-w-3xl">
            <div className="relative w-full group">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground transition-colors group-focus-within:text-primary" />
              <input
                type="search"
                placeholder="Search resources, tutors, study groups..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/50 text-sm transition-all 
                  placeholder:text-muted-foreground/60 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30 
                  focus-visible:border-primary/50 focus-visible:bg-background
                  hover:border-primary/30 hover:bg-background/80"
              />

              {/* Quick search filters - appear on focus */}
              <div className="absolute right-2 top-1/2 -translate-y-1/2 flex items-center gap-1 opacity-0 group-focus-within:opacity-100 transition-opacity">
                <kbd className="pointer-events-none hidden h-5 select-none items-center gap-1 rounded border bg-muted px-1.5 font-mono text-[10px] font-medium text-muted-foreground sm:flex">
                  <span className="text-xs">⌘</span>K
                </kbd>
              </div>
            </div>
          </div>

          {/* Mobile search toggle */}
          <Button
            variant="ghost"
            size="icon"
            className="md:hidden"
            onClick={() => setIsSearchOpen(!isSearchOpen)}
            aria-label="Search"
          >
            <Search className="h-5 w-5" />
          </Button>

          {/* Right side actions */}
          <div className="flex items-center gap-2 sm:gap-3">
            {/* Notification button with badge */}
            <Button
              variant="ghost"
              size="icon"
              className="relative hover:bg-primary/10 transition-colors"
              aria-label="Notifications"
            >
              <Bell className="h-5 w-5 transition-transform hover:scale-110" />
              <span className="absolute -top-1 -right-1 h-4 w-4 rounded-full bg-primary text-[10px] font-medium text-primary-foreground flex items-center justify-center animate-pulse">
                3
              </span>
            </Button>

            {/* User menu button with avatar placeholder */}
            <Button
              variant="ghost"
              size="icon"
              className="hover:bg-primary/10 transition-colors"
              aria-label="User menu"
            >
              <User className="h-5 w-5 transition-transform hover:scale-110" />
            </Button>

            {/* Quick action button - desktop only */}
            <Button
              variant="default"
              size="sm"
              className="hidden lg:inline-flex gap-2 bg-gradient-to-r from-primary to-primary/80 hover:from-primary/90 hover:to-primary shadow-lg shadow-primary/25"
            >
              <span>Quick Actions</span>
              <ChevronDown className="h-4 w-4" />
            </Button>
          </div>
        </div>

        {/* Mobile search bar - conditionally visible */}
        {isSearchOpen && (
          <div className="md:hidden p-4 border-t border-border/40 bg-background/95 backdrop-blur-xl">
            <div className="relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <input
                type="search"
                placeholder="Search..."
                className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border/60 bg-muted/50 text-sm 
                  focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-primary/30"
                autoFocus
              />
            </div>
          </div>
        )}
      </header>
    </>
  )
}