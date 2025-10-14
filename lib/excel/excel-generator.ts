/**
 * Excel Export Service
 * Generates Excel workbooks with multiple worksheets
 */

import ExcelJS from 'exceljs';
import { PDFSessionData } from '../pdf/pdf-generator';
import { generateSessionStatistics, calculateAgentContribution } from '../charts/chart-generator';

/**
 * Generate Excel workbook from session data
 */
export async function generateSessionExcel(data: PDFSessionData): Promise<Buffer> {
  const workbook = new ExcelJS.Workbook();
  
  // Set workbook properties
  workbook.creator = 'Business Assistance AI Agents';
  workbook.created = new Date();
  workbook.modified = new Date();

  // Calculate statistics
  const stats = generateSessionStatistics(data.messages);
  const agentContribution = calculateAgentContribution(data.messages);

  // Sheet 1: Session Overview
  const overviewSheet = workbook.addWorksheet('Overview', {
    properties: { tabColor: { argb: 'FF3B82F6' } }
  });

  // Title
  overviewSheet.mergeCells('A1:D1');
  const titleCell = overviewSheet.getCell('A1');
  titleCell.value = 'Boardroom Session Report';
  titleCell.font = { size: 18, bold: true, color: { argb: 'FF1E40AF' } };
  titleCell.alignment = { horizontal: 'center', vertical: 'middle' };
  overviewSheet.getRow(1).height = 30;

  // Session metadata
  overviewSheet.addRow([]);
  overviewSheet.addRow(['Session Name:', data.sessionName]);
  overviewSheet.addRow(['Session ID:', data.sessionId]);
  overviewSheet.addRow(['Scenario:', data.scenarioName || 'N/A']);
  overviewSheet.addRow(['Status:', data.status]);
  overviewSheet.addRow(['Date:', data.createdAt.toLocaleDateString()]);
  overviewSheet.addRow([]);

  // Statistics header
  overviewSheet.addRow(['Session Statistics']);
  overviewSheet.getCell('A9').font = { size: 14, bold: true };
  overviewSheet.addRow([]);

  // Statistics table
  const statsData = [
    ['Metric', 'Value'],
    ['Total Messages', stats.totalMessages],
    ['Agent Messages', stats.agentMessages],
    ['User Messages', stats.userMessages],
    ['Average Confidence', `${stats.averageConfidence}%`],
    ['High Confidence Count', stats.highConfidenceCount],
    ['Medium Confidence Count', stats.mediumConfidenceCount],
    ['Low Confidence Count', stats.lowConfidenceCount],
    ['Key Factors Identified', stats.totalKeyFactors],
    ['Risks Identified', stats.totalRisks],
    ['Unique Agents', stats.uniqueAgents],
  ];

  statsData.forEach((row) => {
    const excelRow = overviewSheet.addRow(row);
    if (row[0] === 'Metric') {
      excelRow.font = { bold: true };
      excelRow.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFE2E8F0' }
      };
    }
  });

  // Format columns
  overviewSheet.getColumn(1).width = 25;
  overviewSheet.getColumn(2).width = 20;
  
  // Add borders to stats table
  overviewSheet.eachRow((row, rowNumber) => {
    if (rowNumber >= 11 && rowNumber <= 10 + statsData.length) {
      row.eachCell((cell) => {
        cell.border = {
          top: { style: 'thin' },
          left: { style: 'thin' },
          bottom: { style: 'thin' },
          right: { style: 'thin' }
        };
      });
    }
  });

  // Sheet 2: Agent Contributions
  const agentsSheet = workbook.addWorksheet('Agent Analysis', {
    properties: { tabColor: { argb: 'FF10B981' } }
  });

  agentsSheet.mergeCells('A1:D1');
  agentsSheet.getCell('A1').value = 'Agent Contribution Analysis';
  agentsSheet.getCell('A1').font = { size: 16, bold: true };
  agentsSheet.getCell('A1').alignment = { horizontal: 'center' };
  agentsSheet.getRow(1).height = 25;

  agentsSheet.addRow([]);
  agentsSheet.addRow(['Agent', 'Message Count', 'Percentage', 'Status']);
  agentsSheet.getRow(3).font = { bold: true };
  agentsSheet.getRow(3).fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };

  agentContribution.forEach((agent) => {
    const row = agentsSheet.addRow([
      agent.agent,
      agent.messageCount,
      `${agent.percentage}%`,
      agent.percentage > 30 ? 'High' : agent.percentage > 20 ? 'Medium' : 'Low'
    ]);
    
    // Color code status
    const statusCell = row.getCell(4);
    if (agent.percentage > 30) {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFD1FAE5' }
      };
    } else if (agent.percentage > 20) {
      statusCell.fill = {
        type: 'pattern',
        pattern: 'solid',
        fgColor: { argb: 'FFFEF3C7' }
      };
    }
  });

  agentsSheet.getColumn(1).width = 15;
  agentsSheet.getColumn(2).width = 15;
  agentsSheet.getColumn(3).width = 15;
  agentsSheet.getColumn(4).width = 15;

  // Sheet 3: Messages Transcript
  const messagesSheet = workbook.addWorksheet('Transcript', {
    properties: { tabColor: { argb: 'FF8B5CF6' } }
  });

  messagesSheet.mergeCells('A1:E1');
  messagesSheet.getCell('A1').value = 'Discussion Transcript';
  messagesSheet.getCell('A1').font = { size: 16, bold: true };
  messagesSheet.getCell('A1').alignment = { horizontal: 'center' };
  messagesSheet.getRow(1).height = 25;

  messagesSheet.addRow([]);
  const headerRow = messagesSheet.addRow(['Timestamp', 'Agent', 'Message', 'Confidence', 'Key Factors']);
  headerRow.font = { bold: true };
  headerRow.fill = {
    type: 'pattern',
    pattern: 'solid',
    fgColor: { argb: 'FFE2E8F0' }
  };

  data.messages.slice(0, 100).forEach((msg) => {
    const keyFactors = msg.reasoning?.keyFactors?.join('; ') || 'N/A';
    const confidence = msg.confidence !== undefined 
      ? `${Math.round(msg.confidence * 100)}%` 
      : 'N/A';

    const row = messagesSheet.addRow([
      new Date(msg.timestamp).toLocaleString(),
      msg.agentType,
      msg.content.substring(0, 500), // Limit content length
      confidence,
      keyFactors
    ]);

    // Wrap text in message column
    row.getCell(3).alignment = { wrapText: true };
    
    // Color code confidence
    const confCell = row.getCell(4);
    if (msg.confidence !== undefined) {
      if (msg.confidence >= 0.8) {
        confCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFD1FAE5' }
        };
      } else if (msg.confidence >= 0.6) {
        confCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFEF3C7' }
        };
      } else {
        confCell.fill = {
          type: 'pattern',
          pattern: 'solid',
          fgColor: { argb: 'FFFECACA' }
        };
      }
    }
  });

  messagesSheet.getColumn(1).width = 20;
  messagesSheet.getColumn(2).width = 12;
  messagesSheet.getColumn(3).width = 60;
  messagesSheet.getColumn(4).width = 12;
  messagesSheet.getColumn(5).width = 40;

  // Sheet 4: Key Insights
  const insightsSheet = workbook.addWorksheet('Insights', {
    properties: { tabColor: { argb: 'FFF97316' } }
  });

  insightsSheet.mergeCells('A1:B1');
  insightsSheet.getCell('A1').value = 'Key Insights & Risks';
  insightsSheet.getCell('A1').font = { size: 16, bold: true };
  insightsSheet.getCell('A1').alignment = { horizontal: 'center' };
  insightsSheet.getRow(1).height = 25;

  insightsSheet.addRow([]);
  insightsSheet.addRow(['Key Factors']);
  insightsSheet.getCell('A3').font = { size: 14, bold: true };

  const allKeyFactors = data.messages
    .flatMap((m) => m.reasoning?.keyFactors || [])
    .slice(0, 20);

  allKeyFactors.forEach((factor, index) => {
    const row = insightsSheet.addRow([`${index + 1}.`, factor]);
    row.getCell(2).alignment = { wrapText: true };
  });

  insightsSheet.addRow([]);
  insightsSheet.addRow(['Identified Risks']);
  insightsSheet.getCell(`A${insightsSheet.rowCount}`).font = { size: 14, bold: true };

  const allRisks = data.messages
    .flatMap((m) => m.reasoning?.risks || [])
    .slice(0, 15);

  allRisks.forEach((risk, index) => {
    const row = insightsSheet.addRow([`${index + 1}.`, risk]);
    row.getCell(2).alignment = { wrapText: true };
    row.getCell(2).fill = {
      type: 'pattern',
      pattern: 'solid',
      fgColor: { argb: 'FFFEF3C7' }
    };
  });

  insightsSheet.getColumn(1).width = 5;
  insightsSheet.getColumn(2).width = 80;

  // Generate buffer
  const buffer = await workbook.xlsx.writeBuffer();
  return Buffer.from(buffer);
}

/**
 * Generate filename for Excel export
 */
export function generateExcelFilename(sessionName: string, sessionId: string): string {
  const sanitizedName = sessionName
    .replace(/[^a-z0-9]/gi, '-')
    .toLowerCase()
    .substring(0, 50);
  const date = new Date().toISOString().split('T')[0];
  return `session-report-${sanitizedName}-${sessionId.substring(0, 8)}-${date}.xlsx`;
}
