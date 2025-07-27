/**
 * API Route: /api/memory
 * Phase 5: Memory & Learning Systems Endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { memoryService } from '../../../lib/ai/memory-service';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'get_stats':
        return await handleGetStats(params);
      case 'get_personality':
        return await handleGetPersonality(params);
      case 'get_patterns':
        return await handleGetPatterns(params);
      case 'generate_advice':
        return await handleGenerateAdvice(params);
      case 'learn_outcome':
        return await handleLearnOutcome(params);
      case 'store_memory':
        return await handleStoreMemory(params);
      case 'get_memories':
        return await handleGetMemories(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Memory API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleGetStats(params: { agentType: string }) {
  const { agentType } = params;

  if (!agentType) {
    return NextResponse.json(
      { error: 'Missing agentType parameter' },
      { status: 400 }
    );
  }

  const stats = memoryService.getMemoryStats(agentType);
  
  return NextResponse.json({
    success: true,
    stats
  });
}

async function handleGetPersonality(params: { agentType: string }) {
  const { agentType } = params;

  if (!agentType) {
    return NextResponse.json(
      { error: 'Missing agentType parameter' },
      { status: 400 }
    );
  }

  const personality = memoryService.getAgentPersonality(agentType);
  
  return NextResponse.json({
    success: true,
    personality
  });
}

async function handleGetPatterns(params: { agentType: string }) {
  const { agentType } = params;

  if (!agentType) {
    return NextResponse.json(
      { error: 'Missing agentType parameter' },
      { status: 400 }
    );
  }

  const patterns = memoryService.getLearnedPatterns(agentType);
  
  return NextResponse.json({
    success: true,
    patterns
  });
}

async function handleGenerateAdvice(params: { 
  agentType: string; 
  context: string; 
}) {
  const { agentType, context } = params;

  if (!agentType || !context) {
    return NextResponse.json(
      { error: 'Missing agentType or context parameter' },
      { status: 400 }
    );
  }

  try {
    const advice = await memoryService.generateContextualAdvice(agentType, context);
    
    return NextResponse.json({
      success: true,
      advice
    });
  } catch (error) {
    console.error('Error generating advice:', error);
    return NextResponse.json(
      { 
        error: 'Failed to generate advice',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleLearnOutcome(params: {
  agentType: string;
  decisionContext: string;
  decision: string;
  outcome: 'success' | 'failure' | 'partial';
  businessMetrics?: Record<string, number>;
}) {
  const { agentType, decisionContext, decision, outcome, businessMetrics } = params;

  if (!agentType || !decisionContext || !decision || !outcome) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    await memoryService.learnFromOutcome(
      agentType,
      decisionContext,
      decision,
      outcome,
      businessMetrics
    );
    
    return NextResponse.json({
      success: true,
      message: 'Learning completed successfully'
    });
  } catch (error) {
    console.error('Error learning from outcome:', error);
    return NextResponse.json(
      { 
        error: 'Failed to learn from outcome',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleStoreMemory(params: {
  agentType: string;
  sessionId: string;
  memoryType: 'decision' | 'outcome' | 'pattern' | 'preference' | 'error';
  context: string;
  content: string;
  metadata: {
    confidence: number;
    relevanceScore: number;
    tags: string[];
    relatedMemories?: string[];
    outcome?: 'success' | 'failure' | 'partial';
    businessMetrics?: Record<string, number>;
  };
}) {
  const { agentType, sessionId, memoryType, context, content, metadata } = params;

  if (!agentType || !sessionId || !memoryType || !context || !content || !metadata) {
    return NextResponse.json(
      { error: 'Missing required parameters' },
      { status: 400 }
    );
  }

  try {
    const memoryId = await memoryService.storeMemory({
      agentType,
      sessionId,
      memoryType,
      context,
      content,
      metadata
    });
    
    return NextResponse.json({
      success: true,
      memoryId
    });
  } catch (error) {
    console.error('Error storing memory:', error);
    return NextResponse.json(
      { 
        error: 'Failed to store memory',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleGetMemories(params: {
  agentType: string;
  context?: string;
  limit?: number;
}) {
  const { agentType, context, limit = 10 } = params;

  if (!agentType) {
    return NextResponse.json(
      { error: 'Missing agentType parameter' },
      { status: 400 }
    );
  }

  try {
    const memories = context 
      ? await memoryService.retrieveRelevantMemories(agentType, context, limit)
      : [];
    
    return NextResponse.json({
      success: true,
      memories
    });
  } catch (error) {
    console.error('Error retrieving memories:', error);
    return NextResponse.json(
      { 
        error: 'Failed to retrieve memories',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json({
    message: 'Memory & Learning API - Use POST with appropriate action',
    actions: [
      'get_stats',
      'get_personality', 
      'get_patterns',
      'generate_advice',
      'learn_outcome',
      'store_memory',
      'get_memories'
    ]
  });
}
