/**
 * Predefined scenario templates shared by both demo and real users
 * Real users get real AI responses, demo users get demo responses
 */

export interface PredefinedScenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  parameters: Record<string, unknown>;
  status: 'draft' | 'active' | 'completed';
  category: 'financial' | 'strategic' | 'operational' | 'hr';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  estimatedDuration: string;
  defaultQuery?: string;
  recommendedAgents: ('ceo' | 'cfo' | 'cto' | 'hr')[];
}

export const PREDEFINED_SCENARIOS: PredefinedScenario[] = [
  {
    id: 'strategic-investment-analysis',
    name: 'Strategic Investment Analysis',
    description: 'Evaluate major investment opportunities with comprehensive financial and strategic analysis including market research, competitive landscape, and risk assessment.',
    tags: ['finance', 'strategy', 'investment', 'roi'],
    parameters: {
      timeframe: '6-months',
      budget: '$2M',
      departments: ['Finance', 'Strategy', 'Operations']
    },
    status: 'draft',
    category: 'financial',
    difficulty: 'advanced',
    estimatedDuration: '45-60 min',
    defaultQuery: 'What are the key financial metrics we should evaluate before proceeding with this $2M investment opportunity?',
    recommendedAgents: ['ceo', 'cfo']
  }
];

/**
 * Get predefined scenarios for a user (both demo and real users get the same scenarios)
 * The difference is in the responses they receive, not the scenarios themselves
 */
export function getPredefinedScenarios(
  filters?: {
    status?: string;
    category?: string;
    difficulty?: string;
    tags?: string[];
  }
): PredefinedScenario[] {
  let scenarios = [...PREDEFINED_SCENARIOS];

  if (filters) {
    if (filters.status) {
      scenarios = scenarios.filter(s => s.status === filters.status);
    }
    if (filters.tags && filters.tags.length > 0) {
      scenarios = scenarios.filter(s => 
        filters.tags!.some(tag => s.tags.includes(tag))
      );
    }
    if (filters.category) {
      scenarios = scenarios.filter(s => s.category === filters.category);
    }
    if (filters.difficulty) {
      scenarios = scenarios.filter(s => s.difficulty === filters.difficulty);
    }
  }

  return scenarios;
}

/**
 * Get a specific predefined scenario by ID
 */
export function getPredefinedScenario(id: string): PredefinedScenario | undefined {
  return PREDEFINED_SCENARIOS.find(s => s.id === id);
}

/**
 * Convert predefined scenario to API response format
 */
export function formatScenarioForAPI(scenario: PredefinedScenario, userId: string, userName?: string, userEmail?: string) {
  return {
    id: scenario.id,
    name: scenario.name,
    description: scenario.description,
    tags: scenario.tags,
    parameters: scenario.parameters,
    status: scenario.status,
    createdAt: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 7 days ago
    updatedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
    createdBy: {
      id: userId,
      name: userName || 'System',
      email: userEmail || 'system@businessai.com',
    },
    sessions: [], // Predefined scenarios start with no sessions
    _count: {
      sessions: 0
    },
    // Additional metadata for real users
    category: scenario.category,
    difficulty: scenario.difficulty,
    estimatedDuration: scenario.estimatedDuration,
    defaultQuery: scenario.defaultQuery,
    recommendedAgents: scenario.recommendedAgents,
    isPredefined: true // Flag to identify predefined scenarios
  };
}
