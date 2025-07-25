import { GoogleGenerativeAI } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { getApiKey, getModelForAgent } from '../config/env';
import { cacheService } from '../cache/redis';
import { agentResponseCache } from '../cache/agent-response-cache';

// Initialize AI clients with error handling
const getGeminiClient = () => {
  try {
    const apiKey = getApiKey();
    if (!apiKey) {
      throw new Error('Google Gemini API key is not configured');
    }
    return new GoogleGenerativeAI(apiKey);
  } catch (error) {
    console.error('Failed to initialize Gemini client:', error);
    throw error;
  }
};

const getAnthropicClient = () => {
  const apiKey = process.env.ANTHROPIC_API_KEY;
  if (!apiKey) {
    throw new Error('ANTHROPIC_API_KEY is required for Claude API');
  }
  try {
    return new Anthropic({ apiKey });
  } catch (error) {
    console.error('Failed to initialize Anthropic client:', error);
    throw error;
  }
};

// Agent roles and personalities
export const agentProfiles = {
  ceo: {
    role: 'CEO',
    personality: 'Visionary, strategic, focused on long-term value and market leadership',
    expertise: ['corporate strategy', 'leadership', 'investor relations', 'market positioning'],
    modelEnvVar: 'AI_MODEL_CEO',
    avatar: '👑',
    color: '#8B5CF6' // Purple
  },
  cfo: {
    role: 'CFO',
    personality: 'Analytical, cautious, focused on financial stability and risk management',
    expertise: ['financial analysis', 'risk management', 'capital allocation', 'budgeting'],
    modelEnvVar: 'AI_MODEL_CFO',
    avatar: '💰',
    color: '#10B981' // Green
  },
  cto: {
    role: 'CTO',
    personality: 'Innovative, technical, focused on technological advancement and scalability',
    expertise: ['technology trends', 'software development', 'digital transformation', 'infrastructure'],
    modelEnvVar: 'AI_MODEL_CTO',
    avatar: '⚡',
    color: '#3B82F6' // Blue
  },
  hr: {
    role: 'CHRO',
    personality: 'Empathetic, people-focused, culture-oriented and talent development focused',
    expertise: ['talent management', 'organizational development', 'culture building', 'employee engagement'],
    modelEnvVar: 'AI_MODEL_HR',
    avatar: '👥',
    color: '#F59E0B' // Amber
  }
} as const;

export type AgentType = keyof typeof agentProfiles;

// Types for better type safety
interface ScenarioData {
  id?: string;
  name: string;
  description: string;
  parameters?: Record<string, unknown>;
}

interface AgentResponse {
  response: string;
  agent: typeof agentProfiles[AgentType];
  timestamp: string;
  modelUsed: string;
  agentType: AgentType;
  isDemoMode: boolean;
  fromCache: boolean;
  ragEnabled?: boolean;
  relevantDocuments?: RelevantDocument[];
  metadata?: {
    tokensUsed: number;
    responseTime: number;
    documentsUsed?: number;
    provider?: string;
    error?: string;
  };
}

interface RelevantDocument {
  id: string;
  fileName: string;
  relevanceScore: number;
  excerpt: string;
  category: string;
}

// Create agent prompt with enhanced context
const createAgentPrompt = (
  agentType: AgentType, 
  scenario: ScenarioData, 
  context: string, 
  companyName = "the company"
) => {
  const profile = agentProfiles[agentType];
  
  return `You are the ${profile.role} of ${companyName}.

PERSONALITY & APPROACH:
${profile.personality}

YOUR EXPERTISE:
- ${profile.expertise.join('\n- ')}

CURRENT BUSINESS SCENARIO:
${scenario.description || 'No specific scenario provided'}

SCENARIO PARAMETERS:
${scenario.parameters ? JSON.stringify(scenario.parameters, null, 2) : 'No parameters provided'}

DISCUSSION CONTEXT:
${context}

INSTRUCTIONS:
1. Provide your perspective as the ${profile.role} focusing on your areas of expertise
2. Be concise but insightful (2-3 paragraphs maximum)
3. Include specific recommendations or concerns from your role's perspective
4. Consider both opportunities and risks
5. Use data-driven reasoning when possible
6. Maintain a professional, executive tone
7. If you disagree with other perspectives, state why respectfully

Respond in a structured format:
**${profile.role} Perspective:**
[Your main analysis]

**Key Concerns/Opportunities:**
- [Point 1]
- [Point 2]
- [Point 3]

**Recommendation:**
[Your specific recommendation]`;
};

