/**
 * Analytics Export Service
 * Phase 4: Analytics & Insights - Export & Reporting Implementation
 */

export interface ExportableData {
  sessions: Array<{
    id: string;
    name: string;
    startTime: Date;
    endTime?: Date;
    participantCount: number;
    messageCount: number;
    decisions: Array<{
      title: string;
      description: string;
      outcome: string;
      confidence: number;
    }>;
    agents: Array<{
      type: string;
      contributionScore: number;
      keyInsights: string[];
    }>;
  }>;
  insights: {
    totalDecisions: number;
    averageConfidence: number;
    topPerformingAgent: string;
    keyTrends: string[];
    recommendations: string[];
  };
  metadata: {
    exportDate: Date;
    dateRange: {
      start: Date;
      end: Date;
    };
    userId: string;
    organizationId?: string;
  };
}

export class AnalyticsExportService {
  /**
   * Generate CSV export of session data and insights
   */
  static generateCSV(data: ExportableData): string {
    const headers = [
      'Session ID',
      'Session Name', 
      'Start Time',
      'End Time',
      'Duration (minutes)',
      'Participants',
      'Messages',
      'Decisions Count',
      'Average Decision Confidence',
      'Top Agent',
      'Key Insight'
    ];

    const rows = data.sessions.map(session => {
      const duration = session.endTime 
        ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
        : 'Ongoing';
      
      const avgConfidence = session.decisions.length > 0
        ? Math.round(session.decisions.reduce((sum, d) => sum + d.confidence, 0) / session.decisions.length)
        : 0;
      
      const topAgent = session.agents.reduce((top, agent) => 
        agent.contributionScore > top.contributionScore ? agent : top,
        session.agents[0]
      )?.type || 'N/A';

      const keyInsight = session.agents
        .flatMap(agent => agent.keyInsights)
        .join('; ') || 'No insights generated';

      return [
        session.id,
        session.name,
        session.startTime.toISOString(),
        session.endTime?.toISOString() || 'Ongoing',
        duration.toString(),
        session.participantCount.toString(),
        session.messageCount.toString(),
        session.decisions.length.toString(),
        avgConfidence.toString(),
        topAgent,
        keyInsight
      ];
    });

    // Add summary row
    const summaryRow = [
      'SUMMARY',
      `${data.sessions.length} sessions`,
      data.metadata.dateRange.start.toISOString(),
      data.metadata.dateRange.end.toISOString(),
      '', // Duration will be calculated differently for summary
      data.sessions.reduce((sum, s) => sum + s.participantCount, 0).toString(),
      data.sessions.reduce((sum, s) => sum + s.messageCount, 0).toString(),
      data.insights.totalDecisions.toString(),
      data.insights.averageConfidence.toString(),
      data.insights.topPerformingAgent,
      data.insights.keyTrends.join('; ')
    ];

    const csvContent = [
      headers.join(','),
      ...rows.map(row => row.map(cell => `"${cell}"`).join(',')),
      '', // Empty row before summary
      summaryRow.map(cell => `"${cell}"`).join(',')
    ].join('\n');

    return csvContent;
  }

