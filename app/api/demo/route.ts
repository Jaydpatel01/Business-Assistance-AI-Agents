import { NextResponse } from 'next/server';
import { getDemoScenario, getAllDemoScenarios, DEMO_SCENARIOS } from '@/lib/demo/demo-scenarios';

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url);
    const scenarioId = searchParams.get('scenarioId');
    const action = searchParams.get('action');

    // If requesting a specific scenario
    if (scenarioId) {
      const scenario = getDemoScenario(scenarioId);
      if (!scenario) {
        return NextResponse.json(
          { error: 'Scenario not found' },
          { status: 404 }
        );
      }

      return NextResponse.json({
        success: true,
        data: {
          scenario: {
            id: scenario.id,
            name: scenario.name,
            description: scenario.description,
            parameters: {
              defaultQuery: scenario.defaultQuery,
              recommendedAgents: scenario.recommendedAgents,
              timeline: '3-6 months',
              complexity: 'high',
              stakeholders: scenario.recommendedAgents.length
            }
          },
          mockResponses: scenario.mockResponses,
          followUpRounds: scenario.followUpRounds || []
        }
      });
    }

    // If requesting list of all scenarios
    if (action === 'list') {
      const scenarios = getAllDemoScenarios().map(scenario => ({
        id: scenario.id,
        name: scenario.name,
        description: scenario.description,
        recommendedAgents: scenario.recommendedAgents
      }));

      return NextResponse.json({
        success: true,
        data: {
          scenarios,
          demoInfo: {
            totalScenarios: scenarios.length,
            availableAgents: ['ceo', 'cfo', 'cto', 'hr'],
            features: [
              'Pre-filled strategic questions',
              'Realistic agent responses',
              'Multi-round discussions',
              'Professional insights'
            ]
          }
        }
      });
    }

    // Default demo overview
    return NextResponse.json({
      success: true,
      data: {
        message: 'Demo mode active',
        availableScenarios: Object.keys(DEMO_SCENARIOS),
        description: 'Access realistic business scenarios with pre-written executive responses',
        usage: 'Add ?scenarioId=<id> to get specific scenario data'
      }
    });

  } catch (error) {
    console.error('❌ Demo API error:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to retrieve demo data',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
