'use client';

import { useState, useEffect, useCallback } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Brain, Clock, TrendingUp, Lightbulb, AlertTriangle, CheckCircle, Users, Target } from 'lucide-react';
import { DemoBanner } from '@/components/demo-banner';

interface MemoryStats {
  totalMemories: number;
  successRate: number;
  mostCommonTags: string[];
  learningProgress: number;
}

interface AgentPersonality {
  agentType: string;
  traits: {
    riskTolerance: number;
    decisionSpeed: number;
    collaborationStyle: string;
    focusAreas: string[];
    biases: string[];
  };
  preferences: {
    dataTypes: string[];
    analysisDepth: string;
    communicationStyle: string;
  };
  learningRate: number;
  lastUpdated: string;
}

interface LearningPattern {
  id: string;
  patternType: string;
  description: string;
  confidence: number;
  occurrences: number;
  businessImpact: string;
}

const AGENT_COLORS = {
  ceo: 'bg-purple-100 text-purple-800 border-purple-200',
  cfo: 'bg-blue-100 text-blue-800 border-blue-200',
  cto: 'bg-green-100 text-green-800 border-green-200',
  hr: 'bg-orange-100 text-orange-800 border-orange-200'
};

export default function Phase5Demo() {
  const [memoryStats, setMemoryStats] = useState<Record<string, MemoryStats>>({});
  const [personalities, setPersonalities] = useState<Record<string, AgentPersonality>>({});
  const [patterns, setPatterns] = useState<Record<string, LearningPattern[]>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [selectedAgent, setSelectedAgent] = useState<string>('ceo');
  const [learningScenario, setLearningScenario] = useState('');
  const [advice, setAdvice] = useState<string>('');

  const loadMemoryData = useCallback(async () => {
    const agentTypes = ['ceo', 'cfo', 'cto', 'hr'];
    setIsLoading(true);
    try {
      // Load memory stats for all agents
      const statsPromises = agentTypes.map(async (agent) => {
        const response = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_stats', agentType: agent })
        });
        const data = await response.json();
        return { agent, stats: data.stats };
      });

      const personalityPromises = agentTypes.map(async (agent) => {
        const response = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_personality', agentType: agent })
        });
        const data = await response.json();
        return { agent, personality: data.personality };
      });

      const patternPromises = agentTypes.map(async (agent) => {
        const response = await fetch('/api/memory', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ action: 'get_patterns', agentType: agent })
        });
        const data = await response.json();
        return { agent, patterns: data.patterns };
      });

      const statsResults = await Promise.all(statsPromises);
      const personalityResults = await Promise.all(personalityPromises);
      const patternResults = await Promise.all(patternPromises);

      const newStats: Record<string, MemoryStats> = {};
      const newPersonalities: Record<string, AgentPersonality> = {};
      const newPatterns: Record<string, LearningPattern[]> = {};

      statsResults.forEach(({ agent, stats }) => {
        newStats[agent] = stats;
      });

      personalityResults.forEach(({ agent, personality }) => {
        newPersonalities[agent] = personality;
      });

      patternResults.forEach(({ agent, patterns }) => {
        newPatterns[agent] = patterns;
      });

      setMemoryStats(newStats);
      setPersonalities(newPersonalities);
      setPatterns(newPatterns);
    } catch (error) {
      console.error('Error loading memory data:', error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMemoryData();
  }, [loadMemoryData]);

  const generateAdvice = async () => {
    if (!learningScenario.trim()) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'generate_advice',
          agentType: selectedAgent,
          context: learningScenario
        })
      });

      const data = await response.json();
      setAdvice(data.advice);
    } catch (error) {
      console.error('Error generating advice:', error);
      setAdvice('Error generating advice. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const simulateOutcome = async (outcome: 'success' | 'failure') => {
    if (!learningScenario.trim()) return;

    setIsLoading(true);
    try {
      await fetch('/api/memory', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'learn_outcome',
          agentType: selectedAgent,
          decisionContext: learningScenario,
          decision: advice || 'Generated recommendation',
          outcome,
          businessMetrics: {
            revenue_impact: outcome === 'success' ? 15 : -5,
            efficiency_gain: outcome === 'success' ? 10 : -3,
            risk_reduction: outcome === 'success' ? 8 : -2
          }
        })
      });

      // Reload data to see the learning effects
      await loadMemoryData();
    } catch (error) {
      console.error('Error simulating outcome:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const getPersonalityColor = (agentType: string) => {
    return AGENT_COLORS[agentType as keyof typeof AGENT_COLORS] || 'bg-gray-100 text-gray-800';
  };

  const agentTypes = ['ceo', 'cfo', 'cto', 'hr'];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-white to-indigo-50 p-8">
      <DemoBanner />
      
      {/* Phase 5 Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <Badge className="bg-purple-100 text-purple-800 px-3 py-1">
            Phase 5
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            Memory & Learning Systems
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch AI agents learn from past decisions, develop personalities, and provide contextual advice based on their accumulated experience.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Agent Overview Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {agentTypes.map((agent) => {
            const stats = memoryStats[agent];
            const personality = personalities[agent];
            
            return (
              <Card key={agent} className={`cursor-pointer transition-all hover:shadow-md ${selectedAgent === agent ? 'ring-2 ring-purple-500' : ''}`}
                    onClick={() => setSelectedAgent(agent)}>
                <CardHeader className="pb-3">
                  <CardTitle className="flex items-center gap-2 text-sm">
                    <div className={`w-3 h-3 rounded-full ${getPersonalityColor(agent).split(' ')[0]}`}></div>
                    {agent.toUpperCase()}
                  </CardTitle>
                  <CardDescription className="text-xs">
                    {personality?.traits.collaborationStyle || 'Learning...'}
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="space-y-2">
                    <div className="flex justify-between text-xs">
                      <span>Learning Progress</span>
                      <span>{Math.round((stats?.learningProgress || 0) * 100)}%</span>
                    </div>
                    <Progress value={(stats?.learningProgress || 0) * 100} className="h-2" />
                  </div>
                  
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <div className="text-gray-500">Memories</div>
                      <div className="font-semibold">{stats?.totalMemories || 0}</div>
                    </div>
                    <div>
                      <div className="text-gray-500">Success Rate</div>
                      <div className="font-semibold">{Math.round((stats?.successRate || 0) * 100)}%</div>
                    </div>
                  </div>

                  {stats?.mostCommonTags && stats.mostCommonTags.length > 0 && (
                    <div className="flex flex-wrap gap-1">
                      {stats.mostCommonTags.slice(0, 2).map(tag => (
                        <Badge key={tag} variant="outline" className="text-xs px-1 py-0">
                          {tag}
                        </Badge>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>

        {/* Selected Agent Deep Dive */}
        {selectedAgent && personalities[selectedAgent] && (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Personality Profile */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Users className="h-5 w-5 text-purple-600" />
                  {selectedAgent.toUpperCase()} Personality Profile
                </CardTitle>
                <CardDescription>
                  Current personality traits and learned preferences
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Risk Tolerance</span>
                      <span>{Math.round(personalities[selectedAgent].traits.riskTolerance * 100)}%</span>
                    </div>
                    <Progress value={personalities[selectedAgent].traits.riskTolerance * 100} className="h-2" />
                  </div>
                  
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Decision Speed</span>
                      <span>{Math.round(personalities[selectedAgent].traits.decisionSpeed * 100)}%</span>
                    </div>
                    <Progress value={personalities[selectedAgent].traits.decisionSpeed * 100} className="h-2" />
                  </div>

                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Learning Rate</span>
                      <span>{Math.round(personalities[selectedAgent].learningRate * 100)}%</span>
                    </div>
                    <Progress value={personalities[selectedAgent].learningRate * 100} className="h-2" />
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Focus Areas</h4>
                  <div className="flex flex-wrap gap-1">
                    {personalities[selectedAgent].traits.focusAreas.map(area => (
                      <Badge key={area} className={getPersonalityColor(selectedAgent)}>
                        {area}
                      </Badge>
                    ))}
                  </div>
                </div>

                <div className="space-y-2">
                  <h4 className="font-semibold text-sm">Communication Style</h4>
                  <Badge variant="outline">
                    {personalities[selectedAgent].preferences.communicationStyle}
                  </Badge>
                </div>
              </CardContent>
            </Card>

            {/* Learned Patterns */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  Learned Patterns
                </CardTitle>
                <CardDescription>
                  Patterns discovered from past experiences
                </CardDescription>
              </CardHeader>
              <CardContent>
                {patterns[selectedAgent]?.length > 0 ? (
                  <div className="space-y-3">
                    {patterns[selectedAgent].map(pattern => (
                      <div key={pattern.id} className="border rounded-lg p-3 space-y-2">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center gap-2">
                            {pattern.patternType === 'success_factor' ? (
                              <CheckCircle className="h-4 w-4 text-green-500" />
                            ) : pattern.patternType === 'failure_mode' ? (
                              <AlertTriangle className="h-4 w-4 text-red-500" />
                            ) : (
                              <Lightbulb className="h-4 w-4 text-yellow-500" />
                            )}
                            <Badge className={
                              pattern.patternType === 'success_factor' ? 'bg-green-100 text-green-800' :
                              pattern.patternType === 'failure_mode' ? 'bg-red-100 text-red-800' :
                              'bg-yellow-100 text-yellow-800'
                            }>
                              {pattern.patternType.replace('_', ' ')}
                            </Badge>
                          </div>
                          <Badge variant="outline">
                            {Math.round(pattern.confidence * 100)}% confidence
                          </Badge>
                        </div>
                        <p className="text-sm text-gray-700">{pattern.description}</p>
                        <div className="flex justify-between text-xs text-gray-500">
                          <span>Seen {pattern.occurrences} times</span>
                          <span className={`font-semibold ${
                            pattern.businessImpact === 'high' ? 'text-red-600' :
                            pattern.businessImpact === 'medium' ? 'text-yellow-600' :
                            'text-green-600'
                          }`}>
                            {pattern.businessImpact} impact
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                  <div className="text-center py-6 text-gray-500">
                    <Brain className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    <p>No patterns learned yet</p>
                    <p className="text-xs">Agent needs more experience to identify patterns</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Interactive Learning Demo */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5 text-indigo-600" />
              Interactive Learning Demo
            </CardTitle>
            <CardDescription>
              Test how agents learn from scenarios and provide contextual advice
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-2">
              <label className="text-sm font-medium">Business Scenario</label>
              <textarea
                value={learningScenario}
                onChange={(e) => setLearningScenario(e.target.value)}
                placeholder="Enter a business scenario (e.g., 'Deciding whether to expand into international markets during economic uncertainty')"
                className="w-full p-3 border border-gray-300 rounded-md resize-none h-20"
              />
            </div>

            <div className="flex gap-2">
              <Button 
                onClick={generateAdvice}
                disabled={!learningScenario.trim() || isLoading}
                className="flex items-center gap-2"
              >
                <Brain className="h-4 w-4" />
                Get {selectedAgent.toUpperCase()} Advice
              </Button>
            </div>

            {advice && (
              <div className="border rounded-lg p-4 bg-gray-50">
                <h4 className="font-semibold mb-2 flex items-center gap-2">
                  <Lightbulb className="h-4 w-4 text-yellow-500" />
                  {selectedAgent.toUpperCase()} Advice:
                </h4>
                <div className="text-sm text-gray-700 whitespace-pre-wrap">{advice}</div>
                
                <div className="mt-4 flex gap-2">
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => simulateOutcome('success')}
                    disabled={isLoading}
                    className="text-green-700 border-green-300 hover:bg-green-50"
                  >
                    <CheckCircle className="h-3 w-3 mr-1" />
                    Simulate Success
                  </Button>
                  <Button 
                    size="sm" 
                    variant="outline" 
                    onClick={() => simulateOutcome('failure')}
                    disabled={isLoading}
                    className="text-red-700 border-red-300 hover:bg-red-50"
                  >
                    <AlertTriangle className="h-3 w-3 mr-1" />
                    Simulate Failure
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Learning Progress Overview */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Clock className="h-5 w-5 text-blue-600" />
              Learning Progress Overview
            </CardTitle>
            <CardDescription>
              How each agent's intelligence evolves over time
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {agentTypes.map(agent => {
                const stats = memoryStats[agent];
                const personality = personalities[agent];
                
                return (
                  <div key={agent} className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold flex items-center gap-2">
                        <div className={`w-3 h-3 rounded-full ${getPersonalityColor(agent).split(' ')[0]}`}></div>
                        {agent.toUpperCase()}
                      </h4>
                      <Badge className={getPersonalityColor(agent)}>
                        {Math.round((stats?.learningProgress || 0) * 100)}% learned
                      </Badge>
                    </div>
                    
                    <div className="grid grid-cols-3 gap-3 text-xs">
                      <div className="text-center">
                        <div className="text-gray-500">Memories</div>
                        <div className="font-semibold text-lg">{stats?.totalMemories || 0}</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Success Rate</div>
                        <div className="font-semibold text-lg">{Math.round((stats?.successRate || 0) * 100)}%</div>
                      </div>
                      <div className="text-center">
                        <div className="text-gray-500">Patterns</div>
                        <div className="font-semibold text-lg">{patterns[agent]?.length || 0}</div>
                      </div>
                    </div>

                    <Progress value={(stats?.learningProgress || 0) * 100} className="h-2" />
                    
                    {personality && (
                      <div className="text-xs text-gray-600">
                        Risk tolerance: {Math.round(personality.traits.riskTolerance * 100)}% • 
                        Decision speed: {Math.round(personality.traits.decisionSpeed * 100)}% • 
                        Learning rate: {Math.round(personality.learningRate * 100)}%
                      </div>
                    )}
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
