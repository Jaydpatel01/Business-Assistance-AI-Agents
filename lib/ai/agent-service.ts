import { GoogleGenerativeAI, HarmCategory, HarmBlockThreshold } from '@google/generative-ai';
import Anthropic from '@anthropic-ai/sdk';
import { getApiKey, getModelForAgent } from '../config/env';
import { cacheService } from '../cache/redis';
import { agentResponseCache } from '../cache/agent-response-cache';
import marketService, { type MarketIntelligence } from '../market/market-service';
import { memoryService } from './memory-service';
import { explainableAIService } from './explainable-ai-service';

// Initialize AI clients with error handling
const getGeminiClient = (agentType?: AgentType) => {
  try {
    let apiKey: string | undefined;

    // Use agent-specific API key if available
    if (agentType) {
      const agentKeyMap = {
        'ceo': process.env.GEMINI_API_KEY_CEO,
        'cfo': process.env.GEMINI_API_KEY_CFO,
        'cto': process.env.GEMINI_API_KEY_CTO,
        'hr': process.env.GEMINI_API_KEY_HR
      };
      apiKey = agentKeyMap[agentType];
    }

    // Fallback to general API key
    if (!apiKey) {
      apiKey = getApiKey();
    }

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
export interface ScenarioData {
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
  sessionId?: string,
  userId?: string,
  organizationId?: string,
  prefetchedDocuments?: RelevantDocument[], // NEW: Pre-fetched RAG documents
  prefetchedMarketData?: MarketIntelligence | null // NEW: Pre-fetched market data
): Promise<AgentResponse> {
  try {
    // If demo data is explicitly requested, return demo response immediately
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

    // For real users (non-demo), never use cache fallback to demo data
    // Check in-memory cache first for non-demo requests
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
      // Continue with API call for real users
    }

    // Check Redis cache for real users
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
      // Continue with API call for real users
    }

    const profile = agentProfiles[agentType];
    const modelName = getModelForAgent(agentType);

    // Get relevant documents if RAG is enabled
    let ragContext = '';
    let relevantDocuments: RelevantDocument[] = [];

    // Use prefetched documents if available, otherwise fetch
    if (prefetchedDocuments && prefetchedDocuments.length > 0) {
      console.log(`✅ Using prefetched RAG documents for ${agentType} (${prefetchedDocuments.length} docs)`);
      relevantDocuments = prefetchedDocuments;
      // Format documents into context string
      ragContext = relevantDocuments
        .map((doc, idx) => `[Document ${idx + 1}] ${doc.fileName}:\n${doc.excerpt}`)
        .join('\n\n');
    } else if (includeRAG && sessionId && !prefetchedDocuments) {
      try {
        console.log(`⚠️  No prefetched docs, fetching RAG for ${agentType}`);
        const ragData = await retrieveRelevantDocuments(context, agentType, userId, organizationId);
        ragContext = ragData.context;
        relevantDocuments = ragData.documents;
      } catch (ragError) {
        console.warn('RAG document retrieval failed:', ragError);
        // Continue without RAG context
      }
    }

    // Get market intelligence data
    let marketData: MarketIntelligence | null = null;
    // Use prefetched market data if available, otherwise fetch
    if (prefetchedMarketData !== undefined) {
      console.log(`✅ Using prefetched market data for ${agentType}`);
      marketData = prefetchedMarketData;
    } else if (includeRAG && !prefetchedMarketData) { // Use same flag for market intelligence
      try {
        console.log(`⚠️  No prefetched market data, fetching for ${agentType}`);
        marketData = await retrieveMarketIntelligence(agentType);
      } catch (marketError) {
        console.warn('Market intelligence retrieval failed:', marketError);
        // Continue without market data
      }
    }

    // Get memory-based contextual advice (Phase 5 integration)
    let memoryAdvice = '';
    try {
      memoryAdvice = await memoryService.generateContextualAdvice(agentType, `${scenario.name}: ${context}`);
    } catch (memoryError) {
      console.warn('Memory advice retrieval failed:', memoryError);
      // Continue without memory advice
    }

    const prompt = createEnhancedAgentPrompt(agentType, scenario, context, companyName, ragContext, relevantDocuments, marketData, memoryAdvice);

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
            const genAI = getGeminiClient(agentType);
            const model = genAI.getGenerativeModel({
              model: modelName,
              generationConfig: {
                temperature: 0.7,
                topK: 40,
                topP: 0.95,
                maxOutputTokens: 4096,
              },
              safetySettings: [
                {
                  category: HarmCategory.HARM_CATEGORY_HARASSMENT,
                  threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_HATE_SPEECH,
                  threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT,
                  threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
                {
                  category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
                  threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH,
                },
              ],
            });

            const result = await model.generateContent(prompt);
            const response = await result.response;

            // Check if response was blocked
            if (response.promptFeedback?.blockReason) {
              throw new Error(`Content blocked: ${response.promptFeedback.blockReason}`);
            }

            return response.text();
          }
        }
      })();

      // Race between AI call and timeout
      text = await Promise.race([aiPromise, timeoutPromise]);
    } catch (aiError: unknown) {
      console.error(`AI provider ${provider} failed:`, aiError);

      // Log specific error details for Gemini API issues
      if (provider === 'gemini' || provider === 'default') {
        const error = aiError as Error;
        console.error('Gemini API Error Details:', {
          message: error.message,
          name: error.name,
          stack: error.stack?.split('\n').slice(0, 3).join('\n') // First 3 lines of stack
        });

        // Check for common Gemini API errors
        if (error.message?.includes('API_KEY_INVALID')) {
          throw new Error('Invalid Gemini API key. Please check your GEMINI_API_KEY environment variable.');
        }
        if (error.message?.includes('QUOTA_EXCEEDED')) {
          throw new Error('Gemini API quota exceeded. Please check your usage limits in Google AI Studio.');
        }
        if (error.message?.includes('PERMISSION_DENIED')) {
          throw new Error('Permission denied for Gemini API. Please check your API key permissions.');
        }
        if (error.message?.includes('BLOCKED')) {
          throw new Error('Content was blocked by Gemini safety filters. Try rephrasing your request.');
        }
      }

      throw aiError;
    }

    const responseTime = Date.now() - startTime;

    // Track decision in explainable AI system (Phase 6 integration)
    let auditId: string | null = null;
    try {
      // Start decision tracking
      auditId = explainableAIService.startDecisionTracking(
        sessionId || 'anonymous',
        agentType,
        `${scenario.name}: ${scenario.description}`,
        {
          sessionType: 'agent_response',
          documents: relevantDocuments.map(doc => doc.fileName),
          marketData: marketData ? ['live_market_data'] : [],
          memory: memoryAdvice ? ['memory_context'] : [],
          collaboration: []
        }
      );

      // Add reasoning steps based on available context
      if (ragContext) {
        explainableAIService.addReasoningStep(
          auditId,
          'evidence',
          `Analyzed ${relevantDocuments.length} relevant company documents for context`,
          relevantDocuments.map(doc => ({
            id: `doc_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'document' as const,
            source: doc.fileName,
            content: doc.excerpt.substring(0, 200) + '...',
            relevance: doc.relevanceScore,
            reliability: 0.9,
            citation: `[${doc.fileName}]`,
            metadata: { documentType: 'company_document', category: doc.category }
          })),
          0.9,
          Math.floor(responseTime * 0.2)
        );
      }

      if (marketData) {
        explainableAIService.addReasoningStep(
          auditId,
          'analysis',
          'Incorporated current market intelligence and economic indicators',
          [{
            id: `market_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'market_data' as const,
            source: 'Live Market Data',
            content: `Market conditions with ${marketData.stocks.length} stocks and ${marketData.news.length} news items`,
            relevance: 0.8,
            reliability: 0.85,
            citation: '[Market Intelligence]',
            metadata: { dataSource: 'yahoo_finance_news_api' }
          }],
          0.8,
          Math.floor(responseTime * 0.15)
        );
      }

      if (memoryAdvice) {
        explainableAIService.addReasoningStep(
          auditId,
          'synthesis',
          'Applied learned insights from previous similar decisions',
          [{
            id: `memory_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
            type: 'memory' as const,
            source: 'Agent Memory',
            content: memoryAdvice.substring(0, 200) + '...',
            relevance: 0.75,
            reliability: 0.7,
            citation: '[Past Experience]',
            metadata: { memoryType: 'contextual_advice' }
          }],
          0.75,
          Math.floor(responseTime * 0.1)
        );
      }

      // Add final conclusion step
      explainableAIService.addReasoningStep(
        auditId,
        'conclusion',
        `Generated response using ${provider} AI model with comprehensive context analysis`,
        [{
          id: `ai_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          type: 'external' as const,
          source: `${provider} AI`,
          content: `AI-generated response with ${text.length} characters`,
          relevance: 1.0,
          reliability: 0.8,
          citation: `[${modelName}]`,
          metadata: {
            aiProvider: provider,
            modelName,
            responseLength: text.length
          }
        }],
        0.8,
        Math.floor(responseTime * 0.55)
      );

      // Complete decision tracking
      explainableAIService.completeDecisionTracking(
        auditId,
        text,
        0.8 // Overall confidence based on available context
      );
    } catch (explainabilityError) {
      console.warn('Failed to track decision in explainable AI system:', explainabilityError);
      // Don't fail the request if explainability tracking fails
    }

    // Store memory for learning (Phase 5 integration)
    try {
      await memoryService.storeMemory({
        agentType,
        sessionId: sessionId || 'anonymous',
        memoryType: 'decision',
        context: `${scenario.name}: ${scenario.description}`,
        content: text,
        metadata: {
          confidence: 0.8, // Default confidence for AI responses
          relevanceScore: 1.0,
          tags: [agentType, 'ai_response', scenario.name.toLowerCase().replace(/\s+/g, '_')],
          businessMetrics: {
            response_time: responseTime,
            tokens_used: text.length,
            documents_referenced: relevantDocuments.length,
            audit_id: auditId ? 1 : 0 // Store as numeric flag for audit trail existence
          }
        }
      });
    } catch (memoryError) {
      console.warn('Failed to store memory:', memoryError);
      // Don't fail the request if memory storage fails
    }

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

    if (useDemoData) {
      // For demo users, fallback to demo response on API error
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
    } else {
      // For real users, don't fallback to demo data - throw the error
      throw new Error(`Agent ${agentType} service is currently unavailable. Please try again later.`);
    }
  }
}

