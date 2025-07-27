"use client";

import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { TrendingUp, Brain, Users, BarChart3, ArrowLeft, AlertCircle, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { DemoBanner } from '@/components/demo-banner';

interface MarketData {
  stocks: Array<{
    symbol: string;
    price: number;
    change: number;
    changePercent: number;
    volume: number;
  }>;
  indices: {
    sp500: { price: number; changePercent: number };
    nasdaq: { price: number; changePercent: number };
    dow: { price: number; changePercent: number };
    vix: { price: number; changePercent: number };
  };
  news: Array<{
    title: string;
    description: string;
    source: string;
    publishedAt: string;
    sentiment: 'positive' | 'negative' | 'neutral';
  }>;
  sectorPerformance: Record<string, number>;
  timestamp: string;
}

interface AgentResponse {
  summary: string;
  perspective: string;
  confidence: number;
  timestamp: string;
  agent: string;
}

interface MarketEnhancedResponse {
  sessionId: string;
  query: string;
  timestamp: string;
  scenario: {
    name: string;
    description: string;
  };
  responses: Record<string, AgentResponse>;
  marketIntelligence?: MarketData;
  synthesis?: {
    recommendation: string;
    confidence: string;
    agentCount: number;
    timestamp: string;
  };
}

export default function Phase3DemoPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [result, setResult] = useState<MarketEnhancedResponse | null>(null);
  const [marketData, setMarketData] = useState<MarketData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const demoScenario = {
    name: "Market-Informed Investment Strategy",
    description: "Evaluate current market conditions and recommend investment strategies for Q1 2025 portfolio allocation."
  };

  const testQuery = "Based on current market conditions, sector performance, and recent financial news, what investment strategies should we pursue for our Q1 2025 portfolio?";

  const fetchMarketData = async () => {
    try {
      const response = await fetch('/api/market?endpoint=overview&symbols=AAPL,GOOGL,MSFT,TSLA,NVDA,JPM');
      if (!response.ok) throw new Error('Failed to fetch market data');
      
      const data = await response.json();
      setMarketData(data.data);
    } catch (err) {
      console.error('Market data error:', err);
      setError('Unable to fetch real market data - using demo data');
    }
  };

  const testMarketEnhancedAgents = async () => {
    setIsLoading(true);
    setError(null);
    setResult(null);

    try {
      // First get market data
      await fetchMarketData();

      const response = await fetch('/api/boardroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: demoScenario,
          query: testQuery,
          includeAgents: ['ceo', 'cfo', 'cto'],
          companyName: 'InvestTech Capital',
          includeRAG: true // This now includes market intelligence
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

  const getChangeColor = (change: number) => {
    return change >= 0 ? 'text-green-600' : 'text-red-600';
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
          <TrendingUp className="h-10 w-10 text-blue-600" />
          Market Intelligence Demo
        </h1>
        <p className="text-lg text-muted-foreground mb-6">
          AI agents enhanced with real-time market data and financial intelligence
        </p>
        
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
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
                <Badge variant="outline">Live Market Data</Badge>
                <Badge variant="outline">Financial News Integration</Badge>
                <Badge variant="outline">Sector Analysis</Badge>
                <Badge variant="outline">RAG + Market Intelligence</Badge>
              </div>
            </div>
          </CardContent>
        </Card>

        <div className="flex gap-4 justify-center mb-6">
          <Button 
            onClick={fetchMarketData} 
            variant="outline"
            size="lg"
            className="flex items-center gap-2"
          >
            <RefreshCw className="h-4 w-4" />
            Fetch Live Market Data
          </Button>
          
          <Button 
            onClick={testMarketEnhancedAgents} 
            disabled={isLoading}
            size="lg"
            className="flex items-center gap-2"
          >
            <Brain className="h-4 w-4" />
            {isLoading ? 'Processing...' : 'Test Market-Enhanced Agents'}
          </Button>
        </div>
      </div>

      {marketData && (
        <Card className="mb-6">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5" />
              Current Market Intelligence
              <Badge variant="secondary">Live Data</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
              <div className="text-center">
                <div className="text-sm text-muted-foreground">S&P 500</div>
                <div className="text-lg font-semibold">${marketData.indices.sp500.price.toFixed(2)}</div>
                <div className={`text-sm ${getChangeColor(marketData.indices.sp500.changePercent)}`}>
                  {marketData.indices.sp500.changePercent > 0 ? '+' : ''}{marketData.indices.sp500.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">NASDAQ</div>
                <div className="text-lg font-semibold">${marketData.indices.nasdaq.price.toFixed(2)}</div>
                <div className={`text-sm ${getChangeColor(marketData.indices.nasdaq.changePercent)}`}>
                  {marketData.indices.nasdaq.changePercent > 0 ? '+' : ''}{marketData.indices.nasdaq.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">Dow Jones</div>
                <div className="text-lg font-semibold">${marketData.indices.dow.price.toFixed(2)}</div>
                <div className={`text-sm ${getChangeColor(marketData.indices.dow.changePercent)}`}>
                  {marketData.indices.dow.changePercent > 0 ? '+' : ''}{marketData.indices.dow.changePercent.toFixed(2)}%
                </div>
              </div>
              <div className="text-center">
                <div className="text-sm text-muted-foreground">VIX</div>
                <div className="text-lg font-semibold">{marketData.indices.vix.price.toFixed(2)}</div>
                <div className={`text-sm ${getChangeColor(marketData.indices.vix.changePercent)}`}>
                  {marketData.indices.vix.changePercent > 0 ? '+' : ''}{marketData.indices.vix.changePercent.toFixed(2)}%
                </div>
              </div>
            </div>
            
            {marketData.stocks.length > 0 && (
              <>
                <Separator className="my-4" />
                <div>
                  <h4 className="font-semibold mb-2">Key Stocks</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2 text-sm">
                    {marketData.stocks.map(stock => (
                      <div key={stock.symbol} className="flex justify-between">
                        <span>{stock.symbol}</span>
                        <span className={getChangeColor(stock.changePercent)}>
                          {stock.changePercent > 0 ? '+' : ''}{stock.changePercent.toFixed(2)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </>
            )}
            
            <div className="text-xs text-muted-foreground mt-4">
              Last updated: {new Date(marketData.timestamp).toLocaleString()}
            </div>
          </CardContent>
        </Card>
      )}

      {error && (
        <Card className="mb-6 border-red-200">
          <CardContent className="pt-6">
            <div className="text-red-600 flex items-center gap-2">
              <AlertCircle className="h-5 w-5" />
              <div>
                <strong>Demo Notice:</strong> {error}
                <div className="text-sm mt-1 text-muted-foreground">
                  This demo showcases market intelligence integration. In production, real-time market data would enhance all agent responses.
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
                Market-Enhanced Agent Responses
                <Badge variant="secondary">AI + Market Data</Badge>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid gap-4">
                {Object.entries(result.responses).map(([agent, response]) => (
                  <Card key={agent} className="border-l-4 border-l-purple-500">
                    <CardHeader className="pb-3">
                      <div className="flex items-center justify-between">
                        <CardTitle className="text-lg flex items-center gap-2">
                          <span className="text-2xl">{getAgentIcon(agent)}</span>
                          {agent} Agent
                          <Badge variant="outline">Market-Informed</Badge>
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
                          <strong className="text-sm text-muted-foreground">Market-Based Analysis:</strong>
                          <p className="mt-1">{response.summary}</p>
                        </div>
                        <Separator />
                        <div>
                          <strong className="text-sm text-muted-foreground">Full Strategic Assessment:</strong>
                          <div className="mt-1 text-sm whitespace-pre-wrap bg-muted p-3 rounded">
                            {response.perspective.length > 600 
                              ? `${response.perspective.substring(0, 600)}...`
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
                  Market-Informed Executive Synthesis
                  <Badge variant="secondary">Multi-Agent + Live Data</Badge>
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
                      Market Data Enhanced
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
                  <strong>Market Intelligence:</strong> ✅ Enabled
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      <Card className="mt-8">
        <CardHeader>
          <CardTitle>🚀 Phase 3: Market Intelligence Achievements</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Real-time market data integration (Yahoo Finance)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Financial news analysis with sentiment scoring
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Sector performance tracking and analysis
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Agent-specific market data filtering
              </div>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Market-informed decision synthesis
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Economic indicators integration (VIX, indices)
              </div>
              <div className="flex items-center gap-2">
                <span className="text-green-600">✅</span>
                Comprehensive market intelligence API
              </div>
              <div className="flex items-center gap-2">
                <span className="text-blue-600">🎯</span>
                Ready for Phase 4: Advanced Collaboration
              </div>
            </div>
          </div>
          
          <Separator className="my-4" />
          
          <div className="text-center">
            <p className="text-sm text-muted-foreground mb-3">
              This demo showcases AI agents enhanced with real-world market intelligence, financial news, and economic indicators.
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
