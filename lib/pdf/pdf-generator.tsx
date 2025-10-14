/**
 * PDF Generation Service
 * Generates professional PDF reports from boardroom sessions
 */

import { Document, Page, Text, View, StyleSheet, pdf } from '@react-pdf/renderer';
import { ExecutiveSummaryPDF } from './executive-summary-template';

// PDF Styles
const styles = StyleSheet.create({
  page: {
    padding: 40,
    fontSize: 11,
    fontFamily: 'Helvetica',
  },
  header: {
    marginBottom: 20,
    paddingBottom: 10,
    borderBottom: '2 solid #2563eb',
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 5,
  },
  subtitle: {
    fontSize: 12,
    color: '#64748b',
    marginBottom: 3,
  },
  section: {
    marginTop: 15,
    marginBottom: 10,
  },
  sectionTitle: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#1e293b',
    marginBottom: 8,
    paddingBottom: 4,
    borderBottom: '1 solid #e2e8f0',
  },
  text: {
    fontSize: 10,
    lineHeight: 1.5,
    color: '#334155',
  },
  metadata: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 15,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
  },
  metadataItem: {
    fontSize: 9,
    color: '#64748b',
  },
  messageContainer: {
    marginBottom: 12,
    padding: 10,
    backgroundColor: '#f8fafc',
    borderRadius: 4,
    borderLeft: '3 solid #3b82f6',
  },
  agentName: {
    fontSize: 11,
    fontWeight: 'bold',
    color: '#1e40af',
    marginBottom: 4,
  },
  messageText: {
    fontSize: 10,
    lineHeight: 1.6,
    color: '#475569',
  },
  confidenceBadge: {
    fontSize: 9,
    color: '#16a34a',
    fontWeight: 'bold',
    marginTop: 5,
  },
  reasoningSection: {
    marginTop: 8,
    padding: 8,
    backgroundColor: '#fef3c7',
    borderRadius: 3,
  },
  reasoningTitle: {
    fontSize: 9,
    fontWeight: 'bold',
    color: '#92400e',
    marginBottom: 4,
  },
  reasoningText: {
    fontSize: 8,
    color: '#78350f',
    lineHeight: 1.4,
  },
  footer: {
    position: 'absolute',
    bottom: 30,
    left: 40,
    right: 40,
    textAlign: 'center',
    fontSize: 8,
    color: '#94a3b8',
    paddingTop: 10,
    borderTop: '1 solid #e2e8f0',
  },
  pageNumber: {
    fontSize: 8,
    color: '#94a3b8',
  },
});

// Types
export interface PDFSessionData {
  sessionId: string;
  sessionName: string;
  scenarioName?: string;
  scenarioDescription?: string;
  status: string;
  createdAt: Date;
  participants: string[];
  messages: Array<{
    id: string;
    agentType: string;
    content: string;
    timestamp: Date;
    confidence?: number;
    reasoning?: {
      keyFactors?: string[];
      risks?: string[];
      assumptions?: string[];
      dataSources?: string[];
    };
    documentMetadata?: {
      documentsUsed: number;
      citedDocuments: number[];
    };
  }>;
}

// PDF Document Component
const SessionReportPDF = ({ data }: { data: PDFSessionData }) => (
  <Document>
    <Page size="A4" style={styles.page}>
      {/* Header */}
      <View style={styles.header}>
        <Text style={styles.title}>Boardroom Session Report</Text>
        <Text style={styles.subtitle}>{data.sessionName}</Text>
        {data.scenarioName && (
          <Text style={styles.subtitle}>Scenario: {data.scenarioName}</Text>
        )}
      </View>

      {/* Metadata */}
      <View style={styles.metadata}>
        <View>
          <Text style={styles.metadataItem}>Session ID: {data.sessionId}</Text>
          <Text style={styles.metadataItem}>
            Date: {new Date(data.createdAt).toLocaleDateString('en-US', {
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </Text>
        </View>
        <View>
          <Text style={styles.metadataItem}>Status: {data.status}</Text>
          <Text style={styles.metadataItem}>
            Participants: {data.participants.length} agents
          </Text>
        </View>
      </View>

      {/* Scenario Description */}
      {data.scenarioDescription && (
        <View style={styles.section}>
          <Text style={styles.sectionTitle}>Scenario Overview</Text>
          <Text style={styles.text}>{data.scenarioDescription}</Text>
        </View>
      )}

      {/* Executive Summary */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Executive Summary</Text>
        <Text style={styles.text}>
          This boardroom session involved {data.participants.join(', ')} agents
          discussing {data.scenarioName || 'strategic matters'}. A total of{' '}
          {data.messages.length} messages were exchanged, providing comprehensive
          analysis and recommendations.
        </Text>
      </View>

      {/* Messages/Discussion */}
      <View style={styles.section}>
        <Text style={styles.sectionTitle}>Discussion Transcript</Text>
        {data.messages.slice(0, 10).map((message) => (
          <View key={message.id} style={styles.messageContainer}>
            <Text style={styles.agentName}>
              {message.agentType.toUpperCase()}
            </Text>
            <Text style={styles.messageText}>
              {message.content.substring(0, 500)}
              {message.content.length > 500 ? '...' : ''}
            </Text>
            
            {message.confidence !== undefined && (
              <Text style={styles.confidenceBadge}>
                Confidence: {Math.round(message.confidence * 100)}%
              </Text>
            )}

            {message.reasoning && (
              <View style={styles.reasoningSection}>
                <Text style={styles.reasoningTitle}>Reasoning:</Text>
                {message.reasoning.keyFactors && message.reasoning.keyFactors.length > 0 && (
                  <Text style={styles.reasoningText}>
                    • {message.reasoning.keyFactors.join('\n• ')}
                  </Text>
                )}
              </View>
            )}
          </View>
        ))}
        {data.messages.length > 10 && (
          <Text style={styles.text}>
            ... and {data.messages.length - 10} more messages
          </Text>
        )}
      </View>

      {/* Footer */}
      <View style={styles.footer}>
        <Text>
          Generated by Business Assistance AI Agents Platform | {new Date().toLocaleDateString()}
        </Text>
      </View>
    </Page>
  </Document>
);

/**
 * Generate PDF buffer from session data
 */
export async function generateSessionPDF(data: PDFSessionData): Promise<Buffer> {
  const asPdf = pdf(<SessionReportPDF data={data} />);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate executive summary PDF (2-3 pages, high-level overview)
 */
export async function generateExecutiveSummaryPDF(data: PDFSessionData): Promise<Buffer> {
  const asPdf = pdf(<ExecutiveSummaryPDF data={data} />);
  const blob = await asPdf.toBlob();
  const arrayBuffer = await blob.arrayBuffer();
  return Buffer.from(arrayBuffer);
}

/**
 * Generate filename for PDF export
 */
export function generatePDFFilename(sessionName: string, sessionId: string, type: string = 'report'): string {
  const sanitizedName = sessionName
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 50);
  const date = new Date().toISOString().split('T')[0];
  return `${type}-${sanitizedName}-${sessionId.substring(0, 8)}-${date}.pdf`;
}
