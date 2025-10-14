"use client"

import { useState, useEffect, useRef } from "react"
import { useRouter, useSearchParams, usePathname } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Loader2, Users, Brain, Target, FileText } from "lucide-react"
import { useOnboarding } from "../../hooks/use-onboarding"
import { useDemoMode } from "../../hooks/use-demo-mode"
import { getDemoScenario } from "../../lib/demo/demo-scenarios"

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
  const pathname = usePathname()
  const scenarioId = searchParams?.get('scenario')
  const { markStepCompleted } = useOnboarding()
  const { isDemo } = useDemoMode()
  const hasRedirected = useRef(false)

  const [sessionName, setSessionName] = useState('')
  const [sessionDescription, setSessionDescription] = useState('')
  const [selectedAgents, setSelectedAgents] = useState<string[]>(['ceo', 'cfo'])
  const [scenario, setScenario] = useState<Scenario | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isLoadingScenario, setIsLoadingScenario] = useState(false)
  const [isCreating, setIsCreating] = useState(false)

  // Auto-redirect demo users directly to boardroom
  useEffect(() => {
    console.log('🔍 BoardroomSessionCreator useEffect triggered')
    console.log('- isDemo:', isDemo)
    console.log('- scenarioId:', scenarioId)
    console.log('- pathname:', pathname)
    console.log('- hasRedirected.current:', hasRedirected.current)
    
    // Only redirect if we're on the /boardroom/new page (not already on a session page)
    if (isDemo && scenarioId && !hasRedirected.current && pathname === '/boardroom/new') {
      const demoScenario = getDemoScenario(scenarioId)
      console.log('- demoScenario:', demoScenario ? 'found' : 'not found')
      
      if (demoScenario) {
        console.log('🎭 Demo mode: Redirecting directly to boardroom')
        hasRedirected.current = true // Prevent multiple redirects
        
        // Show loading state for demo users
        setIsCreating(true)
        
        // Create a demo session ID and redirect with a brief delay
        const demoSessionId = `demo-${scenarioId}-${Date.now()}`
        console.log('- Creating demo session ID:', demoSessionId)
        
        // Mark onboarding step as completed for demo users
        markStepCompleted('start-discussion')
        
        // Brief delay to show loading state, then redirect
        setTimeout(() => {
          const redirectUrl = `/boardroom/${demoSessionId}?demo=true&scenario=${scenarioId}`
          console.log('🚀 Redirecting to:', redirectUrl)
          router.push(redirectUrl)
        }, 800) // Reduced delay for better UX
        return
      }
    }
  }, [isDemo, scenarioId, pathname, router, markStepCompleted])

  useEffect(() => {
    const loadScenario = async (id: string) => {
      // Handle the specific case of scenario ID "1" which seems to be a bug
      if (id === "1") {
        console.warn('⚠️ Detected invalid scenario ID "1", redirecting to scenarios page');
        alert('Invalid scenario ID detected. Please select a valid scenario from the list.');
        window.location.href = '/scenarios';
        return;
      }
      
      setIsLoadingScenario(true)
      try {
        console.log(`🔍 Loading scenario: ${id}`);
        const response = await fetch(`/api/scenarios/${id}`)
        if (response.ok) {
          const result = await response.json()
          const scenarioData = result.data
          setScenario(scenarioData)
          setSessionName(`${scenarioData.name} - AI Discussion`)
          setSessionDescription(`AI boardroom discussion for: ${scenarioData.description}`)
          
          // Auto-select recommended agents if available
          if (scenarioData.recommendedAgents && scenarioData.recommendedAgents.length > 0) {
            setSelectedAgents(scenarioData.recommendedAgents)
            console.log(`✅ Auto-selected ${scenarioData.recommendedAgents.length} recommended agents`);
          }
          
          console.log(`✅ Loaded scenario: ${scenarioData.name}`);
        } else {
          const errorData = await response.json();
          console.error('Failed to load scenario:', errorData);
          
          // Show user-friendly error with available options
          const availableIds = errorData.availableIds || [];
          const message = `Scenario "${id}" not found. Available scenarios:\n${availableIds.join(', ')}\n\nYou can start a session without selecting a specific scenario.`;
          
          if (confirm(message + '\n\nWould you like to continue without a predefined scenario?')) {
            // User chose to continue without scenario
            setScenario(null);
            setSessionName('Custom AI Discussion');
            setSessionDescription('Custom boardroom discussion session');
          } else {
            // Redirect to scenarios page to select a valid one
            window.location.href = '/scenarios';
          }
        }
      } catch (error) {
        console.error('Failed to load scenario:', error)
        const message = `Error loading scenario "${id}". You can start a session without selecting a specific scenario.`;
        
        if (confirm(message + '\n\nWould you like to continue without a predefined scenario?')) {
          setScenario(null);
          setSessionName('Custom AI Discussion');
          setSessionDescription('Custom boardroom discussion session');
        } else {
          window.location.href = '/scenarios';
        }
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
      const apiEndpoint = isDemo ? '/api/demo/sessions' : '/api/boardroom/sessions'
      console.log(`📡 Creating session using ${isDemo ? 'demo' : 'production'} API`)
      
      const response = await fetch(apiEndpoint, {
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
          const sessionPath = isDemo 
            ? `/boardroom/${result.data.sessionId}?demo=true&scenario=${scenarioId}`
            : `/boardroom/${result.data.sessionId}`
          
          router.push(sessionPath)
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

  // Show demo loading screen while redirecting
  if (isDemo && isCreating) {
    return (
      <div className="max-w-2xl mx-auto space-y-6">
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <div className="flex justify-center">
                <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 dark:from-blue-900 dark:to-indigo-900 rounded-full flex items-center justify-center">
                  <span className="text-2xl">🎭</span>
                </div>
              </div>
              <div className="space-y-2">
                <h3 className="text-lg font-semibold">Setting up your demo experience...</h3>
                <p className="text-muted-foreground">
                  Preparing the boardroom with pre-filled scenario data and AI agents
                </p>
              </div>
              <div className="flex justify-center">
                <Loader2 className="h-6 w-6 animate-spin text-primary" />
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    )
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
          size="lg"
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
