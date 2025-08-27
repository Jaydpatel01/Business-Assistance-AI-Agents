import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { documentProcessor } from '@/lib/rag/document-processor';
import { prisma } from '@/lib/db/connection';

const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10MB
const ALLOWED_TYPES = [
  'application/pdf',
  'text/plain',
  'application/msword',
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  'text/csv',
  'application/vnd.ms-excel',
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
];

// Validation schemas
const UploadRequestSchema = z.object({
  sessionId: z.string().optional(),
  category: z.enum(['financial', 'strategic', 'technical', 'hr', 'general']).default('general'),
  description: z.string().optional(),
});

export async function POST(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const formData = await request.formData();
    const file = formData.get('file') as File;
    
    if (!file) {
      return NextResponse.json(
        { success: false, error: 'No file provided' },
        { status: 400 }
      );
    }

    // Validate file size
    if (file.size > MAX_FILE_SIZE) {
      return NextResponse.json(
        { success: false, error: 'File size exceeds 10MB limit' },
        { status: 400 }
      );
    }

    // Validate file type
    if (!ALLOWED_TYPES.includes(file.type)) {
      return NextResponse.json(
        { success: false, error: 'File type not supported' },
        { status: 400 }
      );
    }

    // Parse additional data
    const sessionId = formData.get('sessionId') as string | null;
    const category = formData.get('category') as string || 'general';
    const description = formData.get('description') as string | null;

    // Validate additional data
    const validatedData = UploadRequestSchema.parse({
      sessionId: sessionId || undefined,
      category,
      description: description || undefined
    });

    console.log(`📄 Processing document upload: ${file.name}`);

    // Process document with RAG system
    const processedDocument = await documentProcessor.processDocument(file, {
      category: validatedData.category,
      description: validatedData.description,
      sessionId: validatedData.sessionId,
    });

    // Save processed document to database using existing Document schema
    // Only link to session if it exists, otherwise make it a global document
    let finalSessionId: string | undefined = undefined;
    
    if (processedDocument.sessionId && processedDocument.sessionId !== 'global') {
      // Verify session exists before creating document
      const sessionExists = await prisma.boardroomSession.findUnique({
        where: { id: processedDocument.sessionId }
      });
      
      if (sessionExists) {
        finalSessionId = processedDocument.sessionId;
      } else {
        console.log(`⚠️ Session ${processedDocument.sessionId} not found, creating as global document`);
      }
    }
    
    const dbDocument = await prisma.document.create({
      data: {
        id: processedDocument.id,
        ...(finalSessionId && { sessionId: finalSessionId }), // Only include if defined
        userId: session.user.id, // Always link to the user who uploaded it
        name: processedDocument.fileName,
        type: processedDocument.fileType,
        url: `/documents/${processedDocument.id}`, // Virtual URL for now
        metadata: JSON.stringify({
          fileName: processedDocument.fileName,
          fileSize: processedDocument.fileSize,
          category: processedDocument.category,
          description: processedDocument.description,
          extractedTextLength: processedDocument.extractedText.length,
          chunksCreated: processedDocument.chunks.length,
          uploadedBy: session.user.id,
          processedAt: processedDocument.processedAt,
        })
      }
    });

    // Store document chunks as vector embeddings
    const vectorEmbeddings = await Promise.all(
      processedDocument.chunks.map(async (chunk) => {
        return await prisma.vectorEmbedding.create({
          data: {
            content: chunk.text,
            embedding: JSON.stringify(chunk.embedding),
            metadata: JSON.stringify({
              documentId: processedDocument.id,
              chunkIndex: chunk.chunkIndex,
              fileName: processedDocument.fileName,
              category: processedDocument.category,
              section: chunk.metadata.section,
              wordCount: chunk.metadata.wordCount,
              uploadedBy: session.user.id,
            }),
            organizationId: session.user.company || null,
          }
        });
      })
    );

    console.log(`✅ Document processed and saved: ${dbDocument.id} with ${vectorEmbeddings.length} embeddings`);

    return NextResponse.json({
      success: true,
      data: {
        documentId: dbDocument.id,
        fileName: processedDocument.fileName,
        fileSize: processedDocument.fileSize,
        category: processedDocument.category,
        extractedTextLength: processedDocument.extractedText.length,
        chunksCreated: processedDocument.chunks.length,
        embeddingsStored: vectorEmbeddings.length,
        message: 'Document uploaded and processed with RAG successfully'
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    
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
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');
    const category = searchParams.get('category');

    // Check if this is a demo user
    const isDemoUser = session.user.email === 'demo@businessai.com' || 
                       session.user.email === 'demo@user.com' || 
                       session.user.name === 'Demo User';

    if (isDemoUser) {
      // Return comprehensive demo documents
      const demoDocuments = [
        {
          id: 'doc-1',
          fileName: 'Q4 Financial Report 2024.pdf',
          category: 'financial',
          uploadedAt: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
          fileSize: 2456789,
          status: 'processed',
          chunksCreated: 42,
          extractedTextLength: 15847,
          sessionId: 'session-1',
          description: 'Comprehensive Q4 financial performance analysis'
        },
        {
          id: 'doc-2',
          fileName: 'Market Research - European Expansion.docx',
          category: 'strategic',
          uploadedAt: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
          fileSize: 1234567,
          status: 'processed',
          chunksCreated: 28,
          extractedTextLength: 12456,
          sessionId: 'session-2',
          description: 'Detailed market analysis for European expansion strategy'
        },
        {
          id: 'doc-3',
          fileName: 'Technology Stack Assessment.xlsx',
          category: 'technical',
          uploadedAt: new Date(Date.now() - 72 * 60 * 60 * 1000).toISOString(),
          fileSize: 876543,
          status: 'processed',
          chunksCreated: 15,
          extractedTextLength: 8932,
          sessionId: 'session-3',
          description: 'Current technology infrastructure and modernization recommendations'
        },
        {
          id: 'doc-4',
          fileName: 'Employee Satisfaction Survey 2024.pdf',
          category: 'hr',
          uploadedAt: new Date(Date.now() - 96 * 60 * 60 * 1000).toISOString(),
          fileSize: 654321,
          status: 'processed',
          chunksCreated: 22,
          extractedTextLength: 11234,
          sessionId: 'session-6',
          description: 'Annual employee satisfaction and engagement survey results'
        },
        {
          id: 'doc-5',
          fileName: 'Competitive Analysis Report.pptx',
          category: 'strategic',
          uploadedAt: new Date(Date.now() - 120 * 60 * 60 * 1000).toISOString(),
          fileSize: 3456789,
          status: 'processed',
          chunksCreated: 56,
          extractedTextLength: 18765,
          sessionId: 'session-2',
          description: 'Comprehensive competitive landscape analysis'
        },
        {
          id: 'doc-6',
          fileName: 'Customer Feedback Analysis.json',
          category: 'general',
          uploadedAt: new Date(Date.now() - 144 * 60 * 60 * 1000).toISOString(),
          fileSize: 234567,
          status: 'processed',
          chunksCreated: 8,
          extractedTextLength: 5643,
          sessionId: 'session-5',
          description: 'Aggregated customer feedback and sentiment analysis'
        },
        {
          id: 'doc-7',
          fileName: 'Budget Allocation Proposal 2025.xlsx',
          category: 'financial',
          uploadedAt: new Date(Date.now() - 12 * 60 * 60 * 1000).toISOString(),
          fileSize: 567890,
          status: 'processed',
          chunksCreated: 12,
          extractedTextLength: 7234,
          sessionId: 'session-1',
          description: '2025 budget allocation across departments and initiatives'
        },
        {
          id: 'doc-8',
          fileName: 'Risk Assessment Matrix.pdf',
          category: 'general',
          uploadedAt: new Date(Date.now() - 36 * 60 * 60 * 1000).toISOString(),
          fileSize: 445566,
          status: 'processed',
          chunksCreated: 18,
          extractedTextLength: 9876,
          sessionId: 'session-4',
          description: 'Comprehensive business risk assessment and mitigation strategies'
        }
      ];

      // Filter by category if specified
      let filteredDocuments = demoDocuments;
      if (category) {
        filteredDocuments = demoDocuments.filter(doc => doc.category === category);
      }
      if (sessionId) {
        filteredDocuments = filteredDocuments.filter(doc => doc.sessionId === sessionId);
      }

      return NextResponse.json({
        success: true,
        data: filteredDocuments,
        userType: 'demo',
        message: `Found ${filteredDocuments.length} demo documents`
      });
    }

    // Get user's documents from database
    const whereClause = {
      userId: session.user.id, // Filter by userId for proper data persistence
      ...(sessionId && { sessionId }) // Add sessionId filter if provided
    };

    const userDocuments = await prisma.document.findMany({
      where: whereClause,
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format documents for response and apply category filter if needed
    let formattedDocuments = userDocuments.map(doc => {
      const metadata = JSON.parse(doc.metadata || '{}');
      return {
        id: doc.id,
        fileName: metadata.fileName || doc.name,
        category: metadata.category || 'general',
        uploadedAt: doc.createdAt.toISOString(),
        fileSize: metadata.fileSize || 0,
        status: 'processed',
        chunksCreated: metadata.chunksCreated || 0,
        extractedTextLength: metadata.extractedTextLength || 0,
        sessionId: doc.sessionId,
        description: metadata.description
      };
    });

    // Apply category filter if specified
    if (category) {
      formattedDocuments = formattedDocuments.filter(doc => doc.category === category);
    }

    return NextResponse.json({
      success: true,
      data: formattedDocuments,
      message: `Found ${formattedDocuments.length} processed documents`
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
