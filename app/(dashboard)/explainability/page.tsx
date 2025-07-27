"use client"

import { ExplainabilityDashboard } from "@/components/explainability/explainability-dashboard"
import { DocumentManager } from "@/components/document-manager"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Brain, FileText, BarChart3, Shield } from "lucide-react"

interface ExplainabilityPageProps {
  sessionId?: string
  organizationId?: string
}

export default function ExplainabilityPage({ sessionId, organizationId }: ExplainabilityPageProps) {
  return (
    <div className="container mx-auto py-6 space-y-6">
      {/* Page Header */}
      <div className="space-y-2">
        <h1 className="text-3xl font-bold">AI Explainability & Transparency</h1>
        <p className="text-muted-foreground">
          Understand how AI decisions are made, view audit trails, and manage document intelligence
        </p>
      </div>

      {/* Key Features Overview */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Brain className="h-4 w-4 text-blue-600" />
              Decision Reasoning
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Step-by-step breakdown of AI decision-making process
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <BarChart3 className="h-4 w-4 text-green-600" />
              Bias Detection
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Automated detection and reporting of potential decision bias
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <FileText className="h-4 w-4 text-purple-600" />
              Document Intelligence
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              RAG-powered document analysis and contextual search
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium flex items-center gap-2">
              <Shield className="h-4 w-4 text-orange-600" />
              Audit Trails
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-xs text-muted-foreground">
              Complete decision audit trails for compliance and review
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Main Content Tabs */}
      <Tabs defaultValue="explainability" className="w-full">
        <TabsList className="grid w-full grid-cols-2">
          <TabsTrigger value="explainability" className="flex items-center gap-2">
            <Brain className="h-4 w-4" />
            Decision Explainability
          </TabsTrigger>
          <TabsTrigger value="documents" className="flex items-center gap-2">
            <FileText className="h-4 w-4" />
            Document Intelligence
          </TabsTrigger>
        </TabsList>

        <TabsContent value="explainability" className="space-y-6">
          <ExplainabilityDashboard 
            sessionId={sessionId} 
            organizationId={organizationId} 
          />
        </TabsContent>

        <TabsContent value="documents" className="space-y-6">
          <DocumentManager 
            sessionId={sessionId}
            showUpload={true}
          />
        </TabsContent>
      </Tabs>
    </div>
  )
}
