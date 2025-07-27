"use client"

import { useMemo, useState, useCallback } from "react"
import { BoardroomHeader } from "@/components/boardroom/BoardroomHeader"
import { MessageList } from "@/components/boardroom/MessageList"
import { MessageInput } from "@/components/boardroom/MessageInput"
import { AgentSelector } from "@/components/boardroom/AgentSelector"
import { BoardroomProgress } from "@/components/boardroom/BoardroomProgress"
import { DocumentContext } from "@/components/boardroom/DocumentContext"
import { DocumentSelector } from "@/components/boardroom/DocumentSelector"
import DecisionSupport from "@/components/decision/DecisionSupport"
import { DecisionRecommendation } from "@/lib/ai/decision-engine"
import { LiveParticipants } from "@/components/live-participants"
import { useBoardroomSession } from "@/hooks/useBoardroomSession"
import { ExecutiveRole } from "@/types/executive"

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
  
  const {
    sessionData,
    selectedAgents,
    isProcessing,
    sendMessage,
    toggleAgent,
    exportSummary
  } = useBoardroomSession({ sessionId })

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

  // Calculate progress data
  const progressData = useMemo(() => ({
    progress: sessionData.progress,
    activeAgents: selectedAgents,
    completedSteps: sessionData.progress > 50 ? ['initialization', 'agent_analysis'] : ['initialization'],
    currentStep: sessionData.progress < 25 ? 'initialization' 
                : sessionData.progress < 50 ? 'agent_analysis'
                : sessionData.progress < 75 ? 'discussion'
                : sessionData.progress < 95 ? 'synthesis'
                : 'summary'
  }), [sessionData.progress, selectedAgents])

  // Wrapper function to include selected documents when sending messages
  const handleSendMessage = useCallback((message: string) => {
    // TODO: Implement document context support in sendMessage hook
    return sendMessage(message)
  }, [sendMessage])

  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Session Header */}
      <BoardroomHeader 
        sessionId={sessionId}
        sessionName={sessionData.name}
        scenarioName={sessionData.scenario.name}
        scenarioDescription={sessionData.scenario.description}
        status={sessionData.status as 'preparing' | 'active' | 'completed' | 'paused'}
        startTime={new Date()}
        participantCount={sessionData.activeAgents.length}
        messageCount={sessionData.messages.length}
        progress={sessionData.progress}
        onExport={exportSummary}
      />

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Main Discussion Area */}
        <div className="lg:col-span-3 space-y-6">
          {/* Agent Selection */}
          <AgentSelector
            agents={EXECUTIVE_AGENTS}
            selectedAgents={selectedAgents}
            onAgentToggle={toggleAgent}
            disabled={isProcessing}
          />

          {/* Message List */}
          <MessageList
            messages={sessionData.messages}
            agents={EXECUTIVE_AGENTS}
            isLoading={isProcessing}
          />

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
            isLoading={isProcessing}
            disabled={selectedAgents.length === 0}
            placeholder={
              selectedAgents.length === 0 
                ? "Please select at least one executive agent first..."
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
