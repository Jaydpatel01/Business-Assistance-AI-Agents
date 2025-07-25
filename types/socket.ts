// Socket.IO types and enums for real-time communication

import { MessageType } from './message';
import { ExecutiveRole } from './executive';

export enum SocketEvent {
  // Connection events
  CONNECT = 'connect',
  DISCONNECT = 'disconnect',
  CONNECT_ERROR = 'connect_error',
  RECONNECT = 'reconnect',
  RECONNECT_ERROR = 'reconnect_error',
  RECONNECT_FAILED = 'reconnect_failed',
  
  // Session events
  JOIN_SESSION = 'join_session',
  LEAVE_SESSION = 'leave_session',
  SESSION_UPDATE = 'session_update',
  
  // Message events
  MESSAGE_SEND = 'message_send',
  MESSAGE_RECEIVED = 'message_received',
  MESSAGE_UPDATED = 'message_updated',
  MESSAGE_DELETED = 'message_deleted',
  
  // User activity events
  USER_JOINED = 'user_joined',
  USER_LEFT = 'user_left',
  USER_TYPING = 'user_typing',
  USER_STOPPED_TYPING = 'user_stopped_typing',
  
  // Agent events
  AGENT_STATUS = 'agent_status',
  AGENT_THINKING = 'agent_thinking',
  AGENT_RESPONSE = 'agent_response',
  
  // System events
  SESSION_PROGRESS = 'session_progress',
  ERROR = 'error',
  PING = 'ping',
  PONG = 'pong'
}

export enum SocketConnectionState {
  CONNECTING = 'connecting',
  CONNECTED = 'connected',
  DISCONNECTED = 'disconnected',
  RECONNECTING = 'reconnecting',
  ERROR = 'error',
  OFFLINE = 'offline'
}

export enum SocketAgentStatus {
  ONLINE = 'online',
  OFFLINE = 'offline',
  THINKING = 'thinking',
  PROCESSING = 'processing',
  ERROR = 'error'
}

// Socket message payload interfaces
export interface SocketMessage {
  id: string;
  type: MessageType;
  content: string;
  senderId: string;
  senderType: 'user' | 'agent' | 'system';
  agentType?: ExecutiveRole;
  sessionId: string;
  timestamp: Date;
  metadata?: {
    processingTime?: number;
    confidence?: number;
    reasoning?: string;
  };
}

export interface SocketUserEvent {
  userId: string;
  userName: string;
  avatar?: string;
  sessionId: string;
  timestamp: Date;
  metadata?: {
    userAgent?: string;
    ipAddress?: string;
    location?: string;
  };
}

export interface SocketTypingEvent {
  userId: string;
  userName: string;
  sessionId: string;
  isTyping: boolean;
  timestamp: Date;
}

export interface SocketAgentEvent {
  agentId: string;
  agentType: ExecutiveRole;
  status: SocketAgentStatus;
  sessionId: string;
  timestamp: Date;
  response?: string;
  reasoning?: string;
  metadata?: {
    processingTime?: number;
    tokensUsed?: number;
    modelUsed?: string;
    confidence?: number;
  };
}

export interface SocketSessionProgress {
  sessionId: string;
  progress: number; // 0-100
  stage: string;
  milestone?: string;
  timestamp: Date;
  metadata?: {
    estimatedCompletion?: Date;
    participantCount?: number;
    messagesCount?: number;
  };
}

export interface SocketError {
  type: string;
  message: string;
  code?: string;
  sessionId?: string;
  userId?: string;
  timestamp: Date;
  details?: Record<string, unknown>;
}

// Socket server configuration
export interface SocketServerConfig {
  port?: number;
  path?: string;
  cors?: {
    origin: string | string[];
    methods: string[];
    credentials: boolean;
  };
  pingTimeout?: number;
  pingInterval?: number;
  maxHttpBufferSize?: number;
  allowEIO3?: boolean;
}

// Socket client configuration
export interface SocketClientConfig {
  url?: string;
  transports?: ('websocket' | 'polling')[];
  autoConnect?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  timeout?: number;
  forceNew?: boolean;
  auth?: {
    token?: string;
    userId?: string;
  };
  query?: Record<string, string>;
}

// Socket connection info
export interface SocketConnectionInfo {
  id: string;
  userId?: string;
  sessionId?: string;
  connectedAt: Date;
  lastPingAt?: Date;
  transport: 'websocket' | 'polling';
  userAgent?: string;
  ipAddress?: string;
  rooms: string[];
  authenticated: boolean;
}

// Socket room management
export interface SocketRoom {
  id: string;
  name: string;
  type: 'session' | 'private' | 'broadcast';
  participants: {
    socketId: string;
    userId: string;
    joinedAt: Date;
    role?: 'moderator' | 'participant' | 'observer';
  }[];
  metadata?: {
    sessionId?: string;
    createdBy?: string;
    maxParticipants?: number;
    isPrivate?: boolean;
  };
}

// Socket analytics and monitoring
export interface SocketAnalytics {
  totalConnections: number;
  activeConnections: number;
  totalMessages: number;
  messagesByType: Record<SocketEvent, number>;
  averageLatency: number;
  reconnectionRate: number;
  errorRate: number;
  peakConcurrentConnections: number;
  uptimePercentage: number;
  lastUpdated: Date;
}

// Socket middleware types
export interface SocketMiddleware {
  name: string;
  execute: (socket: unknown, next: (error?: Error) => void) => void | Promise<void>;
  priority?: number;
}

export interface SocketAuthData {
  token: string;
  userId?: string;
  sessionId?: string;
  permissions?: string[];
  expiresAt?: Date;
}

// Socket event handlers type map
export interface SocketEventHandlers {
  [SocketEvent.CONNECT]: () => void;
  [SocketEvent.DISCONNECT]: (reason: string) => void;
  [SocketEvent.CONNECT_ERROR]: (error: Error) => void;
  [SocketEvent.RECONNECT]: (attemptNumber: number) => void;
  [SocketEvent.RECONNECT_ERROR]: (error: Error) => void;
  [SocketEvent.RECONNECT_FAILED]: () => void;
  [SocketEvent.JOIN_SESSION]: (data: { sessionId: string; userId: string }) => void;
  [SocketEvent.LEAVE_SESSION]: (data: { sessionId: string; userId: string }) => void;
  [SocketEvent.MESSAGE_RECEIVED]: (message: SocketMessage) => void;
  [SocketEvent.USER_JOINED]: (user: SocketUserEvent) => void;
  [SocketEvent.USER_LEFT]: (user: SocketUserEvent) => void;
  [SocketEvent.USER_TYPING]: (typing: SocketTypingEvent) => void;
  [SocketEvent.AGENT_STATUS]: (agent: SocketAgentEvent) => void;
  [SocketEvent.SESSION_PROGRESS]: (progress: SocketSessionProgress) => void;
  [SocketEvent.ERROR]: (error: SocketError) => void;
  [SocketEvent.PING]: (data: number) => void;
  [SocketEvent.PONG]: (data: number) => void;
}
