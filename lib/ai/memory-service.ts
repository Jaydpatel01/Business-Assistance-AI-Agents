/**
 * Phase 5: Memory & Learning Service
 * 
 * This service provides persistent memory and learning capabilities for AI agents,
 * enabling them to learn from past decisions and adapt their behavior over time.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';

export interface AgentMemory {
  id: string;
  agentType: string;
  sessionId: string;
  timestamp: Date;
  memoryType: 'decision' | 'outcome' | 'pattern' | 'preference' | 'error';
  context: string;
  content: string;
  metadata: {
    confidence: number;
    relevanceScore: number;
    tags: string[];
    relatedMemories?: string[];
    outcome?: 'success' | 'failure' | 'partial';
    businessMetrics?: Record<string, number>;
  };
}

export interface LearningPattern {
  id: string;
  patternType: 'success_factor' | 'failure_mode' | 'preference' | 'correlation';
  description: string;
  confidence: number;
  occurrences: number;
  lastSeen: Date;
  examples: string[];
  businessImpact: 'high' | 'medium' | 'low';
}

export interface AgentPersonality {
  agentType: string;
  traits: {
    riskTolerance: number; // 0-1
    decisionSpeed: number; // 0-1
    collaborationStyle: 'directive' | 'collaborative' | 'consultative';
    focusAreas: string[];
    biases: string[];
  };
  preferences: {
    dataTypes: string[];
    analysisDepth: 'quick' | 'thorough' | 'comprehensive';
    communicationStyle: 'formal' | 'casual' | 'technical';
  };
  learningRate: number; // How quickly the agent adapts
  lastUpdated: Date;
}

export class AgentMemoryService extends EventEmitter {
  private memories: Map<string, AgentMemory[]> = new Map(); // agentType -> memories
  private patterns: Map<string, LearningPattern[]> = new Map(); // agentType -> patterns
  private personalities: Map<string, AgentPersonality> = new Map(); // agentType -> personality
  private memoryIndex: Map<string, string[]> = new Map(); // content hash -> memory IDs

  constructor() {
    super();
    this.initializeDefaultPersonalities();
  }

  /**
   * Store a new memory for an agent
   */
  async storeMemory(memory: Omit<AgentMemory, 'id' | 'timestamp'>): Promise<string> {
    const memoryId = uuidv4();
    const fullMemory: AgentMemory = {
      ...memory,
      id: memoryId,
      timestamp: new Date()
    };

    // Store memory
    if (!this.memories.has(memory.agentType)) {
      this.memories.set(memory.agentType, []);
    }
    this.memories.get(memory.agentType)!.push(fullMemory);

    // Index for retrieval
    const contentHash = this.hashContent(memory.content);
    if (!this.memoryIndex.has(contentHash)) {
      this.memoryIndex.set(contentHash, []);
    }
    this.memoryIndex.get(contentHash)!.push(memoryId);

    // Trigger pattern analysis
    await this.analyzeForPatterns(memory.agentType);

    this.emit('memory_stored', fullMemory);
    return memoryId;
  }

  /**
   * Retrieve relevant memories for a context
   */
  async retrieveRelevantMemories(
    agentType: string, 
    context: string, 
    limit: number = 10
  ): Promise<AgentMemory[]> {
    const agentMemories = this.memories.get(agentType) || [];
    
    // Calculate relevance scores
    const scoredMemories = agentMemories.map(memory => ({
      memory,
      score: this.calculateRelevanceScore(memory, context)
    }));

    // Sort by relevance and recency
    scoredMemories.sort((a, b) => {
      const scoreDiff = b.score - a.score;
      if (Math.abs(scoreDiff) < 0.1) {
        return b.memory.timestamp.getTime() - a.memory.timestamp.getTime();
      }
      return scoreDiff;
    });

    return scoredMemories.slice(0, limit).map(item => item.memory);
  }

  /**
   * Learn from a decision outcome
   */
  async learnFromOutcome(
    agentType: string,
    decisionContext: string,
    decision: string,
    outcome: 'success' | 'failure' | 'partial',
    businessMetrics?: Record<string, number>
  ): Promise<void> {
    // Store outcome memory
    await this.storeMemory({
      agentType,
      sessionId: 'learning',
      memoryType: 'outcome',
      context: decisionContext,
      content: `Decision: ${decision}`,
      metadata: {
        confidence: 0.9,
        relevanceScore: 1.0,
        tags: ['outcome', outcome],
        outcome,
        businessMetrics
      }
    });

    // Update agent personality based on outcome
    await this.updatePersonalityFromOutcome(agentType, outcome, businessMetrics);

    this.emit('learning_completed', { agentType, outcome, decision });
  }

  /**
   * Get agent's current personality
   */
  getAgentPersonality(agentType: string): AgentPersonality | undefined {
    return this.personalities.get(agentType);
  }

  /**
   * Get learned patterns for an agent
   */
  getLearnedPatterns(agentType: string): LearningPattern[] {
    return this.patterns.get(agentType) || [];
  }

  /**
   * Generate contextual advice based on past experiences
   */
  async generateContextualAdvice(
    agentType: string,
    currentContext: string
  ): Promise<string> {
    const relevantMemories = await this.retrieveRelevantMemories(agentType, currentContext, 5);
    const patterns = this.getLearnedPatterns(agentType);

    if (relevantMemories.length === 0) {
      return "No relevant past experience found for this context.";
    }

    // Analyze past successes and failures
    const successes = relevantMemories.filter(m => m.metadata.outcome === 'success');
    const failures = relevantMemories.filter(m => m.metadata.outcome === 'failure');

    let advice = "Based on past experience:\n\n";

    if (successes.length > 0) {
      advice += "**Successful approaches:**\n";
      successes.forEach(memory => {
        advice += `• ${memory.content} (${memory.metadata.confidence * 100}% confidence)\n`;
      });
      advice += "\n";
    }

    if (failures.length > 0) {
      advice += "**Approaches to avoid:**\n";
      failures.forEach(memory => {
        advice += `• ${memory.content}\n`;
      });
      advice += "\n";
    }

    // Add pattern-based insights
    const relevantPatterns = patterns.filter(p => 
      currentContext.toLowerCase().includes(p.description.toLowerCase())
    );

    if (relevantPatterns.length > 0) {
      advice += "**Learned patterns:**\n";
      relevantPatterns.forEach(pattern => {
        advice += `• ${pattern.description} (${pattern.confidence * 100}% confidence, seen ${pattern.occurrences} times)\n`;
      });
    }

    return advice;
  }

  /**
   * Initialize default personalities for agents
   */
  private initializeDefaultPersonalities(): void {
    const defaultPersonalities: AgentPersonality[] = [
      {
        agentType: 'ceo',
        traits: {
          riskTolerance: 0.7,
          decisionSpeed: 0.8,
          collaborationStyle: 'directive',
          focusAreas: ['strategy', 'growth', 'stakeholders'],
          biases: ['optimism_bias', 'overconfidence']
        },
        preferences: {
          dataTypes: ['market_data', 'financial_projections', 'competitive_analysis'],
          analysisDepth: 'comprehensive',
          communicationStyle: 'formal'
        },
        learningRate: 0.6,
        lastUpdated: new Date()
      },
      {
        agentType: 'cfo',
        traits: {
          riskTolerance: 0.3,
          decisionSpeed: 0.6,
          collaborationStyle: 'consultative',
          focusAreas: ['financial_health', 'risk_management', 'compliance'],
          biases: ['loss_aversion', 'conservatism_bias']
        },
        preferences: {
          dataTypes: ['financial_statements', 'budget_data', 'risk_metrics'],
          analysisDepth: 'thorough',
          communicationStyle: 'technical'
        },
        learningRate: 0.4,
        lastUpdated: new Date()
      },
      {
        agentType: 'cto',
        traits: {
          riskTolerance: 0.5,
          decisionSpeed: 0.7,
          collaborationStyle: 'collaborative',
          focusAreas: ['technology', 'innovation', 'scalability'],
          biases: ['optimism_bias', 'planning_fallacy']
        },
        preferences: {
          dataTypes: ['technical_specs', 'performance_metrics', 'innovation_trends'],
          analysisDepth: 'thorough',
          communicationStyle: 'technical'
        },
        learningRate: 0.8,
        lastUpdated: new Date()
      },
      {
        agentType: 'hr',
        traits: {
          riskTolerance: 0.4,
          decisionSpeed: 0.5,
          collaborationStyle: 'collaborative',
          focusAreas: ['people', 'culture', 'development'],
          biases: ['empathy_bias', 'confirmation_bias']
        },
        preferences: {
          dataTypes: ['employee_surveys', 'performance_reviews', 'culture_metrics'],
          analysisDepth: 'comprehensive',
          communicationStyle: 'casual'
        },
        learningRate: 0.7,
        lastUpdated: new Date()
      }
    ];

    defaultPersonalities.forEach(personality => {
      this.personalities.set(personality.agentType, personality);
    });
  }

  /**
   * Analyze memories for patterns
   */
  private async analyzeForPatterns(agentType: string): Promise<void> {
    const memories = this.memories.get(agentType) || [];
    if (memories.length < 3) return; // Need minimum data for pattern detection

    const patterns: LearningPattern[] = [];

    // Analyze success patterns
    const successMemories = memories.filter(m => m.metadata.outcome === 'success');
    if (successMemories.length >= 2) {
      const commonTags = this.findCommonElements(successMemories.map(m => m.metadata.tags));
      if (commonTags.length > 0) {
        patterns.push({
          id: uuidv4(),
          patternType: 'success_factor',
          description: `Success often involves: ${commonTags.join(', ')}`,
          confidence: Math.min(0.9, successMemories.length / 10),
          occurrences: successMemories.length,
          lastSeen: new Date(),
          examples: successMemories.slice(0, 3).map(m => m.content),
          businessImpact: 'high'
        });
      }
    }

    // Analyze failure patterns
    const failureMemories = memories.filter(m => m.metadata.outcome === 'failure');
    if (failureMemories.length >= 2) {
      const commonTags = this.findCommonElements(failureMemories.map(m => m.metadata.tags));
      if (commonTags.length > 0) {
        patterns.push({
          id: uuidv4(),
          patternType: 'failure_mode',
          description: `Failures often involve: ${commonTags.join(', ')}`,
          confidence: Math.min(0.9, failureMemories.length / 10),
          occurrences: failureMemories.length,
          lastSeen: new Date(),
          examples: failureMemories.slice(0, 3).map(m => m.content),
          businessImpact: 'high'
        });
      }
    }

    this.patterns.set(agentType, patterns);
  }

  /**
   * Calculate relevance score between memory and context
   */
  private calculateRelevanceScore(memory: AgentMemory, context: string): number {
    const contextLower = context.toLowerCase();
    const memoryContentLower = memory.content.toLowerCase();
    const memoryContextLower = memory.context.toLowerCase();

    // Exact matches
    if (memoryContentLower.includes(contextLower) || memoryContextLower.includes(contextLower)) {
      return 1.0;
    }

    // Tag matches
    const contextWords = contextLower.split(' ');
    const tagMatches = memory.metadata.tags.filter(tag => 
      contextWords.some(word => tag.toLowerCase().includes(word))
    ).length;

    const tagScore = tagMatches / Math.max(memory.metadata.tags.length, 1);

    // Word overlap
    const memoryWords = (memoryContentLower + ' ' + memoryContextLower).split(' ');
    const commonWords = contextWords.filter(word => 
      word.length > 3 && memoryWords.some(mWord => mWord.includes(word))
    ).length;

    const wordScore = commonWords / Math.max(contextWords.length, 1);

    // Combined score with base relevance from metadata
    return (memory.metadata.relevanceScore * 0.4) + (tagScore * 0.3) + (wordScore * 0.3);
  }

  /**
   * Update agent personality based on outcomes
   */
  private async updatePersonalityFromOutcome(
    agentType: string,
    outcome: 'success' | 'failure' | 'partial',
    businessMetrics?: Record<string, number>
  ): Promise<void> {
    const personality = this.personalities.get(agentType);
    if (!personality) return;

    const learningRate = personality.learningRate;
    
    // Adjust risk tolerance based on outcomes
    if (outcome === 'success' && businessMetrics) {
      const positiveMetrics = Object.values(businessMetrics).filter(v => v > 0).length;
      const totalMetrics = Object.values(businessMetrics).length;
      
      if (positiveMetrics / totalMetrics > 0.7) {
        personality.traits.riskTolerance = Math.min(1.0, 
          personality.traits.riskTolerance + (learningRate * 0.1)
        );
      }
    } else if (outcome === 'failure') {
      personality.traits.riskTolerance = Math.max(0.0,
        personality.traits.riskTolerance - (learningRate * 0.15)
      );
    }

    // Adjust decision speed based on success rate
    const recentMemories = (this.memories.get(agentType) || [])
      .slice(-10); // Last 10 decisions
    
    const successRate = recentMemories.filter(m => m.metadata.outcome === 'success').length / 
                       Math.max(recentMemories.length, 1);

    if (successRate > 0.7) {
      personality.traits.decisionSpeed = Math.min(1.0,
        personality.traits.decisionSpeed + (learningRate * 0.05)
      );
    } else if (successRate < 0.3) {
      personality.traits.decisionSpeed = Math.max(0.0,
        personality.traits.decisionSpeed - (learningRate * 0.1)
      );
    }

    personality.lastUpdated = new Date();
    this.personalities.set(agentType, personality);
  }

  /**
   * Find common elements across arrays
   */
  private findCommonElements(arrays: string[][]): string[] {
    if (arrays.length === 0) return [];

    const elementCounts = new Map<string, number>();
    const threshold = Math.ceil(arrays.length / 2); // Appear in at least half

    arrays.forEach(array => {
      const uniqueElements = [...new Set(array)];
      uniqueElements.forEach(element => {
        elementCounts.set(element, (elementCounts.get(element) || 0) + 1);
      });
    });

    return Array.from(elementCounts.entries())
      .filter(([, count]) => count >= threshold)
      .map(([element]) => element);
  }

  /**
   * Simple content hashing for indexing
   */
  private hashContent(content: string): string {
    return content.toLowerCase().replace(/\s+/g, ' ').trim();
  }

  /**
   * Get memory statistics for an agent
   */
  getMemoryStats(agentType: string): {
    totalMemories: number;
    successRate: number;
    mostCommonTags: string[];
    learningProgress: number;
  } {
    const memories = this.memories.get(agentType) || [];
    const patterns = this.patterns.get(agentType) || [];

    const totalMemories = memories.length;
    const outcomesMemories = memories.filter(m => m.metadata.outcome);
    const successRate = outcomesMemories.length > 0 ? 
      outcomesMemories.filter(m => m.metadata.outcome === 'success').length / outcomesMemories.length : 0;

    // Find most common tags
    const tagCounts = new Map<string, number>();
    memories.forEach(memory => {
      memory.metadata.tags.forEach(tag => {
        tagCounts.set(tag, (tagCounts.get(tag) || 0) + 1);
      });
    });

    const mostCommonTags = Array.from(tagCounts.entries())
      .sort((a, b) => b[1] - a[1])
      .slice(0, 5)
      .map(([tag]) => tag);

    // Learning progress based on patterns discovered and memory diversity
    const learningProgress = Math.min(1.0, (patterns.length * 0.3) + (totalMemories * 0.01));

    return {
      totalMemories,
      successRate,
      mostCommonTags,
      learningProgress
    };
  }
}

// Export singleton instance
export const memoryService = new AgentMemoryService();
