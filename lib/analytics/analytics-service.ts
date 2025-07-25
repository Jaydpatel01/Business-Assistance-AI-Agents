import * as Sentry from '@sentry/nextjs';

// Type definitions for better type safety
type AnalyticsProperties = Record<string, string | number | boolean | Date | null | undefined>;

interface AnalyticsEvent {
  event: string;
  properties: AnalyticsProperties;
  timestamp?: Date;
  userId?: string;
  sessionId?: string;
}

interface UserMetrics {
  userId: string;
  sessionId: string;
  pageViews: number;
  timeOnPage: number;
  interactions: number;
  errors: number;
}

// Google Analytics gtag interface
interface WindowWithGtag extends Window {
  gtag?: (
    command: 'event',
    eventName: string,
    parameters: {
      event_category?: string;
      event_label?: string;
      custom_map?: AnalyticsProperties;
    }
  ) => void;
}

interface BusinessMetrics {
  // AI Agent Usage
  agentInteractions: number;
  agentResponseTime: number;
  agentSatisfactionScore: number;
  
  // Decision Making
  decisionsCreated: number;
  decisionsCompleted: number;
  averageDecisionTime: number;
  
  // Collaboration
  activeSessions: number;
  averageSessionDuration: number;
  messagesExchanged: number;
  
  // Document Processing
  documentsUploaded: number;
  ragQueries: number;
  ragAccuracy: number;
}

class AnalyticsService {
  private events: AnalyticsEvent[] = [];
  private userMetrics: Map<string, UserMetrics> = new Map();
  private maxEvents: number = 1000; // Limit stored events to prevent memory issues
  private businessMetrics: BusinessMetrics = {
    agentInteractions: 0,
    agentResponseTime: 0,
    agentSatisfactionScore: 0,
    decisionsCreated: 0,
    decisionsCompleted: 0,
    averageDecisionTime: 0,
    activeSessions: 0,
    averageSessionDuration: 0,
    messagesExchanged: 0,
    documentsUploaded: 0,
    ragQueries: 0,
    ragAccuracy: 0,
  };

  constructor() {
    // Clean up old events periodically to prevent memory leaks
    if (typeof window !== 'undefined') {
      setInterval(() => {
        this.cleanupOldEvents();
      }, 5 * 60 * 1000); // Every 5 minutes
    }
  }

  private cleanupOldEvents(): void {
    if (this.events.length > this.maxEvents) {
      // Keep only the most recent events
      const eventsToKeep = Math.floor(this.maxEvents * 0.8); // Keep 80% of max
      this.events = this.events.slice(-eventsToKeep);
    }
  }

  // Method to clear all analytics data (useful for testing or privacy)
  clearAnalytics(): void {
    this.events = [];
    this.userMetrics.clear();
    this.businessMetrics = {
      agentInteractions: 0,
      agentResponseTime: 0,
      agentSatisfactionScore: 0,
      decisionsCreated: 0,
      decisionsCompleted: 0,
      averageDecisionTime: 0,
      activeSessions: 0,
      averageSessionDuration: 0,
      messagesExchanged: 0,
      documentsUploaded: 0,
      ragQueries: 0,
      ragAccuracy: 0,
    };
  }

  // Track custom events
  track(event: string, properties: AnalyticsProperties = {}, context?: { userId?: string; sessionId?: string }) {
    const analyticsEvent: AnalyticsEvent = {
      event,
      properties: {
        ...properties,
        url: typeof window !== 'undefined' ? window.location.href : '',
        userAgent: typeof navigator !== 'undefined' ? navigator.userAgent : '',
        timestamp: new Date().toISOString(),
      },
      timestamp: new Date(),
      userId: context?.userId,
      sessionId: context?.sessionId,
    };

    this.events.push(analyticsEvent);

    // Send to Sentry as custom event
    try {
      Sentry.addBreadcrumb({
        message: `Analytics: ${event}`,
        category: 'analytics',
        data: properties,
        level: 'info',
      });
    } catch (sentryError) {
      console.debug('Sentry analytics tracking not available:', sentryError);
    }

    // Send to external analytics if configured
    this.sendToExternalAnalytics(analyticsEvent);

    // Update business metrics
    this.updateBusinessMetrics(event, properties);
  }

