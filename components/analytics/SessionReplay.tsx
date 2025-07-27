import React, { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { ScrollArea } from '@/components/ui/scroll-area'
import { 
  Play, 
  Pause, 
  SkipForward, 
  SkipBack,
  Clock,
  MessageSquare,
  User,
  Bot,
  FileText,
  Target,
  FastForward
} from 'lucide-react'

interface ReplayMessage {
  id: string
  type: 'user' | 'agent' | 'system' | 'decision'
  sender: string
  content: string
  timestamp: string
  agentType?: string
  reasoning?: string
  confidence?: number
  documents?: Array<{
    name: string
    relevance: number
  }>
}

interface SessionReplayData {
  sessionId: string
  sessionName: string
  scenario: string
  startTime: string
  endTime?: string
  duration: number
  participants: string[]
  messages: ReplayMessage[]
  decisions: Array<{
    id: string
    title: string
    description: string
    timestamp: string
    confidence: number
    consensus: number
  }>
}

interface SessionReplayProps {
  sessionId: string
  autoPlay?: boolean
  playbackSpeed?: number
}

export function SessionReplay({ 
  sessionId, 
  autoPlay = false, 
  playbackSpeed = 1 
}: SessionReplayProps) {
  const [sessionData, setSessionData] = useState<SessionReplayData | null>(null)
  const [isPlaying, setIsPlaying] = useState(autoPlay)
  const [currentMessageIndex, setCurrentMessageIndex] = useState(0)
  const [speed, setSpeed] = useState(playbackSpeed)
  const [isLoading, setIsLoading] = useState(true)

  // Load session data
  useEffect(() => {
    const loadSessionData = async () => {
      setIsLoading(true)
      try {
        const response = await fetch(`/api/analytics/sessions/${sessionId}/replay`)
        if (response.ok) {
          const data = await response.json()
          setSessionData(data.data)
        } else {
          // Mock data for demo
          setSessionData({
            sessionId: sessionId,
            sessionName: 'Q1 Strategic Planning Review',
            scenario: 'Strategic Planning',
            startTime: '2025-01-14T10:30:00Z',
            endTime: '2025-01-14T11:35:00Z',
            duration: 65,
            participants: ['Executive User', 'CEO Agent', 'CFO Agent', 'CTO Agent'],
            messages: [
              {
                id: '1',
                type: 'user',
                sender: 'Executive User',
                content: 'Let\'s discuss our Q1 strategic priorities. What are the key areas we should focus on?',
                timestamp: '2025-01-14T10:30:00Z'
              },
              {
                id: '2',
                type: 'agent',
                sender: 'CEO Agent',
                content: 'Based on our current market position and growth objectives, I recommend focusing on three strategic pillars: market expansion, operational efficiency, and digital transformation.',
                timestamp: '2025-01-14T10:31:30Z',
                agentType: 'ceo',
                reasoning: 'Market analysis shows opportunities in new segments',
                confidence: 0.87,
                documents: [
                  { name: 'Q4 Financial Report.pdf', relevance: 0.92 },
                  { name: 'Market Research Data.xlsx', relevance: 0.78 }
                ]
              },
              {
                id: '3',
                type: 'agent',
                sender: 'CFO Agent',
                content: 'From a financial perspective, we have the capital to support aggressive growth, but we need to balance investment with profitability targets. I suggest allocating 40% to market expansion, 35% to efficiency, and 25% to digital initiatives.',
                timestamp: '2025-01-14T10:33:15Z',
                agentType: 'cfo',
                reasoning: 'Budget analysis shows optimal allocation ratios',
                confidence: 0.91
              },
              {
                id: '4',
                type: 'decision',
                sender: 'System',
                content: 'Decision Point: Strategic Priority Allocation - Market Expansion (40%), Operational Efficiency (35%), Digital Transformation (25%)',
                timestamp: '2025-01-14T10:45:00Z'
              },
              {
                id: '5',
                type: 'agent',
                sender: 'CTO Agent',
                content: 'The digital transformation budget should prioritize cloud migration and AI implementation. These initiatives will support both efficiency and expansion goals.',
                timestamp: '2025-01-14T10:46:30Z',
                agentType: 'cto',
                reasoning: 'Technology roadmap analysis',
                confidence: 0.85
              }
            ],
            decisions: [
              {
                id: 'decision-1',
                title: 'Q1 Strategic Priority Allocation',
                description: 'Agreed on budget allocation: Market Expansion (40%), Operational Efficiency (35%), Digital Transformation (25%)',
                timestamp: '2025-01-14T10:45:00Z',
                confidence: 89,
                consensus: 95
              }
            ]
          })
        }
      } catch (error) {
        console.error('Failed to load session replay:', error)
      } finally {
        setIsLoading(false)
      }
    }

    loadSessionData()
  }, [sessionId])

  // Auto-play functionality
  useEffect(() => {
    if (!isPlaying || !sessionData) return

    const interval = setInterval(() => {
      setCurrentMessageIndex(prev => {
        if (prev >= sessionData.messages.length - 1) {
          setIsPlaying(false)
          return prev
        }
        return prev + 1
      })
    }, 2000 / speed)

    return () => clearInterval(interval)
  }, [isPlaying, sessionData, speed])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleSkipForward = () => {
    if (sessionData && currentMessageIndex < sessionData.messages.length - 1) {
      setCurrentMessageIndex(currentMessageIndex + 1)
    }
  }

  const handleSkipBack = () => {
    if (currentMessageIndex > 0) {
      setCurrentMessageIndex(currentMessageIndex - 1)
    }
  }

  const handleSpeedChange = () => {
    const speeds = [0.5, 1, 1.5, 2]
    const currentIndex = speeds.indexOf(speed)
    const nextIndex = (currentIndex + 1) % speeds.length
    setSpeed(speeds[nextIndex])
  }

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString()
  }

  const getMessageIcon = (type: string) => {
    switch (type) {
      case 'user': return <User className="h-4 w-4" />
      case 'agent': return <Bot className="h-4 w-4" />
      case 'decision': return <Target className="h-4 w-4" />
      default: return <MessageSquare className="h-4 w-4" />
    }
  }

  const getMessageColor = (type: string) => {
    switch (type) {
      case 'user': return 'border-blue-200 bg-blue-50'
      case 'agent': return 'border-green-200 bg-green-50'
      case 'decision': return 'border-purple-200 bg-purple-50'
      default: return 'border-gray-200 bg-gray-50'
    }
  }

  if (isLoading) {
    return (
      <Card>
        <CardContent className="flex items-center justify-center py-8">
          <div className="animate-pulse">Loading session replay...</div>
        </CardContent>
      </Card>
    )
  }

  if (!sessionData) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">Session replay not available</p>
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-6">
      {/* Session Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle>{sessionData.sessionName}</CardTitle>
              <p className="text-muted-foreground">Scenario: {sessionData.scenario}</p>
            </div>
            <Badge variant="outline">
              <Clock className="h-4 w-4 mr-2" />
              {Math.floor(sessionData.duration / 60)}h {sessionData.duration % 60}m
            </Badge>
          </div>
        </CardHeader>
      </Card>

      {/* Playback Controls */}
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <Button variant="outline" size="sm" onClick={handleSkipBack} disabled={currentMessageIndex === 0}>
                <SkipBack className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handlePlayPause}>
                {isPlaying ? <Pause className="h-4 w-4" /> : <Play className="h-4 w-4" />}
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleSkipForward} 
                disabled={!sessionData || currentMessageIndex >= sessionData.messages.length - 1}
              >
                <SkipForward className="h-4 w-4" />
              </Button>
              <Button variant="outline" size="sm" onClick={handleSpeedChange}>
                <FastForward className="h-4 w-4 mr-2" />
                {speed}x
              </Button>
            </div>
            <div className="text-sm text-muted-foreground">
              Message {currentMessageIndex + 1} of {sessionData.messages.length}
            </div>
          </div>
          
          {/* Progress Bar */}
          <div className="mt-4">
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div 
                className="bg-blue-600 h-2 rounded-full transition-all duration-300" 
                style={{ 
                  width: `${sessionData.messages.length > 0 ? ((currentMessageIndex + 1) / sessionData.messages.length) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Message Replay */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <MessageSquare className="h-5 w-5" />
                <span>Session Messages</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-96">
                <div className="space-y-4">
                  {sessionData.messages.slice(0, currentMessageIndex + 1).map((message, index) => (
                    <div 
                      key={message.id} 
                      className={`p-4 border rounded-lg ${getMessageColor(message.type)} ${
                        index === currentMessageIndex ? 'ring-2 ring-blue-500' : ''
                      }`}
                    >
                      <div className="flex items-start space-x-3">
                        <div className="flex-shrink-0">
                          {getMessageIcon(message.type)}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium">{message.sender}</span>
                            <span className="text-sm text-muted-foreground">
                              {formatTimestamp(message.timestamp)}
                            </span>
                          </div>
                          <p className="text-sm">{message.content}</p>
                          
                          {message.confidence && (
                            <div className="mt-2">
                              <span className="text-xs text-muted-foreground">
                                Confidence: {Math.round(message.confidence * 100)}%
                              </span>
                            </div>
                          )}
                          
                          {message.documents && message.documents.length > 0 && (
                            <div className="mt-2">
                              <div className="text-xs text-muted-foreground mb-1">Referenced documents:</div>
                              <div className="flex flex-wrap gap-1">
                                {message.documents.map((doc, docIndex) => (
                                  <Badge key={docIndex} variant="outline" className="text-xs">
                                    <FileText className="h-3 w-3 mr-1" />
                                    {doc.name} ({Math.round(doc.relevance * 100)}%)
                                  </Badge>
                                ))}
                              </div>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Session Info Sidebar */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Session Details</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <span className="text-sm font-medium">Duration:</span>
                <p className="text-sm text-muted-foreground">
                  {Math.floor(sessionData.duration / 60)}h {sessionData.duration % 60}m
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Participants:</span>
                <p className="text-sm text-muted-foreground">
                  {sessionData.participants.join(', ')}
                </p>
              </div>
              <div>
                <span className="text-sm font-medium">Messages:</span>
                <p className="text-sm text-muted-foreground">
                  {sessionData.messages.length} total
                </p>
              </div>
            </CardContent>
          </Card>

          {sessionData.decisions.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Target className="h-5 w-5" />
                  <span>Decisions Made</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {sessionData.decisions.map((decision) => (
                    <div key={decision.id} className="p-3 border rounded-lg">
                      <div className="font-medium text-sm">{decision.title}</div>
                      <p className="text-xs text-muted-foreground mt-1">
                        {decision.description}
                      </p>
                      <div className="flex justify-between mt-2 text-xs">
                        <span>Confidence: {decision.confidence}%</span>
                        <span>Consensus: {decision.consensus}%</span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

export default SessionReplay
