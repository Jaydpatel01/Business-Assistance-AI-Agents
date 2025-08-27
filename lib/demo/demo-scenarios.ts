/**
 * Comprehensive demo scenarios with pre-filled inputs and mock responses
 * Maps to the 6 predefined scenarios in the system
 */

export interface MockResponse {
  agentType: string;
  content: string;
  confidence: number;
  timestamp: string;
  round: number;
}

export interface DemoScenarioData {
  id: string;
  name: string;
  description: string;
  defaultQuery: string;
  recommendedAgents: string[];
  mockResponses: MockResponse[];
  followUpRounds?: {
    query: string;
    responses: MockResponse[];
  }[];
}

export const DEMO_SCENARIOS: Record<string, DemoScenarioData> = {
  'strategic-investment-analysis': {
    id: 'strategic-investment-analysis',
    name: 'Strategic Investment Analysis',
    description: 'Evaluating a major technology acquisition opportunity',
    defaultQuery: 'We have an opportunity to acquire a promising AI startup for $15M. The company has strong IP in machine learning but limited market presence. Should we proceed with this acquisition, and what would be our integration strategy?',
    recommendedAgents: ['ceo', 'cfo', 'cto'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'This acquisition aligns perfectly with our strategic vision to become a leader in AI-driven solutions. The $15M valuation seems reasonable given their IP portfolio and the current market conditions. However, we need to ensure their technology truly differentiates us from competitors like Microsoft and Google who are heavily investing in AI. I recommend we proceed but negotiate for a staged payment structure tied to integration milestones and IP validation.',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'From a financial perspective, this represents 12% of our available cash reserves, which is significant but manageable. The startup\'s revenue run rate of $2M suggests a 7.5x multiple, which is aggressive but within industry norms for AI companies. My concerns include: 1) Their burn rate of $800K monthly, 2) No clear path to profitability, 3) Potential integration costs of $3-5M. I suggest a detailed due diligence on their financial projections and a lower initial offer of $12M with earnouts.',
        confidence: 0.78,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cto',
        content: 'Their machine learning algorithms show genuine innovation, particularly in natural language processing and automated decision-making. The technical team of 12 engineers is strong, with several PhD-level researchers. However, their codebase needs significant refactoring to integrate with our existing systems. Estimated integration timeline: 8-12 months with dedicated resources. The IP portfolio includes 3 granted patents and 5 pending, which strengthens our competitive moat. Technical due diligence shows their technology could accelerate our AI roadmap by 18 months.',
        confidence: 0.82,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ],
    followUpRounds: [
      {
        query: 'What specific integration challenges should we prepare for, and how do we retain their key talent?',
        responses: [
          {
            agentType: 'ceo',
            content: 'Talent retention is critical - we should offer equity packages and leadership roles to their top 5 engineers. I propose creating an AI Innovation Center with their current CTO as VP of AI Research. Cultural integration workshops and clear career progression paths will be essential.',
            confidence: 0.88,
            timestamp: new Date().toISOString(),
            round: 2
          },
          {
            agentType: 'cfo',
            content: 'Retention packages will cost approximately $2.5M over 2 years. Integration budget should include: infrastructure migration ($1.2M), training programs ($500K), and potential redundancy costs ($800K). Total integration cost estimate: $5M over 18 months.',
            confidence: 0.75,
            timestamp: new Date().toISOString(),
            round: 2
          },
          {
            agentType: 'cto',
            content: 'Key technical challenges include: API compatibility, data migration, security compliance, and maintaining their research velocity. I recommend a hybrid integration approach - keep their core research team autonomous while gradually merging infrastructure and operations.',
            confidence: 0.85,
            timestamp: new Date().toISOString(),
            round: 2
          }
        ]
      }
    ]
  },

  'market-expansion-strategy': {
    id: 'market-expansion-strategy',
    name: 'International Market Expansion',
    description: 'Expanding operations to European markets',
    defaultQuery: 'We\'re considering expanding our SaaS platform to the European market, starting with Germany, France, and the UK. What are the key considerations for market entry, regulatory compliance, and resource allocation across these three markets?',
    recommendedAgents: ['ceo', 'cfo', 'cto'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'European expansion represents a massive opportunity - the market size is roughly 3x our current US market. Germany should be our primary focus given their strong enterprise adoption of SaaS solutions. The UK offers language advantages and post-Brexit regulatory flexibility. France has strict data localization requirements but excellent government incentives for tech companies. I recommend a phased approach: UK first (6 months), Germany second (12 months), then France (18 months). This allows us to learn and adapt our strategy progressively.',
        confidence: 0.87,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'The financial implications are substantial. Initial investment requirement: $8-12M over 24 months. Revenue projections suggest break-even by month 18 in UK, month 24 in Germany, and month 30 in France. Key costs include: regulatory compliance ($1.5M), localization ($2M), marketing ($3M), and local hiring ($4M). Currency hedging will be essential given EUR/GBP volatility. I suggest securing a $15M credit facility to manage cash flow during expansion.',
        confidence: 0.80,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cto',
        content: 'Technical infrastructure requirements are complex but manageable. GDPR compliance is critical - we need data residency in EU, enhanced privacy controls, and audit trails. AWS has excellent EU regions in Frankfurt and Ireland. Localization challenges include: multi-language support (German, French), local payment integrations, and different authentication standards. Estimated development effort: 6 months for core compliance, additional 3 months per market for localization. We\'ll need to hire 2-3 senior engineers in Europe.',
        confidence: 0.83,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ]
  },

  'cost-optimization-initiative': {
    id: 'cost-optimization-initiative',
    name: 'Operational Cost Optimization',
    description: 'Reducing operational expenses while maintaining growth',
    defaultQuery: 'Our operational costs have increased 40% this quarter while revenue growth is only 25%. We need to identify areas for cost optimization without compromising our growth trajectory or team morale. What are the most effective cost reduction strategies we should implement?',
    recommendedAgents: ['ceo', 'cfo', 'hr'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'This cost-revenue misalignment is concerning but not uncommon during rapid scaling. We need surgical cost cuts, not across-the-board reductions. Priority areas: 1) Vendor consolidation and renegotiation, 2) Process automation to reduce manual overhead, 3) Real estate optimization with hybrid work models. We must protect our core growth engines - product development and customer success teams. I suggest targeting 15-20% cost reduction over 6 months while maintaining our innovation pace.',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'Detailed analysis shows the largest cost drivers: 1) Infrastructure costs up 60% ($2.3M annually), 2) Third-party services increased 45% ($1.8M), 3) Office expenses unchanged despite remote work ($1.2M). Quick wins: renegotiate AWS contract (potential 25% savings), consolidate SaaS tools (30% reduction), sublease unused office space (50% savings). These changes could reduce quarterly costs by $800K with minimal business impact.',
        confidence: 0.88,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'hr',
        content: 'From a people perspective, we must avoid layoffs that could damage morale and slow growth. Alternative strategies: 1) Voluntary sabbatical program with partial pay, 2) Temporary salary reductions for leadership team, 3) Performance-based bonuses instead of fixed raises, 4) Enhanced remote work to reduce office costs. Employee retention is crucial - losing key talent costs 150% of their annual salary in replacement and training.',
        confidence: 0.82,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ]
  },

  'workforce-planning-restructuring': {
    id: 'workforce-planning-restructuring',
    name: 'Workforce Planning & Restructuring',
    description: 'Optimizing team structure for future growth',
    defaultQuery: 'With our recent funding round, we need to strategically expand our workforce from 85 to 150 employees over the next 12 months. How should we prioritize hiring across departments, and what organizational changes will support this growth while maintaining our company culture?',
    recommendedAgents: ['ceo', 'cfo', 'hr'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'This growth phase is critical for establishing our market leadership. Hiring priorities should align with our strategic objectives: 1) Engineering (30 new hires) to accelerate product development, 2) Sales & Marketing (20 hires) to capture market opportunities, 3) Customer Success (10 hires) to ensure retention, 4) Operations (5 hires) to scale efficiently. We need to establish clear management layers and cross-functional collaboration processes. Maintaining our startup agility while building enterprise capabilities is key.',
        confidence: 0.90,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'Budget allocation for 65 new hires: $6.5M in annual salaries, $1.3M in benefits, $800K in equipment and onboarding costs. Total investment: $8.6M. We should front-load engineering and sales hires in Q1-Q2 to maximize revenue impact. Recommended approach: hire senior leaders first to establish structure, then scale teams underneath. Cash flow impact will be significant in months 1-6 before new hires generate revenue.',
        confidence: 0.84,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'hr',
        content: 'Doubling our workforce requires systematic approach to preserve culture. Key initiatives: 1) Structured onboarding program (2-week minimum), 2) Mentorship matching for all new hires, 3) Regular culture surveys and feedback loops, 4) Clear career progression frameworks, 5) Enhanced management training for new leaders. We need to establish remote work policies, compensation bands, and performance review processes. Risk: diluting our collaborative culture with rapid hiring.',
        confidence: 0.86,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ]
  },

  'digital-transformation-roadmap': {
    id: 'digital-transformation-roadmap',
    name: 'Digital Transformation Initiative',
    description: 'Modernizing technology infrastructure and processes',
    defaultQuery: 'Our current legacy systems are limiting our scalability and competitiveness. We need a comprehensive digital transformation roadmap that includes cloud migration, process automation, and data analytics capabilities. What should be our priorities and timeline for this transformation?',
    recommendedAgents: ['ceo', 'cto', 'cfo'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'Digital transformation is no longer optional - it\'s essential for survival. Our legacy systems are costing us deals and slowing innovation. Priority transformation areas: 1) Customer-facing systems for better experience, 2) Internal operations for efficiency gains, 3) Data analytics for informed decision-making. This transformation should position us as a technology leader in our industry. Timeline: 18-24 months with measurable ROI milestones every quarter.',
        confidence: 0.89,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cto',
        content: 'Technical roadmap focuses on three phases: 1) Foundation (months 1-8): cloud migration, security hardening, API modernization, 2) Enhancement (months 9-16): automation tools, analytics platform, mobile capabilities, 3) Innovation (months 17-24): AI integration, advanced analytics, IoT connectivity. Key risks include data migration complexity and potential downtime during transitions. We need dedicated transformation team of 8-10 engineers plus external consultants.',
        confidence: 0.87,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'Digital transformation investment: $4.2M over 24 months. Breakdown: cloud infrastructure ($1.5M), software licenses ($1.2M), consulting services ($800K), internal resources ($700K). Expected benefits: 30% operational cost reduction, 25% faster time-to-market, 40% improvement in customer satisfaction. ROI positive by month 18. We should consider financing options and potential tax incentives for technology investments.',
        confidence: 0.82,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ]
  },

  'customer-retention-strategy': {
    id: 'customer-retention-strategy',
    name: 'Customer Retention Enhancement',
    description: 'Improving customer satisfaction and reducing churn',
    defaultQuery: 'Our customer churn rate has increased to 8% monthly, significantly above industry average of 5%. We\'re losing valuable customers to competitors who offer better support and more intuitive user experiences. What comprehensive strategy should we implement to improve retention and win back churned customers?',
    recommendedAgents: ['ceo', 'cfo', 'cto'],
    mockResponses: [
      {
        agentType: 'ceo',
        content: 'Customer retention is critical - acquiring new customers costs 5x more than retaining existing ones. Root cause analysis shows: 1) Poor onboarding experience (40% of churned customers), 2) Lack of ongoing value demonstration (35%), 3) Competitive pricing pressure (25%). Strategy: implement comprehensive customer success program, enhance product stickiness through integrations, and create customer advocacy programs. We need to shift from reactive support to proactive customer success.',
        confidence: 0.91,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cfo',
        content: 'Churn impact: losing $2.4M ARR quarterly with average customer LTV of $45K. Retention investment ROI is compelling - every 1% reduction in churn increases company value by ~$3M. Proposed investments: customer success team expansion ($1.2M annually), product improvements ($800K), retention tools and analytics ($400K). Expected outcome: reduce churn to 5% within 12 months, resulting in $1.8M additional revenue.',
        confidence: 0.85,
        timestamp: new Date().toISOString(),
        round: 1
      },
      {
        agentType: 'cto',
        content: 'Technical improvements for retention: 1) Enhanced onboarding flow with progressive disclosure, 2) In-app guidance and tooltips, 3) Usage analytics to identify at-risk customers, 4) API improvements for better integrations, 5) Mobile app for increased engagement. Key metrics to track: feature adoption rates, support ticket volume, user session duration. Implementation timeline: 6 months for core improvements, ongoing optimization thereafter.',
        confidence: 0.84,
        timestamp: new Date().toISOString(),
        round: 1
      }
    ]
  }
};

/**
 * Get demo scenario data by ID
 */
export function getDemoScenario(scenarioId: string): DemoScenarioData | null {
  return DEMO_SCENARIOS[scenarioId] || null;
}

/**
 * Get all demo scenarios
 */
export function getAllDemoScenarios(): DemoScenarioData[] {
  return Object.values(DEMO_SCENARIOS);
}

/**
 * Check if scenario has demo data
 */
export function hasDemoData(scenarioId: string): boolean {
  return scenarioId in DEMO_SCENARIOS;
}

/**
 * Get mock responses for a scenario
 */
export function getMockResponses(scenarioId: string, round: number = 1): MockResponse[] {
  const scenario = DEMO_SCENARIOS[scenarioId];
  if (!scenario) return [];
  
  if (round === 1) {
    return scenario.mockResponses;
  }
  
  if (scenario.followUpRounds && scenario.followUpRounds[round - 2]) {
    return scenario.followUpRounds[round - 2].responses;
  }
  
  return [];
}
