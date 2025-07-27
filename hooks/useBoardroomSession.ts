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
      name: "Strategic Planning Session",
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

  // Initialize session data
  useEffect(() => {
    // Don't call refreshSession in useEffect to avoid dependency issues
    setSessionData(prev => ({
      ...prev,
      activeAgents: selectedAgents
    }))
  }, [sessionId, selectedAgents])

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
      // Generate summary data
      const summaryData = {
        sessionId: sessionData.id,
        sessionName: sessionData.name,
        scenario: sessionData.scenario,
        messages: sessionData.messages,
        participants: selectedAgents,
        timestamp: new Date().toISOString()
      }

      // Create and download file
      const blob = new Blob([JSON.stringify(summaryData, null, 2)], {
        type: 'application/json'
      })
      const url = URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `boardroom-session-${sessionData.id}-${Date.now()}.json`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      URL.revokeObjectURL(url)

      toast({
        title: "Summary Exported",
        description: "Session summary has been downloaded successfully."
      })
    } catch (error) {
      console.error('Error exporting summary:', error)
      toast({
        title: "Export Failed",
        description: "Failed to export session summary",
        variant: "destructive"
      })
    }
  }, [sessionData, selectedAgents, toast])

  const refreshSession = useCallback(async () => {
    setIsLoading(true)
    try {
      // In a real app, this would fetch session data from an API
      // For now, we'll simulate a brief loading state
      await new Promise(resolve => setTimeout(resolve, 500))
      
      // Update session data if needed
      setSessionData(prev => ({
        ...prev,
        activeAgents: selectedAgents
      }))
    } catch (error) {
      console.error('Error refreshing session:', error)
      toast({
        title: "Refresh Failed",
        description: "Failed to refresh session data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [selectedAgents, toast])

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
