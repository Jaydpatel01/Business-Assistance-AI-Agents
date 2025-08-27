"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, DollarSign, Users, Zap, Loader2 } from "lucide-react"
import { useToast } from "@/hooks/use-toast"
import { useRouter } from "next/navigation"

interface Scenario {
  id: string
  name: string
  description: string
  tags: string[]
  category: string
  difficulty: string
  estimatedDuration: string
}

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

const categoryIcons = {
  financial: DollarSign,
  strategic: TrendingUp,
  operational: Zap,
  hr: Users,
}

export default function ScenarioTemplatesPage() {
  const [scenarios, setScenarios] = useState<Scenario[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()
  const router = useRouter()

  useEffect(() => {
    const fetchScenarios = async () => {
      try {
        const response = await fetch('/api/scenarios')
        const data = await response.json()
        
        if (data.success) {
          setScenarios(data.data)
        } else {
          throw new Error(data.error || 'Failed to fetch scenarios')
        }
      } catch (error) {
        console.error('Failed to fetch scenarios:', error)
        toast({
          title: "Error",
          description: "Failed to load scenario templates",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchScenarios()
  }, [toast])

  const handleUseTemplate = async (scenarioId: string) => {
    try {
      // Create a new boardroom session with this scenario
      const response = await fetch('/api/boardroom/sessions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          name: `Session based on ${scenarios.find(s => s.id === scenarioId)?.name}`,
          scenarioId: scenarioId,
          metadata: {
            createdFromTemplate: true,
            templateId: scenarioId
          }
        })
      })

      const result = await response.json()

      if (result.success) {
        toast({
          title: "Session Created!",
          description: "Your boardroom session has been created from the template",
        })
        // Redirect to the new session
        router.push(`/boardroom/${result.data.id}`)
      } else {
        throw new Error(result.error || 'Failed to create session')
      }
    } catch (error) {
      console.error('Failed to create session from template:', error)
      toast({
        title: "Error",
        description: "Failed to create session. Please try again.",
        variant: "destructive"
      })
    }
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenario Templates</h1>
          <p className="text-muted-foreground">Start with proven strategic decision frameworks</p>
        </div>
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading templates...</span>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scenario Templates</h1>
        <p className="text-muted-foreground">Start with proven strategic decision frameworks</p>
      </div>

      {scenarios.length === 0 ? (
        <Card className="text-center py-12">
          <CardContent>
            <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
            <h3 className="text-lg font-medium mb-2">No templates available</h3>
            <p className="text-muted-foreground">
              Check back later for scenario templates, or create a custom scenario.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-6 md:grid-cols-2">
          {scenarios.map((scenario) => {
            const IconComponent = categoryIcons[scenario.category as keyof typeof categoryIcons] || FileText
            
            return (
              <Card key={scenario.id} className="hover:shadow-lg transition-shadow duration-200">
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                        <IconComponent className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                      </div>
                      <div>
                        <CardTitle className="text-lg">{scenario.name}</CardTitle>
                        <p className="text-sm text-muted-foreground capitalize">{scenario.category}</p>
                      </div>
                    </div>
                    <Badge
                      className={difficultyColors[scenario.difficulty as keyof typeof difficultyColors] || difficultyColors.intermediate}
                      variant="secondary"
                    >
                      {scenario.difficulty}
                    </Badge>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <p className="text-sm text-muted-foreground">{scenario.description}</p>

                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <span>⏱️ {scenario.estimatedDuration}</span>
                  </div>

                  <div className="flex flex-wrap gap-2">
                    {scenario.tags.map((tag) => (
                      <Badge key={tag} variant="outline" className="text-xs">
                        {tag}
                      </Badge>
                    ))}
                  </div>

                  <Button 
                    className="w-full bg-indigo-600 hover:bg-indigo-700"
                    onClick={() => handleUseTemplate(scenario.id)}
                  >
                    <FileText className="h-4 w-4 mr-2" />
                    Use This Template
                  </Button>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}
