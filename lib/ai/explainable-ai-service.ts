/**
 * Explainable AI Service
 * 
 * Provides transparency into AI decision-making through:
 * - Decision reasoning chains
 * - Confidence scoring and justification
 * - Audit trails for business decisions
 * - Evidence tracking and source attribution
 */

import { EventEmitter } from 'events';

// Core interfaces for explainable AI
export interface ReasoningStep {
  id: string;
  stepNumber: number;
  type: 'analysis' | 'synthesis' | 'conclusion' | 'evidence' | 'assumption';
  description: string;
  evidence: Evidence[];
  confidence: number;
  timestamp: Date;
  processingTime: number;
}

export interface Evidence {
  id: string;
  type: 'document' | 'market_data' | 'memory' | 'collaboration' | 'external';
  source: string;
  content: string;
  relevance: number;
  reliability: number;
  citation: string;
  metadata: Record<string, unknown>;
}

export interface DecisionAuditTrail {
  id: string;
  sessionId: string;
  agentType: string;
  decision: string;
  reasoning: ReasoningStep[];
  confidence: number;
  evidenceCount: number;
  totalProcessingTime: number;
  outcome?: 'success' | 'failure' | 'pending';
  businessImpact?: {
    revenue_impact?: number;
    efficiency_gain?: number;
    risk_reduction?: number;
    user_satisfaction?: number;
  };
  feedback?: UserFeedback[];
  timestamp: Date;
  context: {
    query: string;
    sessionType: string;
    documentContext?: string[];
    marketContext?: string[];
    collaborationContext?: string[];
    memoryContext?: string[];
  };
}

export interface UserFeedback {
  id: string;
  userId: string;
  type: 'rating' | 'comment' | 'correction' | 'validation';
  value: number | string;
  timestamp: Date;
  context: string;
}

export interface ConfidenceBreakdown {
  overall: number;
  components: {
    evidence_quality: number;
    source_reliability: number;
    reasoning_consistency: number;
    historical_accuracy: number;
    consensus_agreement: number;
  };
  factors: {
    positive: string[];
    negative: string[];
    neutral: string[];
  };
}

export interface ExplainabilityMetrics {
  transparency_score: number;
  reasoning_depth: number;
  evidence_coverage: number;
  user_comprehension: number;
  decision_traceability: number;
}

/**
 * Explainable AI Service Class
 * Provides comprehensive decision transparency and reasoning analysis
 */
export class ExplainableAIService extends EventEmitter {
  private auditTrails: Map<string, DecisionAuditTrail> = new Map();
  private feedbackStore: Map<string, UserFeedback[]> = new Map();
  private performanceMetrics: Map<string, ExplainabilityMetrics> = new Map();

  constructor() {
    super();
    this.initializeService();
  }

  private initializeService(): void {
    // Only log during development and avoid logging during build process
    if (process.env.NODE_ENV === 'development' && !process.env.NEXT_BUILD) {
      console.log('🔍 Explainable AI Service initialized');
    }
    
    // Avoid setting up intervals during build process
    if (typeof window !== 'undefined' || process.env.NODE_ENV === 'production') {
      // Set up periodic cleanup and optimization
      setInterval(() => {
        this.optimizeAuditTrails();
      }, 60000); // Every minute

      // Set up performance monitoring
      setInterval(() => {
        this.calculateMetrics();
      }, 300000); // Every 5 minutes
    }
  }

