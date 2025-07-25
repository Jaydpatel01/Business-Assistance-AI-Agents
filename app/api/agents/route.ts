import { getAgentResponse, agentProfiles, type AgentType } from '@/lib/ai/agent-service';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  sanitizeForPrompt, 
  sanitizeCompanyName, 
  sanitizeScenario,
  checkRateLimit 
} from '@/lib/security/input-sanitizer';

// Request validation schema
const AgentRequestSchema = z.object({
  agentType: z.enum(['ceo', 'cfo', 'cto', 'hr']),
  scenario: z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(200),
    description: z.string().min(1).max(2000),
    parameters: z.record(z.any()).optional(),
  }),
  context: z.string().min(1).max(5000), // Add length limits
  companyName: z.string().max(100).optional(),
});

export async function POST(request: Request) {
  try {
    // 🔒 SECURITY: Check authentication
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // 🔒 SECURITY: Rate limiting
    const userIdentifier = session.user?.email || 'anonymous';
    const rateLimitCheck = checkRateLimit(userIdentifier, 20, 60000); // 20 requests per minute
    
    if (!rateLimitCheck.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          resetTime: rateLimitCheck.resetTime
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Validate request body
    const validatedData = AgentRequestSchema.parse(body);
    const { agentType, scenario, context, companyName } = validatedData;
    
    // 🔒 SECURITY: Sanitize inputs
    const contextSanitization = sanitizeForPrompt(context);
    if (contextSanitization.blocked) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Input contains blocked content',
          warnings: contextSanitization.warnings
        },
        { status: 400 }
      );
    }

    const sanitizedScenario = sanitizeScenario(scenario);
    if (!sanitizedScenario) {
      return NextResponse.json(
        { success: false, error: 'Invalid scenario data' },
        { status: 400 }
      );
    }

    // Cast to expected ScenarioData type
    const scenarioData = {
      id: sanitizedScenario.id as string | undefined,
      name: sanitizedScenario.name as string,
      description: sanitizedScenario.description as string,
      parameters: sanitizedScenario.parameters as Record<string, unknown> | undefined
    };

    const sanitizedCompanyName = companyName ? sanitizeCompanyName(companyName) : undefined;
    
    // Get agent response with sanitized inputs
    const response = await getAgentResponse(
      agentType as AgentType, 
      scenarioData, 
      contextSanitization.sanitized, 
      sanitizedCompanyName
    );
    
    return NextResponse.json({
      success: true,
      data: response
    });
    
  } catch (error) {
    console.error('Error in agent API route:', error);
    
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
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get agent response' 
      },
      { status: 500 }
    );
  }
}

// GET route to fetch available agents
export async function GET() {
  try {
    return NextResponse.json({
      success: true,
      data: {
        agents: Object.entries(agentProfiles).map(([key, profile]) => ({
          id: key,
          ...profile
        }))
      }
    });
  } catch (error) {
    console.error('Error fetching agents:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch agents' },
      { status: 500 }
    );
  }
}
