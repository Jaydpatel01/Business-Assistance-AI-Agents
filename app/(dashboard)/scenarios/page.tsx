"use client"

import { ScenarioCard } from "@/components/scenario-card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Search, Plus, Loader2 } from "lucide-react"
import Link from "next/link"
import { useScenarios } from "@/hooks/use-scenarios"
import { useEffect, useState } from "react"
import type { Scenario } from "@/lib/types"

export default function ScenariosPage() {
  const { scenarios, isLoading, error, fetchScenarios } = useScenarios()
  const [searchTerm, setSearchTerm] = useState("")
  const [industryFilter, setIndustryFilter] = useState("all")

  useEffect(() => {
    fetchScenarios()
  }, [fetchScenarios])

  // Convert API scenario to ScenarioCard format
  const convertScenarioForCard = (scenario: Scenario) => ({
    id: scenario.id,
    title: scenario.name,
    status: "Draft" as const, // Default status since API doesn't have this field
    createdDate: scenario.createdAt ? new Date(scenario.createdAt).toISOString().split('T')[0] : new Date().toISOString().split('T')[0],
    description: scenario.description || "",
    industry: scenario.tags?.[0] || "General",
  })

  // Filter scenarios based on search and filters
  const filteredScenarios = scenarios.filter((scenario) => {
    const matchesSearch = scenario.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         scenario.description?.toLowerCase().includes(searchTerm.toLowerCase())
    const matchesIndustry = industryFilter === "all" || 
                           scenario.tags?.some(tag => tag.toLowerCase() === industryFilter.toLowerCase())
    
    return matchesSearch && matchesIndustry
  }).map(convertScenarioForCard)

  if (error) {
    return (
      <div className="space-y-6">
        <div className="text-center py-12">
          <p className="text-destructive">Error loading scenarios: {error}</p>
          <Button onClick={fetchScenarios} className="mt-4">
            Try Again
          </Button>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Scenarios</h1>
          <p className="text-muted-foreground">Manage and organize your boardroom simulation scenarios</p>
        </div>
        <Button asChild>
          <Link href="/scenarios/new">
            <Plus className="h-4 w-4 mr-2" />
            New Scenario
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input 
            placeholder="Search scenarios..." 
            className="pl-10" 
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
          />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Statuses</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
          </SelectContent>
        </Select>
        <Select value={industryFilter} onValueChange={setIndustryFilter}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by industry" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Industries</SelectItem>
            <SelectItem value="technology">Technology</SelectItem>
            <SelectItem value="finance">Finance</SelectItem>
            <SelectItem value="healthcare">Healthcare</SelectItem>
            <SelectItem value="retail">Retail</SelectItem>
            <SelectItem value="manufacturing">Manufacturing</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {isLoading ? (
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading scenarios...</span>
        </div>
      ) : filteredScenarios.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">No scenarios found</p>
          {scenarios.length === 0 && (
            <Button asChild className="mt-4">
              <Link href="/scenarios/new">
                Create Your First Scenario
              </Link>
            </Button>
          )}
        </div>
      ) : (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredScenarios.map((scenario) => (
            <ScenarioCard key={scenario.id} scenario={scenario} />
          ))}
        </div>
      )}
    </div>
  )
}
