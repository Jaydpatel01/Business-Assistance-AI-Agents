import { useState, useCallback, useRef } from "react"
import { useToast } from "@/hooks/use-toast"

interface StreamingMessage {
  id: string
  agentType: string
  content: string
  timestamp: Date
  isStreaming: boolean
  isComplete: boolean
  // 📄 ENHANCED: Add document metadata
  documentMetadata?: {
    citedDocuments: number[]
    documentsUsed: number
    hasDocumentContext: boolean
  }
  // 🎯 ENHANCED: Add explainability metadata
  confidence?: number
  reasoning?: {
    keyFactors?: string[]
    risks?: string[]
    assumptions?: string[]
    dataSources?: string[]
  }
}

interface StreamingBoardroomState {
  messages: StreamingMessage[]
  isStreaming: boolean
  currentAgent: string | null
  currentRound: number
  maxRounds: number
  sessionId: string | null
  error: string | null
  // 📄 ENHANCED: Add document context to state
  documentContext?: {
    documentsUsed: number
    citations: Array<{
      id: string
      name: string
      relevanceScore: number
      excerpt: string
      citationIndex: number
      fullText?: string
    }>
  } | null
}

interface UseStreamingBoardroomOptions {
  onMessageComplete?: (message: StreamingMessage) => void
  onSessionComplete?: (sessionId: string) => void
}

interface StreamingParams {
  scenario: {
    id?: string
    name?: string
    description?: string
    parameters?: Record<string, unknown>
  }
  query: string
  includeAgents: string[]
  companyName?: string
  sessionId?: string
  selectedDocuments?: string[]
  conversationHistory?: Array<{
    agentType: string
    content: string
    timestamp: string
  }>
  maxRounds?: number
  autoConclusion?: boolean
}

interface UseStreamingBoardroomReturn {
  state: StreamingBoardroomState
  startStreamingDiscussion: (params: StreamingParams) => Promise<void>
  stopStreaming: () => void
  clearMessages: () => void
}

