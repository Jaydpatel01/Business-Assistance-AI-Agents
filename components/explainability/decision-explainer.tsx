"use client"

import { useState, useEffect, useCallback } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Progress } from "@/components/ui/progress"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Separator } from "@/components/ui/separator"
import { 
  Brain, 
  FileText, 
  Users, 
  Clock, 
  CheckCircle, 
  AlertTriangle,
  Info,
  ArrowRight,
  Lightbulb,
  Target,
  Database
} from "lucide-react"

interface ReasoningStep {
  id: string
  stepType: 'analysis' | 'synthesis' | 'evaluation' | 'recommendation'
  description: string
  confidence: number
  evidence: string[]
  timestamp: Date
  agentType?: string
}

interface DecisionExplanation {
  decisionId: string
  title: string
  finalRecommendation: string
  overallConfidence: number
  reasoningSteps: ReasoningStep[]
  dataSourcesUsed: string[]
  agentsInvolved: string[]
  biasCheckResults: {
    detected: boolean
    types: string[]
    severity: 'low' | 'medium' | 'high'
  }
  alternativesConsidered: string[]
  riskFactors: string[]
  timestamp: Date
}

interface DecisionExplainerProps {
  decisionId: string
  sessionId?: string
}

export function DecisionExplainer({ decisionId, sessionId }: DecisionExplainerProps) {
  const [explanation, setExplanation] = useState<DecisionExplanation | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const fetchExplanation = useCallback(async () => {
    try {
      setIsLoading(true)
      const response = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_explanation',
          decisionId,
          sessionId
        })
      })

      if (!response.ok) {
        throw new Error('Failed to fetch explanation')
      }

      const data = await response.json()
      setExplanation(data.explanation)
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load explanation')
    } finally {
      setIsLoading(false)
    }
  }, [decisionId, sessionId])

  useEffect(() => {
    fetchExplanation()
  }, [fetchExplanation])

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Loading Decision Analysis...
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            <Progress value={33} className="w-full" />
            <p className="text-sm text-muted-foreground">Analyzing decision reasoning...</p>
          </div>
        </CardContent>
      </Card>
    )
  }

  if (error || !explanation) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2 text-destructive">
            <AlertTriangle className="h-5 w-5" />
            Explanation Unavailable
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-muted-foreground">
            {error || 'Decision explanation could not be loaded'}
          </p>
          <Button onClick={fetchExplanation} className="mt-4" variant="outline">
            Try Again
          </Button>
        </CardContent>
      </Card>
    )
  }

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 80) return "bg-green-500"
    if (confidence >= 60) return "bg-yellow-500"
    return "bg-red-500"
  }

  const getStepIcon = (stepType: string) => {
    switch (stepType) {
      case 'analysis': return <Database className="h-4 w-4" />
      case 'synthesis': return <Brain className="h-4 w-4" />
      case 'evaluation': return <Target className="h-4 w-4" />
      case 'recommendation': return <Lightbulb className="h-4 w-4" />
      default: return <Info className="h-4 w-4" />
    }
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-5 w-5" />
            Decision Explanation: {explanation.title}
          </CardTitle>
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <span className="flex items-center gap-1">
              <Clock className="h-4 w-4" />
              {explanation.timestamp.toLocaleString()}
            </span>
            <span className="flex items-center gap-1">
              <Users className="h-4 w-4" />
              {explanation.agentsInvolved.length} agents involved
            </span>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Final Recommendation */}
            <div className="space-y-2">
              <h4 className="font-semibold">Final Recommendation</h4>
              <p className="text-sm">{explanation.finalRecommendation}</p>
            </div>

            {/* Overall Confidence */}
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-sm font-medium">Overall Confidence</span>
                <Badge variant="secondary">{explanation.overallConfidence}%</Badge>
              </div>
              <Progress 
                value={explanation.overallConfidence} 
                className="w-full h-2"
              />
            </div>

            {/* Bias Check Alert */}
            {explanation.biasCheckResults.detected && (
              <div className="border border-yellow-200 bg-yellow-50 rounded-lg p-3">
                <div className="flex items-center gap-2 text-yellow-800">
                  <AlertTriangle className="h-4 w-4" />
                  <span className="font-medium">Potential Bias Detected</span>
                  <Badge variant="outline" className="text-yellow-700">
                    {explanation.biasCheckResults.severity}
                  </Badge>
                </div>
                <p className="text-sm text-yellow-700 mt-1">
                  Types: {explanation.biasCheckResults.types.join(', ')}
                </p>
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Detailed Analysis Tabs */}
      <Tabs defaultValue="reasoning" className="w-full">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="reasoning">Reasoning Steps</TabsTrigger>
          <TabsTrigger value="evidence">Evidence & Sources</TabsTrigger>
          <TabsTrigger value="alternatives">Alternatives</TabsTrigger>
          <TabsTrigger value="risks">Risk Analysis</TabsTrigger>
        </TabsList>

        {/* Reasoning Steps */}
        <TabsContent value="reasoning" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Decision Reasoning Process</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {explanation.reasoningSteps.map((step, index) => (
                  <div key={step.id} className="space-y-3">
                    <div className="flex items-start gap-3">
                      <div className="flex-shrink-0 mt-1">
                        <div className="flex items-center justify-center w-8 h-8 rounded-full bg-primary/10">
                          {getStepIcon(step.stepType)}
                        </div>
                      </div>
                      <div className="flex-1 space-y-2">
                        <div className="flex items-center justify-between">
                          <h4 className="font-medium capitalize">{step.stepType}</h4>
                          <div className="flex items-center gap-2">
                            {step.agentType && (
                              <Badge variant="outline" className="text-xs">
                                {step.agentType}
                              </Badge>
                            )}
                            <div className="flex items-center gap-1">
                              <div 
                                className={`w-2 h-2 rounded-full ${getConfidenceColor(step.confidence)}`}
                              />
                              <span className="text-xs text-muted-foreground">
                                {step.confidence}%
                              </span>
                            </div>
                          </div>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          {step.description}
                        </p>
                        {step.evidence.length > 0 && (
                          <div className="space-y-1">
                            <span className="text-xs font-medium">Evidence:</span>
                            <ul className="text-xs text-muted-foreground space-y-1">
                              {step.evidence.map((evidence, idx) => (
                                <li key={idx} className="flex items-start gap-1">
                                  <span className="text-primary">•</span>
                                  {evidence}
                                </li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                    {index < explanation.reasoningSteps.length - 1 && (
                      <div className="flex justify-center">
                        <ArrowRight className="h-4 w-4 text-muted-foreground" />
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Evidence & Sources */}
        <TabsContent value="evidence" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Data Sources & Evidence</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Agents Involved</h4>
                  <div className="flex flex-wrap gap-2">
                    {explanation.agentsInvolved.map((agent) => (
                      <Badge key={agent} variant="secondary">
                        {agent}
                      </Badge>
                    ))}
                  </div>
                </div>
                
                <Separator />
                
                <div>
                  <h4 className="font-medium mb-2">Data Sources Used</h4>
                  <div className="space-y-2">
                    {explanation.dataSourcesUsed.map((source, index) => (
                      <div key={index} className="flex items-center gap-2 text-sm">
                        <FileText className="h-4 w-4 text-muted-foreground" />
                        {source}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Alternatives Considered */}
        <TabsContent value="alternatives" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Alternative Options Considered</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {explanation.alternativesConsidered.map((alternative, index) => (
                  <div key={index} className="p-3 border rounded-lg space-y-2">
                    <div className="flex items-start gap-2">
                      <div className="flex-shrink-0 mt-1">
                        <div className="w-6 h-6 rounded-full bg-secondary flex items-center justify-center text-xs font-medium">
                          {index + 1}
                        </div>
                      </div>
                      <p className="text-sm">{alternative}</p>
                    </div>
                  </div>
                ))}
                {explanation.alternativesConsidered.length === 0 && (
                  <p className="text-sm text-muted-foreground text-center py-4">
                    No alternative options were documented for this decision.
                  </p>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Risk Analysis */}
        <TabsContent value="risks" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Risk Factors Identified</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {explanation.riskFactors.map((risk, index) => (
                  <div key={index} className="flex items-start gap-2 p-3 border border-orange-200 bg-orange-50 rounded-lg">
                    <AlertTriangle className="h-4 w-4 text-orange-600 mt-0.5 flex-shrink-0" />
                    <p className="text-sm text-orange-800">{risk}</p>
                  </div>
                ))}
                {explanation.riskFactors.length === 0 && (
                  <div className="flex items-center gap-2 p-3 border border-green-200 bg-green-50 rounded-lg">
                    <CheckCircle className="h-4 w-4 text-green-600" />
                    <p className="text-sm text-green-800">
                      No significant risk factors identified for this decision.
                    </p>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
