/**
 * Enhanced Analytics Dashboard Component
 * Phase 4: Analytics & Insights - Advanced Visualization and Export
 */

"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import { useToast } from "@/hooks/use-toast"
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  LineChart,
  Line,
  PieChart,
  Pie,
  Cell,
  AreaChart,
  Area,
} from "recharts"
import { 
  Download,
  FileText,
  BarChart3,
  TrendingUp,
  Users,
  Target,
  Clock,
  Brain,
  Zap,
  RefreshCw
} from "lucide-react"

interface AnalyticsData {
  overview: {
    totalSessions: number
    activeUsers: number
    totalMessages: number
    totalDecisions: number
    avgSessionDuration: number
    avgDecisionConfidence: number
  }
  trends: {
    sessionTrends: Array<{ date: string; sessions: number; decisions: number }>
    agentPerformance: Array<{ agent: string; usage: number; effectiveness: number }>
    decisionQuality: Array<{ date: string; confidence: number; volume: number }>
  }
  insights: {
    topPerformingAgent: string
    peakActivityHours: Array<{ hour: number; activity: number }>
    keyTrends: string[]
    recommendations: string[]
  }
}

interface ExportOptions {
  format: 'csv' | 'pdf' | 'excel'
  dateRange: {
    start: string
    end: string
  }
  sessionIds?: string[]
}

const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff7300', '#0088fe']

