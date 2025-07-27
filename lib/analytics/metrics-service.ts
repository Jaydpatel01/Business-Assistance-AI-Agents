/**
 * Advanced Analytics Metrics Service
 * Phase 4: Analytics & Insights - Advanced Calculation Engine
 */

// Type definitions for session data
export interface MessageData {
  id: string
  content: string
  agentType?: string
  createdAt: Date | string
  participantId?: string
}

export interface DecisionData {
  id: string
  title: string
  description: string
  status: string
  createdAt: Date | string
  metadata?: string
}

export interface ParticipantData {
  id: string
  userId: string
  role: string
  joinedAt: Date | string
}

export interface SessionData {
  id: string
  name: string
  createdAt: Date | string
  endedAt?: Date | string | null
  status: string
  messages: MessageData[]
  decisions: DecisionData[]
  participants: ParticipantData[]
}

export interface SessionMetrics {
  id: string
  duration: number // in minutes
  participantCount: number
  messageCount: number
  decisionCount: number
  agentInteractions: number
  averageResponseTime: number
  engagementScore: number
  outcomeQuality: number
}

export interface AgentMetrics {
  type: string
  totalInteractions: number
  averageResponseTime: number
  effectivenessScore: number
  contributionPercentage: number
  keyInsights: string[]
  recommendationAccuracy: number
}

export interface TrendData {
  period: string
  sessions: number
  decisions: number
  avgConfidence: number
  engagementRate: number
  outcomeSuccess: number
}

export interface BusinessInsight {
  category: 'performance' | 'efficiency' | 'quality' | 'usage' | 'trend'
  title: string
  description: string
  impact: 'high' | 'medium' | 'low'
  recommendation: string
  dataPoints: number[]
  confidence: number
}

export class AdvancedAnalyticsService {
  /**
   * Calculate comprehensive session metrics
   */
  static calculateSessionMetrics(sessionData: SessionData): SessionMetrics {
    const startTime = new Date(sessionData.createdAt)
    const endTime = sessionData.endedAt ? new Date(sessionData.endedAt) : new Date()
    const duration = Math.round((endTime.getTime() - startTime.getTime()) / (1000 * 60))

    // Calculate engagement score based on message frequency and participation
    const messageRate = sessionData.messages.length / Math.max(duration, 1)
    const participationRate = sessionData.participants.length > 0 
      ? sessionData.messages.filter((m: MessageData) => !m.agentType).length / sessionData.messages.length 
      : 0
    const engagementScore = Math.min(100, Math.round((messageRate * 10 + participationRate * 50) * 2))

    // Calculate outcome quality based on decision confidence and completion
    const decisions = sessionData.decisions || []
    const avgDecisionConfidence = decisions.length > 0
      ? decisions.reduce((sum: number, d: DecisionData) => sum + (this.extractConfidence(d) || 70), 0) / decisions.length
      : 0
    const completionRate = sessionData.status === 'completed' ? 100 : 50
    const outcomeQuality = Math.round((avgDecisionConfidence * 0.7 + completionRate * 0.3))

    return {
      id: sessionData.id,
      duration,
      participantCount: sessionData.participants.length,
      messageCount: sessionData.messages.length,
      decisionCount: decisions.length,
      agentInteractions: sessionData.messages.filter((m: MessageData) => m.agentType).length,
      averageResponseTime: this.calculateAverageResponseTime(sessionData.messages),
      engagementScore,
      outcomeQuality
    }
  }

  /**
   * Calculate agent performance metrics
   */
  static calculateAgentMetrics(agentType: string, sessionData: SessionData[]): AgentMetrics {
    const agentMessages = sessionData.flatMap(session => 
      session.messages.filter((m: MessageData) => m.agentType === agentType)
    )

    if (agentMessages.length === 0) {
      return {
        type: agentType,
        totalInteractions: 0,
        averageResponseTime: 0,
        effectivenessScore: 0,
        contributionPercentage: 0,
        keyInsights: [],
        recommendationAccuracy: 0
      }
    }

    // Calculate effectiveness based on decision outcomes following agent recommendations
    const effectivenessScore = this.calculateAgentEffectiveness(agentType, sessionData)
    
    // Calculate contribution percentage
    const totalMessages = sessionData.reduce((sum, session) => sum + session.messages.length, 0)
    const contributionPercentage = totalMessages > 0 
      ? Math.round((agentMessages.length / totalMessages) * 100) 
      : 0

    // Extract key insights from agent messages
    const keyInsights = this.extractAgentInsights(agentMessages)

    return {
      type: agentType,
      totalInteractions: agentMessages.length,
      averageResponseTime: this.calculateAverageResponseTime(agentMessages),
      effectivenessScore,
      contributionPercentage,
      keyInsights,
      recommendationAccuracy: this.calculateRecommendationAccuracy(agentType, sessionData)
    }
  }