  // Track page views
  trackPageView(page: string, properties: AnalyticsProperties = {}) {
    this.track('page_view', {
      page,
      ...properties,
    });
  }

  // Track user interactions
  trackInteraction(element: string, action: string, properties: AnalyticsProperties = {}) {
    this.track('user_interaction', {
      element,
      action,
      ...properties,
    });
  }

  // Track AI agent interactions
  trackAgentInteraction(agentType: string, query: string, responseTime: number, success: boolean) {
    this.track('agent_interaction', {
      agentType,
      query: query.substring(0, 100), // Limit query length for privacy
      responseTime,
      success,
    });

    // Update business metrics
    this.businessMetrics.agentInteractions++;
    this.businessMetrics.agentResponseTime = 
      (this.businessMetrics.agentResponseTime + responseTime) / 2; // Rolling average
  }

  // Track decision creation and completion
  trackDecision(action: 'created' | 'completed', decisionId: string, timeTaken?: number) {
    this.track('decision_action', {
      action,
      decisionId,
      timeTaken,
    });

    if (action === 'created') {
      this.businessMetrics.decisionsCreated++;
    } else if (action === 'completed') {
      this.businessMetrics.decisionsCompleted++;
      if (timeTaken) {
        this.businessMetrics.averageDecisionTime = 
          (this.businessMetrics.averageDecisionTime + timeTaken) / 2;
      }
    }
  }

  // Track document uploads and RAG usage
  trackDocumentActivity(action: 'upload' | 'rag_query', documentId?: string, accuracy?: number) {
    this.track('document_activity', {
      action,
      documentId,
      accuracy,
    });

    if (action === 'upload') {
      this.businessMetrics.documentsUploaded++;
    } else if (action === 'rag_query') {
      this.businessMetrics.ragQueries++;
      if (accuracy) {
        this.businessMetrics.ragAccuracy = 
          (this.businessMetrics.ragAccuracy + accuracy) / 2;
      }
    }
  }

  // Track session activity
  trackSession(action: 'start' | 'end', sessionId: string, duration?: number) {
    this.track('session_activity', {
      action,
      sessionId,
      duration,
    });

    if (action === 'start') {
      this.businessMetrics.activeSessions++;
    } else if (action === 'end' && duration) {
      this.businessMetrics.averageSessionDuration = 
        (this.businessMetrics.averageSessionDuration + duration) / 2;
    }
  }

  // Track errors with context
  trackError(error: Error, context: AnalyticsProperties = {}) {
    this.track('error_occurred', {
      errorMessage: error.message,
      errorStack: error.stack?.substring(0, 500), // Limit stack trace length
      ...context,
    });

    // Send to Sentry
    try {
      Sentry.captureException(error, {
        extra: context,
      });
    } catch (sentryError) {
      console.debug('Sentry error tracking not available:', sentryError);
    }
  }

  // Track feature usage
  trackFeatureUsage(feature: string, action: string, properties: AnalyticsProperties = {}) {
    this.track('feature_usage', {
      feature,
      action,
      ...properties,
    });
  }

  // Track performance metrics
  trackPerformance(metric: string, value: number, unit: string = 'ms') {
    this.track('performance_metric', {
      metric,
      value,
      unit,
    });

    // Send to Sentry
    try {
      Sentry.setMeasurement(metric, value, unit);
    } catch (sentryError) {
      console.debug('Sentry performance tracking not available:', sentryError);
    }
  }

