import { NextResponse } from 'next/server';
import { getAgentResponse, agentProfiles } from '@/lib/ai/agent-service';
import { checkDatabaseHealth } from '@/lib/db/connection';
import { cacheService } from '@/lib/cache/redis';

export async function GET() {
  try {
    const healthChecks = await Promise.allSettled([
      // Database health check with timeout
      Promise.race([
        checkDatabaseHealth(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Database health check timeout')), 5000)
        )
      ]),
      
      // Cache health check with timeout
      Promise.race([
        cacheService.healthCheck(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('Cache health check timeout')), 3000)
        )
      ]),
      
      // AI Provider health check
      (async () => {
        try {
          const provider = process.env.AI_PROVIDER || 'gemini';
          const hasApiKey = provider === 'anthropic' 
            ? !!process.env.ANTHROPIC_API_KEY 
            : !!process.env.GEMINI_API_KEY;
            
          return {
            status: hasApiKey ? 'configured' : 'not-configured',
            provider,
            hasApiKey
          };
        } catch (error) {
          return {
            status: 'error',
            error: error instanceof Error ? error.message : 'AI provider check failed'
          };
        }
      })(),
      
      // Test AI agent response (quick test with timeout)
      Promise.race([
        (async () => {
          try {
            const testScenario = {
              id: 'health-test',
              name: 'Health Check',
              description: 'Quick system test'
            };
            
            const testResponse = await getAgentResponse(
              'ceo', 
              testScenario, 
              'Quick health check test',
              'TestCorp',
              true // Use demo mode for health check
            );
            
            return {
              status: testResponse ? 'operational' : 'degraded',
              isDemoMode: testResponse.isDemoMode,
              responseTime: testResponse.metadata?.responseTime || 0
            };
          } catch (error) {
            return {
              status: 'error',
              error: error instanceof Error ? error.message : 'AI test failed'
            };
          }
        })(),
        new Promise((_, reject) => 
          setTimeout(() => reject(new Error('AI agent test timeout')), 10000)
        )
      ])
    ]);

    const [dbHealth, cacheHealth, aiConfigHealth, aiTestHealth] = healthChecks;

    const overallStatus = healthChecks.every(
      result => result.status === 'fulfilled' && 
      result.value && 
      typeof result.value === 'object' &&
      'status' in result.value &&
      (result.value.status === 'healthy' || 
       result.value.status === 'configured' || 
       result.value.status === 'operational')
    ) ? 'healthy' : 'degraded';

    return NextResponse.json({
      success: true,
      status: overallStatus,
      timestamp: new Date().toISOString(),
      version: process.env.npm_package_version || '1.0.0',
      environment: process.env.NODE_ENV,
      services: {
        database: dbHealth.status === 'fulfilled' ? dbHealth.value : { status: 'error', error: 'Failed to check' },
        cache: cacheHealth.status === 'fulfilled' ? cacheHealth.value : { status: 'error', error: 'Failed to check' },
        aiProvider: aiConfigHealth.status === 'fulfilled' ? aiConfigHealth.value : { status: 'error', error: 'Failed to check' },
        aiAgents: aiTestHealth.status === 'fulfilled' ? aiTestHealth.value : { status: 'error', error: 'Failed to check' }
      },
      availableAgents: Object.keys(agentProfiles),
      uptime: process.uptime(),
      memory: {
        used: Math.round(process.memoryUsage().heapUsed / 1024 / 1024),
        total: Math.round(process.memoryUsage().heapTotal / 1024 / 1024),
        rss: Math.round(process.memoryUsage().rss / 1024 / 1024)
      }
    });
  } catch (error) {
    console.error('Health check error:', error);
    return NextResponse.json({
      success: false,
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