// Create enhanced agent prompt with RAG context and source citations
const createEnhancedAgentPrompt = (
  agentType: AgentType,
  scenario: ScenarioData,
  context: string,
  companyName = "the company",
  ragContext = "",
  documents: RelevantDocument[] = [],
  marketData: MarketIntelligence | null = null,
  memoryAdvice = ""
) => {
  const basePrompt = createAgentPrompt(agentType, scenario, context, companyName);

  let enhancedPrompt = basePrompt;

  // Add memory-based advice (Phase 5 integration)
  if (memoryAdvice && memoryAdvice.trim() !== "No relevant past experience found for this context.") {
    enhancedPrompt += `\n\nYOUR PAST EXPERIENCE AND LEARNED INSIGHTS:\n${memoryAdvice}\n\nPlease consider these insights when formulating your response, but don't mention that you're using "memory" or "past experience" - simply incorporate the wisdom naturally.`;
  }

  // Add market intelligence context
  if (marketData) {
    const marketContext = formatMarketIntelligence(marketData, agentType);
    enhancedPrompt += `\n\nCURRENT MARKET INTELLIGENCE:\n${marketContext}`;
  }

  if (ragContext && documents.length > 0) {
    // Create source map for citations
    const sourceMap = documents.map((doc, index) => `[${index + 1}] ${doc.fileName}`).join('\n');

    enhancedPrompt += `\n\nRELEVANT COMPANY DOCUMENTS:\n${ragContext}\n\nDOCUMENT SOURCES:\n${sourceMap}`;
  }

  // Add enhanced instructions based on available data
  const hasMarketData = marketData !== null;
  const hasDocuments = documents.length > 0;

  if (hasMarketData || hasDocuments) {
    enhancedPrompt += `\n\nENHANCED INSTRUCTIONS:`;

    if (hasDocuments) {
      enhancedPrompt += `
- Base your analysis on the provided company documents above
- Reference specific data points and findings from the documents
- Use source citations like [1], [2], etc. when referencing specific documents`;
    }

    if (hasMarketData) {
      enhancedPrompt += `
- Incorporate current market conditions and trends into your analysis
- Reference specific market indicators, stock performance, and sector data
- Consider how market sentiment and economic conditions impact your recommendations`;
    }

    enhancedPrompt += `
- Provide ${hasDocuments ? 'document-backed' : 'market-informed'} insights that align with your ${agentProfiles[agentType].role} expertise
- Combine ${hasDocuments ? 'document insights' : ''} ${hasMarketData ? 'market intelligence' : ''} with your professional knowledge for comprehensive recommendations
- Prioritize ${hasDocuments ? 'document evidence and ' : ''}real market data over general assumptions
- If ${hasDocuments ? 'documents or ' : ''}market data ${hasDocuments ? 'don\'t contain' : 'doesn\'t provide'} relevant information for your analysis, clearly state this

RESPONSE FORMAT:
1. ${hasDocuments ? 'Document-Based Analysis: [Your analysis using cited sources]' : 'Market-Based Analysis: [Your analysis using current market data]'}
2. Professional Insights: [Your expert perspective integrating ${hasDocuments ? 'document' : ''} ${hasMarketData ? 'and market' : ''} findings]
3. Recommendations: [Actionable recommendations with ${hasDocuments ? 'source' : 'market data'} backing]

REQUIRED METADATA (Include at the end of your response in this exact format):
---METADATA---
CONFIDENCE: [High/Medium/Low]
KEY_FACTORS:
- [Factor 1]
- [Factor 2]
- [Factor 3]
RISKS:
- [Risk 1]
- [Risk 2]
ASSUMPTIONS:
- [Assumption 1]
- [Assumption 2]
DATA_SOURCES: ${hasDocuments ? 'Company Documents' : ''}${hasDocuments && hasMarketData ? ', ' : ''}${hasMarketData ? 'Market Intelligence, Industry Trends' : ''}
---END_METADATA---`;
  }

  return enhancedPrompt;
}