  /**
   * Generate trend analysis data
   */
  static generateTrendAnalysis(sessionData: SessionData[], periodDays: number = 30): TrendData[] {
    const endDate = new Date()
    const startDate = new Date(endDate.getTime() - periodDays * 24 * 60 * 60 * 1000)
    
    const trends: TrendData[] = []
    
    // Group sessions by day/week based on period length
    const groupingDays = periodDays > 90 ? 7 : 1 // Weekly for long periods, daily for short
    
    for (let i = 0; i < periodDays; i += groupingDays) {
      const periodStart = new Date(startDate.getTime() + i * 24 * 60 * 60 * 1000)
      const periodEnd = new Date(periodStart.getTime() + groupingDays * 24 * 60 * 60 * 1000)
      
      const periodSessions = sessionData.filter(session => {
        const sessionDate = new Date(session.createdAt)
        return sessionDate >= periodStart && sessionDate < periodEnd
      })

      const decisions = periodSessions.flatMap(s => s.decisions || [])
      const avgConfidence = decisions.length > 0
        ? decisions.reduce((sum, d) => sum + (this.extractConfidence(d) || 70), 0) / decisions.length
        : 0

      const engagementRate = this.calculatePeriodEngagement(periodSessions)
      const outcomeSuccess = this.calculateOutcomeSuccess(periodSessions)

      trends.push({
        period: periodStart.toISOString().split('T')[0],
        sessions: periodSessions.length,
        decisions: decisions.length,
        avgConfidence: Math.round(avgConfidence),
        engagementRate: Math.round(engagementRate),
        outcomeSuccess: Math.round(outcomeSuccess)
      })
    }

    return trends
  }

  /**
   * Generate business insights based on analytics data
   */
  static generateBusinessInsights(
    sessionMetrics: SessionMetrics[],
    agentMetrics: AgentMetrics[],
    trends: TrendData[]
  ): BusinessInsight[] {
    const insights: BusinessInsight[] = []

    // Performance insights
    const avgEngagement = sessionMetrics.reduce((sum, s) => sum + s.engagementScore, 0) / sessionMetrics.length
    if (avgEngagement > 80) {
      insights.push({
        category: 'performance',
        title: 'High Engagement Levels',
        description: `Sessions show consistently high engagement with an average score of ${Math.round(avgEngagement)}%`,
        impact: 'high',
        recommendation: 'Continue current facilitation practices and consider replicating successful session patterns',
        dataPoints: sessionMetrics.map(s => s.engagementScore),
        confidence: 85
      })
    } else if (avgEngagement < 60) {
      insights.push({
        category: 'performance',
        title: 'Low Engagement Alert',
        description: `Sessions show below-average engagement with a score of ${Math.round(avgEngagement)}%`,
        impact: 'high',
        recommendation: 'Review session structure, increase interactive elements, and ensure relevant participants',
        dataPoints: sessionMetrics.map(s => s.engagementScore),
        confidence: 90
      })
    }

    // Efficiency insights
    const avgDuration = sessionMetrics.reduce((sum, s) => sum + s.duration, 0) / sessionMetrics.length
    if (avgDuration > 90) {
      insights.push({
        category: 'efficiency',
        title: 'Extended Session Durations',
        description: `Sessions average ${Math.round(avgDuration)} minutes, indicating thorough analysis`,
        impact: 'medium',
        recommendation: 'Consider breaking complex topics into multiple focused sessions for better outcomes',
        dataPoints: sessionMetrics.map(s => s.duration),
        confidence: 75
      })
    }

    // Quality insights
    const avgOutcomeQuality = sessionMetrics.reduce((sum, s) => sum + s.outcomeQuality, 0) / sessionMetrics.length
    if (avgOutcomeQuality > 80) {
      insights.push({
        category: 'quality',
        title: 'High-Quality Decision Outcomes',
        description: `Decisions show strong quality metrics with ${Math.round(avgOutcomeQuality)}% average score`,
        impact: 'high',
        recommendation: 'Document current best practices for decision-making processes',
        dataPoints: sessionMetrics.map(s => s.outcomeQuality),
        confidence: 88
      })
    }

    // Agent usage insights
    const topAgent = agentMetrics.reduce((top, agent) => 
      agent.effectivenessScore > top.effectivenessScore ? agent : top,
      agentMetrics[0]
    )
    
    if (topAgent) {
      insights.push({
        category: 'usage',
        title: `${topAgent.type} Agent Leading Performance`,
        description: `${topAgent.type} agent shows highest effectiveness at ${topAgent.effectivenessScore}%`,
        impact: 'medium',
        recommendation: `Leverage ${topAgent.type} agent insights for similar decision contexts`,
        dataPoints: agentMetrics.map(a => a.effectivenessScore),
        confidence: 80
      })
    }

    // Trend insights
    if (trends.length >= 7) {
      const recentTrend = trends.slice(-7)
      const earlierTrend = trends.slice(0, 7)
      
      const recentAvgDecisions = recentTrend.reduce((sum, t) => sum + t.decisions, 0) / recentTrend.length
      const earlierAvgDecisions = earlierTrend.reduce((sum, t) => sum + t.decisions, 0) / earlierTrend.length
      
      if (recentAvgDecisions > earlierAvgDecisions * 1.2) {
        insights.push({
          category: 'trend',
          title: 'Increasing Decision Velocity',
          description: `Decision-making speed has increased by ${Math.round(((recentAvgDecisions - earlierAvgDecisions) / earlierAvgDecisions) * 100)}%`,
          impact: 'high',
          recommendation: 'Monitor quality metrics to ensure speed gains maintain decision quality',
          dataPoints: trends.map(t => t.decisions),
          confidence: 85
        })
      }
    }

    return insights.sort((a, b) => {
      const impactOrder = { high: 3, medium: 2, low: 1 }
      return impactOrder[b.impact] - impactOrder[a.impact]
    })
  }

