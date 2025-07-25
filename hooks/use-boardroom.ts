import { useState, useCallback } from 'react';
import { BoardroomRequest, BoardroomResponse, AgentResponse, Scenario } from '@/lib/types';

interface UseBoardroomReturn {
  isLoading: boolean;
  error: string | null;
  startDiscussion: (request: BoardroomRequest) => Promise<BoardroomResponse | null>;
  getSingleAgentResponse: (agentType: string, scenario: Scenario, context: string) => Promise<AgentResponse | null>;
}

export function useBoardroom(): UseBoardroomReturn {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const startDiscussion = useCallback(async (request: BoardroomRequest): Promise<BoardroomResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/boardroom', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      });

      const data = await response.json();

      if (!data.success) {
        // If we hit API limits, try to use demo data as fallback
        if (data.error?.includes('quota') || data.error?.includes('Too Many Requests')) {
          console.log('API quota exceeded, falling back to demo data...');
          
          const demoResponse = await fetch('/api/demo');
          const demoData = await demoResponse.json();
          
          if (demoData.success && demoData.demo) {
            // Transform demo data to match BoardroomResponse format
            const transformedResponse: BoardroomResponse = {
              sessionId: `demo-${Date.now()}`,
              query: request.query,
              timestamp: new Date().toISOString(),
              scenario: request.scenario,
              responses: demoData.demo.responses,
              synthesis: {
                recommendation: demoData.demo.synthesis.recommendation,
                confidence: demoData.demo.synthesis.confidence as 'High' | 'Medium' | 'Low',
                agentCount: Object.keys(demoData.demo.responses).length,
                timestamp: new Date().toISOString()
              }
            };
            
            setError('Using demo data due to API rate limits');
            return transformedResponse;
          }
        }
        
        throw new Error(data.error || 'Failed to start boardroom discussion');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Boardroom discussion error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const getSingleAgentResponse = useCallback(async (
    agentType: string, 
    scenario: Scenario, 
    context: string
  ): Promise<AgentResponse | null> => {
    try {
      setIsLoading(true);
      setError(null);

      const response = await fetch('/api/agents', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          agentType,
          scenario,
          context,
        }),
      });

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to get agent response');
      }

      return data.data;
    } catch (err) {
      const errorMessage = err instanceof Error ? err.message : 'Unknown error occurred';
      setError(errorMessage);
      console.error('Agent response error:', err);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  return {
    isLoading,
    error,
    startDiscussion,
    getSingleAgentResponse,
  };
}
