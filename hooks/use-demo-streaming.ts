"use client"

import { useState, useCallback, useRef } from "react"
import { getDemoScenario, getMockResponses, MockResponse } from "@/lib/demo/demo-scenarios"
import { useDemoMode } from "@/hooks/use-demo-mode"

interface StreamingMessage {
  id: string
  agentType: string
  content: string
  timestamp: Date
  isStreaming: boolean
  isComplete: boolean
}

interface DemoStreamingState {
  isStreaming: boolean
  messages: StreamingMessage[]
  currentAgent: string | null
  currentRound: number
  sessionId: string | null
  error: string | null
}

interface UseDemoStreamingOptions {
  onMessageComplete?: (message: StreamingMessage) => void
  onSessionComplete?: (sessionId: string) => void
  onError?: (error: string) => void
}

export function useDemoStreaming(options: UseDemoStreamingOptions = {}) {
  const { isDemo } = useDemoMode()
  const [state, setState] = useState<DemoStreamingState>({
    isStreaming: false,
    messages: [],
    currentAgent: null,
    currentRound: 1,
    sessionId: null,
    error: null
  })

  const timeoutRefs = useRef<NodeJS.Timeout[]>([])

  const clearTimeouts = useCallback(() => {
    timeoutRefs.current.forEach(timeout => clearTimeout(timeout))
    timeoutRefs.current = []
  }, [])

  const simulateTyping = useCallback((
    message: MockResponse, 
    messageId: string, 
    onComplete: () => void
  ) => {
    const words = message.content.split(' ')
    let currentIndex = 0
    
    const typeWord = () => {
      if (currentIndex < words.length) {
        const partialContent = words.slice(0, currentIndex + 1).join(' ')
        
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, content: partialContent }
              : msg
          )
        }))
        
        currentIndex++
        const timeout = setTimeout(typeWord, 50 + Math.random() * 100) // Realistic typing speed
        timeoutRefs.current.push(timeout)
      } else {
        // Mark message as complete
        setState(prev => ({
          ...prev,
          messages: prev.messages.map(msg => 
            msg.id === messageId 
              ? { ...msg, isStreaming: false, isComplete: true }
              : msg
          )
        }))
        onComplete()
      }
    }

    typeWord()
  }, [])

  const startDemoDiscussion = useCallback(async (
    query: string,
    selectedAgents: string[],
    scenarioId?: string
  ) => {
    console.log('🔍 startDemoDiscussion called with:')
    console.log('- query:', query)
    console.log('- selectedAgents:', selectedAgents)
    console.log('- scenarioId:', scenarioId)
    console.log('- isDemo:', isDemo)
    
    if (!isDemo || !scenarioId) {
      console.log('❌ Not demo mode or no scenario ID, falling back to regular streaming')
      // Fall back to regular streaming for non-demo mode
      return
    }

    clearTimeouts()

    const sessionId = `demo-session-${Date.now()}`
    const mockResponses = getMockResponses(scenarioId, state.currentRound)
    
    console.log('🎭 Mock responses found:', mockResponses.length)
    console.log('🎭 Mock responses:', mockResponses)

    if (mockResponses.length === 0) {
      console.log('❌ No demo data available for scenario:', scenarioId)
      setState(prev => ({ ...prev, error: 'No demo data available for this scenario' }))
      return
    }

    console.log('✅ Starting demo discussion with session ID:', sessionId)

    setState(prev => ({
      ...prev,
      isStreaming: true,
      sessionId,
      error: null,
      currentAgent: null
    }))

    // Add user message first
    const userMessage: StreamingMessage = {
      id: `user-${Date.now()}`,
      agentType: 'user',
      content: query,
      timestamp: new Date(),
      isStreaming: false,
      isComplete: true
    }

    setState(prev => ({
      ...prev,
      messages: [...prev.messages, userMessage]
    }))

    // Filter mock responses based on selected agents
    const relevantResponses = mockResponses.filter(response => 
      selectedAgents.includes(response.agentType)
    )

    let currentAgentIndex = 0

    const processNextAgent = () => {
      if (currentAgentIndex >= relevantResponses.length) {
        // All agents completed
        setState(prev => ({
          ...prev,
          isStreaming: false,
          currentAgent: null
        }))
        
        if (options.onSessionComplete) {
          options.onSessionComplete(sessionId)
        }
        return
      }

      const response = relevantResponses[currentAgentIndex]
      const messageId = `${response.agentType}-${Date.now()}-${currentAgentIndex}`

      // Set current agent
      setState(prev => ({
        ...prev,
        currentAgent: response.agentType
      }))

      // Add message with empty content (will be filled by typing simulation)
      const agentMessage: StreamingMessage = {
        id: messageId,
        agentType: response.agentType,
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isComplete: false
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, agentMessage]
      }))

      // Start typing simulation after a brief delay
      const startDelay = setTimeout(() => {
        simulateTyping(response, messageId, () => {
          if (options.onMessageComplete) {
            options.onMessageComplete(agentMessage)
          }
          
          currentAgentIndex++
          // Wait before processing next agent
          const nextAgentDelay = setTimeout(processNextAgent, 1000 + Math.random() * 1000)
          timeoutRefs.current.push(nextAgentDelay)
        })
      }, 500 + Math.random() * 1000)

      timeoutRefs.current.push(startDelay)
    }

    // Start processing agents
    processNextAgent()
  }, [isDemo, state.currentRound, simulateTyping, clearTimeouts, options])

  const startFollowUpRound = useCallback((followUpQuery: string, selectedAgents: string[], scenarioId?: string) => {
    if (!isDemo || !scenarioId) return

    const scenario = getDemoScenario(scenarioId)
    if (!scenario?.followUpRounds || scenario.followUpRounds.length === 0) {
      // Generate conclusion responses
      const conclusionResponses: MockResponse[] = [
        {
          agentType: 'ceo',
          content: 'Based on our comprehensive discussion, I believe we have a clear path forward. The analysis from all perspectives shows this is a strategic opportunity we should pursue with careful execution.',
          confidence: 0.90,
          timestamp: new Date().toISOString(),
          round: state.currentRound + 1
        }
      ]

      // Process conclusion responses
      setState(prev => ({ 
        ...prev, 
        currentRound: prev.currentRound + 1,
        isStreaming: true
      }))

      // Simulate the conclusion response
      const conclusionMessage: StreamingMessage = {
        id: `conclusion-${Date.now()}`,
        agentType: 'ceo',
        content: '',
        timestamp: new Date(),
        isStreaming: true,
        isComplete: false
      }

      setState(prev => ({
        ...prev,
        messages: [...prev.messages, conclusionMessage],
        currentAgent: 'ceo'
      }))

      // Start typing simulation for conclusion
      const startDelay = setTimeout(() => {
        simulateTyping(conclusionResponses[0], conclusionMessage.id, () => {
          setState(prev => ({
            ...prev,
            isStreaming: false,
            currentAgent: null
          }))
          
          if (options.onSessionComplete) {
            options.onSessionComplete(state.sessionId || 'demo-session')
          }
        })
      }, 500)

      timeoutRefs.current.push(startDelay)
      return
    }

    setState(prev => ({ 
      ...prev, 
      currentRound: prev.currentRound + 1,
      isStreaming: true
    }))

    // Use follow-up responses
    const followUpData = scenario.followUpRounds[0]
    startDemoDiscussion(followUpData.query, selectedAgents, scenarioId)
  }, [isDemo, state.currentRound, state.sessionId, startDemoDiscussion, simulateTyping, options])

  const stopStreaming = useCallback(() => {
    clearTimeouts()
    setState(prev => ({
      ...prev,
      isStreaming: false,
      currentAgent: null
    }))
  }, [clearTimeouts])

  const resetDiscussion = useCallback(() => {
    clearTimeouts()
    setState({
      isStreaming: false,
      messages: [],
      currentAgent: null,
      currentRound: 1,
      sessionId: null,
      error: null
    })
  }, [clearTimeouts])

  return {
    state,
    startDemoDiscussion,
    startFollowUpRound,
    stopStreaming,
    resetDiscussion,
    isDemo
  }
}
