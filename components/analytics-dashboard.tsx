"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { MetricCard } from "@/components/analytics/MetricCard"
import { AlertsPanel } from "@/components/analytics/AlertsPanel"
import { ActivityFeed } from "@/components/analytics/ActivityFeed"
import { useToast } from "@/hooks/use-toast"
import { 
  BarChart3, 
  Users, 
  MessageSquare, 
  TrendingUp, 
  Clock, 
  Target,
  Brain,
  Zap
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalSessions: number
    activeUsers: number
    totalMessages: number
    avgSessionDuration: number
  }
  performance: {
    responseTime: number
    successRate: number
    userSatisfaction: number
  }
  usage: {
    topAgents: Array<{ name: string; usage: number }>
    peakHours: Array<{ hour: number; activity: number }>
  }
}

export function AnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [timeRange, setTimeRange] = useState("7d")
  const { toast } = useToast()

  const fetchAnalyticsData = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analytics?timeframe=${timeRange}`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }
      
      const data = await response.json()
      if (data.success && data.data) {
        setAnalyticsData(data.data)
      } else {
        throw new Error('Invalid response format')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      // Fallback to mock data for development
      setAnalyticsData({
        overview: {
          totalSessions: 1247,
          activeUsers: 89,
          totalMessages: 12543,
          avgSessionDuration: 1845
        },
        performance: {
          responseTime: 1.2,
          successRate: 98.5,
          userSatisfaction: 4.7
        },
        usage: {
          topAgents: [
            { name: "CEO Agent", usage: 45 },
            { name: "CFO Agent", usage: 32 },
            { name: "CTO Agent", usage: 28 },
            { name: "HR Agent", usage: 15 }
          ],
          peakHours: [
            { hour: 9, activity: 85 },
            { hour: 14, activity: 92 },
            { hour: 16, activity: 78 }
          ]
        }
      })
      
      toast({
        title: "Using Demo Data",
        description: "Analytics API unavailable, showing sample data",
        variant: "default"
      })
    } finally {
      setIsLoading(false)
    }
  }, [timeRange, toast])

  useEffect(() => {
    fetchAnalyticsData()
  }, [fetchAnalyticsData])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i} className="animate-pulse">
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded w-24"></div>
                <div className="h-4 w-4 bg-muted rounded"></div>
              </CardHeader>
              <CardContent>
                <div className="h-6 bg-muted rounded w-16 mb-1"></div>
                <div className="h-3 bg-muted rounded w-32"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="text-center">
          <p className="text-muted-foreground">No analytics data available</p>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Time Range Selector */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-semibold tracking-tight">Analytics Overview</h2>
          <p className="text-muted-foreground">
            Monitor your AI agents' performance and user engagement
          </p>
        </div>
        <Tabs value={timeRange} onValueChange={setTimeRange} className="w-auto">
          <TabsList>
            <TabsTrigger value="24h">24 Hours</TabsTrigger>
            <TabsTrigger value="7d">7 Days</TabsTrigger>
            <TabsTrigger value="30d">30 Days</TabsTrigger>
            <TabsTrigger value="90d">90 Days</TabsTrigger>
          </TabsList>
        </Tabs>
      </div>

      {/* Overview Metrics */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <MetricCard
          title="Total Sessions"
          value={analyticsData.overview.totalSessions.toLocaleString()}
          description="Boardroom discussions initiated"
          trend={{
            value: 12.5,
            direction: "up",
            label: "vs last period"
          }}
          icon={<Users className="h-4 w-4" />}
          status="success"
        />
        
        <MetricCard
          title="Active Users"
          value={analyticsData.overview.activeUsers}
          description="Currently engaged users"
          trend={{
            value: 8.2,
            direction: "up",
            label: "vs last period"
          }}
          icon={<Target className="h-4 w-4" />}
          status="info"
        />
        
        <MetricCard
          title="Messages Exchanged"
          value={analyticsData.overview.totalMessages.toLocaleString()}
          description="AI agent interactions"
          trend={{
            value: 23.1,
            direction: "up",
            label: "vs last period"
          }}
          icon={<MessageSquare className="h-4 w-4" />}
          status="success"
        />
        
        <MetricCard
          title="Avg Session Duration"
          value={`${Math.round(analyticsData.overview.avgSessionDuration / 60)}m`}
          description="Time spent per session"
          trend={{
            value: 5.3,
            direction: "up",
            label: "vs last period"
          }}
          icon={<Clock className="h-4 w-4" />}
          status="info"
        />
      </div>

      {/* Performance Metrics */}
      <div className="grid gap-4 md:grid-cols-3">
        <MetricCard
          title="Response Time"
          value={`${analyticsData.performance.responseTime}s`}
          description="Average AI response time"
          trend={{
            value: 15.2,
            direction: "down",
            label: "improvement"
          }}
          icon={<Zap className="h-4 w-4" />}
          status="success"
        />
        
        <MetricCard
          title="Success Rate"
          value={`${analyticsData.performance.successRate}%`}
          description="Successful AI interactions"
          trend={{
            value: 2.1,
            direction: "up",
            label: "vs last period"
          }}
          icon={<TrendingUp className="h-4 w-4" />}
          status="success"
        />
        
        <MetricCard
          title="User Satisfaction"
          value={`${analyticsData.performance.userSatisfaction}/5.0`}
          description="Average user rating"
          trend={{
            value: 0.3,
            direction: "up",
            label: "vs last period"
          }}
          icon={<Brain className="h-4 w-4" />}
          status="success"
        />
      </div>

      {/* Detailed Analytics Tabs */}
      <Tabs defaultValue="activity" className="space-y-4">
        <TabsList>
          <TabsTrigger value="activity">Activity Feed</TabsTrigger>
          <TabsTrigger value="agents">Agent Usage</TabsTrigger>
          <TabsTrigger value="alerts">Alerts & Issues</TabsTrigger>
        </TabsList>
        
        <TabsContent value="activity" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5" />
                Recent Activity
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ActivityFeed activities={[
                {
                  timestamp: new Date().toISOString(),
                  type: "session_started",
                  description: "Executive boardroom session initiated",
                  participants: ["CEO Agent", "CFO Agent"],
                  duration: "45m",
                  messagesExchanged: 23
                },
                {
                  timestamp: new Date(Date.now() - 3600000).toISOString(),
                  type: "decision_made",
                  description: "Strategic investment decision completed",
                  participants: ["CEO Agent", "CFO Agent", "CTO Agent"],
                  outcome: "Approved $2M AI investment",
                  duration: "32m"
                },
                {
                  timestamp: new Date(Date.now() - 7200000).toISOString(),
                  type: "document_analyzed",
                  description: "Financial report processed",
                  category: "analysis",
                  size: "2.4MB"
                }
              ]} />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="agents" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-5 w-5" />
                Agent Performance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {analyticsData.usage.topAgents.map((agent, index) => (
                  <div key={agent.name} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center text-sm font-medium">
                        {index + 1}
                      </div>
                      <span className="font-medium">{agent.name}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <div className="w-24 h-2 bg-muted rounded-full overflow-hidden">
                        <div 
                          className="h-full bg-primary rounded-full transition-all"
                          style={{ width: `${agent.usage}%` }}
                        />
                      </div>
                      <span className="text-sm text-muted-foreground">{agent.usage}%</span>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="alerts" className="space-y-4">
          <AlertsPanel alerts={[
            {
              id: "1",
              type: "success",
              title: "High User Engagement",
              message: "User satisfaction scores have improved by 15% this week",
              timestamp: new Date().toISOString(),
              category: "performance",
              priority: "low",
              dismissible: true
            },
            {
              id: "2", 
              type: "warning",
              title: "API Response Time",
              message: "Average response time increased to 2.3s - consider optimization",
              timestamp: new Date(Date.now() - 1800000).toISOString(),
              category: "performance",
              priority: "medium",
              dismissible: true,
              metrics: [
                { label: "Current", value: "2.3s", trend: "up" },
                { label: "Target", value: "1.5s", trend: "neutral" }
              ]
            },
            {
              id: "3",
              type: "info", 
              title: "System Update Available",
              message: "New AI model version available with improved accuracy",
              timestamp: new Date(Date.now() - 3600000).toISOString(),
              category: "system",
              priority: "low",
              dismissible: true,
              actionLabel: "Update Now"
            }
          ]} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
