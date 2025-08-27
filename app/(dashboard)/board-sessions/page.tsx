"use client"

import { useEffect, useState } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Play, Search, Plus } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"
import { useToast } from "@/hooks/use-toast"

type SessionStatus = "Active" | "Scheduled" | "Completed" | "Draft"

interface BoardSession {
  id: string
  title: string
  status: SessionStatus
  scheduledDate: string
  duration: string
  participants: string[]
  scenario: string
  progress: number
  description: string
}

export default function BoardSessionsPage() {
  const [boardSessions, setBoardSessions] = useState<BoardSession[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  const statusColors = {
    Active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
    Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
    Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
    Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
  }

  useEffect(() => {
    async function fetchSessions() {
      try {
        const response = await fetch('/api/sessions')
        if (response.ok) {
          const result = await response.json()
          if (result.success) {
            // Transform API response to our BoardSession format
            const transformedSessions: BoardSession[] = result.data.map((session: {
              id: string
              name: string
              status: string
              createdAt: string
              duration?: string
              participants?: Array<{ user?: { name?: string } }>
              scenario?: { name?: string; description?: string }
            }) => ({
              id: session.id,
              title: session.name,
              status: session.status === 'active' ? 'Active' : 
                     session.status === 'completed' ? 'Completed' : 
                     session.status === 'scheduled' ? 'Scheduled' : 'Draft',
              scheduledDate: session.createdAt,
              duration: session.duration || '45 min',
              participants: session.participants?.map(p => p.user?.name || 'User') || [],
              scenario: session.scenario?.name || 'Strategic Session',
              progress: session.status === 'completed' ? 100 : 
                       session.status === 'active' ? 50 : 0,
              description: session.scenario?.description || 'Strategic consultation session'
            }))
            setBoardSessions(transformedSessions)
          }
        } else {
          console.error('Failed to fetch sessions:', response.statusText)
        }
      } catch (error) {
        console.error('Error fetching sessions:', error)
        toast({
          title: "Error",
          description: "Failed to load board sessions",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchSessions()
  }, [toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Board Sessions</h1>
            <p className="text-muted-foreground">Loading your executive AI consultation sessions...</p>
          </div>
        </div>
        <div className="flex justify-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600"></div>
        </div>
      </div>
    )
  }
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Board Sessions</h1>
          <p className="text-muted-foreground">Manage your executive AI consultation sessions</p>
        </div>
        <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
          <Link href="/board-sessions/schedule">
            <Plus className="h-4 w-4 mr-2" />
            Schedule Session
          </Link>
        </Button>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search sessions..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Sessions</SelectItem>
            <SelectItem value="active">Active</SelectItem>
            <SelectItem value="scheduled">Scheduled</SelectItem>
            <SelectItem value="completed">Completed</SelectItem>
            <SelectItem value="draft">Draft</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-1">
        {boardSessions.length === 0 ? (
          <Card className="col-span-full">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-16 h-16 bg-muted rounded-full flex items-center justify-center mb-4">
                <Calendar className="h-8 w-8 text-muted-foreground" />
              </div>
              <h3 className="text-lg font-semibold mb-2">No board sessions yet</h3>
              <p className="text-muted-foreground mb-6 max-w-md">
                Start by scheduling your first AI-powered executive consultation session to get strategic insights and recommendations.
              </p>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/board-sessions/schedule">
                  <Plus className="h-4 w-4 mr-2" />
                  Schedule Your First Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          boardSessions.map((session) => (
            <Card key={session.id} className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500">
              <CardHeader>
                <div className="flex items-start justify-between">
                  <div className="space-y-1">
                    <CardTitle className="text-xl">{session.title}</CardTitle>
                    <div className="flex items-center gap-4 text-sm text-muted-foreground">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-4 w-4" />
                        <ClientDate date={session.scheduledDate} />
                      </div>
                      <div className="flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        <span>
                          <ClientDate date={session.scheduledDate} format="time" />
                        </span>
                      </div>
                      <div className="flex items-center gap-1">
                        <Users className="h-4 w-4" />
                        <span>{session.participants.length} participants</span>
                      </div>
                    </div>
                  </div>
                  <Badge className={statusColors[session.status]} variant="secondary">
                    {session.status}
                  </Badge>
                </div>
              </CardHeader>

              <CardContent className="space-y-4">
                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Scenario Type:</span>
                  <Badge variant="outline">{session.scenario}</Badge>
                </div>

                <div className="flex items-center justify-between text-sm">
                  <span className="text-muted-foreground">Duration:</span>
                  <span className="font-medium">{session.duration}</span>
                </div>

                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">Progress:</span>
                    <span className="font-medium">{session.progress}%</span>
                  </div>
                  <div className="w-full bg-muted rounded-full h-2">
                    <div
                      className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                      style={{ width: `${session.progress}%` }}
                    ></div>
                  </div>
                </div>

                <div className="flex gap-2 pt-2">
                  {session.status === "Active" && (
                    <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Link href={`/board-sessions/${session.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Continue Session
                      </Link>
                    </Button>
                  )}
                  {session.status === "Scheduled" && (
                    <Button asChild className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                      <Link href={`/board-sessions/${session.id}`}>
                        <Play className="h-4 w-4 mr-2" />
                        Start Session
                      </Link>
                    </Button>
                  )}
                  {session.status === "Completed" && (
                    <Button asChild className="flex-1 bg-transparent" variant="outline">
                      <Link href={`/decisions/${session.id}`}>View Decision Summary</Link>
                    </Button>
                  )}
                  {session.status === "Draft" && (
                    <Button asChild className="flex-1 bg-transparent" variant="outline">
                      <Link href={`/scenarios/${session.id}`}>Edit Configuration</Link>
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  )
}
