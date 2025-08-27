import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { z } from 'zod';
import { PREDEFINED_SCENARIOS } from '@/lib/scenarios/predefined-scenarios';

// Validation schema for session creation
const CreateSessionSchema = z.object({
  // Support both old and new field names for backward compatibility
  sessionName: z.string().optional(),
  name: z.string().optional(),
  sessionDescription: z.string().optional(),
  description: z.string().optional(),
  scenarioId: z.string().min(1, 'Scenario ID is required'),
  selectedAgents: z.array(z.string()).optional().default(['ceo', 'cfo']), // Default agents if not provided
  companyName: z.string().optional(),
  scheduledFor: z.string().optional(),
  metadata: z.record(z.any()).optional(),
}).refine(data => data.sessionName || data.name, {
  message: "Either sessionName or name is required"
});

// POST - Create a new boardroom session
export async function POST(request: NextRequest) {
  try {
    console.log('🏢 Boardroom Sessions API: Creating new session');

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const body = await request.json();

    // Validate request data
    const validatedData = CreateSessionSchema.parse(body);
    
    // Support both old and new field names
    const sessionName = validatedData.sessionName || validatedData.name || 'Unnamed Session';
    const { scenarioId, selectedAgents } = validatedData;

    console.log(`📝 Creating session "${sessionName}" for user ${userId} with scenario ${scenarioId}`);

    // Ensure the user exists in the database (needed for foreign key constraints)
    let user = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!user) {
      console.log(`🔄 User ${userId} not found in database, creating user record`);
      // Create a basic user record if it doesn't exist (for session-based users)
      try {
        user = await prisma.user.create({
          data: {
            id: userId,
            email: session.user.email || `user-${userId}@system.local`,
            name: session.user.name || 'System User',
            role: 'user'
          }
        });
        console.log(`✅ Created user record for ${userId}`);
      } catch (error) {
        console.error(`❌ Error creating user record:`, error);
        return NextResponse.json(
          { 
            success: false, 
            error: 'Failed to create user record' 
          },
          { status: 500 }
        );
      }
    }

    // Verify the scenario exists (check database first, then predefined scenarios)
    let scenario = await prisma.scenario.findUnique({
      where: { id: scenarioId }
    });

    let isPredefinedScenario = false;
    let predefinedScenario = null;

    if (!scenario) {
      // Check if it's a predefined scenario
      predefinedScenario = PREDEFINED_SCENARIOS.find(s => s.id === scenarioId);
      if (predefinedScenario) {
        console.log(`📋 Using predefined scenario ${scenarioId} (creating in database if needed)`);
        isPredefinedScenario = true;
        
        // Try to create the predefined scenario in the database
        // Use upsert to handle case where it might already exist
        console.log(`🏗️ Creating/finding predefined scenario ${scenarioId} in database`);
        try {
          scenario = await prisma.scenario.upsert({
            where: { id: scenarioId },
            update: {}, // Don't update if it already exists
            create: {
              id: scenarioId, // Use predefined scenario ID
              name: predefinedScenario.name,
              description: predefinedScenario.description,
              parameters: JSON.stringify(predefinedScenario.parameters),
              tags: JSON.stringify(predefinedScenario.tags),
              status: predefinedScenario.status,
              organizationId: null,
              createdById: userId,
            }
          });
          console.log(`✅ Predefined scenario ${scenarioId} ready in database`);
        } catch (error) {
          console.error(`❌ Error creating predefined scenario in database:`, error);
          return NextResponse.json(
            { 
              success: false, 
              error: `Failed to create predefined scenario in database: ${error}` 
            },
            { status: 500 }
          );
        }
      } else {
        // Check if it's a numeric ID that might be a database scenario
        console.log(`❌ Scenario ${scenarioId} not found in predefined scenarios or database`);
        console.log('Available predefined scenarios:', PREDEFINED_SCENARIOS.map(s => s.id));
        return NextResponse.json(
          { 
            success: false, 
            error: `Scenario with ID "${scenarioId}" not found`,
            availableScenarios: PREDEFINED_SCENARIOS.map(s => ({ id: s.id, name: s.name }))
          },
          { status: 400 }
        );
      }
    }

    // Create session in database
    const newSession = await prisma.boardroomSession.create({
      data: {
        name: sessionName,
        scenarioId: scenarioId,
        status: 'active',
        participants: {
          create: [
            {
              userId: userId,
              role: 'facilitator',
              joinedAt: new Date(),
            }
          ]
        }
      }
    });

    console.log(`✅ Session created successfully with ID: ${newSession.id}`);

    // Return success response with session data
    return NextResponse.json({
      success: true,
      data: {
        sessionId: newSession.id,
        id: newSession.id,
        sessionName: newSession.name,
        name: newSession.name,
        scenario: isPredefinedScenario ? {
          id: predefinedScenario!.id,
          name: predefinedScenario!.name,
          description: predefinedScenario!.description,
          tags: JSON.stringify(predefinedScenario!.tags)
        } : {
          id: scenarioId,
          name: scenario?.name || 'Unknown Scenario'
        },
        selectedAgents: selectedAgents,
        createdAt: newSession.createdAt,
        status: newSession.status
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Session creation error:', error);

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Validation failed', 
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

// GET - List user's boardroom sessions
export async function GET(request: NextRequest) {
  try {
    console.log('🏢 Boardroom Sessions API: Fetching user sessions');

    // Authentication check
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = session.user.id;
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit') || '10');
    const offset = parseInt(searchParams.get('offset') || '0');
    const status = searchParams.get('status') || 'active';

    console.log(`📋 Fetching boardroom sessions for user ${userId}, status: ${status}`);

    // Fetch user's boardroom sessions
    const sessions = await prisma.boardroomSession.findMany({
      where: {
        participants: {
          some: {
            userId: userId
          }
        },
        status: status
      },
      include: {
        participants: {
          select: {
            id: true,
            role: true,
            joinedAt: true,
            leftAt: true
          }
        },
        scenario: {
          select: {
            id: true,
            name: true,
            description: true,
            tags: true
          }
        },
        messages: {
          select: {
            id: true,
            createdAt: true
          },
          orderBy: {
            createdAt: 'desc'
          },
          take: 1 // Get latest message for last activity
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: limit,
      skip: offset
    });

    // Transform sessions for response
    const transformedSessions = sessions.map(session => ({
      id: session.id,
      name: session.name,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
      scenario: session.scenario,
      participantCount: session.participants.length,
      participants: session.participants,
      lastActivity: session.messages[0]?.createdAt || session.createdAt,
      messageCount: session.messages.length
    }));

    console.log(`✅ Found ${sessions.length} sessions for user`);

    return NextResponse.json({
      success: true,
      data: transformedSessions,
      pagination: {
        limit,
        offset,
        total: transformedSessions.length
      }
    });

  } catch (error) {
    console.error('❌ Sessions fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch sessions' },
      { status: 500 }
    );
  }
}
