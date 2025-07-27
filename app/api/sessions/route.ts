import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

// Validation schemas
const CreateSessionSchema = z.object({
  name: z.string().min(1, 'Session name is required'),
  scenarioId: z.string().min(1, 'Scenario ID is required'),
  includeAgents: z.array(z.enum(['ceo', 'cfo', 'cto', 'hr'])).min(1, 'At least one agent must be included'),
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

    // Check if this is a demo user
    const isDemoUser = session.user.role === 'demo';

    if (isDemoUser) {
      // Return comprehensive demo sessions for demo users
      const demoSessions = [
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
            { user: { name: 'Demo User', email: 'demo@user.com' }, role: 'facilitator' },
            { user: { name: 'AI CEO Agent', email: 'ceo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' }
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
            { user: { name: 'Demo User', email: 'demo@user.com' }, role: 'facilitator' },
            { user: { name: 'AI CTO Agent', email: 'cto@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 24 * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - 22 * 60 * 60 * 1000),
          messageCount: 8,
          decisionCount: 1
        }
      ];

      const filteredSessions = demoSessions.filter(sessionItem => {
        if (status && sessionItem.status !== status) return false;
        if (scenarioId && sessionItem.scenario.id !== scenarioId) return false;
        return true;
      });

      return NextResponse.json({
        success: true,
        data: filteredSessions,
      });
    } else {
      // For real users, get data from database
      try {
        const userId = session.user.id;

        // Get user's sessions from database
        const userSessions = await prisma.boardroomSession.findMany({
          where: {
            participants: {
              some: { userId: userId }
            },
            ...(status && { status: status as 'active' | 'completed' | 'scheduled' | 'cancelled' }),
            ...(scenarioId && { scenarioId: scenarioId })
          },
          include: {
            scenario: {
              select: {
                id: true,
                name: true,
                description: true
              }
            },
            participants: {
              include: {
                user: {
                  select: {
                    name: true,
                    email: true
                  }
                }
              }
            },
            messages: {
              select: {
                id: true
              }
            },
            decisions: {
              select: {
                id: true
              }
            }
          },
          orderBy: {
            createdAt: 'desc'
          }
        });

        // Format sessions for response
        const formattedSessions = userSessions.map(sessionItem => ({
          id: sessionItem.id,
          name: sessionItem.name,
          scenario: sessionItem.scenario ? {
            id: sessionItem.scenario.id,
            name: sessionItem.scenario.name,
            description: sessionItem.scenario.description
          } : null,
          status: sessionItem.status,
          participants: sessionItem.participants.map(participant => ({
            user: {
              name: participant.user.name || 'User',
              email: participant.user.email || 'user@example.com'
            },
            role: participant.role
          })),
          createdAt: sessionItem.createdAt,
          startedAt: sessionItem.startedAt,
          endedAt: sessionItem.endedAt,
          messageCount: sessionItem.messages.length,
          decisionCount: sessionItem.decisions.length
        }));

        return NextResponse.json({
          success: true,
          data: formattedSessions,
        });

      } catch (dbError) {
        console.error('Database error fetching sessions:', dbError);
        
        // Fallback to empty array with helpful message for new users
        return NextResponse.json({
          success: true,
          data: [],
          message: 'No sessions found. Create your first session to get started!',
          error: 'Database temporarily unavailable'
        });
      }
    }

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
    const userId = session.user.id;

    try {
      // Create session in database
      const newSession = await prisma.boardroomSession.create({
        data: {
          name: validatedData.name,
          scenarioId: validatedData.scenarioId,
          status: 'active',
          startedAt: new Date(),
          participants: {
            create: {
              userId: userId,
              role: 'facilitator'
            }
          }
        },
        include: {
          scenario: {
            select: {
              id: true,
              name: true,
              description: true
            }
          },
          participants: {
            include: {
              user: {
                select: {
                  name: true,
                  email: true
                }
              }
            }
          }
        }
      });

      // Format response
      const responseSession = {
        id: newSession.id,
        name: newSession.name,
        scenario: newSession.scenario,
        status: newSession.status,
        participants: newSession.participants.map((participant: { user: { name: string | null; email: string | null }; role: string }) => ({
          user: {
            name: participant.user.name || 'User',
            email: participant.user.email || 'user@example.com'
          },
          role: participant.role
        })),
        includeAgents: validatedData.includeAgents,
        createdAt: newSession.createdAt,
        startedAt: newSession.startedAt,
        messageCount: 0,
        decisionCount: 0
      };

      return NextResponse.json({
        success: true,
        data: responseSession,
        message: 'Session created successfully'
      });

    } catch (dbError) {
      console.error('Database error creating session:', dbError);
      
      // Fallback to mock session creation
      const mockSession = {
        id: `session-${Date.now()}`,
        name: validatedData.name,
        scenario: {
          id: validatedData.scenarioId,
          name: 'Selected Scenario',
          description: 'Scenario details will be loaded from database'
        },
        status: 'active',
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
        startedAt: new Date(),
        messageCount: 0,
        decisionCount: 0
      };

      return NextResponse.json({
        success: true,
        data: mockSession,
        message: 'Session created (database temporarily unavailable)',
        warning: 'Session may not persist - please try again later'
      });
    }

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
