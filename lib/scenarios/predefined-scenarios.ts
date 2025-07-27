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
    name: 'International Market Expansion',
    description: 'Analyze opportunities for expanding into European markets, including regulatory requirements, competitive analysis, and resource allocation.',
    tags: ['expansion', 'international', 'compliance', 'strategy'],
    parameters: {
      targetMarkets: ['Germany', 'France', 'UK'],
      timeline: '12-months',
      budget: '$5M',
      departments: ['Marketing', 'Legal', 'Operations']
    },
    status: 'draft',
    category: 'strategic',
    difficulty: 'advanced',
    estimatedDuration: '50-65 min',
    defaultQuery: 'What regulatory compliance requirements must we address for European market entry?',
    recommendedAgents: ['ceo', 'cto']
  },
  {
    id: 'cost-optimization-initiative',
    name: 'Q4 Cost Optimization Initiative',
    description: 'Identify cost reduction opportunities across all departments while maintaining operational efficiency and employee satisfaction.',
    tags: ['cost-reduction', 'efficiency', 'operations', 'budget'],
    parameters: {
      targetSavings: '15%',
      timeframe: '3-months',
      departments: ['All Departments'],
      constraints: ['No layoffs', 'Maintain quality']
    },
    status: 'draft',
    category: 'operational',
    difficulty: 'intermediate',
    estimatedDuration: '30-40 min',
    defaultQuery: 'What are the most effective cost reduction strategies that won\'t impact our service quality?',
    recommendedAgents: ['cfo', 'ceo']
  },
  {
    id: 'workforce-planning-restructuring',
    name: 'Workforce Planning & Restructuring',
    description: 'Strategic decisions around hiring, restructuring, and organizational changes to support business growth and efficiency.',
    tags: ['hr', 'restructuring', 'talent', 'growth'],
    parameters: {
      timeline: '6-months',
      departments: ['Technology', 'Sales', 'Operations'],
      objectives: ['Increase efficiency', 'Support growth', 'Improve culture']
    },
    status: 'draft',
    category: 'hr',
    difficulty: 'advanced',
    estimatedDuration: '40-55 min',
    defaultQuery: 'How should we restructure our teams to support our growth objectives while maintaining employee morale?',
    recommendedAgents: ['hr', 'ceo']
  },
  {
    id: 'digital-transformation-roadmap',
    name: 'Digital Transformation Roadmap',
    description: 'Plan the digital transformation journey including technology upgrades, process automation, and cultural change management.',
    tags: ['technology', 'transformation', 'automation', 'innovation'],
    parameters: {
      timeline: '18-months',
      budget: '$3M',
      priority: 'High',
      departments: ['IT', 'Operations', 'Finance']
    },
    status: 'draft',
    category: 'strategic',
    difficulty: 'advanced',
    estimatedDuration: '60-75 min',
    defaultQuery: 'What should be our technology investment priorities for the next 18 months?',
    recommendedAgents: ['cto', 'ceo']
  },
  {
    id: 'customer-retention-strategy',
    name: 'Customer Retention Enhancement',
    description: 'Develop strategies to improve customer satisfaction, reduce churn, and increase customer lifetime value.',
    tags: ['customer', 'retention', 'satisfaction', 'revenue'],
    parameters: {
      currentChurnRate: '8%',
      targetReduction: '3%',
      timeline: '9-months',
      focus: ['Service Quality', 'Product Features', 'Support']
    },
    status: 'draft',
    category: 'strategic',
    difficulty: 'intermediate',
    estimatedDuration: '35-45 min',
    defaultQuery: 'What strategies can we implement to reduce customer churn by 3% over the next 9 months?',
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
    tags?: string[];
    category?: string;
    difficulty?: string;
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
