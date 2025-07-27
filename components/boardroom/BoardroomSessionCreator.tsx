"use client"

import { useState, useEffect } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Brain, Target, FileText } from "lucide-react"
import { useOnboarding } from "../../hooks/use-onboarding"

interface Scenario {
  id: string
  title: string
  description: string
  industry: string
  status: string
}

const AVAILABLE_AGENTS = [
  {
    id: 'ceo',
    name: 'CEO Agent',
    description: 'Strategic leadership and vision',
    icon: Target,
    color: 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
  },
  {
    id: 'cfo',
    name: 'CFO Agent', 
    description: 'Financial analysis and planning',
    icon: Brain,
    color: 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
  },
  {
    id: 'cto',
    name: 'CTO Agent',
    description: 'Technology and innovation',
    icon: Brain,
    color: 'bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300'
  },
  {
    id: 'hr',
    name: 'HR Agent',
    description: 'People and culture expertise',
    icon: Users,
    color: 'bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300'
  }
]

export function BoardroomSessionCreator() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const scenarioId = searchParams?.get('scenario')
  const { markStepCompleted } = useOnboarding()

  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['ceo', 'cfo'])
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)

  useEffect(() => {
    const loadScenario = async (id: string) => {
      setIsLoadingScenario(true)
      try {
        const response = await fetch(`/api/scenarios/${id}`)
        if (response.ok) {
          const result = await response.json()
          const scenarioData = result.data
          setScenario(scenarioData)
          setSessionName(`${scenarioData.name} - AI Discussion`)
          setSessionDescription(`AI boardroom discussion for: ${scenarioData.description}`)
        }
      } catch (error) {
        console.error('Failed to load scenario:', error)
      } finally {
        setIsLoadingScenario(false)
      }
    }

    if (scenarioId) {
      loadScenario(scenarioId)
    }
  }, [scenarioId])

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => 
      prev.includes(agentId) 
        ? prev.filter(id => id !== agentId)
        : [...prev, agentId]
    )
  }

  const handleCreateSession = async () => {
    if (!sessionName.trim() || selectedAgents.length === 0) {
      alert('Please provide a session name and select at least one agent')
      return
    }

    setIsLoading(true)
    try {
      const response = await fetch('/api/boardroom/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          sessionName: sessionName,
          sessionDescription: sessionDescription,
          scenarioId: scenarioId || undefined,
          selectedAgents: selectedAgents,
          companyName: scenario?.industry || undefined
        }),
      })

      if (response.ok) {
        const result = await response.json()
        if (result.success) {
          // Mark onboarding step as completed
          markStepCompleted('start-discussion')
          
          // Navigate to the created session
          router.push(`/boardroom/${result.data.sessionId}`)
        } else {
          throw new Error(result.error || 'Failed to create session')
        }
      } else {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create session:', error)
      alert(error instanceof Error ? error.message : "Failed to create session")
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      {/* Scenario Context */}
      {scenarioId && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-5 w-5" />
              Scenario Context
            </CardTitle>
            <CardDescription>
              This discussion will be based on the selected scenario
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isLoadingScenario ? (
              <div className="flex items-center gap-2">
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Loading scenario details...</span>
              </div>
            ) : scenario ? (
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <h3 className="font-semibold">{scenario.title}</h3>
                  <Badge variant="outline">{scenario.industry}</Badge>
                </div>
                <p className="text-sm text-muted-foreground">{scenario.description}</p>
              </div>
            ) : (
              <p className="text-sm text-muted-foreground">Failed to load scenario details</p>
            )}
          </CardContent>
        </Card>
      )}

      {/* Session Configuration */}
      <Card>
        <CardHeader>
          <CardTitle>Session Configuration</CardTitle>
          <CardDescription>
            Set up your AI boardroom discussion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="sessionName">Session Name</Label>
            <Input
              id="sessionName"
              value={sessionName}
              onChange={(e) => setSessionName(e.target.value)}
              placeholder="Enter session name..."
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="sessionDescription">Description (Optional)</Label>
            <Textarea
              id="sessionDescription"
              value={sessionDescription}
              onChange={(e) => setSessionDescription(e.target.value)}
              placeholder="Describe what you want to discuss..."
              rows={3}
            />
          </div>
        </CardContent>
      </Card>

      {/* Agent Selection */}
      <Card>
        <CardHeader>
          <CardTitle>Select AI Agents</CardTitle>
          <CardDescription>
            Choose which executives will participate in the discussion
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid gap-3">
            {AVAILABLE_AGENTS.map((agent) => {
              const Icon = agent.icon
              return (
                <div
                  key={agent.id}
                  className="flex items-center space-x-3 p-3 border rounded-lg cursor-pointer hover:bg-muted/50"
                  onClick={() => handleAgentToggle(agent.id)}
                >
                  <Checkbox
                    checked={selectedAgents.includes(agent.id)}
                    onChange={() => handleAgentToggle(agent.id)}
                  />
                  <Icon className="h-5 w-5" />
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{agent.name}</span>
                      <Badge className={agent.color}>{agent.id.toUpperCase()}</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground">{agent.description}</p>
                  </div>
                </div>
              )
            })}
          </div>

          <div className="text-sm text-muted-foreground">
            Selected: {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button 
          onClick={handleCreateSession} 
          disabled={isLoading || !sessionName.trim() || selectedAgents.length === 0}
          className="flex-1"
        >
          {isLoading ? (
            <>
              <Loader2 className="h-4 w-4 mr-2 animate-spin" />
              Creating Session...
            </>
          ) : (
            <>
              <Users className="h-4 w-4 mr-2" />
              Start AI Discussion
            </>
          )}
        </Button>
        
        <Button variant="outline" onClick={() => router.back()}>
          Cancel
        </Button>
      </div>
    </div>
  )
}

export default BoardroomSessionCreator
