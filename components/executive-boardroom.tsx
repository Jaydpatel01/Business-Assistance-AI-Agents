"use client"

import { useMemo, useState, useCallback } from "react"
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
  
  const {
    sessionData,
    exportSummary
  } = useBoardroomSession({ sessionId })

  // Use streaming boardroom hook
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

  // Function to analyze decision with AI
  const handleDecisionAnalysis = useCallback(async () => {
    if (!sessionData.scenario) return;

    setIsAnalyzingDecision(true);
    try {
      const response = await fetch('/api/decision/analyze', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          sessionId,
          scenario: sessionData.scenario,
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
      }
    } catch (error) {
      console.error('❌ Decision analysis failed:', error);
    } finally {
      setIsAnalyzingDecision(false);
    }
  }, [sessionId, sessionData.scenario, selectedAgents, selectedDocuments]);

  // Memoize current user for LiveParticipants to prevent re-renders
  const currentUser = useMemo(() => ({
    id: "current-user",
    name: "Executive",
    avatar: undefined
  }), [])

  // Calculate progress data based on streaming state
  const progressData = useMemo(() => {
    const messageCount = streamingState.messages.length
    const completedAgentMessages = streamingState.messages.filter(msg => 
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
  }, [streamingState.messages, selectedAgents])

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
    if (selectedAgents.length === 0) {
      return
    }

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
  }, [selectedAgents, streamingState.messages, startStreamingDiscussion, sessionData.scenario, sessionId, selectedDocuments])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Session Header */}
      <BoardroomHeader 
        sessionId={sessionId}
        sessionName={sessionData.name}
        scenarioName={sessionData.scenario.name}
        scenarioDescription={sessionData.scenario.description}
        status={'active' as 'preparing' | 'active' | 'completed' | 'paused'}
        startTime={new Date()}
        participantCount={selectedAgents.length}
        messageCount={streamingState.messages.length}
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
            messages={streamingState.messages}
            currentAgent={streamingState.currentAgent}
            isStreaming={streamingState.isStreaming}
          />

          {/* Stop Streaming Button */}
          {streamingState.isStreaming && (
            <div className="flex justify-center">
              <Button
                onClick={stopStreaming}
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
            isLoading={streamingState.isStreaming}
            disabled={selectedAgents.length === 0}
            placeholder={
              selectedAgents.length === 0 
                ? "Please select at least one executive agent first..."
                : streamingState.isStreaming
                ? "Discussion in progress..."
                : "Ask a strategic question to begin the executive discussion..."
            }
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
