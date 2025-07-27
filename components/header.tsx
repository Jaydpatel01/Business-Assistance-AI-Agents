"use client"

import { SidebarTrigger } from "@/components/ui/sidebar"
import { ThemeToggle } from "@/components/theme-toggle"
import { Button } from "@/components/ui/button"
import { Plus, Bell, Search } from "lucide-react"
import { Input } from "@/components/ui/input"
import { SearchDialog } from "@/components/search-dialog"
import { NotificationsDialog } from "@/components/notifications-dialog"
import { SimpleMonitoringControls } from "@/components/ui/monitoring-controls"
import { HelpSystem } from "@/components/user-experience/help-system"
import { KeyboardShortcuts } from "@/components/user-experience/keyboard-shortcuts"
import { PerformanceDashboard } from "@/components/user-experience/performance-dashboard"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import Link from "next/link"
import { useState } from "react"

export function Header() {
  const [searchQuery, setSearchQuery] = useState("")
  const [searchOpen, setSearchOpen] = useState(false)
  const [notificationsOpen, setNotificationsOpen] = useState(false)

  const handleSearchClick = () => {
    setSearchOpen(true)
  }

  const handleNotificationsClick = () => {
    setNotificationsOpen(true)
  }

  return (
    <>
      <header className="sticky top-0 z-40 flex h-16 shrink-0 items-center gap-4 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60 px-6">
        <SidebarTrigger className="-ml-1" />

        {/* Search Bar */}
        <div className="flex-1 max-w-md">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search scenarios, sessions, decisions..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onClick={handleSearchClick}
              className="pl-10 cursor-pointer"
              readOnly
            />
            <Badge variant="outline" className="absolute right-3 top-1/2 -translate-y-1/2 text-xs hidden md:inline">
              Ctrl K
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* User Experience Tools */}
          <div className="hidden lg:flex items-center gap-1">
            <HelpSystem />
            <KeyboardShortcuts />
            <PerformanceDashboard />
            <Separator orientation="vertical" className="h-4" />
          </div>

          {/* AI Status Indicator */}
          <div className="hidden md:flex items-center gap-2 px-3 py-1.5 bg-muted rounded-full">
            <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />
            <span className="text-xs font-medium">AI Agents Online</span>
          </div>

          {/* Notifications */}
          <Button variant="ghost" size="icon" className="relative" onClick={handleNotificationsClick}>
            <Bell className="h-4 w-4" />
            <Badge className="absolute -top-1 -right-1 h-5 w-5 p-0 text-xs flex items-center justify-center">3</Badge>
          </Button>

          {/* New Scenario Button */}
          <Button asChild>
            <Link href="/scenarios/new">
              <Plus className="h-4 w-4 mr-2" />
              <span className="hidden sm:inline">New Scenario</span>
            </Link>
          </Button>

          {/* Development Monitoring Controls */}
          <SimpleMonitoringControls variant="header" />

          <ThemeToggle />
        </div>
      </header>

      <SearchDialog open={searchOpen} onOpenChange={setSearchOpen} />
      <NotificationsDialog open={notificationsOpen} onOpenChange={setNotificationsOpen} />
      
      {/* Monitoring Controls - Floating UI */}
      <SimpleMonitoringControls variant="floating" />
    </>
  )
}