  /**
   * Start tracking a decision process
   */
  public startDecisionTracking(
    sessionId: string,
    agentType: string,
    query: string,
    context: {
      sessionType?: string;
      documents?: string[];
      marketData?: string[];
      collaboration?: string[];
      memory?: string[];
    }
  ): string {
    const auditId = `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    
    const auditTrail: DecisionAuditTrail = {
      id: auditId,
      sessionId,
      agentType,
      decision: '',
      reasoning: [],
      confidence: 0,
      evidenceCount: 0,
      totalProcessingTime: 0,
      timestamp: new Date(),
      context: {
        query,
        sessionType: context.sessionType || 'individual',
        documentContext: context.documents || [],
        marketContext: context.marketData || [],
        collaborationContext: context.collaboration || [],
        memoryContext: context.memory || []
      }
    };

    this.auditTrails.set(auditId, auditTrail);
    this.emit('tracking_started', { auditId, agentType, query });
    
    return auditId;
  }

  /**
   * Add a reasoning step to the decision process
   */
  public addReasoningStep(
    auditId: string,
    type: ReasoningStep['type'],
    description: string,
    evidence: Evidence[],
    confidence: number,
    processingTime: number
  ): void {
    const auditTrail = this.auditTrails.get(auditId);
    if (!auditTrail) {
      console.warn(`Audit trail not found: ${auditId}`);
      return;
    }

    const step: ReasoningStep = {
      id: `step_${auditTrail.reasoning.length + 1}`,
      stepNumber: auditTrail.reasoning.length + 1,
      type,
      description,
      evidence,
      confidence,
      timestamp: new Date(),
      processingTime
    };

    auditTrail.reasoning.push(step);
    auditTrail.evidenceCount += evidence.length;
    auditTrail.totalProcessingTime += processingTime;
    
    this.emit('reasoning_step_added', { auditId, step });
  }

  /**
   * Complete the decision tracking with final decision and confidence
   */
  public completeDecisionTracking(
    auditId: string,
    decision: string,
    overallConfidence: number
  ): DecisionAuditTrail | null {
    const auditTrail = this.auditTrails.get(auditId);
    if (!auditTrail) {
      console.warn(`Audit trail not found: ${auditId}`);
      return null;
    }

    auditTrail.decision = decision;
    auditTrail.confidence = overallConfidence;
    
    this.emit('tracking_completed', { auditId, decision, confidence: overallConfidence });
    
    return auditTrail;
  }

  /**
   * Generate confidence breakdown with detailed analysis
   */
  public generateConfidenceBreakdown(auditId: string): ConfidenceBreakdown | null {
    const auditTrail = this.auditTrails.get(auditId);
    if (!auditTrail) return null;

    const evidenceQuality = this.calculateEvidenceQuality(auditTrail.reasoning);
    const sourceReliability = this.calculateSourceReliability(auditTrail.reasoning);
    const reasoningConsistency = this.calculateReasoningConsistency(auditTrail.reasoning);
    const historicalAccuracy = this.getHistoricalAccuracy(auditTrail.agentType);
    const consensusAgreement = this.getConsensusAgreement(auditTrail);

    const overall = (
      evidenceQuality * 0.25 +
      sourceReliability * 0.20 +
      reasoningConsistency * 0.25 +
      historicalAccuracy * 0.15 +
      consensusAgreement * 0.15
    );

    return {
      overall,
      components: {
        evidence_quality: evidenceQuality,
        source_reliability: sourceReliability,
        reasoning_consistency: reasoningConsistency,
        historical_accuracy: historicalAccuracy,
        consensus_agreement: consensusAgreement
      },
      factors: {
        positive: this.getPositiveFactors(auditTrail),
        negative: this.getNegativeFactors(auditTrail),
        neutral: this.getNeutralFactors(auditTrail)
      }
    };
  }

  /**
   * Add user feedback to a decision
   */
  public addUserFeedback(
    auditId: string,
    userId: string,
    type: UserFeedback['type'],
    value: number | string,
    context: string
  ): void {
    const feedback: UserFeedback = {
      id: `feedback_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      userId,
      type,
      value,
      timestamp: new Date(),
      context
    };

    if (!this.feedbackStore.has(auditId)) {
      this.feedbackStore.set(auditId, []);
    }
    
    this.feedbackStore.get(auditId)!.push(feedback);
    
    // Update audit trail with feedback
    const auditTrail = this.auditTrails.get(auditId);
    if (auditTrail) {
      if (!auditTrail.feedback) auditTrail.feedback = [];
      auditTrail.feedback.push(feedback);
    }

