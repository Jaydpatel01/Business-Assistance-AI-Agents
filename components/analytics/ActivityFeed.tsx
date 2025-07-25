"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Clock, MessageSquare, Users, FileText, TrendingUp, Activity } from "lucide-react"
import { ClientDate } from "@/components/client-date"

interface ActivityItem {
  timestamp: string
  type: string
  description: string
  participants?: string[]
  outcome?: string
  category?: string
  duration?: string
  size?: string
  messagesExchanged?: number
}

interface ActivityFeedProps {
  activities: ActivityItem[]
  maxItems?: number
}

export function ActivityFeed({ activities, maxItems = 10 }: ActivityFeedProps) {
  const limitedActivities = activities.slice(0, maxItems)

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'session_started':
        return <Activity className="h-4 w-4 text-green-500" />
      case 'session_completed':
        return <TrendingUp className="h-4 w-4 text-blue-500" />
      case 'decision_made':
        return <FileText className="h-4 w-4 text-purple-500" />
      case 'message_sent':
        return <MessageSquare className="h-4 w-4 text-orange-500" />
      case 'user_joined':
        return <Users className="h-4 w-4 text-teal-500" />
      default:
        return <Clock className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getActivityColor = (type: string) => {
    switch (type) {
      case 'session_started':
        return 'border-l-green-500'
      case 'session_completed':
        return 'border-l-blue-500'
      case 'decision_made':
        return 'border-l-purple-500'
      case 'message_sent':
        return 'border-l-orange-500'
      case 'user_joined':
        return 'border-l-teal-500'
      default:
        return 'border-l-muted'
    }
  }

  const getCategoryBadge = (category?: string) => {
    if (!category) return null
    
    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'info'> = {
      'strategic': 'info',
      'financial': 'success',
      'operational': 'secondary',
      'technical': 'warning',
      'hr': 'default'
    }

    return (
      <Badge variant={variants[category] || 'secondary'} size="sm">
        {category}
      </Badge>
    )
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2">
          <Activity className="h-5 w-5" />
          Recent Activity
        </CardTitle>
      </CardHeader>
      <CardContent className="p-0">
        <ScrollArea className="h-[400px]">
          <div className="p-4 space-y-4">
            {limitedActivities.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <Activity className="h-8 w-8 mx-auto mb-2 text-muted-foreground/50" />
                <p>No recent activity</p>
              </div>
            ) : (
              limitedActivities.map((activity, index) => (
                <div
                  key={index}
                  className={`flex gap-3 p-3 rounded-lg border-l-4 bg-muted/20 ${getActivityColor(activity.type)}`}
                >
                  <div className="flex-shrink-0 mt-1">
                    {getActivityIcon(activity.type)}
                  </div>
                  
                  <div className="flex-1 min-w-0 space-y-2">
                    <div className="flex items-start justify-between gap-2">
                      <p className="text-sm font-medium leading-tight">
                        {activity.description}
                      </p>
                      <div className="flex items-center gap-1 text-xs text-muted-foreground">
                        <Clock className="h-3 w-3" />
                        <ClientDate 
                          date={new Date(activity.timestamp)} 
                          format="time" 
                          fallback="--:--" 
                        />
                      </div>
                    </div>

                    {/* Activity Details */}
                    <div className="flex flex-wrap gap-2 text-xs">
                      {activity.category && getCategoryBadge(activity.category)}
                      
                      {activity.participants && activity.participants.length > 0 && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>{activity.participants.length} participant{activity.participants.length !== 1 ? 's' : ''}</span>
                        </div>
                      )}
                      
                      {activity.duration && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <Clock className="h-3 w-3" />
                          <span>{activity.duration}</span>
                        </div>
                      )}
                      
                      {activity.messagesExchanged && (
                        <div className="flex items-center gap-1 text-muted-foreground">
                          <MessageSquare className="h-3 w-3" />
                          <span>{activity.messagesExchanged} messages</span>
                        </div>
                      )}
                    </div>

                    {/* Outcome */}
                    {activity.outcome && (
                      <div className="text-xs text-muted-foreground bg-muted/30 p-2 rounded">
                        <strong>Outcome:</strong> {activity.outcome}
                      </div>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </ScrollArea>
      </CardContent>
    </Card>
  )
}
