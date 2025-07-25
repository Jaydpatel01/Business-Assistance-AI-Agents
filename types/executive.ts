// Executive/Agent role types and enums
export enum ExecutiveRole {
  CEO = 'ceo',
  CFO = 'cfo',
  CTO = 'cto',
  CHRO = 'hr',
  USER = 'user'
}

export interface ExecutiveProfile {
  id: ExecutiveRole;
  role: string;
  fullTitle: string;
  personality: string;
  expertise: string[];
  modelEnvVar: string;
  avatar: string;
  color: string;
  icon: string;
}

export interface Executive {
  id: string;
  role: ExecutiveRole;
  name: string;
  fullTitle: string;
  avatar?: string;
  color: string;
  expertise: string;
  isActive: boolean;
  joinedAt?: Date;
  metadata?: {
    totalResponses?: number;
    averageResponseTime?: number;
    lastActiveAt?: Date;
  };
}

export interface ExecutiveResponse {
  id: string;
  executiveRole: ExecutiveRole;
  content: string;
  reasoning?: string;
  confidence: 'High' | 'Medium' | 'Low';
  timestamp: Date;
  sessionId: string;
  metadata: {
    tokensUsed: number;
    responseTime: number;
    modelUsed: string;
    provider: string;
  };
}

export interface ExecutiveDecision {
  id: string;
  title: string;
  description: string;
  executiveRole: ExecutiveRole;
  vote: 'approve' | 'reject' | 'abstain';
  reasoning: string;
  confidence: 'High' | 'Medium' | 'Low';
  timestamp: Date;
  sessionId: string;
  metadata?: {
    relatedResponses: string[];
    impactAssessment?: string;
    riskLevel?: 'Low' | 'Medium' | 'High';
  };
}

export interface ExecutiveAnalytics {
  executiveRole: ExecutiveRole;
  totalSessions: number;
  totalResponses: number;
  averageResponseTime: number;
  participationRate: number;
  decisionAccuracy: number;
  collaborationScore: number;
  lastActiveAt: Date;
  topExpertiseAreas: string[];
}

// Consensus and collaboration types
export interface ExecutiveConsensus {
  id: string;
  sessionId: string;
  topic: string;
  participants: ExecutiveRole[];
  consensusLevel: 'Full' | 'Majority' | 'Split' | 'No Consensus';
  finalDecision?: string;
  dissenting?: {
    executiveRole: ExecutiveRole;
    reasoning: string;
  }[];
  timestamp: Date;
  metadata?: {
    discussionDuration: number;
    totalMessages: number;
    convergenceRate: number;
  };
}
