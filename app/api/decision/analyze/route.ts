/**
 * Enhanced Decision Analysis API
 * Phase 5: Advanced AI Capabilities & Enterprise Features
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { DecisionEngine, DecisionContext } from '@/lib/ai/decision-engine';

const DecisionAnalysisRequest = z.object({
  sessionId: z.string(),
  scenario: z.string(),
  documents: z.array(z.string()).optional(),
  participants: z.array(z.string()),
  timeline: z.string(),
  budget: z.number().optional(),
  riskTolerance: z.enum(['low', 'medium', 'high']),
  organizationType: z.string(),
  previousDecisions: z.array(z.object({
    id: z.string(),
    scenario: z.string(),
    decision: z.string(),
    outcome: z.enum(['positive', 'negative', 'neutral']),
    confidence: z.number(),
    timestamp: z.string(),
    factors: z.array(z.string())
  })).optional()
});

export async function POST(request: NextRequest) {
  try {
    console.log('🧠 Decision Analysis API: Received analysis request');

    const body = await request.json();
    const validatedData = DecisionAnalysisRequest.parse(body);

    // Create decision context
    const context: DecisionContext = {
      scenario: validatedData.scenario,
      documents: validatedData.documents,
      participants: validatedData.participants,
      timeline: validatedData.timeline,
      budget: validatedData.budget,
      riskTolerance: validatedData.riskTolerance,
      organizationType: validatedData.organizationType,
      previousDecisions: validatedData.previousDecisions?.map(d => ({
        ...d,
        timestamp: new Date(d.timestamp)
      }))
    };

    console.log(`🎯 Analyzing decision for scenario: ${context.scenario}`);
    console.log(`📊 Context: ${context.participants.length} participants, risk tolerance: ${context.riskTolerance}`);

    // Initialize decision engine
    const decisionEngine = new DecisionEngine('openai');

    // Add any historical decisions to the engine
    if (context.previousDecisions) {
      context.previousDecisions.forEach(decision => {
        decisionEngine.addDecisionHistory(decision);
      });
    }

    // Perform comprehensive analysis
    const startTime = Date.now();
    const recommendation = await decisionEngine.analyzeDecision(context);
    const analysisTime = Date.now() - startTime;

    // Log the analysis for tracking
    await logDecisionAnalysis(validatedData.sessionId, context.scenario, recommendation);

    console.log(`✅ Decision analysis completed in ${analysisTime}ms`);
    console.log(`🎯 Recommendation: ${recommendation.recommendation} (${recommendation.confidence}% confidence)`);
    console.log(`⚠️ Risk Level: ${recommendation.riskAssessment.overallRisk} (${recommendation.riskAssessment.riskScore}/100)`);

    // Get historical insights
    const historicalInsights = decisionEngine.getHistoricalInsights(context.scenario);

    // Return comprehensive analysis
    return NextResponse.json({
      success: true,
      data: {
        sessionId: validatedData.sessionId,
        scenario: context.scenario,
        recommendation,
        historicalInsights,
        analysisMetadata: {
          analysisTime,
          timestamp: new Date().toISOString(),
          engineVersion: '1.0.0'
        }
      }
    });

  } catch (error) {
    console.error('❌ Decision Analysis API Error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json({
        success: false,
        error: 'Invalid request data',
        details: error.errors
      }, { status: 400 });
    }

    return NextResponse.json({
      success: false,
      error: 'Failed to analyze decision',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId) {
      return NextResponse.json({
        success: false,
        error: 'Session ID is required'
      }, { status: 400 });
    }

    console.log(`📋 Decision Analysis API: Fetching analysis history for session ${sessionId}`);

    // In a real implementation, you would fetch from database
    // For now, return mock historical data
    const mockHistory = [
      {
        id: 'analysis_1',
        sessionId,
        scenario: 'Budget Allocation for New Product Launch',
        recommendation: 'proceed_with_caution',
        confidence: 78,
        riskLevel: 'medium',
        timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      },
      {
        id: 'analysis_2',
        sessionId,
        scenario: 'Market Expansion Strategy',
        recommendation: 'proceed',
        confidence: 85,
        riskLevel: 'low',
        timestamp: new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(),
        status: 'completed'
      }
    ];

    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        analyses: mockHistory,
        total: mockHistory.length
      }
    });

  } catch (error) {
    console.error('❌ Decision Analysis History API Error:', error);

    return NextResponse.json({
      success: false,
      error: 'Failed to fetch analysis history',
      message: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

// Helper function to log decision analysis for tracking
async function logDecisionAnalysis(sessionId: string, scenario: string, recommendation: { recommendation: string; confidence: number; riskAssessment: { riskScore: number } }): Promise<void> {
  try {
    console.log(`📝 Logging decision analysis: ${sessionId} - ${scenario}`);
    
    // In a real implementation, save to database for analytics
    const logEntry = {
      sessionId,
      scenario,
      recommendation: recommendation.recommendation,
      confidence: recommendation.confidence,
      riskScore: recommendation.riskAssessment.riskScore,
      timestamp: new Date().toISOString()
    };

    console.log('📊 Analysis log entry:', logEntry);
    
    // TODO: Save to database
    // await db.decisionAnalysis.create({ data: logEntry });

  } catch (error) {
    console.error('❌ Failed to log decision analysis:', error);
    // Don't throw error - logging failure shouldn't break the main flow
  }
}
