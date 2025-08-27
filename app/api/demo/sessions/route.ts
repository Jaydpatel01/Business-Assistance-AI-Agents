import { NextRequest, NextResponse } from 'next/server';
import { getDemoScenario } from '@/lib/demo/demo-scenarios';

// Mock session creation for demo mode that doesn't touch the database
export async function POST(request: NextRequest) {
  try {
    console.log('🎭 Demo Sessions API: Creating mock session');

    const body = await request.json();
    const { sessionName, scenarioId, selectedAgents } = body;

    // Check if this is a demo scenario
    const demoScenario = getDemoScenario(scenarioId);
    if (!demoScenario) {
      return NextResponse.json(
        { success: false, error: 'Demo scenario not found' },
        { status: 404 }
      );
    }

    // Create mock session data
    const mockSessionId = `demo-${scenarioId}-${Date.now()}`;
    const mockSession = {
      sessionId: mockSessionId,
      name: sessionName || `${demoScenario.name} - Demo Discussion`,
      description: demoScenario.description,
      scenario: {
        id: demoScenario.id,
        name: demoScenario.name,
        description: demoScenario.description
      },
      selectedAgents: selectedAgents || demoScenario.recommendedAgents,
      status: 'active',
      createdAt: new Date().toISOString(),
      isDemo: true
    };

    console.log(`✅ Created demo session: ${mockSessionId}`);

    return NextResponse.json({
      success: true,
      data: mockSession,
      message: 'Demo session created successfully'
    });

  } catch (error) {
    console.error('❌ Demo session creation error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to create demo session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

// Mock session retrieval for demo mode
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const sessionId = searchParams.get('sessionId');

    if (!sessionId || !sessionId.startsWith('demo-')) {
      return NextResponse.json(
        { success: false, error: 'Invalid demo session ID' },
        { status: 400 }
      );
    }

    // Extract scenario ID from demo session ID
    const scenarioId = sessionId.split('-')[1];
    const demoScenario = getDemoScenario(scenarioId);

    if (!demoScenario) {
      return NextResponse.json(
        { success: false, error: 'Demo scenario not found' },
        { status: 404 }
      );
    }

    // Create mock session data
    const mockSession = {
      id: sessionId,
      name: `${demoScenario.name} - Demo Discussion`,
      description: demoScenario.description,
      scenario: {
        id: demoScenario.id,
        name: demoScenario.name,
        description: demoScenario.description
      },
      selectedAgents: demoScenario.recommendedAgents,
      status: 'active',
      messages: [],
      progress: 0,
      activeAgents: demoScenario.recommendedAgents,
      isDemo: true
    };

    return NextResponse.json({
      success: true,
      data: mockSession
    });

  } catch (error) {
    console.error('❌ Demo session retrieval error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve demo session',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
