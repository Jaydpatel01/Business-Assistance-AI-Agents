"use client"

import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { ClientDate } from "@/components/client-date"
import { User, Briefcase, DollarSign, Code, Users, ThumbsUp, MessageSquare, Eye } from "lucide-react"
import { useState } from "react"

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

interface ExecutiveMessageProps {
  message: Message
  agent?: Agent
}

const agentIcons = {
  ceo: Briefcase,
  cfo: DollarSign,
  cto: Code,
  hr: Users,
  user: User,
}

export function ExecutiveMessage({ message, agent }: ExecutiveMessageProps) {
  const [showReasoning, setShowReasoning] = useState(false)
  const isUser = message.agentType === "user"
  const Icon = agentIcons[message.agentType as keyof typeof agentIcons] || User

  return (
    <Card className={`${isUser ? "ml-12 bg-indigo-50 dark:bg-indigo-950/20" : "mr-12"}`}>
      <CardContent className="p-4">
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
          <Avatar className="h-10 w-10 mt-1">
            <AvatarFallback className={isUser ? "bg-indigo-600 text-white" : "bg-muted"}>
              <Icon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          <div className={`flex-1 space-y-2 ${isUser ? "text-right" : ""}`}>
            <div className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
              {!isUser && agent && (
                <>
                  <Badge className={agent.color} variant="secondary">
                    {agent.name}
                  </Badge>
                  <span className="text-xs text-muted-foreground">•</span>
                  <span className="text-xs text-muted-foreground">{agent.expertise}</span>
                </>
              )}
              {isUser && (
                <Badge variant="default" className="bg-indigo-600">
                  Strategic Input
                </Badge>
              )}
              <span className="text-xs text-muted-foreground">
                <ClientDate date={message.timestamp} format="time" fallback="--:--" />
              </span>
            </div>

            <div className={`${isUser ? "text-right" : ""}`}>
              <p className="text-sm leading-relaxed mb-3">{message.content}</p>

              {message.reasoning && !isUser && (
                <div className="space-y-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setShowReasoning(!showReasoning)}
                    className="h-6 px-2 text-xs"
                  >
                    <Eye className="h-3 w-3 mr-1" />
                    {showReasoning ? "Hide" : "Show"} Reasoning
                  </Button>

                  {showReasoning && (
                    <div className="bg-muted/50 p-3 rounded-md border-l-2 border-indigo-500">
                      <p className="text-xs text-muted-foreground font-medium mb-1">Executive Reasoning:</p>
                      <p className="text-xs text-muted-foreground italic">{message.reasoning}</p>
                    </div>
                  )}
                </div>
              )}
            </div>

            {!isUser && (
              <div className="flex items-center gap-2 pt-2">
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <ThumbsUp className="h-3 w-3 mr-1" />
                  Helpful
                </Button>
                <Button variant="ghost" size="sm" className="h-6 px-2 text-xs">
                  <MessageSquare className="h-3 w-3 mr-1" />
                  Follow-up
                </Button>
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
