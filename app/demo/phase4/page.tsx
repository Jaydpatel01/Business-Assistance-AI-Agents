'use client';

import { useState, useEffect, useRef } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '../../../components/ui/card';
import { Button } from '../../../components/ui/button';
import { Badge } from '../../../components/ui/badge';
import { Textarea } from '../../../components/ui/textarea';
import { Clock, Users, MessageSquare, CheckCircle, AlertTriangle, Brain } from 'lucide-react';
import { DemoBanner } from '../../../components/demo-banner';

interface AgentEvent {
  id: string;
  type: 'proposal' | 'question' | 'challenge' | 'agreement' | 'synthesis';
  fromAgent: string;
  content: string;
  timestamp: Date;
  confidence?: number;
}

interface Discussion {
  id: string;
  topic: string;
  participants: string[];
  status: 'active' | 'consensus_reached' | 'needs_more_input';
  events: AgentEvent[];
  consensus?: {
    decision: string;
    confidence: number;
    supportingAgents: string[];
    reasoning: string;
  };
  startTime: Date;
  endTime?: Date;
}

const AGENT_COLORS = {
  CEO: 'bg-purple-100 text-purple-800 border-purple-200',
  CFO: 'bg-green-100 text-green-800 border-green-200',
  CTO: 'bg-blue-100 text-blue-800 border-blue-200',
  HR: 'bg-orange-100 text-orange-800 border-orange-200'
};

const AGENT_AVATARS = {
  CEO: '👑',
  CFO: '💰',
  CTO: '🔧',
  HR: '👥'
};

