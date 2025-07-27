/**
 * Document Processing Service for RAG (Retrieval-Augmented Generation)
 * Phase 6: Document Intelligence Implementation
 */

import OpenAI from 'openai';

// Initialize OpenAI client for embeddings with error handling
let openai: OpenAI | null = null;

try {
  if (process.env.OPENAI_API_KEY) {
    openai = new OpenAI({
      apiKey: process.env.OPENAI_API_KEY,
    });
    console.log('✅ OpenAI client initialized for RAG embeddings');
  } else {
    console.warn('⚠️ OPENAI_API_KEY not found. RAG will use fallback methods.');
  }
} catch (error) {
  console.error('❌ Failed to initialize OpenAI client:', error);
  openai = null;
}

export interface ProcessedDocument {
  id: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  category: string;
  description?: string;
  sessionId?: string;
  extractedText: string;
  chunks: DocumentChunk[];
  embeddings: number[][];
  uploadedAt: Date;
  processedAt: Date;
}

export interface DocumentChunk {
  id: string;
  documentId: string;
  text: string;
  chunkIndex: number;
  startIndex: number;
  endIndex: number;
  embedding: number[];
  metadata: {
    pageNumber?: number;
    section?: string;
    wordCount: number;
  };
}

export interface DocumentSearchResult {
  chunk: DocumentChunk;
  similarity: number;
  document: {
    id: string;
    fileName: string;
    category: string;
  };
}

/**
 * Document Processing Service
 */
export class DocumentProcessor {
  private static readonly CHUNK_SIZE = 1000; // tokens
  private static readonly CHUNK_OVERLAP = 200; // tokens
  private static readonly MAX_CHUNKS_PER_DOCUMENT = 100;

  /**
   * Process uploaded document for RAG
   */
  async processDocument(
    file: File,
    metadata: {
      category: string;
      description?: string;
      sessionId?: string;
    }
  ): Promise<ProcessedDocument> {
    console.log(`📄 Processing document: ${file.name}`);

    // Extract text content
    const extractedText = await this.extractTextContent(file);
    
    // Split into chunks
    const chunks = await this.createTextChunks(extractedText, file.name);
    
    // Generate embeddings for each chunk
    const chunksWithEmbeddings = await this.generateChunkEmbeddings(chunks);

    // Create processed document
    const processedDocument: ProcessedDocument = {
      id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      fileName: file.name,
      fileType: file.type,
      fileSize: file.size,
      category: metadata.category,
      description: metadata.description,
      sessionId: metadata.sessionId,
      extractedText,
      chunks: chunksWithEmbeddings,
      embeddings: chunksWithEmbeddings.map(chunk => chunk.embedding),
      uploadedAt: new Date(),
      processedAt: new Date(),
    };

    console.log(`✅ Document processed: ${chunksWithEmbeddings.length} chunks created`);
    
    return processedDocument;
  }

  /**
   * Extract text content from various file types
   */
  private async extractTextContent(file: File): Promise<string> {
    const buffer = await file.arrayBuffer();
    const fileType = file.type;

    try {
      switch (fileType) {
        case 'text/plain':
          return new TextDecoder().decode(buffer);
          
        case 'application/pdf':
          return await this.extractPDFText(buffer);
          
        case 'application/vnd.openxmlformats-officedocument.wordprocessingml.document':
          return await this.extractWordText(buffer);
          
        case 'text/csv':
          return new TextDecoder().decode(buffer);
          
        default:
          // Fallback to treating as text
          return new TextDecoder().decode(buffer);
      }
    } catch (error) {
      console.error('Text extraction error:', error);
      return `Error extracting text from ${file.name}. File may be corrupted or unsupported format.`;
    }
  }

  /**
   * Extract text from PDF files
   * @param buffer - PDF file buffer (currently unused in placeholder implementation)
   */
  private async extractPDFText(buffer: ArrayBuffer): Promise<string> {
    try {
      // For production, install pdf-parse: npm install pdf-parse
      // const pdf = await import('pdf-parse');
      // const data = await pdf.default(Buffer.from(buffer));
      // return data.text;
      
      // Placeholder implementation
      console.log(`📄 Processing PDF buffer of size: ${buffer.byteLength} bytes`);
      return "PDF text extraction placeholder. In production, this would use pdf-parse library to extract actual text content from PDF files.";
    } catch (error) {
      console.error('PDF extraction error:', error);
      return "Error extracting PDF text";
    }
  }

