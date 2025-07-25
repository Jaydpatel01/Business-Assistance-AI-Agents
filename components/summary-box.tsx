"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, ArrowLeft, Share } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface SummaryBoxProps {
  sessionId: string
}

const mockSummary = `
# AI Boardroom Decision Summary

## Scenario: Q4 Budget Planning

### Executive Summary
After comprehensive analysis and discussion among the AI boardroom members, the following strategic decisions have been reached for Q4 2024 budget allocation:

### Key Decisions

**1. AI Investment Strategy**
- Allocate $1.75M (70%) of the $2.5M budget to AI initiatives
- Prioritize customer service automation as the primary implementation
- Expected ROI: 25% cost reduction in customer service operations within 6 months

**2. Risk Management**
- Reserve $750K (30%) for contingencies as recommended by the CFO
- Establish quarterly review checkpoints to assess progress and adjust allocation
- Implement phased rollout to minimize operational disruption

**3. Human Capital Investment**
- Dedicate $375K (15% of total budget) to employee reskilling programs
- Focus on upskilling customer service representatives for higher-value roles
- Partner with external training providers for AI literacy programs

### Implementation Timeline
- **Month 1**: Finalize vendor selection and contract negotiations
- **Month 2**: Begin pilot program with 20% of customer service volume
- **Month 3**: Evaluate pilot results and plan full rollout
- **Month 4**: Complete full implementation and begin measuring ROI

### Success Metrics
- Customer satisfaction scores maintained above 85%
- 25% reduction in customer service operational costs
- 90% employee participation in reskilling programs
- Zero involuntary layoffs during transition

### Unanimous Board Consensus
All AI board members (CEO, CFO, CTO, HR Director) reached unanimous agreement on this strategic approach, balancing innovation, financial prudence, and human capital considerations.
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function SummaryBox({ sessionId }: SummaryBoxProps) {
  const { toast } = useToast()

  const handleCopySummary = async () => {
    try {
      await navigator.clipboard.writeText(mockSummary)
      toast({
        title: "Summary copied",
        description: "The summary has been copied to your clipboard.",
      })
    // eslint-disable-next-line @typescript-eslint/no-unused-vars
    } catch (error) {
      toast({
        title: "Copy failed",
        description: "Failed to copy summary to clipboard.",
        variant: "destructive",
      })
    }
  }

  const handleExportPDF = () => {
    // In a real app, this would generate and download a PDF
    toast({
      title: "Export initiated",
      description: "PDF export will begin shortly.",
    })
  }

  const handleShare = () => {
    // In a real app, this would open a share dialog
    toast({
      title: "Share link copied",
      description: "Shareable link has been copied to clipboard.",
    })
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Q4 Budget Planning</h1>
            <div className="flex items-center gap-2 mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">Completed</Badge>
              <span className="text-sm text-muted-foreground">Session completed on Jan 16, 2024</span>
            </div>
          </div>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            AI Boardroom Decision Summary
            <div className="flex gap-2">
              <Button variant="outline" size="sm" onClick={handleShare}>
                <Share className="h-4 w-4 mr-2" />
                Share
              </Button>
              <Button variant="outline" size="sm" onClick={handleCopySummary}>
                <Copy className="h-4 w-4 mr-2" />
                Copy Summary
              </Button>
              <Button variant="outline" size="sm" onClick={handleExportPDF}>
                <Download className="h-4 w-4 mr-2" />
                Export PDF
              </Button>
            </div>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 p-6 rounded-lg">
              {mockSummary}
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Session Metrics</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Duration:</span>
              <span className="font-medium">45 minutes</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Messages:</span>
              <span className="font-medium">28 exchanges</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-medium">4 AI agents</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consensus:</span>
              <span className="font-medium text-green-600">Unanimous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Key Outcomes</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Budget Allocated:</span>
              <span className="font-medium">$2.5M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">AI Investment:</span>
              <span className="font-medium">$1.75M (70%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Contingency:</span>
              <span className="font-medium">$750K (30%)</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected ROI:</span>
              <span className="font-medium text-green-600">25% savings</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Next Steps</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="space-y-1">
              <div className="font-medium">Implementation Phase</div>
              <div className="text-muted-foreground">4-month rollout plan</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Training Programs</div>
              <div className="text-muted-foreground">Employee reskilling</div>
            </div>
            <div className="space-y-1">
              <div className="font-medium">Success Tracking</div>
              <div className="text-muted-foreground">Quarterly reviews</div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
