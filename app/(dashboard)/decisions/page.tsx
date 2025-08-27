"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Calendar, FileText, Eye, Search, TrendingUp, CheckCircle, Loader2 } from "lucide-react"
import Link from "next/link"
import { ClientDate } from "@/components/client-date"
import { useToast } from "@/hooks/use-toast"

interface Decision {
  id: string
  sessionId: string
  title: string
  description: string
  status: string
  confidence?: number
  riskLevel?: number
  createdBy?: string
  createdAt: string
  metadata?: string
}

const statusColors: Record<string, string> = {
  proposed: "bg-blue-100 text-blue-800 dark:bg-blue-900 dark:text-blue-300",
  approved: "bg-green-100 text-green-800 dark:bg-green-900 dark:text-green-300",
  rejected: "bg-red-100 text-red-800 dark:bg-red-900 dark:text-red-300",
  pending: "bg-yellow-100 text-yellow-800 dark:bg-yellow-900 dark:text-yellow-300",
}

export default function DecisionsPage() {
  const [decisions, setDecisions] = useState<Decision[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const { toast } = useToast()

  useEffect(() => {
    const fetchDecisions = async () => {
      try {
        const response = await fetch('/api/decisions')
        const data = await response.json()
        
        if (data.success) {
          setDecisions(data.data)
        } else {
          console.error('Failed to fetch decisions:', data.error)
        }
      } catch (error) {
        console.error('Error fetching decisions:', error)
        toast({
          title: "Error",
          description: "Failed to load decisions",
          variant: "destructive"
        })
      } finally {
        setIsLoading(false)
      }
    }

    fetchDecisions()
  }, [toast])

  if (isLoading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-center py-12">
          <Loader2 className="h-8 w-8 animate-spin" />
          <span className="ml-2">Loading decisions...</span>
        </div>
      </div>
    )
  }
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
        {decisions.length === 0 ? (
          <Card className="text-center py-12">
            <CardContent>
              <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h3 className="text-lg font-medium mb-2">No decisions yet</h3>
              <p className="text-muted-foreground mb-4">
                Decisions will appear here after you analyze boardroom discussions.
              </p>
              <Button asChild>
                <Link href="/boardroom/new">
                  Start New Session
                </Link>
              </Button>
            </CardContent>
          </Card>
        ) : (
          decisions.map((decision) => {
            const confidence = decision.confidence || 0
            const riskLevel = decision.riskLevel || 0
            
            return (
              <Card
                key={decision.id}
                className="hover:shadow-lg transition-all duration-200 border-l-4 border-l-indigo-500"
              >
                <CardHeader>
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <CardTitle className="text-xl">{decision.title}</CardTitle>
                      <p className="text-sm text-muted-foreground">{decision.description}</p>
                    </div>
                    <div className="flex items-center gap-2">
                      <Badge className={statusColors[decision.status] || statusColors.proposed} variant="secondary">
                        {decision.status === "approved" && <CheckCircle className="h-3 w-3 mr-1" />}
                        {decision.status === "proposed" && <TrendingUp className="h-3 w-3 mr-1" />}
                        {decision.status}
                      </Badge>
                    </div>
                  </div>
                </CardHeader>

                <CardContent className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div>
                      <h4 className="font-medium mb-1">AI Confidence</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-indigo-600 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${confidence}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{confidence}%</span>
                      </div>
                    </div>
                    <div>
                      <h4 className="font-medium mb-1">Risk Level</h4>
                      <div className="flex items-center gap-2">
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div
                            className="bg-red-500 h-2 rounded-full transition-all duration-300"
                            style={{ width: `${riskLevel}%` }}
                          ></div>
                        </div>
                        <span className="text-sm font-medium">{riskLevel}/100</span>
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center justify-between pt-2 border-t">
                    <div className="flex items-center gap-2 text-sm text-muted-foreground">
                      <Calendar className="h-4 w-4" />
                      <ClientDate date={decision.createdAt} />
                    </div>
                    <div className="flex gap-2">
                      <Button asChild size="sm" className="bg-indigo-600 hover:bg-indigo-700">
                        <Link href={`/decisions/${decision.id}`}>
                          <Eye className="h-4 w-4 mr-2" />
                          View Details
                        </Link>
                      </Button>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )
          })
        )}
      </div>
    </div>
  )
}
