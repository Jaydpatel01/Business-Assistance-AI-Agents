/**
 * Enhanced Decision Analysis API
 * Phase 5: Advanced AI Capabilities & Enterprise Features
 */

import { NextRequest, NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
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

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = DecisionAnalysisRequest.parse(body);

    console.log(`🔍 Fetching real session data for session: ${validatedData.sessionId}`);

    // Fetch actual session data from database
    const boardroomSession = await prisma.boardroomSession.findFirst({
      where: {
        id: validatedData.sessionId,
        participants: {
          some: {
            userId: session.user.id
          }
        }
      },
      include: {
        scenario: true,
        messages: {
          include: {
            participant: {
              include: {
                user: {
                  select: {
                    id: true,
                    name: true
                  }
                }
              }
            }
          },
          orderBy: {
            createdAt: 'asc'
          }
        },
        participants: {
          include: {
            user: {
              select: {
                name: true
              }
            }
          }
        }
      }
    });

    if (!boardroomSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Extract real conversation data
    const userMessages = boardroomSession.messages.filter(m => m.agentType === null || m.agentType === 'user');
    const aiMessages = boardroomSession.messages.filter(m => m.agentType !== null && m.agentType !== 'user');
    const agentTypes = [...new Set(aiMessages.map(m => m.agentType).filter((type): type is string => type !== null))];

    console.log(`📊 Session analysis: ${userMessages.length} user messages, ${aiMessages.length} AI messages, ${agentTypes.length} unique agents`);

    // Build real context from session data
    const context: DecisionContext = {
      scenario: boardroomSession.scenario?.name || validatedData.scenario,
      participants: agentTypes.length > 0 ? agentTypes : validatedData.participants,
      timeline: validatedData.timeline,
      budget: validatedData.budget,
      riskTolerance: validatedData.riskTolerance,
      organizationType: validatedData.organizationType,
      sessionMessages: boardroomSession.messages.map(msg => ({
        content: msg.content,
        agentType: msg.agentType || 'user',
        timestamp: msg.createdAt,
        participant: msg.participant?.user?.name || 'User'
      })),
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

// Helper function to log decision analysis for tracking and save to database
async function logDecisionAnalysis(sessionId: string, scenario: string, recommendation: { recommendation: string; confidence: number; riskAssessment: { riskScore: number } }): Promise<void> {
  try {
    console.log(`📝 Logging decision analysis: ${sessionId} - ${scenario}`);
    
    const { prisma } = await import('@/lib/db/connection');
    const { getServerSession } = await import('next-auth');
    const { authOptions } = await import('@/lib/auth/config');
    
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) return;

    // Check if session exists in database
    const boardroomSession = await prisma.boardroomSession.findUnique({
      where: { id: sessionId }
    });

    if (boardroomSession) {
      // Save decision summary to database
      await prisma.decision.create({
        data: {
          sessionId: sessionId,
          title: `Decision Analysis: ${scenario}`,
          description: recommendation.recommendation,
          status: 'proposed', // Set default status
          confidence: recommendation.confidence,
          riskLevel: recommendation.riskAssessment.riskScore,
          createdBy: session.user.id,
          metadata: JSON.stringify({
            analysisType: 'ai_generated',
            scenario: scenario,
            riskScore: recommendation.riskAssessment.riskScore,
            timestamp: new Date().toISOString()
          })
        }
      });
      
      console.log('✅ Decision summary saved to database');
    } else {
      console.log('ℹ️ Session not found in database, skipping database save');
    }

  } catch (error) {
    console.error('❌ Failed to log decision analysis:', error);
    // Don't throw error - logging failure shouldn't break the main flow
  }
}