// RAG document retrieval function - Updated to use real RAG system
async function retrieveRelevantDocuments(query: string, agentType: AgentType, userId?: string, organizationId?: string) {
  try {
    // Import RAG search function
    const { getRAGContext } = await import('../rag');

    // Configure search parameters based on agent type
    const searchOptions = {
      maxChunks: agentType === 'ceo' ? 7 : 5, // CEO gets more context for strategic decisions
      minScore: agentType === 'cfo' ? 0.8 : 0.7, // CFO needs higher precision for financial data
      maxContextLength: agentType === 'ceo' ? 4000 : 3000, // CEO gets longer context
      userId,
      organizationId,
    };

    console.log(`Retrieving relevant documents for ${agentType} with query: "${query.substring(0, 100)}..."`);

    // Get context from RAG system
    const ragResult = await getRAGContext(query, searchOptions);

    // Convert RAG results to our format
    const relevantDocuments: RelevantDocument[] = ragResult.sources.map((source, index) => ({
      id: `rag_${index}`,
      fileName: source.documentName,
      relevanceScore: source.score,
      excerpt: ragResult.context.split('\n\n')[index] || 'Document excerpt not available',
      category: determineDocumentCategory(source.documentName, agentType),
    }));

    console.log(`Found ${relevantDocuments.length} relevant documents for ${agentType} agent`);

    return {
      context: ragResult.context,
      documents: relevantDocuments
    };

  } catch (error) {
    console.error('Error retrieving RAG documents:', error);

    // For real users, don't fallback to mock data - throw the error
    throw new Error('Document retrieval system is currently unavailable. Please try again later.');
  }
}

