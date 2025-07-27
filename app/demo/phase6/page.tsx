'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Eye, 
  Brain, 
  CheckCircle, 
  AlertTriangle, 
  Clock, 
  BarChart3,
  MessageSquare,
  Star,
  Target,
  Lightbulb
} from 'lucide-react';
import { DemoBanner } from '@/components/demo-banner';

interface DecisionAuditTrail {
  id: string;
  sessionId: string;
  agentType: string;
  decision: string;
  reasoning: ReasoningStep[];
  confidence: number;
  evidenceCount: number;
  totalProcessingTime: number;
  outcome?: 'success' | 'failure' | 'pending';
  timestamp: string;
  context: {
    query: string;
    sessionType: string;
  };
}

interface ReasoningStep {
  id: string;
  stepNumber: number;
  type: 'analysis' | 'synthesis' | 'conclusion' | 'evidence' | 'assumption';
  description: string;
  evidence: Evidence[];
  confidence: number;
  timestamp: string;
  processingTime: number;
}

interface Evidence {
  id: string;
  type: 'document' | 'market_data' | 'memory' | 'collaboration' | 'external';
  source: string;
  content: string;
  relevance: number;
  reliability: number;
  citation: string;
}

interface ConfidenceBreakdown {
  overall: number;
  components: {
    evidence_quality: number;
    source_reliability: number;
    reasoning_consistency: number;
    historical_accuracy: number;
    consensus_agreement: number;
  };
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

interface ExplainabilityMetrics {
  transparency_score: number;
  reasoning_depth: number;
  evidence_coverage: number;
  user_comprehension: number;
  decision_traceability: number;
}

interface DecisionExplanation {
  summary: string;
  reasoning: string;
  evidence: string;
  confidence: string;
  recommendations: string[];
}

const AGENT_COLORS = {
  ceo: 'bg-purple-100 text-purple-800 border-purple-200',
  cfo: 'bg-blue-100 text-blue-800 border-blue-200',
  cto: 'bg-green-100 text-green-800 border-green-200',
  hr: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function Phase6Demo() {
  const [auditTrails, setAuditTrails] = useState<DecisionAuditTrail[]>([]);
  const [selectedTrail, setSelectedTrail] = useState<DecisionAuditTrail | null>(null);
  const [explanation, setExplanation] = useState<DecisionExplanation | null>(null);
  const [confidenceBreakdown, setConfidenceBreakdown] = useState<ConfidenceBreakdown | null>(null);
  const [metrics, setMetrics] = useState<Record<string, ExplainabilityMetrics>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [testQuery, setTestQuery] = useState('');
  const [selectedAgent, setSelectedAgent] = useState<string>('ceo');
  const [feedback, setFeedback] = useState('');
  const [rating, setRating] = useState(5);

  const loadAuditTrails = useCallback(async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action: 'get_audit_trails' })
      });

      const data = await response.json();
      if (data.success) {
        setAuditTrails(data.auditTrails);
      }
    } catch (error) {
      console.error('Error loading audit trails:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const loadMetrics = useCallback(async () => {
    const agentTypes = ['ceo', 'cfo', 'cto', 'hr'];
    const metricsData: Record<string, ExplainabilityMetrics> = {};

    try {
      for (const agent of agentTypes) {
        const response = await fetch('/api/explainable-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_metrics', agentType: agent })
        });

        const data = await response.json();
        if (data.success) {
          metricsData[agent] = data.metrics;
        }
      }

      setMetrics(metricsData);
    } catch (error) {
      console.error('Error loading metrics:', error);
    }
  }, []);

  useEffect(() => {
    loadAuditTrails();
    loadMetrics();
  }, [loadAuditTrails, loadMetrics]);

  const simulateDecision = async () => {
    if (!testQuery.trim()) return;

    setIsLoading(true);
    try {
      // Start tracking
      const startResponse = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'start_tracking',
          sessionId: `demo_${Date.now()}`,
          agentType: selectedAgent,
          query: testQuery,
          context: {
            sessionType: 'demo',
            documents: ['financial_report.pdf'],
            marketData: ['AAPL', 'MSFT'],
            memory: ['previous_decisions'],
            collaboration: ['team_discussion']
          }
        })
      });

      const startData = await startResponse.json();
      if (!startData.success) throw new Error('Failed to start tracking');

      const auditId = startData.auditId;

      // Add reasoning steps
      const steps = [
        {
          type: 'analysis',
          description: 'Analyzing current market conditions and financial data',
          evidence: [
            {
              type: 'market_data',
              source: 'Yahoo Finance',
              content: 'Current market indicators show positive trends',
              relevance: 0.9,
              reliability: 0.8,
              citation: '[Market Data 1]'
            }
          ],
          confidence: 0.85,
          processingTime: 1200
        },
        {
          type: 'synthesis',
          description: 'Correlating internal documents with external market signals',
          evidence: [
            {
              type: 'document',
              source: 'Q4 Financial Report',
              content: 'Revenue growth of 18% supports expansion strategy',
              relevance: 0.95,
              reliability: 0.9,
              citation: '[Doc 1]'
            }
          ],
          confidence: 0.9,
          processingTime: 800
        },
        {
          type: 'conclusion',
          description: 'Formulating recommendation based on comprehensive analysis',
          evidence: [
            {
              type: 'memory',
              source: 'Past Decision Outcomes',
              content: 'Similar decisions had 85% success rate',
              relevance: 0.8,
              reliability: 0.75,
              citation: '[Memory 1]'
            }
          ],
          confidence: 0.88,
          processingTime: 600
        }
      ];

      for (const step of steps) {
        await fetch('/api/explainable-ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            action: 'add_reasoning_step',
            auditId,
            ...step
          })
        });
      }

      // Complete tracking
      await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'complete_tracking',
          auditId,
          decision: `Based on comprehensive analysis, I recommend proceeding with ${testQuery.toLowerCase()}. The evidence supports this decision with high confidence.`,
          overallConfidence: 0.87
        })
      });

      // Reload data
      await loadAuditTrails();
      setTestQuery('');
    } catch (error) {
      console.error('Error simulating decision:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const loadDecisionDetails = async (trail: DecisionAuditTrail) => {
    setSelectedTrail(trail);
    setIsLoading(true);

    try {
      // Load explanation
      const explanationResponse = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_explanation',
          auditId: trail.id
        })
      });

      const explanationData = await explanationResponse.json();
      if (explanationData.success) {
        setExplanation(explanationData.explanation);
      }

      // Load confidence breakdown
      const confidenceResponse = await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'get_confidence_breakdown',
          auditId: trail.id
        })
      });

      const confidenceData = await confidenceResponse.json();
      if (confidenceData.success) {
        setConfidenceBreakdown(confidenceData.breakdown);
      }
    } catch (error) {
      console.error('Error loading decision details:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const submitFeedback = async () => {
    if (!selectedTrail || !feedback.trim()) return;

    try {
      await fetch('/api/explainable-ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'add_feedback',
          auditId: selectedTrail.id,
          userId: 'demo_user',
          type: 'rating',
          value: rating,
          context: feedback
        })
      });

      setFeedback('');
      setRating(5);
    } catch (error) {
      console.error('Error submitting feedback:', error);
    }
  };

  const getAgentColor = (agentType: string) => {
    return AGENT_COLORS[agentType as keyof typeof AGENT_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleString();
  };

  const agentTypes = ['ceo', 'cfo', 'cto', 'hr'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-purple-50 p-8">
      <DemoBanner />
      
      {/* Phase 6 Header */}
      <div className="max-w-7xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
            Phase 6
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            Intelligence & Transparency
          </h1>
          <p className="text-xl text-gray-600 max-w-4xl mx-auto">
            Explainable AI with decision reasoning chains, confidence analysis, and comprehensive audit trails for transparent business intelligence.
          </p>
        </div>
      </div>

      <div className="max-w-7xl mx-auto space-y-6">
        {/* Explainability Metrics Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentTypes.map((agent) => {
            const agentMetrics = metrics[agent];
            
            return (
              <Card key={agent} className="hover:shadow-md transition-shadow">
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${getAgentColor(agent).split(' ')[0]}`}></div>
                    {agent.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    Explainability Metrics
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  {agentMetrics ? (
                    <>
                      <div className="space-y-2">
                        <div className="flex justify-between text-xs">
                          <span>Transparency</span>
                          <span>{Math.round(agentMetrics.transparency_score * 100)}%</span>
                        </div>
                        <Progress value={agentMetrics.transparency_score * 100} className="h-2" />
                      </div>
                      
                      <div className="grid grid-cols-2 gap-2 text-xs">
                        <div>
                          <div className="text-gray-500">Reasoning</div>
                          <div className="font-semibold">{Math.round(agentMetrics.reasoning_depth * 100)}%</div>
                        </div>
                        <div>
                          <div className="text-gray-500">Evidence</div>
                          <div className="font-semibold">{Math.round(agentMetrics.evidence_coverage * 100)}%</div>
                        </div>
                      </div>

                      <div className="text-xs">
                        <div className="text-gray-500">User Comprehension</div>
                        <div className="font-semibold">{Math.round(agentMetrics.user_comprehension * 100)}%</div>
                      </div>
                    </>
                  ) : (
                    <div className="text-center text-gray-500 text-xs">
                      <Brain className="h-6 w-6 mx-auto mb-1 opacity-50" />
                      No metrics available
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Interactive Decision Simulation */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Decision Simulation & Transparency Testing
            </CardTitle>
            <CardDescription>
              Test explainable AI by simulating business decisions and viewing detailed reasoning chains
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Agent Type</label>
                <select
                  value={selectedAgent}
                  onChange={(e) => setSelectedAgent(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  {agentTypes.map(agent => (
                    <option key={agent} value={agent}>
                      {agent.toUpperCase()}
                    </option>
                  ))}
                </select>
              </div>
              
              <div className="col-span-2 space-y-2">
                <label className="text-sm font-medium">Business Decision Scenario</label>
                <Input
                  value={testQuery}
                  onChange={(e) => setTestQuery(e.target.value)}
                  placeholder="e.g., 'expanding into European markets with current resources'"
                  className="w-full"
                />
              </div>
            </div>

            <Button 
              onClick={simulateDecision}
              disabled={!testQuery.trim() || isLoading}
              className="flex items-center gap-2"
            >
              <Eye className="h-4 w-4" />
              Simulate & Analyze Decision
            </Button>
          </CardContent>
        </Card>

        {/* Decision Audit Trails */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Audit Trails List */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <BarChart3 className="h-5 w-5 text-blue-600" />
                Decision Audit Trails
              </CardTitle>
              <CardDescription>
                Track all AI decisions with complete reasoning transparency
              </CardDescription>
            </CardHeader>
            <CardContent>
              {auditTrails.length > 0 ? (
                <div className="space-y-3 max-h-96 overflow-y-auto">
                  {auditTrails.map(trail => (
                    <div 
                      key={trail.id} 
                      className={`border rounded-lg p-3 cursor-pointer transition-all hover:shadow-md ${
                        selectedTrail?.id === trail.id ? 'ring-2 ring-indigo-500 bg-indigo-50' : ''
                      }`}
                      onClick={() => loadDecisionDetails(trail)}
                    >
                      <div className="flex items-center justify-between mb-2">
                        <Badge className={getAgentColor(trail.agentType)}>
                          {trail.agentType.toUpperCase()}
                        </Badge>
                        <div className="flex items-center gap-2 text-xs text-gray-500">
                          <Clock className="h-3 w-3" />
                          {formatTimestamp(trail.timestamp)}
                        </div>
                      </div>
                      
                      <p className="text-sm text-gray-700 mb-2 line-clamp-2">
                        {trail.context.query}
                      </p>
                      
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center gap-3">
                          <span>Confidence: {Math.round(trail.confidence * 100)}%</span>
                          <span>Evidence: {trail.evidenceCount}</span>
                          <span>Steps: {trail.reasoning.length}</span>
                        </div>
                        {trail.outcome && (
                          <Badge className={
                            trail.outcome === 'success' ? 'bg-green-100 text-green-800' :
                            trail.outcome === 'failure' ? 'bg-red-100 text-red-800' :
                            'bg-yellow-100 text-yellow-800'
                          }>
                            {trail.outcome}
                          </Badge>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Eye className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>No audit trails available</p>
                  <p className="text-xs">Simulate a decision to see transparency in action</p>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Decision Details */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Lightbulb className="h-5 w-5 text-yellow-600" />
                Decision Analysis
              </CardTitle>
              <CardDescription>
                Detailed reasoning chains and confidence breakdown
              </CardDescription>
            </CardHeader>
            <CardContent>
              {selectedTrail ? (
                <Tabs defaultValue="reasoning" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="reasoning">Reasoning</TabsTrigger>
                    <TabsTrigger value="confidence">Confidence</TabsTrigger>
                    <TabsTrigger value="feedback">Feedback</TabsTrigger>
                  </TabsList>
                  
                  <TabsContent value="reasoning" className="space-y-4">
                    {explanation && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-2">Summary</h4>
                          <p className="text-sm text-gray-700">{explanation.summary}</p>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Reasoning Steps</h4>
                          <div className="space-y-2 text-sm">
                            {explanation.reasoning.split('\n\n').map((step, index) => (
                              <div key={index} className="bg-gray-50 p-2 rounded">
                                {step}
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div>
                          <h4 className="font-semibold mb-2">Evidence Sources</h4>
                          <p className="text-sm text-gray-700">{explanation.evidence}</p>
                        </div>
                        
                        {explanation.recommendations.length > 0 && (
                          <div>
                            <h4 className="font-semibold mb-2">Recommendations</h4>
                            <ul className="text-sm text-gray-700 list-disc list-inside space-y-1">
                              {explanation.recommendations.map((rec, index) => (
                                <li key={index}>{rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="confidence" className="space-y-4">
                    {confidenceBreakdown && (
                      <div className="space-y-4">
                        <div>
                          <h4 className="font-semibold mb-3">Confidence Components</h4>
                          <div className="space-y-2">
                            {Object.entries(confidenceBreakdown.components).map(([key, value]) => (
                              <div key={key}>
                                <div className="flex justify-between text-sm mb-1">
                                  <span className="capitalize">{key.replace('_', ' ')}</span>
                                  <span>{Math.round(value * 100)}%</span>
                                </div>
                                <Progress value={value * 100} className="h-2" />
                              </div>
                            ))}
                          </div>
                        </div>
                        
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                          <div>
                            <h5 className="font-medium text-green-700 mb-2">Positive Factors</h5>
                            <ul className="text-xs space-y-1">
                              {confidenceBreakdown.factors.positive.map((factor, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <CheckCircle className="h-3 w-3 text-green-500 mt-0.5 flex-shrink-0" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-red-700 mb-2">Risk Factors</h5>
                            <ul className="text-xs space-y-1">
                              {confidenceBreakdown.factors.negative.map((factor, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <AlertTriangle className="h-3 w-3 text-red-500 mt-0.5 flex-shrink-0" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                          
                          <div>
                            <h5 className="font-medium text-gray-700 mb-2">Context</h5>
                            <ul className="text-xs space-y-1">
                              {confidenceBreakdown.factors.neutral.map((factor, index) => (
                                <li key={index} className="flex items-start gap-1">
                                  <div className="h-3 w-3 bg-gray-400 rounded-full mt-0.5 flex-shrink-0" />
                                  {factor}
                                </li>
                              ))}
                            </ul>
                          </div>
                        </div>
                      </div>
                    )}
                  </TabsContent>
                  
                  <TabsContent value="feedback" className="space-y-4">
                    <div className="space-y-4">
                      <div>
                        <h4 className="font-semibold mb-3">Provide Feedback</h4>
                        <div className="space-y-3">
                          <div>
                            <label className="text-sm font-medium">Rating (1-5 stars)</label>
                            <div className="flex gap-1 mt-1">
                              {[1, 2, 3, 4, 5].map(star => (
                                <Star
                                  key={star}
                                  className={`h-5 w-5 cursor-pointer ${
                                    star <= rating ? 'text-yellow-400 fill-current' : 'text-gray-300'
                                  }`}
                                  onClick={() => setRating(star)}
                                />
                              ))}
                            </div>
                          </div>
                          
                          <div>
                            <label className="text-sm font-medium">Feedback</label>
                            <Textarea
                              value={feedback}
                              onChange={(e) => setFeedback(e.target.value)}
                              placeholder="How clear and helpful was this decision explanation?"
                              className="mt-1"
                              rows={3}
                            />
                          </div>
                          
                          <Button 
                            onClick={submitFeedback}
                            disabled={!feedback.trim()}
                            size="sm"
                            className="flex items-center gap-2"
                          >
                            <MessageSquare className="h-4 w-4" />
                            Submit Feedback
                          </Button>
                        </div>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              ) : (
                <div className="text-center py-8 text-gray-500">
                  <Lightbulb className="h-8 w-8 mx-auto mb-2 opacity-50" />
                  <p>Select a decision to view analysis</p>
                  <p className="text-xs">Click on any audit trail to see detailed reasoning</p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
