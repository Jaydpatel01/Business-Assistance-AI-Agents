"use client"

import { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Brain, DollarSign, Code, Users, User, Eye } from "lucide-react"

interface StreamingMessageProps {
  id: string
  agentType: string
  content: string
  timestamp: Date
  isStreaming: boolean
  isComplete: boolean
}

const agentIcons = {
  ceo: Brain,
  cfo: DollarSign, 
  cto: Code,
  hr: Users,
  user: User,
  system: Brain // Add system icon
}

const agentColors = {
  ceo: "bg-indigo-100 text-indigo-800 dark:bg-indigo-900 dark:text-indigo-300",
  cfo: "bg-teal-100 text-teal-800 dark:bg-teal-900 dark:text-teal-300", 
  cto: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  hr: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  user: "bg-gray-100 text-gray-800 dark:bg-gray-900 dark:text-gray-300",
  system: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300"
}

const agentTitles = {
  ceo: "Chief Executive Officer",
  cfo: "Chief Financial Officer",
  cto: "Chief Technology Officer", 
  hr: "Human Resources Director",
  user: "User",
  system: "System"
}

export function StreamingMessage({ 
  agentType, 
  content, 
  timestamp, 
  isStreaming,
  isComplete 
}: StreamingMessageProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  
  const isUser = agentType === "user"
  const isSystem = agentType === "system"
  const Icon = agentIcons[agentType as keyof typeof agentIcons] || User
  const colorClass = agentColors[agentType as keyof typeof agentColors] || agentColors.user
  const title = agentTitles[agentType as keyof typeof agentTitles] || "Unknown"

  // Simulate streaming effect for agent responses
  useEffect(() => {
    if (isUser || isComplete || isSystem) {
      setDisplayedContent(content)
      return
    }

    if (isStreaming) {
      setDisplayedContent("")
      return
    }

    // When streaming stops, animate the content appearing
    let currentIndex = 0
    const interval = setInterval(() => {
      if (currentIndex <= content.length) {
        setDisplayedContent(content.slice(0, currentIndex))
        currentIndex += Math.random() < 0.8 ? 2 : 1 // Variable speed for realism
      } else {
        clearInterval(interval)
      }
    }, 20)

    return () => clearInterval(interval)
  }, [content, isStreaming, isComplete, isUser, isSystem])

  // System messages have different styling
  if (isSystem) {
    return (
      <div className="flex justify-center my-4">
        <div className="px-4 py-2 bg-muted rounded-full text-sm text-muted-foreground font-medium">
          {content}
        </div>
      </div>
    )
  }

  return (
    <Card className={`${isUser ? "ml-12 bg-indigo-50 dark:bg-indigo-950/20" : "mr-12"} transition-all duration-300`}>
      <CardContent className="p-4">
        <div className={`flex gap-3 ${isUser ? "flex-row-reverse" : ""}`}>
          <Avatar className="h-10 w-10 mt-1">
            <AvatarFallback className={isUser ? "bg-indigo-600 text-white" : "bg-muted"}>
              <Icon className="h-5 w-5" />
            </AvatarFallback>
          </Avatar>

          <div className={`flex-1 space-y-2 ${isUser ? "text-right" : ""}`}>
            <div className={`flex items-center gap-2 ${isUser ? "justify-end" : ""}`}>
              <Badge className={colorClass} variant="secondary">
                {agentType.toUpperCase()}
              </Badge>
              <span className="text-xs text-muted-foreground">
                {title}
              </span>
              <span className="text-xs text-muted-foreground">
                {timestamp.toLocaleTimeString()}
              </span>
            </div>

            <div className={`prose prose-sm max-w-none ${isUser ? "text-right" : ""}`}>
              {isStreaming ? (
                <div className="flex items-center gap-2">
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 bg-current rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                  <span className="text-sm text-muted-foreground italic">
                    {title} is thinking...
                  </span>
                </div>
              ) : (
                <div>
                  <p className="whitespace-pre-wrap">{displayedContent}</p>
                  {displayedContent !== content && (
                    <span className="inline-block w-2 h-4 bg-current animate-pulse ml-1"></span>
                  )}
                </div>
              )}
            </div>

            {!isUser && isComplete && (
              <div className="space-y-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="h-6 px-2 text-xs"
                >
                  <Eye className="h-3 w-3 mr-1" />
                  {showExplanation ? "Hide" : "Show"} Reasoning
                </Button>

                {showExplanation && (
                  <div className="bg-muted/50 p-3 rounded-md border-l-2 border-indigo-500">
                    <p className="text-xs text-muted-foreground font-medium mb-1">Executive Reasoning:</p>
                    <p className="text-xs text-muted-foreground italic">
                      As the {title}, my response considers {
                        agentType === 'ceo' ? 'strategic vision and overall business impact' : 
                        agentType === 'cfo' ? 'financial implications and risk management' : 
                        agentType === 'cto' ? 'technical feasibility and innovation opportunities' : 
                        'people impact and organizational culture'
                      }.
                    </p>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
