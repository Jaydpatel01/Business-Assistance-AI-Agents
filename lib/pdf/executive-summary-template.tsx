/**
 * Executive Summary PDF Template
 * Professional 2-3 page summary report
 */

import { Document, Page, Text, View, StyleSheet } from '@react-pdf/renderer';
import { PDFSessionData } from './pdf-generator';
import {
  generateSessionStatistics,
  calculateAgentContribution,
  calculateAverageConfidenceByAgent,
  generateTextChart,
} from '../charts/chart-generator';

const styles = StyleSheet.create({
  page: {
    padding: 50,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  coverHeader: {
    marginBottom: 40,
    paddingBottom: 20,
    borderBottom: '3 solid #2563eb',
  },
  coverTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 10,
  },
  coverSubtitle: {
    fontSize: 16,
    color: '#64748b',
    marginBottom: 5,
  },
  coverMetadata: {
    fontSize: 12,
    color: '#94a3b8',
    marginTop: 15,
  },
  section: {
    marginBottom: 20,
  },
  sectionTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 12,
    paddingBottom: 6,
    borderBottom: '2 solid #e2e8f0',
  },
  subsectionTitle: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#475569',
    marginBottom: 8,
    marginTop: 10,
  },
  text: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#334155',
    marginBottom: 6,
  },
  bulletPoint: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#475569',
    marginLeft: 15,
    marginBottom: 4,
  },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 15,
    marginBottom: 15,
  },
  statBox: {
    width: '30%',
    padding: 12,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3 solid #3b82f6',
  },
  statLabel: {
    fontSize: 9,
    color: '#64748b',
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#1e40af',
  },
  chartContainer: {
    marginTop: 10,
    marginBottom: 15,
    padding: 15,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  chartLine: {
    fontSize: 9,
    fontFamily: 'Courier',
    color: '#334155',
    marginBottom: 3,
  },
  highlightBox: {
    padding: 12,
    backgroundColor: '#dbeafe',
    borderRadius: 4,
    borderLeft: '4 solid #2563eb',
    marginBottom: 12,
  },
  highlightText: {
    fontSize: 10,
    color: '#1e40af',
    lineHeight: 1.5,
  },
  keyInsight: {
    padding: 10,
    backgroundColor: '#fef3c7',
    borderRadius: 4,
    marginBottom: 8,
  },
  keyInsightText: {
    fontSize: 9,
    color: '#78350f',
    lineHeight: 1.5,
  },
  recommendation: {
    padding: 10,
    backgroundColor: '#dcfce7',
    borderRadius: 4,
    marginBottom: 8,
  },
  recommendationText: {
    fontSize: 10,
    color: '#14532d',
    lineHeight: 1.5,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 50,
    right: 50,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTop: '1 solid #e2e8f0',
  },
  pageNumber: {
    position: 'absolute',
    bottom: 30,
    right: 50,
    fontSize: 9,
    color: '#64748b',
  },
});

