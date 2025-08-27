"use client"

import { useMemo, useState, useCallback, useEffect } from "react"
import { BoardroomHeader } from "@/components/boardroom/BoardroomHeader"
import { StreamingMessageList } from "@/components/boardroom/StreamingMessageList"
import { MessageInput } from "@/components/boardroom/MessageInput"
import { AgentSelector } from "@/components/boardroom/AgentSelector"
import { BoardroomProgress } from "@/components/boardroom/BoardroomProgress"
import { DocumentContext } from "@/components/boardroom/DocumentContext"
import { DocumentSelector } from "@/components/boardroom/DocumentSelector"
import DecisionSupport from "@/components/decision/DecisionSupport"
import { DecisionRecommendation } from "@/lib/ai/decision-engine"
import { LiveParticipants } from "@/components/live-participants"
import { useStreamingBoardroom } from "@/hooks/use-streaming-boardroom"
import { useBoardroomSession } from "@/hooks/useBoardroomSession"
import { useDemoStreaming } from "@/hooks/use-demo-streaming"
import { useDemoMode } from "@/hooks/use-demo-mode"
import { getDemoScenario } from "@/lib/demo/demo-scenarios"
import { ExecutiveRole } from "@/types/executive"
import { Button } from "@/components/ui/button"
import { StopCircle } from "lucide-react"

interface ExecutiveBoardroomProps {
  sessionId: string
}

const EXECUTIVE_AGENTS = [
  {
    id: ExecutiveRole.CEO,
    name: "CEO",
    fullTitle: "Chief Executive Officer",
    color: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
    expertise: "Strategic Vision & Leadership",
  },
  {
    id: ExecutiveRole.CFO,
    name: "CFO",
    fullTitle: "Chief Financial Officer",
    color: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300",
    expertise: "Financial Analysis & Risk",
  },
  {
    id: ExecutiveRole.CTO,
    name: "CTO",
    fullTitle: "Chief Technology Officer",
    color: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
    expertise: "Technology Strategy & Innovation",
  },
  {
    id: ExecutiveRole.CHRO,
    name: "HR Director",
    fullTitle: "Human Resources Director",
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    expertise: "People & Organizational Culture",
  },
]

