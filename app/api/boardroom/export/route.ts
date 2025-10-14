/**
 * Boardroom Session Export API
 * POST /api/boardroom/export - Generate PDF/CSV reports from sessions
 */

import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { 
  generateSessionPDF, 
  generateExecutiveSummaryPDF,
  generatePDFFilename, 
  type PDFSessionData 
} from '@/lib/pdf/pdf-generator';
import { generateSessionExcel, generateExcelFilename } from '@/lib/excel/excel-generator';
import { z } from 'zod';

const ExportRequestSchema = z.object({
  sessionId: z.string(),
  format: z.enum(['pdf', 'csv', 'json', 'excel']).default('pdf'),
  reportType: z.enum(['detailed', 'executive', 'transcript']).default('detailed'),
  options: z.object({
    includeTranscript: z.boolean().default(true),
    includeReasoning: z.boolean().default(true),
    includeCitations: z.boolean().default(true),
    maxMessages: z.number().default(50),
  }).optional(),
});

export async function POST(request: NextRequest) {
  try {
    // Authentication
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = ExportRequestSchema.parse(body);

    console.log(`📄 Generating ${validatedData.format.toUpperCase()} export for session ${validatedData.sessionId}`);

    // Fetch session data
    const boardroomSession = await prisma.boardroomSession.findUnique({
      where: { id: validatedData.sessionId },
      include: {
        scenario: true,
        messages: {
          orderBy: { createdAt: 'asc' },
          take: validatedData.options?.maxMessages || 50,
          include: {
            participant: {
              include: {
                user: true,
              },
            },
          },
        },
        participants: {
          include: {
            user: true,
          },
        },
      },
    });

    if (!boardroomSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found' },
        { status: 404 }
      );
    }

    // Verify user has access to this session
    const userParticipant = boardroomSession.participants.find(
      (p) => p.userId === session.user.id
    );

    if (!userParticipant) {
      return NextResponse.json(
        { success: false, error: 'Access denied to this session' },
        { status: 403 }
      );
    }

    // Process messages and extract metadata
    const messages = boardroomSession.messages.map((msg) => {
      let metadata: Record<string, unknown> = {};
      try {
        metadata = msg.metadata ? JSON.parse(msg.metadata as string) : {};
      } catch (e) {
        console.error('Error parsing message metadata:', e);
      }

      return {
        id: msg.id,
        agentType: msg.agentType || 'user',
        content: msg.content,
        timestamp: msg.createdAt,
        confidence: metadata.confidence as number | undefined,
        reasoning: metadata.reasoning as PDFSessionData['messages'][0]['reasoning'],
        documentMetadata: metadata.documentMetadata as PDFSessionData['messages'][0]['documentMetadata'],
      };
    });

    // Get unique agent types
    const participants = [...new Set(messages.map((m) => m.agentType))].filter(
      (type) => type !== 'user' && type !== 'system'
    );

    const pdfData: PDFSessionData = {
      sessionId: boardroomSession.id,
      sessionName: boardroomSession.name || 'Boardroom Session',
      scenarioName: boardroomSession.scenario?.name,
      scenarioDescription: boardroomSession.scenario?.description || undefined,
      status: boardroomSession.status,
      createdAt: boardroomSession.createdAt,
      participants,
      messages,
    };

    // Generate export based on format
    switch (validatedData.format) {
      case 'pdf': {
        let pdfBuffer: Buffer;
        let filename: string;

        // Generate different PDF types based on reportType
        switch (validatedData.reportType) {
          case 'executive':
            pdfBuffer = await generateExecutiveSummaryPDF(pdfData);
            filename = generatePDFFilename(pdfData.sessionName, pdfData.sessionId, 'executive-summary');
            break;
          case 'detailed':
          case 'transcript':
          default:
            pdfBuffer = await generateSessionPDF(pdfData);
            filename = generatePDFFilename(pdfData.sessionName, pdfData.sessionId, 'session-report');
            break;
        }

        return new NextResponse(Buffer.from(pdfBuffer), {
          headers: {
            'Content-Type': 'application/pdf',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': pdfBuffer.length.toString(),
          },
        });
      }

      case 'json': {
        const filename = `session-${pdfData.sessionId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.json`;
        
        return new NextResponse(JSON.stringify(pdfData, null, 2), {
          headers: {
            'Content-Type': 'application/json',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'csv': {
        const csvData = generateCSV(pdfData);
        const filename = `session-${pdfData.sessionId.substring(0, 8)}-${new Date().toISOString().split('T')[0]}.csv`;
        
        return new NextResponse(csvData, {
          headers: {
            'Content-Type': 'text/csv',
            'Content-Disposition': `attachment; filename="${filename}"`,
          },
        });
      }

      case 'excel': {
        const excelBuffer = await generateSessionExcel(pdfData);
        const filename = generateExcelFilename(pdfData.sessionName, pdfData.sessionId);

        return new NextResponse(Buffer.from(excelBuffer), {
          headers: {
            'Content-Type': 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
            'Content-Disposition': `attachment; filename="${filename}"`,
            'Content-Length': excelBuffer.length.toString(),
          },
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: 'Unsupported format' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Export error:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid request data', details: error.errors },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to generate export' },
      { status: 500 }
    );
  }
}

/**
 * Generate CSV export from session data
 */
function generateCSV(data: PDFSessionData): string {
  const headers = ['Timestamp', 'Agent', 'Message', 'Confidence', 'Key Factors'];
  
  const rows = data.messages.map((msg) => {
    const timestamp = new Date(msg.timestamp).toISOString();
    const agent = msg.agentType;
    const message = msg.content.replace(/"/g, '""'); // Escape quotes
    const confidence = msg.confidence !== undefined ? `${Math.round(msg.confidence * 100)}%` : 'N/A';
    const keyFactors = msg.reasoning?.keyFactors?.join('; ') || 'N/A';
    
    return `"${timestamp}","${agent}","${message}","${confidence}","${keyFactors}"`;
  });

  return [headers.join(','), ...rows].join('\n');
}
