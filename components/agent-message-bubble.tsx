"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { User, Briefcase, DollarSign, Code, Users } from "lucide-react"
import { useState } from 'react';
import { DecisionExplainer } from '@/components/explainability/decision-explainer';

interface Message {
  id: string
  agent: string
  content: string
  timestamp: Date
}

interface Agent {
  id: string
  name: string
  color: string
}

interface AgentMessageBubbleProps {
  message: Message
  agent?: Agent
  decisionId: string
}

const agentIcons = {
  ceo: Briefcase,
  cfo: DollarSign,
  cto: Code,
  hr: Users,
  user: User,
}

export function AgentMessageBubble({ message, agent, decisionId }: AgentMessageBubbleProps) {
  const [showExplain, setShowExplain] = useState(false);
  const isUser = message.agent === "user"
  const Icon = agentIcons[message.agent as keyof typeof agentIcons] || User

  return (
    <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
      <Avatar className="h-8 w-8 mt-1">
        <AvatarFallback className={isUser ? "bg-primary text-primary-foreground" : "bg-muted"}>
          <Icon className="h-4 w-4" />
        </AvatarFallback>
      </Avatar>

      <div className={`flex-1 space-y-1 ${isUser ? "text-right" : ""}`}>
        <div className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
          {!isUser && agent && (
            <Badge className={agent.color} variant="secondary">
              {agent.name}
            </Badge>
          )}
          {isUser && <Badge variant="default">You</Badge>}
          <span className="text-xs text-muted-foreground">
            {message.timestamp.toLocaleTimeString([], {
              hour: "2-digit",
              minute: "2-digit",
            })}
          </span>
        </div>

        <div
          className={`rounded-lg p-3 max-w-[80%] ${isUser ? "bg-primary text-primary-foreground ml-auto" : "bg-muted"}`}
        >
          <p className="text-sm leading-relaxed">{message.content}</p>
        </div>
        
        {!isUser && (
          <div className="flex justify-start mt-2">
            <button
              className="text-xs text-primary underline hover:text-primary/80"
              onClick={() => setShowExplain(true)}
            >
              Explain
            </button>
          </div>
        )}
      </div>

      {showExplain && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-40">
          <div className="bg-background rounded-lg shadow-lg max-w-2xl w-full p-6 relative">
            <button 
              className="absolute top-2 right-2 text-muted-foreground hover:text-foreground"
              onClick={() => setShowExplain(false)}
            >
              ✕
            </button>
            <DecisionExplainer decisionId={decisionId} />
          </div>
        </div>
      )}
    </div>
  )
}
