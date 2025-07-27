import React from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Progress } from '@/components/ui/progress'
import { 
  Clock, 
  MessageSquare, 
  FileText, 
  TrendingUp, 
  Target,
  CheckCircle,
  AlertCircle
} from 'lucide-react'

interface SessionMetrics {
  sessionId: string
  sessionName: string
  scenario: string
  duration: number // in minutes
  messageCount: number
  participantCount: number
  documentsUsed: number
  decisionsReached: number
  confidenceScore: number
  status: 'active' | 'completed' | 'paused'
  createdAt: string
  completedAt?: string
}

interface SessionAnalyticsProps {
  sessionMetrics: SessionMetrics
  comparisonData?: {
    avgDuration: number
    avgMessages: number
    avgDecisions: number
  }
}

export function SessionAnalytics({ sessionMetrics, comparisonData }: SessionAnalyticsProps) {
  const {
    sessionName,
    scenario,
    duration,
    messageCount,
    participantCount,
    documentsUsed,
    decisionsReached,
    confidenceScore,
    status,
    createdAt,
    completedAt
  } = sessionMetrics

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed': return 'bg-green-100 text-green-800'
      case 'active': return 'bg-blue-100 text-blue-800'
      case 'paused': return 'bg-yellow-100 text-yellow-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed': return <CheckCircle className="h-4 w-4" />
      case 'active': return <Clock className="h-4 w-4" />
      case 'paused': return <AlertCircle className="h-4 w-4" />
      default: return <Clock className="h-4 w-4" />
    }
  }

  const formatDuration = (minutes: number) => {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return `${hours}h ${mins}m`
  }

  const calculateEfficiency = () => {
    if (!comparisonData) return null
    const efficiencyScore = (
      (decisionsReached / Math.max(comparisonData.avgDecisions, 1)) * 0.4 +
      (messageCount / Math.max(comparisonData.avgMessages, 1)) * 0.3 +
      (duration > 0 ? comparisonData.avgDuration / duration : 1) * 0.3
    ) * 100
    return Math.min(Math.max(efficiencyScore, 0), 100)
  }

  const efficiency = calculateEfficiency()

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="text-xl">{sessionName}</CardTitle>
              <p className="text-muted-foreground mt-1">Scenario: {scenario}</p>
            </div>
            <Badge className={getStatusColor(status)}>
              {getStatusIcon(status)}
              <span className="ml-2 capitalize">{status}</span>
            </Badge>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold">{formatDuration(duration)}</div>
              <div className="text-sm text-muted-foreground">Duration</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{messageCount}</div>
              <div className="text-sm text-muted-foreground">Messages</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{participantCount}</div>
              <div className="text-sm text-muted-foreground">Participants</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold">{decisionsReached}</div>
              <div className="text-sm text-muted-foreground">Decisions</div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Engagement Metrics */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <MessageSquare className="h-5 w-5" />
              <span>Engagement</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Messages per participant</span>
              <span className="font-semibold">
                {participantCount > 0 ? Math.round(messageCount / participantCount) : 0}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Average response time</span>
              <span className="font-semibold">2.3 min</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Discussion depth</span>
              <Badge variant="outline" className="bg-green-50 text-green-700">
                High
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Decision Quality */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Target className="h-5 w-5" />
              <span>Decision Quality</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <div className="flex justify-between items-center mb-2">
                <span className="text-sm">Confidence Score</span>
                <span className="font-semibold">{confidenceScore}%</span>
              </div>
              <Progress value={confidenceScore} className="h-2" />
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Decisions reached</span>
              <span className="font-semibold">{decisionsReached}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Consensus level</span>
              <Badge variant="outline" className="bg-blue-50 text-blue-700">
                Strong
              </Badge>
            </div>
          </CardContent>
        </Card>

        {/* Resource Utilization */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Resources</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="flex justify-between items-center">
              <span className="text-sm">Documents referenced</span>
              <span className="font-semibold">{documentsUsed}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">AI agents involved</span>
              <span className="font-semibold">{participantCount - 1}</span>
            </div>
            <div className="flex justify-between items-center">
              <span className="text-sm">Data quality</span>
              <Badge variant="outline" className="bg-purple-50 text-purple-700">
                Excellent
              </Badge>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Session Timeline */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Clock className="h-5 w-5" />
            <span>Session Timeline</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <div className="flex justify-between text-sm">
              <span>Started:</span>
              <span>{new Date(createdAt).toLocaleString()}</span>
            </div>
            {completedAt && (
              <div className="flex justify-between text-sm">
                <span>Completed:</span>
                <span>{new Date(completedAt).toLocaleString()}</span>
              </div>
            )}
            <div className="flex justify-between text-sm">
              <span>Total Duration:</span>
              <span>{formatDuration(duration)}</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Performance Comparison */}
      {comparisonData && efficiency && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <TrendingUp className="h-5 w-5" />
              <span>Performance vs. Average</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <div className="flex justify-between items-center mb-2">
                  <span className="text-sm">Session Efficiency</span>
                  <span className="font-semibold">{Math.round(efficiency)}%</span>
                </div>
                <Progress value={efficiency} className="h-2" />
              </div>
              
              <div className="grid grid-cols-3 gap-4 text-center">
                <div>
                  <div className="text-sm text-muted-foreground">Duration vs Avg</div>
                  <div className={`font-semibold ${duration < comparisonData.avgDuration ? 'text-green-600' : 'text-orange-600'}`}>
                    {duration < comparisonData.avgDuration ? '↓' : '↑'} 
                    {Math.abs(Math.round(((duration - comparisonData.avgDuration) / comparisonData.avgDuration) * 100))}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Messages vs Avg</div>
                  <div className={`font-semibold ${messageCount > comparisonData.avgMessages ? 'text-green-600' : 'text-orange-600'}`}>
                    {messageCount > comparisonData.avgMessages ? '↑' : '↓'} 
                    {Math.abs(Math.round(((messageCount - comparisonData.avgMessages) / comparisonData.avgMessages) * 100))}%
                  </div>
                </div>
                <div>
                  <div className="text-sm text-muted-foreground">Decisions vs Avg</div>
                  <div className={`font-semibold ${decisionsReached > comparisonData.avgDecisions ? 'text-green-600' : 'text-orange-600'}`}>
                    {decisionsReached > comparisonData.avgDecisions ? '↑' : '↓'} 
                    {Math.abs(Math.round(((decisionsReached - comparisonData.avgDecisions) / comparisonData.avgDecisions) * 100))}%
                  </div>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

export default SessionAnalytics
