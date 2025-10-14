"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Clock, Target, Users } from "lucide-react"
import { PREDEFINED_SCENARIOS, type PredefinedScenario } from "@/lib/scenarios/predefined-scenarios"

const difficultyColors = {
  beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300"
}

const categoryColors = {
  financial: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  strategic: "bg-purple-100 text-purple-800 dark:bg-purple-900 dark:text-purple-300",
  operational: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
  hr: "bg-pink-100 text-pink-800 dark:bg-pink-900 dark:text-pink-300"
}

export function ScenarioTemplateGallery() {
  const router = useRouter()
  const [searchQuery, setSearchQuery] = useState("")
  const [categoryFilter, setCategoryFilter] = useState<string>("all")
  const [difficultyFilter, setDifficultyFilter] = useState<string>("all")
  
  const templates = PREDEFINED_SCENARIOS
  
  // Filter templates based on search and filters
  const filteredTemplates = templates.filter((template) => {
    const matchesSearch = 
      template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.tags.some(tag => tag.toLowerCase().includes(searchQuery.toLowerCase()))
    
    const matchesCategory = categoryFilter === "all" || template.category === categoryFilter
    const matchesDifficulty = difficultyFilter === "all" || template.difficulty === difficultyFilter
    
    return matchesSearch && matchesCategory && matchesDifficulty
  })
  
  const handleUseTemplate = async (template: PredefinedScenario) => {
    try {
      const response = await fetch('/api/scenarios', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: template.name,
          description: template.description,
          tags: template.tags,
          parameters: template.parameters || {},
          status: 'draft'
        })
      })
      
      if (response.ok) {
        const data = await response.json()
        // Navigate to the new scenario - API returns data.data.id
        const scenarioId = data.data?.id || data.scenario?.id
        if (scenarioId) {
          router.push(`/scenarios/${scenarioId}`)
        } else {
          throw new Error('No scenario ID in response')
        }
      } else {
        const error = await response.json()
        throw new Error(error.error || 'Failed to create scenario from template')
      }
    } catch (error) {
      console.error('Error creating scenario:', error)
      throw error
    }
  }

  const handleStartDiscussion = (template: PredefinedScenario) => {
    // Navigate directly to boardroom session creator with predefined template ID
    router.push(`/boardroom/new?scenario=${template.id}`)
  }

  return (
    <div className="space-y-6">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input
            placeholder="Search templates..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="pl-10"
          />
        </div>
        <Select value={categoryFilter} onValueChange={setCategoryFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Category" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Categories</SelectItem>
            <SelectItem value="financial">Financial</SelectItem>
            <SelectItem value="strategic">Strategic</SelectItem>
            <SelectItem value="operational">Operational</SelectItem>
            <SelectItem value="hr">HR</SelectItem>
          </SelectContent>
        </Select>
        <Select value={difficultyFilter} onValueChange={setDifficultyFilter}>
          <SelectTrigger className="w-full sm:w-[180px]">
            <SelectValue placeholder="Difficulty" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Levels</SelectItem>
            <SelectItem value="beginner">Beginner</SelectItem>
            <SelectItem value="intermediate">Intermediate</SelectItem>
            <SelectItem value="advanced">Advanced</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Results Count */}
      <p className="text-sm text-muted-foreground">
        {filteredTemplates.length} {filteredTemplates.length === 1 ? 'template' : 'templates'} found
      </p>

      {/* Template Grid */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {filteredTemplates.map((template) => (
          <Card key={template.id} className="flex flex-col hover:shadow-lg transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between gap-2 mb-2">
                <Badge className={categoryColors[template.category]}>
                  {template.category}
                </Badge>
                <Badge className={difficultyColors[template.difficulty]}>
                  {template.difficulty}
                </Badge>
              </div>
              <CardTitle className="text-xl">{template.name}</CardTitle>
              <CardDescription className="line-clamp-2">
                {template.description}
              </CardDescription>
            </CardHeader>
            
            <CardContent className="flex-1 space-y-4">
              <div className="flex flex-wrap gap-2">
                {template.tags.slice(0, 3).map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
                {template.tags.length > 3 && (
                  <Badge variant="outline" className="text-xs">
                    +{template.tags.length - 3} more
                  </Badge>
                )}
              </div>

              <div className="space-y-2 text-sm">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="h-4 w-4" />
                  <span>{template.estimatedDuration}</span>
                </div>
                
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Users className="h-4 w-4" />
                  <span>{template.recommendedAgents.length} recommended agents</span>
                </div>
                
                {template.defaultQuery && (
                  <div className="flex items-start gap-2 pt-2 border-t">
                    <Target className="h-4 w-4 mt-0.5 text-muted-foreground" />
                    <p className="text-muted-foreground italic text-xs line-clamp-2">
                      &ldquo;{template.defaultQuery}&rdquo;
                    </p>
                  </div>
                )}
              </div>
            </CardContent>

            <div className="p-6 pt-0 space-y-2">
              <Button 
                onClick={() => handleStartDiscussion(template)}
                className="w-full"
              >
                Start AI Discussion
              </Button>
              <Button 
                onClick={() => handleUseTemplate(template)}
                variant="outline"
                className="w-full"
              >
                Save as Custom Scenario
              </Button>
            </div>
          </Card>
        ))}
      </div>

      {filteredTemplates.length === 0 && (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No templates match your search criteria</p>
          <Button
            variant="outline"
            onClick={() => {
              setSearchQuery("")
              setCategoryFilter("all")
              setDifficultyFilter("all")
            }}
            className="mt-4"
          >
            Clear Filters
          </Button>
        </div>
      )}
    </div>
  )
}
