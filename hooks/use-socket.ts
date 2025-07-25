import { useEffect, useRef, useCallback, useState, useMemo } from 'react';
import { io, Socket } from 'socket.io-client';

// Enhanced interfaces with better type safety
interface SocketEvents {
  message_received: (data: { 
    id: string; 
    content: string; 
    sender: string; 
    timestamp: Date;
    sessionId?: string;
  }) => void;
  user_joined: (data: { 
    userId: string; 
    username: string; 
    avatar?: string; 
    timestamp: Date; 
  }) => void;
  user_left: (data: { 
    userId: string; 
    username: string; 
    timestamp: Date; 
  }) => void;
  user_typing: (data: { 
    userId: string; 
    username: string; 
    isTyping: boolean; 
  }) => void;
  agent_status: (data: { 
    agentId: string; 
    status: 'online' | 'offline' | 'processing'; 
    timestamp: Date; 
  }) => void;
  session_progress: (data: { 
    sessionId: string; 
    progress: number; 
    stage: string; 
    metadata?: Record<string, unknown>; 
  }) => void;
  error: (error: { 
    type: string; 
    message: string; 
    code?: string; 
    details?: unknown; 
  }) => void;
  connect: () => void;
  disconnect: (reason: string) => void;
  connect_error: (error: Error) => void;
  reconnect: (attemptNumber: number) => void;
  reconnect_error: (error: Error) => void;
  reconnect_failed: () => void;
}

type ConnectionState = 'connecting' | 'connected' | 'disconnected' | 'error' | 'offline';

interface SocketLatency {
  current: number;
  average: number;
  measurements: number[];
}

interface SocketConfig {
  url?: string;
  transports?: ('websocket' | 'polling')[];
  forceNew?: boolean;
  reconnection?: boolean;
  reconnectionAttempts?: number;
  reconnectionDelay?: number;
  reconnectionDelayMax?: number;
  maxReconnectionAttempts?: number;
  timeout?: number;
  autoConnect?: boolean;
}

interface UseSocketReturn {
  socket: Socket | null;
  isConnected: boolean;
  connectionState: ConnectionState;
  latency: SocketLatency;
  error: string | null;
  isOnline: boolean;
  reconnectionAttempts: number;
  connectionHealth: 'excellent' | 'good' | 'poor' | 'critical';
  emit: (event: string, data?: unknown) => boolean;
  on: <K extends keyof SocketEvents>(event: K, handler: SocketEvents[K]) => void;
  off: <K extends keyof SocketEvents>(event: K, handler?: SocketEvents[K]) => void;
  connect: () => void;
  disconnect: () => void;
  clearError: () => void;
  refreshToken: () => Promise<boolean>;
}

const DEFAULT_CONFIG: SocketConfig = {
  transports: ['websocket', 'polling'],
  forceNew: false,
  reconnection: true,
  reconnectionAttempts: 5,
  reconnectionDelay: 1000,
  reconnectionDelayMax: 5000,
  timeout: 20000,
  autoConnect: true,
};

