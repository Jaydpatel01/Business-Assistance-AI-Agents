import { Pinecone, PineconeRecord, RecordMetadata } from '@pinecone-database/pinecone';

// Initialize Pinecone client
const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
});

// Get the appropriate index based on embedding dimensions
function getIndex(dimensions?: number) {
  if (dimensions === 384) {
    // Use local embeddings index (all-MiniLM-L6-v2)
    return pinecone.index(process.env.PINECONE_INDEX_LOCAL || 'business-ai-agents-local');
  } else {
    // Use OpenAI embeddings index (text-embedding-3-large)
    return pinecone.index(process.env.PINECONE_INDEX!);
  }
}

export interface DocumentChunk {
  id: string;
  text: string;
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

export interface VectorRecord extends PineconeRecord {
  metadata?: RecordMetadata & {
    text?: string;
    documentId?: string;
    documentName?: string;
    chunkIndex?: number;
    userId?: string;
    organizationId?: string;
    createdAt?: string;
  };
}

export interface QueryMatch {
  id: string;
  score: number;
  metadata?: RecordMetadata & {
    text?: string;
    documentId?: string;
    documentName?: string;
    chunkIndex?: number;
    userId?: string;
    organizationId?: string;
    createdAt?: string;
  };
  values?: number[];
}

/**
 * Upsert vectors to Pinecone
 */
export async function upsertVectors(vectors: VectorRecord[]): Promise<void> {
  try {
    if (vectors.length === 0) {
      console.log('No vectors to upsert');
      return;
    }

    // Detect dimensions from first vector
    const dimensions = vectors[0].values?.length;
    const index = getIndex(dimensions);
    
    await index.upsert(vectors);
    console.log(`Successfully upserted ${vectors.length} vectors to Pinecone (${dimensions}D)`);
  } catch (error) {
    console.error('Error upserting vectors to Pinecone:', error);
    throw error;
  }
}

/**
 * Query vectors from Pinecone
 */
export async function queryVectors(
  queryVector: number[],
  options: {
    topK?: number;
    filter?: Record<string, string | number | boolean>;
    includeMetadata?: boolean;
    includeValues?: boolean;
  } = {}
): Promise<QueryMatch[]> {
  try {
    const {
      topK = 5,
      filter,
      includeMetadata = true,
      includeValues = false,
    } = options;

    // Detect dimensions and get appropriate index
    const dimensions = queryVector.length;
    const index = getIndex(dimensions);

    const queryResponse = await index.query({
      vector: queryVector,
      topK,
      filter,
      includeMetadata,
      includeValues,
    });

    return (queryResponse.matches || []) as QueryMatch[];
  } catch (error) {
    console.error('Error querying vectors from Pinecone:', error);
    throw error;
  }
}

/**
 * Delete vectors from Pinecone
 */
export async function deleteVectors(
  ids?: string[],
  filter?: Record<string, string | number | boolean>,
  dimensions?: number
): Promise<void> {
  try {
    const index = getIndex(dimensions);
    if (ids) {
      await index.deleteMany(ids);
      console.log(`Successfully deleted ${ids.length} vectors from Pinecone`);
    } else if (filter) {
      await index.deleteMany({ filter });
      console.log('Successfully deleted vectors with filter from Pinecone');
    } else {
      throw new Error('Either ids or filter must be provided for deletion');
    }
  } catch (error) {
    console.error('Error deleting vectors from Pinecone:', error);
    throw error;
  }
}

/**
 * Get index stats
 */
export async function getIndexStats(dimensions?: number): Promise<{ totalVectorCount?: number; dimension?: number }> {
  try {
    const index = getIndex(dimensions);
    const stats = await index.describeIndexStats();
    return stats;
  } catch (error) {
    console.error('Error getting index stats from Pinecone:', error);
    throw error;
  }
}

/**
 * Search for similar documents
 */
export async function searchSimilarDocuments(
  queryVector: number[],
  options: {
    topK?: number;
    documentId?: string;
    userId?: string;
    organizationId?: string;
    minScore?: number;
  } = {}
): Promise<DocumentChunk[]> {
  try {
    const {
      topK = 5,
      documentId,
      userId,
      organizationId,
      minScore = 0.7,
    } = options;

    // Build filter
    const filter: Record<string, string | number | boolean> = {};
    if (documentId) filter.documentId = documentId;
    if (userId) filter.userId = userId;
    if (organizationId) filter.organizationId = organizationId;

    const matches = await queryVectors(queryVector, {
      topK,
      filter: Object.keys(filter).length > 0 ? filter : undefined,
      includeMetadata: true,
    });

    // Filter by score and format results
    return matches
      .filter((match) => match.score >= minScore)
      .map((match) => ({
        id: match.id,
        text: match.metadata?.text || '',
        metadata: {
          documentId: match.metadata?.documentId || '',
          documentName: match.metadata?.documentName || '',
          chunkIndex: match.metadata?.chunkIndex || 0,
          userId: match.metadata?.userId,
          organizationId: match.metadata?.organizationId,
          createdAt: match.metadata?.createdAt || new Date().toISOString(),
          score: match.score,
          ...match.metadata,
        },
      }));
  } catch (error) {
    console.error('Error searching similar documents:', error);
    throw error;
  }
}

export { pinecone, getIndex };