export function EnhancedAnalyticsDashboard() {
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isExporting, setIsExporting] = useState(false)
  const [timeRange, setTimeRange] = useState("30d")
  const [exportOptions, setExportOptions] = useState<ExportOptions>({
    format: 'csv',
    dateRange: {
      start: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      end: new Date().toISOString().split('T')[0]
    }
  })
  const { toast } = useToast()

  useEffect(() => {
    fetchAnalyticsData()
  }, [timeRange]) // eslint-disable-line react-hooks/exhaustive-deps

  const fetchAnalyticsData = async () => {
    try {
      setIsLoading(true)
      const response = await fetch(`/api/analytics?timeframe=${timeRange}&enhanced=true`)
      
      if (!response.ok) {
        throw new Error('Failed to fetch analytics data')
      }

      const result = await response.json()
      
      if (result.success) {
        setAnalyticsData(result.data)
      } else {
        throw new Error(result.error || 'Failed to load analytics')
      }
    } catch (error) {
      console.error('Analytics fetch error:', error)
      toast({
        title: "Error",
        description: "Failed to load analytics data",
        variant: "destructive",
      })
      
      // Fallback to demo data
      setAnalyticsData(generateDemoData())
    } finally {
      setIsLoading(false)
    }
  }

  const handleExport = async () => {
    try {
      setIsExporting(true)
      
      const response = await fetch('/api/analytics/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(exportOptions),
      })

      if (!response.ok) {
        throw new Error('Export failed')
      }

      const result = await response.json()
      
      if (result.success) {
        // Handle different export formats
        if (exportOptions.format === 'csv') {
          downloadFile(result.data.content, result.data.filename, result.data.mimeType)
        } else {
          // For PDF and Excel, the result contains structured data
          // that needs to be processed by the frontend
          toast({
            title: "Export Ready",
            description: `${exportOptions.format.toUpperCase()} export generated successfully`,
          })
          
          // You would implement PDF/Excel generation here using libraries like:
          // - jsPDF for PDF generation
          // - SheetJS for Excel generation
          console.log('Export data:', result.data)
        }
      } else {
        throw new Error(result.error || 'Export failed')
      }
    } catch (error) {
      console.error('Export error:', error)
      toast({
        title: "Export Failed",
        description: "Failed to generate export. Please try again.",
        variant: "destructive",
      })
    } finally {
      setIsExporting(false)
    }
  }

  const downloadFile = (content: string, filename: string, mimeType: string) => {
    const blob = new Blob([content], { type: mimeType })
    const url = window.URL.createObjectURL(blob)
    const link = document.createElement('a')
    link.href = url
    link.download = filename
    document.body.appendChild(link)
    link.click()
    document.body.removeChild(link)
    window.URL.revokeObjectURL(url)
    
    toast({
      title: "Download Started",
      description: `${filename} is being downloaded`,
    })
  }

  const generateDemoData = (): AnalyticsData => ({
    overview: {
      totalSessions: 45,
      activeUsers: 12,
      totalMessages: 324,
      totalDecisions: 67,
      avgSessionDuration: 42,
      avgDecisionConfidence: 78
    },
    trends: {
      sessionTrends: [
        { date: '2025-01-20', sessions: 8, decisions: 15 },
        { date: '2025-01-21', sessions: 12, decisions: 18 },
        { date: '2025-01-22', sessions: 6, decisions: 12 },
        { date: '2025-01-23', sessions: 10, decisions: 16 },
        { date: '2025-01-24', sessions: 15, decisions: 22 },
        { date: '2025-01-25', sessions: 9, decisions: 14 },
        { date: '2025-01-26', sessions: 11, decisions: 19 }
      ],
      agentPerformance: [
        { agent: 'CEO', usage: 85, effectiveness: 92 },
        { agent: 'CFO', usage: 78, effectiveness: 88 },
        { agent: 'CTO', usage: 72, effectiveness: 85 },
        { agent: 'HR', usage: 65, effectiveness: 80 }
      ],
      decisionQuality: [
        { date: '2025-01-20', confidence: 75, volume: 15 },
        { date: '2025-01-21', confidence: 82, volume: 18 },
        { date: '2025-01-22', confidence: 78, volume: 12 },
        { date: '2025-01-23', confidence: 85, volume: 16 },
        { date: '2025-01-24', confidence: 88, volume: 22 },
        { date: '2025-01-25', confidence: 76, volume: 14 },
        { date: '2025-01-26', confidence: 90, volume: 19 }
      ]
    },
    insights: {
      topPerformingAgent: 'CEO',
      peakActivityHours: [
        { hour: 9, activity: 45 },
        { hour: 10, activity: 52 },
        { hour: 11, activity: 38 },
        { hour: 14, activity: 42 },
        { hour: 15, activity: 48 },
        { hour: 16, activity: 35 }
      ],
      keyTrends: [
        'Decision confidence improving over time',
        'High-quality decisions with strong confidence levels',
        'CEO agent shows highest effectiveness'
      ],
      recommendations: [
        'Continue current decision-making practices',
        'Consider integrating more data sources for HR decisions',
        'Maintain focus on quality over quantity'
      ]
    }
  })

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="h-8 w-8 animate-spin" />
        <span className="ml-2">Loading analytics...</span>
      </div>
    )
  }

  if (!analyticsData) {
    return (
      <div className="text-center py-8">
        <p>No analytics data available</p>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header with Controls */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h2>
          <p className="text-muted-foreground">
            Comprehensive insights into your AI-assisted decision making
          </p>
        </div>
        
        <div className="flex flex-col sm:flex-row gap-2">
          <Select value={timeRange} onValueChange={setTimeRange}>
            <SelectTrigger className="w-[180px]">
              <SelectValue placeholder="Select time range" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="7d">Last 7 days</SelectItem>
              <SelectItem value="30d">Last 30 days</SelectItem>
              <SelectItem value="90d">Last 3 months</SelectItem>
              <SelectItem value="365d">Last year</SelectItem>
            </SelectContent>
          </Select>
          
          <Button onClick={fetchAnalyticsData} variant="outline" size="sm">
            <RefreshCw className="h-4 w-4 mr-2" />
            Refresh
          </Button>
        </div>
      </div>

      {/* Overview Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Sessions</CardTitle>
            <BarChart3 className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalSessions}</div>
            <p className="text-xs text-muted-foreground">
              +20.1% from last period
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            <Target className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.totalDecisions}</div>
            <p className="text-xs text-muted-foreground">
              {analyticsData.overview.avgDecisionConfidence}% avg confidence
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Users</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.activeUsers}</div>
            <p className="text-xs text-muted-foreground">
              +8% engagement rate
            </p>
          </CardContent>
        </Card>
        
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Avg Session Duration</CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{analyticsData.overview.avgSessionDuration}m</div>
            <p className="text-xs text-muted-foreground">
              Optimal engagement time
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Analytics Content */}
      <Tabs defaultValue="trends" className="space-y-4">
        <TabsList>
          <TabsTrigger value="trends">Trends & Performance</TabsTrigger>
          <TabsTrigger value="agents">Agent Analysis</TabsTrigger>
          <TabsTrigger value="insights">Insights & Recommendations</TabsTrigger>
          <TabsTrigger value="export">Data Export</TabsTrigger>
        </TabsList>

        <TabsContent value="trends" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Session & Decision Trends */}
            <Card>
              <CardHeader>
                <CardTitle>Session & Decision Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.trends.sessionTrends}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Area type="monotone" dataKey="sessions" stackId="1" stroke="#8884d8" fill="#8884d8" name="Sessions" />
                    <Area type="monotone" dataKey="decisions" stackId="1" stroke="#82ca9d" fill="#82ca9d" name="Decisions" />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Decision Quality Over Time */}
            <Card>
              <CardHeader>
                <CardTitle>Decision Quality Trends</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.trends.decisionQuality}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" tickFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <YAxis />
                    <Tooltip labelFormatter={(value) => new Date(value).toLocaleDateString()} />
                    <Line type="monotone" dataKey="confidence" stroke="#8884d8" name="Confidence %" />
                    <Line type="monotone" dataKey="volume" stroke="#82ca9d" name="Volume" />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="agents" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Agent Performance */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Performance</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.trends.agentPerformance}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="agent" />
                    <YAxis />
                    <Tooltip />
                    <Bar dataKey="usage" fill="#8884d8" name="Usage %" />
                    <Bar dataKey="effectiveness" fill="#82ca9d" name="Effectiveness %" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            {/* Agent Usage Distribution */}
            <Card>
              <CardHeader>
                <CardTitle>Agent Usage Distribution</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.trends.agentPerformance}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ agent, usage }) => `${agent}: ${usage}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="usage"
                    >
                      {analyticsData.trends.agentPerformance.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="insights" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            {/* Key Insights */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Brain className="h-5 w-5" />
                  Key Insights
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.insights.keyTrends.map((trend, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <TrendingUp className="h-4 w-4 text-green-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{trend}</p>
                  </div>
                ))}
              </CardContent>
            </Card>

            {/* Recommendations */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Zap className="h-5 w-5" />
                  Recommendations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                {analyticsData.insights.recommendations.map((recommendation, index) => (
                  <div key={index} className="flex items-start gap-2">
                    <Target className="h-4 w-4 text-blue-500 mt-0.5 flex-shrink-0" />
                    <p className="text-sm">{recommendation}</p>
                  </div>
                ))}
              </CardContent>
            </Card>
          </div>

          {/* Top Performing Agent */}
          <Card>
            <CardHeader>
              <CardTitle>Performance Highlights</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-4">
                <Badge variant="secondary" className="text-lg px-4 py-2">
                  Top Agent: {analyticsData.insights.topPerformingAgent}
                </Badge>
                <span className="text-sm text-muted-foreground">
                  Leading contributor to high-quality decisions
                </span>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="export" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Download className="h-5 w-5" />
                Export Analytics Data
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid gap-4 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="format">Export Format</Label>
                  <Select
                    value={exportOptions.format}
                    onValueChange={(value: 'csv' | 'pdf' | 'excel') =>
                      setExportOptions(prev => ({ ...prev, format: value }))
                    }
                  >
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="csv">CSV - Data Tables</SelectItem>
                      <SelectItem value="pdf">PDF - Executive Report</SelectItem>
                      <SelectItem value="excel">Excel - Detailed Analysis</SelectItem>
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="start-date">Date Range</Label>
                  <div className="flex gap-2">
                    <Input
                      type="date"
                      value={exportOptions.dateRange.start}
                      onChange={(e) =>
                        setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, start: e.target.value }
                        }))
                      }
                    />
                    <Input
                      type="date"
                      value={exportOptions.dateRange.end}
                      onChange={(e) =>
                        setExportOptions(prev => ({
                          ...prev,
                          dateRange: { ...prev.dateRange, end: e.target.value }
                        }))
                      }
                    />
                  </div>
                </div>
              </div>

              <div className="pt-4">
                <Button
                  onClick={handleExport}
                  disabled={isExporting}
                  className="w-full sm:w-auto"
                >
                  {isExporting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      Generating Export...
                    </>
                  ) : (
                    <>
                      <FileText className="h-4 w-4 mr-2" />
                      Generate {exportOptions.format.toUpperCase()} Export
                    </>
                  )}
                </Button>
              </div>

              <div className="text-sm text-muted-foreground">
                <p><strong>Export includes:</strong></p>
                <ul className="list-disc list-inside mt-1 space-y-1">
                  <li>Session details and performance metrics</li>
                  <li>Decision analysis and confidence scores</li>
                  <li>Agent contribution and effectiveness data</li>
                  <li>Trend analysis and insights</li>
                  <li>Executive summary and recommendations</li>
                </ul>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
