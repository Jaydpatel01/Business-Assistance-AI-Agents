import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, Clock, Users, Play, Search, Plus } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"

const boardSessions = [
  {
    id: "session-1",
    title: "Q4 Strategic Investment Review",
    status: "Active" as const,
    scheduledDate: "2024-01-16T14:00:00",
    duration: "45 min",
    participants: ["CEO", "CFO", "CTO", "Marketing Director"],
    scenario: "Strategic Investment Analysis",
    progress: 65,
    description: "Quarterly review of strategic investment opportunities and portfolio optimization"
  },
  {
    id: "session-2",
    title: "European Market Expansion Strategy",
    status: "Active" as const,
    scheduledDate: "2024-01-15T09:00:00", 
    duration: "75 min",
    participants: ["CEO", "Marketing Director", "CFO", "Operations"],
    scenario: "Market Expansion Strategy",
    progress: 35,
    description: "Comprehensive analysis of European market entry opportunities and risk assessment"
  },
  {
    id: "session-3",
    title: "Digital Transformation Roadmap",
    status: "Completed" as const,
    scheduledDate: "2024-01-12T16:00:00",
    duration: "90 min",
    participants: ["CEO", "CTO", "HR Director", "CFO"],
    scenario: "Digital Transformation Roadmap",
    progress: 100,
    description: "18-month digital transformation strategy and technology modernization plan"
  },
  {
    id: "session-4",
    title: "Cost Optimization Initiative",
    status: "Scheduled" as const,
    scheduledDate: "2024-01-18T11:00:00",
    duration: "60 min",
    participants: ["CFO", "Operations", "HR Director"],
    scenario: "Cost Optimization Initiative",
    progress: 0,
    description: "Comprehensive cost reduction analysis without impacting service quality"
  },
  {
    id: "session-5",
    title: "Customer Retention Strategy",
    status: "Completed" as const,
    scheduledDate: "2024-01-08T13:30:00",
    duration: "65 min",
    participants: ["Marketing Director", "Customer Success", "CEO"],
    scenario: "Customer Retention Strategy", 
    progress: 100,
    description: "Development of comprehensive customer retention and satisfaction improvement initiatives"
  },
  {
    id: "session-6",
    title: "Workforce Planning & Development",
    status: "Active" as const,
    scheduledDate: "2024-01-14T10:30:00",
    duration: "55 min",
    participants: ["HR Director", "CEO", "CFO"],
    scenario: "Workforce Planning Restructuring",
    progress: 40,
    description: "Strategic workforce planning and skill development roadmap for 2025"
  },
  {
    id: "session-7",
    title: "Technology Infrastructure Assessment",
    status: "Draft" as const,
    scheduledDate: "2024-01-20T15:00:00",
    duration: "70 min", 
    participants: ["CTO", "CFO", "Security Officer"],
    scenario: "Technology Infrastructure",
    progress: 0,
    description: "Comprehensive assessment of current technology stack and security posture"
  },
  {
    id: "session-8",
    title: "Q1 Budget Allocation Review",
    status: "Scheduled" as const,
    scheduledDate: "2024-01-19T14:30:00",
    duration: "50 min",
    participants: ["CFO", "CEO", "Department Heads"],
    scenario: "Budget Planning",
    progress: 0,
    description: "Q1 2025 budget allocation and resource optimization across all departments"
  },
  {
    id: "session-9",
    title: "Product Innovation Strategy",
    status: "Completed" as const,
    scheduledDate: "2024-01-05T11:00:00",
    duration: "85 min",
    participants: ["CEO", "CTO", "Marketing Director", "R&D"],
    scenario: "Product Innovation",
    progress: 100,
    description: "Next-generation product development strategy and innovation roadmap"
  },
  {
    id: "session-10",
    title: "Risk Management Framework",
    status: "Active" as const,
    scheduledDate: "2024-01-13T16:30:00",
    duration: "45 min",
    participants: ["CFO", "Legal", "Operations", "CEO"],
    scenario: "Risk Assessment",
    progress: 55,
    description: "Enterprise risk management framework and mitigation strategies"
  }
]

const statusColors = {
  Active: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Scheduled: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Completed: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Draft: "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300",
}

export default function BoardSessionsPage() {
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
        {boardSessions.map((session) => (
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
        ))}
      </div>
    </div>
  )
}
