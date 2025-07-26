import { pipeline, FeatureExtractionPipeline } from '@xenova/transformers';

interface DocumentMetadata {
  [key: string]: string | number | boolean;
}

export interface LocalEmbeddingService {
  generateEmbeddings(text: string): Promise<number[]>;
  chunkText(text: string, maxChunkSize?: number): string[];
  processDocumentForEmbedding(content: string, metadata?: DocumentMetadata): Promise<Array<{
    content: string;
    embedding: number[];
    metadata: DocumentMetadata;
  }>>;
}

class LocalEmbeddingServiceImpl implements LocalEmbeddingService {
  private embedder: FeatureExtractionPipeline | null = null;
  private readonly modelName = 'Xenova/all-MiniLM-L6-v2';
  private readonly defaultChunkSize = 512;

  private async initializeEmbedder(): Promise<FeatureExtractionPipeline> {
    if (!this.embedder) {
      console.log('Loading local embedding model...');
      this.embedder = await pipeline('feature-extraction', this.modelName) as FeatureExtractionPipeline;
      console.log('Local embedding model loaded successfully');
    }
    return this.embedder;
  }

  async generateEmbeddings(text: string): Promise<number[]> {
    try {
      const embedder = await this.initializeEmbedder();
      const result = await embedder(text, { pooling: 'mean', normalize: true });
      
      // Convert tensor to array and ensure it's a number array
      const embedding = Array.from(result.data) as number[];
      
      console.log(`Generated embedding for text of length ${text.length}, embedding dimensions: ${embedding.length}`);
      return embedding;
    } catch (error) {
      console.error('Error generating local embeddings:', error);
      throw new Error(`Failed to generate embeddings: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  }

  chunkText(text: string, maxChunkSize: number = this.defaultChunkSize): string[] {
    if (!text || text.trim().length === 0) {
      return [];
    }

    // Split by sentences first
    const sentences = text.split(/[.!?]+/).filter(s => s.trim().length > 0);
    const chunks: string[] = [];
    let currentChunk = '';

    for (const sentence of sentences) {
      const trimmedSentence = sentence.trim();
      if (!trimmedSentence) continue;

      // If adding this sentence would exceed chunk size, save current chunk
      if (currentChunk.length + trimmedSentence.length > maxChunkSize && currentChunk.length > 0) {
        chunks.push(currentChunk.trim());
        currentChunk = trimmedSentence;
      } else {
        currentChunk += (currentChunk ? '. ' : '') + trimmedSentence;
      }
    }

    // Add the last chunk if it has content
    if (currentChunk.trim().length > 0) {
      chunks.push(currentChunk.trim());
    }

    return chunks.length > 0 ? chunks : [text]; // Fallback to original text if no chunks
  }

  async processDocumentForEmbedding(
    content: string,
    metadata: DocumentMetadata = {}
  ): Promise<Array<{
    content: string;
    embedding: number[];
    metadata: DocumentMetadata;
  }>> {
    const chunks = this.chunkText(content);
    const results = [];

    for (let i = 0; i < chunks.length; i++) {
      const chunk = chunks[i];
      try {
        const embedding = await this.generateEmbeddings(chunk);
        results.push({
          content: chunk,
          embedding,
          metadata: {
            ...metadata,
            chunkIndex: i,
            totalChunks: chunks.length,
            chunkSize: chunk.length,
            embeddingModel: this.modelName
          }
        });
      } catch (error) {
        console.error(`Error processing chunk ${i}:`, error);
        // Continue with other chunks
      }
    }

    return results;
  }

  // Utility method to get model info
  getModelInfo() {
    return {
      modelName: this.modelName,
      maxChunkSize: this.defaultChunkSize,
      isLocal: true,
      dimensions: 384 // all-MiniLM-L6-v2 produces 384-dimensional embeddings
    };
  }
}

// Export singleton instance
export const localEmbeddingService = new LocalEmbeddingServiceImpl();

// Export class for testing
export { LocalEmbeddingServiceImpl };
