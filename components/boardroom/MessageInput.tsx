"use client"

import { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Textarea } from "@/components/ui/textarea"
import { Card, CardContent } from "@/components/ui/card"
import { Send, Loader2 } from "lucide-react"
import { getScenarioInput } from "@/lib/demo/scenario-inputs"
import { useSession } from "next-auth/react"

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
  onAgentsChange?: (agents: ('ceo' | 'cfo' | 'cto' | 'hr')[]) => void
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
  const { data: session } = useSession()
  const [inputMessage, setInputMessage] = useState("")

  // Check if user is in demo mode
  const isDemoUser = session?.user?.email === 'demo@user.com' || session?.user?.name === 'Demo User'
  
  // Check if this is a new session (no messages yet)
  const isNewSession = !sessionData?.messages || sessionData.messages.length === 0

  // Auto-fill input when demo user selects a scenario for the first time
  useEffect(() => {
    if (isDemoUser && isNewSession && sessionData?.scenario?.id && !inputMessage) {
      const scenarioInput = getScenarioInput(sessionData.scenario.id)
      if (scenarioInput) {
        setInputMessage(scenarioInput.defaultQuery)
        
        // Also auto-select recommended agents if callback is provided
        if (onAgentsChange && scenarioInput.recommendedAgents) {
          onAgentsChange(scenarioInput.recommendedAgents)
        }
      }
    }
  }, [isDemoUser, isNewSession, sessionData?.scenario?.id, inputMessage, onAgentsChange])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (inputMessage.trim() && !isLoading && !disabled) {
      // Just send the message directly to the parent component
      // The parent will handle the streaming discussion
      onSendMessage(inputMessage.trim())
      setInputMessage("")
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
        </form>
      </CardContent>
    </Card>
  )
}
