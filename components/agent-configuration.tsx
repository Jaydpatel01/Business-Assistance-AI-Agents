"use client"

import { useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { PersonalityConfig } from "@/components/configuration/PersonalityConfig"
import { useToast } from "@/hooks/use-toast"
import { Save, RefreshCw, Settings, Brain } from "lucide-react"
import { ExecutiveRole } from "@/types/executive"

interface AgentConfigurationProps {
  agentType: ExecutiveRole
}

interface AgentProfile {
  name: string
  role: string
  expertise: string[]
  personalityConfig: {
    risk_tolerance: number
    decision_speed: number
    collaboration_style: number
    detail_focus: number
    communication_style: 'formal' | 'casual' | 'technical' | 'diplomatic'
  }
  responseTemplates: {
    greeting: string
    analysis: string
    recommendation: string
  }
}

const defaultProfiles: Partial<Record<ExecutiveRole, AgentProfile>> = {
  [ExecutiveRole.CEO]: {
    name: "CEO Agent",
    role: "Chief Executive Officer",
    expertise: ["Strategic Planning", "Leadership", "Vision Setting", "Stakeholder Management"],
    personalityConfig: {
      risk_tolerance: 70,
      decision_speed: 80,
      collaboration_style: 85,
      detail_focus: 60,
      communication_style: 'formal'
    },
    responseTemplates: {
      greeting: "I'll provide strategic perspective on this matter.",
      analysis: "From a strategic standpoint, we need to consider...",
      recommendation: "My recommendation is to proceed with..."
    }
  },
  [ExecutiveRole.CFO]: {
    name: "CFO Agent", 
    role: "Chief Financial Officer",
    expertise: ["Financial Analysis", "Risk Management", "Budgeting", "Investment Strategy"],
    personalityConfig: {
      risk_tolerance: 40,
      decision_speed: 60,
      collaboration_style: 70,
      detail_focus: 90,
      communication_style: 'technical'
    },
    responseTemplates: {
      greeting: "I'll analyze the financial implications.",
      analysis: "The financial data shows...",
      recommendation: "From a financial perspective, I recommend..."
    }
  },
  [ExecutiveRole.CTO]: {
    name: "CTO Agent",
    role: "Chief Technology Officer", 
    expertise: ["Technology Strategy", "Innovation", "Digital Transformation", "System Architecture"],
    personalityConfig: {
      risk_tolerance: 60,
      decision_speed: 75,
      collaboration_style: 65,
      detail_focus: 85,
      communication_style: 'technical'
    },
    responseTemplates: {
      greeting: "I'll evaluate the technical aspects.",
      analysis: "From a technology standpoint...",
      recommendation: "The technical recommendation is..."
    }
  },
  [ExecutiveRole.CHRO]: {
    name: "HR Agent",
    role: "Human Resources Director",
    expertise: ["People Management", "Organizational Culture", "Talent Development", "Change Management"],
    personalityConfig: {
      risk_tolerance: 50,
      decision_speed: 65,
      collaboration_style: 90,
      detail_focus: 70,
      communication_style: 'diplomatic'
    },
    responseTemplates: {
      greeting: "I'll consider the people and culture impact.",
      analysis: "From an HR perspective...",
      recommendation: "To support our people, I recommend..."
    }
  }
}

export function AgentConfiguration({ agentType }: AgentConfigurationProps) {
  const [profile, setProfile] = useState<AgentProfile>(() => {
    const defaultProfile = defaultProfiles[agentType]
    if (!defaultProfile) {
      throw new Error(`No default profile found for agent type: ${agentType}`)
    }
    return defaultProfile
  })
  const [isLoading, setIsLoading] = useState(false)
  const { toast } = useToast()
  
  const handlePersonalityChange = (newConfig: AgentProfile['personalityConfig']) => {
    setProfile(prev => ({
      ...prev,
      personalityConfig: newConfig
    }))
  }

  const handleSave = async () => {
    try {
      setIsLoading(true)
      
      // API call to save configuration
      const response = await fetch(`/api/agents/${agentType}/config`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(profile)
      })
      
      if (!response.ok) throw new Error('Failed to save configuration')
      
      toast({
        title: "Configuration Saved",
        description: `${profile.name} configuration updated successfully`,
      })
    } catch (error) {
      console.error('Save error:', error)
      toast({
        title: "Save Failed", 
        description: "Could not save agent configuration",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }

  const handleReset = () => {
    const defaultProfile = defaultProfiles[agentType]
    if (!defaultProfile) {
      console.error(`No default profile found for agent type: ${agentType}`)
      return
    }
    setProfile(defaultProfile)
    toast({
      title: "Configuration Reset",
      description: "Agent configuration restored to defaults",
    })
  }

  return (
    <div className="space-y-6">
      {/* Agent Profile Header */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="p-2 bg-primary/10 rounded-lg">
                <Brain className="h-5 w-5 text-primary" />
              </div>
              <div>
                <CardTitle className="flex items-center gap-2">
                  {profile.name}
                  <Badge variant="outline">{profile.role}</Badge>
                </CardTitle>
                <p className="text-sm text-muted-foreground mt-1">
                  Customize personality, response style, and expertise areas
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" onClick={handleReset} disabled={isLoading}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Reset
              </Button>
              <Button onClick={handleSave} disabled={isLoading}>
                {isLoading ? (
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                ) : (
                  <Save className="h-4 w-4 mr-2" />
                )}
                Save Changes
              </Button>
            </div>
          </div>
        </CardHeader>
      </Card>

      {/* Configuration Tabs */}
      <Tabs defaultValue="personality" className="space-y-4">
        <TabsList className="grid w-full grid-cols-3">
          <TabsTrigger value="personality">Personality</TabsTrigger>
          <TabsTrigger value="expertise">Expertise</TabsTrigger>
          <TabsTrigger value="responses">Response Style</TabsTrigger>
        </TabsList>
        
        <TabsContent value="personality" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Settings className="h-5 w-5" />
                Personality Configuration
              </CardTitle>
              <p className="text-sm text-muted-foreground">
                Adjust how the agent approaches decisions and interactions
              </p>
            </CardHeader>
            <CardContent>
              <PersonalityConfig
                config={profile.personalityConfig}
                onChange={handlePersonalityChange}
                disabled={isLoading}
              />
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="expertise" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Areas of Expertise</CardTitle>
              <p className="text-sm text-muted-foreground">
                Primary knowledge domains for this agent
              </p>
            </CardHeader>
            <CardContent>
              <div className="flex flex-wrap gap-2">
                {profile.expertise.map((area, index) => (
                  <Badge key={index} variant="secondary">
                    {area}
                  </Badge>
                ))}
              </div>
              <p className="text-sm text-muted-foreground mt-4">
                Expertise areas are currently predefined based on the agent role. 
                Custom expertise configuration will be available in a future update.
              </p>
            </CardContent>
          </Card>
        </TabsContent>
        
        <TabsContent value="responses" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Response Templates</CardTitle>
              <p className="text-sm text-muted-foreground">
                How the agent introduces itself and structures responses
              </p>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Greeting Style</h4>
                <p className="text-sm bg-muted p-3 rounded">
                  "{profile.responseTemplates.greeting}"
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Analysis Approach</h4>
                <p className="text-sm bg-muted p-3 rounded">
                  "{profile.responseTemplates.analysis}"
                </p>
              </div>
              <div>
                <h4 className="font-medium mb-2">Recommendation Format</h4>
                <p className="text-sm bg-muted p-3 rounded">
                  "{profile.responseTemplates.recommendation}"
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
