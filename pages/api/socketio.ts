import { Server as NetServer } from 'http'
import { NextApiRequest } from 'next'
import { Server as ServerIO, Socket } from 'socket.io'
import { NextApiResponseServerIO, SocketMessage, SocketAgentStatus } from '@/lib/types'

/**
 * IMPORTANT: This Pages API route is intentionally maintained alongside App Router
 * 
 * Why this exists in a hybrid architecture:
 * - Socket.IO servers are not directly supported in Next.js App Router
 * - Real-time features (live participants, messaging) require WebSocket connections
 * - This provides essential real-time functionality for the boardroom experience
 * 
 * Used by:
 * - hooks/use-socket.ts (client connection)
 * - components/live-participants.tsx (real-time participant tracking)
 * 
 * Migration note: Moving to App Router would require external WebSocket service
 * or custom server setup. Current hybrid approach is intentional and functional.
 */

export const config = {
  api: {
    bodyParser: false,
  },
}

interface SessionMessage {
  id: string;
  agentType: string;
  content: string;
  timestamp: Date | string;
  reasoning?: string;
}

interface SessionData {
  sessionId: string;
  message?: string;
  agentType?: string;
  timestamp?: string;
  userName?: string;
  progress?: number;
  milestone?: string;
  response?: string;
}

const SocketHandler = async (req: NextApiRequest, res: NextApiResponseServerIO) => {
  if (res.socket.server.io) {
    console.log('Socket is already running')
  } else {
    console.log('Socket is initializing')
    const httpServer: NetServer = res.socket.server as NetServer
    const io = new ServerIO(httpServer, {
      path: '/api/socketio',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_APP_URL || "http://localhost:3000",
        methods: ["GET", "POST"],
        credentials: true
      }
    })
    
    // Authentication middleware for socket connections
    io.use(async (socket, next) => {
      try {
        // Extract token from handshake headers or query
        const token = socket.handshake.auth.token || socket.handshake.headers.authorization;
        
        if (!token) {
          console.log('Socket connection rejected: No token provided');
          return next(new Error('Authentication required'));
        }

        // Verify the token (you might need to adapt this based on your auth setup)
        // For now, we'll accept any token that looks valid
        if (typeof token === 'string' && token.length > 0) {
          console.log('Socket connection authenticated:', socket.id);
          next();
        } else {
          console.log('Socket connection rejected: Invalid token');
          next(new Error('Invalid authentication token'));
        }
      } catch (error) {
        console.error('Socket authentication error:', error);
        next(new Error('Authentication failed'));
      }
    });
    
    io.on('connection', (socket: Socket) => {
      console.log('Authenticated client connected:', socket.id)
      
      // Latency measurement
      socket.on('ping', (timestamp: number) => {
        socket.emit('pong', timestamp)
      })
      
      // Join boardroom session (multiple event names for compatibility)
      socket.on('join_session', (sessionId: string) => {
        socket.join(`session-${sessionId}`)
        socket.to(`session-${sessionId}`).emit('user_joined', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        })
        console.log(`User ${socket.id} joined session ${sessionId}`)
      })

      socket.on('join-session', (data: { sessionId: string }) => {
        const sessionId = data.sessionId
        socket.join(`session-${sessionId}`)
        socket.to(`session-${sessionId}`).emit('user_joined', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        })
        console.log(`User ${socket.id} joined session ${sessionId}`)
      })
      
      // Leave boardroom session (multiple event names for compatibility)
      socket.on('leave_session', (sessionId: string) => {
        socket.leave(`session-${sessionId}`)
        socket.to(`session-${sessionId}`).emit('user_left', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        })
        console.log(`User ${socket.id} left session ${sessionId}`)
      })

      socket.on('leave-session', (data: { sessionId: string }) => {
        const sessionId = data.sessionId
        socket.leave(`session-${sessionId}`)
        socket.to(`session-${sessionId}`).emit('user_left', {
          userId: socket.id,
          timestamp: new Date().toISOString()
        })
        console.log(`User ${socket.id} left session ${sessionId}`)
      })
      
      // Real-time message broadcasting
      socket.on('message', (data: SessionData) => {
        const { sessionId, message, agentType, timestamp } = data
        socket.to(`session-${sessionId}`).emit('message_received', {
          id: `${Date.now()}-${socket.id}`,
          content: message,
          agentType,
          timestamp,
          userId: socket.id
        } as SocketMessage)
      })

      // New real-time message sending
      socket.on('send-message', (data: { sessionId: string; message: SessionMessage }) => {
        const { sessionId, message } = data
        socket.to(`session-${sessionId}`).emit('new-message', message)
        console.log(`Message broadcast to session ${sessionId}:`, message.content)
      })
      
      // AI agent response streaming
      socket.on('agent_thinking', (data: SessionData) => {
        const { sessionId, agentType } = data
        socket.to(`session-${sessionId}`).emit('agent_status', {
          agentType,
          status: 'thinking',
          timestamp: new Date().toISOString()
        } as SocketAgentStatus)
      })
      
      socket.on('agent_response', (data: SessionData) => {
        const { sessionId, agentType, response } = data
        socket.to(`session-${sessionId}`).emit('agent_status', {
          agentType,
          status: 'completed',
          response,
          timestamp: new Date().toISOString()
        } as SocketAgentStatus)
      })

      // New agent response broadcasting
      socket.on('agent-response', (data: { sessionId: string; message: SessionMessage }) => {
        const { sessionId, message } = data
        socket.to(`session-${sessionId}`).emit('agent-response', message)
        console.log(`Agent response broadcast to session ${sessionId}:`, message.agentType)
      })
      
      // Session progress updates
      socket.on('progress_update', (data: SessionData) => {
        const { sessionId, progress, milestone } = data
        socket.to(`session-${sessionId}`).emit('session_progress', {
          progress,
          milestone,
          timestamp: new Date().toISOString()
        })
      })

      socket.on('progress-update', (data: { sessionId: string; progress: number; milestone?: string }) => {
        const { sessionId, progress, milestone } = data
        socket.to(`session-${sessionId}`).emit('progress-update', {
          progress,
          milestone,
          timestamp: new Date().toISOString()
        })
      })
      
      // Typing indicators
      socket.on('typing_start', (data: SessionData) => {
        const { sessionId, userName } = data
        socket.to(`session-${sessionId}`).emit('user_typing', {
          userId: socket.id,
          userName,
          typing: true
        })
      })
      
      socket.on('typing_stop', (data: SessionData) => {
        const { sessionId } = data
        socket.to(`session-${sessionId}`).emit('user_typing', {
          userId: socket.id,
          typing: false
        })
      })

      // New typing indicator
      socket.on('typing', (data: { sessionId: string; isTyping: boolean }) => {
        const { sessionId, isTyping } = data
        socket.to(`session-${sessionId}`).emit('user-typing', {
          userId: socket.id,
          isTyping,
          timestamp: new Date().toISOString()
        })
      })
      
      // Handle disconnection
      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id)
      })
    })
    
    res.socket.server.io = io
  }
  res.end()
}

export default SocketHandler
