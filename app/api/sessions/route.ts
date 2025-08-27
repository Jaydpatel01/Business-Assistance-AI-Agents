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
            id: 'strategic-investment-analysis',
            name: 'Budget Allocation Strategy',
            description: 'Planning Q4 budget allocation across departments with focus on ROI optimization'
          },
          status: 'active',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI CEO Agent', email: 'ceo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CTO Agent', email: 'cto@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 2 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 1 * 60 * 60 * 1000),
          messageCount: 18,
          decisionCount: 3
        },
        {
          id: 'session-2',
          name: 'Market Expansion Discussion',
          scenario: {
            id: 'market-expansion-strategy',
            name: 'European Market Entry',
            description: 'Evaluating expansion opportunities in European markets with risk assessment'
          },
          status: 'completed',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI CEO Agent', email: 'ceo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI Marketing Agent', email: 'marketing@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 48 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 47 * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - 45 * 60 * 60 * 1000),
          messageCount: 24,
          decisionCount: 2
        },
        {
          id: 'session-3',
          name: 'Digital Transformation Initiative',
          scenario: {
            id: 'digital-transformation-roadmap',
            name: 'Technology Modernization',
            description: 'Comprehensive digital transformation strategy for next 18 months'
          },
          status: 'completed',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI CTO Agent', email: 'cto@ai.agent' }, role: 'participant' },
            { user: { name: 'AI HR Agent', email: 'hr@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 72 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 71 * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - 69 * 60 * 60 * 1000),
          messageCount: 31,
          decisionCount: 4
        },
        {
          id: 'session-4',
          name: 'Cost Optimization Review',
          scenario: {
            id: 'cost-optimization-initiative',
            name: 'Operational Efficiency',
            description: 'Identifying cost reduction opportunities without impacting quality'
          },
          status: 'scheduled',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI Operations Agent', email: 'ops@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 12 * 60 * 60 * 1000),
          scheduledDate: new Date(Date.now() + 24 * 60 * 60 * 1000),
          messageCount: 0,
          decisionCount: 0
        },
        {
          id: 'session-5',
          name: 'Customer Retention Strategy',
          scenario: {
            id: 'customer-retention-strategy',
            name: 'Customer Success Optimization',
            description: 'Developing comprehensive customer retention and satisfaction initiatives'
          },
          status: 'completed',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI Marketing Agent', email: 'marketing@ai.agent' }, role: 'participant' },
            { user: { name: 'AI Customer Success Agent', email: 'cs@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CEO Agent', email: 'ceo@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 96 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 95 * 60 * 60 * 1000),
          endedAt: new Date(Date.now() - 93 * 60 * 60 * 1000),
          messageCount: 22,
          decisionCount: 3
        },
        {
          id: 'session-6',
          name: 'Workforce Planning & Development',
          scenario: {
            id: 'workforce-planning-restructuring',
            name: 'Team Restructuring',
            description: 'Strategic workforce planning and skill development roadmap'
          },
          status: 'active',
          participants: [
            { user: { name: 'Demo User', email: 'demo@businessai.com' }, role: 'facilitator' },
            { user: { name: 'AI HR Agent', email: 'hr@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CEO Agent', email: 'ceo@ai.agent' }, role: 'participant' },
            { user: { name: 'AI CFO Agent', email: 'cfo@ai.agent' }, role: 'participant' }
          ],
          createdAt: new Date(Date.now() - 8 * 60 * 60 * 1000),
          startedAt: new Date(Date.now() - 6 * 60 * 60 * 1000),
          messageCount: 15,
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
        
        const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
        
        // Return proper error instead of fallback
        return NextResponse.json({
          success: false,
          error: 'Failed to fetch sessions due to database error. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        }, { status: 500 });
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
      // First, check if scenario exists in database
      const scenario = await prisma.scenario.findUnique({
        where: { id: validatedData.scenarioId }
      });
      
      // If scenario doesn't exist in database, check if it's a predefined scenario
      if (!scenario) {
        const { getPredefinedScenarios } = await import('@/lib/scenarios/predefined-scenarios');
        const predefinedScenarios = getPredefinedScenarios();
        const predefinedScenario = predefinedScenarios.find(s => s.id === validatedData.scenarioId);
        
        if (predefinedScenario) {
          console.log(`📋 Using predefined scenario ${validatedData.scenarioId} (not saving to database)`);
          // Don't save predefined scenarios to database to avoid duplicates
        } else {
          return NextResponse.json(
            { success: false, error: `Scenario with ID "${validatedData.scenarioId}" not found` },
            { status: 400 }
          );
        }
      }

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
      
      const errorMessage = dbError instanceof Error ? dbError.message : 'Unknown database error';
      
      // Check if it's a specific database constraint error
      if (errorMessage.includes('Foreign key constraint')) {
        return NextResponse.json(
          { success: false, error: 'Invalid scenario ID. Please select a valid scenario.' },
          { status: 400 }
        );
      }
      if (errorMessage.includes('Unique constraint')) {
        return NextResponse.json(
          { success: false, error: 'A session with this name already exists. Please choose a different name.' },
          { status: 400 }
        );
      }

      // Generic database error - don't fallback to mock, provide real error
      return NextResponse.json(
        { 
          success: false, 
          error: 'Failed to create session due to database error. Please try again.',
          details: process.env.NODE_ENV === 'development' ? errorMessage : undefined
        },
        { status: 500 }
      );
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
