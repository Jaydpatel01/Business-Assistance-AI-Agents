/**
 * Explainable AI API Endpoints
 * 
 * Provides API access to decision transparency and reasoning analysis
 */

import { NextRequest, NextResponse } from 'next/server';
import { explainableAIService } from '@/lib/ai/explainable-ai-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action } = body;

    switch (action) {
      case 'start_tracking':
        return handleStartTracking(body);
      
      case 'add_reasoning_step':
        return handleAddReasoningStep(body);
      
      case 'complete_tracking':
        return handleCompleteTracking(body);
      
      case 'get_audit_trail':
        return handleGetAuditTrail(body);
      
      case 'get_audit_trails':
        return handleGetAuditTrails(body);
      
      case 'add_feedback':
        return handleAddFeedback(body);
      
      case 'record_outcome':
        return handleRecordOutcome(body);
      
      case 'get_explanation':
        return handleGetExplanation(body);
      
      case 'get_confidence_breakdown':
        return handleGetConfidenceBreakdown(body);
      
      case 'get_metrics':
        return handleGetMetrics(body);
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Explainable AI API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

async function handleStartTracking(body: {
  sessionId: string;
  agentType: string;
  query: string;
  context: {
    sessionType?: string;
    documents?: string[];
    marketData?: string[];
    collaboration?: string[];
    memory?: string[];
  };
}) {
  const { sessionId, agentType, query, context } = body;
  
  if (!sessionId || !agentType || !query) {
    return NextResponse.json(
      { error: 'Missing required fields: sessionId, agentType, query' },
      { status: 400 }
    );
  }

  const auditId = explainableAIService.startDecisionTracking(
    sessionId,
    agentType,
    query,
    context
  );

  return NextResponse.json({
    success: true,
    auditId,
    message: 'Decision tracking started'
  });
}

async function handleAddReasoningStep(body: {
  auditId: string;
  type: 'analysis' | 'synthesis' | 'conclusion' | 'evidence' | 'assumption';
  description: string;
  evidence: Array<{
    type: 'document' | 'market_data' | 'memory' | 'collaboration' | 'external';
    source: string;
    content: string;
    relevance: number;
    reliability: number;
    citation: string;
    metadata?: Record<string, unknown>;
  }>;
  confidence: number;
  processingTime: number;
}) {
  const { auditId, type, description, evidence, confidence, processingTime } = body;
  
  if (!auditId || !type || !description || confidence === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  // Convert evidence to proper format
  const formattedEvidence = evidence.map(e => ({
    id: `evidence_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    ...e,
    metadata: e.metadata || {}
  }));

  explainableAIService.addReasoningStep(
    auditId,
    type,
    description,
    formattedEvidence,
    confidence,
    processingTime
  );

  return NextResponse.json({
    success: true,
    message: 'Reasoning step added'
  });
}

async function handleCompleteTracking(body: {
  auditId: string;
  decision: string;
  overallConfidence: number;
}) {
  const { auditId, decision, overallConfidence } = body;
  
  if (!auditId || !decision || overallConfidence === undefined) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  const auditTrail = explainableAIService.completeDecisionTracking(
    auditId,
    decision,
    overallConfidence
  );

  return NextResponse.json({
    success: true,
    auditTrail,
    message: 'Decision tracking completed'
  });
}

async function handleGetAuditTrail(body: {
  auditId: string;
}) {
  const { auditId } = body;
  
  if (!auditId) {
    return NextResponse.json(
      { error: 'Missing auditId' },
      { status: 400 }
    );
  }

  const auditTrail = explainableAIService.getAuditTrail(auditId);
  
  if (!auditTrail) {
    return NextResponse.json(
      { error: 'Audit trail not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    auditTrail
  });
}

async function handleGetAuditTrails(body: {
  filters?: {
    sessionId?: string;
    agentType?: string;
    outcome?: 'success' | 'failure' | 'pending';
    startDate?: string;
    endDate?: string;
  };
}) {
  const { filters = {} } = body;
  
  // Convert date strings to Date objects
  const processedFilters = {
    ...filters,
    startDate: filters.startDate ? new Date(filters.startDate) : undefined,
    endDate: filters.endDate ? new Date(filters.endDate) : undefined
  };

  const auditTrails = explainableAIService.getAuditTrails(processedFilters);

  return NextResponse.json({
    success: true,
    auditTrails,
    count: auditTrails.length
  });
}

async function handleAddFeedback(body: {
  auditId: string;
  userId: string;
  type: 'rating' | 'comment' | 'correction' | 'validation';
  value: number | string;
  context: string;
}) {
  const { auditId, userId, type, value, context } = body;
  
  if (!auditId || !userId || !type || value === undefined || !context) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  explainableAIService.addUserFeedback(auditId, userId, type, value, context);

  return NextResponse.json({
    success: true,
    message: 'Feedback added'
  });
}

async function handleRecordOutcome(body: {
  auditId: string;
  outcome: 'success' | 'failure';
  businessImpact?: {
    revenue_impact?: number;
    efficiency_gain?: number;
    risk_reduction?: number;
    user_satisfaction?: number;
  };
}) {
  const { auditId, outcome, businessImpact } = body;
  
  if (!auditId || !outcome) {
    return NextResponse.json(
      { error: 'Missing required fields' },
      { status: 400 }
    );
  }

  explainableAIService.recordOutcome(auditId, outcome, businessImpact);

  return NextResponse.json({
    success: true,
    message: 'Outcome recorded'
  });
}

async function handleGetExplanation(body: {
  auditId: string;
}) {
  const { auditId } = body;
  
  if (!auditId) {
    return NextResponse.json(
      { error: 'Missing auditId' },
      { status: 400 }
    );
  }

  const explanation = explainableAIService.generateDecisionExplanation(auditId);
  
  if (!explanation) {
    return NextResponse.json(
      { error: 'Explanation not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    explanation
  });
}

async function handleGetConfidenceBreakdown(body: {
  auditId: string;
}) {
  const { auditId } = body;
  
  if (!auditId) {
    return NextResponse.json(
      { error: 'Missing auditId' },
      { status: 400 }
    );
  }

  const breakdown = explainableAIService.generateConfidenceBreakdown(auditId);
  
  if (!breakdown) {
    return NextResponse.json(
      { error: 'Confidence breakdown not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    breakdown
  });
}

async function handleGetMetrics(body: {
  agentType?: string;
}) {
  const { agentType } = body;

  const metrics = explainableAIService.getExplainabilityMetrics(agentType);

  return NextResponse.json({
    success: true,
    metrics,
    agentType: agentType || 'overall'
  });
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const action = searchParams.get('action');
  const auditId = searchParams.get('auditId');
  const agentType = searchParams.get('agentType');

  try {
    switch (action) {
      case 'get_audit_trail':
        if (!auditId) {
          return NextResponse.json(
            { error: 'Missing auditId parameter' },
            { status: 400 }
          );
        }
        
        const auditTrail = explainableAIService.getAuditTrail(auditId);
        
        if (!auditTrail) {
          return NextResponse.json(
            { error: 'Audit trail not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          auditTrail
        });

      case 'get_metrics':
        const metrics = explainableAIService.getExplainabilityMetrics(agentType || undefined);
        
        return NextResponse.json({
          success: true,
          metrics,
          agentType: agentType || 'overall'
        });

      case 'get_explanation':
        if (!auditId) {
          return NextResponse.json(
            { error: 'Missing auditId parameter' },
            { status: 400 }
          );
        }
        
        const explanation = explainableAIService.generateDecisionExplanation(auditId);
        
        if (!explanation) {
          return NextResponse.json(
            { error: 'Explanation not found' },
            { status: 404 }
          );
        }

        return NextResponse.json({
          success: true,
          explanation
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Explainable AI GET API error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
