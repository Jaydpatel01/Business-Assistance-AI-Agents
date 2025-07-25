import { NextResponse } from 'next/server';
import { writeFile, mkdir } from 'fs/promises';
import { join } from 'path';
import { z } from 'zod';

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

// Validation schema
const UploadRequestSchema = z.object({
  sessionId: z.string().optional(),
  category: z.enum(['financial', 'strategic', 'technical', 'hr', 'general']).default('general'),
  description: z.string().optional(),
});

// Document metadata interface
interface DocumentMetadata {
  fileName: string;
  filePath: string;
  fileSize: number;
  fileType: string;
  category: string;
  description?: string;
  sessionId?: string;
  extractedText: string;
  embeddings: number[];
  uploadedAt: Date;
}

export async function POST(request: Request) {
  try {
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
    const sessionId = formData.get('sessionId') as string;
    const category = formData.get('category') as string || 'general';
    const description = formData.get('description') as string;

    // Validate additional data
    const validatedData = UploadRequestSchema.parse({
      sessionId,
      category,
      description
    });

    // Create upload directory
    const uploadDir = join(process.cwd(), 'uploads');
    await mkdir(uploadDir, { recursive: true });

    // Generate unique filename
    const timestamp = Date.now();
    const fileName = `${timestamp}-${file.name.replace(/[^a-zA-Z0-9.-]/g, '_')}`;
    const filePath = join(uploadDir, fileName);

    // Save file
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);
    await writeFile(filePath, buffer);

    // Extract text content (placeholder for now)
    const extractedText = await extractTextFromFile(filePath, file.type);

    // Generate embeddings (placeholder for now)
    const embeddings = await generateEmbeddings(extractedText);

    // Store document metadata in database (placeholder for now)
    const documentId = await storeDocumentMetadata({
      fileName: file.name,
      filePath,
      fileSize: file.size,
      fileType: file.type,
      category: validatedData.category,
      description: validatedData.description,
      sessionId: validatedData.sessionId,
      extractedText,
      embeddings,
      uploadedAt: new Date(),
    });

    return NextResponse.json({
      success: true,
      data: {
        documentId,
        fileName: file.name,
        fileSize: file.size,
        category: validatedData.category,
        extractedTextLength: extractedText.length,
        message: 'Document uploaded and processed successfully'
      }
    });

  } catch (error) {
    console.error('Document upload error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Upload failed' 
      },
      { status: 500 }
    );
  }
}

// Text extraction function (simplified implementation)
async function extractTextFromFile(filePath: string, fileType: string): Promise<string> {
  // For now, return a placeholder
  // In a real implementation, you would use libraries like:
  // - pdf-parse for PDFs
  // - mammoth for Word documents
  // - xlsx for Excel files
  
  return `Extracted text from ${fileType} document. This would contain the actual document content in a production implementation.`;
}

// Embedding generation function (simplified implementation)
async function generateEmbeddings(text: string): Promise<number[]> {
  // For now, return a placeholder
  // In a real implementation, you would use the 'text' parameter with:
  // - OpenAI embeddings API
  // - Google Vertex AI embeddings
  // - Local embedding models
  
  // Suppress unused parameter warning - will be used in production implementation
  void text;
  
  return new Array(1536).fill(0).map(() => Math.random());
}

// Database storage function (simplified implementation)
async function storeDocumentMetadata(data: DocumentMetadata): Promise<string> {
  // For now, return a placeholder ID
  // In a real implementation, you would store in your database
  
  const documentId = `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  
  console.log('Storing document metadata:', {
    documentId,
    fileName: data.fileName,
    category: data.category,
    textLength: data.extractedText.length
  });
  
  return documentId;
}

export async function GET() {
  try {
    // Return list of uploaded documents
    // This would query the database in a real implementation
    
    const mockDocuments = [
      {
        id: 'doc_1',
        fileName: 'Q4_Financial_Report.pdf',
        category: 'financial',
        uploadedAt: new Date().toISOString(),
        fileSize: 2048576,
        status: 'processed'
      },
      {
        id: 'doc_2',
        fileName: 'Strategic_Plan_2025.docx',
        category: 'strategic',
        uploadedAt: new Date().toISOString(),
        fileSize: 1048576,
        status: 'processed'
      }
    ];

    return NextResponse.json({
      success: true,
      data: mockDocuments
    });

  } catch (error) {
    console.error('Error fetching documents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch documents' },
      { status: 500 }
    );
  }
}
