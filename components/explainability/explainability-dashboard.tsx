"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { DecisionExplainer } from "./decision-explainer"
import { 
  Brain, 
  BarChart3, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  TrendingUp,
  Eye,
  Search,
  Filter
} from "lucide-react"

interface ExplainabilityMetrics {
  totalDecisions: number
  explainedDecisions: number
  averageConfidence: number
  biasDetectionRate: number
  auditTrailCompleteness: number
  userFeedbackScore: number
}

interface DecisionSummary {
  id: string
  title: string
  agentType: string
  confidence: number
  timestamp: Date
  hasExplanation: boolean
  biasDetected: boolean
  riskLevel: 'low' | 'medium' | 'high'
}

interface ExplainabilityDashboardProps {
  sessionId?: string
  organizationId?: string
}

export function ExplainabilityDashboard({ sessionId, organizationId }: ExplainabilityDashboardProps) {
  const [metrics, setMetrics] = useState<ExplainabilityMetrics | null>(null)
  const [decisions, setDecisions] = useState<DecisionSummary[]>([])
  const [selectedDecision, setSelectedDecision] = useState<string | null>(null)
  const [filterBy, setFilterBy] = useState<string>('all')
  const [isLoading, setIsLoading] = useState(true)

  const fetchDashboardData = useCallback(async () => {
    try {
      setIsLoading(true)
      
      // Fetch explainability metrics
      const metricsResponse = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_metrics',
          sessionId,
          organizationId
        })
      })

      if (metricsResponse.ok) {
        const metricsData = await metricsResponse.json()
        setMetrics(metricsData.metrics)
      }

      // Fetch decision audit trails
      const trailsResponse = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_audit_trails',
          sessionId,
          organizationId
        })
      })

      if (trailsResponse.ok) {
        const trailsData = await trailsResponse.json()
        setDecisions(trailsData.auditTrails || [])
      }

    } catch (error) {
      console.error('Failed to fetch explainability data:', error)
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, organizationId])

  useEffect(() => {
    fetchDashboardData()
  }, [fetchDashboardData])

  const filteredDecisions = decisions.filter(decision => {
    switch (filterBy) {
      case 'bias': return decision.biasDetected
      case 'high-risk': return decision.riskLevel === 'high'
      case 'low-confidence': return decision.confidence < 70
      case 'recent': return new Date(decision.timestamp).getTime() > Date.now() - 24 * 60 * 60 * 1000
      default: return true
    }
  })

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "text-green-600"
    if (confidence >= 60) return "text-yellow-600"
    return "text-red-600"
  }

  const getRiskBadgeVariant = (risk: string) => {
    switch (risk) {
      case 'high': return "destructive"
      case 'medium': return "default"
      default: return "secondary"
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[1, 2, 3].map((i) => (
            <Card key={i}>
              <CardHeader className="pb-2">
                <div className="h-4 bg-muted rounded animate-pulse" />
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse" />
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold">Explainability Dashboard</h2>
          <p className="text-muted-foreground">
            Transparency and auditability of AI decision-making
          </p>
        </div>
        <Button onClick={fetchDashboardData} variant="outline">
          <Eye className="h-4 w-4 mr-2" />
          Refresh
        </Button>
      </div>

      {/* Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-6 gap-4">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Total Decisions</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Brain className="h-4 w-4 text-muted-foreground" />
                <span className="text-2xl font-bold">{metrics.totalDecisions}</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Explained</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <CheckCircle className="h-4 w-4 text-green-600" />
                <span className="text-2xl font-bold">{metrics.explainedDecisions}</span>
              </div>
              <p className="text-xs text-muted-foreground">
                {Math.round((metrics.explainedDecisions / Math.max(metrics.totalDecisions, 1)) * 100)}% coverage
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Avg Confidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <TrendingUp className="h-4 w-4 text-blue-600" />
                <span className={`text-2xl font-bold ${getConfidenceColor(metrics.averageConfidence)}`}>
                  {metrics.averageConfidence}%
                </span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Bias Detection</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <span className="text-2xl font-bold">{metrics.biasDetectionRate}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">Audit Trail</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <BarChart3 className="h-4 w-4 text-purple-600" />
                <span className="text-2xl font-bold">{metrics.auditTrailCompleteness}%</span>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-sm font-medium">User Rating</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-2">
                <Eye className="h-4 w-4 text-indigo-600" />
                <span className="text-2xl font-bold">{metrics.userFeedbackScore}/5</span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Main Content */}
      <Tabs defaultValue="decisions" className="w-full">
        <TabsList>
          <TabsTrigger value="decisions">Decision History</TabsTrigger>
          <TabsTrigger value="explanation">Detailed Explanation</TabsTrigger>
        </TabsList>

        {/* Decision History */}
        <TabsContent value="decisions" className="space-y-4">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Decision Audit Trail</CardTitle>
                <div className="flex items-center gap-2">
                  <Filter className="h-4 w-4" />
                  <Select value={filterBy} onValueChange={setFilterBy}>
                    <SelectTrigger className="w-40">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">All Decisions</SelectItem>
                      <SelectItem value="recent">Recent (24h)</SelectItem>
                      <SelectItem value="bias">Bias Detected</SelectItem>
                      <SelectItem value="high-risk">High Risk</SelectItem>
                      <SelectItem value="low-confidence">Low Confidence</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {filteredDecisions.map((decision) => (
                  <div 
                    key={decision.id}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-muted/50 cursor-pointer"
                    onClick={() => setSelectedDecision(decision.id)}
                  >
                    <div className="space-y-1">
                      <h4 className="font-medium">{decision.title}</h4>
                      <div className="flex items-center gap-2 text-sm text-muted-foreground">
                        <Badge variant="outline">{decision.agentType}</Badge>
                        <Clock className="h-3 w-3" />
                        {decision.timestamp.toLocaleString()}
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge variant={getRiskBadgeVariant(decision.riskLevel)}>
                        {decision.riskLevel} risk
                      </Badge>
                      {decision.biasDetected && (
                        <Badge variant="destructive">Bias</Badge>
                      )}
                      <span className={`text-sm font-medium ${getConfidenceColor(decision.confidence)}`}>
                        {decision.confidence}%
                      </span>
                      {decision.hasExplanation ? (
                        <CheckCircle className="h-4 w-4 text-green-600" />
                      ) : (
                        <AlertTriangle className="h-4 w-4 text-yellow-600" />
                      )}
                    </div>
                  </div>
                ))}
                {filteredDecisions.length === 0 && (
                  <div className="text-center py-8">
                    <Search className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                    <p className="text-muted-foreground">No decisions found matching the current filter.</p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Detailed Explanation */}
        <TabsContent value="explanation" className="space-y-4">
          {selectedDecision ? (
            <DecisionExplainer 
              decisionId={selectedDecision} 
              sessionId={sessionId} 
            />
          ) : (
            <Card>
              <CardContent className="flex items-center justify-center py-12">
                <div className="text-center space-y-2">
                  <Brain className="h-12 w-12 text-muted-foreground mx-auto" />
                  <h3 className="text-lg font-medium">Select a Decision</h3>
                  <p className="text-muted-foreground">
                    Choose a decision from the history to view its detailed explanation
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </div>
  )
}