  /**
   * Extract text from Word documents
   * @param buffer - Word document buffer (currently unused in placeholder implementation)
   */
  private async extractWordText(buffer: ArrayBuffer): Promise<string> {
    try {
      // For production, install mammoth: npm install mammoth
      // const mammoth = await import('mammoth');
      // const result = await mammoth.extractRawText({buffer: Buffer.from(buffer)});
      // return result.value;
      
      // Placeholder implementation
      console.log(`📄 Processing Word document buffer of size: ${buffer.byteLength} bytes`);
      return "Word document text extraction placeholder. In production, this would use mammoth library to extract actual text content from Word documents.";
    } catch (error) {
      console.error('Word extraction error:', error);
      return "Error extracting Word document text";
    }
  }

  /**
   * Split text into overlapping chunks for better context preservation
   */
  private async createTextChunks(text: string, fileName: string): Promise<Omit<DocumentChunk, 'embedding'>[]> {
    const words = text.split(/\s+/);
    const chunks: Omit<DocumentChunk, 'embedding'>[] = [];
    
    let currentIndex = 0;
    let chunkIndex = 0;

    while (currentIndex < words.length && chunkIndex < DocumentProcessor.MAX_CHUNKS_PER_DOCUMENT) {
      const endIndex = Math.min(currentIndex + DocumentProcessor.CHUNK_SIZE, words.length);
      const chunkWords = words.slice(currentIndex, endIndex);
      const chunkText = chunkWords.join(' ');

      chunks.push({
        id: `chunk_${chunkIndex}_${Date.now()}`,
        documentId: '', // Will be set later
        text: chunkText,
        chunkIndex,
        startIndex: currentIndex,
        endIndex: endIndex,
        metadata: {
          wordCount: chunkWords.length,
          section: this.detectSection(chunkText),
        },
      });

      // Move forward with overlap
      currentIndex += DocumentProcessor.CHUNK_SIZE - DocumentProcessor.CHUNK_OVERLAP;
      chunkIndex++;
    }

    console.log(`📝 Created ${chunks.length} text chunks from ${fileName}`);
    return chunks;
  }

  /**
   * Generate embeddings for document chunks
   */
  private async generateChunkEmbeddings(chunks: Omit<DocumentChunk, 'embedding'>[]): Promise<DocumentChunk[]> {
    console.log(`🧠 Generating embeddings for ${chunks.length} chunks`);

    if (!openai) {
      console.error('❌ OpenAI client not available for embeddings');
      // Return chunks with mock embeddings as fallback
      return chunks.map(chunk => ({
        ...chunk,
        embedding: new Array(1536).fill(0).map(() => Math.random()), // Mock embedding
      }));
    }

    const chunksWithEmbeddings: DocumentChunk[] = [];

    // Process chunks in batches to avoid rate limits
    const batchSize = 10;
    for (let i = 0; i < chunks.length; i += batchSize) {
      const batch = chunks.slice(i, i + batchSize);
      const batchTexts = batch.map(chunk => chunk.text);

      try {
        const response = await openai.embeddings.create({
          model: 'text-embedding-ada-002',
          input: batchTexts,
        });

        // Add embeddings to chunks
        batch.forEach((chunk, index) => {
          chunksWithEmbeddings.push({
            ...chunk,
            embedding: response.data[index].embedding,
          });
        });

        // Small delay to respect rate limits
        if (i + batchSize < chunks.length) {
          await new Promise(resolve => setTimeout(resolve, 100));
        }

      } catch (error) {
        console.error('Embedding generation error:', error);
        
        // Fallback to mock embeddings
        batch.forEach((chunk) => {
          chunksWithEmbeddings.push({
            ...chunk,
            embedding: new Array(1536).fill(0).map(() => Math.random()), // Mock embedding
          });
        });
      }
    }

    console.log(`✅ Generated embeddings for ${chunksWithEmbeddings.length} chunks`);
    return chunksWithEmbeddings;
  }

