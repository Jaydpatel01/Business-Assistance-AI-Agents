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
import { prisma } from '@/lib/db/connection';

// 🎯 ENHANCED: Parse reasoning metadata from agent response
function parseReasoningMetadata(response: string) {
  const metadataMatch = response.match(/---METADATA---([\s\S]*?)---END_METADATA---/);
  if (!metadataMatch) {
    return {
      cleanResponse: response,
      confidence: 0.85, // default
      reasoning: undefined
    };
  }

  const metadataText = metadataMatch[1];

  // Extract confidence
  const confidenceMatch = metadataText.match(/CONFIDENCE:\s*(High|Medium|Low)/i);
  const confidenceLevel = confidenceMatch?.[1]?.toLowerCase() || 'medium';
  const confidenceValue = confidenceLevel === 'high' ? 0.9 : confidenceLevel === 'medium' ? 0.75 : 0.6;

  // Extract key factors
  const keyFactorsMatch = metadataText.match(/KEY_FACTORS:([\s\S]*?)(?:RISKS:|ASSUMPTIONS:|DATA_SOURCES:|---END_METADATA---)/);
  const keyFactors = keyFactorsMatch?.[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean) || [];

  // Extract risks
  const risksMatch = metadataText.match(/RISKS:([\s\S]*?)(?:ASSUMPTIONS:|DATA_SOURCES:|---END_METADATA---)/);
  const risks = risksMatch?.[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean) || [];

  // Extract assumptions
  const assumptionsMatch = metadataText.match(/ASSUMPTIONS:([\s\S]*?)(?:DATA_SOURCES:|---END_METADATA---)/);
  const assumptions = assumptionsMatch?.[1]
    .split('\n')
    .filter(line => line.trim().startsWith('-'))
    .map(line => line.replace(/^-\s*/, '').trim())
    .filter(Boolean) || [];

  // Extract data sources
  const dataSourcesMatch = metadataText.match(/DATA_SOURCES:\s*([^\n]+)/);
  const dataSources = dataSourcesMatch?.[1]
    .split(',')
    .map(s => s.trim())
    .filter(Boolean) || [];

  // Remove metadata from response
  const cleanResponse = response.replace(/---METADATA---[\s\S]*?---END_METADATA---/, '').trim();

  return {
    cleanResponse,
    confidence: confidenceValue,
    reasoning: {
      keyFactors: keyFactors.length > 0 ? keyFactors : undefined,
      risks: risks.length > 0 ? risks : undefined,
      assumptions: assumptions.length > 0 ? assumptions : undefined,
      dataSources: dataSources.length > 0 ? dataSources : undefined
    }
  };
}

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

    // 📄 DOCUMENT INTELLIGENCE: Retrieve relevant documents for context (ONCE for entire session)
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
          // 🎯 ENHANCED: Create more detailed and structured document summary for agents
          const documentSummary = documentContext
            .map((doc, index) => {
              const relevancePercent = (doc.score * 100).toFixed(0);
              return `📄 [Document ${index + 1}] "${doc.metadata.documentName}" (${relevancePercent}% relevant)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
${doc.text.substring(0, 400)}${doc.text.length > 400 ? '...' : ''}
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━`;
            })
            .join('\n\n');

          context += `\n\n📚 RELEVANT COMPANY DOCUMENTS (${documentContext.length} found):

${documentSummary}

⚠️ IMPORTANT: Please reference these documents in your analysis when relevant. 
Use citations like "[Document 1]" or "[Document 2]" when referencing specific information.`;
        }
      } catch (error) {
        console.warn('Document retrieval failed, proceeding without document context:', error);
      }
    }

    // 🌐 MARKET INTELLIGENCE: Fetch once for entire session (not per agent)
    let sessionMarketData = null;
    if (!isDemo) {
      try {
        const marketService = (await import('@/lib/market/market-service')).default;
        sessionMarketData = await marketService.getMarketIntelligence([], false); // Fetch general market data
        console.log('✅ Fetched market intelligence once for entire session');
      } catch (error) {
        console.warn('Market intelligence retrieval failed:', error);
      }
    }

    // Create a streaming response
    const stream = new ReadableStream({
      async start(controller) {
        const encoder = new TextEncoder();
        const sessionId = userSessionId || `brd-${Date.now()}`;
        let controllerClosed = false;

        // Safe enqueue helper to prevent "Controller is already closed" errors
        const safeEnqueue = (data: string) => {
          if (!controllerClosed) {
            try {
              controller.enqueue(encoder.encode(data));
            } catch (error) {
              console.warn('Failed to enqueue data (controller may be closed):', error);
              controllerClosed = true;
            }
          }
        };

        // Safe close helper
        const safeClose = () => {
          if (!controllerClosed) {
            try {
              controller.close();
              controllerClosed = true;
            } catch (error) {
              console.warn('Failed to close controller:', error);
            }
          }
        };

        try {
          // 💾 DATABASE: Ensure session exists or create it
          let existingSession = null;
          if (userSessionId) {
            // Check if session exists when continuing a conversation
            existingSession = await prisma.boardroomSession.findFirst({
              where: {
                id: userSessionId,
                participants: {
                  some: {
                    userId: session.user.id
                  }
                }
              }
            });
          }

          // Create session if it doesn't exist (both new sessions and missing existing ones)
          if (!existingSession) {
            console.log(`🔄 Creating new session: ${sessionId} for user: ${session.user.id}`);

            // Create new session for first message
            const sessionData = {
              id: sessionId,
              name: query.substring(0, 100), // Use first part of query as name
              status: 'active',
              createdAt: new Date(),
              updatedAt: new Date(),
              participants: {
                create: {
                  userId: session.user.id,
                  role: 'owner',
                  joinedAt: new Date()
                }
              }
            };

            try {
              if (scenarioData?.id) {
                // Use provided scenario
                await prisma.boardroomSession.create({
                  data: {
                    ...sessionData,
                    scenario: {
                      connect: { id: scenarioData.id }
                    }
                  }
                });
                console.log(`✅ Session ${sessionId} created with scenario ${scenarioData.id}`);
              } else {
                // Create or find default "Ad-hoc Discussion" scenario
                let defaultScenario = await prisma.scenario.findFirst({
                  where: {
                    createdById: session.user.id,
                    name: "Ad-hoc Discussion"
                  }
                });

                if (!defaultScenario) {
                  defaultScenario = await prisma.scenario.create({
                    data: {
                      id: `scenario-adhoc-${session.user.id}-${Date.now()}`,
                      name: "Ad-hoc Discussion",
                      description: "General business discussion without a specific scenario",
                      status: "active",
                      createdById: session.user.id,
                      parameters: JSON.stringify({
                        type: "general",
                        context: "open_discussion"
                      })
                    }
                  });
                  console.log(`✅ Created default scenario: ${defaultScenario.id}`);
                }

                await prisma.boardroomSession.create({
                  data: {
                    ...sessionData,
                    scenario: {
                      connect: { id: defaultScenario.id }
                    }
                  }
                });
                console.log(`✅ Session ${sessionId} created with default scenario`);
              }

              // Verify the session and participant were created
              const verifySession = await prisma.boardroomSession.findFirst({
                where: { id: sessionId },
                include: {
                  participants: true
                }
              });

              if (verifySession && verifySession.participants.length > 0) {
                console.log(`✅ Session creation verified: ${sessionId} with ${verifySession.participants.length} participants`);
              } else {
                console.error(`❌ Session creation verification failed for: ${sessionId}`);
              }

            } catch (sessionCreateError) {
              console.error(`❌ Failed to create session ${sessionId}:`, sessionCreateError);
              throw sessionCreateError;
            }
          } else {
            console.log(`✅ Using existing session: ${sessionId}`);
          }

          // 💾 DATABASE: Save user's initial message
          // Get participant ID for this user in this session
          const participant = await prisma.participant.findFirst({
            where: {
              sessionId: sessionId,
              userId: session.user.id
            }
          });

          await prisma.message.create({
            data: {
              id: `msg-user-${Date.now()}`,
              content: query,
              agentType: 'user',
              sessionId: sessionId,
              participantId: participant?.id,
              createdAt: new Date()
            }
          });

          // 🎯 OPTIMIZATION: Convert RAG documents once for all agents to reuse
          const relevantDocuments = documentContext.map((doc, index) => ({
            id: doc.id,
            fileName: doc.metadata.documentName || `Document ${index + 1}`,
            relevanceScore: doc.score,
            excerpt: doc.text,
            category: 'company_document'
          }));

          console.log(`📊 API Optimization Status:`);
          console.log(`- RAG documents: ${relevantDocuments.length} (will reuse for all ${includeAgents.length * maxRounds} agent calls)`);
          console.log(`- Market data: ${sessionMarketData ? 'fetched once' : 'not available'} (will reuse)`);

          // Send initial response with session info INCLUDING document context
          const initialData = {
            type: 'session_start',
            sessionId,
            query,
            scenario: scenarioData,
            agents: includeAgents,
            maxRounds,
            timestamp: new Date().toISOString(),
            // 📄 ENHANCED: Send document context at the START of discussion
            documentContext: documentContext.length > 0 ? {
              documentsUsed: documentContext.length,
              citations: relevantDocuments.map((doc, index) => ({
                id: doc.id,
                name: doc.fileName,
                relevanceScore: doc.relevanceScore,
                excerpt: doc.excerpt.substring(0, 200) + '...',
                citationIndex: index + 1,
                fullText: doc.excerpt // Include full text for reference
              }))
            } : null
          };

          safeEnqueue(`data: ${JSON.stringify(initialData)}\n\n`);

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
            safeEnqueue(`data: ${JSON.stringify(roundStartData)}\n\n`);

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
              safeEnqueue(`data: ${JSON.stringify(agentStartData)}\n\n`);

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
                  sessionId,
                  session.user?.email,
                  undefined, // organizationId
                  relevantDocuments.length > 0 ? relevantDocuments : undefined, // 🎯 Pass prefetched RAG documents
                  sessionMarketData // 🎯 Pass prefetched market data
                );

                // 📄 ENHANCED: Extract document citations from agent response
                const citedDocuments: number[] = [];
                const citationPattern = /\[Document (\d+)\]/g;
                let match;
                while ((match = citationPattern.exec(agentResponse.response)) !== null) {
                  const docNum = parseInt(match[1]);
                  if (!citedDocuments.includes(docNum)) {
                    citedDocuments.push(docNum);
                  }
                }

                // 🎯 ENHANCED: Parse reasoning metadata
                const { cleanResponse, confidence, reasoning } = parseReasoningMetadata(agentResponse.response);

                // Send agent response with document metadata and reasoning
                const agentResponseData = {
                  type: 'agent_response',
                  agentType,
                  response: cleanResponse || agentResponse.response, // Use cleaned response if metadata was found
                  timestamp: agentResponse.timestamp,
                  modelUsed: agentResponse.modelUsed,
                  confidence,
                  reasoning,
                  roundNumber,
                  // 📄 ENHANCED: Include document usage metadata
                  documentMetadata: citedDocuments.length > 0 ? {
                    citedDocuments,
                    documentsUsed: citedDocuments.length,
                    hasDocumentContext: true
                  } : {
                    citedDocuments: [],
                    documentsUsed: 0,
                    hasDocumentContext: documentContext.length > 0
                  }
                };
                safeEnqueue(`data: ${JSON.stringify(agentResponseData)}\n\n`);

                // 💾 DATABASE: Save agent response to database
                // Get participant ID for this user in this session
                const participant = await prisma.participant.findFirst({
                  where: {
                    sessionId: sessionId,
                    userId: session.user.id
                  }
                });

                await prisma.message.create({
                  data: {
                    id: `msg-${agentType}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
                    content: cleanResponse || agentResponse.response,
                    agentType: agentType,
                    sessionId: sessionId,
                    participantId: participant?.id,
                    createdAt: new Date(agentResponse.timestamp),
                    metadata: JSON.stringify({
                      modelUsed: agentResponse.modelUsed,
                      confidence,
                      reasoning,
                      roundNumber: roundNumber,
                      documentMetadata: citedDocuments.length > 0 ? {
                        citedDocuments,
                        documentsUsed: citedDocuments.length
                      } : undefined
                    })
                  }
                });

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
                safeEnqueue(`data: ${JSON.stringify(errorData)}\n\n`);
              }
            }

            // Send round completion event
            const roundCompleteData = {
              type: 'round_complete',
              roundNumber,
              totalRounds: maxRounds
            };
            safeEnqueue(`data: ${JSON.stringify(roundCompleteData)}\n\n`);

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
          safeEnqueue(`data: ${JSON.stringify(completionData)}\n\n`);

          // 💾 DATABASE: Mark session as completed
          await prisma.boardroomSession.update({
            where: { id: sessionId },
            data: {
              status: 'completed',
              updatedAt: new Date()
            }
          });

        } catch (error) {
          console.error('Streaming error:', error);
          const errorData = {
            type: 'error',
            error: error instanceof Error ? error.message : 'Unknown streaming error'
          };
          safeEnqueue(`data: ${JSON.stringify(errorData)}\n\n`);
        } finally {
          safeClose();
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
