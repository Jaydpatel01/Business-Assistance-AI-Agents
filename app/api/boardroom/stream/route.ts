import { getAgentResponse, type AgentType } from '@/lib/ai/agent-service';
import { searchRAG, type RAGSearchResult } from '@/lib/rag';
import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { 
  sanitizeForPrompt, 
  sanitizeScenario, 
  checkRateLimit
} from '@/lib/security/input-sanitizer';

// Request validation schema
const StreamBoardroomRequestSchema = z.object({
  scenario: z.object({
    id: z.string().optional(),
    name: z.string().min(1).max(200).optional(),
    description: z.string().min(1).max(2000).optional(),
    parameters: z.record(z.any()).optional(),
  }),
  query: z.string().min(1).max(5000),
  includeAgents: z.array(z.enum(['ceo', 'cfo', 'cto', 'hr'])).min(1).max(4),
  companyName: z.string().max(100).optional(),
  sessionId: z.string().max(50).optional(),
  selectedDocuments: z.array(z.string()).max(10).optional(),
  conversationHistory: z.array(z.object({
    agentType: z.string(),
    content: z.string(),
    timestamp: z.string()
  })).optional(),
  maxRounds: z.number().min(1).max(5).optional(), // Add max rounds control
  autoConclusion: z.boolean().optional() // Add auto-conclusion feature
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
    const rateLimit = checkRateLimit(userIdentifier, 20, 300000);
    
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
    const validatedData = StreamBoardroomRequestSchema.parse(body);
    const { 
      scenario, 
      query, 
      includeAgents, 
      companyName, 
      sessionId: userSessionId, 
      selectedDocuments,
      conversationHistory = [],
      maxRounds = 3, // Default to 3 rounds
      autoConclusion = true // Default to auto-conclusion
    } = validatedData;
    
    // Provide defaults for missing scenario data
    const scenarioWithDefaults = {
      id: scenario.id || 'default-scenario',
      name: scenario.name || 'Boardroom Discussion',
      description: scenario.description || 'AI-powered executive discussion',
      parameters: scenario.parameters || {}
    };
    
    // 🔒 SECURITY: Sanitize scenario data
    const sanitizedScenario = sanitizeScenario(scenarioWithDefaults);
    if (!sanitizedScenario) {
      return NextResponse.json(
        { success: false, error: 'Invalid scenario data' },
        { status: 400 }
      );
    }

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

    // Build context from sanitized query and conversation history
    let context = `User Query: ${queryResult.sanitized}`;
    
    // Add conversation history to context
    if (conversationHistory.length > 0) {
      const historyContext = conversationHistory
        .map(msg => `${msg.agentType.toUpperCase()}: ${msg.content}`)
        .join('\n\n');
      context += `\n\nPrevious Discussion:\n${historyContext}`;
    }

    let documentContext: RAGSearchResult[] = [];
    
    // 📄 DOCUMENT INTELLIGENCE: Retrieve relevant documents for context
    if (!isDemo) {
      try {
        documentContext = await searchRAG(
          queryResult.sanitized,
          {
            topK: 5,
            minScore: 0.7,
            userId: session.user?.email || undefined,
            useLocal: true, // Use local embeddings to avoid OpenAI quota issues
            documentId: selectedDocuments && selectedDocuments.length > 0 ? selectedDocuments[0] : undefined
          }
        );
        
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
      }
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sessionId = userSessionId || `brd-${Date.now()}`;
        
        try {
          // Send initial response with session info
          const initialData = {
            type: 'session_start',
            sessionId,
            query,
            scenario: scenarioData,
            agents: includeAgents,
            maxRounds,
            timestamp: new Date().toISOString()
          };
          
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(initialData)}\n\n`));

          // Track current round responses
          let currentRoundResponses: string[] = [];
          let roundNumber = 1;

          // Determine if this is a continuation (has conversation history)
          const isFollowUp = conversationHistory.length > 0;
          
          // Process multiple rounds of discussion
          while (roundNumber <= maxRounds) {
            // Send round start event
            const roundStartData = {
              type: 'round_start',
              roundNumber,
              maxRounds,
              isFollowUp: roundNumber > 1 || isFollowUp
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(roundStartData)}\n\n`));

            currentRoundResponses = [];

            // Process agents sequentially for this round
            for (let i = 0; i < includeAgents.length; i++) {
              const agentType = includeAgents[i] as AgentType;
              
              // Send agent start event
              const agentStartData = {
                type: 'agent_start',
                agentType,
                position: i + 1,
                total: includeAgents.length,
                roundNumber
              };
              controller.enqueue(encoder.encode(`data: ${JSON.stringify(agentStartData)}\n\n`));

              try {
                // Build context with previous agent responses and round context
                let agentContext = context;
                
                // Add round-specific context
                if (roundNumber > 1) {
                  agentContext += `\n\n[This is round ${roundNumber} of ${maxRounds}. Please build upon the previous discussion and move toward a concrete conclusion.]`;
                }
                
                // Add current round responses from other agents
                if (currentRoundResponses.length > 0) {
                  agentContext += `\n\nCurrent round responses:\n${currentRoundResponses.join('\n\n')}`;
                }

                // Get agent response
                const agentResponse = await getAgentResponse(
                  agentType,
                  scenarioData,
                  agentContext,
                  companyName,
                  isDemo,
                  !isDemo, // Enable RAG only for real users
                  sessionId
                );

                // Send agent response
                const agentResponseData = {
                  type: 'agent_response',
                  agentType,
                  response: agentResponse.response,
                  timestamp: agentResponse.timestamp,
                  modelUsed: agentResponse.modelUsed,
                  confidence: 0.8,
                  roundNumber
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(agentResponseData)}\n\n`));

                // Store response for this round
                currentRoundResponses.push(`${agentType.toUpperCase()}: ${agentResponse.response}`);
                
                // Add this response to overall context for subsequent rounds
                context += `\n\n${agentType.toUpperCase()} (Round ${roundNumber}): ${agentResponse.response}`;

              } catch (error) {
                console.error(`Error getting response from ${agentType}:`, error);
                
                const errorData = {
                  type: 'agent_error',
                  agentType,
                  error: error instanceof Error ? error.message : 'Unknown error',
                  roundNumber
                };
                controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
              }
            }

            // Send round completion event
            const roundCompleteData = {
              type: 'round_complete',
              roundNumber,
              totalRounds: maxRounds
            };
            controller.enqueue(encoder.encode(`data: ${JSON.stringify(roundCompleteData)}\n\n`));

            // Check if we should continue to next round
            if (autoConclusion && roundNumber >= 2) {
              // Simple heuristic: if agents are providing concrete recommendations, we can conclude
              const hasConcreteRecommendations = currentRoundResponses.some(response => 
                response.toLowerCase().includes('recommend') || 
                response.toLowerCase().includes('propose') ||
                response.toLowerCase().includes('suggest') ||
                response.toLowerCase().includes('decision')
              );
              
              if (hasConcreteRecommendations) {
                break; // Exit the rounds loop
              }
            }

            roundNumber++;
          }

          // Send completion event
          const completionData = {
            type: 'session_complete',
            timestamp: new Date().toISOString(),
            totalRounds: roundNumber - 1,
            documentContext: documentContext.length > 0 ? {
              documentsUsed: documentContext.length,
              citations: documentContext.map((doc, index) => ({
                id: doc.id,
                name: doc.metadata.documentName,
                relevanceScore: doc.score,
                excerpt: doc.text.substring(0, 150) + '...',
                citationIndex: index + 1
              }))
            } : null
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(completionData)}\n\n`));

        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown streaming error'
          };
          controller.enqueue(encoder.encode(`data: ${JSON.stringify(errorData)}\n\n`));
        } finally {
          controller.close();
        }
      }
    });

    return new Response(stream, {
      headers: {
        'Content-Type': 'text/event-stream',
        'Cache-Control': 'no-cache',
        'Connection': 'keep-alive',
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization',
      },
    });

  } catch (error) {
    console.error('Error in streaming boardroom API route:', error);
    
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