  /**
   * Generate detailed PDF report structure (to be rendered by PDF service)
   */
  static generatePDFData(data: ExportableData): PDFReportData {
    return {
      title: 'Business Assistance AI Analytics Report',
      subtitle: `Period: ${data.metadata.dateRange.start.toLocaleDateString()} - ${data.metadata.dateRange.end.toLocaleDateString()}`,
      generatedAt: data.metadata.exportDate,
      sections: [
        {
          title: 'Executive Summary',
          type: 'summary',
          content: {
            keyMetrics: [
              { label: 'Total Sessions', value: data.sessions.length, trend: 'up' },
              { label: 'Total Decisions', value: data.insights.totalDecisions, trend: 'up' },
              { label: 'Average Confidence', value: `${data.insights.averageConfidence}%`, trend: 'stable' },
              { label: 'Top Performing Agent', value: data.insights.topPerformingAgent, trend: 'stable' }
            ],
            insights: data.insights.keyTrends,
            recommendations: data.insights.recommendations
          }
        },
        {
          title: 'Session Performance Analysis',
          type: 'chart',
          content: {
            chartData: data.sessions.map(session => ({
              name: session.name,
              decisions: session.decisions.length,
              confidence: session.decisions.reduce((sum, d) => sum + d.confidence, 0) / session.decisions.length || 0,
              participants: session.participantCount,
              duration: session.endTime 
                ? (session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60)
                : 0
            }))
          }
        },
        {
          title: 'Agent Contribution Analysis', 
          type: 'table',
          content: {
            headers: ['Agent Type', 'Total Contributions', 'Average Score', 'Key Insights'],
            rows: this.aggregateAgentData(data.sessions)
          }
        },
        {
          title: 'Decision Quality Trends',
          type: 'chart',
          content: {
            chartData: this.generateDecisionTrends(data.sessions)
          }
        },
        {
          title: 'Detailed Session Breakdown',
          type: 'detailed_table',
          content: {
            sessions: data.sessions.map(session => ({
              ...session,
              summary: this.generateSessionSummary(session)
            }))
          }
        }
      ]
    };
  }

  /**
   * Generate Excel workbook structure with multiple sheets
   */
  static generateExcelData(data: ExportableData): ExcelWorkbookData {
    return {
      workbookName: `AI_Analytics_${data.metadata.dateRange.start.toISOString().split('T')[0]}_to_${data.metadata.dateRange.end.toISOString().split('T')[0]}`,
      sheets: [
        {
          name: 'Executive Summary',
          data: this.formatExecutiveSummary(data)
        },
        {
          name: 'Session Details',
          data: this.formatSessionDetails(data.sessions)
        },
        {
          name: 'Decision Analysis', 
          data: this.formatDecisionAnalysis(data.sessions)
        },
        {
          name: 'Agent Performance',
          data: this.formatAgentPerformance(data.sessions)
        },
        {
          name: 'Trend Analysis',
          data: this.formatTrendAnalysis(data.sessions)
        }
      ]
    };
  }

  // Helper methods for data aggregation and formatting
  private static aggregateAgentData(sessions: ExportableData['sessions']) {
    const agentStats = new Map<string, {
      contributions: number;
      totalScore: number;
      insights: string[];
    }>();

    sessions.forEach(session => {
      session.agents.forEach(agent => {
        const current = agentStats.get(agent.type) || { 
          contributions: 0, 
          totalScore: 0, 
          insights: [] 
        };
        
        agentStats.set(agent.type, {
          contributions: current.contributions + 1,
          totalScore: current.totalScore + agent.contributionScore,
          insights: [...current.insights, ...agent.keyInsights]
        });
      });
    });

    return Array.from(agentStats.entries()).map(([type, stats]) => [
      type.toUpperCase(),
      stats.contributions.toString(),
      Math.round(stats.totalScore / stats.contributions).toString(),
      stats.insights.slice(0, 3).join('; ') // Top 3 insights
    ]);
  }

  private static generateDecisionTrends(sessions: ExportableData['sessions']) {
    return sessions.map(session => ({
      sessionName: session.name,
      date: session.startTime,
      decisionsCount: session.decisions.length,
      averageConfidence: session.decisions.reduce((sum, d) => sum + d.confidence, 0) / session.decisions.length || 0,
      highConfidenceDecisions: session.decisions.filter(d => d.confidence > 80).length
    }));
  }

  private static generateSessionSummary(session: ExportableData['sessions'][0]): string {
    const duration = session.endTime 
      ? Math.round((session.endTime.getTime() - session.startTime.getTime()) / (1000 * 60))
      : 'Ongoing';
    
    const highConfidenceDecisions = session.decisions.filter(d => d.confidence > 80).length;
    const topAgent = session.agents.reduce((top, agent) => 
      agent.contributionScore > top.contributionScore ? agent : top,
      session.agents[0]
    );

    return `${duration} min session with ${session.participantCount} participants. ` +
           `${session.decisions.length} decisions made (${highConfidenceDecisions} high-confidence). ` +
           `Led by ${topAgent?.type} agent with ${Math.round(topAgent?.contributionScore || 0)}% contribution.`;
  }

