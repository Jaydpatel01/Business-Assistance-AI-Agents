/**
 * Demo scenario input suggestions for the boardroom
 * Provides pre-defined strategic questions for different scenario types
 */

export interface ScenarioInput {
  id: string;
  question: string;
  description: string;
  category: 'strategic' | 'financial' | 'operational' | 'risk';
}

export interface ScenarioInputData {
  defaultQuery: string;
  recommendedAgents: ('ceo' | 'cfo' | 'cto' | 'hr')[];
  suggestions: ScenarioInput[];
}

// Demo scenario inputs for different scenarios
const scenarioInputsData: Record<string, ScenarioInputData> = {
  'scenario-1': {
    defaultQuery: 'What are the key financial metrics we should evaluate before proceeding with this $2M investment opportunity?',
    recommendedAgents: ['ceo', 'cfo'],
    suggestions: [
      {
        id: 'strategic-investment-1',
        question: 'What are the key financial metrics we should evaluate before proceeding with this $2M investment opportunity?',
        description: 'Strategic investment analysis focusing on ROI and risk assessment',
        category: 'financial'
      },
      {
        id: 'strategic-investment-2', 
        question: 'How does this investment align with our long-term strategic goals and market positioning?',
        description: 'Strategic alignment and competitive advantage analysis',
        category: 'strategic'
      },
      {
        id: 'strategic-investment-3',
        question: 'What are the potential risks and mitigation strategies for this investment?',
        description: 'Risk assessment and contingency planning',
        category: 'risk'
      }
    ]
  },
  'scenario-2': {
    defaultQuery: 'What regulatory compliance requirements must we address for European market entry?',
    recommendedAgents: ['ceo', 'cto'],
    suggestions: [
      {
        id: 'market-expansion-1',
        question: 'What regulatory compliance requirements must we address for European market entry?',
        description: 'Regulatory compliance and legal framework analysis',
        category: 'operational'
      },
      {
        id: 'market-expansion-2',
        question: 'How should we structure our budget allocation across the target markets (Germany, France, UK)?',
        description: 'Budget planning and resource allocation strategy',
        category: 'financial'
      },
      {
        id: 'market-expansion-3',
        question: 'What partnerships and local market strategies should we prioritize in each region?',
        description: 'Partnership strategy and local market adaptation',
        category: 'strategic'
      }
    ]
  },
  'scenario-3': {
    defaultQuery: 'Which operational risks pose the greatest threat to our quarterly targets?',
    recommendedAgents: ['ceo', 'cfo', 'hr'],
    suggestions: [
      {
        id: 'risk-assessment-1',
        question: 'Which operational risks pose the greatest threat to our quarterly targets?',
        description: 'Operational risk identification and prioritization',
        category: 'risk'
      },
      {
        id: 'risk-assessment-2',
        question: 'How can we improve our financial risk monitoring across all business units?',
        description: 'Financial risk management and monitoring systems',
        category: 'financial'
      },
      {
        id: 'risk-assessment-3',
        question: 'What contingency plans should we develop for the identified high-priority risks?',
        description: 'Contingency planning and risk mitigation strategies',
        category: 'operational'
      }
    ]
  }
};

/**
 * Get demo input suggestions for a specific scenario
 */
export function getScenarioInput(scenarioId?: string): ScenarioInputData | null {
  if (!scenarioId || !scenarioInputsData[scenarioId]) {
    return null;
  }
  
  return scenarioInputsData[scenarioId];
}

/**
 * Get all input suggestions for a scenario
 */
export function getScenarioInputs(scenarioId?: string): ScenarioInput[] {
  if (!scenarioId || !scenarioInputsData[scenarioId]) {
    return [];
  }
  
  return scenarioInputsData[scenarioId].suggestions;
}

/**
 * Check if a scenario has predefined input suggestions
 */
export function hasScenarioInputs(scenarioId?: string): boolean {
  return !!(scenarioId && scenarioInputsData[scenarioId] && scenarioInputsData[scenarioId].suggestions.length > 0);
}

/**
 * Get a random scenario input from any scenario
 */
export function getRandomScenarioInput(): string {
  const allInputs = Object.values(scenarioInputsData).flatMap(data => data.suggestions);
  if (allInputs.length === 0) {
    return "What strategic recommendations do you have for our current business situation?";
  }
  
  const randomInput = allInputs[Math.floor(Math.random() * allInputs.length)];
  return randomInput.question;
}
