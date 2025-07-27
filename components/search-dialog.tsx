"use client"

import { useState, useEffect } from "react"
import { Dialog, DialogContent, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Search, FileText, Users, ClipboardList, Calendar } from "lucide-react"
import { useRouter } from "next/navigation"
import { useToast } from "@/hooks/use-toast"
import { useScenarios } from "@/hooks/use-scenarios"
import { ClientDate } from "@/components/client-date"

interface SearchResult {
  id: string
  title: string
  type: "scenario" | "session" | "decision"
  description: string
  url: string
  date?: string
}

const mockSearchResults: SearchResult[] = [
  {
    id: "strategic-investment-analysis",
    title: "Strategic Investment Analysis",
    type: "scenario",
    description: "Evaluate major investment opportunities with comprehensive financial and strategic analysis",
    url: "/scenarios/strategic-investment-analysis",
    date: "2024-01-15",
  },
  {
    id: "market-expansion-strategy",
    title: "International Market Expansion",
    type: "scenario",
    description: "Analyze opportunities for expanding into European markets",
    url: "/scenarios/market-expansion-strategy",
    date: "2024-01-14",
  },
  {
    id: "cost-optimization-initiative",
    title: "Q4 Cost Optimization Initiative",
    type: "scenario",
    description: "Identify cost reduction opportunities across all departments",
    url: "/scenarios/cost-optimization-initiative",
    date: "2024-01-13",
  },
  {
    id: "ai-investment-decision-1",
    title: "AI Investment Decision",
    type: "decision",
    description: "Approved $5M investment in AI initiatives",
    url: "/decisions/ai-investment-decision-1",
    date: "2024-01-16",
  },
  {
    id: "executive-board-session-q4",
    title: "Executive Board Session",
    type: "session",
    description: "Q4 strategic planning session",
    url: "/board-sessions/executive-board-session-q4",
    date: "2024-01-16",
  },
]

interface SearchDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

export function SearchDialog({ open, onOpenChange }: SearchDialogProps) {
  const [query, setQuery] = useState("")
  const [results, setResults] = useState<SearchResult[]>([])
  const router = useRouter()
  const { toast } = useToast()
  const { scenarios, fetchScenarios } = useScenarios()

  useEffect(() => {
    if (open) {
      fetchScenarios()
    }
  }, [open, fetchScenarios])

  useEffect(() => {
    if (query.length > 0) {
      // Convert scenarios to search results
      const scenarioResults: SearchResult[] = scenarios
        .filter(scenario => 
          scenario.name.toLowerCase().includes(query.toLowerCase()) ||
          scenario.description?.toLowerCase().includes(query.toLowerCase())
        )
        .map(scenario => ({
          id: scenario.id,
          title: scenario.name,
          type: "scenario" as const,
          description: scenario.description || "",
          url: `/scenarios/${scenario.id}`,
          date: scenario.createdAt ? new Date(scenario.createdAt).toISOString().split('T')[0] : ""
        }))

      // Add mock data for other types (sessions, decisions) until those are implemented
      const otherResults = mockSearchResults.filter(result => 
        result.type !== "scenario" && 
        (result.title.toLowerCase().includes(query.toLowerCase()) ||
         result.description.toLowerCase().includes(query.toLowerCase()))
      )

      setResults([...scenarioResults, ...otherResults])
    } else {
      setResults([])
    }
  }, [query, scenarios])

  const handleResultClick = (result: SearchResult) => {
    router.push(result.url)
    onOpenChange(false)
    setQuery("")
    toast({
      title: "Navigating",
      description: `Opening ${result.title}...`,
    })
  }

  const getIcon = (type: string) => {
    switch (type) {
      case "scenario":
        return <FileText className="h-4 w-4" />
      case "session":
        return <Users className="h-4 w-4" />
      case "decision":
        return <ClipboardList className="h-4 w-4" />
      default:
        return <Search className="h-4 w-4" />
    }
  }

  const getTypeLabel = (type: string) => {
    switch (type) {
      case "scenario":
        return "Scenario"
      case "session":
        return "Board Session"
      case "decision":
        return "Decision"
      default:
        return "Item"
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>Search</DialogTitle>
        </DialogHeader>
        <div className="space-y-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              placeholder="Search scenarios, sessions, decisions..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="pl-10"
              autoFocus
            />
          </div>

          {results.length > 0 && (
            <div className="max-h-96 overflow-y-auto space-y-2">
              {results.map((result) => (
                <Button
                  key={result.id}
                  variant="ghost"
                  className="w-full justify-start h-auto p-4 hover:bg-accent"
                  onClick={() => handleResultClick(result)}
                >
                  <div className="flex items-start gap-3 w-full">
                    <div className="mt-1">{getIcon(result.type)}</div>
                    <div className="flex-1 text-left space-y-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{result.title}</span>
                        <span className="text-xs bg-muted px-2 py-1 rounded">{getTypeLabel(result.type)}</span>
                      </div>
                      <p className="text-sm text-muted-foreground">{result.description}</p>
                      {result.date && (
                        <div className="flex items-center gap-1 text-xs text-muted-foreground">
                          <Calendar className="h-3 w-3" />
                          <ClientDate date={result.date} />
                        </div>
                      )}
                    </div>
                  </div>
                </Button>
              ))}
            </div>
          )}

          {query.length > 0 && results.length === 0 && (
            <div className="text-center py-8 text-muted-foreground">
              <Search className="h-8 w-8 mx-auto mb-2 opacity-50" />
              <p>No results found for "{query}"</p>
            </div>
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}
