"use client"

import { useState, useMemo, useEffect } from "react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Search, X, Filter } from "lucide-react"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Checkbox } from "@/components/ui/checkbox"

interface Message {
  id: string
  agentType: string
  content: string
  timestamp: Date
  reasoning?: string
}

interface MessageSearchProps {
  messages: Message[]
  onFilteredMessages: (filtered: Message[]) => void
  agents: Array<{ id: string; name: string }>
}

export function MessageSearch({ messages, onFilteredMessages, agents }: MessageSearchProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedAgents, setSelectedAgents] = useState<Set<string>>(new Set())
  const [dateRange, setDateRange] = useState<{ start?: Date; end?: Date }>({})

  const filteredMessages = useMemo(() => {
    let filtered = messages

    // Search by content
    if (searchQuery.trim()) {
      const query = searchQuery.toLowerCase()
      filtered = filtered.filter(msg =>
        msg.content.toLowerCase().includes(query) ||
        msg.reasoning?.toLowerCase().includes(query)
      )
    }

    // Filter by agents
    if (selectedAgents.size > 0) {
      filtered = filtered.filter(msg => selectedAgents.has(msg.agentType))
    }

    // Filter by date range
    if (dateRange.start) {
      filtered = filtered.filter(msg => msg.timestamp >= dateRange.start!)
    }
    if (dateRange.end) {
      filtered = filtered.filter(msg => msg.timestamp <= dateRange.end!)
    }

    return filtered
  }, [messages, searchQuery, selectedAgents, dateRange])

  // Update parent component when filters change
  useEffect(() => {
    onFilteredMessages(filteredMessages)
  }, [filteredMessages, onFilteredMessages])

  const handleAgentToggle = (agentId: string) => {
    setSelectedAgents(prev => {
      const newSet = new Set(prev)
      if (newSet.has(agentId)) {
        newSet.delete(agentId)
      } else {
        newSet.add(agentId)
      }
      return newSet
    })
  }

  const clearAllFilters = () => {
    setSearchQuery("")
    setSelectedAgents(new Set())
    setDateRange({})
  }

  const hasActiveFilters = searchQuery.trim() || selectedAgents.size > 0 || dateRange.start || dateRange.end

  return (
    <div className="flex items-center gap-2 mb-4">
      <div className="relative flex-1">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          placeholder="Search messages and reasoning..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="pl-10"
        />
      </div>

      <Popover>
        <PopoverTrigger asChild>
          <Button variant="outline" size="sm">
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && (
              <Badge variant="secondary" className="ml-2 h-5 w-5 p-0 flex items-center justify-center text-xs">
                {(selectedAgents.size || 0) + (dateRange.start ? 1 : 0) + (dateRange.end ? 1 : 0)}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80">
          <div className="space-y-4">
            <div>
              <h4 className="font-medium mb-2">Filter by Agent</h4>
              <div className="space-y-2">
                {agents.map((agent) => (
                  <div key={agent.id} className="flex items-center space-x-2">
                    <Checkbox
                      id={`agent-${agent.id}`}
                      checked={selectedAgents.has(agent.id)}
                      onCheckedChange={() => handleAgentToggle(agent.id)}
                    />
                    <label
                      htmlFor={`agent-${agent.id}`}
                      className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                    >
                      {agent.name}
                    </label>
                  </div>
                ))}
              </div>
            </div>

            <div>
              <h4 className="font-medium mb-2">Date Range</h4>
              <div className="space-y-2">
                <Input
                  type="datetime-local"
                  placeholder="Start date"
                  value={dateRange.start?.toISOString().slice(0, 16) || ""}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    start: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                />
                <Input
                  type="datetime-local"
                  placeholder="End date"
                  value={dateRange.end?.toISOString().slice(0, 16) || ""}
                  onChange={(e) => setDateRange(prev => ({
                    ...prev,
                    end: e.target.value ? new Date(e.target.value) : undefined
                  }))}
                />
              </div>
            </div>

            {hasActiveFilters && (
              <Button
                variant="ghost"
                size="sm"
                onClick={clearAllFilters}
                className="w-full"
              >
                <X className="h-4 w-4 mr-2" />
                Clear All Filters
              </Button>
            )}
          </div>
        </PopoverContent>
      </Popover>

      {hasActiveFilters && (
        <div className="flex items-center gap-1">
          <span className="text-sm text-muted-foreground">
            {filteredMessages.length} of {messages.length}
          </span>
        </div>
      )}
    </div>
  )
}