// Market intelligence retrieval function
async function retrieveMarketIntelligence(agentType: AgentType): Promise<MarketIntelligence | null> {
  try {
    console.log(`Retrieving market intelligence for ${agentType} agent`);

    // Get relevant watchlist based on agent type
    const watchlist = getAgentWatchlist(agentType);

    // Retrieve comprehensive market data
    const marketData = await marketService.getMarketIntelligence(watchlist);

    console.log(`Retrieved market data with ${marketData.stocks.length} stocks, ${marketData.news.length} news items`);

    return marketData;
  } catch (error) {
    console.error('Error retrieving market intelligence:', error);
    return null;
  }
}

// Format market intelligence for agent prompts
function formatMarketIntelligence(marketData: MarketIntelligence, agentType: AgentType): string {
  const { stocks, indices, news, sectorPerformance } = marketData;

  let formatted = `Market Data (${new Date(marketData.timestamp).toLocaleString()}):\n\n`;

  // Major indices
  formatted += `MAJOR INDICES:\n`;
  formatted += `• S&P 500: $${indices.sp500.price.toFixed(2)} (${indices.sp500.changePercent > 0 ? '+' : ''}${indices.sp500.changePercent.toFixed(2)}%)\n`;
  formatted += `• NASDAQ: $${indices.nasdaq.price.toFixed(2)} (${indices.nasdaq.changePercent > 0 ? '+' : ''}${indices.nasdaq.changePercent.toFixed(2)}%)\n`;
  formatted += `• Dow Jones: $${indices.dow.price.toFixed(2)} (${indices.dow.changePercent > 0 ? '+' : ''}${indices.dow.changePercent.toFixed(2)}%)\n`;
  formatted += `• VIX (Volatility): ${indices.vix.price.toFixed(2)} (${indices.vix.changePercent > 0 ? '+' : ''}${indices.vix.changePercent.toFixed(2)}%)\n\n`;

  // Key stocks relevant to agent
  if (stocks.length > 0) {
    formatted += `KEY STOCKS (Agent Watchlist):\n`;
    stocks.forEach(stock => {
      formatted += `• ${stock.symbol}: $${stock.price.toFixed(2)} (${stock.changePercent > 0 ? '+' : ''}${stock.changePercent.toFixed(2)}%)`;
      if (stock.pe) formatted += ` [P/E: ${stock.pe.toFixed(1)}]`;
      formatted += `\n`;
    });
    formatted += `\n`;
  }

  // Sector performance (especially relevant for strategic decisions)
  if (Object.keys(sectorPerformance).length > 0) {
    formatted += `SECTOR PERFORMANCE:\n`;
    Object.entries(sectorPerformance)
      .sort(([, a], [, b]) => b - a) // Sort by performance
      .forEach(([sector, perf]) => {
        formatted += `• ${sector}: ${perf > 0 ? '+' : ''}${perf.toFixed(2)}%\n`;
      });
    formatted += `\n`;
  }

  // Recent financial news (top 3-5 most relevant)
  if (news.length > 0) {
    const relevantNews = news.slice(0, agentType === 'ceo' ? 5 : 3);
    formatted += `RECENT FINANCIAL NEWS:\n`;
    relevantNews.forEach((item, index) => {
      formatted += `${index + 1}. [${item.sentiment?.toUpperCase()}] ${item.title}\n`;
      if (item.description) {
        formatted += `   ${item.description.substring(0, 150)}${item.description.length > 150 ? '...' : ''}\n`;
      }
      formatted += `   Source: ${item.source} | ${new Date(item.publishedAt).toLocaleDateString()}\n\n`;
    });
  }

  return formatted;
}

