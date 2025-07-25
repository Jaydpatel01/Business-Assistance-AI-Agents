"use client"

import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { 
  AlertTriangle, 
  Info, 
  CheckCircle, 
  XCircle, 
  Clock,
  Users,
  TrendingUp,
  AlertCircle,
  X
} from "lucide-react"
import { ClientDate } from "@/components/client-date"
import { useState } from "react"

interface Alert {
  id: string
  type: 'success' | 'warning' | 'error' | 'info'
  title: string
  message: string
  timestamp: string
  category?: string
  priority?: 'low' | 'medium' | 'high' | 'critical'
  dismissible?: boolean
  actionLabel?: string
  onAction?: () => void
  relatedSessions?: string[]
  metrics?: {
    label: string
    value: string | number
    trend?: 'up' | 'down' | 'neutral'
  }[]
}

interface AlertsPanelProps {
  alerts: Alert[]
  onDismiss?: (alertId: string) => void
  maxAlerts?: number
}

export function AlertsPanel({ alerts, onDismiss, maxAlerts = 20 }: AlertsPanelProps) {
  const [dismissedAlerts, setDismissedAlerts] = useState<Set<string>>(new Set())

  const visibleAlerts = alerts
    .filter(alert => !dismissedAlerts.has(alert.id))
    .slice(0, maxAlerts)

  const handleDismiss = (alertId: string) => {
    setDismissedAlerts(prev => new Set(prev).add(alertId))
    onDismiss?.(alertId)
  }

  const getAlertIcon = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'warning':
        return <AlertTriangle className="h-4 w-4 text-yellow-500" />
      case 'error':
        return <XCircle className="h-4 w-4 text-red-500" />
      case 'info':
        return <Info className="h-4 w-4 text-blue-500" />
      default:
        return <AlertCircle className="h-4 w-4 text-muted-foreground" />
    }
  }

  const getAlertColor = (type: Alert['type']) => {
    switch (type) {
      case 'success':
        return 'border-l-green-500 bg-green-50/50 dark:bg-green-950/20'
      case 'warning':
        return 'border-l-yellow-500 bg-yellow-50/50 dark:bg-yellow-950/20'
      case 'error':
        return 'border-l-red-500 bg-red-50/50 dark:bg-red-950/20'
      case 'info':
        return 'border-l-blue-500 bg-blue-50/50 dark:bg-blue-950/20'
      default:
        return 'border-l-muted bg-muted/20'
    }
  }

  const getPriorityBadge = (priority?: Alert['priority']) => {
    if (!priority) return null

    const variants: Record<string, 'default' | 'secondary' | 'success' | 'warning' | 'destructive'> = {
      'low': 'secondary',
      'medium': 'default',
      'high': 'warning',
      'critical': 'destructive'
    }

    return (
      <Badge variant={variants[priority]} size="sm">
        {priority}
      </Badge>
    )
  }

  const getTrendIcon = (trend?: 'up' | 'down' | 'neutral') => {
    switch (trend) {
      case 'up':
        return <TrendingUp className="h-3 w-3 text-green-500" />
      case 'down':
        return <TrendingUp className="h-3 w-3 text-red-500 rotate-180" />
      default:
        return null
    }
  }

  const alertCounts = {
    total: visibleAlerts.length,
    critical: visibleAlerts.filter(a => a.priority === 'critical').length,
    high: visibleAlerts.filter(a => a.priority === 'high').length,
    warnings: visibleAlerts.filter(a => a.type === 'warning').length,
    errors: visibleAlerts.filter(a => a.type === 'error').length
  }

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <AlertTriangle className="h-5 w-5" />
            System Alerts
            {alertCounts.total > 0 && (
              <Badge variant="secondary" size="sm">
                {alertCounts.total}
              </Badge>
            )}
          </CardTitle>
          
          {(alertCounts.critical > 0 || alertCounts.errors > 0) && (
            <div className="flex items-center gap-1">
              {alertCounts.critical > 0 && (
                <Badge variant="destructive" size="sm">
                  {alertCounts.critical} Critical
                </Badge>
              )}
              {alertCounts.errors > 0 && (
                <Badge variant="destructive" size="sm">
                  {alertCounts.errors} Errors
                </Badge>
              )}
            </div>
          )}
        </div>
      </CardHeader>
      
      <CardContent className="p-0">
        <ScrollArea className="h-[500px]">
          <div className="p-4 space-y-3">
            {visibleAlerts.length === 0 ? (
              <div className="text-center text-muted-foreground py-8">
                <CheckCircle className="h-8 w-8 mx-auto mb-2 text-green-500/50" />
                <p>No active alerts</p>
                <p className="text-xs mt-1">All systems operating normally</p>
              </div>
            ) : (
              visibleAlerts.map((alert) => (
                <div
                  key={alert.id}
                  className={`relative p-4 rounded-lg border-l-4 transition-all hover:shadow-sm ${getAlertColor(alert.type)}`}
                >
                  {/* Dismiss Button */}
                  {alert.dismissible && (
                    <Button
                      variant="ghost"
                      size="sm"
                      className="absolute top-2 right-2 h-6 w-6 p-0 hover:bg-background/50"
                      onClick={() => handleDismiss(alert.id)}
                    >
                      <X className="h-3 w-3" />
                      <span className="sr-only">Dismiss alert</span>
                    </Button>
                  )}

                  <div className="flex gap-3">
                    <div className="flex-shrink-0 mt-0.5">
                      {getAlertIcon(alert.type)}
                    </div>
                    
                    <div className="flex-1 min-w-0 space-y-2">
                      {/* Header */}
                      <div className="flex items-start justify-between gap-2">
                        <div className="space-y-1">
                          <h4 className="font-medium text-sm leading-tight">
                            {alert.title}
                          </h4>
                          <div className="flex items-center gap-2 text-xs text-muted-foreground">
                            <Clock className="h-3 w-3" />
                            <ClientDate 
                              date={new Date(alert.timestamp)} 
                              format="datetime" 
                              fallback="--" 
                            />
                          </div>
                        </div>
                        
                        <div className="flex items-center gap-1">
                          {getPriorityBadge(alert.priority)}
                          {alert.category && (
                            <Badge variant="outline" size="sm">
                              {alert.category}
                            </Badge>
                          )}
                        </div>
                      </div>

                      {/* Message */}
                      <p className="text-sm text-muted-foreground leading-relaxed">
                        {alert.message}
                      </p>

                      {/* Metrics */}
                      {alert.metrics && alert.metrics.length > 0 && (
                        <div className="grid grid-cols-2 gap-2 mt-3">
                          {alert.metrics.map((metric, index) => (
                            <div 
                              key={index}
                              className="bg-background/50 p-2 rounded border text-xs"
                            >
                              <div className="flex items-center justify-between">
                                <span className="text-muted-foreground">{metric.label}</span>
                                {getTrendIcon(metric.trend)}
                              </div>
                              <div className="font-medium mt-1">{metric.value}</div>
                            </div>
                          ))}
                        </div>
                      )}

                      {/* Related Sessions */}
                      {alert.relatedSessions && alert.relatedSessions.length > 0 && (
                        <div className="flex items-center gap-2 text-xs text-muted-foreground">
                          <Users className="h-3 w-3" />
                          <span>Related sessions: {alert.relatedSessions.join(', ')}</span>
                        </div>
                      )}

                      {/* Action Button */}
                      {alert.actionLabel && alert.onAction && (
                        <div className="pt-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={alert.onAction}
                            className="h-7 text-xs"
                          >
                            {alert.actionLabel}
                          </Button>
                        </div>
                      )}
                    </div>
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
