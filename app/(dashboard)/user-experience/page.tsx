"use client"

import { useState } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Sparkles, 
  Keyboard, 
  HelpCircle, 
  Gauge, 
  Settings,
  MessageSquare,
  Monitor,
  Smartphone,
  User,
  Bell
} from "lucide-react"
import { HelpSystem } from "@/components/user-experience/help-system"
import { KeyboardShortcuts } from "@/components/user-experience/keyboard-shortcuts"
import { PerformanceDashboard } from "@/components/user-experience/performance-dashboard"

export default function UserExperiencePage() {
  const [activeTab, setActiveTab] = useState("overview")

  const features = [
    {
      title: "Keyboard Shortcuts",
      description: "Speed up your workflow with powerful keyboard shortcuts",
      icon: Keyboard,
      status: "Available",
      category: "Productivity",
      users: "All Users"
    },
    {
      title: "Help System",
      description: "Interactive help and guided tutorials",
      icon: HelpCircle,
      status: "Available", 
      category: "Support",
      users: "All Users"
    },
    {
      title: "Performance Monitoring",
      description: "Real-time performance metrics and optimization",
      icon: Gauge,
      status: "Available",
      category: "Monitoring",
      users: "Admins"
    },
    {
      title: "Advanced Notifications",
      description: "Smart, contextual notifications and alerts",
      icon: Bell,
      status: "Coming Soon",
      category: "Communication",
      users: "All Users"
    },
    {
      title: "Mobile Optimization",
      description: "Responsive design for mobile devices",
      icon: Smartphone,
      status: "In Development",
      category: "Accessibility",
      users: "All Users"
    },
    {
      title: "User Personalization",
      description: "Customizable interface and preferences",
      icon: User,
      status: "Planned",
      category: "Customization",
      users: "All Users"
    }
  ]

  const metrics = [
    { label: "Active Users", value: "1,247", change: "+12%", period: "vs last month" },
    { label: "Session Duration", value: "24m", change: "+8%", period: "average" },
    { label: "Feature Adoption", value: "89%", change: "+5%", period: "this quarter" },
    { label: "User Satisfaction", value: "4.8/5", change: "+0.2", period: "rating" }
  ]

  const getStatusBadge = (status: string) => {
    switch (status) {
      case "Available":
        return <Badge variant="default" className="bg-green-100 text-green-800">Available</Badge>
      case "In Development":
        return <Badge variant="secondary" className="bg-blue-100 text-blue-800">In Development</Badge>
      case "Coming Soon":
        return <Badge variant="secondary" className="bg-yellow-100 text-yellow-800">Coming Soon</Badge>
      case "Planned":
        return <Badge variant="outline">Planned</Badge>
      default:
        return <Badge variant="outline">{status}</Badge>
    }
  }

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <Sparkles className="h-8 w-8 text-primary" />
            User Experience
          </h1>
          <p className="text-muted-foreground mt-2">
            Enhance your productivity with advanced user experience features
          </p>
        </div>
        <Button>
          <Settings className="h-4 w-4 mr-2" />
          UX Settings
        </Button>
      </div>

      {/* Metrics Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        {metrics.map((metric, index) => (
          <Card key={index}>
            <CardContent className="p-6">
              <div className="flex items-center justify-between space-y-0 pb-2">
                <div className="text-sm font-medium text-muted-foreground">
                  {metric.label}
                </div>
                <Gauge className="h-4 w-4 text-muted-foreground" />
              </div>
              <div className="text-2xl font-bold">{metric.value}</div>
              <p className="text-xs text-muted-foreground">
                <span className="text-green-600">{metric.change}</span> {metric.period}
              </p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Main Content Tabs */}
      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Overview</TabsTrigger>
          <TabsTrigger value="help">Help System</TabsTrigger>
          <TabsTrigger value="shortcuts">Shortcuts</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-4">
          {/* Features Grid */}
          <Card>
            <CardHeader>
              <CardTitle>User Experience Features</CardTitle>
              <CardDescription>
                Discover and manage available UX enhancement features
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                {features.map((feature, index) => (
                  <Card key={index} className="border-dashed">
                    <CardContent className="p-4">
                      <div className="flex items-start justify-between">
                        <div className="flex items-center gap-3">
                          <div className="p-2 bg-primary/10 rounded-lg">
                            <feature.icon className="h-5 w-5 text-primary" />
                          </div>
                          <div className="space-y-1">
                            <h3 className="font-semibold text-sm">{feature.title}</h3>
                            <p className="text-xs text-muted-foreground">{feature.description}</p>
                          </div>
                        </div>
                      </div>
                      <div className="mt-4 flex items-center justify-between">
                        {getStatusBadge(feature.status)}
                        <div className="text-xs text-muted-foreground">
                          {feature.category} • {feature.users}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions */}
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Quick Actions</CardTitle>
                <CardDescription>Common user experience tasks</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <Button variant="outline" className="w-full justify-start">
                  <Keyboard className="h-4 w-4 mr-2" />
                  View Keyboard Shortcuts
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <HelpCircle className="h-4 w-4 mr-2" />
                  Open Help Center
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <Monitor className="h-4 w-4 mr-2" />
                  Check Performance Metrics
                </Button>
                <Button variant="outline" className="w-full justify-start">
                  <MessageSquare className="h-4 w-4 mr-2" />
                  Send Feedback
                </Button>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="text-lg">Recent Activity</CardTitle>
                <CardDescription>Latest UX interactions</CardDescription>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                  <span>Keyboard shortcuts used: 15 times today</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                  <span>Help articles viewed: 3 this week</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-yellow-500 rounded-full"></div>
                  <span>Performance optimizations: 2 applied</span>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                  <span>Feature requests: 1 submitted</span>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="help" className="space-y-4">
          <HelpSystem />
        </TabsContent>

        <TabsContent value="shortcuts" className="space-y-4">
          <KeyboardShortcuts />
        </TabsContent>

        <TabsContent value="performance" className="space-y-4">
          <PerformanceDashboard />
        </TabsContent>
      </Tabs>
    </div>
  )
}
