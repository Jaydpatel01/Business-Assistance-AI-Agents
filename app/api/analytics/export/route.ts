/**
 * Analytics Export API
 * POST /api/analytics/export - Generate and export analytics reports
 * Supports CSV, PDF, and Excel formats
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { AnalyticsExportService, type ExportableData } from '@/lib/analytics/export-service';
import { z } from 'zod';

const ExportRequestSchema = z.object({
  format: z.enum(['csv', 'pdf', 'excel']),
  dateRange: z.object({
    start: z.string(),
    end: z.string()
  }),
  includeData: z.object({
    sessions: z.boolean().default(true),
    decisions: z.boolean().default(true),
    agents: z.boolean().default(true),
    insights: z.boolean().default(true)
  }).optional(),
  sessionIds: z.array(z.string()).optional(), // Export specific sessions only
});

export async function POST(request: NextRequest) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = ExportRequestSchema.parse(body);

    console.log(`📊 Generating ${validatedData.format.toUpperCase()} analytics export for user ${session.user.id}`);

    // Collect data for export
    const exportData = await collectExportData(
      validatedData.dateRange,
      session.user.id,
      validatedData.sessionIds
    );

    // Generate export based on format
    const exportResult = await generateExport(validatedData.format, exportData);

    return NextResponse.json({
      success: true,
      data: exportResult,
      metadata: {
        format: validatedData.format,
        recordCount: exportData.sessions.length,
        dateRange: validatedData.dateRange,
        generatedAt: new Date().toISOString()
      },
      message: `${validatedData.format.toUpperCase()} export generated successfully`
    });

  } catch (error) {
    console.error('Analytics export error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }
    
    return NextResponse.json(
      { success: false, error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

async function collectExportData(
  dateRange: { start: string; end: string },
  userId: string,
  sessionIds?: string[]
): Promise<ExportableData> {
  const startDate = new Date(dateRange.start);
  const endDate = new Date(dateRange.end);
  
  console.log(`📈 Collecting analytics data from ${startDate.toISOString()} to ${endDate.toISOString()}`);

  // Build session filter
  const sessionFilter: {
    createdAt: { gte: Date; lte: Date };
    OR: Array<{ createdById?: string; participants?: { some: { userId: string } } }>;
    id?: { in: string[] };
  } = {
    createdAt: {
      gte: startDate,
      lte: endDate
    },
    OR: [
      { createdById: userId },
      {
        participants: {
          some: {
            userId: userId
          }
        }
      }
    ]
  };

  // Filter by specific session IDs if provided
  if (sessionIds && sessionIds.length > 0) {
    sessionFilter.id = { in: sessionIds };
  }

  // Fetch sessions with related data
  const sessions = await prisma.boardroomSession.findMany({
    where: sessionFilter,
    include: {
      participants: {
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      },
      messages: {
        include: {
          participant: {
            include: {
              user: {
                select: { id: true, name: true }
              }
            }
          }
        },
        orderBy: { createdAt: 'asc' }
      },
      decisions: true
    },
    orderBy: { createdAt: 'desc' }
  });

  // Transform database data to export format
  const exportSessions = sessions.map(session => {
    // Calculate agent contributions from messages
    const agentMessages = session.messages.filter(m => m.agentType);
    const agentStats = new Map<string, { count: number; insights: string[] }>();
    
    agentMessages.forEach(message => {
      if (message.agentType) {
        const current = agentStats.get(message.agentType) || { count: 0, insights: [] };
        agentStats.set(message.agentType, {
          count: current.count + 1,
          insights: [...current.insights, ...(extractInsights(message.content) || [])]
        });
      }
    });

    // Calculate agent contribution scores
    const totalAgentMessages = agentMessages.length;
    const agents = Array.from(agentStats.entries()).map(([type, stats]) => ({
      type,
      contributionScore: totalAgentMessages > 0 ? Math.round((stats.count / totalAgentMessages) * 100) : 0,
      keyInsights: stats.insights.slice(0, 3) // Top 3 insights per agent
    }));

    // Transform decisions
    const decisions = session.decisions.map(decision => ({
      title: decision.title,
      description: decision.description || '',
      outcome: decision.status || 'Pending',
      confidence: 75 // Default confidence since schema doesn't have this field
    }));

    return {
      id: session.id,
      name: session.name || `Session ${session.id.slice(-8)}`,
      startTime: session.createdAt,
      endTime: session.endedAt || undefined,
      participantCount: session.participants.length,
      messageCount: session.messages.length,
      decisions,
      agents
    };
  });

  // Generate insights
  const insights = generateInsights(exportSessions);

  return {
    sessions: exportSessions,
    insights,
    metadata: {
      exportDate: new Date(),
      dateRange: { start: startDate, end: endDate },
      userId,
      organizationId: undefined // TODO: Add organization support
    }
  };
}

function generateInsights(sessions: ExportableData['sessions']) {
  const totalDecisions = sessions.reduce((sum, session) => sum + session.decisions.length, 0);
  const allDecisions = sessions.flatMap(session => session.decisions);
  const averageConfidence = allDecisions.length > 0 
    ? Math.round(allDecisions.reduce((sum, decision) => sum + decision.confidence, 0) / allDecisions.length)
    : 0;

  // Find top performing agent
  const agentPerformance = new Map<string, { total: number, count: number }>();
  sessions.forEach(session => {
    session.agents.forEach(agent => {
      const current = agentPerformance.get(agent.type) || { total: 0, count: 0 };
      agentPerformance.set(agent.type, {
        total: current.total + agent.contributionScore,
        count: current.count + 1
      });
    });
  });

  let topPerformingAgent = 'N/A';
  let highestAvgScore = 0;
  for (const [type, stats] of agentPerformance.entries()) {
    const avgScore = stats.total / stats.count;
    if (avgScore > highestAvgScore) {
      highestAvgScore = avgScore;
      topPerformingAgent = type.toUpperCase();
    }
  }

  // Generate key trends
  const keyTrends = [];
  
  if (sessions.length > 1) {
    const recentSessions = sessions.slice(0, Math.ceil(sessions.length / 2));
    const olderSessions = sessions.slice(Math.ceil(sessions.length / 2));
    
    const recentAvgConfidence = recentSessions.reduce((sum, s) => 
      sum + (s.decisions.reduce((dSum, d) => dSum + d.confidence, 0) / Math.max(s.decisions.length, 1)), 0
    ) / recentSessions.length;
    
    const olderAvgConfidence = olderSessions.reduce((sum, s) => 
      sum + (s.decisions.reduce((dSum, d) => dSum + d.confidence, 0) / Math.max(s.decisions.length, 1)), 0
    ) / olderSessions.length;

    if (recentAvgConfidence > olderAvgConfidence + 5) {
      keyTrends.push('Decision confidence improving over time');
    } else if (olderAvgConfidence > recentAvgConfidence + 5) {
      keyTrends.push('Decision confidence declining - review decision processes');
    }
  }

  if (averageConfidence > 80) {
    keyTrends.push('High-quality decisions with strong confidence levels');
  } else if (averageConfidence < 60) {
    keyTrends.push('Low decision confidence - consider additional data sources');
  }

  const avgSessionLength = sessions.filter(s => s.endTime).length > 0
    ? sessions.filter(s => s.endTime).reduce((sum, session) => {
        const duration = session.endTime!.getTime() - session.startTime.getTime();
        return sum + duration;
      }, 0) / sessions.filter(s => s.endTime).length / (1000 * 60) // Convert to minutes
    : 0;

  if (avgSessionLength > 90) {
    keyTrends.push('Extended session durations indicate thorough analysis');
  } else if (avgSessionLength < 30) {
    keyTrends.push('Short session durations - consider deeper analysis');
  }

  // Generate recommendations
  const recommendations = [];
  
  if (averageConfidence < 70) {
    recommendations.push('Consider integrating additional data sources to improve decision confidence');
  }
  
  if (totalDecisions / sessions.length < 2) {
    recommendations.push('Increase decision output per session to maximize value');
  }
  
  if (sessions.some(s => s.agents.length < 3)) {
    recommendations.push('Utilize all available AI agents for comprehensive analysis');
  }

  return {
    totalDecisions,
    averageConfidence,
    topPerformingAgent,
    keyTrends: keyTrends.length > 0 ? keyTrends : ['Stable performance across all metrics'],
    recommendations: recommendations.length > 0 ? recommendations : ['Continue current best practices']
  };
}

async function generateExport(format: 'csv' | 'pdf' | 'excel', data: ExportableData) {
  switch (format) {
    case 'csv':
      const csvContent = AnalyticsExportService.generateCSV(data);
      return {
        content: csvContent,
        filename: `analytics_export_${data.metadata.exportDate.toISOString().split('T')[0]}.csv`,
        mimeType: 'text/csv',
        encoding: 'utf-8'
      };

    case 'pdf':
      const pdfData = AnalyticsExportService.generatePDFData(data);
      return {
        content: pdfData,
        filename: `analytics_report_${data.metadata.exportDate.toISOString().split('T')[0]}.pdf`,
        mimeType: 'application/pdf',
        renderRequired: true // Frontend needs to render this with a PDF library
      };

    case 'excel':
      const excelData = AnalyticsExportService.generateExcelData(data);
      return {
        content: excelData,
        filename: `${excelData.workbookName}.xlsx`,
        mimeType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        renderRequired: true // Frontend needs to render this with an Excel library
      };

    default:
      throw new Error(`Unsupported export format: ${format}`);
  }
}

function extractInsights(content: string): string[] {
  // Simple insight extraction - look for patterns that indicate insights
  const insights = [];
  
  // Look for recommendation patterns
  const recommendationPatterns = [
    /I recommend|suggest|propose/gi,
    /Based on.*analysis/gi,
    /The data shows|indicates/gi,
    /Key finding/gi
  ];

  for (const pattern of recommendationPatterns) {
    const matches = content.match(pattern);
    if (matches) {
      // Extract the sentence containing the insight
      const sentences = content.split(/[.!?]+/);
      for (const sentence of sentences) {
        if (pattern.test(sentence) && sentence.length > 20) {
          insights.push(sentence.trim());
          break;
        }
      }
    }
  }

  return insights.slice(0, 2); // Max 2 insights per message
}

export async function GET() {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Get export capabilities and recent exports
    const exportInfo = {
      supportedFormats: ['csv', 'pdf', 'excel'],
      maxDateRange: 365, // days
      features: {
        csv: ['session_data', 'decision_analysis', 'agent_performance'],
        pdf: ['executive_summary', 'charts', 'detailed_analysis', 'recommendations'],
        excel: ['multiple_sheets', 'pivot_tables', 'charts', 'formulas']
      },
      sampleDateRanges: [
        { label: 'Last 7 days', days: 7 },
        { label: 'Last 30 days', days: 30 },
        { label: 'Last quarter', days: 90 },
        { label: 'Last year', days: 365 }
      ]
    };

    return NextResponse.json({
      success: true,
      data: exportInfo,
      message: 'Export capabilities retrieved successfully'
    });

  } catch (error) {
    console.error('Export info error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to get export information' },
      { status: 500 }
    );
  }
}
