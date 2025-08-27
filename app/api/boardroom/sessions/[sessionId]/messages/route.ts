import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';
import { z } from 'zod';
import { getAgentResponse, type AgentType } from '@/lib/ai/agent-service';

// Validation schema for message creation
const CreateMessageSchema = z.object({
  content: z.string().min(1, 'Message content is required').max(5000),
  agentType: z.string().optional(), // Will be set for AI responses
  parentId: z.string().optional(), // For threaded replies
});

export async function POST(request: NextRequest) {
  try {
    console.log('💬 Boardroom Messages API: Creating new message');

    // Get sessionId from URL
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[4]; // Extract from /api/boardroom/sessions/[sessionId]/messages

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

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
    const validatedData = CreateMessageSchema.parse(body);
    const { content, parentId } = validatedData;

    console.log(`📝 Creating message in session ${sessionId} from user ${userId}`);

    // Verify user has access to this session
    const boardroomSession = await prisma.boardroomSession.findFirst({
      where: {
        id: sessionId,
        participants: {
          some: {
            userId: userId
          }
        }
      },
      include: {
        scenario: true,
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 10 // Get recent context for AI
        }
      }
    });

    if (!boardroomSession) {
      return NextResponse.json(
        { success: false, error: 'Session not found or access denied' },
        { status: 404 }
      );
    }

    // Find user's participant record
    const userParticipant = boardroomSession.participants.find(p => p.userId === userId);
    if (!userParticipant) {
      return NextResponse.json(
        { success: false, error: 'User is not a participant in this session' },
        { status: 403 }
      );
    }

    // Create user message
    const userMessage = await prisma.message.create({
      data: {
        sessionId: sessionId,
        participantId: userParticipant.id,
        content: content,
        agentType: null, // Human message
        parentId: parentId || null,
      },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      }
    });

    console.log(`✅ User message created with ID: ${userMessage.id}`);

    // Prepare scenario context for AI agents
    const scenarioForAI = boardroomSession.scenario ? {
      id: boardroomSession.scenario.id,
      name: boardroomSession.scenario.name,
      description: boardroomSession.scenario.description || ''
    } : {
      id: 'default',
      name: 'General Discussion',
      description: 'No specific scenario context'
    };

    // Get AI agent responses - use default agents since we don't store AI agents as participants
    // TODO: Store selected agents in session metadata or separate table
    const selectedAgents: AgentType[] = ['ceo', 'cfo', 'cto', 'hr']; // Default to all agents for now

    const aiResponses = [];

    for (const agentRole of selectedAgents) {
      try {
        console.log(`🤖 Getting response from ${agentRole} agent`);
        
        const agentResponse = await getAgentResponse(
          agentRole,
          scenarioForAI,
          content,
          boardroomSession.scenario?.name || 'Unknown Company',
          false, // useDemoData
          true,  // includeRAG
          sessionId
        );

        if (agentResponse && agentResponse.response) {
          // Create AI agent message
          const aiMessage = await prisma.message.create({
            data: {
              sessionId: sessionId,
              participantId: null, // AI messages don't have participant records
              content: agentResponse.response,
              agentType: agentRole,
              parentId: userMessage.id, // Reply to user message
              metadata: JSON.stringify({
                modelUsed: agentResponse.modelUsed || 'unknown',
                tokensUsed: agentResponse.metadata?.tokensUsed || 0,
                responseTime: agentResponse.metadata?.responseTime || 0,
                isDemoMode: agentResponse.isDemoMode || false,
                fromCache: agentResponse.fromCache || false,
                ragEnabled: agentResponse.ragEnabled || false
              })
            }
          });

          aiResponses.push({
            id: aiMessage.id,
            agentType: agentRole,
            content: agentResponse.response,
            metadata: {
              modelUsed: agentResponse.modelUsed,
              tokensUsed: agentResponse.metadata?.tokensUsed || 0,
              responseTime: agentResponse.metadata?.responseTime || 0,
              fromCache: agentResponse.fromCache,
              ragEnabled: agentResponse.ragEnabled
            },
            createdAt: aiMessage.createdAt
          });

          console.log(`✅ ${agentRole} response created with ID: ${aiMessage.id}`);
        }
      } catch (agentError) {
        console.error(`❌ Error getting ${agentRole} response:`, agentError);
        // Continue with other agents even if one fails
      }
    }

    // Return success response with all messages
    return NextResponse.json({
      success: true,
      data: {
        userMessage: {
          id: userMessage.id,
          content: userMessage.content,
          participantId: userMessage.participantId,
          createdAt: userMessage.createdAt,
          participant: userMessage.participant
        },
        aiResponses: aiResponses,
        sessionId: sessionId
      }
    }, { status: 201 });

  } catch (error) {
    console.error('❌ Message creation error:', error);

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
      { success: false, error: 'Failed to create message' },
      { status: 500 }
    );
  }
}