export function useSocket(
  sessionId?: string,
  config: SocketConfig = {}
): UseSocketReturn {
  // Stable refs to prevent recreation
  const socketRef = useRef<Socket | null>(null);
  const eventsRef = useRef<Map<string, Set<(...args: unknown[]) => void>>>(new Map());
  const latencyTimerRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectTimerRef = useRef<NodeJS.Timeout | null>(null);
  const isUnmountedRef = useRef(false);

  // State management
  const [connectionState, setConnectionState] = useState<ConnectionState>('disconnected');
  const [latency, setLatency] = useState<SocketLatency>({
    current: 0,
    average: 0,
    measurements: []
  });
  const [error, setError] = useState<string | null>(null);
  const [isOnline, setIsOnline] = useState(typeof navigator !== 'undefined' ? navigator.onLine : true);
  const [reconnectionAttempts, setReconnectionAttempts] = useState(0);

  // Derived state
  const isConnected = connectionState === 'connected';

  // Online/offline detection
  useEffect(() => {
    const handleOnline = () => {
      setIsOnline(true);
      if (socketRef.current?.disconnected) {
        socketRef.current.connect();
      }
    };

    const handleOffline = () => {
      setIsOnline(false);
      setConnectionState('offline');
    };

    if (typeof window !== 'undefined') {
      window.addEventListener('online', handleOnline);
      window.addEventListener('offline', handleOffline);

      return () => {
        window.removeEventListener('online', handleOnline);
        window.removeEventListener('offline', handleOffline);
      };
    }
  }, []);

  // Enhanced latency monitoring
  const measureLatency = useCallback(() => {
    if (!socketRef.current?.connected || isUnmountedRef.current) return;

    const startTime = Date.now();
    
    const timeoutId = setTimeout(() => {
      if (!isUnmountedRef.current) {
        setError('Latency measurement timeout');
      }
    }, 5000);

    socketRef.current.emit('ping', startTime, () => {
      clearTimeout(timeoutId);
      
      if (isUnmountedRef.current) return;

      const currentLatency = Date.now() - startTime;
      
      setLatency(prev => {
        const newMeasurements = [...prev.measurements, currentLatency].slice(-10);
        const newAverage = newMeasurements.reduce((a, b) => a + b, 0) / newMeasurements.length;
        
        return {
          current: currentLatency,
          average: Math.round(newAverage),
          measurements: newMeasurements
        };
      });
    });

    // Schedule next measurement
    if (!isUnmountedRef.current) {
      latencyTimerRef.current = setTimeout(measureLatency, 10000);
    }
  }, []);

  // Enhanced error handling with recovery strategies
  const handleError = useCallback((errorMsg: string, errorDetails?: unknown) => {
    if (isUnmountedRef.current) return;
    
    console.error('Socket error:', errorMsg, errorDetails);
    setError(errorMsg);
    setConnectionState('error');

    // Implement recovery strategies
    if (errorMsg.includes('authentication') || errorMsg.includes('unauthorized')) {
      // Enhanced token refresh logic
      const token = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('token_expiry');
      
      if (token && tokenExpiry && Date.now() < parseInt(tokenExpiry)) {
        // Token is still valid, retry connection
        if (socketRef.current) {
          socketRef.current.auth = { token };
          socketRef.current.connect();
        }
      } else {
        // Token expired or missing, trigger refresh
        setError('Authentication failed - token refresh required');
        // Dispatch custom event for token refresh
        window.dispatchEvent(new CustomEvent('socket:auth-required'));
      }
    } else if (errorMsg.includes('timeout')) {
      // Handle timeout errors - attempt reconnection with backoff
      if (reconnectionAttempts < (config.maxReconnectionAttempts || 5)) {
        const delay = Math.min(1000 * Math.pow(2, reconnectionAttempts), 10000);
        reconnectTimerRef.current = setTimeout(() => {
          if (!isUnmountedRef.current && socketRef.current) {
            socketRef.current.connect();
          }
        }, delay);
      }
    }
  }, [reconnectionAttempts, config.maxReconnectionAttempts]);

  // Stable event handlers
  const setupSocketEvents = useCallback((socket: Socket) => {
    // Connection events
    socket.on('connect', () => {
      if (isUnmountedRef.current) return;
      setConnectionState('connected');
      setError(null);
      setReconnectionAttempts(0);
      measureLatency();
    });

    socket.on('disconnect', (reason: string) => {
      if (isUnmountedRef.current) return;
      setConnectionState('disconnected');
      
      if (latencyTimerRef.current) {
        clearTimeout(latencyTimerRef.current);
        latencyTimerRef.current = null;
      }

      // Handle different disconnect reasons
      if (reason === 'io server disconnect') {
        // Server initiated disconnect - don't reconnect automatically
        setError('Disconnected by server');
      } else if (reason === 'transport error') {
        setError('Connection transport error');
      }
    });

    socket.on('connect_error', (error: Error) => {
      if (isUnmountedRef.current) return;
      handleError(`Connection failed: ${error.message}`, error);
    });

    socket.on('reconnect', () => {
      if (isUnmountedRef.current) return;
      setReconnectionAttempts(0);
      setError(null);
    });

    socket.on('reconnect_error', (error: Error) => {
      if (isUnmountedRef.current) return;
      setReconnectionAttempts(prev => prev + 1);
      handleError(`Reconnection failed: ${error.message}`, error);
    });

    socket.on('reconnect_failed', () => {
      if (isUnmountedRef.current) return;
      handleError('Failed to reconnect after maximum attempts');
    });

    // Error handling for socket events
    socket.on('error', (error: Error) => {
      if (isUnmountedRef.current) return;
      handleError(error.message || 'Socket error', error);
    });

  }, [handleError, measureLatency]);

  // Initialize socket connection
  const initializeSocket = useCallback(() => {
    if (socketRef.current || isUnmountedRef.current || !isOnline) return;

    try {
      const token = localStorage.getItem('auth_token');
      const tokenExpiry = localStorage.getItem('token_expiry');
      
      // Check token expiration
      if (tokenExpiry && Date.now() > parseInt(tokenExpiry)) {
        setError('Authentication token expired - please refresh');
        return;
      }
      
      if (!token) {
        setError('Authentication token not found');
        return;
      }

      const mergedConfig = { ...DEFAULT_CONFIG, ...config };
      
      // Enhanced environment-aware URL configuration
      const getSocketUrl = () => {
        if (mergedConfig.url) return mergedConfig.url;
        if (process.env.NEXT_PUBLIC_SOCKET_URL) return process.env.NEXT_PUBLIC_SOCKET_URL;
        
        // Environment-specific defaults
        if (process.env.NODE_ENV === 'production') {
          return window.location.protocol === 'https:' 
            ? `wss://${window.location.host}`
            : `ws://${window.location.host}`;
        }
        
        return window.location.protocol === 'https:' 
          ? 'wss://localhost:3000' 
          : 'ws://localhost:3000';
      };
      
      const socketUrl = getSocketUrl();

      setConnectionState('connecting');
      setError(null);

      const socket = io(socketUrl, {
        ...mergedConfig,
        auth: { token },
        query: sessionId ? { sessionId } : undefined,
      });

      socketRef.current = socket;
      setupSocketEvents(socket);

    } catch (error) {
      handleError(`Failed to initialize socket: ${error instanceof Error ? error.message : 'Unknown error'}`, error);
    }
  }, [sessionId, config, setupSocketEvents, handleError, isOnline]);

  // Public API methods
  const emit = useCallback((event: string, data?: unknown): boolean => {
    if (!socketRef.current?.connected) {
      console.warn(`Cannot emit '${event}': socket not connected`);
      return false;
    }

    try {
      socketRef.current.emit(event, data);
      return true;
    } catch (error) {
      handleError(`Failed to emit '${event}': ${error instanceof Error ? error.message : 'Unknown error'}`, error);
      return false;
    }
  }, [handleError]);

  const on = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler: SocketEvents[K]
  ) => {
    const eventName = event as string;
    if (!eventsRef.current.has(eventName)) {
      eventsRef.current.set(eventName, new Set());
    }
    eventsRef.current.get(eventName)!.add(handler as (...args: unknown[]) => void);

    if (socketRef.current) {
      socketRef.current.on(eventName, handler);
    }
  }, []);

  const off = useCallback(<K extends keyof SocketEvents>(
    event: K,
    handler?: SocketEvents[K]
  ) => {
    const eventName = event as string;
    if (handler) {
      eventsRef.current.get(eventName)?.delete(handler as (...args: unknown[]) => void);
      if (socketRef.current) {
        socketRef.current.off(eventName, handler);
      }
    } else {
      eventsRef.current.delete(eventName);
      if (socketRef.current) {
        socketRef.current.off(eventName);
      }
    }
  }, []);

  const connect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.connect();
    } else {
      initializeSocket();
    }
  }, [initializeSocket]);

  const disconnect = useCallback(() => {
    if (socketRef.current) {
      socketRef.current.disconnect();
    }
  }, []);

  const clearError = useCallback(() => {
    setError(null);
  }, []);

  // Connection health assessment based on latency and error frequency
  const connectionHealth = useMemo(() => {
    if (!isConnected) return 'critical';
    if (latency.average < 100) return 'excellent';
    if (latency.average < 300) return 'good';
    if (latency.average < 800) return 'poor';
    return 'critical';
  }, [isConnected, latency.average]);

  // Token refresh functionality
  const refreshToken = useCallback(async (): Promise<boolean> => {
    try {
      // In a real app, this would call your auth service
      // For now, we'll simulate token refresh
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });
      
      if (response.ok) {
        const { token, expiry } = await response.json();
        localStorage.setItem('auth_token', token);
        localStorage.setItem('token_expiry', expiry.toString());
        
        // Reconnect with new token
        if (socketRef.current) {
          socketRef.current.auth = { token };
          socketRef.current.connect();
        }
        return true;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
    }
    return false;
  }, []);

  // Initialize on mount and handle cleanup
  useEffect(() => {
    isUnmountedRef.current = false;
    const currentEventsRef = eventsRef.current;
    
    if (isOnline) {
      initializeSocket();
    }

    return () => {
      isUnmountedRef.current = true;
      
      // Clear all timers
      if (latencyTimerRef.current) {
        clearTimeout(latencyTimerRef.current);
      }
      if (reconnectTimerRef.current) {
        clearTimeout(reconnectTimerRef.current);
      }

      // Cleanup socket
      if (socketRef.current) {
        // Remove all custom event listeners using captured ref
        currentEventsRef.forEach((handlers, event) => {
          handlers.forEach(handler => {
            socketRef.current?.off(event, handler);
          });
        });
        
        socketRef.current.disconnect();
        socketRef.current = null;
      }

      // Clear refs
      currentEventsRef.clear();
    };
  }, [initializeSocket, isOnline]);

  return {
    socket: socketRef.current,
    isConnected,
    connectionState,
    latency,
    error,
    isOnline,
    reconnectionAttempts,
    connectionHealth,
    emit,
    on,
    off,
    connect,
    disconnect,
    clearError,
    refreshToken,
  };
}