// Get relevant stock watchlist based on agent type
function getAgentWatchlist(agentType: AgentType): string[] {
  const baseTech = ['AAPL', 'GOOGL', 'MSFT', 'NVDA'];
  const baseFinancial = ['JPM', 'BAC', 'WFC', 'GS'];
  const baseConsumer = ['AMZN', 'TSLA', 'HD', 'WMT'];

  switch (agentType) {
    case 'ceo':
      // Broad market view for strategic decisions
      return [...baseTech, ...baseFinancial.slice(0, 2), ...baseConsumer.slice(0, 2), 'NFLX', 'DIS'];

    case 'cfo':
      // Financial sector focus + major tech
      return [...baseFinancial, ...baseTech.slice(0, 3), 'BRK-B', 'V'];

    case 'cto':
      // Technology focus
      return [...baseTech, 'META', 'NFLX', 'ADBE', 'CRM', 'ORCL'];

    case 'hr':
      // Human capital and major employers
      return [...baseTech.slice(0, 3), ...baseConsumer.slice(0, 2), 'UNH', 'PFE'];

    default:
      return baseTech;
  }
}

// Helper function to determine document category based on filename and agent type
function determineDocumentCategory(fileName: string, agentType: AgentType): string {
  const lowerFileName = fileName.toLowerCase();

  // Financial documents
  if (lowerFileName.includes('financial') || lowerFileName.includes('budget') ||
    lowerFileName.includes('revenue') || lowerFileName.includes('profit')) {
    return agentType === 'cfo' ? 'primary' : 'secondary';
  }

  // Strategic documents
  if (lowerFileName.includes('strategy') || lowerFileName.includes('plan') ||
    lowerFileName.includes('vision') || lowerFileName.includes('roadmap')) {
    return agentType === 'ceo' ? 'primary' : 'secondary';
  }

  // Technical documents
  if (lowerFileName.includes('tech') || lowerFileName.includes('architecture') ||
    lowerFileName.includes('development') || lowerFileName.includes('infrastructure')) {
    return agentType === 'cto' ? 'primary' : 'secondary';
  }

  // HR documents
  if (lowerFileName.includes('hr') || lowerFileName.includes('employee') ||
    lowerFileName.includes('talent') || lowerFileName.includes('culture')) {
    return agentType === 'hr' ? 'primary' : 'secondary';
  }

  return 'general';
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
// Decision synthesis function with enhanced RAG context integration
export async function synthesizeDecision(agentResponses: AgentResponse[], scenario: ScenarioData) {
  try {
    // Collect unique documents referenced across all agent responses
    const allDocuments = new Map<string, { fileName: string; count: number; agents: string[] }>();

    agentResponses.forEach(response => {
      if (response.relevantDocuments) {
        response.relevantDocuments.forEach(doc => {
          const key = doc.fileName;
          if (allDocuments.has(key)) {
            const existing = allDocuments.get(key)!;
            existing.count++;
            existing.agents.push(response.agentType);
          } else {
            allDocuments.set(key, {
              fileName: doc.fileName,
              count: 1,
              agents: [response.agentType]
            });
          }
        });
      }
    });

    // Create document summary for synthesis context
    const documentSummary = Array.from(allDocuments.entries())
      .sort(([, a], [, b]) => b.count - a.count) // Sort by most referenced
      .map(([, doc]) => `• ${doc.fileName} (referenced by: ${doc.agents.join(', ')})`)
      .join('\n');

    const responseTexts = agentResponses.map(r =>
      `**${r.agent.role}**: ${r.response}${r.relevantDocuments && r.relevantDocuments.length > 0 ?
        `\n[Documents referenced: ${r.relevantDocuments.map(d => d.fileName).join(', ')}]` : ''}`
    ).join('\n\n');

    const synthesisPrompt = `You are a senior strategy consultant analyzing executive perspectives on a business decision.

SCENARIO: ${scenario.description}

COMPANY DOCUMENTS CONSULTED:
${documentSummary || 'No documents were referenced in this analysis.'}

EXECUTIVE PERSPECTIVES:
${responseTexts}

TASK: Synthesize these perspectives into a comprehensive decision recommendation that integrates both the document insights and executive expertise.

Provide your synthesis in this exact format:

**EXECUTIVE SUMMARY:**
[2-3 sentence summary of the decision incorporating document findings]

**DOCUMENT-BACKED INSIGHTS:**
[Key findings from company documents that inform this decision]

**CONSENSUS AREAS:**
- [Areas where executives agree, supported by documentation where available]

**KEY DISAGREEMENTS:**
- [Areas of divergent opinions and how documents support or contradict positions]

**RECOMMENDED ACTION:**
[Specific, actionable recommendation with document and expert backing]

**IMPLEMENTATION STEPS:**
1. [Step 1 with timeline and document support]
2. [Step 2 with timeline and document support]  
3. [Step 3 with timeline and document support]

**RISK MITIGATION:**
- [Key risks identified through both document analysis and executive expertise]

**SUCCESS METRICS:**
- [How to measure success based on document benchmarks and expert criteria]

**CONFIDENCE LEVEL:** [High/Medium/Low] - [Brief justification based on document support and executive consensus]`;

    const genAI = getGeminiClient();
    // Use the configured model from environment variables
    const modelName = process.env.AI_MODEL || 'gemini-2.0-flash-lite';
    const model = genAI.getGenerativeModel({ model: modelName });

    const result = await model.generateContent(synthesisPrompt);
    const response = await result.response;
    const text = response.text();

    return {
      synthesis: text,
      timestamp: new Date().toISOString(),
      agentCount: agentResponses.length,
      confidence: extractConfidenceLevel(text),
      documentsReferenced: Array.from(allDocuments.keys()),
      documentCount: allDocuments.size
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

// Streaming agent response for Gemini
export async function* streamAgentResponse(
  agentType: AgentType,
  scenario: ScenarioData,
  context: string,
  companyName?: string,
  useDemoData?: boolean,
  includeRAG?: boolean,
  sessionId?: string,
  userId?: string,
  organizationId?: string
): AsyncGenerator<string, void, void> {
  // For demo mode, just yield the demo response in one chunk
  if (useDemoData) {
    yield demoResponses[agentType];
    return;
  }

  // Build the enhanced prompt (reuse logic from getAgentResponse)
  let ragContext = '';
  let relevantDocuments: RelevantDocument[] = [];
  if (includeRAG && sessionId) {
    try {
      const ragData = await retrieveRelevantDocuments(context, agentType, userId, organizationId);
      ragContext = ragData.context;
      relevantDocuments = ragData.documents;
    } catch {
      // Continue without RAG context
    }
  }
  let marketData: MarketIntelligence | null = null;
  if (includeRAG) {
    try {
      marketData = await retrieveMarketIntelligence(agentType);
    } catch { }
  }
  let memoryAdvice = '';
  try {
    memoryAdvice = await memoryService.generateContextualAdvice(agentType, `${scenario.name}: ${context}`);
  } catch { }
  const prompt = createEnhancedAgentPrompt(agentType, scenario, context, companyName, ragContext, relevantDocuments, marketData, memoryAdvice);

  // Only Gemini streaming is implemented for now
  const provider = process.env.AI_PROVIDER || 'gemini';
  if (provider !== 'gemini') {
    // Fallback: yield the full response from getAgentResponse
    const full = await getAgentResponse(agentType, scenario, context, companyName, useDemoData, includeRAG, sessionId, userId, organizationId);
    yield full.response;
    return;
  }

  // Gemini streaming
  const genAI = getGeminiClient(agentType);
  const model = genAI.getGenerativeModel({
    model: getModelForAgent(agentType),
    generationConfig: {
      temperature: 0.7,
      topK: 40,
      topP: 0.95,
      maxOutputTokens: 4096,
    },
    safetySettings: [
      { category: HarmCategory.HARM_CATEGORY_HARASSMENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_HATE_SPEECH, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_SEXUALLY_EXPLICIT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
      { category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT, threshold: HarmBlockThreshold.BLOCK_ONLY_HIGH },
    ],
  });
  const streamResult = await model.generateContentStream(prompt);
  for await (const chunk of streamResult.stream) {
    // Each chunk may contain multiple candidates/parts
    for (const candidate of chunk.candidates || []) {
      for (const part of candidate.content?.parts || []) {
        if (typeof part.text === 'string') {
          yield part.text;
        }
      }
    }
  }
}
