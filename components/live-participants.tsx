"use client"

import { useState, useEffect, useMemo } from "react"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { useSocket } from "@/hooks/use-socket"
import { Users, Wifi, WifiOff, Zap } from "lucide-react"

interface Participant {
  id: string
  name: string
  avatar?: string
  isTyping: boolean
  joinedAt: string
}

interface LiveParticipantsProps {
  sessionId: string
  currentUser?: {
    id: string
    name: string
    avatar?: string
  }
}

export function LiveParticipants({ sessionId, currentUser }: LiveParticipantsProps) {
  const [participants, setParticipants] = useState<Participant[]>([])
  const [typingUsers, setTypingUsers] = useState<Set<string>>(new Set())

  // Memoize currentUser to prevent unnecessary re-renders
  const memoizedCurrentUser = useMemo(() => currentUser, [currentUser])

  // Initialize socket hook with new interface
  const { 
    isConnected, 
    connectionHealth, 
    latency, 
    emit, 
    on, 
    off 
  } = useSocket(sessionId)

  // Set up event handlers using the new hook interface
  useEffect(() => {
    const handleUserJoined = (data: { userId: string; username: string; avatar?: string; timestamp: Date }) => {
      setParticipants((prev) => [
        ...prev.filter((p) => p.id !== data.userId),
        {
          id: data.userId,
          name: data.username || `User ${data.userId.slice(0, 8)}`,
          avatar: data.avatar,
          isTyping: false,
          joinedAt: data.timestamp.toISOString(),
        },
      ])
    }

    const handleUserLeft = (data: { userId: string; username: string; timestamp: Date }) => {
      setParticipants((prev) => prev.filter((p) => p.id !== data.userId))
      setTypingUsers((prev) => {
        const newSet = new Set(prev)
        newSet.delete(data.userId)
        return newSet
      })
    }

    const handleUserTyping = (data: { userId: string; username: string; isTyping: boolean }) => {
      if (data.isTyping) {
        setTypingUsers((prev) => new Set([...prev, data.userId]))
      } else {
        setTypingUsers((prev) => {
          const newSet = new Set(prev)
          newSet.delete(data.userId)
          return newSet
        })
      }
    }

    // Register event handlers
    on('user_joined', handleUserJoined)
    on('user_left', handleUserLeft)
    on('user_typing', handleUserTyping)

    return () => {
      // Cleanup event handlers
      off('user_joined', handleUserJoined)
      off('user_left', handleUserLeft)
      off('user_typing', handleUserTyping)
    }
  }, [on, off])

  useEffect(() => {
    if (isConnected && sessionId) {
      // Emit join session event using new interface
      emit('join_session', { sessionId, user: memoizedCurrentUser })
      
      // Add current user to participants
      if (memoizedCurrentUser) {
        setParticipants((prev) => [
          ...prev.filter((p) => p.id !== memoizedCurrentUser.id),
          {
            id: memoizedCurrentUser.id,
            name: memoizedCurrentUser.name,
            avatar: memoizedCurrentUser.avatar,
            isTyping: false,
            joinedAt: new Date().toISOString(),
          },
        ])
      }
    }

    return () => {
      if (sessionId && isConnected) {
        // Emit leave session event
        emit('leave_session', { sessionId })
      }
    }
  }, [isConnected, sessionId, memoizedCurrentUser, emit])

  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((n) => n[0])
      .join("")
      .toUpperCase()
      .slice(0, 2)
  }

  const formatJoinTime = (timestamp: string) => {
    const now = new Date()
    const joined = new Date(timestamp)
    const diffMs = now.getTime() - joined.getTime()
    const diffMins = Math.floor(diffMs / 60000)
    
    if (diffMins < 1) return "Just joined"
    if (diffMins < 60) return `${diffMins}m ago`
    const diffHours = Math.floor(diffMins / 60)
    return `${diffHours}h ago`
  }

  const getConnectionIcon = () => {
    if (!isConnected) return <WifiOff className="h-4 w-4 text-red-500" />;
    
    switch (connectionHealth) {
      case 'excellent':
        return <Wifi className="h-4 w-4 text-green-500" />;
      case 'good':
        return <Wifi className="h-4 w-4 text-blue-500" />;
      case 'poor':
        return <Wifi className="h-4 w-4 text-yellow-500" />;
      case 'critical':
        return <Wifi className="h-4 w-4 text-red-500" />;
      default:
        return <Wifi className="h-4 w-4 text-gray-500" />;
    }
  };

  const getConnectionStatus = () => {
    if (!isConnected) return 'Disconnected';
    return `${connectionHealth.charAt(0).toUpperCase() + connectionHealth.slice(1)} (${latency.current}ms)`;
  };

  return (
    <Card className="w-80">
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-sm">
          <Users className="h-4 w-4" />
          Live Participants ({participants.length})
          <div className="flex items-center gap-1" title={getConnectionStatus()}>
            {getConnectionIcon()}
            {connectionHealth === 'excellent' && (
              <Zap className="h-3 w-3 text-green-500" />
            )}
          </div>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        {participants.length === 0 ? (
          <div className="text-center text-muted-foreground text-sm py-4">
            No participants yet
          </div>
        ) : (
          participants.map((participant) => (
            <div
              key={participant.id}
              className="flex items-center gap-3 p-2 rounded-lg hover:bg-muted/50 transition-colors"
            >
              <Avatar className="h-8 w-8">
                <AvatarFallback className="text-xs">
                  {getInitials(participant.name)}
                </AvatarFallback>
              </Avatar>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <span className="text-sm font-medium truncate">
                    {participant.name}
                  </span>
                  {participant.id === currentUser?.id && (
                    <Badge variant="secondary" className="text-xs">
                      You
                    </Badge>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-xs text-muted-foreground">
                    {formatJoinTime(participant.joinedAt)}
                  </span>
                  {typingUsers.has(participant.id) && (
                    <span className="text-xs text-blue-500 animate-pulse">
                      typing...
                    </span>
                  )}
                </div>
              </div>
              <div className="flex items-center">
                <div className="h-2 w-2 rounded-full bg-green-500" />
              </div>
            </div>
          ))
        )}
        
        {typingUsers.size > 0 && (
          <div className="border-t pt-3">
            <div className="text-xs text-muted-foreground">
              {Array.from(typingUsers).length === 1 
                ? `${participants.find(p => typingUsers.has(p.id))?.name || 'Someone'} is typing...`
                : `${Array.from(typingUsers).length} people are typing...`
              }
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
