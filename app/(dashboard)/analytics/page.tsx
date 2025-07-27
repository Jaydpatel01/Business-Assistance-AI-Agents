"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { AdvancedAnalyticsDashboard } from '@/components/analytics/AdvancedAnalyticsDashboard'
import { SessionAnalytics } from '@/components/analytics/SessionAnalytics'
import { SessionReplay } from '@/components/analytics/SessionReplay'
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

// Mock data for featured session
const featuredSessionMetrics = {
  sessionId: 'session-featured',
  sessionName: 'Q1 Strategic Planning Review',
  scenario: 'Strategic Planning',
  duration: 65,
  messageCount: 23,
  participantCount: 4,
  documentsUsed: 5,
  decisionsReached: 7,
  confidenceScore: 89,
  status: 'completed' as const,
  createdAt: '2025-01-14T10:30:00Z',
  completedAt: '2025-01-14T11:35:00Z'
}

const comparisonData = {
  avgDuration: 52,
  avgMessages: 18,
  avgDecisions: 5
}

export default function AnalyticsPage() {
  const [selectedTab, setSelectedTab] = useState('overview')

  const quickStats = [
    {
      title: 'Active Sessions',
      value: '3',
      subtitle: 'Running now',
      icon: Activity,
      color: 'text-green-600',
      trend: '+2 from yesterday'
    },
    {
      title: 'Decisions Today',
      value: '12',
      subtitle: 'Strategic outcomes',
      icon: Target,
      color: 'text-blue-600',
      trend: '+67% vs last week'
    },
    {
      title: 'Avg Session Time',
      value: '47m',
      subtitle: 'Per discussion',
      icon: Clock,
      color: 'text-purple-600',
      trend: '-8 min improvement'
    },
    {
      title: 'Document Usage',
      value: '28',
      subtitle: 'Files referenced',
      icon: FileText,
      color: 'text-orange-600',
      trend: '+15% this month'
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
              <SessionAnalytics 
                sessionMetrics={featuredSessionMetrics}
                comparisonData={comparisonData}
              />
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
          <SessionReplay sessionId="session-featured" autoPlay={false} playbackSpeed={1} />
        </TabsContent>
      </Tabs>
    </div>
  )
}