  // Get analytics summary
  getAnalyticsSummary() {
    return {
      totalEvents: this.events.length,
      businessMetrics: this.businessMetrics,
      recentEvents: this.events.slice(-10),
    };
  }

  // Export analytics data
  exportAnalytics(format: 'json' | 'csv' = 'json') {
    if (format === 'json') {
      return JSON.stringify({
        events: this.events,
        businessMetrics: this.businessMetrics,
        exportedAt: new Date().toISOString(),
      }, null, 2);
    }

    // CSV export
    const headers = ['timestamp', 'event', 'properties'];
    const rows = this.events.map(event => [
      event.timestamp?.toISOString() || '',
      event.event,
      JSON.stringify(event.properties),
    ]);

    return [headers, ...rows].map(row => row.join(',')).join('\n');
  }

  // Private methods
  private updateBusinessMetrics(event: string, properties: AnalyticsProperties) {
    switch (event) {
      case 'user_interaction':
        // Count messages
        if (properties.action === 'send_message') {
          this.businessMetrics.messagesExchanged++;
        }
        break;
      case 'agent_interaction':
        // Already handled in trackAgentInteraction
        break;
      // Add more event-specific metrics updates
    }
  }

  private async sendToExternalAnalytics(event: AnalyticsEvent) {
    // Send to external analytics services if configured
    if (process.env.NEXT_PUBLIC_GOOGLE_ANALYTICS_ID) {
      // Google Analytics implementation
      if (typeof window !== 'undefined' && (window as WindowWithGtag).gtag) {
        (window as WindowWithGtag).gtag!('event', event.event, {
          event_category: 'business_intelligence',
          event_label: event.event,
          custom_map: event.properties,
        });
      }
    }

    // Add other analytics providers here (Mixpanel, Amplitude, etc.)
  }

  // Cost tracking for AI usage
  trackAICost(provider: string, model: string, tokens: number, cost: number) {
    this.track('ai_cost', {
      provider,
      model,
      tokens,
      cost,
    });

    // Send cost tracking to Sentry for monitoring
    try {
      Sentry.setMeasurement('ai_tokens_used', tokens, 'token');
      Sentry.setMeasurement('ai_cost', cost, 'usd');
    } catch (sentryError) {
      console.debug('Sentry cost tracking not available:', sentryError);
    }
  }

  // User satisfaction tracking
  trackUserSatisfaction(feature: string, rating: number, feedback?: string) {
    this.track('user_satisfaction', {
      feature,
      rating,
      feedback: feedback?.substring(0, 200), // Limit feedback length
    });

    // Update business metrics
    if (feature === 'agent_response') {
      this.businessMetrics.agentSatisfactionScore = 
        (this.businessMetrics.agentSatisfactionScore + rating) / 2;
    }
  }
}

// Create singleton instance
export const analytics = new AnalyticsService();

// React hook for analytics
export function useAnalytics() {
  return {
    track: analytics.track.bind(analytics),
    trackPageView: analytics.trackPageView.bind(analytics),
    trackInteraction: analytics.trackInteraction.bind(analytics),
    trackAgentInteraction: analytics.trackAgentInteraction.bind(analytics),
    trackDecision: analytics.trackDecision.bind(analytics),
    trackDocumentActivity: analytics.trackDocumentActivity.bind(analytics),
    trackSession: analytics.trackSession.bind(analytics),
    trackError: analytics.trackError.bind(analytics),
    trackFeatureUsage: analytics.trackFeatureUsage.bind(analytics),
    trackPerformance: analytics.trackPerformance.bind(analytics),
    trackAICost: analytics.trackAICost.bind(analytics),
    trackUserSatisfaction: analytics.trackUserSatisfaction.bind(analytics),
    getAnalyticsSummary: analytics.getAnalyticsSummary.bind(analytics),
    exportAnalytics: analytics.exportAnalytics.bind(analytics),
    clearAnalytics: analytics.clearAnalytics.bind(analytics),
  };
}

export default AnalyticsService;
