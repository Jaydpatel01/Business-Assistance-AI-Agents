// Message types and enums for the boardroom system

export enum MessageType {
  USER_MESSAGE = 'user_message',
  AGENT_RESPONSE = 'agent_response',
  SYSTEM_NOTIFICATION = 'system_notification',
  DECISION_REQUEST = 'decision_request',
  DECISION_RESPONSE = 'decision_response',
  SESSION_UPDATE = 'session_update',
  TYPING_INDICATOR = 'typing_indicator',
  ERROR_MESSAGE = 'error_message',
  SYNTHESIS_RESULT = 'synthesis_result'
}

export enum MessageStatus {
  PENDING = 'pending',
  SENT = 'sent',
  DELIVERED = 'delivered',
  READ = 'read',
  FAILED = 'failed',
  PROCESSING = 'processing'
}

export enum MessagePriority {
  LOW = 'low',
  NORMAL = 'normal',
  HIGH = 'high',
  URGENT = 'urgent'
}

export interface Message {
  id: string;
  type: MessageType;
  content: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  agentType?: string;
  sessionId: string;
  parentId?: string; // For threaded conversations
  status: MessageStatus;
  priority: MessagePriority;
  timestamp: Date;
  updatedAt?: Date;
  readAt?: Date;
  metadata?: {
    tokensUsed?: number;
    processingTime?: number;
    confidence?: number;
    reasoning?: string;
    attachments?: MessageAttachment[];
    reactions?: MessageReaction[];
    tags?: string[];
  };
}

export interface MessageAttachment {
  id: string;
  name: string;
  type: 'image' | 'document' | 'audio' | 'video' | 'link';
  url: string;
  size?: number;
  mimeType?: string;
  thumbnail?: string;
  metadata?: Record<string, unknown>;
}

export interface MessageReaction {
  id: string;
  userId: string;
  reaction: string; // emoji or reaction type
  timestamp: Date;
}

export interface MessageThread {
  id: string;
  parentMessageId: string;
  messages: Message[];
  participantCount: number;
  lastActivityAt: Date;
  isActive: boolean;
}

export interface MessageHistory {
  sessionId: string;
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  cursor?: string;
  filters?: {
    type?: MessageType[];
    senderType?: ('user' | 'agent' | 'system')[];
    agentType?: string[];
    dateRange?: {
      start: Date;
      end: Date;
    };
  };
}

export interface MessageAnalytics {
  sessionId: string;
  totalMessages: number;
  messagesByType: Record<MessageType, number>;
  messagesBySender: Record<string, number>;
  averageResponseTime: number;
  participationRate: number;
  sentimentAnalysis?: {
    positive: number;
    neutral: number;
    negative: number;
  };
  topKeywords: string[];
  engagementMetrics: {
    reactionsCount: number;
    threadsCount: number;
    averageMessageLength: number;
  };
}

// Real-time messaging types
export interface TypingIndicator {
  userId: string;
  userName: string;
  sessionId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface MessageDeliveryStatus {
  messageId: string;
  deliveredTo: {
    userId: string;
    deliveredAt: Date;
    readAt?: Date;
  }[];
  failedDeliveries: {
    userId: string;
    error: string;
    attemptedAt: Date;
  }[];
}

// Message search and filtering
export interface MessageSearchQuery {
  query?: string;
  sessionId?: string;
  type?: MessageType[];
  senderType?: ('user' | 'agent' | 'system')[];
  agentType?: string[];
  dateRange?: {
    start: Date;
    end: Date;
  };
  hasAttachments?: boolean;
  priority?: MessagePriority[];
  limit?: number;
  offset?: number;
  sortBy?: 'timestamp' | 'relevance';
  sortOrder?: 'asc' | 'desc';
}

export interface MessageSearchResult {
  messages: Message[];
  totalCount: number;
  hasMore: boolean;
  searchTime: number;
  suggestions?: string[];
}