export function useStreamingBoardroom({
  onMessageComplete,
  onSessionComplete
}: UseStreamingBoardroomOptions = {}): UseStreamingBoardroomReturn {
  const { toast } = useToast()
  const abortControllerRef = useRef<AbortController | null>(null)
  
  const [state, setState] = useState<StreamingBoardroomState>({
    messages: [],
    isStreaming: false,
    currentAgent: null,
    currentRound: 0,
    maxRounds: 3,
    sessionId: null,
    error: null,
    documentContext: null // 📄 ENHANCED: Initialize document context
  })

  const stopStreaming = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort()
      abortControllerRef.current = null
    }
    setState(prev => ({
      ...prev,
      isStreaming: false,
      currentAgent: null
    }))
  }, [])

  const clearMessages = useCallback(() => {
    stopStreaming()
    setState({
      messages: [],
      isStreaming: false,
      currentAgent: null,
      currentRound: 0,
      maxRounds: 3,
      sessionId: null,
      error: null,
      documentContext: null // 📄 ENHANCED: Clear document context
    })
  }, [stopStreaming])

  const startStreamingDiscussion = useCallback(async (params: StreamingParams) => {
    // Stop any existing stream
    stopStreaming()
    
    // Clear previous error
    setState(prev => ({
      ...prev,
      error: null,
      isStreaming: true
    }))

    try {
      // Create new abort controller
      abortControllerRef.current = new AbortController()
      
      const response = await fetch('/api/boardroom/stream', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(params),
        signal: abortControllerRef.current.signal
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      if (!response.body) {
        throw new Error('No response body')
      }

      const reader = response.body.getReader()
      const decoder = new TextDecoder()

      let buffer = ''
      let currentStreamingMessage: StreamingMessage | null = null

      while (true) {
        const { value, done } = await reader.read()
        
        if (done) break

        buffer += decoder.decode(value, { stream: true })
        const lines = buffer.split('\n\n')
        buffer = lines.pop() || ''

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            try {
              const data = JSON.parse(line.replace('data: ', ''))
              
              switch (data.type) {
                case 'session_start':
                  setState(prev => ({
                    ...prev,
                    sessionId: data.sessionId,
                    maxRounds: data.maxRounds || 3,
                    // 📄 ENHANCED: Store document context from session start
                    documentContext: data.documentContext || null,
                    messages: [...prev.messages, {
                      id: `user-${Date.now()}`,
                      agentType: 'user',
                      content: data.query,
                      timestamp: new Date(),
                      isStreaming: false,
                      isComplete: true
                    }]
                  }))
                  break

                case 'round_start':
                  setState(prev => ({
                    ...prev,
                    currentRound: data.roundNumber
                  }))
                  
                  // Add round indicator message for UI
                  if (data.roundNumber > 1) {
                    setState(prev => ({
                      ...prev,
                      messages: [...prev.messages, {
                        id: `round-${data.roundNumber}-${Date.now()}`,
                        agentType: 'system',
                        content: `--- Round ${data.roundNumber} of ${data.maxRounds} ---`,
                        timestamp: new Date(),
                        isStreaming: false,
                        isComplete: true
                      }]
                    }))
                  }
                  break

                case 'agent_start':
                  setState(prev => ({
                    ...prev,
                    currentAgent: data.agentType
                  }))
                  
                  // Create a new streaming message
                  currentStreamingMessage = {
                    id: `${data.agentType}-${Date.now()}`,
                    agentType: data.agentType,
                    content: '',
                    timestamp: new Date(),
                    isStreaming: true,
                    isComplete: false
                  }
                  
                  setState(prev => ({
                    ...prev,
                    messages: [...prev.messages, currentStreamingMessage!]
                  }))
                  break

                case 'agent_response':
                  if (currentStreamingMessage && currentStreamingMessage.agentType === data.agentType) {
                    // Store reference to avoid null issues
                    const streamingMessageRef = currentStreamingMessage
                    
                    // Update the streaming message with complete content
                    const completedMessage = {
                      ...streamingMessageRef,
                      content: data.response,
                      isStreaming: false,
                      isComplete: true,
                      // 📄 ENHANCED: Include document metadata
                      documentMetadata: data.documentMetadata,
                      // 🎯 ENHANCED: Include explainability metadata
                      confidence: data.confidence,
                      reasoning: data.reasoning
                    }
                    
                    setState(prev => ({
                      ...prev,
                      messages: prev.messages.map(msg => 
                        msg.id === streamingMessageRef.id ? completedMessage : msg
                      ),
                      currentAgent: null
                    }))
                    
                    onMessageComplete?.(completedMessage)
                    currentStreamingMessage = null
                  }
                  break

                case 'agent_error':
                  if (currentStreamingMessage && currentStreamingMessage.agentType === data.agentType) {
                    // Store reference to avoid null issues
                    const streamingMessageRef = currentStreamingMessage
                    
                    const errorMessage = {
                      ...streamingMessageRef,
                      content: `Error: ${data.error}`,
                      isStreaming: false,
                      isComplete: true
                    }
                    
                    setState(prev => ({
                      ...prev,
                      messages: prev.messages.map(msg => 
                        msg.id === streamingMessageRef.id ? errorMessage : msg
                      ),
                      currentAgent: null
                    }))
                    
                    currentStreamingMessage = null
                  }
                  break

                case 'session_complete':
                  setState(prev => ({
                    ...prev,
                    isStreaming: false,
                    currentAgent: null
                  }))
                  
                  if (state.sessionId) {
                    onSessionComplete?.(state.sessionId)
                  }
                  break

                case 'round_complete':
                  // Optional: Add visual indicator that round is complete
                  console.log(`Round ${data.roundNumber} completed`)
                  break

                case 'error':
                  setState(prev => ({
                    ...prev,
                    error: data.error,
                    isStreaming: false,
                    currentAgent: null
                  }))
                  break
              }
            } catch (parseError) {
              console.error('Failed to parse SSE data:', parseError)
            }
          }
        }
      }
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        console.log('Streaming aborted by user')
        return
      }
      
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred'
      setState(prev => ({
        ...prev,
        error: errorMessage,
        isStreaming: false,
        currentAgent: null
      }))
      
      toast({
        title: "Streaming Error",
        description: errorMessage,
        variant: "destructive"
      })
    } finally {
      abortControllerRef.current = null
    }
  }, [toast, onMessageComplete, onSessionComplete, state.sessionId, stopStreaming])

  return {
    state,
    startStreamingDiscussion,
    stopStreaming,
    clearMessages
  }
}
