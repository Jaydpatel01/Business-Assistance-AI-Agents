"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { FileText, Brain, Users, TrendingUp, ArrowLeft, AlertCircle } from 'lucide-react';
import Link from 'next/link';
import { DemoBanner } from '@/components/demo-banner';

interface AgentResponse {
  summary: string;
  perspective: string;
  confidence: number;
  timestamp: string;
  agent: string;
}

interface RAGDemoResponse {
  sessionId: string;
  query: string;
  timestamp: string;
  scenario: {
    name: string;
    description: string;
  };
  responses: Record<string, AgentResponse>;
  synthesis?: {
    recommendation: string;
    confidence: string;
    agentCount: number;
    timestamp: string;
  };
}

export default function Phase2DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<RAGDemoResponse | null>(null);
  const [error, setError] = useState<string | null>(null);

  const demoScenario = {
    name: "Q1 2025 Strategic Planning",
    description: "Based on our Q4 2024 performance, we need to make strategic decisions for Q1 2025 expansion, hiring, and resource allocation."
  };

  const testQuery = "Given our recent financial performance, should we proceed with the planned international expansion and hiring goals for Q1 2025?";

  const testRAGEnhancedAgents = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      const response = await fetch('/api/boardroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: demoScenario,
          query: testQuery,
          includeAgents: ['ceo', 'cfo', 'cto', 'hr'],
          companyName: 'TechCorp Solutions'
        })
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Request failed');
      }

      const data = await response.json();
      setResult(data.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  const getAgentIcon = (agent: string) => {
    switch (agent.toLowerCase()) {
      case 'ceo': return '👑';
      case 'cfo': return '💰';
      case 'cto': return '⚡';
      case 'hr': return '👥';
      default: return '🤖';
    }
  };

  const getConfidenceColor = (confidence: number) => {
    if (confidence >= 0.8) return 'bg-green-500';
    if (confidence >= 0.6) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className="container mx-auto p-6 max-w-6xl">
      <DemoBanner className="mb-6" />
      
      <div className="mb-6">
        <Link href="/dashboard" className="flex items-center gap-2 text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4" />
          Back to Dashboard
        </Link>
      </div>

      <div className="text-center mb-8">
        <h1 className="text-4xl font-bold mb-4 flex items-center justify-center gap-3">
          <Brain className="h-10 w-10 text-blue-600" />
          RAG-Enhanced AI Agents Demo
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          Demonstrating document-informed decision making with real company data
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Demo Scenario
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-left space-y-3">
              <div>
                <strong>Scenario:</strong> {demoScenario.name}
              </div>
              <div>
                <strong>Context:</strong> {demoScenario.description}
              </div>
              <div>
                <strong>Query:</strong> "{testQuery}"
              </div>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Badge variant="outline">Q4 Financial Report Available</Badge>
                <Badge variant="outline">RAG-Enhanced Responses</Badge>
                <Badge variant="outline">Source Citations Enabled</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <Button 
          onClick={testRAGEnhancedAgents} 
          disabled={isLoading}
          size="lg"
          className="mb-6"
        >
          {isLoading ? 'Processing...' : 'Test RAG-Enhanced Agents'}
        </Button>
      </div>

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <div>
                <strong>Demo Error:</strong> {error}
                <div className="text-sm mt-1 text-muted-foreground">
                  This demo requires authentication. In a real deployment, you would be logged in to test this functionality.
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {result && (
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Agent Responses
                <Badge variant="secondary">Document-Informed</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(result.responses).map(([agent, response]) => (
                  <Card key={agent} className="border-l-4 border-l-blue-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{getAgentIcon(agent)}</span>
                          {agent} Agent
                        </CardTitle>
                        <div className="flex items-center gap-2">
                          <div 
                            className={`w-3 h-3 rounded-full ${getConfidenceColor(response.confidence)}`}
                          />
                          <span className="text-sm font-medium">
                            {(response.confidence * 100).toFixed(1)}% Confidence
                          </span>
                        </div>
                      </div>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-3">
                        <div>
                          <strong className="text-sm text-muted-foreground">Summary:</strong>
                          <p className="mt-1">{response.summary}</p>
                        </div>
                        <Separator />
                        <div>
                          <strong className="text-sm text-muted-foreground">Full Analysis:</strong>
                          <div className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                            {response.perspective.length > 500 
                              ? `${response.perspective.substring(0, 500)}...`
                              : response.perspective
                            }
                          </div>
                        </div>
                        <div className="text-xs text-muted-foreground">
                          Generated: {new Date(response.timestamp).toLocaleString()}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {result.synthesis && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Executive Synthesis
                  <Badge variant="secondary">Multi-Agent + Documents</Badge>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center gap-4 text-sm">
                    <Badge variant="outline">
                      Confidence: {result.synthesis.confidence}
                    </Badge>
                    <Badge variant="outline">
                      Agents: {result.synthesis.agentCount}
                    </Badge>
                    <Badge variant="outline">
                      Document-Backed
                    </Badge>
                  </div>
                  <div className="bg-muted p-4 rounded whitespace-pre-wrap">
                    {result.synthesis.recommendation}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    Synthesized: {new Date(result.synthesis.timestamp).toLocaleString()}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <strong>Session ID:</strong> {result.sessionId}
                </div>
                <div>
                  <strong>Timestamp:</strong> {new Date(result.timestamp).toLocaleString()}
                </div>
                <div>
                  <strong>Agents Used:</strong> {Object.keys(result.responses).length}
                </div>
                <div>
                  <strong>RAG Enabled:</strong> ✅ Yes
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>✨ RAG-Enhanced Intelligence Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                RAG system integrated with agent responses
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Document-informed decision making
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Source citations in agent analysis
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Agent-specific document filtering
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Enhanced synthesis with document backing
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Multi-document synthesis capabilities
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Graceful fallbacks when documents unavailable
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🚀</span>
                Ready for Phase 3: Market Intelligence
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              This demo showcases the transformation from simulated to document-informed AI intelligence.
            </p>
            <Link href="/dashboard" className="text-blue-600 hover:underline">
              Return to Main Application →
            </Link>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