  // Helper methods
  private static extractConfidence(decision: DecisionData): number {
    // Try to extract confidence from metadata or use heuristics
    if (decision.metadata) {
      try {
        const metadata = JSON.parse(decision.metadata)
        if (metadata.confidence) return metadata.confidence
      } catch {}
    }
    
    // Heuristic: approved decisions have higher confidence
    if (decision.status === 'approved') return 85
    if (decision.status === 'proposed') return 70
    if (decision.status === 'rejected') return 45
    
    return 70 // default
  }

  private static calculateAverageResponseTime(messages: MessageData[]): number {
    if (messages.length < 2) return 0
    
    let totalTime = 0
    let responseCount = 0
    
    for (let i = 1; i < messages.length; i++) {
      const currentTime = new Date(messages[i].createdAt).getTime()
      const previousTime = new Date(messages[i - 1].createdAt).getTime()
      const timeDiff = (currentTime - previousTime) / 1000 // seconds
      
      if (timeDiff < 300) { // Less than 5 minutes (likely a response)
        totalTime += timeDiff
        responseCount++
      }
    }
    
    return responseCount > 0 ? Math.round(totalTime / responseCount) : 0
  }

  private static calculateAgentEffectiveness(agentType: string, sessionData: SessionData[]): number {
    // Calculate effectiveness based on decisions made after agent recommendations
    let effectiveRecommendations = 0
    let totalRecommendations = 0
    
    sessionData.forEach(session => {
      const agentMessages = session.messages.filter((m: MessageData) => m.agentType === agentType)
      const decisions = session.decisions || []
      
      agentMessages.forEach((message: MessageData) => {
        if (this.isRecommendation(message.content)) {
          totalRecommendations++
          
          // Check if a decision was made within 30 minutes of this recommendation
          const messageTime = new Date(message.createdAt).getTime()
          const relatedDecisions = decisions.filter((d: DecisionData) => {
            const decisionTime = new Date(d.createdAt).getTime()
            return Math.abs(decisionTime - messageTime) < 30 * 60 * 1000 // 30 minutes
          })
          
          if (relatedDecisions.length > 0) {
            effectiveRecommendations++
          }
        }
      })
    })
    
    return totalRecommendations > 0 
      ? Math.round((effectiveRecommendations / totalRecommendations) * 100)
      : 0
  }

  private static extractAgentInsights(messages: MessageData[]): string[] {
    const insights: string[] = []
    
    messages.forEach(message => {
      const content = message.content.toLowerCase()
      
      // Look for insight patterns
      if (content.includes('analysis shows') || content.includes('data indicates') || content.includes('recommend')) {
        // Extract the key sentence
        const sentences = message.content.split(/[.!?]+/)
        for (const sentence of sentences) {
          if (sentence.length > 20 && sentence.length < 150) {
            if (sentence.toLowerCase().includes('recommend') || 
                sentence.toLowerCase().includes('suggest') ||
                sentence.toLowerCase().includes('analysis')) {
              insights.push(sentence.trim())
              break
            }
          }
        }
      }
    })
    
    return insights.slice(0, 3) // Return top 3 insights
  }

  private static calculateRecommendationAccuracy(agentType: string, sessionData: SessionData[]): number {
    // Placeholder for recommendation accuracy calculation
    // This would require tracking recommendation outcomes over time
    // sessionData parameter reserved for future implementation
    void sessionData; // Acknowledge parameter to avoid unused warning
    const baseAccuracy = {
      'CEO': 85,
      'CFO': 82,
      'CTO': 78,
      'HR': 75
    }
    
    return baseAccuracy[agentType as keyof typeof baseAccuracy] || 70
  }

  private static isRecommendation(content: string): boolean {
    const recommendationKeywords = [
      'recommend', 'suggest', 'propose', 'advise', 
      'should consider', 'would be wise', 'best approach'
    ]
    
    return recommendationKeywords.some(keyword => 
      content.toLowerCase().includes(keyword)
    )
  }

  private static calculatePeriodEngagement(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0
    
    const sessionMetrics = sessions.map(session => this.calculateSessionMetrics(session))
    return sessionMetrics.reduce((sum, s) => sum + s.engagementScore, 0) / sessionMetrics.length
  }

  private static calculateOutcomeSuccess(sessions: SessionData[]): number {
    if (sessions.length === 0) return 0
    
    const sessionMetrics = sessions.map(session => this.calculateSessionMetrics(session))
    return sessionMetrics.reduce((sum, s) => sum + s.outcomeQuality, 0) / sessionMetrics.length
  }
}
