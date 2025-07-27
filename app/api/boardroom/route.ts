import { getAgentResponse, synthesizeDecision, type AgentType } from '@/lib/ai/agent-service';
import { searchRAG, type RAGSearchResult } from '@/lib/rag';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  sanitizeForPrompt, 
  sanitizeScenario, 
  checkRateLimit,
  validatePromptsForRole 
} from '@/lib/security/input-sanitizer';

// Local type for agent responses (based on actual AgentResponse interface)
type AgentResponseType = {
  response: string;
  agent?: object;
  timestamp: string;
  agentType: string;
  modelUsed: string;
  tokenCount: number;
  isDemoMode?: boolean;
  fromCache?: boolean;
};

// Request validation schema with enhanced security
const BoardroomRequestSchema = z.object({
  scenario: z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(200).optional(), // Make name optional and add default
    description: z.string().min(1).max(2000).optional(), // Make description optional
    parameters: z.record(z.any()).optional(),
  }),
  query: z.string().min(1).max(5000), // Add length limits
  includeAgents: z.array(z.enum(['ceo', 'cfo', 'cto', 'hr'])).min(1).max(4),
  companyName: z.string().max(100).optional(),
  sessionId: z.string().max(50).optional(),
  selectedDocuments: z.array(z.string()).max(10).optional(), // Allow up to 10 document IDs
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

    // Determine if user is in demo mode
    const isDemo = !!(session.user?.role === 'demo' || 
                     (session.user?.email && [
                       "demo@businessai.com",
                       "test@example.com", 
                       "guest@demo.com"
                     ].includes(session.user.email)));

    // 🔒 SECURITY: Rate limiting
    const userIdentifier = session.user?.email || 'anonymous';
    const rateLimit = checkRateLimit(userIdentifier, 20, 300000); // 20 requests per 5 minutes
    
    if (!rateLimit.allowed) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'Rate limit exceeded',
          resetTime: rateLimit.resetTime
        },
        { status: 429 }
      );
    }

    const body = await request.json();
    
    // Debug: Log the received request body
    console.log('🔍 Boardroom API received request:', JSON.stringify(body, null, 2));
    
    // Validate request body
    const validatedData = BoardroomRequestSchema.parse(body);
    const { scenario, query, includeAgents, companyName, sessionId: userSessionId, selectedDocuments } = validatedData;
    
    // Provide defaults for missing scenario data
    const scenarioWithDefaults = {
      id: scenario.id || 'default-scenario',
      name: scenario.name || 'Boardroom Discussion',
      description: scenario.description || 'AI-powered executive discussion',
      parameters: scenario.parameters || {}
    };
    
    // 🔒 SECURITY: Sanitize scenario data and cast to proper type
    const sanitizedScenario = sanitizeScenario(scenarioWithDefaults);
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

    // 🔒 SECURITY: Sanitize query input  
    const queryResult = sanitizeForPrompt(query);
    if (queryResult.blocked) {
      return NextResponse.json(
        { success: false, error: 'Query contains prohibited content' },
        { status: 400 }
      );
    }

    // 🔒 SECURITY: Validate prompts are appropriate for requested agent roles
    const promptValidation = validatePromptsForRole('CEO', [queryResult.sanitized]);
    if (!promptValidation.valid) {
      return NextResponse.json(
        { success: false, error: `Prompt validation failed: ${promptValidation.reason}` },
        { status: 400 }
      );
    }
    
    // Build context from sanitized query
    let context = `User Query: ${queryResult.sanitized}`;
    let documentContext: RAGSearchResult[] = [];
    
    // 📄 DOCUMENT INTELLIGENCE: Retrieve relevant documents for context
    if (!isDemo) {
      try {
        // Search for relevant documents using RAG
        documentContext = await searchRAG(
          queryResult.sanitized,
          {
            topK: 5,
            minScore: 0.7,
            userId: session.user?.email || undefined,
            useLocal: false, // Use OpenAI embeddings for better quality
            documentId: selectedDocuments && selectedDocuments.length > 0 ? selectedDocuments[0] : undefined
          }
        );
        
        console.log(`Retrieved ${documentContext.length} relevant documents for query`);
        
        // Enhance context with document information
        if (documentContext.length > 0) {
          const documentSummary = documentContext
            .map((doc, index) => 
              `Document ${index + 1} (${doc.metadata.documentName}): ${doc.text.substring(0, 200)}...`
            )
            .join('\n\n');
          
          context += `\n\n📄 RELEVANT COMPANY DOCUMENTS:\n${documentSummary}`;
        }
      } catch (error) {
        console.warn('Document retrieval failed, proceeding without document context:', error);
        // Continue without document context - don't fail the entire request
      }
    }
    
    // Get responses from all requested agents in parallel with RAG enabled
    const sessionId = userSessionId || `brd-${Date.now()}`;
    const agentPromises = includeAgents.map(agentType =>
      getAgentResponse(
        agentType as AgentType, 
        scenarioData, 
        context, 
        companyName,
        isDemo, // Use demo data for demo users, real data for real users
        !isDemo, // Enable RAG only for real users to avoid fallbacks to demo data
        sessionId
      )
        .catch(error => ({
          error: true,
          agentType,
          errorMessage: error.message
        }))
    );
    
    const agentResults = await Promise.all(agentPromises);
    
    // Separate successful responses from errors
    const successfulResponses = agentResults.filter(r => !('error' in r));
    const erroredResponses = agentResults.filter(r => 'error' in r);
    
    if (successfulResponses.length === 0) {
      return NextResponse.json(
        { 
          success: false, 
          error: 'All agents failed to respond',
          details: erroredResponses
        },
        { status: 500 }
      );
    }
    
    // Synthesize decision if we have multiple successful responses
    let synthesis = null;
    if (successfulResponses.length > 1) {
      try {
        // Type assertion for successful responses that are AgentResponse objects
        const validResponses = successfulResponses.filter(r => !('error' in r));
        
        // Use unknown then any to bypass complex type checking for internal interface
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        synthesis = await synthesizeDecision(validResponses as unknown as any[], scenarioData);
      } catch (error) {
        console.error('Failed to synthesize decision:', error);
        // Continue without synthesis rather than failing the whole request
      }
    }
    
    // Format response similar to your README example
    const responses: Record<string, {
      summary: string;
      perspective: string;
      confidence: number;
      timestamp: string;
      agent: string;
    }> = {};
    
    successfulResponses.forEach((response: unknown) => {
      const typedResponse = response as AgentResponseType;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      if (!('error' in (response as any))) {
        responses[typedResponse.agentType.toUpperCase()] = {
          summary: typedResponse.response.split('\n')[0].replace(/\*\*/g, ''), // First line as summary
          perspective: typedResponse.response,
          confidence: 0.8, // Default confidence, could be extracted from response
          timestamp: typedResponse.timestamp,
          agent: typedResponse.agent?.toString() || 'Unknown'
        };
      }
    });
    
    const responseData = {
      sessionId: sessionId || `brd-${Date.now()}`,
      query,
      timestamp: new Date().toISOString(),
      scenario: {
        name: scenario.name,
        description: scenario.description,
        parameters: scenario.parameters
      },
      responses,
      documentContext: documentContext.length > 0 ? {
        documentsUsed: documentContext.length,
        citations: documentContext.map((doc, index) => ({
          id: doc.id,
          name: doc.metadata.documentName,
          relevanceScore: doc.score,
          excerpt: doc.text.substring(0, 150) + '...',
          citationIndex: index + 1
        }))
      } : null,
      synthesis: synthesis ? {
        recommendation: synthesis.synthesis,
        confidence: synthesis.confidence,
        agentCount: synthesis.agentCount,
        timestamp: synthesis.timestamp
      } : null,
      errors: erroredResponses.length > 0 ? erroredResponses : undefined
    };
    
    return NextResponse.json({
      success: true,
      data: responseData
    });
    
  } catch (error) {
    console.error('Error in boardroom API route:', error);
    
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
        error: error instanceof Error ? error.message : 'Failed to process boardroom discussion' 
      },
      { status: 500 }
    );
  }
}