// GET - Retrieve messages for a boardroom session
export async function GET(request: NextRequest) {
  try {
    console.log('💬 Boardroom Messages API: Fetching session messages');

    // Get sessionId from URL
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/')[4];

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID is required' },
        { status: 400 }
      );
    }

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
    const limit = parseInt(searchParams.get('limit') || '50');
    const offset = parseInt(searchParams.get('offset') || '0');

    // Verify user has access to this session
    const hasAccess = await prisma.boardroomSession.findFirst({
      where: {
        id: sessionId,
        participants: {
          some: {
            userId: userId
          }
        }
      }
    });

    if (!hasAccess) {
      console.log(`❌ Session access denied for user ${userId} to session ${sessionId}`);
      // Check if session exists at all
      const sessionExists = await prisma.boardroomSession.findUnique({
        where: { id: sessionId },
        include: {
          participants: true
        }
      });
      
      if (!sessionExists) {
        console.log(`❌ Session ${sessionId} does not exist`);
        return NextResponse.json(
          { success: false, error: 'Session not found' },
          { status: 404 }
        );
      } else {
        console.log(`❌ User ${userId} is not a participant in session ${sessionId}`);
        console.log(`📊 Session has ${sessionExists.participants.length} participants:`, 
          sessionExists.participants.map(p => ({ userId: p.userId, role: p.role })));
        
        // Auto-fix: If user is trying to access their own session but participant record is missing,
        // add them as a participant (this can happen due to timing issues during session creation)
        const sessionCreatedRecently = new Date(sessionExists.createdAt).getTime() > Date.now() - (5 * 60 * 1000); // 5 minutes
        if (sessionCreatedRecently && sessionExists.participants.length === 0) {
          console.log(`🔧 Auto-fixing: Adding missing participant record for session owner`);
          try {
            await prisma.participant.create({
              data: {
                sessionId: sessionId,
                userId: userId,
                role: 'owner',
                joinedAt: new Date()
              }
            });
            console.log(`✅ Added participant record for user ${userId} in session ${sessionId}`);
            
            // Continue with the request now that participant record exists
          } catch (autoFixError) {
            console.error(`❌ Failed to auto-fix participant record:`, autoFixError);
            return NextResponse.json(
              { success: false, error: 'Access denied - you are not a participant in this session' },
              { status: 403 }
            );
          }
        } else {
          return NextResponse.json(
            { success: false, error: 'Access denied - you are not a participant in this session' },
            { status: 403 }
          );
        }
      }
    }

    // Fetch messages
    const messages = await prisma.message.findMany({
      where: {
        sessionId: sessionId
      },
      include: {
        participant: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        }
      },
      orderBy: {
        createdAt: 'asc'
      },
      take: limit,
      skip: offset
    });

    // Transform messages for response
    const transformedMessages = messages.map(message => ({
      id: message.id,
      content: message.content,
      agentType: message.agentType,
      participantId: message.participantId,
      participant: message.participant,
      parentId: message.parentId,
      createdAt: message.createdAt,
      metadata: message.metadata ? JSON.parse(message.metadata) : null
    }));

    console.log(`✅ Found ${messages.length} messages for session ${sessionId}`);

    return NextResponse.json({
      success: true,
      data: transformedMessages,
      pagination: {
        limit,
        offset,
        total: transformedMessages.length,
        sessionId
      }
    });

  } catch (error) {
    console.error('❌ Messages fetch error:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    );
  }
}
