/**
 * Phase 4: Advanced Multi-Agent Collaboration Service
 * 
 * This service enables true agent-to-agent communication, collaborative reasoning,
 * and consensus building among AI agents in boardroom scenarios.
 */

import { EventEmitter } from 'events';
import { v4 as uuidv4 } from 'uuid';
import { getAgentResponse, type AgentType, type ScenarioData } from './agent-service';

export interface AgentCollaborationEvent {
  id: string;
  sessionId: string;
  timestamp: Date;
  type: 'proposal' | 'question' | 'challenge' | 'agreement' | 'synthesis' | 'vote';
  fromAgent: string;
  toAgent?: string; // null for broadcast
  content: string;
  metadata?: {
    confidence?: number;
    priority?: 'low' | 'medium' | 'high' | 'urgent';
    decisionPoint?: string;
    supportingData?: Record<string, unknown>;
  };
}

export interface AgentDiscussion {
  id: string;
  sessionId: string;
  topic: string;
  participants: string[];
  status: 'active' | 'consensus_reached' | 'needs_more_input' | 'escalated';
  events: AgentCollaborationEvent[];
  consensus?: {
    decision: string;
    confidence: number;
    supportingAgents: string[];
    dissenting: string[];
    reasoning: string;
  };
  startTime: Date;
  endTime?: Date;
}

export interface CollaborationPlan {
  discussionTopic: string;
  requiredAgents: string[];
  maxRounds: number;
  consensusThreshold: number; // 0-1, percentage of agents needed for consensus
  timeoutMinutes: number;
  facilitator?: string; // Which agent leads the discussion
}

export class AgentCollaborationService extends EventEmitter {
  private discussions: Map<string, AgentDiscussion> = new Map();
  private agentStates: Map<string, Record<string, unknown>> = new Map();

  constructor() {
    super();
  }

  /**
   * Start a collaborative discussion among multiple agents
   */
  async startCollaboration(
    sessionId: string,
    plan: CollaborationPlan,
    initialContext: string,
    userMessage?: string
  ): Promise<AgentDiscussion> {
    const discussionId = uuidv4();
    
    // Convert agent names to lowercase for consistency with agent service
    const normalizedAgents = plan.requiredAgents.map(agent => agent.toLowerCase());
    
    const discussion: AgentDiscussion = {
      id: discussionId,
      sessionId,
      topic: plan.discussionTopic,
      participants: plan.requiredAgents, // Keep original for display
      status: 'active',
      events: [],
      startTime: new Date()
    };

    this.discussions.set(discussionId, discussion);

    // Start the collaboration with facilitator or first agent
    const facilitator = plan.facilitator ? plan.facilitator.toLowerCase() : normalizedAgents[0];
    await this.facilitateDiscussion(discussionId, facilitator, initialContext, userMessage);

    return discussion;
  }

  /**
   * Facilitate a discussion with multi-round agent interactions
   */
  private async facilitateDiscussion(
    discussionId: string,
    facilitator: string,
    context: string,
    userMessage?: string
  ): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return;