  private static formatExecutiveSummary(data: ExportableData) {
    return [
      ['Metric', 'Value', 'Analysis'],
      ['Total Sessions', data.sessions.length, 'Active engagement across reporting period'],
      ['Total Decisions', data.insights.totalDecisions, 'High decision throughput indicating productive sessions'],
      ['Average Confidence', `${data.insights.averageConfidence}%`, data.insights.averageConfidence > 75 ? 'High confidence levels' : 'Consider decision quality improvements'],
      ['Top Agent', data.insights.topPerformingAgent, 'Most effective AI agent type for this period'],
      ['Key Trends', data.insights.keyTrends.join(', '), 'Primary patterns observed in session data']
    ];
  }

  private static formatSessionDetails(sessions: ExportableData['sessions']) {
    const headers = ['Session ID', 'Name', 'Start Time', 'End Time', 'Participants', 'Messages', 'Decisions', 'Top Agent'];
    const rows = sessions.map(session => [
      session.id,
      session.name,
      session.startTime.toISOString(),
      session.endTime?.toISOString() || 'Ongoing',
      session.participantCount,
      session.messageCount,
      session.decisions.length,
      session.agents.reduce((top, agent) => 
        agent.contributionScore > top.contributionScore ? agent : top,
        session.agents[0]
      )?.type || 'N/A'
    ]);

    return [headers, ...rows];
  }

  private static formatDecisionAnalysis(sessions: ExportableData['sessions']) {
    const headers = ['Session', 'Decision Title', 'Outcome', 'Confidence %', 'Category'];
    const rows: (string | number)[][] = [];

    sessions.forEach(session => {
      session.decisions.forEach(decision => {
        rows.push([
          session.name,
          decision.title,
          decision.outcome,
          decision.confidence,
          this.categorizeDecision(decision.description)
        ]);
      });
    });

    return [headers, ...rows];
  }

  private static formatAgentPerformance(sessions: ExportableData['sessions']) {
    const agentData = this.aggregateAgentData(sessions);
    const headers = ['Agent Type', 'Total Contributions', 'Average Score', 'Top Insights'];
    return [headers, ...agentData];
  }

  private static formatTrendAnalysis(sessions: ExportableData['sessions']) {
    const trendData = this.generateDecisionTrends(sessions);
    const headers = ['Date', 'Session', 'Decisions Count', 'Avg Confidence', 'High Confidence Count'];
    const rows = trendData.map(trend => [
      trend.date.toLocaleDateString(),
      trend.sessionName,
      trend.decisionsCount,
      Math.round(trend.averageConfidence),
      trend.highConfidenceDecisions
    ]);

    return [headers, ...rows];
  }

  private static categorizeDecision(description: string): string {
    const categories = {
      'Financial': ['budget', 'cost', 'revenue', 'finance', 'investment', 'roi'],
      'Strategic': ['strategy', 'plan', 'goal', 'vision', 'objective', 'direction'],
      'Operational': ['process', 'workflow', 'operation', 'efficiency', 'procedure'],
      'HR': ['hiring', 'staff', 'employee', 'team', 'culture', 'performance'],
      'Technology': ['system', 'software', 'tech', 'digital', 'automation', 'ai'],
      'Marketing': ['marketing', 'brand', 'customer', 'sales', 'promotion', 'campaign']
    };

    for (const [category, keywords] of Object.entries(categories)) {
      if (keywords.some(keyword => description.toLowerCase().includes(keyword))) {
        return category;
      }
    }

    return 'General';
  }
}

// Type definitions for export formats
export interface PDFReportData {
  title: string;
  subtitle: string;
  generatedAt: Date;
  sections: Array<{
    title: string;
    type: 'summary' | 'chart' | 'table' | 'detailed_table';
    content: Record<string, unknown>;
  }>;
}

export interface ExcelWorkbookData {
  workbookName: string;
  sheets: Array<{
    name: string;
    data: (string | number)[][];
  }>;
}
