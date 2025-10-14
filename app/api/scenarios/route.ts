import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { getPredefinedScenarios, formatScenarioForAPI } from '@/lib/scenarios/predefined-scenarios';
import { prisma } from '@/lib/db/connection';

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
      // Real users get predefined scenarios plus their custom scenarios
      try {
        // Fetch user's custom scenarios from database
        const userScenarios = await prisma.scenario.findMany({
          where: {
            createdById: session.user.id,
            ...(status && { status: status }),
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          },
          orderBy: {
            updatedAt: 'desc'
          }
        });

        // Format user scenarios to match API structure
        const formattedUserScenarios = userScenarios.map(scenario => ({
          id: scenario.id,
          name: scenario.name,
          description: scenario.description || '',
          tags: JSON.parse(scenario.tags || '[]'),
          parameters: JSON.parse(scenario.parameters || '{}'),
          status: scenario.status,
          createdAt: scenario.createdAt.toISOString(),
          updatedAt: scenario.updatedAt.toISOString(),
          createdBy: {
            id: scenario.createdBy.id,
            name: scenario.createdBy.name || 'User',
            email: scenario.createdBy.email || '',
          },
          sessions: [], // TODO: Include session count when needed
          isCustom: true // Flag to identify user-created scenarios
        }));

        // Filter predefined scenarios if tags are specified
        const filteredPredefinedScenarios = tags 
          ? formattedScenarios.filter(scenario => 
              tags.some(tag => scenario.tags.includes(tag))
            )
          : formattedScenarios;

        // Get predefined scenario IDs to avoid duplicates
        const predefinedScenarioIds = new Set(predefinedScenarios.map(s => s.id));
        
        // Filter out user scenarios that have the same ID as predefined scenarios
        // (This can happen when predefined scenarios are saved to DB during session creation)
        const uniqueUserScenarios = formattedUserScenarios.filter(scenario => 
          !predefinedScenarioIds.has(scenario.id)
        );

        // Combine unique user scenarios and predefined scenarios
        const allScenarios = [...uniqueUserScenarios, ...filteredPredefinedScenarios];

        console.log('📊 Scenarios API Debug Info:');
        console.log(`   - Predefined scenarios: ${predefinedScenarios.length}`);
        console.log(`   - User scenarios from DB: ${formattedUserScenarios.length}`);
        console.log(`   - Unique user scenarios (after dedup): ${uniqueUserScenarios.length}`);
        console.log(`   - Total scenarios returned: ${allScenarios.length}`);
        console.log('   - All scenario IDs:', allScenarios.map(s => s.id));

        return NextResponse.json({
          success: true,
          data: allScenarios,
          userType: 'real',
          message: `Found ${uniqueUserScenarios.length} custom scenarios and ${filteredPredefinedScenarios.length} predefined scenarios.`
        });

      } catch (dbError) {
        console.error('Database error fetching user scenarios:', dbError);
        
        // Fallback to predefined scenarios only
        return NextResponse.json({
          success: true,
          data: formattedScenarios,
          userType: 'real',
          message: 'Showing predefined scenarios only. Database temporarily unavailable for custom scenarios.'
        });
      }
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

    // Validate that custom scenario name doesn't conflict with predefined scenarios
    const predefinedScenarios = getPredefinedScenarios();
    const conflictingScenario = predefinedScenarios.find(
      ps => ps.name.toLowerCase() === validatedData.name.toLowerCase()
    );
    
    if (conflictingScenario) {
      return NextResponse.json(
        { 
          success: false, 
          error: `A predefined scenario with this name already exists. Please choose a different name.`,
          suggestion: `${validatedData.name} (Custom)`
        },
        { status: 400 }
      );
    }

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
      try {
        const newScenario = await prisma.scenario.create({
          data: {
            name: validatedData.name,
            description: validatedData.description || '',
            status: 'draft',
            createdById: session.user.id,
            organizationId: session.user.company || null,
            parameters: JSON.stringify(validatedData.parameters || {}),
            tags: JSON.stringify(validatedData.tags || []),
          },
          include: {
            createdBy: {
              select: {
                id: true,
                name: true,
                email: true,
              }
            }
          }
        });

        // Format response to match expected structure
        const formattedScenario = {
          id: newScenario.id,
          name: newScenario.name,
          description: newScenario.description || '',
          tags: JSON.parse(newScenario.tags || '[]'),
          parameters: JSON.parse(newScenario.parameters || '{}'),
          status: newScenario.status,
          createdAt: newScenario.createdAt.toISOString(),
          updatedAt: newScenario.updatedAt.toISOString(),
          createdBy: {
            id: newScenario.createdBy.id,
            name: newScenario.createdBy.name || 'User',
            email: newScenario.createdBy.email || '',
          },
          sessions: [], // New scenario has no sessions yet
        };

        return NextResponse.json({
          success: true,
          data: formattedScenario,
          message: 'Custom scenario created successfully'
        });

      } catch (dbError) {
        console.error('Database error creating scenario:', dbError);
        return NextResponse.json(
          { success: false, error: 'Failed to create scenario in database. Please try again.' },
          { status: 500 }
        );
      }
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
