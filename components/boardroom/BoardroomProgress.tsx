"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Activity, CheckCircle, Clock } from "lucide-react"

interface BoardroomProgressProps {
  progress: number
  activeAgents: string[]
  completedSteps: string[]
  currentStep: string
}

export function BoardroomProgress({ 
  progress, 
  activeAgents, 
  completedSteps, 
  currentStep 
}: BoardroomProgressProps) {
  const steps = [
    { id: 'initialization', label: 'Session Initialization', description: 'Setting up the discussion environment' },
    { id: 'agent_analysis', label: 'Agent Analysis', description: 'AI agents analyzing the scenario' },
    { id: 'discussion', label: 'Executive Discussion', description: 'Collaborative decision-making process' },
    { id: 'synthesis', label: 'Decision Synthesis', description: 'Consolidating perspectives and recommendations' },
    { id: 'summary', label: 'Summary Generation', description: 'Finalizing decisions and action items' }
  ]

  const getStepStatus = (stepId: string) => {
    if (completedSteps.includes(stepId)) return 'completed'
    if (stepId === currentStep) return 'active'
    return 'pending'
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'active':
        return <Activity className="h-4 w-4 text-blue-500 animate-pulse" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300'
      case 'active':
        return 'bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300'
      default:
        return 'bg-muted text-muted-foreground'
    }
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Session Progress</CardTitle>
      </CardHeader>
      <CardContent className="space-y-6">
        {/* Overall Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-sm font-medium">Overall Progress</span>
            <span className="text-sm text-muted-foreground">{progress}%</span>
          </div>
          <Progress value={progress} className="h-2" />
        </div>

        {/* Active Agents */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Active Agents</h4>
          <div className="flex flex-wrap gap-2">
            {activeAgents.map((agent) => (
              <Badge key={agent} variant="secondary" className="text-xs">
                {agent.toUpperCase()}
              </Badge>
            ))}
          </div>
        </div>

        {/* Step Progress */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium">Discussion Steps</h4>
          <div className="space-y-2">
            {steps.map((step) => {
              const status = getStepStatus(step.id)
              return (
                <div
                  key={step.id}
                  className={`
                    flex items-start space-x-3 p-2 rounded-lg transition-colors
                    ${status === 'active' ? 'bg-blue-50 dark:bg-blue-950/20' : ''}
                  `}
                >
                  <div className="flex-shrink-0 mt-0.5">
                    {getStatusIcon(status)}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">{step.label}</span>
                      <Badge 
                        className={getStatusColor(status)} 
                        variant="secondary"
                      >
                        {status}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">
                      {step.description}
                    </p>
                  </div>
                </div>
              )
            })}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
