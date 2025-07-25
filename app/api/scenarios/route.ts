import { NextResponse } from 'next/server';
import { z } from 'zod';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

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

    // For now, return mock scenarios since database isn't fully set up yet
    const mockScenarios = [
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
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || 'user@example.com',
        },
        sessions: [
          {
            id: 'session-1',
            name: 'Q4 Strategic Investment Review',
            status: 'completed',
            createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(),
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
        description: 'Comprehensive analysis of European market entry opportunities with focus on regulatory compliance, competitive positioning, and local partnership strategies.',
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
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || 'user@example.com',
        },
        sessions: [
          {
            id: 'session-2',
            name: 'European Market Analysis',
            status: 'active',
            createdAt: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(),
            _count: {
              participants: 6,
              messages: 47,
            },
          },
          {
            id: 'session-3',
            name: 'Competitive Analysis Session',
            status: 'completed',
            createdAt: new Date(Date.now() - 8 * 24 * 60 * 60 * 1000).toISOString(),
            _count: {
              participants: 5,
              messages: 31,
            },
          }
        ],
      },
      {
        id: 'scenario-3',
        name: 'Digital Transformation Initiative',
        description: 'Organization-wide digital transformation roadmap including technology modernization, process automation, and workforce training.',
        tags: ['technology', 'transformation'],
        parameters: {
          scope: 'enterprise-wide',
          duration: '18-months',
          budget: '$8M'
        },
        status: 'draft',
        createdAt: new Date(Date.now() - 21 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || 'user@example.com',
        },
        sessions: [],
      },
      {
        id: 'scenario-4',
        name: 'Product Launch Strategy',
        description: 'Go-to-market strategy for new product line including pricing analysis, channel partnerships, and marketing campaign development.',
        tags: ['product', 'marketing'],
        parameters: {
          product_category: 'SaaS Platform',
          target_segment: 'Enterprise',
          launch_date: '2025-Q2'
        },
        status: 'active', 
        createdAt: new Date(Date.now() - 10 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: session.user.id,
          name: session.user.name || 'User',
          email: session.user.email || 'user@example.com',
        },
        sessions: [
          {
            id: 'session-4',
            name: 'Product Positioning Workshop',
            status: 'active',
            createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(),
            _count: {
              participants: 7,
              messages: 19,
            },
          }
        ],
      },
      {
        id: 'scenario-5',
        name: 'Cost Optimization Program',
        description: 'Company-wide cost reduction initiative focusing on operational efficiency, vendor negotiations, and process streamlining.',
        tags: ['finance', 'operations'],
        parameters: {
          target_savings: '$3M',
          timeframe: '9-months',
          departments: ['Operations', 'Procurement', 'IT']
        },
        status: 'completed',
        createdAt: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString(),
        updatedAt: new Date(Date.now() - 14 * 24 * 60 * 60 * 1000).toISOString(),
        createdBy: {
          id: session.user.id,
          name: session.user.name || 'User', 
          email: session.user.email || 'user@example.com',
        },
        sessions: [
          {
            id: 'session-5',
            name: 'Cost Analysis Deep Dive',
            status: 'completed',
            createdAt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
            _count: {
              participants: 5,
              messages: 38,
            },
          },
          {
            id: 'session-6',
            name: 'Vendor Negotiation Strategy',
            status: 'completed',
            createdAt: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString(),
            _count: {
              participants: 4,
              messages: 28,
            },
          }
        ],
      }
    ];

    // Apply filters if provided
    const filteredScenarios = mockScenarios.filter(scenario => {
      if (status && scenario.status !== status) return false;
      if (tags && !tags.some(tag => scenario.tags.includes(tag))) return false;
      return true;
    });

    return NextResponse.json({
      success: true,
      data: filteredScenarios,
    });
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

    // For now, return mock created scenario since database isn't fully set up yet
    const newScenario = {
      id: `scenario-${Date.now()}`,
      name: validatedData.name,
      description: validatedData.description || '',
      tags: validatedData.tags || [],
      parameters: validatedData.parameters || {},
      status: 'draft',
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      createdBy: {
        id: session.user.id,
        name: session.user.name || 'User',
        email: session.user.email || 'user@example.com',
      },
      sessions: [],
    };

    return NextResponse.json({
      success: true,
      data: newScenario,
    });
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
