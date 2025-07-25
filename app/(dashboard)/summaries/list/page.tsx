import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Calendar, FileText, Download, Eye } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"

const summaries = [
  {
    id: "1",
    scenarioTitle: "Q4 Budget Planning",
    completedDate: "2024-01-16",
    duration: "45 minutes",
    participants: 4,
    consensus: "Unanimous",
    keyDecision: "Allocate $1.75M to AI initiatives with 30% contingency reserve",
  },
  {
    id: "3",
    scenarioTitle: "Product Launch Decision",
    completedDate: "2024-01-10",
    duration: "32 minutes",
    participants: 4,
    consensus: "Majority",
    keyDecision: "Proceed with Q2 launch targeting enterprise customers first",
  },
]

export default function SummariesPage() {
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Summaries</h1>
          <p className="text-muted-foreground">Review completed boardroom simulation results and decisions</p>
        </div>
      </div>

      <div className="space-y-4">
        {summaries.map((summary) => (
          <Card key={summary.id} className="hover:shadow-md transition-shadow">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div>
                  <CardTitle className="text-xl">{summary.scenarioTitle}</CardTitle>
                  <div className="flex items-center gap-4 mt-2 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-4 w-4" />
                      <ClientDate date={summary.completedDate} />
                    </div>
                    <span>•</span>
                    <span>{summary.duration}</span>
                    <span>•</span>
                    <span>{summary.participants} participants</span>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  <Badge
                    className={
                      summary.consensus === "Unanimous"
                        ? "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300"
                        : "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300"
                    }
                    variant="secondary"
                  >
                    {summary.consensus}
                  </Badge>
                </div>
              </div>
            </CardHeader>

            <CardContent>
              <div className="space-y-4">
                <div>
                  <h4 className="font-medium mb-2">Key Decision</h4>
                  <p className="text-sm text-muted-foreground">{summary.keyDecision}</p>
                </div>

                <div className="flex gap-2">
                  <Button asChild size="sm">
                    <Link href={`/summaries/${summary.id}`}>
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
              </div>
            </CardContent>
          </Card>
        ))}

        {summaries.length === 0 && (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-lg font-medium mb-2">No summaries yet</h3>
              <p className="text-muted-foreground mb-4">
                Complete a boardroom simulation to generate your first summary
              </p>
              <Button asChild>
                <Link href="/scenarios">Browse Scenarios</Link>
              </Button>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}
