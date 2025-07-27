import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Recent sessions endpoint
export async function GET(request: NextRequest) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const userId = searchParams.get('userId') || session.user?.email
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock data for recent sessions
    // In a real implementation, this would query the database
    const recentSessions = [
      {
        id: 'session-1',
        name: 'Q1 Strategic Planning Review',
        scenario: 'Strategic Planning',
        duration: 65,
        status: 'completed',
        participants: 4,
        decisions: 7,
        createdAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        completedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000 + 65 * 60 * 1000).toISOString()
      },
      {
        id: 'session-2',
        name: 'Budget Allocation Discussion',
        scenario: 'Financial Planning',
        duration: 32,
        status: 'active',
        participants: 3,
        decisions: 2,
        createdAt: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString(), // 4 hours ago
        completedAt: null
      },
      {
        id: 'session-3',
        name: 'Technology Roadmap Planning',
        scenario: 'Technology Strategy',
        duration: 89,
        status: 'completed',
        participants: 5,
        decisions: 12,
        createdAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        completedAt: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000 + 89 * 60 * 1000).toISOString()
      },
      {
        id: 'session-4',
        name: 'Market Expansion Analysis',
        scenario: 'Market Analysis',
        duration: 43,
        status: 'paused',
        participants: 3,
        decisions: 1,
        createdAt: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        completedAt: null
      },
      {
        id: 'session-5',
        name: 'Risk Assessment Review',
        scenario: 'Risk Management',
        duration: 67,
        status: 'completed',
        participants: 4,
        decisions: 9,
        createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        completedAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000 + 67 * 60 * 1000).toISOString()
      }
    ]

    // Sort by creation date (most recent first) and limit results
    const sortedSessions = recentSessions
      .sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: sortedSessions,
      total: recentSessions.length,
      limit,
      userId
    })

  } catch (error) {
    console.error('Recent sessions error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch recent sessions',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
