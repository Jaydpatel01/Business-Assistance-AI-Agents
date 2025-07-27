import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Progress } from '@/components/ui/progress'
import { 
  TrendingUp, 
  Users, 
  MessageSquare, 
  FileText, 
  Target,
  Clock,
  Calendar,
  BarChart3,
  PieChart,
  ArrowUpRight,
  ArrowDownRight,
  Activity
} from 'lucide-react'

interface DashboardMetrics {
  totalSessions: number
  activeSessions: number
  totalDecisions: number
  avgSessionDuration: number
  totalDocuments: number
  totalMessages: number
  userGrowth: number
  sessionGrowth: number
  decisionAccuracy: number
  userEngagement: number
}

interface RecentSession {
  id: string
  name: string
  scenario: string
  duration: number
  status: 'completed' | 'active' | 'paused'
  participants: number
  decisions: number
  createdAt: string
}

interface TopDocument {
  id: string
  name: string
  category: string
  usageCount: number
  lastUsed: string
}

interface AdvancedAnalyticsDashboardProps {
  userId?: string
  timeRange?: '7d' | '30d' | '90d' | '1y'
}

export function AdvancedAnalyticsDashboard({ 
  userId, 
  timeRange = '30d' 
}: AdvancedAnalyticsDashboardProps) {
  const [metrics, setMetrics] = useState<DashboardMetrics | null>(null)
  const [recentSessions, setRecentSessions] = useState<RecentSession[]>([])
  const [topDocuments, setTopDocuments] = useState<TopDocument[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [selectedTimeRange, setSelectedTimeRange] = useState(timeRange)

  // Load analytics data
  useEffect(() => {
    const loadAnalytics = async () => {
      setIsLoading(true)
      try {
        // In a real implementation, these would be separate API calls
        const [metricsRes, sessionsRes, documentsRes] = await Promise.all([
          fetch(`/api/analytics/metrics?timeRange=${selectedTimeRange}&userId=${userId || ''}`),
          fetch(`/api/analytics/sessions/recent?userId=${userId || ''}`),
          fetch(`/api/analytics/documents/top?userId=${userId || ''}`)
        ])

        if (metricsRes.ok) {
          const metricsData = await metricsRes.json()
          setMetrics(metricsData.data)
        }

        if (sessionsRes.ok) {
          const sessionsData = await sessionsRes.json()
          setRecentSessions(sessionsData.data)
        }

        if (documentsRes.ok) {
          const documentsData = await documentsRes.json()
          setTopDocuments(documentsData.data)
        }
      } catch (error) {
        console.error('Failed to load analytics:', error)
        // Mock data for demo
        setMetrics({
          totalSessions: 42,
          activeSessions: 3,
          totalDecisions: 156,
          avgSessionDuration: 47,
          totalDocuments: 28,
          totalMessages: 834,
          userGrowth: 23.5,
          sessionGrowth: 18.2,
          decisionAccuracy: 87.3,
          userEngagement: 76.8
        })

        setRecentSessions([
          {
            id: '1',
            name: 'Q1 Strategic Planning',
            scenario: 'Strategic Planning',
            duration: 65,
            status: 'completed',
            participants: 4,
            decisions: 7,
            createdAt: '2025-01-14T10:30:00Z'
          },
          {
            id: '2',
            name: 'Budget Review Session',
            scenario: 'Financial Planning',
            duration: 32,
            status: 'active',
            participants: 3,
            decisions: 2,
            createdAt: '2025-01-15T14:15:00Z'
          }
        ])

        setTopDocuments([
          {
            id: '1',
            name: 'Q4 Financial Report.pdf',
            category: 'financial',
            usageCount: 15,
            lastUsed: '2025-01-14T16:20:00Z'
          },
          {
            id: '2',
            name: 'Strategic Plan 2025.docx',
            category: 'strategic',
            usageCount: 12,
            lastUsed: '2025-01-15T09:45:00Z'
          }
        ])
      } finally {
        setIsLoading(false)
      }
    }

    loadAnalytics()
  }, [selectedTimeRange, userId])

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const getGrowthIcon = (growth: number) => {
    return growth >= 0 ? <ArrowUpRight className="h-4 w-4" /> : <ArrowDownRight className="h-4 w-4" />
  }

  const getGrowthColor = (growth: number) => {
    return growth >= 0 ? 'text-green-600' : 'text-red-600'
  }

  const timeRangeOptions = [
    { value: '7d', label: 'Last 7 days' },
    { value: '30d', label: 'Last 30 days' },
    { value: '90d', label: 'Last 90 days' },
    { value: '1y', label: 'Last year' }
  ]

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="animate-pulse space-y-2">
                  <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                  <div className="h-8 bg-gray-200 rounded w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  if (!metrics) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Failed to load analytics data</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center space-y-4 sm:space-y-0">
        <div>
          <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
          <p className="text-muted-foreground">Insights into your decision-making sessions</p>
        </div>
        <div className="flex space-x-2">
          {timeRangeOptions.map((option) => (
            <Button
              key={option.value}
              variant={selectedTimeRange === option.value ? 'default' : 'outline'}
              size="sm"
              onClick={() => setSelectedTimeRange(option.value as '7d' | '30d' | '90d' | '1y')}
            >
              {option.label}
            </Button>
          ))}
        </div>
      </div>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Total Sessions</p>
                <p className="text-2xl font-bold">{metrics.totalSessions}</p>
                <div className={`flex items-center text-sm ${getGrowthColor(metrics.sessionGrowth)}`}>
                  {getGrowthIcon(metrics.sessionGrowth)}
                  <span className="ml-1">{Math.abs(metrics.sessionGrowth)}%</span>
                </div>
              </div>
              <MessageSquare className="h-8 w-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Active Sessions</p>
                <p className="text-2xl font-bold">{metrics.activeSessions}</p>
                <div className="flex items-center text-sm text-blue-600">
                  <Activity className="h-4 w-4 mr-1" />
                  <span>Live now</span>
                </div>
              </div>
              <Users className="h-8 w-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Decisions Made</p>
                <p className="text-2xl font-bold">{metrics.totalDecisions}</p>
                <div className="flex items-center text-sm text-purple-600">
                  <Target className="h-4 w-4 mr-1" />
                  <span>{metrics.decisionAccuracy}% accuracy</span>
                </div>
              </div>
              <Target className="h-8 w-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-muted-foreground">Avg Duration</p>
                <p className="text-2xl font-bold">{formatDuration(metrics.avgSessionDuration)}</p>
                <div className="flex items-center text-sm text-orange-600">
                  <Clock className="h-4 w-4 mr-1" />
                  <span>Per session</span>
                </div>
              </div>
              <Clock className="h-8 w-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Secondary Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>User Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              <div className="flex justify-between">
                <span className="text-sm">Engagement Score</span>
                <span className="font-semibold">{metrics.userEngagement}%</span>
              </div>
              <Progress value={metrics.userEngagement} className="h-2" />
            </div>
            <div className="mt-4 text-sm text-muted-foreground">
              Based on session frequency and participation
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Document Usage</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">Total Documents</span>
                <span className="font-semibold">{metrics.totalDocuments}</span>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Avg per Session</span>
                <span className="font-semibold">
                  {metrics.totalSessions > 0 ? Math.round((metrics.totalDocuments / metrics.totalSessions) * 10) / 10 : 0}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="h-5 w-5" />
              <span>Growth Metrics</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div className="flex justify-between items-center">
                <span className="text-sm">User Growth</span>
                <div className={`flex items-center ${getGrowthColor(metrics.userGrowth)}`}>
                  {getGrowthIcon(metrics.userGrowth)}
                  <span className="ml-1 font-semibold">{Math.abs(metrics.userGrowth)}%</span>
                </div>
              </div>
              <div className="flex justify-between items-center">
                <span className="text-sm">Session Growth</span>
                <div className={`flex items-center ${getGrowthColor(metrics.sessionGrowth)}`}>
                  {getGrowthIcon(metrics.sessionGrowth)}
                  <span className="ml-1 font-semibold">{Math.abs(metrics.sessionGrowth)}%</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Sessions & Top Documents */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Calendar className="h-5 w-5" />
              <span>Recent Sessions</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {recentSessions.map((session) => (
                <div key={session.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{session.name}</div>
                    <div className="text-sm text-muted-foreground">{session.scenario}</div>
                    <div className="flex items-center space-x-4 mt-1 text-xs text-muted-foreground">
                      <span>{formatDuration(session.duration)}</span>
                      <span>{session.participants} participants</span>
                      <span>{session.decisions} decisions</span>
                    </div>
                  </div>
                  <Badge 
                    variant="outline" 
                    className={
                      session.status === 'completed' ? 'bg-green-50 text-green-700' :
                      session.status === 'active' ? 'bg-blue-50 text-blue-700' :
                      'bg-yellow-50 text-yellow-700'
                    }
                  >
                    {session.status}
                  </Badge>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="h-5 w-5" />
              <span>Top Documents</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {topDocuments.map((document) => (
                <div key={document.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">{document.name}</div>
                    <div className="flex items-center space-x-2 mt-1">
                      <Badge variant="outline" className="text-xs">
                        {document.category}
                      </Badge>
                      <span className="text-xs text-muted-foreground">
                        Used {document.usageCount} times
                      </span>
                    </div>
                  </div>
                  <div className="text-sm text-muted-foreground">
                    {new Date(document.lastUsed).toLocaleDateString()}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

export default AdvancedAnalyticsDashboard