    try {
      // Convert agent names to lowercase for consistency
      const normalizedAgents = discussion.participants.map(agent => agent.toLowerCase());

      // Phase 1: Initial proposals from each agent (sequentially for real-time display)
      console.log('Phase 1: Gathering initial proposals...');
      for (const agent of normalizedAgents) {
        await this.generateAgentProposal(discussionId, agent, context, userMessage);
        // Ensure each proposal appears before the next
        await new Promise(resolve => setTimeout(resolve, 1500));
      }

      // Phase 2: Agent-to-agent responses and challenges (sequentially)
      console.log('Phase 2: Conducting debate rounds...');
      await this.conductAgentDebate(discussionId, 3); // Max 3 rounds of debate

      // Phase 3: Synthesis and consensus building
      console.log('Phase 3: Building consensus...');
      await this.buildConsensus(discussionId, facilitator);

      this.emit('discussion_complete', discussion);
    } catch (error) {
      console.error('Error in facilitateDiscussion:', error);
      discussion.status = 'escalated';
    }
  }

  /**
   * Generate initial proposal from an agent
   */
  private async generateAgentProposal(
    discussionId: string,
    agentName: string,
    context: string,
    userMessage?: string
  ): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return;

    const collaborationPrompt = this.buildCollaborationPrompt(
      agentName,
      'proposal',
      context,
      discussion.events,
      userMessage
    );

    const scenario: ScenarioData = {
      name: `Collaboration - ${discussion.topic}`,
      description: collaborationPrompt,
      parameters: {
        phase: 'proposal',
        discussionId: discussionId,
        fromAgent: agentName
      }
    };

    try {
      const response = await getAgentResponse(
        agentName as AgentType,
        scenario,
        userMessage || context
      );

      const event: AgentCollaborationEvent = {
        id: uuidv4(),
        sessionId: discussion.sessionId,
        timestamp: new Date(),
        type: 'proposal',
        fromAgent: agentName.toUpperCase(), // Convert back to uppercase for display
        content: response.response,
        metadata: {
          confidence: 0.8, // Default confidence for agent responses
          priority: 'medium'
        }
      };

      discussion.events.push(event);
      this.emit('agent_proposal', event);
      
      // Small delay for natural pacing (reduced since we have delays at higher level)
      await new Promise(resolve => setTimeout(resolve, 300));
    } catch (error) {
      console.error(`Error generating proposal from ${agentName}:`, error);
    }
  }

  /**
   * Conduct multi-round debate between agents
   */
  private async conductAgentDebate(discussionId: string, maxRounds: number): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return;

    // Convert agent names to lowercase for consistency
    const normalizedAgents = discussion.participants.map(agent => agent.toLowerCase());

    for (let round = 1; round <= maxRounds; round++) {
      console.log(`Starting debate round ${round}/${maxRounds}`);

      // Each agent responds sequentially for real-time display
      for (const agent of normalizedAgents) {
        await this.generateAgentDebateResponse(discussionId, agent, round);
        // Add delay between agent responses in the same round
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // Check if consensus is emerging
      const consensusCheck = await this.checkConsensusProgress(discussionId);
      if (consensusCheck.emerging) {
        console.log('Consensus emerging, ending debate early');
        break;
      }

      // Pause between rounds for better pacing
      if (round < maxRounds) {
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }
  }

  /**
   * Generate agent response in debate phase
   */
  private async generateAgentDebateResponse(
    discussionId: string,
    agentName: string,
    round: number
  ): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return;

    // Skip if agent has already spoken this round
    const recentEvents = discussion.events.filter(e => 
      e.fromAgent === agentName && 
      Date.now() - e.timestamp.getTime() < 60000 // Last minute
    );
    if (recentEvents.length > 0 && round > 1) return;

    const debatePrompt = this.buildCollaborationPrompt(
      agentName,
      'challenge',
      discussion.topic,
      discussion.events
    );

    const scenario: ScenarioData = {
      name: `Debate Round ${round} - ${discussion.topic}`,
      description: debatePrompt,
      parameters: {
        phase: 'challenge',
        round: round,
        discussionId: discussionId,
        fromAgent: agentName
      }
    };

    try {
      const response = await getAgentResponse(
        agentName as AgentType,
        scenario,
        discussion.topic
      );

      const eventType = this.determineEventType(response.response);
      const event: AgentCollaborationEvent = {
        id: uuidv4(),
        sessionId: discussion.sessionId,
        timestamp: new Date(),
        type: eventType,
        fromAgent: agentName.toUpperCase(), // Convert back to uppercase for display
        content: response.response,
        metadata: {
          confidence: 0.8, // Default confidence for agent responses
          priority: round === 1 ? 'high' : 'medium'
        }
      };

      discussion.events.push(event);
      this.emit('agent_debate', event);
      
      // Small delay for natural pacing (reduced since we have delays at higher level)
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error(`Error in agent debate response from ${agentName}:`, error);
    }
  }

  /**
   * Build consensus among agents
   */
  private async buildConsensus(discussionId: string, facilitator: string): Promise<void> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return;

    const synthesisPrompt = this.buildSynthesisPrompt(discussion);

    const scenario: ScenarioData = {
      name: `Consensus Building - ${discussion.topic}`,
      description: synthesisPrompt,
      parameters: {
        phase: 'synthesis',
        discussionId: discussionId,
        facilitator: facilitator,
        eventCount: discussion.events.length
      }
    };

    try {
      const synthesis = await getAgentResponse(
        facilitator as AgentType,
        scenario,
        discussion.topic
      );

      // Extract consensus from synthesis
      const consensus = await this.extractConsensus(synthesis.response, discussion);
      
      discussion.consensus = consensus;
      discussion.status = consensus.confidence > 0.7 ? 'consensus_reached' : 'needs_more_input';
      discussion.endTime = new Date();

      const event: AgentCollaborationEvent = {
        id: uuidv4(),
        sessionId: discussion.sessionId,
        timestamp: new Date(),
        type: 'synthesis',
        fromAgent: facilitator.toUpperCase(), // Convert back to uppercase for display
        content: synthesis.response,
        metadata: {
          confidence: consensus.confidence,
          priority: 'high',
          decisionPoint: consensus.decision
        }
      };

      discussion.events.push(event);
      this.emit('consensus_built', { discussion, consensus });
      
      // Small delay for final consensus
      await new Promise(resolve => setTimeout(resolve, 200));
    } catch (error) {
      console.error('Error building consensus:', error);
      discussion.status = 'escalated';
    }
  }

  /**
   * Build collaboration prompt for agent
   */
  private buildCollaborationPrompt(
    agentName: string,
    phase: string,
    context: string,
    previousEvents: AgentCollaborationEvent[],
    userMessage?: string
  ): string {
    const recentEvents = previousEvents
      .slice(-10) // Last 10 events
      .map(e => `${e.fromAgent} (${e.type}): ${e.content}`)
      .join('\n');

    const rolePrompts = {
      'ceo': 'Focus on strategic implications, market positioning, and stakeholder impact.',
      'cfo': 'Analyze financial implications, ROI, budget impact, and risk assessment.',
      'cto': 'Evaluate technical feasibility, implementation complexity, and technological risks.',
      'hr': 'Consider organizational impact, talent implications, and change management needs.'
    };

    const phaseInstructions = {
      'proposal': 'Provide your initial assessment and recommendation.',
      'challenge': 'Respond to other agents\' proposals. Challenge assumptions, ask clarifying questions, or build on ideas.',
      'synthesis': 'Synthesize all perspectives into a coherent recommendation with clear next steps.'
    };

    return `
**COLLABORATIVE BOARDROOM DISCUSSION**

**Your Role**: ${agentName.toUpperCase()} - ${rolePrompts[agentName as keyof typeof rolePrompts] || 'Provide expert analysis from your domain.'}

**Discussion Topic**: ${context}
${userMessage ? `**User Question**: ${userMessage}` : ''}

**Phase**: ${phase} - ${phaseInstructions[phase as keyof typeof phaseInstructions]}

**Previous Discussion**:
${recentEvents || 'This is the start of the discussion.'}

**Instructions**:
- Stay in character as the ${agentName.toUpperCase()}
- ${phase === 'challenge' ? 'Either agree, disagree, or ask questions about other agents\' points' : 'Provide your professional perspective'}
- Be concise but thorough (max 200 words)
- ${phase === 'synthesis' ? 'Focus on finding common ground and actionable recommendations' : 'Consider the business implications from your expertise area'}
- Reference specific points from other agents when relevant

**Your Response**:`;
  }

  /**
   * Build synthesis prompt for consensus building
   */
  private buildSynthesisPrompt(discussion: AgentDiscussion): string {
    const allProposals = discussion.events
      .filter(e => e.type === 'proposal')
      .map(e => `${e.fromAgent}: ${e.content}`)
      .join('\n\n');

    const allDebates = discussion.events
      .filter(e => ['challenge', 'question', 'agreement'].includes(e.type))
      .map(e => `${e.fromAgent}: ${e.content}`)
      .join('\n\n');

    return `
**CONSENSUS BUILDING - FINAL SYNTHESIS**

**Discussion Topic**: ${discussion.topic}

**Initial Proposals**:
${allProposals}

**Debate Points**:
${allDebates}

**Your Task as Facilitator**:
1. Identify areas of agreement among the agents
2. Address key disagreements with balanced reasoning
3. Synthesize a coherent recommendation that incorporates all perspectives
4. Provide clear, actionable next steps
5. Rate confidence level (0-100%) in this recommendation

**Format your response as**:
**CONSENSUS RECOMMENDATION**: [Main decision/recommendation]

**KEY AGREEMENTS**: [What all agents agreed on]

**RESOLVED CONCERNS**: [How disagreements were addressed]

**NEXT STEPS**: [3-5 specific actionable items]

**CONFIDENCE LEVEL**: [0-100%] - [Brief reasoning for this confidence level]

**SUPPORTING RATIONALE**: [Why this synthesis represents the best path forward]
`;
  }

  /**
   * Extract consensus information from synthesis
   */
  private async extractConsensus(synthesisContent: string, discussion: AgentDiscussion): Promise<{
    decision: string;
    confidence: number;
    supportingAgents: string[];
    dissenting: string[];
    reasoning: string;
  }> {
    // Parse the synthesis content for consensus information
    const confidenceMatch = synthesisContent.match(/CONFIDENCE LEVEL.*?(\d+)%/i);
    const confidence = confidenceMatch ? parseInt(confidenceMatch[1]) / 100 : 0.5;

    const decisionMatch = synthesisContent.match(/CONSENSUS RECOMMENDATION.*?:(.*?)(?=\*\*|$)/is);
    const decision = decisionMatch ? decisionMatch[1].trim() : 'No clear consensus reached';

    const reasoningMatch = synthesisContent.match(/SUPPORTING RATIONALE.*?:(.*?)(?=\*\*|$)/is);
    const reasoning = reasoningMatch ? reasoningMatch[1].trim() : synthesisContent;

    // Determine supporting and dissenting agents based on event analysis
    const supportingAgents = discussion.participants.filter(agent => {
      const agentEvents = discussion.events.filter(e => e.fromAgent === agent);
      const agreements = agentEvents.filter(e => 
        e.type === 'agreement' || 
        (e.content.toLowerCase().includes('agree') && !e.content.toLowerCase().includes('disagree'))
      );
      return agreements.length > 0;
    });

    const dissenting = discussion.participants.filter(agent => 
      !supportingAgents.includes(agent)
    );

    return {
      decision,
      confidence,
      supportingAgents,
      dissenting,
      reasoning
    };
  }

  /**
   * Determine event type based on content
   */
  private determineEventType(content: string): AgentCollaborationEvent['type'] {
    const lowerContent = content.toLowerCase();
    
    if (lowerContent.includes('agree') || lowerContent.includes('support')) {
      return 'agreement';
    } else if (lowerContent.includes('question') || lowerContent.includes('how') || lowerContent.includes('what')) {
      return 'question';
    } else if (lowerContent.includes('however') || lowerContent.includes('concern') || lowerContent.includes('challenge')) {
      return 'challenge';
    }
    
    return 'proposal';
  }

  /**
   * Check if consensus is emerging
   */
  private async checkConsensusProgress(discussionId: string): Promise<{ emerging: boolean; confidence: number }> {
    const discussion = this.discussions.get(discussionId);
    if (!discussion) return { emerging: false, confidence: 0 };

    const recentEvents = discussion.events.slice(-discussion.participants.length);
    const agreements = recentEvents.filter(e => e.type === 'agreement').length;
    const challenges = recentEvents.filter(e => e.type === 'challenge').length;

    const confidence = agreements / (agreements + challenges + 1);
    return {
      emerging: confidence > 0.6,
      confidence
    };
  }

  /**
   * Get discussion by ID
   */
  getDiscussion(discussionId: string): AgentDiscussion | undefined {
    return this.discussions.get(discussionId);
  }

  /**
   * Get all discussions for a session
   */
  getSessionDiscussions(sessionId: string): AgentDiscussion[] {
    return Array.from(this.discussions.values())
      .filter(d => d.sessionId === sessionId);
  }

  /**
   * Get active discussions
   */
  getActiveDiscussions(): AgentDiscussion[] {
    return Array.from(this.discussions.values())
      .filter(d => d.status === 'active');
  }
}

// Export singleton instance
export const collaborationService = new AgentCollaborationService();
