"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { useToast } from "@/hooks/use-toast"
import { useScenarios } from "@/hooks/use-scenarios"
import { ExecutiveRole } from "@/types/executive"
import { Save, ArrowLeft, Plus, X, FileText, Target, Users } from "lucide-react"

interface ScenarioEditorProps {
  scenarioId?: string
  mode?: "create" | "edit"
}

interface Scenario {
  id?: string
  name: string
  description: string
  category: string
  difficulty: "beginner" | "intermediate" | "advanced"
  estimatedDuration: number
  objectives: string[]
  keyQuestions: string[]
  requiredAgents: string[]
  backgroundContext: string
  successCriteria: string[]
  tags: string[]
}

const defaultScenario: Scenario = {
  name: "",
  description: "",
  category: "strategic-planning",
  difficulty: "intermediate", 
  estimatedDuration: 45,
  objectives: [],
  keyQuestions: [],
  requiredAgents: [ExecutiveRole.CEO],
  backgroundContext: "",
  successCriteria: [],
  tags: []
}

const categories = [
  { value: "strategic-planning", label: "Strategic Planning" },
  { value: "financial-analysis", label: "Financial Analysis" },
  { value: "technology-decisions", label: "Technology Decisions" },
  { value: "hr-policies", label: "HR & Policies" },
  { value: "crisis-management", label: "Crisis Management" },
  { value: "market-expansion", label: "Market Expansion" },
  { value: "product-development", label: "Product Development" },
  { value: "other", label: "Other" }
]

const availableAgents = [
  { id: ExecutiveRole.CEO, name: "CEO Agent", required: false },
  { id: ExecutiveRole.CFO, name: "CFO Agent", required: false },
  { id: ExecutiveRole.CTO, name: "CTO Agent", required: false },
  { id: ExecutiveRole.CHRO, name: "HR Agent", required: false }
]

