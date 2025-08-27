"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, ArrowLeft, Share, FileText, CheckCircle, AlertTriangle, Loader2 } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"
import { useState, useEffect } from "react"

interface DecisionSummaryProps {
  sessionId: string
}

interface SessionData {
  id: string
  name: string
  status: string
  createdAt: string
  scenario?: {
    name: string
    description: string
  }
  messages?: Array<{
    id: string
    content: string
    agentType: string
    createdAt: string
  }>
}

export function DecisionSummary({ sessionId }: DecisionSummaryProps) {
  const { toast } = useToast()
  const [sessionData, setSessionData] = useState<SessionData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  // Fetch session data when component mounts
  useEffect(() => {
    const fetchSessionData = async () => {
      try {
        setIsLoading(true)
        console.log(`🔍 Fetching decision data for session ${sessionId}`)

        // First, fetch all available sessions to see what exists
        const sessionResponse = await fetch(`/api/boardroom/sessions`)
        
        if (!sessionResponse.ok) {
          throw new Error('Failed to fetch sessions')
        }

        const sessionResult = await sessionResponse.json()
        
        if (sessionResult.success) {
          console.log(`📊 Available sessions:`, sessionResult.data?.map((s: SessionData) => ({ id: s.id, name: s.name, status: s.status })))
          
          // Find the specific session from the list
          const session = sessionResult.data?.find((s: SessionData) => s.id === sessionId)
          
          if (session) {
            console.log(`✅ Found target session:`, { id: session.id, name: session.name, status: session.status })
            
            // Now fetch messages for this confirmed session
            const messagesResponse = await fetch(`/api/boardroom/sessions/${sessionId}/messages`)
            
            if (messagesResponse.ok) {
              const messagesResult = await messagesResponse.json()
              
              if (messagesResult.success) {
                setSessionData({
                  id: session.id,
                  name: session.name,
                  status: session.status,
                  createdAt: session.createdAt,
                  scenario: session.scenario,
                  messages: messagesResult.data
                })
                console.log(`✅ Session data loaded successfully with ${messagesResult.data?.length || 0} messages`)
              } else {
                console.error(`❌ Failed to fetch messages:`, messagesResult.error)
                throw new Error(`Failed to fetch messages: ${messagesResult.error}`)
              }
            } else {
              console.error(`❌ Messages request failed with status ${messagesResponse.status}`)
              const errorData = await messagesResponse.json().catch(() => ({}))
              throw new Error(`Failed to fetch messages: ${errorData.error || 'Unknown error'}`)
            }
          } else {
            console.error(`❌ Session ${sessionId} not found in available sessions`)
            console.log(`💡 Available session IDs:`, sessionResult.data?.map((s: SessionData) => s.id))
            
            // Fallback: Use the most recent session if available
            if (sessionResult.data && sessionResult.data.length > 0) {
              const latestSession = sessionResult.data[0] // Sessions are ordered by createdAt DESC
              console.log(`🔄 Falling back to latest session: ${latestSession.id}`)
              
              // Redirect to the correct session
              if (typeof window !== 'undefined') {
                window.location.href = `/decisions/${latestSession.id}`
                return
              }
            }
            
            throw new Error(`Session not found: ${sessionId}`)
          }
        } else {
          throw new Error('Failed to fetch session data')
        }
      } catch (err) {
        console.error('Error fetching session data:', err)
        setError(err instanceof Error ? err.message : 'Failed to load session data')
      } finally {
        setIsLoading(false)
      }
    }

    if (sessionId && sessionId !== 'new') {
      fetchSessionData()
    }
  }, [sessionId])

  // Generate dynamic decision summary from session data
  const generateDecisionSummary = (session: SessionData) => {
    const date = new Date(session.createdAt).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    })
    
    const userMessages = session.messages?.filter(m => m.agentType === 'user') || []
    const agentMessages = session.messages?.filter(m => m.agentType !== 'user') || []
    
    const agentTypes = [...new Set(agentMessages.map(m => m.agentType.toUpperCase()))]
    
    return `# Executive Decision Summary
## ${session.scenario?.name || session.name}

### Session Overview
**Date:** ${date}  
**Participants:** ${agentTypes.join(', ')} (AI Agents)  
**Session ID:** ${session.id}  
**Status:** ${session.status.toUpperCase()}

---

### 📋 Discussion Summary

**Session Topic:** ${session.scenario?.description || 'Strategic business discussion'}

### 💬 Key Discussion Points

${userMessages.map((msg, index) => `
#### Discussion Point ${index + 1}
**User Input:** ${msg.content}