// Demo responses for when API is unavailable
const demoResponses = {
  ceo: `As CEO, I see significant strategic value in this initiative. From a leadership perspective, this aligns with our long-term vision and market positioning goals.

**Key Strategic Points:**
- Market opportunity analysis shows strong potential for sustainable growth
- This initiative supports our competitive differentiation strategy
- Resource allocation should prioritize high-impact, scalable solutions

**Risk Assessment:**
- Market timing appears favorable based on current trends
- Competitive landscape requires swift but measured execution
- Stakeholder alignment will be crucial for success

**Recommendation:**
I recommend proceeding with a phased approach, starting with a pilot program to validate assumptions and gather market feedback before full-scale implementation.`,

  cfo: `From a financial perspective, I've conducted a comprehensive analysis of the numbers and risk factors involved in this decision.

**Financial Analysis:**
- ROI projections indicate positive returns within 18-24 months
- Initial investment requirements are within acceptable risk parameters
- Cash flow impact has been modeled across multiple scenarios

**Risk Management:**
- Diversification benefits help mitigate concentration risk
- Contingency planning includes 15% buffer for unexpected costs
- Market volatility considerations have been factored into projections

**Recommendation:**
I support moving forward with enhanced financial controls and monthly progress reviews to ensure we stay on track with our fiscal objectives.`,

  cto: `As CTO, I've evaluated the technical feasibility and scalability requirements for this initiative.

**Technical Assessment:**
- Current infrastructure can support the proposed scaling requirements
- Technology stack alignment with our existing systems is strong
- Security and compliance frameworks are adequate for implementation

**Innovation Opportunities:**
- This initiative opens doors for additional technological advancements
- API-first architecture will enable future integrations
- Automation potential could reduce operational overhead by 30%

**Recommendation:**
I recommend proceeding with a strong emphasis on scalable architecture and thorough testing protocols to ensure reliable deployment.`,

  hr: `From a people and organizational perspective, this initiative presents both opportunities and challenges that need careful consideration.

**Organizational Impact:**
- Change management strategy will be crucial for successful adoption
- Employee skill development programs should be integrated into timeline
- Cultural alignment with our values remains strong throughout this initiative

**Talent Strategy:**
- Current team capabilities align well with project requirements
- Training and development opportunities will enhance employee engagement
- Cross-functional collaboration will strengthen organizational resilience

**Recommendation:**
I support this initiative with a focus on comprehensive change management and employee development programs to ensure sustainable success.`
};

