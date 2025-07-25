import { AnalyticsDashboard } from "@/components/analytics-dashboard"

export default function AnalyticsPage() {
  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Analytics Dashboard</h1>
        <p className="text-muted-foreground">
          Monitor platform performance, decision metrics, and user engagement insights.
        </p>
      </div>
      
      <AnalyticsDashboard />
    </div>
  )
}