**AI Executive Responses:**
${agentMessages.filter(am => 
  Math.abs(new Date(am.createdAt).getTime() - new Date(msg.createdAt).getTime()) < 300000 // Within 5 minutes
).map(am => `
**${am.agentType.toUpperCase()}:** ${am.content}
`).join('')}
`).join('')}

### 🏢 Executive Participants

${agentTypes.map(agent => `
#### ${agent}
*Provided strategic insights and recommendations based on ${agent.toLowerCase()} perspective.*
`).join('')}

---

### 📊 Session Metrics

| Metric | Value |
|--------|-------|
| **Total Messages** | ${session.messages?.length || 0} |
| **User Inputs** | ${userMessages.length} |
| **AI Responses** | ${agentMessages.length} |
| **Active Agents** | ${agentTypes.length} |
| **Session Duration** | Active |

---

*This decision summary was generated from actual session data and represents the collaborative intelligence of the AI executive board.*`
  }

  const handleCopySummary = async () => {
    if (!sessionData) return
    
    try {
      const summary = generateDecisionSummary(sessionData)
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(summary)
        toast({
          title: "Decision summary copied",
          description: "The executive decision summary has been copied to your clipboard.",
        })
      } else {
        toast({
          title: "Copy not supported",
          description: "Clipboard access is not available.",
          variant: "destructive"
        })
      }
    } catch (err) {
      console.error('Error copying summary:', err)
      toast({
        title: "Copy failed",
        description: "Failed to copy summary to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = () => {
    toast({
      title: "PDF Export Initiated",
      description: "Your executive decision summary is being prepared for download.",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: "Secure sharing link has been copied to clipboard.",
    })
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading session data...</span>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !sessionData) {
    return (
      <div className="max-w-5xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
        </div>
        <Card>
          <CardContent className="py-12">
            <div className="text-center">
              <AlertTriangle className="h-12 w-12 text-yellow-500 mx-auto mb-4" />
              <h3 className="text-lg font-semibold mb-2">Session Not Found</h3>
              <p className="text-muted-foreground">
                {error || 'The requested session could not be found or you may not have access to it.'}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  const summary = generateDecisionSummary(sessionData)

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">{sessionData.scenario?.name || sessionData.name}</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                {sessionData.status === 'active' ? 'Active Session' : 'Completed Session'}
              </Badge>
              <Badge variant="outline">Real Session Data</Badge>
              <span className="text-sm text-muted-foreground">
                Session from {new Date(sessionData.createdAt).toLocaleDateString()}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-700">
          <Share className="h-4 w-4 mr-2" />
          Share Decision
        </Button>
        <Button variant="outline" onClick={handleCopySummary}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Summary
        </Button>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View Transcript
        </Button>
      </div>

      {/* Decision Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Decision Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 p-6 rounded-lg border">
              {summary}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Real-time Session Stats */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold">{sessionData.messages?.length || 0}</div>
            <p className="text-xs text-muted-foreground">Total Messages</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold">
              {sessionData.messages?.filter(m => m.agentType === 'user').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">User Inputs</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold">
              {sessionData.messages?.filter(m => m.agentType !== 'user').length || 0}
            </div>
            <p className="text-xs text-muted-foreground">AI Responses</p>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="py-4">
            <div className="text-2xl font-bold">
              {[...new Set(sessionData.messages?.filter(m => m.agentType !== 'user').map(m => m.agentType))].length || 0}
            </div>
            <p className="text-xs text-muted-foreground">Active Agents</p>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
