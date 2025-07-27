"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, Play, FileText, Edit3, Users, Clock, AlertTriangle, MoreHorizontal } from "lucide-react"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"

interface Scenario {
  id: string
  title: string
  status: "Draft" | "In Progress" | "Completed" | "Scheduled"
  createdDate: string
  description: string
  industry: string
  priority?: string
  participants?: number
  lastActivity?: string
}

interface ScenarioCardProps {
  scenario: Scenario
}

const statusConfig = {
  Draft: {
    color: "bg-muted text-muted-foreground",
    dot: "bg-muted-foreground",
  },
  "In Progress": {
    color: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    dot: "bg-blue-500",
  },
  Completed: {
    color: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    dot: "bg-green-500",
  },
  Scheduled: {
    color: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    dot: "bg-yellow-500",
  },
}

const priorityConfig = {
  Critical: {
    color: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
    icon: AlertTriangle,
  },
  High: {
    color: "bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-300",
    icon: AlertTriangle,
  },
  Medium: {
    color: "bg-secondary text-secondary-foreground",
    icon: null,
  },
  Low: {
    color: "bg-muted text-muted-foreground",
    icon: null,
  },
}

export function ScenarioCard({ scenario }: ScenarioCardProps) {
  const statusStyle = statusConfig[scenario.status] || statusConfig.Draft
  const priorityStyle = scenario.priority ? priorityConfig[scenario.priority as keyof typeof priorityConfig] : null

  return (
    <Card
      className="group relative overflow-hidden bg-card transition-all duration-300 hover:shadow-lg hover:-translate-y-1"
    >
      <div className="relative z-10">
        <CardHeader className="pb-3">
          <div className="flex items-start justify-between">
            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                <Badge className={statusStyle.color} variant="secondary">
                  {scenario.status}
                </Badge>
                {scenario.priority && priorityStyle && (
                  <Badge className={priorityStyle.color} variant="secondary">
                    {priorityStyle.icon && <priorityStyle.icon className="h-3 w-3 mr-1" />}
                    {scenario.priority}
                  </Badge>
                )}
              </div>
              <CardTitle className="text-lg font-semibold line-clamp-2">{scenario.title}</CardTitle>
              <p className="text-sm text-muted-foreground line-clamp-2 leading-relaxed">{scenario.description}</p>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <MoreHorizontal className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end" className="w-48">
                <DropdownMenuItem asChild>
                  <Link href={`/scenarios/${scenario.id}`}>
                    <Edit3 className="h-4 w-4 mr-2" />
                    Edit Scenario
                  </Link>
                </DropdownMenuItem>
                <DropdownMenuItem>
                  <FileText className="h-4 w-4 mr-2" />
                  Duplicate
                </DropdownMenuItem>
                <DropdownMenuItem className="text-destructive focus:text-destructive">
                  <AlertTriangle className="h-4 w-4 mr-2" />
                  Delete
                </DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>
        </CardHeader>

        <CardContent className="space-y-4">
          <div className="flex items-center gap-4 text-sm text-muted-foreground">
            <div className="flex items-center gap-1">
              <Calendar className="h-4 w-4" />
              <ClientDate date={scenario.createdDate} />
            </div>
            {scenario.participants && (
              <div className="flex items-center gap-1">
                <Users className="h-4 w-4" />
                <span>{scenario.participants} agents</span>
              </div>
            )}
          </div>

          {scenario.lastActivity && (
            <div className="flex items-center gap-1 text-sm text-muted-foreground">
              <Clock className="h-4 w-4" />
              <span>Last activity: {scenario.lastActivity}</span>
            </div>
          )}

          <div className="flex items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {scenario.industry}
            </Badge>
          </div>
        </CardContent>

        <CardFooter className="flex gap-2 pt-4">
          <Button asChild size="sm" className="flex-1">
            <Link href={`/boardroom/new?scenario=${scenario.id}`}>
              <Play className="h-4 w-4 mr-2" />
              Start AI Discussion
            </Link>
          </Button>

          <Button asChild variant="outline" size="sm">
            <Link href={`/scenarios/${scenario.id}`}>
              <Edit3 className="h-4 w-4" />
            </Link>
          </Button>

          {scenario.status === "Completed" && (
            <Button asChild variant="outline" size="sm">
              <Link href={`/decisions/${scenario.id}`}>
                <FileText className="h-4 w-4" />
              </Link>
            </Button>
          )}
        </CardFooter>
      </div>
    </Card>
  )
}
