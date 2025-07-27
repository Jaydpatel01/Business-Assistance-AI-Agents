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
    const dbDocument = await prisma.document.create({
      data: {
        id: processedDocument.id,
        name: processedDocument.fileName,
        type: processedDocument.fileType,
        url: `/documents/${processedDocument.id}`, // Virtual URL for now
        sessionId: processedDocument.sessionId || 'global', // Use 'global' if no session
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

    // Get user's documents from database
    const userDocuments = await prisma.document.findMany({
      where: {
        metadata: {
          contains: session.user.id // Check if user uploaded the document
        }
      },
      orderBy: {
        createdAt: 'desc'
      }
    });

    // Format documents for response
    const formattedDocuments = userDocuments.map(doc => {
      const metadata = JSON.parse(doc.metadata || '{}');
      return {
        id: doc.id,
        fileName: metadata.fileName || doc.name,
        category: metadata.category || 'general',
        uploadedAt: doc.createdAt.toISOString(),
        fileSize: metadata.fileSize || 0,
        status: 'processed',
        chunksCreated: metadata.chunksCreated || 0,
        extractedTextLength: metadata.extractedTextLength || 0
      };
    });

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
