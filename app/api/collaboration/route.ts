/**
 * API Route: /api/collaboration
 * Phase 4: Multi-Agent Collaboration Endpoints
 */

import { NextRequest, NextResponse } from 'next/server';
import { collaborationService, type CollaborationPlan } from '../../../lib/ai/collaboration-service';

export async function POST(request: NextRequest) {
  try {
    const { action, ...params } = await request.json();

    switch (action) {
      case 'start_collaboration':
        return await handleStartCollaboration(params);
      case 'get_discussion':
        return await handleGetDiscussion(params);
      case 'get_session_discussions':
        return await handleGetSessionDiscussions(params);
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaboration API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleStartCollaboration(params: {
  sessionId: string;
  plan: CollaborationPlan;
  context: string;
  userMessage?: string;
}) {
  const { sessionId, plan, context, userMessage } = params;

  if (!sessionId || !plan || !context) {
    return NextResponse.json(
      { error: 'Missing required parameters: sessionId, plan, context' },
      { status: 400 }
    );
  }

  try {
    const discussion = await collaborationService.startCollaboration(
      sessionId,
      plan,
      context,
      userMessage
    );

    return NextResponse.json({
      success: true,
      discussion: {
        id: discussion.id,
        sessionId: discussion.sessionId,
        topic: discussion.topic,
        participants: discussion.participants,
        status: discussion.status,
        eventCount: discussion.events.length,
        startTime: discussion.startTime
      }
    });
  } catch (error) {
    console.error('Error starting collaboration:', error);
    return NextResponse.json(
      { 
        error: 'Failed to start collaboration',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}

async function handleGetDiscussion(params: { discussionId: string }) {
  const { discussionId } = params;

  if (!discussionId) {
    return NextResponse.json(
      { error: 'Missing discussionId parameter' },
      { status: 400 }
    );
  }

  const discussion = collaborationService.getDiscussion(discussionId);
  
  if (!discussion) {
    return NextResponse.json(
      { error: 'Discussion not found' },
      { status: 404 }
    );
  }

  return NextResponse.json({
    success: true,
    discussion
  });
}

async function handleGetSessionDiscussions(params: { sessionId: string }) {
  const { sessionId } = params;

  if (!sessionId) {
    return NextResponse.json(
      { error: 'Missing sessionId parameter' },
      { status: 400 }
    );
  }

  const discussions = collaborationService.getSessionDiscussions(sessionId);

  return NextResponse.json({
    success: true,
    discussions: discussions.map(d => ({
      id: d.id,
      topic: d.topic,
      participants: d.participants,
      status: d.status,
      eventCount: d.events.length,
      startTime: d.startTime,
      endTime: d.endTime,
      consensus: d.consensus
    }))
  });
}

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');

    switch (action) {
      case 'active_discussions':
        const activeDiscussions = collaborationService.getActiveDiscussions();
        return NextResponse.json({
          success: true,
          discussions: activeDiscussions.map(d => ({
            id: d.id,
            sessionId: d.sessionId,
            topic: d.topic,
            participants: d.participants,
            status: d.status,
            eventCount: d.events.length,
            startTime: d.startTime
          }))
        });

      case 'health':
        return NextResponse.json({
          success: true,
          status: 'operational',
          activeDiscussions: collaborationService.getActiveDiscussions().length,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json(
          { error: 'Invalid action parameter' },
          { status: 400 }
        );
    }
  } catch (error) {
    console.error('Collaboration GET API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    );
  }
}
