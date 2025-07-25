"use client"

import * as React from 'react'
import { cn } from '../../lib/utils'
import { TrendingUp, TrendingDown, Minus } from 'lucide-react'

interface DataDisplayProps {
  label: string
  value: string | number
  description?: string
  trend?: {
    value: number
    direction: 'up' | 'down' | 'neutral'
    label?: string
  }
  icon?: React.ReactNode
  variant?: 'default' | 'metric' | 'compact'
  size?: 'sm' | 'md' | 'lg'
  className?: string
}

export function DataDisplay({
  label,
  value,
  description,
  trend,
  icon,
  variant = 'default',
  size = 'md',
  className
}: DataDisplayProps) {
  const getTrendIcon = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return <TrendingUp className="h-4 w-4" />
      case 'down':
        return <TrendingDown className="h-4 w-4" />
      case 'neutral':
        return <Minus className="h-4 w-4" />
    }
  }

  const getTrendColor = (direction: 'up' | 'down' | 'neutral') => {
    switch (direction) {
      case 'up':
        return 'text-green-600'
      case 'down':
        return 'text-red-600'
      case 'neutral':
        return 'text-gray-600'
    }
  }

  const getSizeClasses = () => {
    switch (size) {
      case 'sm':
        return {
          value: 'text-xl font-bold',
          label: 'text-sm font-medium',
          description: 'text-xs text-muted-foreground',
          trend: 'text-xs'
        }
      case 'lg':
        return {
          value: 'text-4xl font-bold',
          label: 'text-base font-semibold',
          description: 'text-sm text-muted-foreground',
          trend: 'text-sm'
        }
      default:
        return {
          value: 'text-2xl font-bold',
          label: 'text-sm font-medium',
          description: 'text-sm text-muted-foreground',
          trend: 'text-sm'
        }
    }
  }

  const sizeClasses = getSizeClasses()

  if (variant === 'compact') {
    return (
      <div className={cn('flex items-center gap-3', className)}>
        {icon && (
          <div className="flex-shrink-0">
            {icon}
          </div>
        )}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className={cn(sizeClasses.value)}>{value}</span>
            {trend && (
              <div className={cn('flex items-center gap-1', getTrendColor(trend.direction), sizeClasses.trend)}>
                {getTrendIcon(trend.direction)}
                <span>{trend.value}%</span>
                {trend.label && <span className="text-muted-foreground">({trend.label})</span>}
              </div>
            )}
          </div>
          <div className={cn(sizeClasses.label, 'truncate')}>{label}</div>
          {description && (
            <div className={cn(sizeClasses.description, 'truncate')}>{description}</div>
          )}
        </div>
      </div>
    )
  }

  if (variant === 'metric') {
    return (
      <div className={cn('text-center space-y-2', className)}>
        {icon && (
          <div className="flex justify-center">
            {icon}
          </div>
        )}
        <div className={cn(sizeClasses.label, 'text-muted-foreground')}>
          {label}
        </div>
        <div className={cn(sizeClasses.value, 'text-foreground')}>
          {value}
        </div>
        {trend && (
          <div className={cn('flex items-center justify-center gap-1', getTrendColor(trend.direction), sizeClasses.trend)}>
            {getTrendIcon(trend.direction)}
            <span>{trend.value}%</span>
            {trend.label && <span className="text-muted-foreground ml-1">vs {trend.label}</span>}
          </div>
        )}
        {description && (
          <div className={cn(sizeClasses.description, 'text-center')}>
            {description}
          </div>
        )}
      </div>
    )
  }

  // Default variant
  return (
    <div className={cn('space-y-2', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          {icon && icon}
          <span className={cn(sizeClasses.label)}>{label}</span>
        </div>
        {trend && (
          <div className={cn('flex items-center gap-1', getTrendColor(trend.direction), sizeClasses.trend)}>
            {getTrendIcon(trend.direction)}
            <span>{trend.value}%</span>
            {trend.label && <span className="text-muted-foreground">({trend.label})</span>}
          </div>
        )}
      </div>
      <div className={cn(sizeClasses.value)}>
        {value}
      </div>
      {description && (
        <div className={cn(sizeClasses.description)}>
          {description}
        </div>
      )}
    </div>
  )
}
