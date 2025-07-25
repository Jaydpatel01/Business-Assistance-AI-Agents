"use client"

import { ExecutiveMessage } from "@/components/executive-message"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useEffect, useRef } from "react"

interface Message {
  id: string
  agentType: string
  content: string
  timestamp: Date
  reasoning?: string
}

interface Agent {
  id: string
  name: string
  fullTitle: string
  color: string
  expertise: string
}

interface MessageListProps {
  messages: Message[]
  agents: Agent[]
  isLoading?: boolean
}

export function MessageList({ messages, agents, isLoading }: MessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const getAgentById = (agentType: string) => {
    return agents.find(agent => agent.id === agentType)
  }

  return (
    <ScrollArea className="h-[500px] w-full rounded-md border p-4">
      <div className="space-y-4">
        {messages.length === 0 && !isLoading ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the discussion by asking a question.</p>
          </div>
        ) : (
          messages.map((message) => (
            <ExecutiveMessage
              key={message.id}
              message={message}
              agent={getAgentById(message.agentType)}
            />
          ))
        )}
        
        {isLoading && (
          <div className="flex items-center justify-center py-4">
            <div className="flex items-center space-x-2">
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary"></div>
              <span className="text-sm text-muted-foreground">Agents are thinking...</span>
            </div>
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </ScrollArea>
  )
}
