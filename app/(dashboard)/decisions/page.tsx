import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, Download, Eye, Search, TrendingUp, CheckCircle } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"

const decisions = [
  {
    id: "decision-1",
    sessionTitle: "Q4 Strategic Investment Review",
    decisionTitle: "AI-First Investment Strategy Approval",
    completedDate: "2024-01-16",
    duration: "45 minutes",
    participants: 4,
    consensus: "Unanimous" as const,
    confidence: 94,
    impact: "High" as const,
    keyDecision:
      "Allocate $5M to AI initiatives with focus on customer experience automation and operational efficiency",
    financialImpact: "$5.0M investment, 35% expected ROI",
    status: "Approved" as const,
  },
  {
    id: "decision-2",
    sessionTitle: "Market Expansion - APAC Region",
    decisionTitle: "APAC Market Entry Strategy",
    completedDate: "2024-01-10",
    duration: "55 minutes",
    participants: 4,
    consensus: "Majority" as const,
    confidence: 87,
    impact: "High" as const,
    keyDecision: "Proceed with phased market entry starting with Singapore and Australia",
    financialImpact: "$3.2M investment, 28% expected ROI",
    status: "Approved" as const,
  },
  {
    id: "decision-3",
    sessionTitle: "Cost Optimization Initiative",
    decisionTitle: "Operational Efficiency Program",
    completedDate: "2024-01-08",
    duration: "40 minutes",
    participants: 3,
    consensus: "Unanimous" as const,
    confidence: 91,
    impact: "Medium" as const,
    keyDecision: "Implement automation in customer service and reduce operational costs by 15%",
    financialImpact: "$800K savings annually",
    status: "In Progress" as const,
  },
  {
    id: "decision-4",
    sessionTitle: "Remote Work Policy 2025",
    decisionTitle: "Hybrid Work Model Implementation",
    completedDate: "2024-01-05",
    duration: "35 minutes",
    participants: 3,
    consensus: "Majority" as const,
    confidence: 82,
    impact: "Medium" as const,
    keyDecision: "Adopt 3-2 hybrid model with flexible arrangements for senior staff",
    financialImpact: "$200K office space savings",
    status: "Approved" as const,
  },
]

const consensusColors = {
  Unanimous: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Majority: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Split: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
}

const impactColors = {
  High: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  Medium: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Low: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
}

const statusColors = {
  Approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  "In Progress": "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  Rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function DecisionsPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Strategic Decisions</h1>
          <p className="text-muted-foreground">Review and track executive decision outcomes</p>
        </div>
      </div>

      <div className="flex gap-4 items-center">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
          <Input placeholder="Search decisions..." className="pl-10" />
        </div>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by status" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Decisions</SelectItem>
            <SelectItem value="approved">Approved</SelectItem>
            <SelectItem value="in-progress">In Progress</SelectItem>
            <SelectItem value="rejected">Rejected</SelectItem>
          </SelectContent>
        </Select>
        <Select defaultValue="all">
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Filter by impact" />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="all">All Impact Levels</SelectItem>
            <SelectItem value="high">High Impact</SelectItem>
            <SelectItem value="medium">Medium Impact</SelectItem>
            <SelectItem value="low">Low Impact</SelectItem>
          </SelectContent>
        </Select>
      </div>

      <div className="space-y-4">
        {decisions.map((decision) => (
          <Card
            key={decision.id}
            className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500"
          >
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="space-y-2">
                  <CardTitle className="text-xl">{decision.decisionTitle}</CardTitle>
                  <p className="text-sm text-muted-foreground">{decision.sessionTitle}</p>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <ClientDate date={decision.completedDate} />
                    </div>
                    <span>•</span>
                    <span>{decision.duration}</span>
                    <span>•</span>
                    <span>{decision.participants} participants</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge className={statusColors[decision.status]} variant="secondary">
                    {decision.status === "Approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                    {decision.status === "In Progress" && <TrendingUp className="h-3 w-3 mr-1" />}
                    {decision.status}
                  </Badge>
                  <Badge className={consensusColors[decision.consensus]} variant="secondary">
                    {decision.consensus}
                  </Badge>
                  <Badge className={impactColors[decision.impact]} variant="secondary">
                    {decision.impact} Impact
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <div>
                <h4 className="font-medium mb-2">Key Decision</h4>
                <p className="text-sm text-muted-foreground">{decision.keyDecision}</p>
              </div>

              <div className="grid gap-4 md:grid-cols-2">
                <div>
                  <h4 className="font-medium mb-1">Financial Impact</h4>
                  <p className="text-sm text-muted-foreground">{decision.financialImpact}</p>
                </div>
                <div>
                  <h4 className="font-medium mb-1">Confidence Level</h4>
                  <div className="flex items-center gap-2">
                    <div className="flex-1 bg-muted rounded-full h-2">
                      <div
                        className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                        style={{ width: `${decision.confidence}%` }}
                      ></div>
                    </div>
                    <span className="text-sm font-medium">{decision.confidence}%</span>
                  </div>
                </div>
              </div>

              <div className="flex gap-2 pt-2">
                <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                  <Link href={`/decisions/${decision.id}`}>
                    <Eye className="h-4 w-4 mr-2" />
                    View Full Summary
                  </Link>
                </Button>
                <Button variant="outline" size="sm">
                  <Download className="h-4 w-4 mr-2" />
                  Export PDF
                </Button>
                <Button variant="outline" size="sm">
                  <FileText className="h-4 w-4 mr-2" />
                  View Transcript
                </Button>
              </div>
            </CardContent>
          </Card>
        ))}

        {decisions.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No decisions yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete a board session to generate your first strategic decision
              </p>
              <Button asChild className="bg-indigo-600 hover:bg-indigo-700">
                <Link href="/board-sessions">Browse Sessions</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
