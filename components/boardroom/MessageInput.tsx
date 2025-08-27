"use client"

import { useState, useEffect, useRef } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { getDemoScenario } from "@/lib/demo/demo-scenarios"
import { useDemoMode } from "@/hooks/use-demo-mode"

interface MessageInputProps {
  onSendMessage: (message: string) => void
  isLoading?: boolean
  disabled?: boolean
  placeholder?: string
  sessionData?: {
    scenario?: {
      id?: string
      name?: string
      title?: string
    }
    messages?: unknown[]
  }
  selectedAgents?: string[]
  onAgentsChange?: (agents: string[]) => void
}

export function MessageInput({
  onSendMessage,
  isLoading = false,
  disabled = false,
  placeholder = "Type your message...",
  sessionData,
  selectedAgents = [],
  onAgentsChange
}: MessageInputProps) {
  const { isDemo } = useDemoMode()
  const [inputMessage, setInputMessage] = useState("")
  const hasAutoFilled = useRef(false)
  
  // Check if this is a new session (no messages yet)
  const isNewSession = !sessionData?.messages || sessionData.messages.length === 0

  // Auto-fill input when demo user selects a scenario for the first time
  useEffect(() => {
    console.log('🔍 MessageInput useEffect triggered')
    console.log('- isDemo:', isDemo)
    console.log('- isNewSession:', isNewSession)
    console.log('- sessionData?.scenario?.id:', sessionData?.scenario?.id)
    console.log('- hasAutoFilled.current:', hasAutoFilled.current)
    console.log('- sessionData:', sessionData)
    
    // Check if this is a demo session by URL or sessionId pattern
    const isDemoFromUrl = typeof window !== 'undefined' && (
      window.location.search.includes('demo=true') || 
      window.location.pathname.includes('/demo-')
    )
    
    const shouldAutofill = (isDemo || isDemoFromUrl) && isNewSession && sessionData?.scenario?.id && !hasAutoFilled.current
    
    console.log('- isDemoFromUrl:', isDemoFromUrl)
    console.log('- shouldAutofill:', shouldAutofill)
    
    if (shouldAutofill) {
      const scenarioId = sessionData.scenario?.id
      if (scenarioId) {
        const demoScenario = getDemoScenario(scenarioId)
        console.log('🎭 Demo scenario found:', demoScenario)
        
        if (demoScenario) {
          hasAutoFilled.current = true // Prevent multiple auto-fills
          
          console.log('🎭 Demo mode: Auto-filling input with scenario query:', demoScenario.defaultQuery)
          setInputMessage(demoScenario.defaultQuery)
          
          // Auto-select recommended agents first, then submit after delay
          if (onAgentsChange && demoScenario.recommendedAgents && demoScenario.recommendedAgents.length > 0) {
            console.log('🎭 Demo mode: Auto-selecting recommended agents:', demoScenario.recommendedAgents)
            onAgentsChange(demoScenario.recommendedAgents)
            
            // Wait for agents to be selected, then auto-submit
            setTimeout(() => {
              console.log('🎭 Demo mode: Auto-submitting initial message after agent selection:', demoScenario.defaultQuery)
              onSendMessage(demoScenario.defaultQuery)
              setInputMessage("") // Clear input after sending
            }, 3000) // 3-second delay to ensure agents are selected
          } else {
            // If no agents to select, just submit with a shorter delay
            setTimeout(() => {
              console.log('🎭 Demo mode: Auto-submitting initial message (no agent selection):', demoScenario.defaultQuery)
              onSendMessage(demoScenario.defaultQuery)
              setInputMessage("") // Clear input after sending
            }, 2000)
          }
        }
      }
    }
  }, [isDemo, isNewSession, sessionData, onAgentsChange, onSendMessage]) // Using hasAutoFilled ref to prevent loops

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    console.log('🔍 handleSubmit called')
    console.log('- inputMessage:', inputMessage)
    console.log('- isLoading:', isLoading)
    console.log('- disabled:', disabled)
    
    if (inputMessage.trim() && !isLoading && !disabled) {
      console.log('✅ Submitting message:', inputMessage.trim())
      // Just send the message directly to the parent component
      // The parent will handle the streaming discussion
      onSendMessage(inputMessage.trim())
      setInputMessage("")
    } else {
      console.log('❌ Message submission blocked')
    }
  }

  return (
    <Card>
      <CardContent className="p-4">
        <form onSubmit={handleSubmit} className="space-y-4">
          <Textarea
            value={inputMessage}
            onChange={(e) => setInputMessage(e.target.value)}
            placeholder={placeholder}
            disabled={disabled || isLoading}
            className="min-h-[100px] resize-none"
          />
          <div className="flex justify-between items-center">
            <div className="text-sm text-muted-foreground">
              {selectedAgents.length > 0 
                ? `Selected: ${selectedAgents.join(', ').toUpperCase()}`
                : "Select agents to begin discussion"
              }
            </div>
            <div className="flex gap-2">
              {/* Demo test button - show if URL indicates demo or if traditional demo mode */}
              {((isDemo || (typeof window !== 'undefined' && (window.location.search.includes('demo=true') || window.location.pathname.includes('/demo-')))) && isNewSession && sessionData?.scenario?.id) && (
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => {
                    console.log('🧪 Demo test button clicked')
                    if (sessionData?.scenario?.id) {
                      const demoScenario = getDemoScenario(sessionData.scenario.id)
                      if (demoScenario) {
                        console.log('🧪 Starting demo with:', demoScenario.defaultQuery)
                        onSendMessage(demoScenario.defaultQuery)
                      }
                    }
                  }}
                  className="min-w-[100px]"
                >
                  Start Demo
                </Button>
              )}
              
              <Button
                type="submit"
                disabled={!inputMessage.trim() || disabled || isLoading}
                className="min-w-[100px]"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    Sending...
                  </>
                ) : (
                  <>
                    <Send className="w-4 h-4 mr-2" />
                    Send
                  </>
                )}
              </Button>
            </div>
          </div>
        </form>
      </CardContent>
    </Card>
  )
}
