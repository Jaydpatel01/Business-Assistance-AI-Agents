import { NextRequest, NextResponse } from 'next/server';
import { getIndexStats } from '@/lib/pinecone';
import { addDocumentToRAG, searchRAG, getRAGContext, removeDocumentFromRAG } from '@/lib/rag';

// GET /api/rag - Get RAG system status and stats
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const dimensions = searchParams.get('dimensions') ? parseInt(searchParams.get('dimensions')!) : undefined;
    
    const stats = await getIndexStats(dimensions);
    
    return NextResponse.json({
      success: true,
      status: 'RAG system operational',
      pineconeStats: stats,
      indexType: dimensions === 384 ? 'local (384D)' : 'openai (3072D)',
      timestamp: new Date().toISOString(),
    });
  } catch (error) {
    console.error('Error getting RAG stats:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to get RAG system stats',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}

// POST /api/rag - Add document or search
export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, ...params } = body;

    switch (action) {
      case 'addDocument': {
        const { document, options = {} } = params;
        
        if (!document || !document.id || !document.name || !document.content) {
          return NextResponse.json(
            { success: false, error: 'Missing required document fields (id, name, content)' },
            { status: 400 }
          );
        }

        const result = await addDocumentToRAG(document, options);
        
        return NextResponse.json({
          success: true,
          action: 'addDocument',
          result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'search': {
        const { query, options = {} } = params;
        
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Missing query parameter' },
            { status: 400 }
          );
        }

        const results = await searchRAG(query, options);
        
        return NextResponse.json({
          success: true,
          action: 'search',
          query,
          results,
          count: results.length,
          timestamp: new Date().toISOString(),
        });
      }

      case 'getContext': {
        const { query, options = {} } = params;
        
        if (!query) {
          return NextResponse.json(
            { success: false, error: 'Missing query parameter' },
            { status: 400 }
          );
        }

        const context = await getRAGContext(query, options);
        
        return NextResponse.json({
          success: true,
          action: 'getContext',
          query,
          context,
          timestamp: new Date().toISOString(),
        });
      }

      case 'removeDocument': {
        const { documentId, options = {} } = params;
        
        if (!documentId) {
          return NextResponse.json(
            { success: false, error: 'Missing documentId parameter' },
            { status: 400 }
          );
        }

        const result = await removeDocumentFromRAG(documentId, options);
        
        return NextResponse.json({
          success: true,
          action: 'removeDocument',
          result,
          timestamp: new Date().toISOString(),
        });
      }

      case 'testLocal': {
        const { text } = params;
        
        if (!text) {
          return NextResponse.json(
            { success: false, error: 'Missing text parameter' },
            { status: 400 }
          );
        }

        // Test local embedding generation
        const { localEmbeddingService } = await import('@/lib/local-embeddings');
        const embedding = await localEmbeddingService.generateEmbeddings(text);
        
        return NextResponse.json({
          success: true,
          action: 'testLocal',
          text,
          embedding: {
            dimensions: embedding.length,
            preview: embedding.slice(0, 5), // Show first 5 values
            model: localEmbeddingService.getModelInfo(),
          },
          timestamp: new Date().toISOString(),
        });
      }

      default:
        return NextResponse.json(
          { success: false, error: `Unknown action: ${action}` },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Error in RAG API:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'RAG operation failed',
        details: error instanceof Error ? error.message : 'Unknown error',
      },
      { status: 500 }
    );
  }
}
