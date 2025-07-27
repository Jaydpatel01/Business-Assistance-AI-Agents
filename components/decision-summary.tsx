"use client"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Copy, Download, ArrowLeft, Share, FileText, TrendingUp, CheckCircle, AlertTriangle } from "lucide-react"
import Link from "next/link"
import { useToast } from "@/hooks/use-toast"

interface DecisionSummaryProps {
  sessionId: string
}

const executiveDecisionSummary = `
# Executive Decision Summary
## Strategic Investment Review - Q4 2024

### Session Overview
**Date:** January 16, 2024  
**Duration:** 45 minutes  
**Participants:** CEO, CFO, CTO, HR Director (AI Agents)  
**Investment Amount:** $5.0M  
**Decision Status:** ✅ **UNANIMOUS APPROVAL**

---

### 🎯 Strategic Decision

**APPROVED:** Proceed with AI-first investment strategy focusing on customer experience automation and operational efficiency improvements.

### 💰 Financial Allocation

| Category | Amount | Percentage | Rationale |
|----------|--------|------------|-----------|
| **AI Customer Experience** | $2.0M | 40% | Highest ROI potential (35% IRR) |
| **Operational Automation** | $1.5M | 30% | Cost reduction & efficiency gains |
| **Technology Infrastructure** | $1.0M | 20% | Scalable platform foundation |
| **Contingency Reserve** | $0.5M | 10% | Risk mitigation buffer |

### 🏢 Executive Perspectives

#### CEO - Strategic Vision
*"This investment aligns perfectly with our 2025 vision of becoming an AI-first organization. The focus on customer experience will differentiate us in the market while operational automation provides sustainable competitive advantages."*

**Key Priorities:**
- Market differentiation through AI-powered customer experience
- Long-term competitive positioning
- Brand value enhancement

#### CFO - Financial Analysis  
*"The financial projections are compelling with 35% IRR and 18-month payback period. The 10% contingency reserve provides adequate risk protection given current market volatility."*

**Financial Metrics:**
- **Expected ROI:** 35% within 18 months
- **Cash Flow Impact:** Positive by Q3 2025
- **Risk Assessment:** Moderate-Low with contingency buffer

#### CTO - Technology Strategy
*"Our cloud-native architecture is ready to support these AI initiatives. The phased implementation approach minimizes technical risk while maximizing integration opportunities across business units."*

**Technical Roadmap:**
- Phase 1: Customer service automation (Q1 2025)
- Phase 2: Operational process optimization (Q2 2025)  
- Phase 3: Advanced analytics and insights (Q3 2025)

#### HR Director - People & Culture
*"The workforce is ready for this transformation. Our recent engagement surveys show 78% employee enthusiasm for AI collaboration. The 15% budget allocation for training ensures successful adoption."*

**Human Capital Strategy:**
- Comprehensive AI literacy training program
- Role evolution rather than replacement
- Change management and support systems

---

### 📋 Implementation Plan

#### Phase 1: Foundation (Q1 2025)
- [ ] Vendor selection and contract finalization
- [ ] Technical infrastructure setup
- [ ] Employee training program launch
- [ ] Pilot program with customer service team

#### Phase 2: Expansion (Q2 2025)
- [ ] Full customer experience automation rollout
- [ ] Operational process automation implementation
- [ ] Performance monitoring and optimization
- [ ] Mid-point ROI assessment

#### Phase 3: Optimization (Q3 2025)
- [ ] Advanced analytics implementation
- [ ] Cross-functional integration
- [ ] Success metrics evaluation
- [ ] Future investment planning

### 🎯 Success Metrics

| Metric | Target | Timeline |
|--------|--------|----------|
| Customer Satisfaction | >90% | Q2 2025 |
| Operational Cost Reduction | 25% | Q3 2025 |
| Employee AI Adoption | >85% | Q2 2025 |
| Revenue Impact | +15% | Q4 2025 |

### ⚠️ Risk Mitigation

**Identified Risks:**
1. **Technology Integration Complexity** - Mitigated by phased approach
2. **Market Volatility Impact** - Protected by 10% contingency reserve  
3. **Employee Resistance** - Addressed through comprehensive training
4. **Vendor Performance** - Managed through milestone-based contracts

### 🚀 Next Steps

1. **Immediate (Next 30 days):**
   - Board approval documentation
   - Vendor RFP process initiation
   - Project team formation

2. **Short-term (Next 90 days):**
   - Contract negotiations and finalization
   - Technical architecture planning
   - Training program development

3. **Medium-term (Next 180 days):**
   - Pilot program launch
   - Initial implementation phase
   - Performance baseline establishment

---

### 📊 Executive Consensus Analysis

**Unanimous Agreement Factors:**
- Strong financial projections with acceptable risk profile
- Strategic alignment with company vision and market trends
- Technical feasibility confirmed by infrastructure readiness
- Positive organizational readiness and employee engagement

**Decision Confidence Level:** 94%

---

*This decision summary represents the collective intelligence of our AI executive board and provides a comprehensive framework for strategic implementation.*
`

