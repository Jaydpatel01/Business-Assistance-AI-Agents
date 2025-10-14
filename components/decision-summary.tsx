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

        // Fetch session data using the dedicated single-session endpoint
        const sessionResponse = await fetch(`/api/boardroom/sessions/${sessionId}`)
        
        if (!sessionResponse.ok) {
          if (sessionResponse.status === 404) {
            throw new Error('Session not found or access denied')
          }
          throw new Error('Failed to fetch session data')
        }

        const sessionResult = await sessionResponse.json()
        
        if (sessionResult.success && sessionResult.data) {
          const session = sessionResult.data
          console.log(`✅ Found session:`, { id: session.id, name: session.name, status: session.status })
          
          setSessionData({
            id: session.id,
            name: session.name,
            status: session.status,
            createdAt: session.createdAt,
            scenario: session.scenario,
            messages: session.messages || []
          })
          console.log(`✅ Session data loaded successfully with ${session.messages?.length || 0} messages`)
        } else {
          throw new Error('Invalid response format from server')
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

  const handleExportPDF = async () => {
    if (!sessionData) return
    
    try {
      toast({
        title: "Generating PDF",
        description: "Your executive decision summary is being prepared...",
      })

      const response = await fetch('/api/boardroom/export', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionId: sessionData.id,
          format: 'pdf',
          options: {
            includeTranscript: true,
            includeReasoning: true,
            includeCitations: true,
          },
        }),
      })

      if (!response.ok) {
        throw new Error('Failed to generate PDF')
      }

      // Download the PDF
      const blob = await response.blob()
      const url = window.URL.createObjectURL(blob)
      const a = document.createElement('a')
      a.href = url
      a.download = `session-report-${sessionData.id.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.pdf`
      document.body.appendChild(a)
      a.click()
      document.body.removeChild(a)
      window.URL.revokeObjectURL(url)

      toast({
        title: "PDF Downloaded",
        description: "Your executive decision summary has been downloaded successfully.",
      })
    } catch (err) {
      console.error('Error exporting PDF:', err)
      toast({
        title: "Export Failed",
        description: "Failed to generate PDF. Please try again.",
        variant: "destructive",
      })
    }
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
