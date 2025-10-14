"use client"

import React, { useEffect, useState } from "react"
import { Card, CardContent } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Brain, DollarSign, Code, Users, User, Eye, FileText, CheckCircle, AlertTriangle, Info } from "lucide-react"

interface StreamingMessageProps {
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
  // 🎯 ENHANCED: Add confidence and reasoning metadata
  confidence?: number // 0-1 scale
  reasoning?: {
    keyFactors?: string[]
    risks?: string[]
    assumptions?: string[]
    dataSources?: string[]
  }
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
  isComplete,
  documentMetadata, // 📄 ENHANCED: Receive document metadata
  confidence = 0.85, // 🎯 ENHANCED: Default confidence
  reasoning // 🎯 ENHANCED: Reasoning metadata
}: StreamingMessageProps) {
  const [showExplanation, setShowExplanation] = useState(false)
  const [displayedContent, setDisplayedContent] = useState("")
  
  const isUser = agentType === "user"
  const isSystem = agentType === "system"
  const Icon = agentIcons[agentType as keyof typeof agentIcons] || User
  const colorClass = agentColors[agentType as keyof typeof agentColors] || agentColors.user
  const title = agentTitles[agentType as keyof typeof agentTitles] || "Unknown"

  // 🎯 ENHANCED: Confidence level helpers
  const confidencePercentage = Math.round(confidence * 100)
  const confidenceLevel = confidence >= 0.8 ? 'high' : confidence >= 0.6 ? 'medium' : 'low'
  const confidenceColor = confidence >= 0.8 ? 'text-green-600' : confidence >= 0.6 ? 'text-yellow-600' : 'text-red-600'
  const confidenceIcon = confidence >= 0.8 ? CheckCircle : confidence >= 0.6 ? AlertTriangle : Info

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
                {/* 🎯 ENHANCED: Prominent confidence score */}
                <div className="flex items-center gap-2">
                  <Badge variant="outline" className={`text-xs ${confidenceColor} border-current`}>
                    {React.createElement(confidenceIcon, { className: "h-3 w-3 mr-1" })}
                    {confidencePercentage}% Confidence
                  </Badge>
                  {documentMetadata && documentMetadata.citedDocuments.length > 0 && (
                    <Badge variant="outline" className="text-xs bg-blue-50 text-blue-700 border-blue-200 dark:bg-blue-950 dark:text-blue-300">
                      <FileText className="h-3 w-3 mr-1" />
                      Used {documentMetadata.citedDocuments.length} document{documentMetadata.citedDocuments.length !== 1 ? 's' : ''}
                    </Badge>
                  )}
                </div>
                
                {/* 🎯 ENHANCED: Prominent "Why?" button */}
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => setShowExplanation(!showExplanation)}
                  className="h-8 px-3 text-xs font-semibold bg-indigo-600 hover:bg-indigo-700"
                >
                  <Eye className="h-3.5 w-3.5 mr-1.5" />
                  {showExplanation ? "Hide" : "Why?"} - Show Reasoning
                </Button>

                {showExplanation && (
                  <div className="bg-gradient-to-r from-indigo-50 to-purple-50 dark:from-indigo-950/30 dark:to-purple-950/30 p-4 rounded-lg border border-indigo-200 dark:border-indigo-800 space-y-3">
                    {/* Confidence Breakdown */}
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-2 flex items-center gap-1">
                        {React.createElement(confidenceIcon, { className: "h-4 w-4" })}
                        Confidence Level: {confidenceLevel.toUpperCase()} ({confidencePercentage}%)
                      </p>
                      <Progress value={confidencePercentage} className="h-2" />
                    </div>

                    {/* Executive Reasoning */}
                    <div>
                      <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                        Executive Perspective:
                      </p>
                      <p className="text-xs text-muted-foreground italic">
                        As the {title}, my response considers {
                          agentType === 'ceo' ? 'strategic vision, market positioning, and overall business impact' : 
                          agentType === 'cfo' ? 'financial implications, ROI analysis, and comprehensive risk management' : 
                          agentType === 'cto' ? 'technical feasibility, scalability, security, and innovation opportunities' : 
                          'people impact, talent development, organizational culture, and employee wellbeing'
                        }.
                      </p>
                    </div>

                    {/* 🎯 ENHANCED: Key Factors */}
                    {reasoning?.keyFactors && reasoning.keyFactors.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-indigo-900 dark:text-indigo-100 mb-1">
                          🎯 Key Factors Considered:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {reasoning.keyFactors.map((factor, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-indigo-600 dark:text-indigo-400 mt-0.5">•</span>
                              <span>{factor}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 🎯 ENHANCED: Risks Identified */}
                    {reasoning?.risks && reasoning.risks.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-red-900 dark:text-red-100 mb-1">
                          ⚠️ Risks Identified:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {reasoning.risks.map((risk, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-red-600 dark:text-red-400 mt-0.5">•</span>
                              <span>{risk}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 🎯 ENHANCED: Assumptions Made */}
                    {reasoning?.assumptions && reasoning.assumptions.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-yellow-900 dark:text-yellow-100 mb-1">
                          💭 Assumptions Made:
                        </p>
                        <ul className="text-xs text-muted-foreground space-y-1">
                          {reasoning.assumptions.map((assumption, idx) => (
                            <li key={idx} className="flex items-start gap-1">
                              <span className="text-yellow-600 dark:text-yellow-400 mt-0.5">•</span>
                              <span>{assumption}</span>
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {/* 📄 Document Sources */}
                    {documentMetadata && documentMetadata.citedDocuments.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          📚 Document Sources:
                        </p>
                        <p className="text-xs text-muted-foreground">
                          Referenced {documentMetadata.citedDocuments.map(num => `[Document ${num}]`).join(', ')} 
                          from uploaded materials
                        </p>
                      </div>
                    )}

                    {/* 🎯 ENHANCED: Data Sources */}
                    {reasoning?.dataSources && reasoning.dataSources.length > 0 && (
                      <div>
                        <p className="text-xs font-semibold text-green-900 dark:text-green-100 mb-1">
                          📊 Data Sources Used:
                        </p>
                        <div className="flex flex-wrap gap-1">
                          {reasoning.dataSources.map((source, idx) => (
                            <Badge key={idx} variant="secondary" className="text-xs">
                              {source}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}
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