// Enhanced agent response with RAG support, demo fallback, and caching
export async function getAgentResponse(
  agentType: AgentType, 
  scenario: ScenarioData, 
  context: string,
  companyName?: string,
  useDemoData?: boolean,
  includeRAG?: boolean,
  sessionId?: string
): Promise<AgentResponse> {
  try {
    // Check in-memory cache first for non-demo requests
    if (!useDemoData) {
      try {
        const scenarioKey = `${scenario.name}:${scenario.description}`;
        const cached = agentResponseCache.get(agentType, context, scenarioKey);
        
        if (cached) {
          console.log(`In-memory cache hit for agent ${agentType}`);
          return {
            response: cached.content,
            agentType,
            timestamp: cached.timestamp,
            fromCache: true,
            agent: agentProfiles[agentType],
            modelUsed: 'cached',
            isDemoMode: false,
          };
        }
      } catch (cacheError) {
        console.warn('In-memory cache error:', cacheError);
        // Continue with API call
      }
    }

    // Check Redis cache as fallback
    if (!useDemoData) {
      try {
        const cachedResponse = await cacheService.getCachedAgentResponse(agentType, JSON.stringify(scenario), context);
        
        if (cachedResponse) {
          console.log(`Redis cache hit for agent ${agentType}`);
          return {
            ...cachedResponse,
            fromCache: true,
            timestamp: new Date().toISOString()
          } as AgentResponse;
        }
      } catch (cacheError) {
        console.warn('Redis cache error:', cacheError);
        // Continue with API call
      }
    }

    // If demo data is requested or API fails, return demo response
    if (useDemoData) {
      const profile = agentProfiles[agentType];
      return {
        response: demoResponses[agentType],
        agent: profile,
        timestamp: new Date().toISOString(),
        modelUsed: 'demo-mode',
        agentType,
        isDemoMode: true,
        fromCache: false,
        metadata: {
          tokensUsed: demoResponses[agentType].length,
          responseTime: Date.now(),
        }
      };
    }

    const profile = agentProfiles[agentType];
    const modelName = getModelForAgent(agentType);
    
    // Get relevant documents if RAG is enabled
    let ragContext = '';
    let relevantDocuments: RelevantDocument[] = [];
    
    if (includeRAG && sessionId) {
      try {
        const ragData = await retrieveRelevantDocuments(context, agentType);
        ragContext = ragData.context;
        relevantDocuments = ragData.documents;
      } catch (ragError) {
        console.warn('RAG document retrieval failed:', ragError);
        // Continue without RAG context
      }
    }
    
    const prompt = createEnhancedAgentPrompt(agentType, scenario, context, companyName, ragContext);
    
    // Get AI provider from environment
    const provider = process.env.AI_PROVIDER || 'gemini';
    let text: string;
    const startTime = Date.now();
    const timeoutMs = 30000; // 30 second timeout
    
    // Create timeout promise
    const timeoutPromise = new Promise<never>((_, reject) => {
      setTimeout(() => {
        reject(new Error(`AI request timeout after ${timeoutMs}ms`));
      }, timeoutMs);
    });
    
    try {
      const aiPromise = (async () => {
        switch (provider) {
          case 'anthropic': {
            const anthropic = getAnthropicClient();
            const message = await anthropic.messages.create({
              model: modelName,
              max_tokens: 4000,
              messages: [{
                role: 'user',
                content: prompt
              }]
            });
            
            // Extract text from Claude's response
            const content = message.content[0];
            if (content.type === 'text') {
              return content.text;
            } else {
              throw new Error('Unexpected response format from Claude');
            }
          }
          
          case 'gemini':
          default: {
            const genAI = getGeminiClient();
            const model = genAI.getGenerativeModel({ model: modelName });
            
            const result = await model.generateContent(prompt);
            const response = await result.response;
            return response.text();
          }
        }
      })();
      
      // Race between AI call and timeout
      text = await Promise.race([aiPromise, timeoutPromise]);
    } catch (aiError) {
      console.error(`AI provider ${provider} failed:`, aiError);
      throw aiError;
    }

    const responseTime = Date.now() - startTime;
    const agentResponse = {
      response: text,
      agent: profile,
      timestamp: new Date().toISOString(),
      modelUsed: modelName,
      agentType,
      isDemoMode: false,
      fromCache: false,
      ragEnabled: includeRAG,
      relevantDocuments,
      metadata: {
        tokensUsed: text.length, // Approximate token count
        responseTime,
        documentsUsed: relevantDocuments.length,
        provider
      }
    };

    // Cache the response for 30 minutes
    if (!useDemoData) {
      try {
        // Create cache-compatible response
        const cacheData = {
          response: text,
          timestamp: Date.now(), // Use number timestamp for cache
          agentType: agentType,
          metadata: {
            tokensUsed: text.length,
            responseTime,
            documentsUsed: relevantDocuments.length,
            provider
          }
        };
        
        // Cache in Redis
        await cacheService.cacheAgentResponse(agentType, JSON.stringify(scenario), context, cacheData, 1800);
        
        // Also cache in-memory for faster access
        const scenarioKey = `${scenario.name}:${scenario.description}`;
        agentResponseCache.set(agentType, context, scenarioKey, {
          content: text,
          reasoning: 'AI-generated response based on current scenario context'
        });
      } catch (cacheError) {
        console.warn('Failed to cache agent response:', cacheError);
        // Don't fail the request if caching fails
      }
    }

    return agentResponse;
  } catch (error) {
    console.error(`Error getting agent response for ${agentType}:`, error);
    
    // Fallback to demo response on API error
    const profile = agentProfiles[agentType];
    console.log(`Falling back to demo response for ${agentType} due to API error`);
    
    return {
      response: demoResponses[agentType],
      agent: profile,
      timestamp: new Date().toISOString(),
      modelUsed: 'demo-fallback',
      agentType,
      isDemoMode: true,
      fromCache: false,
      metadata: {
        tokensUsed: demoResponses[agentType].length,
        responseTime: Date.now(),
        error: error instanceof Error ? error.message : 'Unknown error'
      }
    };
  }
}

