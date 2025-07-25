"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Checkbox } from "@/components/ui/checkbox"
import { Badge } from "@/components/ui/badge"
import { Brain, DollarSign, Code, Users } from "lucide-react"

interface Agent {
  id: string
  name: string
  fullTitle: string
  color: string
  expertise: string
}

interface AgentSelectorProps {
  agents: Agent[]
  selectedAgents: string[]
  onAgentToggle: (agentId: string) => void
  disabled?: boolean
}

const agentIcons = {
  ceo: Brain,
  cfo: DollarSign,
  cto: Code,
  hr: Users,
}

export function AgentSelector({ 
  agents, 
  selectedAgents, 
  onAgentToggle, 
  disabled = false 
}: AgentSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg">Select Executive Agents</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {agents.map((agent) => {
            const Icon = agentIcons[agent.id as keyof typeof agentIcons] || Brain
            const isSelected = selectedAgents.includes(agent.id)
            
            return (
              <div
                key={agent.id}
                className={`
                  flex items-center space-x-3 p-3 rounded-lg border transition-all cursor-pointer
                  ${isSelected 
                    ? 'border-primary bg-primary/5 shadow-sm' 
                    : 'border-border hover:border-primary/50 hover:bg-muted/50'
                  }
                  ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
                `}
                onClick={() => !disabled && onAgentToggle(agent.id)}
              >
                <Checkbox
                  checked={isSelected}
                  onCheckedChange={() => !disabled && onAgentToggle(agent.id)}
                  disabled={disabled}
                  aria-label={`Select ${agent.fullTitle}`}
                />
                
                <div className="flex items-center space-x-3 flex-1">
                  <div className="flex-shrink-0">
                    <div className={`p-2 rounded-full ${agent.color}`}>
                      <Icon className="h-4 w-4" />
                    </div>
                  </div>
                  
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <Badge className={agent.color} variant="secondary">
                        {agent.name}
                      </Badge>
                    </div>
                    <p className="text-sm font-medium mt-1">{agent.fullTitle}</p>
                    <p className="text-xs text-muted-foreground truncate">
                      {agent.expertise}
                    </p>
                  </div>
                </div>
              </div>
            )
          })}
        </div>
        
        {selectedAgents.length === 0 && (
          <div className="text-center text-muted-foreground text-sm mt-4 p-4 bg-muted/20 rounded-lg">
            Select at least one executive agent to begin the discussion
          </div>
        )}
        
        {selectedAgents.length > 0 && (
          <div className="text-center text-sm text-muted-foreground mt-4">
            {selectedAgents.length} agent{selectedAgents.length !== 1 ? 's' : ''} selected
          </div>
        )}
      </CardContent>
    </Card>
  )
}
