/**
 * Chart Generator for PDF Reports
 * Generates chart data structures for PDF embedding
 */

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

export interface ConfidenceTrendData {
  round: number;
  confidence: number;
  agent: string;
}

export interface AgentContributionData {
  agent: string;
  messageCount: number;
  percentage: number;
  color: string;
}

/**
 * Calculate confidence trend over rounds
 */
export function calculateConfidenceTrend(
  messages: Array<{ agentType: string; confidence?: number; timestamp: Date }>
): ConfidenceTrendData[] {
  const trends: ConfidenceTrendData[] = [];
  let roundNumber = 1;
  
  // Group messages by approximate rounds (every 4 messages = 1 round)
  const roundSize = 4;
  for (let i = 0; i < messages.length; i += roundSize) {
    const roundMessages = messages.slice(i, i + roundSize);
    
    roundMessages.forEach((msg) => {
      if (msg.confidence !== undefined) {
        trends.push({
          round: roundNumber,
          confidence: msg.confidence,
          agent: msg.agentType,
        });
      }
    });
    
    roundNumber++;
  }
  
  return trends;
}

/**
 * Calculate agent contribution distribution
 */
export function calculateAgentContribution(
  messages: Array<{ agentType: string }>
): AgentContributionData[] {
  const agentColors: Record<string, string> = {
    ceo: '#3b82f6',
    cfo: '#10b981',
    cto: '#8b5cf6',
    hr: '#f97316',
  };

  // Count messages per agent
  const counts: Record<string, number> = {};
  let totalAgentMessages = 0;

  messages.forEach((msg) => {
    const agent = msg.agentType.toLowerCase();
    if (agent !== 'user' && agent !== 'system') {
      counts[agent] = (counts[agent] || 0) + 1;
      totalAgentMessages++;
    }
  });

  // Calculate percentages
  return Object.entries(counts).map(([agent, count]) => ({
    agent: agent.toUpperCase(),
    messageCount: count,
    percentage: Math.round((count / totalAgentMessages) * 100),
    color: agentColors[agent] || '#64748b',
  }));
}

/**
 * Calculate average confidence by agent
 */
export function calculateAverageConfidenceByAgent(
  messages: Array<{ agentType: string; confidence?: number }>
): Array<{ agent: string; avgConfidence: number; color: string }> {
  const agentColors: Record<string, string> = {
    ceo: '#3b82f6',
    cfo: '#10b981',
    cto: '#8b5cf6',
    hr: '#f97316',
  };

  const agentData: Record<string, { total: number; count: number }> = {};

  messages.forEach((msg) => {
    const agent = msg.agentType.toLowerCase();
    if (agent !== 'user' && agent !== 'system' && msg.confidence !== undefined) {
      if (!agentData[agent]) {
        agentData[agent] = { total: 0, count: 0 };
      }
      agentData[agent].total += msg.confidence;
      agentData[agent].count += 1;
    }
  });

  return Object.entries(agentData).map(([agent, data]) => ({
    agent: agent.toUpperCase(),
    avgConfidence: Math.round((data.total / data.count) * 100),
    color: agentColors[agent] || '#64748b',
  }));
}

/**
 * Generate summary statistics
 */
export function generateSessionStatistics(messages: Array<{
  agentType: string;
  confidence?: number;
  reasoning?: {
    keyFactors?: string[];
    risks?: string[];
  };
}>) {
  const agentMessages = messages.filter(
    (m) => m.agentType !== 'user' && m.agentType !== 'system'
  );

  const confidences = agentMessages
    .map((m) => m.confidence)
    .filter((c): c is number => c !== undefined);

  const avgConfidence = confidences.length > 0
    ? confidences.reduce((sum, c) => sum + c, 0) / confidences.length
    : 0;

  const highConfidenceCount = confidences.filter((c) => c >= 0.8).length;
  const mediumConfidenceCount = confidences.filter((c) => c >= 0.6 && c < 0.8).length;
  const lowConfidenceCount = confidences.filter((c) => c < 0.6).length;

  const totalKeyFactors = agentMessages.reduce(
    (sum, m) => sum + (m.reasoning?.keyFactors?.length || 0),
    0
  );

  const totalRisks = agentMessages.reduce(
    (sum, m) => sum + (m.reasoning?.risks?.length || 0),
    0
  );

  return {
    totalMessages: messages.length,
    agentMessages: agentMessages.length,
    userMessages: messages.filter((m) => m.agentType === 'user').length,
    averageConfidence: Math.round(avgConfidence * 100),
    highConfidenceCount,
    mediumConfidenceCount,
    lowConfidenceCount,
    totalKeyFactors,
    totalRisks,
    uniqueAgents: [...new Set(agentMessages.map((m) => m.agentType))].length,
  };
}

/**
 * Generate text-based chart for PDF (ASCII-style)
 */
export function generateTextChart(data: ChartDataPoint[], maxWidth: number = 40): string[] {
  const maxValue = Math.max(...data.map((d) => d.value));
  const lines: string[] = [];

  data.forEach((point) => {
    const barLength = Math.round((point.value / maxValue) * maxWidth);
    const bar = '█'.repeat(barLength);
    const percentage = Math.round((point.value / maxValue) * 100);
    lines.push(`${point.label.padEnd(12)} ${bar} ${percentage}%`);
  });

  return lines;
}
