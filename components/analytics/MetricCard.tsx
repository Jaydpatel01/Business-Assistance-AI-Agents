"use client"

import { Card, CardContent } from "../ui/card"
import { Badge } from "../ui/badge"
import { DataDisplay } from "../shared/DataDisplay"
import { BarChart3, TrendingUp, Users, Clock, CheckCircle } from "lucide-react"

interface MetricCardProps {
  title: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ReactNode
  status?: 'success' | 'warning' | 'error' | 'info'
}

export function MetricCard({ 
  title, 
  value, 
  description, 
  trend, 
  icon, 
  status 
}: MetricCardProps) {
  const getStatusColor = (status?: string) => {
    switch (status) {
      case 'success':
        return 'text-green-600'
      case 'warning':
        return 'text-yellow-600'
      case 'error':
        return 'text-red-600'
      case 'info':
        return 'text-blue-600'
      default:
        return 'text-primary'
    }
  }

  return (
    <Card>
      <CardContent className="p-6">
        <DataDisplay
          label={title}
          value={value}
          description={description}
          trend={trend}
          icon={icon && <div className={getStatusColor(status)}>{icon}</div>}
          variant="metric"
          size="lg"
        />
        {status && (
          <div className="mt-2 flex justify-center">
            <Badge 
              variant={status === 'success' ? 'success' : status === 'warning' ? 'warning' : status === 'error' ? 'destructive' : 'info'}
              size="sm"
            >
              {status === 'success' && <TrendingUp className="h-3 w-3 mr-1" />}
              {status.charAt(0).toUpperCase() + status.slice(1)}
            </Badge>
          </div>
        )}
      </CardContent>
    </Card>
  )
}

// Predefined metric card variants
export function ActiveSessionsCard({ value, trend }: { value: number; trend?: MetricCardProps['trend'] }) {
  return (
    <MetricCard
      title="Active Sessions"
      value={value}
      description="Currently running boardroom sessions"
      trend={trend}
      icon={<BarChart3 className="h-8 w-8" />}
      status="info"
    />
  )
}

export function TotalDecisionsCard({ value, trend }: { value: number; trend?: MetricCardProps['trend'] }) {
  return (
    <MetricCard
      title="Total Decisions"
      value={value}
      description="Decisions made across all sessions"
      trend={trend}
      icon={<CheckCircle className="h-8 w-8" />}
      status="success"
    />
  )
}

export function AvgDecisionTimeCard({ value, trend }: { value: string; trend?: MetricCardProps['trend'] }) {
  return (
    <MetricCard
      title="Avg Decision Time"
      value={value}
      description="Average time per decision"
      trend={trend}
      icon={<Clock className="h-8 w-8" />}
    />
  )
}

export function UserSatisfactionCard({ value, trend }: { value: string; trend?: MetricCardProps['trend'] }) {
  return (
    <MetricCard
      title="User Satisfaction"
      value={value}
      description="Average satisfaction rating"
      trend={trend}
      icon={<Users className="h-8 w-8" />}
      status={parseFloat(value) >= 4.0 ? 'success' : parseFloat(value) >= 3.0 ? 'warning' : 'error'}
    />
  )
}
