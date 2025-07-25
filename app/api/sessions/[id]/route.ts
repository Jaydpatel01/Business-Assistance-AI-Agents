import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { z } from 'zod';

// Validation schemas
const AddMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required'),
  agentType: z.enum(['ceo', 'cfo', 'cto', 'hr', 'user']),
  reasoning: z.string().optional(),
});

// GET session by ID with messages
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Mock session data - replace with actual database queries
    const mockSessionData = {
      id,
      name: 'Q4 Strategic Investment Review',
      scenario: {
        id: 'scenario-1',
        name: 'Strategic Investment Analysis',
        description: 'Evaluate major investment opportunities with comprehensive financial and strategic analysis',
      },
      status: 'active',
      createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString(),
      startedAt: new Date(Date.now() - 28 * 60 * 1000).toISOString(),
      participants: [
        {
          id: session.user.id,
          name: session.user.name || 'Strategic Facilitator',
          role: 'facilitator',
        },
      ],
      messages: [
        {
          id: '1',
          content: 'Based on our Q4 analysis, I recommend allocating 15% of the budget to upskilling programs and change management. Employee engagement scores show readiness for innovation, but we need structured support systems.',
          timestamp: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
          agentType: 'hr',
          reasoning: 'HR analysis shows employee readiness metrics and organizational capacity for change management initiatives.',
        },
        {
          id: '2',
          content: 'The financial projections look promising. ROI estimates suggest a 23% return within 18 months, with break-even at month 8. However, we should consider market volatility and maintain a 20% contingency buffer.',
          timestamp: new Date(Date.now() - 8 * 60 * 1000).toISOString(),
          agentType: 'cfo',
          reasoning: 'Financial modeling based on current market conditions and historical performance data.',
        },
        {
          id: '3',
          content: 'From a technology perspective, our infrastructure can support the proposed expansion. Cloud scalability is ready, and our development team has the capacity. I suggest implementing a phased rollout starting Q1.',
          timestamp: new Date(Date.now() - 5 * 60 * 1000).toISOString(),
          agentType: 'cto',
          reasoning: 'Technical assessment of infrastructure capacity and development team availability.',
        },
      ],
      progress: 65,
      activeAgents: ['ceo', 'cfo', 'cto', 'hr'],
    };

    return NextResponse.json({
      success: true,
      data: mockSessionData,
    });

  } catch (error) {
    console.error('Error fetching session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch session' },
      { status: 500 }
    );
  }
}

// POST add message to session
export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = AddMessageSchema.parse(body);

    // In a real implementation, save to database
    const newMessage = {
      id: `msg-${Date.now()}`,
      sessionId: id,
      content: validatedData.content,
      agentType: validatedData.agentType,
      reasoning: validatedData.reasoning,
      timestamp: new Date().toISOString(),
      userId: session.user.id,
    };

    return NextResponse.json({
      success: true,
      data: newMessage,
    });

  } catch (error) {
    console.error('Error adding message to session:', error);
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Invalid request data', 
          details: error.errors 
        },
        { status: 400 }
      );
    }

    return NextResponse.json(
      { success: false, error: 'Failed to add message' },
      { status: 500 }
    );
  }
}

// PUT update session (for progress, status, etc.)
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const session = await getServerSession(authOptions);
    
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    
    // Update session data (progress, status, active agents, etc.)
    const updatedSession = {
      id,
      ...body,
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedSession,
    });

  } catch (error) {
    console.error('Error updating session:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to update session' },
      { status: 500 }
    );
  }
}