export function ExecutiveBoardroom({ sessionId }: ExecutiveBoardroomProps) {
  const [showDocumentContext, setShowDocumentContext] = useState(true)
  const [selectedDocuments, setSelectedDocuments] = useState<string[]>([])
  const [isAnalyzingDecision, setIsAnalyzingDecision] = useState(false)
  const [decisionRecommendation, setDecisionRecommendation] = useState<DecisionRecommendation | null>(null)
  const [selectedAgents, setSelectedAgents] = useState<string[]>([ExecutiveRole.CEO, ExecutiveRole.CFO])
  
  const { isDemo } = useDemoMode()
  
  const {
    sessionData,
    exportSummary
  } = useBoardroomSession({ sessionId })

  // Use streaming boardroom hook for production
  const {
    state: streamingState,
    startStreamingDiscussion,
    stopStreaming,
  } = useStreamingBoardroom({
    onMessageComplete: (message) => {
      console.log('Message completed:', message)
    },
    onSessionComplete: (sessionId) => {
      console.log('Session completed:', sessionId)
    }
  })

  // Use demo streaming hook for demo mode
  const {
    state: demoState,
    startDemoDiscussion,
    stopStreaming: stopDemoStreaming,
  } = useDemoStreaming({
    onMessageComplete: (message) => {
      console.log('Demo message completed:', message)
    },
    onSessionComplete: (sessionId) => {
      console.log('Demo session completed:', sessionId)
    }
  })

  // Use appropriate state based on demo mode
  const currentState = isDemo ? demoState : streamingState
  const currentStopFunction = isDemo ? stopDemoStreaming : stopStreaming

  // Auto-select agents for demo mode based on scenario
  useEffect(() => {
    console.log('🔍 ExecutiveBoardroom agent selection effect triggered')
    console.log('- isDemo:', isDemo)
    console.log('- sessionData?.scenario?.id:', sessionData?.scenario?.id)
    console.log('- current selectedAgents:', selectedAgents)
    
    // Check URL for demo mode as well
    const isDemoFromUrl = typeof window !== 'undefined' && (
      window.location.search.includes('demo=true') || 
      window.location.pathname.includes('/demo-')
    )
    
    console.log('- isDemoFromUrl:', isDemoFromUrl)
    
    if ((isDemo || isDemoFromUrl) && sessionData?.scenario?.id) {
      const demoScenario = getDemoScenario(sessionData.scenario.id)
      console.log('- demoScenario found:', demoScenario ? 'yes' : 'no')
      
      if (demoScenario && demoScenario.recommendedAgents.length > 0) {
        // Only set agents if they're different to avoid loops
        const currentAgentsStr = selectedAgents.sort().join(',')
        const newAgentsStr = demoScenario.recommendedAgents.sort().join(',')
        
        if (currentAgentsStr !== newAgentsStr) {
          console.log('🎭 Auto-selecting agents for demo:', demoScenario.recommendedAgents)
          setSelectedAgents(demoScenario.recommendedAgents)
        }
      }
    }
  }, [isDemo, sessionData?.scenario?.id, selectedAgents])

  // Function to analyze decision with AI
  const handleDecisionAnalysis = useCallback(async () => {
    if (!sessionData.scenario) return;

    // Use the actual session ID from streaming state, fallback to URL sessionId
    const actualSessionId = streamingState.sessionId || sessionId;
    
    if (!actualSessionId) {
      console.error('❌ No session ID available for decision analysis');
      return;
    }

    // Ensure we have some discussion content before analyzing
    if (streamingState.messages.length === 0) {
      console.warn('⚠️ No messages in session yet, decision analysis may use limited data');
    }

    setIsAnalyzingDecision(true);
    try {
      console.log(`🧠 Starting decision analysis for session: ${actualSessionId}`);
      
      const response = await fetch('/api/decision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId: actualSessionId,
          scenario: sessionData.scenario.name || sessionData.scenario.description || 'General Business Discussion',
          participants: selectedAgents.map(agent => EXECUTIVE_AGENTS.find(a => a.id === agent)?.name || agent),
          timeline: '3-6 months',
          riskTolerance: 'medium',
          organizationType: 'Technology Company',
          documents: selectedDocuments
        })
      });

      const result = await response.json();
      if (result.success) {
        setDecisionRecommendation(result.data.recommendation);
        console.log('🎯 Decision analysis completed:', result.data.recommendation.recommendation);
      } else {
        console.error('❌ Decision analysis failed:', result.error);
      }
    } catch (error) {
      console.error('❌ Decision analysis failed:', error);
    } finally {
      setIsAnalyzingDecision(false);
    }
  }, [sessionId, sessionData.scenario, selectedAgents, selectedDocuments, streamingState.sessionId, streamingState.messages.length]);

  // Memoize current user for LiveParticipants to prevent re-renders
  const currentUser = useMemo(() => ({
    id: "current-user",
    name: "Executive",
    avatar: undefined
  }), [])

  // Calculate progress data based on streaming state
  const progressData = useMemo(() => {
    const messageCount = currentState.messages.length
    const completedAgentMessages = currentState.messages.filter(msg => 
      msg.agentType !== 'user' && msg.isComplete
    ).length
    
    const progress = messageCount > 0 ? Math.min((completedAgentMessages / selectedAgents.length) * 100, 100) : 0
    
    return {
      progress,
      activeAgents: selectedAgents,
      completedSteps: progress > 50 ? ['initialization', 'agent_analysis'] : ['initialization'],
      currentStep: progress < 25 ? 'initialization' 
                  : progress < 50 ? 'agent_analysis'
                  : progress < 75 ? 'discussion'
                  : progress < 95 ? 'synthesis'
                  : 'summary'
    }
  }, [currentState.messages, selectedAgents])

  // Remove unused variables and fix TypeScript errors
  const handleAgentToggle = useCallback((agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }, [])

  // Wrapper function to start streaming discussion
  const handleSendMessage = useCallback(async (message: string) => {
    console.log('🔍 handleSendMessage called with:', message)
    console.log('- selectedAgents:', selectedAgents)
    console.log('- isDemo:', isDemo)
    console.log('- sessionData.scenario?.id:', sessionData.scenario?.id)
    
    if (selectedAgents.length === 0) {
      console.log('❌ No agents selected, returning')
      return
    }

    // Check URL for demo mode as well
    const isDemoFromUrl = typeof window !== 'undefined' && (
      window.location.search.includes('demo=true') || 
      window.location.pathname.includes('/demo-')
    )
    
    console.log('- isDemoFromUrl:', isDemoFromUrl)

    if (isDemo || isDemoFromUrl) {
      console.log('🎭 Demo mode: Starting demo discussion')
      // Use demo streaming with pre-written responses
      await startDemoDiscussion(message, selectedAgents, sessionData.scenario?.id)
    } else {
      console.log('🔄 Production mode: Starting streaming discussion')
      // Build conversation history from current messages
      const conversationHistory = streamingState.messages
        .filter(msg => msg.agentType !== 'user' && msg.agentType !== 'system' && msg.isComplete)
        .map(msg => ({
          agentType: msg.agentType,
          content: msg.content,
          timestamp: msg.timestamp.toISOString()
        }))

      await startStreamingDiscussion({
        scenario: sessionData.scenario,
        query: message,
        includeAgents: selectedAgents,
        sessionId: sessionId,
        selectedDocuments,
        conversationHistory,
        maxRounds: 3, // Allow up to 3 rounds of discussion
        autoConclusion: true // Enable auto-conclusion when agents reach recommendations
      })
    }
  }, [isDemo, selectedAgents, startDemoDiscussion, sessionData.scenario, streamingState.messages, startStreamingDiscussion, sessionId, selectedDocuments])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Demo Mode Banner - show if URL indicates demo or traditional demo mode */}
      {(isDemo || (typeof window !== 'undefined' && (window.location.search.includes('demo=true') || window.location.pathname.includes('/demo-')))) && (
        <div className="bg-gradient-to-r from-blue-50 to-indigo-50 dark:from-blue-950 dark:to-indigo-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
          <div className="flex items-center gap-3">
            <div className="flex-shrink-0">
              <div className="w-8 h-8 bg-blue-100 dark:bg-blue-900 rounded-full flex items-center justify-center">
                🎭
              </div>
            </div>
            <div>
              <h3 className="text-sm font-medium text-blue-900 dark:text-blue-100">
                Demo Mode Active
              </h3>
              <p className="text-sm text-blue-700 dark:text-blue-300">
                You're experiencing a demo with pre-written responses. All data is simulated and not saved.
                <br />
                <span className="text-xs opacity-75">
                  Session ID: {sessionId} | Scenario: {sessionData.scenario?.id} | Selected Agents: {selectedAgents.join(', ')}
                </span>
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Session Header */}
      <BoardroomHeader 
        sessionId={sessionId}
        sessionName={sessionData.name}
        scenarioName={sessionData.scenario.name}
        scenarioDescription={sessionData.scenario.description}
        status={'active' as 'preparing' | 'active' | 'completed' | 'paused'}
        startTime={new Date()}
        participantCount={selectedAgents.length}
        messageCount={currentState.messages.length}
        progress={progressData.progress}
        onExport={exportSummary}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Discussion Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Agent Selection */}
          <AgentSelector
            agents={EXECUTIVE_AGENTS}
            selectedAgents={selectedAgents}
            onAgentToggle={handleAgentToggle}
            disabled={streamingState.isStreaming}
          />

          {/* Message List - Streaming */}
          <StreamingMessageList
            messages={currentState.messages}
            currentAgent={currentState.currentAgent}
            isStreaming={currentState.isStreaming}
          />

          {/* Stop Streaming Button */}
          {currentState.isStreaming && (
            <div className="flex justify-center">
              <Button
                onClick={currentStopFunction}
                variant="outline"
                className="flex items-center gap-2"
              >
                <StopCircle className="h-4 w-4" />
                Stop Discussion
              </Button>
            </div>
          )}

          {/* Document Context - Show when available */}
          {sessionData.documentContext && sessionData.documentContext.documentsUsed > 0 && (
            <DocumentContext
              documentsUsed={sessionData.documentContext.documentsUsed}
              citations={sessionData.documentContext.citations}
              isVisible={showDocumentContext}
              onToggleVisibility={() => setShowDocumentContext(!showDocumentContext)}
            />
          )}

          {/* Decision Support AI */}
          <DecisionSupport
            sessionId={sessionId}
            scenario={typeof sessionData.scenario === 'string' ? sessionData.scenario : sessionData.scenario?.name || 'Strategic Decision Analysis'}
            participants={selectedAgents.map(agent => EXECUTIVE_AGENTS.find(a => a.id === agent)?.name || agent)}
            isAnalyzing={isAnalyzingDecision}
            recommendation={decisionRecommendation || undefined}
            onRequestAnalysis={handleDecisionAnalysis}
          />

          {/* Message Input */}
          <MessageInput
            onSendMessage={handleSendMessage}
            isLoading={currentState.isStreaming}
            disabled={selectedAgents.length === 0}
            placeholder={
              selectedAgents.length === 0 
                ? "Please select at least one executive agent first..."
                : currentState.isStreaming
                ? "Discussion in progress..."
                : "Ask a strategic question to begin the executive discussion..."
            }
            sessionData={sessionData}
            selectedAgents={selectedAgents}
            onAgentsChange={setSelectedAgents}
          />
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Document Selector */}
          <DocumentSelector
            selectedDocuments={selectedDocuments}
            onDocumentSelectionChange={setSelectedDocuments}
            maxDocuments={5}
          />

          {/* Live Participants */}
          <LiveParticipants
            sessionId={sessionId}
            currentUser={currentUser}
          />

          {/* Session Progress */}
          <BoardroomProgress {...progressData} />
        </div>
      </div>
    </div>
  )
}