    this.emit('feedback_added', { auditId, feedback });
  }

  /**
   * Record decision outcome for learning
   */
  public recordOutcome(
    auditId: string,
    outcome: 'success' | 'failure',
    businessImpact: DecisionAuditTrail['businessImpact']
  ): void {
    const auditTrail = this.auditTrails.get(auditId);
    if (!auditTrail) return;

    auditTrail.outcome = outcome;
    auditTrail.businessImpact = businessImpact;

    this.emit('outcome_recorded', { auditId, outcome, businessImpact });
  }

  /**
   * Get audit trail by ID
   */
  public getAuditTrail(auditId: string): DecisionAuditTrail | null {
    return this.auditTrails.get(auditId) || null;
  }

  /**
   * Get audit trails by session or agent
   */
  public getAuditTrails(filters: {
    sessionId?: string;
    agentType?: string;
    outcome?: 'success' | 'failure' | 'pending';
    startDate?: Date;
    endDate?: Date;
  }): DecisionAuditTrail[] {
    return Array.from(this.auditTrails.values()).filter(trail => {
      if (filters.sessionId && trail.sessionId !== filters.sessionId) return false;
      if (filters.agentType && trail.agentType !== filters.agentType) return false;
      if (filters.outcome && trail.outcome !== filters.outcome) return false;
      if (filters.startDate && trail.timestamp < filters.startDate) return false;
      if (filters.endDate && trail.timestamp > filters.endDate) return false;
      return true;
    });
  }

  /**
   * Get explainability metrics for an agent or overall system
   */
  public getExplainabilityMetrics(agentType?: string): ExplainabilityMetrics {
    if (agentType && this.performanceMetrics.has(agentType)) {
      return this.performanceMetrics.get(agentType)!;
    }

    return this.calculateOverallMetrics();
  }

  /**
   * Generate decision explanation in natural language
   */
  public generateDecisionExplanation(auditId: string): {
    summary: string;
    reasoning: string;
    evidence: string;
    confidence: string;
    recommendations: string[];
  } | null {
    const auditTrail = this.auditTrails.get(auditId);
    if (!auditTrail) return null;

    const confidenceBreakdown = this.generateConfidenceBreakdown(auditId);
    if (!confidenceBreakdown) return null;

    return {
      summary: this.generateSummary(auditTrail),
      reasoning: this.generateReasoningExplanation(auditTrail),
      evidence: this.generateEvidenceExplanation(auditTrail),
      confidence: this.generateConfidenceExplanation(confidenceBreakdown),
      recommendations: this.generateRecommendations(auditTrail, confidenceBreakdown)
    };
  }

  // Private helper methods

  private calculateEvidenceQuality(reasoning: ReasoningStep[]): number {
    if (reasoning.length === 0) return 0;

    let totalQuality = 0;
    let evidenceCount = 0;

    reasoning.forEach(step => {
      step.evidence.forEach(evidence => {
        totalQuality += (evidence.relevance * evidence.reliability);
        evidenceCount++;
      });
    });

    return evidenceCount > 0 ? totalQuality / evidenceCount : 0;
  }

  private calculateSourceReliability(reasoning: ReasoningStep[]): number {
    const reliabilityScores = {
      'document': 0.9,
      'market_data': 0.8,
      'memory': 0.7,
      'collaboration': 0.8,
      'external': 0.6
    };

    let totalReliability = 0;
    let sourceCount = 0;

    reasoning.forEach(step => {
      step.evidence.forEach(evidence => {
        totalReliability += reliabilityScores[evidence.type] || 0.5;
        sourceCount++;
      });
    });

    return sourceCount > 0 ? totalReliability / sourceCount : 0;
  }

  private calculateReasoningConsistency(reasoning: ReasoningStep[]): number {
    if (reasoning.length === 0) return 0;

    const confidenceVariance = this.calculateVariance(
      reasoning.map(step => step.confidence)
    );

    // Lower variance = higher consistency
    return Math.max(0, 1 - (confidenceVariance * 2));
  }

  private getHistoricalAccuracy(agentType: string): number {
    const successfulDecisions = this.getAuditTrails({
      agentType,
      outcome: 'success'
    }).length;

    const totalDecisions = this.getAuditTrails({ agentType }).length;

    return totalDecisions > 0 ? successfulDecisions / totalDecisions : 0.5;
  }

  private getConsensusAgreement(auditTrail: DecisionAuditTrail): number {
    // Check if this decision was part of collaboration
    if (auditTrail.context.collaborationContext && 
        auditTrail.context.collaborationContext.length > 0) {
      // Calculate agreement based on collaboration data
      return 0.8; // Placeholder
    }
    return 0.7; // Default for individual decisions
  }

  private getPositiveFactors(auditTrail: DecisionAuditTrail): string[] {
    const factors: string[] = [];
    
    if (auditTrail.evidenceCount > 5) {
      factors.push(`Strong evidence base (${auditTrail.evidenceCount} sources)`);
    }
    
    if (auditTrail.confidence > 0.8) {
      factors.push('High confidence score');
    }
    
    if (auditTrail.context.documentContext && auditTrail.context.documentContext.length > 0) {
      factors.push('Company document support');
    }
    
    if (auditTrail.context.marketContext && auditTrail.context.marketContext.length > 0) {
      factors.push('Market data validation');
    }

    return factors;
  }

  private getNegativeFactors(auditTrail: DecisionAuditTrail): string[] {
    const factors: string[] = [];
    
    if (auditTrail.evidenceCount < 3) {
      factors.push('Limited evidence available');
    }
    
    if (auditTrail.confidence < 0.6) {
      factors.push('Low confidence score');
    }
    
    if (auditTrail.totalProcessingTime > 10000) {
      factors.push('Extended processing time');
    }

    return factors;
  }

  private getNeutralFactors(auditTrail: DecisionAuditTrail): string[] {
    const factors: string[] = [];
    
    factors.push(`Processing time: ${auditTrail.totalProcessingTime}ms`);
    factors.push(`Reasoning steps: ${auditTrail.reasoning.length}`);
    factors.push(`Agent type: ${auditTrail.agentType.toUpperCase()}`);

    return factors;
  }

  private calculateOverallMetrics(): ExplainabilityMetrics {
    const allTrails = Array.from(this.auditTrails.values());
    
    if (allTrails.length === 0) {
      return {
        transparency_score: 0,
        reasoning_depth: 0,
        evidence_coverage: 0,
        user_comprehension: 0,
        decision_traceability: 1.0
      };
    }

    const avgReasoningSteps = allTrails.reduce((sum, trail) => 
      sum + trail.reasoning.length, 0) / allTrails.length;
    
    const avgEvidenceCount = allTrails.reduce((sum, trail) => 
      sum + trail.evidenceCount, 0) / allTrails.length;

    return {
      transparency_score: Math.min(1.0, avgReasoningSteps / 5),
      reasoning_depth: Math.min(1.0, avgReasoningSteps / 8),
      evidence_coverage: Math.min(1.0, avgEvidenceCount / 10),
      user_comprehension: this.calculateUserComprehension(),
      decision_traceability: 1.0
    };
  }

  private calculateUserComprehension(): number {
    const allFeedback = Array.from(this.feedbackStore.values()).flat();
    const ratings = allFeedback
      .filter(fb => fb.type === 'rating' && typeof fb.value === 'number')
      .map(fb => fb.value as number);

    if (ratings.length === 0) return 0.5;

    const avgRating = ratings.reduce((sum, rating) => sum + rating, 0) / ratings.length;
    return avgRating / 5; // Normalize to 0-1 scale
  }

  private calculateVariance(values: number[]): number {
    if (values.length === 0) return 0;
    
    const mean = values.reduce((sum, val) => sum + val, 0) / values.length;
    const squaredDiffs = values.map(val => Math.pow(val - mean, 2));
    return squaredDiffs.reduce((sum, diff) => sum + diff, 0) / values.length;
  }

  private generateSummary(auditTrail: DecisionAuditTrail): string {
    return `The ${auditTrail.agentType.toUpperCase()} agent analyzed "${auditTrail.context.query}" ` +
           `using ${auditTrail.evidenceCount} pieces of evidence across ${auditTrail.reasoning.length} ` +
           `reasoning steps, reaching a confidence level of ${Math.round(auditTrail.confidence * 100)}%.`;
  }

  private generateReasoningExplanation(auditTrail: DecisionAuditTrail): string {
    return auditTrail.reasoning.map((step, index) => 
      `${index + 1}. ${step.description} (${Math.round(step.confidence * 100)}% confidence)`
    ).join('\n\n');
  }

  private generateEvidenceExplanation(auditTrail: DecisionAuditTrail): string {
    const evidenceByType = new Map<string, Evidence[]>();
    
    auditTrail.reasoning.forEach(step => {
      step.evidence.forEach(evidence => {
        if (!evidenceByType.has(evidence.type)) {
          evidenceByType.set(evidence.type, []);
        }
        evidenceByType.get(evidence.type)!.push(evidence);
      });
    });

    const explanations: string[] = [];
    evidenceByType.forEach((evidenceList, type) => {
      explanations.push(`${type.replace('_', ' ').toUpperCase()}: ${evidenceList.length} sources`);
    });

    return explanations.join(', ');
  }

  private generateConfidenceExplanation(breakdown: ConfidenceBreakdown): string {
    return `Overall confidence: ${Math.round(breakdown.overall * 100)}% ` +
           `(Evidence: ${Math.round(breakdown.components.evidence_quality * 100)}%, ` +
           `Reliability: ${Math.round(breakdown.components.source_reliability * 100)}%, ` +
           `Consistency: ${Math.round(breakdown.components.reasoning_consistency * 100)}%)`;
  }

  private generateRecommendations(
    auditTrail: DecisionAuditTrail, 
    breakdown: ConfidenceBreakdown
  ): string[] {
    const recommendations: string[] = [];

    if (breakdown.overall < 0.7) {
      recommendations.push('Consider gathering additional evidence before making final decision');
    }

    if (auditTrail.evidenceCount < 5) {
      recommendations.push('Expand evidence base with more diverse sources');
    }

    if (breakdown.components.reasoning_consistency < 0.6) {
      recommendations.push('Review reasoning steps for consistency and logical flow');
    }

    if (breakdown.components.historical_accuracy < 0.7) {
      recommendations.push('Consider lessons learned from similar past decisions');
    }

    return recommendations;
  }

  private optimizeAuditTrails(): void {
    const cutoffDate = new Date(Date.now() - (30 * 24 * 60 * 60 * 1000)); // 30 days ago
    
    for (const [id, trail] of this.auditTrails.entries()) {
      if (trail.timestamp < cutoffDate && !trail.outcome) {
        this.auditTrails.delete(id);
        this.feedbackStore.delete(id);
      }
    }
  }

  private calculateMetrics(): void {
    const agentTypes = ['ceo', 'cfo', 'cto', 'hr'];
    
    agentTypes.forEach(agentType => {
      const metrics = this.calculateAgentMetrics(agentType);
      this.performanceMetrics.set(agentType, metrics);
    });

    this.emit('metrics_updated', this.performanceMetrics);
  }

  private calculateAgentMetrics(agentType: string): ExplainabilityMetrics {
    const agentTrails = this.getAuditTrails({ agentType });
    
    if (agentTrails.length === 0) {
      return {
        transparency_score: 0,
        reasoning_depth: 0,
        evidence_coverage: 0,
        user_comprehension: 0,
        decision_traceability: 1.0
      };
    }

    const avgReasoningSteps = agentTrails.reduce((sum, trail) => 
      sum + trail.reasoning.length, 0) / agentTrails.length;
    
    const avgEvidenceCount = agentTrails.reduce((sum, trail) => 
      sum + trail.evidenceCount, 0) / agentTrails.length;

    return {
      transparency_score: Math.min(1.0, avgReasoningSteps / 5),
      reasoning_depth: Math.min(1.0, avgReasoningSteps / 8),
      evidence_coverage: Math.min(1.0, avgEvidenceCount / 10),
      user_comprehension: this.calculateAgentUserComprehension(agentType),
      decision_traceability: 1.0
    };
  }

  private calculateAgentUserComprehension(agentType: string): number {
    const agentTrails = this.getAuditTrails({ agentType });
    const agentFeedback = agentTrails
      .map(trail => this.feedbackStore.get(trail.id) || [])
      .flat()
      .filter(fb => fb.type === 'rating' && typeof fb.value === 'number')
      .map(fb => fb.value as number);

    if (agentFeedback.length === 0) return 0.5;

    const avgRating = agentFeedback.reduce((sum, rating) => sum + rating, 0) / agentFeedback.length;
    return avgRating / 5; // Normalize to 0-1 scale
  }
}

// Singleton pattern to prevent multiple instances during build
let explainableAIServiceInstance: ExplainableAIService | null = null;

export const explainableAIService = (() => {
  if (!explainableAIServiceInstance) {
    explainableAIServiceInstance = new ExplainableAIService();
  }
  return explainableAIServiceInstance;
})();
