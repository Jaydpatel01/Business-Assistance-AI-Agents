// Database model types - manually defined for now to avoid Prisma type issues
import { NextApiResponse } from 'next';
import { ExecutiveRole } from '@/types/executive';

export interface User {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  organizationId?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Scenario {
  id: string;
  name: string;
  description: string;
  tags: string[];
  parameters: Record<string, unknown>;
  isTemplate: boolean;
  createdById: string;
  createdAt: Date;
  updatedAt: Date;
  createdBy?: User;
  sessions?: BoardroomSession[];
}

export interface BoardroomSession {
  id: string;
  name: string;
  scenarioId: string;
  status: 'scheduled' | 'active' | 'completed';
  scheduledFor?: Date;
  startedAt?: Date;
  endedAt?: Date;
  createdAt: Date;
  updatedAt: Date;
  scenario?: Scenario;
  participants?: Array<{
    user: User;
  }>;
  messages?: Array<Message & {
    participant?: {
      user: User;
    };
  }>;
  decisions?: Decision[];
  documents?: Document[];
}

export interface Message {
  id: string;
  content: string;
  agentType?: string;
  sessionId: string;
  participantId?: string;
  parentId?: string;
  metadata?: Record<string, unknown>;
  createdAt: Date;
  participant?: {
    user: User;
  };
  replies?: Message[];
}

export interface Decision {
  id: string;
  title: string;
  description: string;
  status: 'pending' | 'approved' | 'rejected';
  sessionId: string;
  votes?: Record<string, unknown>;
  rationale?: string;
  implementationPlan?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface Document {
  id: string;
  name: string;
  url: string;
  type: string;
  size: number;
  sessionId?: string;
  userId: string;
  createdAt: Date;
}

// Socket.IO types - Legacy definitions for Pages API compatibility
// Note: Newer Socket.IO types are defined in types/socket.ts
// These are kept for backwards compatibility with pages/api/socketio.ts
export interface NextApiResponseServerIO extends NextApiResponse {
  socket: NextApiResponse['socket'] & {
    server: {
      io?: import('socket.io').Server;
    };
  };
}

export interface SocketMessage {
  id: string;
  content: string;
  agentType?: string;
  timestamp: string;
  userId: string;
}

export interface SocketAgentStatus {
  agentType: string;
  status: 'thinking' | 'completed' | 'error';
  response?: string;
  timestamp: string;
}

export interface SocketUserEvent {
  userId: string;
  userName?: string;
  typing?: boolean;
  timestamp: string;
}

// Agent types - DEPRECATED: Use ExecutiveProfile from @/types
/** @deprecated Use ExecutiveProfile from @/types instead */
export interface AgentProfile {
  role: string;
  personality: string;
  expertise: string[];
  modelEnvVar: string;
  avatar: string;
  color: string;
}

export interface AgentResponse {
  response: string;
  agent: AgentProfile;
  timestamp: string;
  modelUsed: string;
  agentType: string;
  metadata: {
    tokensUsed: number;
    responseTime: number;
  };
}

export interface DecisionSynthesis {
  synthesis: string;
  timestamp: string;
  agentCount: number;
  confidence: 'High' | 'Medium' | 'Low';
}

// API request/response types
export interface BoardroomRequest {
  scenario: {
    id?: string;
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
  };
  query: string;
  includeAgents: ExecutiveRole[];
  companyName?: string;
  sessionId?: string;
}

export interface BoardroomResponse {
  sessionId: string;
  query: string;
  timestamp: string;
  scenario: {
    name: string;
    description: string;
    parameters?: Record<string, unknown>;
  };
  responses: Record<string, {
    summary: string;
    perspective: string;
    confidence: number;
    timestamp: string;
    agent: AgentProfile;
  }>;
  synthesis?: {
    recommendation: string;
    confidence: 'High' | 'Medium' | 'Low';
    agentCount: number;
    timestamp: string;
  };
  errors?: Error[];
}

// UI Component types
export interface ScenarioCardProps {
  scenario: Scenario;
  onEdit?: (scenario: Scenario) => void;
  onDelete?: (scenarioId: string) => void;
  onStart?: (scenarioId: string) => void;
}

export interface AgentMessageProps {
  agent: AgentProfile;
  message: string;
  timestamp: string;
  onReply?: (message: string) => void;
}

export interface SessionStatus {
  id: string;
  status: 'scheduled' | 'active' | 'completed';
  participantCount: number;
  startedAt?: Date;
  endedAt?: Date;
}

// Form types
export interface CreateScenarioForm {
  name: string;
  description: string;
  tags: string[];
  parameters: {
    budget?: number;
    timeline?: string;
    industry?: string;
    companySize?: number;
    [key: string]: unknown;
  };
}

export interface BoardroomSessionForm {
  name: string;
  scenarioId: string;
  includeAgents: ExecutiveRole[];
  scheduledFor?: Date;
}

// Auth types
export interface SessionUser {
  id: string;
  email: string;
  name?: string;
  image?: string;
  role: string;
  organizationId?: string;
}

// Error types
export interface ApiError {
  success: false;
  error: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccess<T = unknown> {
  success: true;
  data: T;
}

// Backwards compatibility aliases - gradual migration to @/types
// TODO: Remove these aliases after all imports are updated to use @/types

/** @deprecated Use ExecutiveProfile from @/types instead - will be removed in future version */
export type AgentProfileLegacy = AgentProfile;
