import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { FileText, TrendingUp, DollarSign, Users, Zap } from "lucide-react"
import Link from "next/link"

const scenarioTemplates = [
  {
    id: "strategic-investment",
    title: "Strategic Investment Review",
    description: "Evaluate major investment opportunities with comprehensive financial and strategic analysis",
    category: "Financial Planning",
    difficulty: "Advanced",
    duration: "45-60 min",
    icon: DollarSign,
    tags: ["Investment", "ROI Analysis", "Risk Assessment"],
  },
  {
    id: "market-expansion",
    title: "Market Expansion Strategy",
    description: "Assess opportunities for entering new markets or geographic regions",
    category: "Growth Strategy",
    difficulty: "Intermediate",
    duration: "30-45 min",
    icon: TrendingUp,
    tags: ["Market Analysis", "Expansion", "Competition"],
  },
  {
    id: "cost-optimization",
    title: "Cost Optimization Initiative",
    description: "Identify and evaluate cost reduction opportunities across the organization",
    category: "Operations",
    difficulty: "Intermediate",
    duration: "30-40 min",
    icon: Zap,
    tags: ["Cost Reduction", "Efficiency", "Operations"],
  },
  {
    id: "workforce-planning",
    title: "Workforce Planning & Restructuring",
    description: "Strategic decisions around hiring, restructuring, and organizational changes",
    category: "Human Resources",
    difficulty: "Advanced",
    duration: "40-55 min",
    icon: Users,
    tags: ["HR Strategy", "Restructuring", "Talent"],
  },
]

const difficultyColors = {
  Beginner: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  Intermediate: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
  Advanced: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
}

export default function ScenarioTemplatesPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">Scenario Templates</h1>
        <p className="text-muted-foreground">Start with proven strategic decision frameworks</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {scenarioTemplates.map((template) => (
          <Card key={template.id} className="hover:shadow-lg transition-shadow duration-200">
            <CardHeader>
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-indigo-100 dark:bg-indigo-900/30 rounded-lg">
                    <template.icon className="h-5 w-5 text-indigo-600 dark:text-indigo-400" />
                  </div>
                  <div>
                    <CardTitle className="text-lg">{template.title}</CardTitle>
                    <p className="text-sm text-muted-foreground">{template.category}</p>
                  </div>
                </div>
                <Badge
                  className={difficultyColors[template.difficulty as keyof typeof difficultyColors]}
                  variant="secondary"
                >
                  {template.difficulty}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="space-y-4">
              <p className="text-sm text-muted-foreground">{template.description}</p>

              <div className="flex items-center gap-4 text-sm text-muted-foreground">
                <span>⏱️ {template.duration}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                {template.tags.map((tag) => (
                  <Badge key={tag} variant="outline" className="text-xs">
                    {tag}
                  </Badge>
                ))}
              </div>

              <Button asChild className="w-full bg-indigo-600 hover:bg-indigo-700">
                <Link href={`/scenarios/new?template=${template.id}`}>
                  <FileText className="h-4 w-4 mr-2" />
                  Use This Template
                </Link>
              </Button>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  )
}
