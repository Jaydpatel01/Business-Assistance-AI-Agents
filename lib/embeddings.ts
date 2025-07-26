import OpenAI from 'openai';
import { localEmbeddingService } from './local-embeddings';

export interface EmbeddingResult {
  content: string;
  embedding: number[];
  metadata: Record<string, string | number | boolean>;
}

export interface EmbeddingService {
  generateEmbeddings(text: string): Promise<number[]>;
  chunkText(text: string, maxChunkSize?: number): string[];
  processDocumentForEmbedding(content: string, metadata?: Record<string, string | number | boolean>): Promise<EmbeddingResult[]>;
}

// Initialize OpenAI client (with optional API key)
const openai = process.env.OPENAI_API_KEY ? new OpenAI({
  apiKey: process.env.OPENAI_API_KEY,
}) : null;

// Configuration for embedding service
const EMBEDDING_CONFIG = {
  openai: {
    model: 'text-embedding-3-large',
    dimensions: 3072,
    maxTokens: 8191
  },
  local: {
    model: 'all-MiniLM-L6-v2',
    dimensions: 384,
    maxTokens: 512
  }
};

/**
 * Generate embeddings with fallback to local model if OpenAI fails
 */
export async function generateEmbeddings(
  texts: string[],
  options: {
    model?: string;
    dimensions?: number;
    useLocal?: boolean;
  } = {}
): Promise<number[][]> {
  const { useLocal = false } = options;

  // Use local embeddings if requested or if no OpenAI key
  if (useLocal || !openai) {
    console.log('Using local embeddings model...');
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await localEmbeddingService.generateEmbeddings(text);
        embeddings.push(embedding);
      }
      return embeddings;
    } catch (error) {
      console.error('Local embedding generation failed:', error);
      throw new Error('Local embedding generation failed');
    }
  }

  // Try OpenAI embeddings first
  try {
    const { model = EMBEDDING_CONFIG.openai.model, dimensions = EMBEDDING_CONFIG.openai.dimensions } = options;

    // Batch process texts to avoid rate limits
    const batchSize = 100;
    const embeddings: number[][] = [];

    for (let i = 0; i < texts.length; i += batchSize) {
      const batch = texts.slice(i, i + batchSize);
      
      const response = await openai!.embeddings.create({
        model,
        input: batch,
        dimensions,
      });

      const batchEmbeddings = response.data.map(item => item.embedding);
      embeddings.push(...batchEmbeddings);
    }

    console.log(`Generated ${embeddings.length} embeddings using OpenAI ${model}`);
    return embeddings;
  } catch (error) {
    console.error('OpenAI embedding generation failed:', error);
    console.log('Falling back to local embeddings...');
    
    // Fallback to local embeddings
    try {
      const embeddings = [];
      for (const text of texts) {
        const embedding = await localEmbeddingService.generateEmbeddings(text);
        embeddings.push(embedding);
      }
      console.log(`Generated ${embeddings.length} embeddings using local model`);
      return embeddings;
    } catch (localError) {
      console.error('Local embedding generation also failed:', localError);
      throw new Error('Both OpenAI and local embedding generation failed');
    }
  }
}

/**
 * Generate a single embedding for a text
 */
export async function generateSingleEmbedding(
  text: string,
  options: {
    model?: string;
    dimensions?: number;
    useLocal?: boolean;
  } = {}
): Promise<number[]> {
  try {
    const embeddings = await generateEmbeddings([text], options);
    return embeddings[0];
  } catch (error) {
    console.error('Error generating single embedding:', error);
    throw error;
  }
}

/**
 * Chunk text into smaller pieces for embedding
 */
export function chunkText(
  text: string,
  options: {
    maxChunkSize?: number;
    overlap?: number;
  } = {}
): string[] {
  const { maxChunkSize = 512, overlap = 50 } = options;

  if (!text || text.trim().length === 0) {
    return [];
  }

  // If text is smaller than max chunk size, return as single chunk
  if (text.length <= maxChunkSize) {
    return [text.trim()];
  }

  const chunks: string[] = [];
  let startIndex = 0;

  while (startIndex < text.length) {
    let endIndex = startIndex + maxChunkSize;
    
    // If we're not at the end, try to break at a sentence boundary
    if (endIndex < text.length) {
      const lastSentenceEnd = text.lastIndexOf('.', endIndex);
      const lastNewline = text.lastIndexOf('\n', endIndex);
      const lastSpace = text.lastIndexOf(' ', endIndex);
      
      // Choose the best breaking point
      const breakPoint = Math.max(lastSentenceEnd, lastNewline, lastSpace);
      if (breakPoint > startIndex + maxChunkSize * 0.5) {
        endIndex = breakPoint + 1;
      }
    }

    const chunk = text.slice(startIndex, endIndex).trim();
    if (chunk.length > 0) {
      chunks.push(chunk);
    }

    // Calculate next start index with overlap
    startIndex = Math.max(startIndex + maxChunkSize - overlap, endIndex);
  }

  return chunks.length > 0 ? chunks : [text.trim()];
}

/**
 * Process a document for embedding with chunking and metadata
 */
export async function processDocumentForEmbedding(
  content: string,
  metadata: Record<string, string | number | boolean> = {},
  options: {
    maxChunkSize?: number;
    overlap?: number;
    useLocal?: boolean;
  } = {}
): Promise<EmbeddingResult[]> {
  const { maxChunkSize = 512, overlap = 50, useLocal = false } = options;

  try {
    // Chunk the content
    const chunks = chunkText(content, { maxChunkSize, overlap });
    
    if (chunks.length === 0) {
      console.warn('No chunks generated from document content');
      return [];
    }

    // Generate embeddings for all chunks
    const embeddings = await generateEmbeddings(chunks, { useLocal });

    // Combine chunks with embeddings and metadata
    const results: EmbeddingResult[] = chunks.map((chunk, index) => ({
      content: chunk,
      embedding: embeddings[index],
      metadata: {
        ...metadata,
        chunkIndex: index,
        totalChunks: chunks.length,
        chunkSize: chunk.length,
        embeddingModel: useLocal ? EMBEDDING_CONFIG.local.model : EMBEDDING_CONFIG.openai.model,
        embeddingDimensions: useLocal ? EMBEDDING_CONFIG.local.dimensions : EMBEDDING_CONFIG.openai.dimensions
      }
    }));

    console.log(`Processed document into ${results.length} chunks with embeddings`);
    return results;
  } catch (error) {
    console.error('Error processing document for embedding:', error);
    throw new Error(`Failed to process document: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }
}

/**
 * Get embedding configuration info
 */
export function getEmbeddingConfig() {
  return {
    hasOpenAI: !!openai,
    ...EMBEDDING_CONFIG
  };
}

/**
 * Calculate cosine similarity between two embeddings
 */
export function cosineSimilarity(a: number[], b: number[]): number {
  if (a.length !== b.length) {
    throw new Error('Embedding dimensions must match');
  }

  let dotProduct = 0;
  let normA = 0;
  let normB = 0;

  for (let i = 0; i < a.length; i++) {
    dotProduct += a[i] * b[i];
    normA += a[i] * a[i];
    normB += b[i] * b[i];
  }

  return dotProduct / (Math.sqrt(normA) * Math.sqrt(normB));
}