// Create enhanced agent prompt with RAG context
const createEnhancedAgentPrompt = (
  agentType: AgentType, 
  scenario: ScenarioData, 
  context: string, 
  companyName = "the company",
  ragContext = ""
) => {
  const basePrompt = createAgentPrompt(agentType, scenario, context, companyName);
  
  if (ragContext) {
    return `${basePrompt}

RELEVANT DOCUMENTS & DATA:
${ragContext}

ADDITIONAL INSTRUCTIONS:
- Reference specific data points from the provided documents when relevant
- Cite sources when making data-driven claims
- Integrate document insights with your professional expertise
- If documents contradict your assumptions, acknowledge and address this`;
  }
  
  return basePrompt;
};

// RAG document retrieval function
async function retrieveRelevantDocuments(query: string, agentType: AgentType) {
  try {
    // Generate query embeddings (placeholder implementation)
    await generateEmbeddings(query);
    
    // Retrieve relevant documents from vector database
    // This is a simplified implementation - in production you'd use a vector database
    const mockRelevantDocuments: RelevantDocument[] = [
      {
        id: 'doc_1',
        fileName: 'Q4_Financial_Report.pdf',
        relevanceScore: 0.85,
        excerpt: 'Financial performance shows 15% revenue growth with strong margin expansion...',
        category: agentType === 'cfo' ? 'financial' : 'general'
      },
      {
        id: 'doc_2', 
        fileName: 'Strategic_Plan_2025.docx',
        relevanceScore: 0.78,
        excerpt: 'Strategic initiatives focus on market expansion and digital transformation...',
        category: agentType === 'ceo' ? 'strategic' : 'general'
      }
    ];
    
    // Filter documents by agent type and relevance
    const relevantDocs = mockRelevantDocuments
      .filter(doc => doc.relevanceScore > 0.7)
      .filter(doc => doc.category === agentType || doc.category === 'general')
      .slice(0, 3); // Top 3 most relevant
    
    const ragContext = relevantDocs
      .map(doc => `[${doc.fileName}]: ${doc.excerpt}`)
      .join('\n\n');
    
    return {
      context: ragContext,
      documents: relevantDocs
    };
    
  } catch (error) {
    console.error('Error retrieving RAG documents:', error);
    return {
      context: '',
      documents: []
    };
  }
}

// Embedding generation function (moved from documents route for reuse)
// eslint-disable-next-line @typescript-eslint/no-unused-vars
async function generateEmbeddings(_text: string): Promise<number[]> {
  // For now, return a placeholder
  // In a real implementation, you would use:
  // - OpenAI embeddings API
  // - Google Vertex AI embeddings
  // - Local embedding models
  
  return new Array(1536).fill(0).map(() => Math.random());
}

// Decision synthesis function
export async function synthesizeDecision(agentResponses: AgentResponse[], scenario: ScenarioData) {
  try {
    const responseTexts = agentResponses.map(r => 
      `**${r.agent.role}**: ${r.response}`
    ).join('\n\n');

    const synthesisPrompt = `You are a senior strategy consultant analyzing executive perspectives on a business decision.

SCENARIO: ${scenario.description}

EXECUTIVE PERSPECTIVES:
${responseTexts}

TASK: Synthesize these perspectives into a comprehensive decision recommendation.

Provide your synthesis in this exact format:

**EXECUTIVE SUMMARY:**
[2-3 sentence summary of the decision]

**CONSENSUS AREAS:**
- [Areas where executives agree]

**KEY DISAGREEMENTS:**
- [Areas of divergent opinions]

**RECOMMENDED ACTION:**
[Specific, actionable recommendation]

**IMPLEMENTATION STEPS:**
1. [Step 1 with timeline]
2. [Step 2 with timeline]
3. [Step 3 with timeline]

**RISK MITIGATION:**
- [Key risks and how to address them]

**SUCCESS METRICS:**
- [How to measure success]

**CONFIDENCE LEVEL:** [High/Medium/Low] - [Brief justification]`;

    const genAI = getGeminiClient();
    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-pro' });
    
    const result = await model.generateContent(synthesisPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      synthesis: text,
      timestamp: new Date().toISOString(),
      agentCount: agentResponses.length,
      confidence: extractConfidenceLevel(text)
    };
  } catch (error) {
    console.error('Error synthesizing decision:', error);
    throw new Error('Failed to synthesize decision');
  }
}

// Helper function to extract confidence level
function extractConfidenceLevel(text: string): 'High' | 'Medium' | 'Low' {
  const confidenceMatch = text.match(/\*\*CONFIDENCE LEVEL:\*\*\s*(High|Medium|Low)/i);
  return (confidenceMatch?.[1] as 'High' | 'Medium' | 'Low') || 'Medium';
}