export default function Phase4Demo() {
  const [discussion, setDiscussion] = useState<Discussion | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [userQuestion, setUserQuestion] = useState('');
  const [error, setError] = useState<string | null>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  const startCollaboration = async () => {
    if (!userQuestion.trim()) {
      setError('Please enter a question or scenario for the agents to discuss');
      return;
    }

    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch('/api/collaboration', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          action: 'start_collaboration',
          sessionId: 'demo-session-' + Date.now(),
          plan: {
            discussionTopic: userQuestion,
            requiredAgents: ['ceo', 'cfo', 'cto', 'hr'], // Use lowercase for API
            maxRounds: 3,
            consensusThreshold: 0.7,
            timeoutMinutes: 10,
            facilitator: 'ceo'
          },
          context: userQuestion,
          userMessage: userQuestion
        }),
      });

      const data = await response.json();

      if (data.success) {
        // Poll for discussion updates
        await pollDiscussionUpdates(data.discussion.id);
      } else {
        setError(data.error || 'Failed to start collaboration');
      }
    } catch (error) {
      console.error('Error starting collaboration:', error);
      setError('Failed to start collaboration. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const pollDiscussionUpdates = async (discussionId: string) => {
    const maxPolls = 60; // 60 seconds max polling for longer discussions
    let pollCount = 0;
    let lastEventCount = 0;

    const poll = async () => {
      try {
        const response = await fetch('/api/collaboration', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            action: 'get_discussion',
            discussionId
          }),
        });

        const data = await response.json();

        if (data.success) {
          const currentDiscussion = data.discussion;
          
          // Update discussion state
          setDiscussion(currentDiscussion);

          // Check if new events were added to show live updates
          if (currentDiscussion.events.length > lastEventCount) {
            lastEventCount = currentDiscussion.events.length;
            console.log(`New agent responses: ${currentDiscussion.events.length} total events`);
          }

          // Continue polling if discussion is still active
          if (currentDiscussion.status === 'active' && pollCount < maxPolls) {
            pollCount++;
            setTimeout(poll, 1000); // Poll every 1 second for real-time updates
          } else {
            console.log(`Discussion completed with status: ${currentDiscussion.status}`);
          }
        }
      } catch (error) {
        console.error('Error polling discussion:', error);
      }
    };

    // Start polling immediately
    poll();
  };

  const getEventIcon = (type: string) => {
    switch (type) {
      case 'proposal': return '💡';
      case 'question': return '❓';
      case 'challenge': return '⚡';
      case 'agreement': return '✅';
      case 'synthesis': return '🎯';
      default: return '💬';
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'active': return <Clock className="h-4 w-4 text-yellow-500" />;
      case 'consensus_reached': return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'needs_more_input': return <AlertTriangle className="h-4 w-4 text-orange-500" />;
      default: return <MessageSquare className="h-4 w-4" />;
    }
  };

  // Auto-scroll to latest messages
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [discussion?.events]);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 via-white to-cyan-50 p-8">
      <DemoBanner />
      
      {/* Phase 4 Header */}
      <div className="max-w-6xl mx-auto mb-8">
        <div className="text-center space-y-4">
          <Badge className="bg-indigo-100 text-indigo-800 px-3 py-1">
            Phase 4
          </Badge>
          <h1 className="text-4xl font-bold text-gray-900">
            Advanced Multi-Agent Collaboration
          </h1>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Watch AI agents engage in collaborative reasoning, debate key points, and reach consensus on complex business decisions.
          </p>
        </div>
      </div>

      <div className="max-w-6xl mx-auto space-y-6">
        {/* Input Section */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Brain className="h-5 w-5 text-indigo-600" />
              Start Agent Collaboration
            </CardTitle>
            <CardDescription>
              Enter a complex business question or scenario for the AI agents to discuss and reach consensus on.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Textarea
              placeholder="e.g., Should we expand to European markets next quarter? Consider the financial implications, technical requirements, and HR needs..."
              value={userQuestion}
              onChange={(e) => setUserQuestion(e.target.value)}
              rows={3}
              className="w-full"
            />
            <div className="flex justify-between items-center">
              <p className="text-sm text-gray-600">
                The agents will engage in multi-round discussions to reach consensus
              </p>
              <Button 
                onClick={startCollaboration}
                disabled={isLoading || !userQuestion.trim()}
                className="min-w-[120px]"
              >
                {isLoading ? 'Starting...' : 'Start Discussion'}
              </Button>
            </div>
            {error && (
              <div className="p-3 bg-red-50 border border-red-200 rounded-md text-red-700 text-sm">
                {error}
              </div>
            )}
          </CardContent>
        </Card>

        {/* Discussion Display */}
        {discussion && (
          <div className="space-y-6">
            {/* Discussion Overview with Progress */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="flex items-center gap-2">
                    <Users className="h-5 w-5" />
                    Discussion: {discussion.topic}
                  </span>
                  <div className="flex items-center gap-2">
                    {getStatusIcon(discussion.status)}
                    <Badge variant={discussion.status === 'consensus_reached' ? 'default' : 'secondary'}>
                      {discussion.status.replace('_', ' ').toUpperCase()}
                    </Badge>
                  </div>
                </CardTitle>
                <CardDescription>
                  Started {new Date(discussion.startTime).toLocaleTimeString()} • 
                  Participants: {discussion.participants.join(', ')} • 
                  {discussion.events.length} messages
                </CardDescription>
                
                {/* Discussion Progress Indicator */}
                <div className="mt-4 space-y-2">
                  <div className="text-sm font-medium text-gray-700">Discussion Progress:</div>
                  <div className="flex items-center space-x-4">
                    <div className={`flex items-center gap-2 text-sm ${
                      discussion.events.some(e => e.type === 'proposal') ? 'text-green-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        discussion.events.some(e => e.type === 'proposal') ? 'bg-green-500' : 'bg-gray-300'
                      }`}></div>
                      Initial Proposals
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      discussion.events.some(e => e.type === 'challenge') ? 'text-orange-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        discussion.events.some(e => e.type === 'challenge') ? 'bg-orange-500' : 'bg-gray-300'
                      }`}></div>
                      Debate & Challenges
                    </div>
                    <div className={`flex items-center gap-2 text-sm ${
                      discussion.events.some(e => e.type === 'synthesis') ? 'text-purple-600' : 'text-gray-400'
                    }`}>
                      <div className={`w-3 h-3 rounded-full ${
                        discussion.events.some(e => e.type === 'synthesis') ? 'bg-purple-500' : 'bg-gray-300'
                      }`}></div>
                      Consensus Building
                    </div>
                  </div>
                </div>
              </CardHeader>
            </Card>

            {/* Agent Conversation */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span>Live Boardroom Discussion</span>
                  {discussion.status === 'active' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="animate-pulse w-2 h-2 bg-red-500 rounded-full"></div>
                      <span className="text-red-600 font-medium">LIVE</span>
                      <span className="text-gray-500">• {discussion.events.length} messages</span>
                    </div>
                  )}
                  {discussion.status !== 'active' && (
                    <div className="flex items-center gap-2 text-sm">
                      <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                      <span className="text-green-600 font-medium">COMPLETE</span>
                      <span className="text-gray-500">• {discussion.events.length} messages</span>
                    </div>
                  )}
                </CardTitle>
                <CardDescription>
                  {discussion.status === 'active' 
                    ? 'Agents are collaborating in real-time...' 
                    : 'Discussion completed - review the full conversation thread'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4 max-h-96 overflow-y-auto">
                  {discussion.events.length === 0 && discussion.status === 'active' && (
                    <div className="flex items-center justify-center py-8 text-gray-500">
                      <div className="text-center space-y-2">
                        <div className="animate-spin h-6 w-6 border-2 border-indigo-500 border-t-transparent rounded-full mx-auto"></div>
                        <p>Agents are thinking...</p>
                      </div>
                    </div>
                  )}
                  
                  {discussion.events.map((event) => (
                    <div key={event.id} className="flex gap-3 p-3 rounded-lg border border-gray-100 hover:border-gray-200 transition-colors">
                      <div className="flex-shrink-0">
                        <div className={`
                          w-10 h-10 rounded-full flex items-center justify-center text-sm font-semibold shadow-sm
                          ${AGENT_COLORS[event.fromAgent as keyof typeof AGENT_COLORS] || 'bg-gray-100 text-gray-800'}
                        `}>
                          {AGENT_AVATARS[event.fromAgent as keyof typeof AGENT_AVATARS] || '🤖'}
                        </div>
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-2">
                          <span className="font-semibold text-sm">{event.fromAgent}</span>
                          <span className="text-sm">{getEventIcon(event.type)}</span>
                          <Badge 
                            variant="outline" 
                            className={`text-xs ${
                              event.type === 'proposal' ? 'bg-blue-50 text-blue-700 border-blue-200' :
                              event.type === 'challenge' ? 'bg-orange-50 text-orange-700 border-orange-200' :
                              event.type === 'agreement' ? 'bg-green-50 text-green-700 border-green-200' :
                              event.type === 'synthesis' ? 'bg-purple-50 text-purple-700 border-purple-200' :
                              'bg-gray-50 text-gray-700 border-gray-200'
                            }`}
                          >
                            {event.type}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {new Date(event.timestamp).toLocaleTimeString()}
                          </span>
                          {event.confidence && (
                            <Badge variant="secondary" className="text-xs">
                              {Math.round(event.confidence * 100)}% confident
                            </Badge>
                          )}
                        </div>
                        
                        {/* Agent Response Content */}
                        <div className="bg-gray-50 rounded-md p-3 border-l-4 border-l-indigo-500">
                          <p className="text-sm text-gray-700 leading-relaxed whitespace-pre-wrap">
                            {event.content}
                          </p>
                        </div>
                        
                        {/* Real-time typing indicator for active discussions */}
                        {discussion.status === 'active' && 
                         event.id === discussion.events[discussion.events.length - 1]?.id && (
                          <div className="mt-2 flex items-center gap-2 text-xs text-gray-500 italic">
                            <div className="flex space-x-1">
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce"></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.1s'}}></div>
                              <div className="w-1 h-1 bg-gray-400 rounded-full animate-bounce" style={{animationDelay: '0.2s'}}></div>
                            </div>
                            Other agents are responding...
                          </div>
                        )}
                      </div>
                    </div>
                  ))}
                  
                  {discussion.status === 'active' && discussion.events.length > 0 && (
                    <div className="flex items-center gap-2 text-sm text-indigo-600 italic bg-indigo-50 p-3 rounded-lg border border-indigo-200">
                      <div className="animate-pulse w-2 h-2 bg-indigo-500 rounded-full"></div>
                      Discussion in progress... Agents are analyzing and responding
                    </div>
                  )}
                  <div ref={messagesEndRef} />
                </div>
              </CardContent>
            </Card>

            {/* Consensus Results */}
            {discussion.consensus && (
              <Card className="border-green-200 bg-green-50">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-green-800">
                    <CheckCircle className="h-5 w-5" />
                    Consensus Reached
                  </CardTitle>
                  <CardDescription className="text-green-700">
                    The agents have reached a collaborative decision with {Math.round(discussion.consensus.confidence * 100)}% confidence
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Final Decision:</h4>
                    <p className="text-green-700 bg-white p-3 rounded border border-green-200">
                      {discussion.consensus.decision}
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Supporting Agents:</h4>
                      <div className="flex flex-wrap gap-1">
                        {discussion.consensus.supportingAgents.map(agent => (
                          <Badge key={agent} className="bg-green-100 text-green-800">
                            {AGENT_AVATARS[agent as keyof typeof AGENT_AVATARS]} {agent}
                          </Badge>
                        ))}
                      </div>
                    </div>
                    
                    <div>
                      <h4 className="font-semibold text-green-800 mb-2">Confidence Level:</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-green-200 rounded-full h-2">
                          <div 
                            className="bg-green-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${discussion.consensus.confidence * 100}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-semibold text-green-800">
                          {Math.round(discussion.consensus.confidence * 100)}%
                        </span>
                      </div>
                    </div>
                  </div>
                  
                  <div>
                    <h4 className="font-semibold text-green-800 mb-2">Reasoning:</h4>
                    <p className="text-green-700 text-sm">
                      {discussion.consensus.reasoning}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        )}

        {/* Feature Highlights */}
        <Card>
          <CardHeader>
            <CardTitle>🚀 Phase 4 Features</CardTitle>
            <CardDescription>Advanced Multi-Agent Collaboration Capabilities</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Agent-to-Agent Communication</h4>
                <p className="text-xs text-gray-600">Agents respond to each other's proposals and build on ideas</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Multi-Round Debates</h4>
                <p className="text-xs text-gray-600">Iterative discussions with challenges and counterarguments</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Consensus Building</h4>
                <p className="text-xs text-gray-600">Automated synthesis of perspectives into unified decisions</p>
              </div>
              <div className="space-y-2">
                <h4 className="font-semibold text-sm">Confidence Tracking</h4>
                <p className="text-xs text-gray-600">Real-time confidence levels and agreement measurement</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
