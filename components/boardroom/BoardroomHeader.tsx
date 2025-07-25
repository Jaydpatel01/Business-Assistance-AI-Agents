"use client"

import React from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"
import { Download, Users, Clock, MessageSquare } from "lucide-react"
import { ClientDate } from "@/components/client-date"

interface BoardroomHeaderProps {
  sessionId: string
  sessionName: string
  scenarioName: string
  scenarioDescription: string
  status: 'preparing' | 'active' | 'completed' | 'paused'
  startTime: Date
  participantCount: number
  messageCount: number
  progress: number
  onExport: () => void
  isExporting?: boolean
}

const BoardroomHeader = React.memo(function BoardroomHeader({
  sessionId,
  sessionName,
  scenarioName,
  scenarioDescription,
  status,
  startTime,
  participantCount,
  messageCount,
  progress,
  onExport,
  isExporting = false
}: BoardroomHeaderProps) {
  const getStatusColor = (status: string): 'default' | 'secondary' | 'success' | 'warning' | 'destructive' => {
    switch (status) {
      case 'active':
        return 'success'
      case 'preparing':
        return 'warning'
      case 'completed':
        return 'secondary'
      case 'paused':
        return 'default'
      default:
        return 'secondary'
    }
  }

  const getStatusLabel = (status: string) => {
    switch (status) {
      case 'active':
        return 'Live Session'
      case 'preparing':
        return 'Preparing'
      case 'completed':
        return 'Completed'
      case 'paused':
        return 'Paused'
      default:
        return status.charAt(0).toUpperCase() + status.slice(1)
    }
  }

  return (
    <Card className="mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <div>
            <CardTitle className="text-2xl font-bold">
              {sessionName}
            </CardTitle>
            <div className="flex items-center gap-4 mt-2">
              <Badge variant={getStatusColor(status)}>
                {getStatusLabel(status)}
              </Badge>
              <div className="flex items-center text-sm text-muted-foreground">
                <Users className="h-4 w-4 mr-1" />
                {participantCount} Participants
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <MessageSquare className="h-4 w-4 mr-1" />
                {messageCount} Messages
              </div>
              <div className="flex items-center text-sm text-muted-foreground">
                <Clock className="h-4 w-4 mr-1" />
                <ClientDate date={startTime} format="time" fallback="--:--" />
              </div>
            </div>
          </div>
          <Button 
            variant="outline" 
            onClick={onExport}
            disabled={isExporting}
            className="flex items-center gap-2"
          >
            <Download className="h-4 w-4" />
            {isExporting ? 'Exporting...' : 'Export Summary'}
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div>
            <h3 className="font-semibold text-lg mb-2">{scenarioName}</h3>
            <p className="text-muted-foreground">{scenarioDescription}</p>
          </div>
          
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <span className="text-sm font-medium">Session Progress</span>
              <span className="text-sm text-muted-foreground">{progress}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>

          {/* Session Info */}
          <div className="text-xs text-muted-foreground">
            Session ID: {sessionId}
          </div>
        </div>
      </CardContent>
    </Card>
  )
})

export { BoardroomHeader }
