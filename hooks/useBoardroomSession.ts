import { useState, useCallback, useEffect } from "react"
import { useToast } from "@/hooks/use-toast"
import { ExecutiveRole } from "@/types/executive"

interface Message {
  id: string
  agentType: string
  content: string
  timestamp: Date
  reasoning?: string
}

interface ApiMessage {
  id: string
  content: string
  agentType?: string
  createdAt: string
  metadata?: {
    reasoning?: string
  }
}

interface AgentResponse {
  perspective: string
  timestamp: string
  confidence: number
}

interface SessionData {
  id: string
  name: string
  scenario: {
    id: string
    name: string
    description: string
  }
  status: string
  messages: Message[]
  progress: number
  activeAgents: string[]
  documentContext?: {
    documentsUsed: number
    citations: Array<{
      id: string
      name: string
      relevanceScore: number
      excerpt: string
      citationIndex: number
    }>
  }
}

interface UseBoardroomSessionOptions {
  sessionId: string
  initialData?: Partial<SessionData>
}

interface UseBoardroomSessionReturn {
  sessionData: SessionData
  selectedAgents: string[]
  isLoading: boolean
  isProcessing: boolean
  sendMessage: (message: string) => Promise<void>
  toggleAgent: (agentId: string) => void
  exportSummary: () => Promise<void>
  refreshSession: () => Promise<void>
}

export function useBoardroomSession({ 
  sessionId, 
  initialData 
}: UseBoardroomSessionOptions): UseBoardroomSessionReturn {
  const { toast } = useToast()
  
  const [sessionData, setSessionData] = useState<SessionData>({
    id: sessionId,
    name: initialData?.name || "Executive Boardroom Session",
    scenario: initialData?.scenario || {
      id: "default",
      name: "Business Strategy Discussion",
      description: "Collaborative executive decision-making session"
    },
    status: initialData?.status || "active",
    messages: initialData?.messages || [],
    progress: initialData?.progress || 0,
    activeAgents: initialData?.activeAgents || []
  })

  const [selectedAgents, setSelectedAgents] = useState<string[]>(
    initialData?.activeAgents || [ExecutiveRole.CEO, ExecutiveRole.CFO]
  )
  const [isLoading, setIsLoading] = useState(false)
  const [isProcessing, setIsProcessing] = useState(false)

  const sendMessage = useCallback(async (message: string) => {
    if (!message.trim() || selectedAgents.length === 0) {
      toast({
        title: "Invalid Input",
        description: "Please enter a message and select at least one agent.",
        variant: "destructive"
      })
      return
    }

    setIsProcessing(true)

    try {
      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        agentType: "user",
        content: message,
        timestamp: new Date()
      }

      setSessionData(prev => ({
        ...prev,
        messages: [...prev.messages, userMessage],
        progress: Math.min(prev.progress + 10, 90)
      }))

      // Call boardroom API
      const response = await fetch('/api/boardroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          scenario: sessionData.scenario,
          query: message,
          includeAgents: selectedAgents,
          sessionId: sessionId
        }),
      })

      const result = await response.json()

      if (result.success && result.data) {
        // Convert API responses to messages
        const agentMessages: Message[] = Object.entries(result.data.responses).map(
          ([agentType, response]) => {
            const typedResponse = response as AgentResponse
            return {
              id: `${agentType.toLowerCase()}-${Date.now()}`,
              agentType: agentType.toLowerCase(),
              content: typedResponse.perspective,
              timestamp: new Date(typedResponse.timestamp),
              reasoning: `Confidence: ${typedResponse.confidence * 100}%`
            }
          }
        )

        setSessionData(prev => ({
          ...prev,
          messages: [...prev.messages, ...agentMessages],
          progress: Math.min(prev.progress + 20, 100)
        }))

        toast({
          title: "Responses Generated",
          description: `Received insights from ${agentMessages.length} executive agent${agentMessages.length !== 1 ? 's' : ''}.`
        })
      } else {
        throw new Error(result.error || 'Failed to get agent responses')
      }
    } catch (error) {
      console.error('Error sending message:', error)
      toast({
        title: "Error",
        description: error instanceof Error ? error.message : "Failed to send message",
        variant: "destructive"
      })
    } finally {
      setIsProcessing(false)
    }
  }, [selectedAgents, sessionData.scenario, sessionId, toast])

  const toggleAgent = useCallback((agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }, [])

  const exportSummary = useCallback(async () => {
    try {
      toast({
        title: "Generating Report",
        description: "Your boardroom session report is being prepared...",
      })

      const response = await fetch('/api/boardroom/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          format: 'pdf',
          options: {
            includeTranscript: true,
            includeReasoning: true,
            includeCitations: true,
            maxMessages: 50,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boardroom-session-${sessionData.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "Report Downloaded",
        description: "Session report has been downloaded successfully as PDF."
      })
    } catch (error) {
      console.error('Error exporting summary:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export session summary. Please try again.",
        variant: "destructive"
      })
    }
  }, [sessionData, toast])

  const refreshSession = useCallback(async () => {
    setIsLoading(true)
    try {
      console.log(`🔄 Loading session data for session ${sessionId}`)
      
      // Fetch session data (includes messages)
      const sessionResponse = await fetch(`/api/boardroom/sessions/${sessionId}`)
      
      if (!sessionResponse.ok) {
        if (sessionResponse.status === 404) {
          throw new Error('Session not found or access denied')
        }
        throw new Error('Failed to fetch session data')
      }
      
      const sessionResult = await sessionResponse.json()
      
      if (sessionResult.success && sessionResult.data) {
        const sessionInfo = sessionResult.data
        
        // Parse agents from the session if available
        let parsedAgents: string[] = [];
        if (sessionInfo.agents) {
          try {
            parsedAgents = JSON.parse(sessionInfo.agents);
            console.log(`✅ Loaded ${parsedAgents.length} agents from session:`, parsedAgents);
          } catch (e) {
            console.error('Failed to parse agents from session:', e);
          }
        }
        
        setSessionData(prev => ({
          ...prev,
          id: sessionInfo.id,
          name: sessionInfo.name,
          scenario: sessionInfo.scenario || prev.scenario,
          status: sessionInfo.status,
          activeAgents: parsedAgents.length > 0 ? parsedAgents : prev.activeAgents,
          // Convert API messages to our Message format
          messages: (sessionInfo.messages || []).map((msg: ApiMessage) => ({
            id: msg.id,
            agentType: msg.agentType || 'user',
            content: msg.content,
            timestamp: new Date(msg.createdAt),
            reasoning: msg.metadata?.reasoning
          }))
        }))
        
        console.log(`✅ Loaded session with ${sessionInfo.messages?.length || 0} messages`)
      }
      
      // Update active agents
      setSessionData(prev => ({
        ...prev,
        activeAgents: selectedAgents
      }))
    } catch (error) {
      console.error('Error refreshing session:', error)
      toast({
        title: "Session Load Failed",
        description: error instanceof Error ? error.message : "Failed to load session data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [sessionId, selectedAgents, toast])

  // Initialize session data and load previous messages
  useEffect(() => {
    console.log(`🚀 Initializing session ${sessionId}`)
    
    // Update activeAgents
    setSessionData(prev => ({
      ...prev,
      activeAgents: selectedAgents
    }))
    
    // Load previous messages for existing sessions
    if (sessionId && sessionId !== 'new') {
      refreshSession()
    }
  }, [sessionId, selectedAgents, refreshSession])

  return {
    sessionData,
    selectedAgents,
    isLoading,
    isProcessing,
    sendMessage,
    toggleAgent,
    exportSummary,
    refreshSession
  }
}
