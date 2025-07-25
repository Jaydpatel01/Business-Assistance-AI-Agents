import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

// Validation schemas
const CreateSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  scenarioId: z.string().min(1, 'Scenario ID is required'),
  includeAgents: z.array(z.enum(['ceo', 'cfo', 'cto', 'hr'])).min(1, 'At least one agent must be included'),
  scheduledFor: z.string().datetime().optional(),
});

// GET all sessions for the current user
export async function GET(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const status = searchParams.get('status');
    const scenarioId = searchParams.get('scenarioId');

    // For now, return mock sessions since database isn't set up yet
    const mockSessions = [
      {
        id: 'session-1',
        name: 'Q4 Budget Planning',
        scenario: {
          id: 'scenario-1',
          name: 'Budget Allocation Strategy',
          description: 'Planning Q4 budget allocation across departments'
        },
        status: 'active',
        participants: [
          { user: { name: 'John Doe', email: 'john@company.com' }, role: 'facilitator' },
          { user: { name: 'Jane Smith', email: 'jane@company.com' }, role: 'participant' }
        ],
        createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
        messageCount: 12,
        decisionCount: 2
      },
      {
        id: 'session-2',
        name: 'Market Expansion Discussion',
        scenario: {
          id: 'scenario-2',
          name: 'European Market Entry',
          description: 'Evaluating expansion opportunities in European markets'
        },
        status: 'completed',
        participants: [
          { user: { name: 'Mike Johnson', email: 'mike@company.com' }, role: 'facilitator' }
        ],
        createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
        endedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
        messageCount: 8,
        decisionCount: 1
      }
    ];

    const filteredSessions = mockSessions.filter(session => {
      if (status && session.status !== status) return false;
      if (scenarioId && session.scenario.id !== scenarioId) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filteredSessions,
    });

  } catch (error) {
    console.error('Error fetching sessions:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}

// POST create new session
export async function POST(request: Request) {
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = CreateSessionSchema.parse(body);

    // Mock session creation - in real implementation, this would create in database
    const newSession = {
      id: `session-${Date.now()}`,
      name: validatedData.name,
      scenario: {
        id: validatedData.scenarioId,
        name: 'Mock Scenario',
        description: 'This is a mock scenario for testing'
      },
      status: 'scheduled',
      participants: [
        { 
          user: { 
            name: session.user.name || 'User', 
            email: session.user.email || 'user@example.com' 
          }, 
          role: 'facilitator' 
        }
      ],
      includeAgents: validatedData.includeAgents,
      createdAt: new Date(),
      scheduledFor: validatedData.scheduledFor ? new Date(validatedData.scheduledFor) : null,
      messageCount: 0,
      decisionCount: 0
    };

    return NextResponse.json({
      success: true,
      data: newSession,
    });

  } catch (error) {
    console.error('Error creating session:', error);
    
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
      { success: false, error: 'Failed to create session' },
      { status: 500 }
    );
  }
}