// eslint-disable-next-line @typescript-eslint/no-unused-vars
export function DecisionSummary({ sessionId }: DecisionSummaryProps) {
  const { toast } = useToast()

  const handleCopySummary = async () => {
    try {
      if (typeof navigator !== 'undefined' && navigator.clipboard) {
        await navigator.clipboard.writeText(executiveDecisionSummary)
        toast({
          title: "Decision summary copied",
          description: "The executive decision summary has been copied to your clipboard.",
        })
      } else {
        toast({
          title: "Copy not supported",
          description: "Clipboard access is not available.",
          variant: "destructive"
        })
      }
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
    toast({
      title: "PDF Export Initiated",
      description: "Your executive decision summary is being prepared for download.",
    })
  }

  const handleShare = () => {
    toast({
      title: "Share Link Generated",
      description: "Secure sharing link has been copied to clipboard.",
    })
  }

  return (
    <div className="max-w-5xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <Button asChild variant="ghost" size="sm">
            <Link href="/dashboard">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back to Dashboard
            </Link>
          </Button>
          <div>
            <h1 className="text-2xl font-bold">Strategic Investment Review</h1>
            <div className="flex items-center gap-3 mt-1">
              <Badge className="bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300">
                <CheckCircle className="h-3 w-3 mr-1" />
                Decision Approved
              </Badge>
              <Badge variant="outline">Unanimous Consensus</Badge>
              <span className="text-sm text-muted-foreground">Session completed on Jan 16, 2024</span>
            </div>
          </div>
        </div>
      </div>

      {/* Action Buttons */}
      <div className="flex gap-3">
        <Button onClick={handleShare} className="bg-indigo-600 hover:bg-indigo-700">
          <Share className="h-4 w-4 mr-2" />
          Share Decision
        </Button>
        <Button variant="outline" onClick={handleCopySummary}>
          <Copy className="h-4 w-4 mr-2" />
          Copy Summary
        </Button>
        <Button variant="outline" onClick={handleExportPDF}>
          <Download className="h-4 w-4 mr-2" />
          Export PDF
        </Button>
        <Button variant="outline">
          <FileText className="h-4 w-4 mr-2" />
          View Transcript
        </Button>
      </div>

      {/* Decision Summary */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Executive Decision Intelligence Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="prose prose-sm max-w-none dark:prose-invert">
            <div className="whitespace-pre-wrap font-mono text-sm leading-relaxed bg-muted/30 p-6 rounded-lg border">
              {executiveDecisionSummary}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Key Metrics Dashboard */}
      <div className="grid gap-4 md:grid-cols-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Financial Impact
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Investment:</span>
              <span className="font-medium">$5.0M</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Expected ROI:</span>
              <span className="font-medium text-green-600">35%</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Payback Period:</span>
              <span className="font-medium">18 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Risk Level:</span>
              <span className="font-medium text-yellow-600">Moderate</span>
            </div>
          </CardContent>
        </Card>

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
              <span className="text-muted-foreground">Exchanges:</span>
              <span className="font-medium">32 messages</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Participants:</span>
              <span className="font-medium">4 AI executives</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Consensus:</span>
              <span className="font-medium text-green-600">Unanimous</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Implementation</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Start Date:</span>
              <span className="font-medium">Q1 2025</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Phases:</span>
              <span className="font-medium">3 phases</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Timeline:</span>
              <span className="font-medium">9 months</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Success Rate:</span>
              <span className="font-medium text-green-600">94% confidence</span>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-lg">Risk Assessment</CardTitle>
          </CardHeader>
          <CardContent className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Technical Risk:</span>
              <span className="font-medium text-green-600">Low</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Financial Risk:</span>
              <span className="font-medium text-yellow-600">Medium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Market Risk:</span>
              <span className="font-medium text-yellow-600">Medium</span>
            </div>
            <div className="flex justify-between">
              <span className="text-muted-foreground">Mitigation:</span>
              <span className="font-medium text-green-600">Strong</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Follow-up Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Recommended Follow-up Actions</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/scenarios/new">
                <FileText className="h-6 w-6" />
                <span>Create Implementation Scenario</span>
                <span className="text-xs text-muted-foreground">Plan detailed execution steps</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/board-sessions/schedule">
                <AlertTriangle className="h-6 w-6" />
                <span>Schedule Risk Review</span>
                <span className="text-xs text-muted-foreground">Monitor implementation risks</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-4 flex-col gap-2 bg-transparent">
              <Link href="/analytics">
                <TrendingUp className="h-6 w-6" />
                <span>Track Progress</span>
                <span className="text-xs text-muted-foreground">Monitor success metrics</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