export const ExecutiveSummaryPDF = ({ data }: { data: PDFSessionData }) => {
  const stats = generateSessionStatistics(data.messages);
  const agentContribution = calculateAgentContribution(data.messages);
  const avgConfidenceByAgent = calculateAverageConfidenceByAgent(data.messages);
  const chartLines = generateTextChart(
    agentContribution.map((a) => ({ label: a.agent, value: a.messageCount }))
  );

  // Extract key insights from messages
  const allKeyFactors = data.messages
    .flatMap((m) => m.reasoning?.keyFactors || [])
    .slice(0, 5);

  const allRisks = data.messages
    .flatMap((m) => m.reasoning?.risks || [])
    .slice(0, 3);

  // Generate recommendations based on confidence levels
  const recommendations = [];
  if (stats.averageConfidence >= 80) {
    recommendations.push('High confidence across all agent perspectives. Proceed with implementation.');
  } else if (stats.averageConfidence >= 60) {
    recommendations.push('Moderate confidence. Consider additional data gathering before proceeding.');
  } else {
    recommendations.push('Low confidence detected. Further analysis and risk mitigation required.');
  }

  if (stats.totalRisks > 5) {
    recommendations.push('Multiple risks identified. Develop comprehensive mitigation strategies.');
  }

  return (
    <Document>
      {/* Cover Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.coverHeader}>
          <Text style={styles.coverTitle}>Executive Summary</Text>
          <Text style={styles.coverSubtitle}>{data.sessionName}</Text>
          {data.scenarioName && (
            <Text style={styles.coverSubtitle}>Scenario: {data.scenarioName}</Text>
          )}
          <Text style={styles.coverMetadata}>
            Generated on {new Date().toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
          <Text style={styles.coverMetadata}>Session ID: {data.sessionId}</Text>
        </View>

        {/* Key Statistics */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Session Overview</Text>
          <View style={styles.statsGrid}>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Total Messages</Text>
              <Text style={styles.statValue}>{stats.totalMessages}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Agent Responses</Text>
              <Text style={styles.statValue}>{stats.agentMessages}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Avg Confidence</Text>
              <Text style={styles.statValue}>{stats.averageConfidence}%</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>High Confidence</Text>
              <Text style={styles.statValue}>{stats.highConfidenceCount}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Key Factors</Text>
              <Text style={styles.statValue}>{stats.totalKeyFactors}</Text>
            </View>
            <View style={styles.statBox}>
              <Text style={styles.statLabel}>Risks Identified</Text>
              <Text style={styles.statValue}>{stats.totalRisks}</Text>
            </View>
          </View>
        </View>

        {/* Scenario Context */}
        {data.scenarioDescription && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Scenario Context</Text>
            <View style={styles.highlightBox}>
              <Text style={styles.highlightText}>{data.scenarioDescription}</Text>
            </View>
          </View>
        )}

        {/* Executive Insights */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Executive Insights</Text>
          <Text style={styles.text}>
            This boardroom session engaged {stats.uniqueAgents} AI executive agents in a
            comprehensive analysis of {data.scenarioName || 'strategic matters'}. The
            discussion generated {stats.agentMessages} agent responses with an average
            confidence level of {stats.averageConfidence}%.
          </Text>
          
          {stats.highConfidenceCount > 0 && (
            <Text style={styles.text}>
              {stats.highConfidenceCount} high-confidence recommendations were provided,
              indicating strong alignment and data-backed decision-making.
            </Text>
          )}

          {stats.totalRisks > 0 && (
            <Text style={styles.text}>
              The agents identified {stats.totalRisks} potential risks that require
              consideration in the decision-making process.
            </Text>
          )}
        </View>

        <View style={styles.footer}>
          <Text>Business Assistance AI Agents Platform - Confidential</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* Analysis Page */}
      <Page size="A4" style={styles.page}>
        {/* Agent Contribution */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Contribution Analysis</Text>
          <View style={styles.chartContainer}>
            {chartLines.map((line, index) => (
              <Text key={index} style={styles.chartLine}>
                {line}
              </Text>
            ))}
          </View>
          
          {avgConfidenceByAgent.length > 0 && (
            <>
              <Text style={styles.subsectionTitle}>Average Confidence by Agent</Text>
              {avgConfidenceByAgent.map((agent) => (
                <Text key={agent.agent} style={styles.text}>
                  • {agent.agent}: {agent.avgConfidence}% confidence
                </Text>
              ))}
            </>
          )}
        </View>

        {/* Key Findings */}
        {allKeyFactors.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Key Factors Identified</Text>
            {allKeyFactors.map((factor, index) => (
              <View key={index} style={styles.keyInsight}>
                <Text style={styles.keyInsightText}>• {factor}</Text>
              </View>
            ))}
          </View>
        )}

        {/* Risks */}
        {allRisks.length > 0 && (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Risks & Considerations</Text>
            {allRisks.map((risk, index) => (
              <Text key={index} style={styles.bulletPoint}>
                • {risk}
              </Text>
            ))}
          </View>
        )}

        {/* Recommendations */}
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Recommendations</Text>
          {recommendations.map((rec, index) => (
            <View key={index} style={styles.recommendation}>
              <Text style={styles.recommendationText}>{index + 1}. {rec}</Text>
            </View>
          ))}
        </View>

        <View style={styles.footer}>
          <Text>Business Assistance AI Agents Platform - Confidential</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>

      {/* Top Insights Page */}
      <Page size="A4" style={styles.page}>
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Agent Perspectives Summary</Text>
          
          {data.participants.map((agent) => {
            const agentMessages = data.messages.filter(
              (m) => m.agentType.toLowerCase() === agent.toLowerCase()
            );
            
            if (agentMessages.length === 0) return null;

            const firstMessage = agentMessages[0];
            const avgConf = agentMessages
              .filter((m) => m.confidence !== undefined)
              .reduce((sum, m, _, arr) => sum + (m.confidence || 0) / arr.length, 0);

            return (
              <View key={agent} style={{ marginBottom: 15 }}>
                <Text style={styles.subsectionTitle}>{agent.toUpperCase()}</Text>
                <Text style={styles.text}>
                  Messages: {agentMessages.length} | Avg Confidence:{' '}
                  {Math.round(avgConf * 100)}%
                </Text>
                <Text style={styles.text}>
                  {firstMessage.content.substring(0, 300)}
                  {firstMessage.content.length > 300 ? '...' : ''}
                </Text>
              </View>
            );
          })}
        </View>

        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Next Steps</Text>
          <Text style={styles.bulletPoint}>
            • Review the detailed transcript for complete agent perspectives
          </Text>
          <Text style={styles.bulletPoint}>
            • Address identified risks with mitigation strategies
          </Text>
          <Text style={styles.bulletPoint}>
            • Proceed with implementation based on confidence levels
          </Text>
          <Text style={styles.bulletPoint}>
            • Schedule follow-up session if additional analysis needed
          </Text>
        </View>

        <View style={styles.footer}>
          <Text>Business Assistance AI Agents Platform - Confidential</Text>
        </View>
        <Text style={styles.pageNumber} render={({ pageNumber }) => `Page ${pageNumber}`} fixed />
      </Page>
    </Document>
  );
};
