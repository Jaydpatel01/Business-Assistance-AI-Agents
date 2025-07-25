import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // For now, return mock data since we don't have a database set up yet
    const mockData = {
      totalScenarios: 12,
      activeScenarios: 3,
      completedSessions: 8,
      totalDecisions: 24,
      recentActivity: [
        {
          id: '1',
          type: 'scenario_created',
          title: 'Market Expansion Strategy',
          timestamp: new Date(Date.now() - 2 * 60 * 60 * 1000), // 2 hours ago
          user: { name: 'John Doe' }
        },
        {
          id: '2',
          type: 'session_completed',
          title: 'Budget Allocation Discussion',
          timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
          user: { name: 'Jane Smith' }
        },
        {
          id: '3',
          type: 'decision_made',
          title: 'Hiring Freeze Decision',
          timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
          user: { name: 'Mike Johnson' }
        }
      ],
      agentMetrics: {
        ceo: { responsesGenerated: 45, avgConfidence: 0.87 },
        cfo: { responsesGenerated: 42, avgConfidence: 0.91 },
        cto: { responsesGenerated: 38, avgConfidence: 0.84 },
        hr: { responsesGenerated: 35, avgConfidence: 0.82 }
      }
    };

    return NextResponse.json({
      success: true,
      data: mockData
    });

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