export function ScenarioEditor({ scenarioId, mode = "create" }: ScenarioEditorProps) {
  const [scenario, setScenario] = useState<Scenario>(defaultScenario)
  const [isLoading, setIsLoading] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [newObjective, setNewObjective] = useState("")
  const [newTag, setNewTag] = useState("")
  const router = useRouter()
  const { toast } = useToast()
  const { createScenario, updateScenario, getScenario } = useScenarios()

  const loadScenario = useCallback(async (id: string) => {
    try {
      setIsLoading(true)
      const scenarioData = await getScenario(id)
      
      if (scenarioData) {
        // Convert API format to editor format
        setScenario({
          id: scenarioData.id,
          name: scenarioData.name,
          description: scenarioData.description || "",
          category: "strategic-planning", // Default since API doesn't have this
          difficulty: "intermediate" as const,
          estimatedDuration: 45,
          objectives: [],
          keyQuestions: [],
          requiredAgents: [ExecutiveRole.CEO],
          backgroundContext: scenarioData.description || "",
          successCriteria: [],
          tags: scenarioData.tags || []
        })
      }
    } catch (error) {
      console.error("Load scenario error:", error)
      toast({
        title: "Load Failed", 
        description: "Could not load scenario data",
        variant: "destructive"
      })
    } finally {
      setIsLoading(false)
    }
  }, [toast, getScenario])

  useEffect(() => {
    if (mode === "edit" && scenarioId) {
      loadScenario(scenarioId)
    }
  }, [mode, scenarioId, loadScenario])

  const handleSave = async () => {
    if (!scenario.name.trim() || !scenario.description.trim()) {
      toast({
        title: "Validation Error",
        description: "Name and description are required",
        variant: "destructive"
      })
      return
    }

    try {
      setIsSaving(true)
      
      // Convert editor format to API format
      const scenarioData = {
        name: scenario.name,
        description: scenario.description,
        tags: scenario.tags,
        parameters: {
          difficulty: scenario.difficulty,
          estimatedDuration: scenario.estimatedDuration,
          category: scenario.category
        }
      }

      let savedScenario
      if (mode === "edit" && scenarioId && scenarioId !== "new") {
        savedScenario = await updateScenario(scenarioId, scenarioData)
      } else {
        savedScenario = await createScenario(scenarioData)
      }

      if (savedScenario) {
        toast({
          title: "Success",
          description: `Scenario ${mode === "edit" ? "updated" : "created"} successfully`,
        })

        if (mode === "create") {
          router.push(`/scenarios/${savedScenario.id}`)
        }
      } else {
        throw new Error("Failed to save scenario")
      }
    } catch (error) {
      console.error("Save scenario error:", error)
      toast({
        title: "Save Failed",
        description: "Could not save scenario",
        variant: "destructive"
      })
    } finally {
      setIsSaving(false)
    }
  }

  const addListItem = (field: keyof Pick<Scenario, "objectives" | "keyQuestions" | "successCriteria" | "tags">, value: string) => {
    if (value.trim()) {
      setScenario(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }))
    }
  }

  const removeListItem = (field: keyof Pick<Scenario, "objectives" | "keyQuestions" | "successCriteria" | "tags">, index: number) => {
    setScenario(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }))
  }

  const toggleAgent = (agentId: string) => {
    setScenario(prev => ({
      ...prev,
      requiredAgents: prev.requiredAgents.includes(agentId)
        ? prev.requiredAgents.filter(id => id !== agentId)
        : [...prev.requiredAgents, agentId]
    }))
  }

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-muted rounded w-1/3 mb-4"></div>
          <div className="grid gap-4">
            {[...Array(3)].map((_, i) => (
              <div key={i} className="h-32 bg-muted rounded"></div>
            ))}
          </div>
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button
            variant="ghost"
            size="sm"
            onClick={() => router.back()}
          >
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back
          </Button>
          <div>
            <h1 className="text-2xl font-bold">
              {mode === "edit" ? "Edit Scenario" : "Create New Scenario"}
            </h1>
            <p className="text-muted-foreground">
              Define the context and objectives for executive discussions
            </p>
          </div>
        </div>
        <Button onClick={handleSave} disabled={isSaving}>
          <Save className="h-4 w-4 mr-2" />
          {isSaving ? "Saving..." : "Save Scenario"}
        </Button>
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        {/* Main Content */}
        <div className="lg:col-span-2 space-y-6">
          {/* Basic Information */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                Basic Information
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div>
                <Label htmlFor="name">Scenario Name *</Label>
                <Input
                  id="name"
                  value={scenario.name}
                  onChange={(e) => setScenario(prev => ({ ...prev, name: e.target.value }))}
                  placeholder="e.g., Q4 Strategic Investment Review"
                />
              </div>
              
              <div>
                <Label htmlFor="description">Description *</Label>
                <Textarea
                  id="description"
                  value={scenario.description}
                  onChange={(e) => setScenario(prev => ({ ...prev, description: e.target.value }))}
                  placeholder="Describe the scenario context and what needs to be discussed..."
                  rows={3}
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="category">Category</Label>
                  <Select value={scenario.category} onValueChange={(value) => setScenario(prev => ({ ...prev, category: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {categories.map(cat => (
                        <SelectItem key={cat.value} value={cat.value}>
                          {cat.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div>
                  <Label htmlFor="difficulty">Difficulty</Label>
                  <Select value={scenario.difficulty} onValueChange={(value: "beginner" | "intermediate" | "advanced") => setScenario(prev => ({ ...prev, difficulty: value }))}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="beginner">Beginner</SelectItem>
                      <SelectItem value="intermediate">Intermediate</SelectItem>
                      <SelectItem value="advanced">Advanced</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div>
                <Label htmlFor="duration">Estimated Duration (minutes)</Label>
                <Input
                  id="duration"
                  type="number"
                  value={scenario.estimatedDuration}
                  onChange={(e) => setScenario(prev => ({ ...prev, estimatedDuration: parseInt(e.target.value) || 45 }))}
                  min="15"
                  max="180"
                />
              </div>
            </CardContent>
          </Card>

          {/* Objectives */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Target className="h-5 w-5" />
                Objectives
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newObjective}
                  onChange={(e) => setNewObjective(e.target.value)}
                  placeholder="Add an objective..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addListItem("objectives", newObjective)
                      setNewObjective("")
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addListItem("objectives", newObjective)
                    setNewObjective("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="space-y-2">
                {scenario.objectives.map((objective, index) => (
                  <div key={index} className="flex items-center justify-between bg-muted p-2 rounded">
                    <span className="text-sm">{objective}</span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeListItem("objectives", index)}
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Required Agents */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5" />
                Required Agents
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {availableAgents.map(agent => (
                  <div key={agent.id} className="flex items-center justify-between">
                    <span className="text-sm">{agent.name}</span>
                    <Button
                      variant={scenario.requiredAgents.includes(agent.id) ? "default" : "outline"}
                      size="sm"
                      onClick={() => toggleAgent(agent.id)}
                    >
                      {scenario.requiredAgents.includes(agent.id) ? "Required" : "Optional"}
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Tags */}
          <Card>
            <CardHeader>
              <CardTitle>Tags</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Input
                  value={newTag}
                  onChange={(e) => setNewTag(e.target.value)}
                  placeholder="Add a tag..."
                  onKeyPress={(e) => {
                    if (e.key === "Enter") {
                      addListItem("tags", newTag)
                      setNewTag("")
                    }
                  }}
                />
                <Button
                  type="button"
                  onClick={() => {
                    addListItem("tags", newTag)
                    setNewTag("")
                  }}
                >
                  <Plus className="h-4 w-4" />
                </Button>
              </div>
              
              <div className="flex flex-wrap gap-1">
                {scenario.tags.map((tag, index) => (
                  <Badge key={index} variant="secondary" className="text-xs">
                    {tag}
                    <Button
                      variant="ghost"
                      size="sm"
                      className="h-auto p-0 ml-1"
                      onClick={() => removeListItem("tags", index)}
                    >
                      <X className="h-2 w-2" />
                    </Button>
                  </Badge>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
