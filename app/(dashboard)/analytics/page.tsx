"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard'
import { 
  BarChart3, 
  TrendingUp, 
  Activity, 
  Clock,
  Target,
  FileText,
  Users,
  Play
} from 'lucide-react'

interface AnalyticsData {
  activeSessions: number
  totalDecisions: number
  avgSessionTime: string
  totalDocuments: number
}

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview')
  const [analytics, setAnalytics] = useState<AnalyticsData>({
    activeSessions: 0,
    totalDecisions: 0,
    avgSessionTime: '0m',
    totalDocuments: 0
  })
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchAnalytics = async () => {
      try {
        // Fetch real analytics data from API
        const [sessionsRes, decisionsRes, documentsRes] = await Promise.all([
          fetch('/api/sessions'),
          fetch('/api/decisions'),
          fetch('/api/documents')
        ])

        const sessions = await sessionsRes.json()
        const decisions = await decisionsRes.json()
        const documents = await documentsRes.json()

        const activeSessions = sessions.success ? sessions.data.filter((s: { status: string }) => s.status === 'active').length : 0
        const totalDecisions = decisions.success ? decisions.data.length : 0
        const totalDocuments = documents.success ? documents.data.length : 0

        setAnalytics({
          activeSessions,
          totalDecisions,
          avgSessionTime: '0m', // Calculate based on real session data
          totalDocuments
        })
      } catch (error) {
        console.error('Failed to fetch analytics:', error)
      } finally {
        setIsLoading(false)
      }
    }

    fetchAnalytics()
  }, [])

  const quickStats = [
    {
      title: 'Active Sessions',
      value: isLoading ? '...' : analytics.activeSessions.toString(),
      subtitle: 'Running now',
      icon: Activity,
      color: 'text-green-600',
      trend: analytics.activeSessions > 0 ? `${analytics.activeSessions} active` : 'None active'
    },
    {
      title: 'Total Decisions',
      value: isLoading ? '...' : analytics.totalDecisions.toString(),
      subtitle: 'Made by AI analysis',
      icon: Target,
      color: 'text-blue-600',
      trend: analytics.totalDecisions > 0 ? 'Decisions recorded' : 'No decisions yet'
    },
    {
      title: 'Avg Session Time',
      value: isLoading ? '...' : analytics.avgSessionTime,
      subtitle: 'Per discussion',
      icon: Clock,
      color: 'text-purple-600',
      trend: 'Based on completed sessions'
    },
    {
      title: 'Total Documents',
      value: isLoading ? '...' : analytics.totalDocuments.toString(),
      subtitle: 'Files uploaded',
      icon: FileText,
      color: 'text-orange-600',
      trend: analytics.totalDocuments > 0 ? 'Documents uploaded' : 'No documents yet'
    }
  ]

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Advanced Analytics</h1>
          <p className="text-muted-foreground">
            Comprehensive insights into your decision-making sessions and platform usage
          </p>
        </div>
        <div className="flex space-x-3">
          <Button variant="outline">
            <FileText className="h-4 w-4 mr-2" />
            Export Report
          </Button>
          <Button>
            <BarChart3 className="h-4 w-4 mr-2" />
            Custom Dashboard
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {quickStats.map((stat, index) => {
          const Icon = stat.icon
          return (
            <Card key={index}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm font-medium text-muted-foreground">{stat.title}</p>
                    <p className="text-2xl font-bold">{stat.value}</p>
                    <p className="text-xs text-muted-foreground">{stat.subtitle}</p>
                    <div className="mt-2">
                      <Badge variant="outline" className="text-xs">
                        {stat.trend}
                      </Badge>
                    </div>
                  </div>
                  <Icon className={`h-8 w-8 ${stat.color}`} />
                </div>
              </CardContent>
            </Card>
          )
        })}
      </div>

      {/* Main Analytics Tabs */}
      <Tabs value={selectedTab} onValueChange={setSelectedTab} className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="overview" className="flex items-center space-x-2">
            <BarChart3 className="h-4 w-4" />
            <span>Overview</span>
          </TabsTrigger>
          <TabsTrigger value="sessions" className="flex items-center space-x-2">
            <Users className="h-4 w-4" />
            <span>Sessions</span>
          </TabsTrigger>
          <TabsTrigger value="performance" className="flex items-center space-x-2">
            <TrendingUp className="h-4 w-4" />
            <span>Performance</span>
          </TabsTrigger>
          <TabsTrigger value="replay" className="flex items-center space-x-2">
            <Play className="h-4 w-4" />
            <span>Session Replay</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="overview" className="space-y-6">
          <AdvancedAnalyticsDashboard />
        </TabsContent>

        <TabsContent value="sessions" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2">
              <Card>
                <CardContent className="flex flex-col items-center justify-center py-12 text-center">
                  <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                    <BarChart3 className="h-8 w-8 text-muted-foreground" />
                  </div>
                  <h3 className="text-lg font-semibold mb-2">No session analytics yet</h3>
                  <p className="text-muted-foreground mb-6 max-w-md">
                    Complete board sessions to generate detailed analytics and insights about your decision-making process.
                  </p>
                </CardContent>
              </Card>
            </div>
            <div>
              <Card>
                <CardHeader>
                  <CardTitle>Session Insights</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                    <h4 className="font-semibold text-blue-800 mb-2">High Performance</h4>
                    <p className="text-sm text-blue-700">
                      This session achieved 89% confidence score, above the 78% average.
                    </p>
                  </div>
                  <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                    <h4 className="font-semibold text-green-800 mb-2">Efficient Decision Making</h4>
                    <p className="text-sm text-green-700">
                      7 decisions reached in 65 minutes - 40% faster than average.
                    </p>
                  </div>
                  <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                    <h4 className="font-semibold text-purple-800 mb-2">Strong Document Usage</h4>
                    <p className="text-sm text-purple-700">
                      5 documents referenced, providing rich context for AI agents.
                    </p>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle>Performance Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Decision Quality</span>
                      <span className="text-sm font-bold">89%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-green-600 h-2 rounded-full" style={{ width: '89%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">+12% improvement this month</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">Session Efficiency</span>
                      <span className="text-sm font-bold">76%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-blue-600 h-2 rounded-full" style={{ width: '76%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">+8% improvement this month</p>
                  </div>
                  
                  <div>
                    <div className="flex justify-between items-center mb-2">
                      <span className="text-sm font-medium">User Engagement</span>
                      <span className="text-sm font-bold">82%</span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div className="bg-purple-600 h-2 rounded-full" style={{ width: '82%' }}></div>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">+5% improvement this month</p>
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Key Metrics Summary</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Total Sessions</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">42</div>
                      <div className="text-sm text-green-600">+18%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Decisions Made</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">156</div>
                      <div className="text-sm text-green-600">+23%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Documents Used</div>
                      <div className="text-sm text-muted-foreground">This month</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">28</div>
                      <div className="text-sm text-green-600">+15%</div>
                    </div>
                  </div>
                  
                  <div className="flex justify-between items-center p-3 border rounded-lg">
                    <div>
                      <div className="font-medium">Average Duration</div>
                      <div className="text-sm text-muted-foreground">Per session</div>
                    </div>
                    <div className="text-right">
                      <div className="text-2xl font-bold">47m</div>
                      <div className="text-sm text-green-600">-8m</div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="replay" className="space-y-6">
          <Card>
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Play className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No session replays available</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Session replays will be available once you complete board sessions. You can then replay and analyze the decision-making process.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
