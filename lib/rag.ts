import { upsertVectors, searchSimilarDocuments, deleteVectors, VectorRecord } from './pinecone';
import { processDocumentForEmbedding, generateSingleEmbedding, getEmbeddingConfig } from './embeddings';

export interface RAGDocument {
  id: string;
  name: string;
  content: string;
  userId?: string;
  organizationId?: string;
  metadata?: Record<string, string | number | boolean>;
}

export interface RAGSearchResult {
  id: string;
  text: string;
  score: number;
  metadata: {
    documentId: string;
    documentName: string;
    chunkIndex: number;
    userId?: string;
    organizationId?: string;
    createdAt: string;
    [key: string]: string | number | boolean | undefined;
  };
}

/**
 * Add a document to the RAG system
 */
export async function addDocumentToRAG(
  document: RAGDocument,
  options: {
    chunkSize?: number;
    overlap?: number;
    useLocal?: boolean;
  } = {}
): Promise<{ success: boolean; chunksCreated: number; documentId: string }> {
  try {
    console.log(`Adding document "${document.name}" to RAG system...`);

    // Check embedding configuration and decide which to use
    const embeddingConfig = getEmbeddingConfig();
    const useLocal = options.useLocal || !embeddingConfig.hasOpenAI;
    
    if (useLocal) {
      console.log('Using local embeddings for document processing');
    } else {
      console.log('Using OpenAI embeddings for document processing');
    }

    // Process document and generate embeddings
    const embeddingResults = await processDocumentForEmbedding(
      document.content,
      {
        documentId: document.id,
        documentName: document.name,
        userId: document.userId || '',
        organizationId: document.organizationId || '',
        createdAt: new Date().toISOString(),
      },
      {
        ...options,
        useLocal
      }
    );

    // Convert to Pinecone format
    const pineconeRecords: VectorRecord[] = embeddingResults.map((result, index) => ({
      id: `${document.id}_chunk_${index}`,
      values: result.embedding,
      metadata: {
        text: result.content,
        documentId: document.id,
        documentName: document.name,
        chunkIndex: index,
        totalChunks: embeddingResults.length,
        userId: document.userId || '',
        organizationId: document.organizationId || '',
        createdAt: new Date().toISOString(),
        embeddingModel: result.metadata.embeddingModel as string,
        embeddingDimensions: result.metadata.embeddingDimensions as number,
        ...(document.metadata || {}),
      },
    }));

    // Upsert to Pinecone
    await upsertVectors(pineconeRecords);

    console.log(`Successfully added document "${document.name}" with ${embeddingResults.length} chunks to RAG system`);

    return {
      success: true,
      chunksCreated: embeddingResults.length,
      documentId: document.id,
    };
  } catch (error) {
    console.error(`Error adding document "${document.name}" to RAG:`, error);
    throw error;
  }
}

/**
 * Search for relevant documents in the RAG system
 */
export async function searchRAG(
  query: string,
  options: {
    topK?: number;
    minScore?: number;
    userId?: string;
    organizationId?: string;
    documentId?: string;
    useLocal?: boolean;
  } = {}
): Promise<RAGSearchResult[]> {
  try {
    const {
      topK = 5,
      minScore = 0.7,
      userId,
      organizationId,
      documentId,
      useLocal,
    } = options;

    console.log(`Searching RAG for query: "${query.substring(0, 100)}..."`);

    // Check embedding configuration and decide which to use
    const embeddingConfig = getEmbeddingConfig();
    const shouldUseLocal = useLocal || !embeddingConfig.hasOpenAI;

    // Generate embedding for the query
    const queryEmbedding = await generateSingleEmbedding(query, {
      useLocal: shouldUseLocal,
    });

    // Search similar documents
    const results = await searchSimilarDocuments(queryEmbedding, {
      topK,
      minScore,
      userId,
      organizationId,
      documentId,
    });

    console.log(`Found ${results.length} relevant chunks for query`);

    return results.map(result => ({
      id: result.id,
      text: result.text,
      score: result.metadata.score as number,
      metadata: result.metadata,
    }));
  } catch (error) {
    console.error('Error searching RAG:', error);
    throw error;
  }
}

/**
 * Get context for AI agents from RAG system
 */
export async function getRAGContext(
  query: string,
  options: {
    maxChunks?: number;
    minScore?: number;
    maxContextLength?: number;
    userId?: string;
    organizationId?: string;
  } = {}
): Promise<{
  context: string;
  sources: Array<{
    documentName: string;
    chunkIndex: number;
    score: number;
  }>;
  totalChunks: number;
}> {
  try {
    const {
      maxChunks = 5,
      minScore = 0.7,
      maxContextLength = 3000,
      userId,
      organizationId,
    } = options;

    const results = await searchRAG(query, {
      topK: maxChunks,
      minScore,
      userId,
      organizationId,
    });

    if (results.length === 0) {
      return {
        context: '',
        sources: [],
        totalChunks: 0,
      };
    }

    // Build context string with length limit
    let context = '';
    const sources: Array<{ documentName: string; chunkIndex: number; score: number }> = [];

    for (const result of results) {
      const chunkText = `\n\n--- From ${result.metadata.documentName} (Chunk ${result.metadata.chunkIndex}) ---\n${result.text}`;
      
      if (context.length + chunkText.length <= maxContextLength) {
        context += chunkText;
        sources.push({
          documentName: result.metadata.documentName,
          chunkIndex: result.metadata.chunkIndex,
          score: result.score,
        });
      } else {
        break;
      }
    }

    console.log(`Built RAG context with ${sources.length} chunks (${context.length} characters)`);

    return {
      context: context.trim(),
      sources,
      totalChunks: results.length,
    };
  } catch (error) {
    console.error('Error getting RAG context:', error);
    throw error;
  }
}

/**
 * Remove a document from the RAG system
 */
export async function removeDocumentFromRAG(
  documentId: string,
  options: {
    userId?: string;
    organizationId?: string;
  } = {}
): Promise<{ success: boolean; documentId: string }> {
  try {
    console.log(`Removing document "${documentId}" from RAG system...`);

    // Build filter for deletion
    const filter: Record<string, string | number | boolean> = {
      documentId,
    };

    if (options.userId) filter.userId = options.userId;
    if (options.organizationId) filter.organizationId = options.organizationId;

    // Delete vectors
    await deleteVectors(undefined, filter);

    console.log(`Successfully removed document "${documentId}" from RAG system`);

    return {
      success: true,
      documentId,
    };
  } catch (error) {
    console.error(`Error removing document "${documentId}" from RAG:`, error);
    throw error;
  }
}

/**
 * Update agent prompt with RAG context
 */
export function enhancePromptWithRAGContext(
  originalPrompt: string,
  ragContext: string,
  sources: Array<{ documentName: string; chunkIndex: number; score: number }>
): string {
  if (!ragContext || ragContext.trim().length === 0) {
    return originalPrompt;
  }

  const sourcesList = sources
    .map(source => `- ${source.documentName} (relevance: ${(source.score * 100).toFixed(1)}%)`)
    .join('\n');

  const enhancedPrompt = `${originalPrompt}

RELEVANT COMPANY DOCUMENTS:
Based on the following information from uploaded company documents, provide data-driven insights and recommendations:

${ragContext}

SOURCES CONSULTED:
${sourcesList}

Please reference specific information from these documents in your response and explain how the company data influences your recommendations.`;

  return enhancedPrompt;
}

const ragService = {
  addDocumentToRAG,
  searchRAG,
  getRAGContext,
  removeDocumentFromRAG,
  enhancePromptWithRAGContext,
};

export default ragService;
