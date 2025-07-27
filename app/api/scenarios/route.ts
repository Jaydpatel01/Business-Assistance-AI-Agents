import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getPredefinedScenarios, formatScenarioForAPI } from '@/lib/scenarios/predefined-scenarios';

// Validation schemas
const CreateScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required'),
  description: z.string().optional(),
  tags: z.array(z.string()).optional().default([]),
  parameters: z.record(z.any()).optional(),
});

// GET all scenarios for the current user
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
    const tags = searchParams.get('tags')?.split(',');

    // Check if this is a demo user
    const isDemoUser = session.user.role === 'demo';

    // Get predefined scenarios for both demo and real users
    const predefinedScenarios = getPredefinedScenarios({
      status: status || undefined,
      tags: tags || undefined
    });

    // Format scenarios for API response
    const formattedScenarios = predefinedScenarios.map(scenario => 
      formatScenarioForAPI(scenario, session.user.id, session.user.name || undefined, session.user.email || undefined)
    );

    if (isDemoUser) {
      // Demo users get predefined scenarios with demo response behavior
      return NextResponse.json({
        success: true,
        data: formattedScenarios,
        userType: 'demo'
      });
    } else {
      // Real users get the same predefined scenarios but will get real AI responses when using them
      // TODO: In the future, also include user-created scenarios from database
      return NextResponse.json({
        success: true,
        data: formattedScenarios,
        userType: 'real',
        message: 'Predefined scenarios available. User-created scenarios will be added when database integration is complete.'
      });
    }
  } catch (error) {
    console.error('Error fetching scenarios:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenarios' },
      { status: 500 }
    );
  }
}
// POST create new scenario
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
    const validatedData = CreateScenarioSchema.parse(body);

    // Check if this is a demo user
    const isDemoUser = session.user.role === 'demo';

    if (isDemoUser) {
      // For demo users, return mock created scenario
      const newScenario = {
        id: `demo-scenario-${Date.now()}`,
        name: validatedData.name,
        description: validatedData.description || '',
        tags: validatedData.tags || [],
        parameters: validatedData.parameters || {},
        status: 'draft',
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
        createdBy: {
          id: session.user.id,
          name: session.user.name || 'Demo User',
          email: session.user.email || 'demo@user.com',
        },
        sessions: [],
      };

      return NextResponse.json({
        success: true,
        data: newScenario,
      });
    } else {
      // For real users, save to database
      // TODO: Implement real database save when database is set up
      return NextResponse.json(
        { success: false, error: 'Scenario creation for real users will be available when database is set up' },
        { status: 501 }
      );
    }
  } catch (error) {
    console.error('Error creating scenario:', error);
    
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
      { success: false, error: 'Failed to create scenario' },
      { status: 500 }
    );
  }
}
