import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { PREDEFINED_SCENARIOS, formatScenarioForAPI } from '@/lib/scenarios/predefined-scenarios';

const UpdateScenarioSchema = z.object({
  name: z.string().min(1, 'Name is required').optional(),
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  parameters: z.record(z.any()).optional(),
  status: z.enum(['draft', 'active', 'archived']).optional(),
});

// Mock scenarios data (same as in main route for consistency)
const getMockScenarios = (userId: string) => [
  {
    id: 'scenario-1',
    name: 'Strategic Investment Analysis',
    description: 'Evaluate major investment opportunities with comprehensive financial and strategic analysis including market research, competitive landscape, and risk assessment.',
    tags: ['finance', 'strategy'],
    parameters: {
      timeframe: '6-months',
      budget: '$2M',
      departments: ['Finance', 'Strategy', 'Operations']
    },
    status: 'draft',
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: {
      id: userId,
      name: 'User',
      email: 'user@example.com',
    },
    sessions: [
      {
        id: 'session-1',
        name: 'Q4 Strategic Investment Review',
        status: 'completed',
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
        participants: [
          { id: 'user-1', user: { id: userId, name: 'User', email: 'user@example.com' }, role: 'facilitator' }
        ],
        _count: {
          participants: 4,
          messages: 23,
        },
      }
    ],
  },
  {
    id: 'scenario-2',
    name: 'Market Expansion Strategy',
    description: 'Comprehensive analysis of European market entry opportunities with focus on regulatory compliance.',
    tags: ['expansion', 'international'],
    parameters: {
      target_markets: ['Germany', 'France', 'UK'],
      timeline: '12-months',
      investment: '$5M'
    },
    status: 'active',
    createdAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
    updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
    createdBy: {
      id: userId,
      name: 'User',
      email: 'user@example.com',
    },
    sessions: [],
  }
];

// GET specific scenario
export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Look for predefined scenario first
    const predefinedScenario = PREDEFINED_SCENARIOS.find(s => s.id === id);
    
    if (predefinedScenario) {
      const formattedScenario = formatScenarioForAPI(
        predefinedScenario, 
        session.user.id, 
        session.user.name || undefined, 
        session.user.email || undefined
      );
      
      return NextResponse.json({
        success: true,
        data: formattedScenario
      });
    }

    // If not found in predefined scenarios, check mock scenarios for backward compatibility
    const mockScenarios = getMockScenarios(session.user.id);
    const scenario = mockScenarios.find(s => s.id === id);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      data: scenario,
    });
  } catch (error) {
    console.error('Error fetching scenario:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch scenario' },
      { status: 500 }
    );
  }
}

// PUT update scenario
export async function PUT(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const body = await request.json();
    const validatedData = UpdateScenarioSchema.parse(body);

    // For now, return mock updated scenario since database isn't fully set up yet
    const mockScenarios = getMockScenarios(session.user.id);
    const scenario = mockScenarios.find(s => s.id === id);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      );
    }

    // Mock update by creating updated scenario object
    const updatedScenario = {
      ...scenario,
      ...(validatedData.name && { name: validatedData.name }),
      ...(validatedData.description && { description: validatedData.description }),
      ...(validatedData.status && { status: validatedData.status }),
      ...(validatedData.tags && { tags: validatedData.tags }),
      ...(validatedData.parameters && { parameters: validatedData.parameters }),
      updatedAt: new Date().toISOString(),
    };

    return NextResponse.json({
      success: true,
      data: updatedScenario,
    });
  } catch (error) {
    console.error('Error updating scenario:', error);
    
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
      { success: false, error: 'Failed to update scenario' },
      { status: 500 }
    );
  }
}

// DELETE scenario
export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  const { id } = await params
  try {
    const session = await getServerSession(authOptions);
    if (!session?.user?.id) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // For now, return mock deletion response since database isn't fully set up yet
    const mockScenarios = getMockScenarios(session.user.id);
    const scenario = mockScenarios.find(s => s.id === id);

    if (!scenario) {
      return NextResponse.json(
        { success: false, error: 'Scenario not found' },
        { status: 404 }
      );
    }

    return NextResponse.json({
      success: true,
      message: 'Scenario deleted successfully',
    });
  } catch (error) {
    console.error('Error deleting scenario:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to delete scenario' },
      { status: 500 }
    );
  }
}