  /**
   * Search documents using semantic similarity
   */
  async searchDocuments(
    query: string,
    documents: ProcessedDocument[],
    options: {
      topK?: number;
      minSimilarity?: number;
      categories?: string[];
    } = {}
  ): Promise<DocumentSearchResult[]> {
    const { topK = 5, minSimilarity = 0.7, categories } = options;

    console.log(`🔍 Searching documents for: "${query}"`);

    // Generate query embedding
    const queryEmbedding = await this.generateQueryEmbedding(query);

    // Filter documents by category if specified
    const filteredDocuments = categories 
      ? documents.filter(doc => categories.includes(doc.category))
      : documents;

    // Search all chunks
    const searchResults: DocumentSearchResult[] = [];

    for (const document of filteredDocuments) {
      for (const chunk of document.chunks) {
        const similarity = this.calculateCosineSimilarity(queryEmbedding, chunk.embedding);
        
        if (similarity >= minSimilarity) {
          searchResults.push({
            chunk,
            similarity,
            document: {
              id: document.id,
              fileName: document.fileName,
              category: document.category,
            },
          });
        }
      }
    }

    // Sort by similarity and return top K
    const sortedResults = searchResults
      .sort((a, b) => b.similarity - a.similarity)
      .slice(0, topK);

    console.log(`📊 Found ${sortedResults.length} relevant chunks`);
    return sortedResults;
  }

  /**
   * Generate embedding for search query
   */
  private async generateQueryEmbedding(query: string): Promise<number[]> {
    if (!openai) {
      console.warn('⚠️ OpenAI client not available, using mock embedding');
      return new Array(1536).fill(0).map(() => Math.random());
    }

    try {
      const response = await openai.embeddings.create({
        model: 'text-embedding-ada-002',
        input: query,
      });

      return response.data[0].embedding;
    } catch (error) {
      console.error('Query embedding error:', error);
      // Return mock embedding as fallback
      return new Array(1536).fill(0).map(() => Math.random());
    }
  }

  /**
   * Calculate cosine similarity between two vectors
   */
  private calculateCosineSimilarity(a: number[], b: number[]): number {
    if (a.length !== b.length) return 0;

    let dotProduct = 0;
    let normA = 0;
    let normB = 0;

    for (let i = 0; i < a.length; i++) {
      dotProduct += a[i] * b[i];
      normA += a[i] * a[i];
      normB += b[i] * b[i];
    }

    if (normA === 0 || normB === 0) return 0;

    return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
  }

  /**
   * Detect section type from chunk text (simple heuristics)
   */
  private detectSection(text: string): string {
    const lowerText = text.toLowerCase();
    
    if (lowerText.includes('executive summary') || lowerText.includes('summary')) {
      return 'executive_summary';
    }
    if (lowerText.includes('introduction') || lowerText.includes('overview')) {
      return 'introduction';
    }
    if (lowerText.includes('conclusion') || lowerText.includes('recommendations')) {
      return 'conclusion';
    }
    if (lowerText.includes('financial') || lowerText.includes('revenue') || lowerText.includes('budget')) {
      return 'financial';
    }
    if (lowerText.includes('strategy') || lowerText.includes('strategic')) {
      return 'strategic';
    }
    
    return 'content';
  }

  /**
   * Get relevant context for AI agents from documents
   */
  async getRelevantContext(
    query: string,
    documents: ProcessedDocument[],
    maxContextLength: number = 2000
  ): Promise<string> {
    const searchResults = await this.searchDocuments(query, documents, {
      topK: 3,
      minSimilarity: 0.6,
    });

    if (searchResults.length === 0) {
      return '';
    }

    let context = '';
    let currentLength = 0;

    for (const result of searchResults) {
      const chunkContext = `\n[Document: ${result.document.fileName}]\n${result.chunk.text}\n`;
      
      if (currentLength + chunkContext.length <= maxContextLength) {
        context += chunkContext;
        currentLength += chunkContext.length;
      } else {
        // Add partial context if it fits
        const remainingLength = maxContextLength - currentLength;
        if (remainingLength > 100) {
          context += chunkContext.substring(0, remainingLength - 3) + '...';
        }
        break;
      }
    }

    return context.trim();
  }
}

export const documentProcessor = new DocumentProcessor();
