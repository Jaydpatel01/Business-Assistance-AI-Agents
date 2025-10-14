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
  },
  {
    id: 'market-expansion-strategy',
    name: 'Market Expansion Strategy',
    description: 'Develop a comprehensive plan for entering new European markets with focus on regulatory compliance, competitive analysis, and go-to-market strategy.',
    tags: ['strategy', 'expansion', 'international', 'growth'],
    parameters: {
      timeframe: '12-months',
      targetMarkets: ['Germany', 'France', 'UK'],
      departments: ['Strategy', 'Marketing', 'Legal']
    },
    status: 'draft',
    category: 'strategic',
    difficulty: 'advanced',
    estimatedDuration: '60-75 min',
    defaultQuery: 'What are the critical success factors for expanding into European markets?',
    recommendedAgents: ['ceo', 'cfo', 'cto']
  },
  {
    id: 'cost-optimization-initiative',
    name: 'Cost Optimization Initiative',
    description: 'Analyze current burn rate and develop strategies to reduce operational costs by 30% while maintaining growth trajectory and team morale.',
    tags: ['finance', 'operations', 'efficiency', 'cost-reduction'],
    parameters: {
      timeframe: '3-months',
      targetReduction: '30%',
      departments: ['Finance', 'Operations', 'HR']
    },
    status: 'draft',
    category: 'operational',
    difficulty: 'intermediate',
    estimatedDuration: '30-45 min',
    defaultQuery: 'How can we reduce our burn rate by 30% without compromising our growth plans?',
    recommendedAgents: ['cfo', 'ceo']
  },
  {
    id: 'workforce-planning-restructuring',
    name: 'Workforce Planning & Restructuring',
    description: 'Strategic workforce planning to align talent with business objectives, including hiring priorities, skill gap analysis, and organizational restructuring.',
    tags: ['hr', 'talent', 'organization', 'planning'],
    parameters: {
      timeframe: '6-months',
      headcount: '50-75',
      departments: ['HR', 'All Departments']
    },
    status: 'draft',
    category: 'hr',
    difficulty: 'intermediate',
    estimatedDuration: '45-60 min',
    defaultQuery: 'What should our hiring priorities be to support our growth objectives?',
    recommendedAgents: ['hr', 'ceo']
  },
  {
    id: 'digital-transformation-roadmap',
    name: 'Digital Transformation Roadmap',
    description: 'Create a comprehensive technology modernization plan including cloud migration, AI integration, and legacy system replacement.',
    tags: ['technology', 'digital', 'transformation', 'modernization'],
    parameters: {
      timeframe: '18-months',
      budget: '$5M',
      departments: ['Technology', 'Operations', 'Finance']
    },
    status: 'draft',
    category: 'strategic',
    difficulty: 'advanced',
    estimatedDuration: '60-90 min',
    defaultQuery: 'What should be our top priorities for digital transformation over the next 18 months?',
    recommendedAgents: ['cto', 'ceo', 'cfo']
  },
  {
    id: 'customer-retention-strategy',
    name: 'Customer Retention Strategy',
    description: 'Develop strategies to reduce churn from 12% to 5% through improved customer experience, product enhancements, and support optimization.',
    tags: ['customer', 'retention', 'churn', 'experience'],
    parameters: {
      timeframe: '6-months',
      targetChurn: '5%',
      departments: ['Customer Success', 'Product', 'Marketing']
    },
    status: 'draft',
    category: 'operational',
    difficulty: 'intermediate',
    estimatedDuration: '45-60 min',
    defaultQuery: 'What are the most effective strategies to reduce our customer churn rate?',
    recommendedAgents: ['ceo', 'cfo', 'cto']
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
 * Check if a scenario ID belongs to a predefined scenario
 */
export function isPredefinedScenario(id: string): boolean {
  return PREDEFINED_SCENARIOS.some(s => s.id === id);
}

/**
 * Get all predefined scenario IDs
 */
export function getPredefinedScenarioIds(): string[] {
  return PREDEFINED_SCENARIOS.map(s => s.id);
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
