import { ScenarioCard } from "@/components/scenario-card"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ContentWrapper } from "@/components/content-wrapper"
import { OnboardingBanner } from "@/components/onboarding/OnboardingBanner"
import { QuickActionsSection } from "../../../components/dashboard/QuickActionsSection"
import { Plus, TrendingUp, Users, FileText, CheckCircle, Sparkles, Brain, Zap, Target } from "lucide-react"
import Link from "next/link"

const scenarios = [
  {
    id: "1",
    title: "Q4 Strategic Investment Review",
    status: "In Progress" as const,
    createdDate: "2024-01-15",
    description: "Evaluate $5M investment opportunities across AI initiatives and market expansion",
    industry: "Technology",
    priority: "High",
    participants: 4,
    lastActivity: "2 hours ago",
  },
  {
    id: "2",
    title: "Remote Work Policy 2025",
    status: "Draft" as const,
    createdDate: "2024-01-14",
    description: "Define comprehensive remote work strategy for global workforce",
    industry: "HR Policy",
    priority: "Medium",
    participants: 3,
    lastActivity: "1 day ago",
  },
  {
    id: "3",
    title: "Market Expansion - APAC Region",
    status: "Completed" as const,
    createdDate: "2024-01-10",
    description: "Strategic analysis for entering Asian Pacific markets",
    industry: "Business Development",
    priority: "High",
    participants: 4,
    lastActivity: "3 days ago",
  },
  {
    id: "4",
    title: "Cost Optimization Initiative",
    status: "Scheduled" as const,
    createdDate: "2024-01-12",
    description: "Identify 15% cost reduction opportunities without impacting growth",
    industry: "Operations",
    priority: "Critical",
    participants: 4,
    lastActivity: "5 hours ago",
  },
]

const dashboardStats = [
  {
    title: "Active Scenarios",
    value: "12",
    change: "+3 this week",
    icon: FileText,
  },
  {
    title: "Decisions Made",
    value: "47",
    change: "+8 this month",
    icon: CheckCircle,
  },
  {
    title: "AI Consultations",
    value: "156",
    change: "+23 this week",
    icon: Users,
  },
  {
    title: "Success Rate",
    value: "94%",
    change: "+2% improvement",
    icon: TrendingUp,
  },
]

export default function DashboardPage() {
  const demoContent = (
    <div className="space-y-8 p-1">
      {/* Demo Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card p-8 border">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <Badge variant="secondary">AI-Powered Decision Intelligence - Demo</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Demo Dashboard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Explore our platform with sample scenarios and demo data. 
              Sign in with your Google account to access real collaboration features.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/scenarios/demo">
              <Plus className="h-5 w-5 mr-2" />
              Try Demo Scenario
            </Link>
          </Button>
        </div>
      </div>

      {/* Demo Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Demo Scenarios</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">5</div>
            <p className="text-xs text-muted-foreground">Sample scenarios available</p>
          </CardContent>
        </Card>
        <Card className="bg-card">
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
            <CardTitle className="text-sm font-medium">Demo Sessions</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">12</div>
            <p className="text-xs text-muted-foreground">Simulated board sessions</p>
          </CardContent>
        </Card>
      </div>

      {/* Demo Scenarios */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Brain className="h-6 w-6" />
            Demo Scenarios - Sample Data
          </CardTitle>
          <p className="text-muted-foreground">Pre-configured scenarios with sample data for demonstration</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.slice(0, 3).map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  )

  const realContent = (
    <div className="space-y-8 p-1">
      {/* Onboarding Banner */}
      <OnboardingBanner />
      
      {/* Quick Actions for New Users */}
      <QuickActionsSection />
      
      {/* Real Hero Section */}
      <div className="relative overflow-hidden rounded-2xl bg-card p-8 border">
        <div className="relative z-10 flex items-center justify-between">
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Sparkles className="h-6 w-6" />
              <Badge variant="secondary">AI-Powered Decision Intelligence</Badge>
            </div>
            <h1 className="text-4xl font-bold tracking-tight">Executive Dashboard</h1>
            <p className="text-xl text-muted-foreground max-w-2xl">
              Transform strategic decision-making with AI executive agents. Get unanimous consensus and data-driven
              insights for critical business decisions.
            </p>
          </div>
          <Button asChild size="lg">
            <Link href="/scenarios/new">
              <Plus className="h-5 w-5 mr-2" />
              New Strategic Scenario
            </Link>
          </Button>
        </div>
      </div>

      {/* Dashboard Stats */}
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-4">
        {dashboardStats.map((stat) => (
          <Card key={stat.title} className="bg-card">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-3">
              <CardTitle className="text-sm font-medium">{stat.title}</CardTitle>
              <stat.icon className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stat.value}</div>
              <p className="text-xs text-muted-foreground">{stat.change}</p>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Recent Strategic Scenarios */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <CardTitle className="flex items-center gap-2">
                <Brain className="h-6 w-6" />
                Recent Strategic Scenarios
              </CardTitle>
              <p className="text-sm text-muted-foreground mt-1">
                Your latest decision-making scenarios and AI-powered analysis
              </p>
            </div>
            <Button asChild variant="outline">
              <Link href="/scenarios">
                View All
                <Plus className="h-4 w-4 ml-2" />
              </Link>
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
            {scenarios.map((scenario) => (
              <ScenarioCard key={scenario.id} scenario={scenario} />
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Zap className="h-6 w-6" />
            Quick Actions
          </CardTitle>
          <p className="text-muted-foreground">Accelerate your decision-making process</p>
        </CardHeader>
        <CardContent>
          <div className="grid gap-6 md:grid-cols-3">
            <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3 bg-transparent">
              <Link href="/scenarios/templates">
                <div className="p-3 bg-muted rounded-full">
                  <FileText className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <span className="font-semibold">Use Scenario Template</span>
                  <span className="text-sm text-muted-foreground block mt-1">Start from proven frameworks</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3 bg-transparent">
              <Link href="/board-sessions/schedule">
                <div className="p-3 bg-muted rounded-full">
                  <Users className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <span className="font-semibold">Schedule Board Session</span>
                  <span className="text-sm text-muted-foreground block mt-1">Plan executive consultation</span>
                </div>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto p-6 flex-col gap-3 bg-transparent">
              <Link href="/analytics">
                <div className="p-3 bg-muted rounded-full">
                  <Target className="h-8 w-8" />
                </div>
                <div className="text-center">
                  <span className="font-semibold">View Analytics</span>
                  <span className="text-sm text-muted-foreground block mt-1">Decision intelligence insights</span>
                </div>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )

  return (
    <ContentWrapper demoContent={demoContent}>
      {realContent}
    </ContentWrapper>
  )
}
