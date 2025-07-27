import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import { prisma } from '@/lib/db/connection';

export async function GET() {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }
    
    // Check if this is a demo user
    const isDemoUser = session.user?.role === 'demo';

    if (isDemoUser) {
      // Return comprehensive demo data for demo users
      const demoData = {
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
            user: { name: 'Demo User' }
          },
          {
            id: '2',
            type: 'session_completed',
            title: 'Budget Allocation Discussion',
            timestamp: new Date(Date.now() - 5 * 60 * 60 * 1000), // 5 hours ago
            user: { name: 'Demo User' }
          },
          {
            id: '3',
            type: 'decision_made',
            title: 'Risk Assessment Decision',
            timestamp: new Date(Date.now() - 24 * 60 * 60 * 1000), // 1 day ago
            user: { name: 'Demo User' }
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
        data: demoData
      });
    } else {
      // For real users, get actual data from database
      const userId = session.user.id;
      
      try {
        // Get user's scenarios count
        const totalScenarios = await prisma.scenario.count({
          where: { createdById: userId }
        });

        const activeScenarios = await prisma.scenario.count({
          where: { 
            createdById: userId,
            status: 'active'
          }
        });

        // Get user's sessions count
        const completedSessions = await prisma.boardroomSession.count({
          where: {
            participants: {
              some: { userId: userId }
            },
            status: 'completed'
          }
        });

        // Get user's decisions count
        const totalDecisions = await prisma.decision.count({
          where: {
            session: {
              participants: {
                some: { userId: userId }
              }
            }
          }
        });

        // Get recent activity (recent scenarios and sessions)
        const recentScenarios = await prisma.scenario.findMany({
          where: { createdById: userId },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            name: true,
            createdAt: true
          }
        });

        const recentSessions = await prisma.boardroomSession.findMany({
          where: {
            participants: {
              some: { userId: userId }
            }
          },
          orderBy: { createdAt: 'desc' },
          take: 3,
          select: {
            id: true,
            name: true,
            createdAt: true,
            status: true
          }
        });

        // Format recent activity
        const recentActivity = [
          ...recentScenarios.map(scenario => ({
            id: scenario.id,
            type: 'scenario_created' as const,
            title: scenario.name,
            timestamp: scenario.createdAt,
            user: { name: session.user?.name || 'User' }
          })),
          ...recentSessions.map(sessionItem => ({
            id: sessionItem.id,
            type: sessionItem.status === 'completed' ? 'session_completed' as const : 'session_created' as const,
            title: sessionItem.name,
            timestamp: sessionItem.createdAt,
            user: { name: session.user?.name || 'User' }
          }))
        ].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()).slice(0, 5);

        // For new users with no data, provide onboarding guidance
        const realUserData = {
          totalScenarios,
          activeScenarios,
          completedSessions,
          totalDecisions,
          recentActivity,
          agentMetrics: {
            ceo: { responsesGenerated: 0, avgConfidence: 0 },
            cfo: { responsesGenerated: 0, avgConfidence: 0 },
            cto: { responsesGenerated: 0, avgConfidence: 0 },
            hr: { responsesGenerated: 0, avgConfidence: 0 }
          },
          isNewUser: totalScenarios === 0 && completedSessions === 0,
          onboarding: {
            nextSteps: [
              { 
                id: 'create_scenario',
                title: 'Create Your First Scenario',
                description: 'Start by creating a business scenario to analyze',
                completed: totalScenarios > 0,
                url: '/scenarios/new'
              },
              {
                id: 'start_session',
                title: 'Start a Boardroom Session',
                description: 'Begin your first AI-powered decision session',
                completed: completedSessions > 0,
                url: '/boardroom'
              },
              {
                id: 'upload_documents',
                title: 'Upload Company Documents',
                description: 'Add documents for more contextual AI responses',
                completed: false, // TODO: Check document count when implemented
                url: '/documents'
              }
            ]
          }
        };

        return NextResponse.json({
          success: true,
          data: realUserData
        });

      } catch (dbError) {
        console.error('Database error fetching dashboard data:', dbError);
        
        // Fallback for database errors - return basic new user structure
        return NextResponse.json({
          success: true,
          data: {
            totalScenarios: 0,
            activeScenarios: 0,
            completedSessions: 0,
            totalDecisions: 0,
            recentActivity: [],
            agentMetrics: {
              ceo: { responsesGenerated: 0, avgConfidence: 0 },
              cfo: { responsesGenerated: 0, avgConfidence: 0 },
              cto: { responsesGenerated: 0, avgConfidence: 0 },
              hr: { responsesGenerated: 0, avgConfidence: 0 }
            },
            isNewUser: true,
            onboarding: {
              nextSteps: [
                { 
                  id: 'create_scenario',
                  title: 'Create Your First Scenario',
                  description: 'Start by creating a business scenario to analyze',
                  completed: false,
                  url: '/scenarios/new'
                },
                {
                  id: 'start_session',
                  title: 'Start a Boardroom Session',
                  description: 'Begin your first AI-powered decision session',
                  completed: false,
                  url: '/boardroom'
                },
                {
                  id: 'upload_documents',
                  title: 'Upload Company Documents',
                  description: 'Add documents for more contextual AI responses',
                  completed: false,
                  url: '/documents'
                }
              ]
            },
            error: 'Database temporarily unavailable, showing default new user experience'
          }
        });
      }
    }

  } catch (error) {
    console.error('Error fetching dashboard data:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch dashboard data' },
      { status: 500 }
    );
  }
}
