"use client"

import { useEffect, useRef } from "react"
import { StreamingMessage } from "./StreamingMessage"

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

interface StreamingMessageListProps {
  messages: StreamingMessage[]
  currentAgent: string | null
  isStreaming: boolean
}

export function StreamingMessageList({ 
  messages, 
  currentAgent, 
  isStreaming 
}: StreamingMessageListProps) {
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const scrollContainerRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    if (scrollContainerRef.current) {
      // Use requestAnimationFrame for smooth scrolling
      requestAnimationFrame(() => {
        if (scrollContainerRef.current) {
          scrollContainerRef.current.scrollTo({
            top: scrollContainerRef.current.scrollHeight,
            behavior: 'smooth'
          })
        }
      })
    }
  }

  useEffect(() => {
    // Only scroll when messages change, with a small delay for better UX
    const timeoutId = setTimeout(() => {
      scrollToBottom()
    }, 100)
    
    return () => clearTimeout(timeoutId)
  }, [messages])

  return (
    <div 
      ref={scrollContainerRef}
      className="h-[500px] w-full rounded-md border p-4 overflow-y-auto 
                 scrollbar-thin scrollbar-thumb-muted scrollbar-track-background
                 hover:scrollbar-thumb-muted-foreground/50"
      style={{
        scrollBehavior: 'smooth'
      }}
    >
      <div className="space-y-4">
        {messages.length === 0 && !isStreaming ? (
          <div className="text-center text-muted-foreground py-8">
            <p>No messages yet. Start the discussion by asking a question.</p>
          </div>
        ) : (
          messages.map((message) => (
            <StreamingMessage
              key={message.id}
              id={message.id}
              agentType={message.agentType}
              content={message.content}
              timestamp={message.timestamp}
              isStreaming={message.isStreaming}
              isComplete={message.isComplete}
              documentMetadata={message.documentMetadata} // 📄 ENHANCED: Pass document metadata
              confidence={message.confidence} // 🎯 ENHANCED: Pass confidence score
              reasoning={message.reasoning} // 🎯 ENHANCED: Pass reasoning metadata
            />
          ))
        )}
        
        {isStreaming && currentAgent && (
          <div className="text-center text-sm text-muted-foreground py-4 italic">
            {currentAgent.toUpperCase()} is preparing response...
          </div>
        )}
        
        <div ref={messagesEndRef} />
      </div>
    </div>
  )
}
