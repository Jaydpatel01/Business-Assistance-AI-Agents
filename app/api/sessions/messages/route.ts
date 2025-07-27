import { NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'
import { z } from 'zod'

// Message schema for validation
const MessageSchema = z.object({
  id: z.string(),
  agentType: z.string(),
  content: z.string(),
  timestamp: z.string().transform(str => new Date(str)),
  reasoning: z.string().optional()
})

const SessionMessageSchema = z.object({
  sessionId: z.string(),
  message: MessageSchema.optional(),
  messages: z.array(MessageSchema).optional()
})

export async function POST(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const body = await request.json()
    const validatedData = SessionMessageSchema.parse(body)
    const { sessionId, message, messages } = validatedData

    // Handle single message
    if (message) {
      // In a real implementation, this would save to the database
      // For now, we'll simulate the operation
      console.log(`Saving message to session ${sessionId}:`, message)
      
      return NextResponse.json({
        success: true,
        data: {
          messageId: message.id,
          sessionId,
          saved: true
        }
      })
    }

    // Handle multiple messages (batch save)
    if (messages) {
      console.log(`Saving ${messages.length} messages to session ${sessionId}:`, messages)
      
      return NextResponse.json({
        success: true,
        data: {
          sessionId,
          savedCount: messages.length,
          saved: true
        }
      })
    }

    return NextResponse.json(
      { success: false, error: 'No message or messages provided' },
      { status: 400 }
    )

  } catch (error) {
    console.error('Error saving session messages:', error)
    
    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { success: false, error: 'Invalid message data', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { success: false, error: 'Failed to save messages' },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    // Check authentication
    const session = await getServerSession(authOptions)
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      )
    }

    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get('sessionId')

    if (!sessionId) {
      return NextResponse.json(
        { success: false, error: 'Session ID required' },
        { status: 400 }
      )
    }

    // In a real implementation, this would fetch messages from the database
    // For now, we'll return empty array as placeholder
    console.log(`Fetching messages for session ${sessionId}`)
    
    return NextResponse.json({
      success: true,
      data: {
        sessionId,
        messages: [], // Placeholder - would be real messages from database
        count: 0
      }
    })

  } catch (error) {
    console.error('Error fetching session messages:', error)
    return NextResponse.json(
      { success: false, error: 'Failed to fetch messages' },
      { status: 500 }
    )
  }
}
