import { NextRequest, NextResponse } from 'next/server'
import { getServerSession } from 'next-auth'
import { authOptions } from '@/lib/auth/config'

// Top documents endpoint
export async function GET(request: NextRequest) {
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
    const userId = searchParams.get('userId') || session.user?.email
    const limit = parseInt(searchParams.get('limit') || '10')

    // Mock data for top documents
    // In a real implementation, this would query usage analytics from the database
    const topDocuments = [
      {
        id: 'doc-1',
        name: 'Q4 Financial Report.pdf',
        category: 'financial',
        usageCount: 15,
        lastUsed: new Date(Date.now() - 6 * 60 * 60 * 1000).toISOString(), // 6 hours ago
        size: 2048576,
        uploadDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc-2',
        name: 'Strategic Plan 2025.docx',
        category: 'strategic',
        usageCount: 12,
        lastUsed: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000).toISOString(), // 2 days ago
        size: 1048576,
        uploadDate: new Date(Date.now() - 45 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc-3',
        name: 'Tech Architecture Overview.pdf',
        category: 'technical',
        usageCount: 9,
        lastUsed: new Date(Date.now() - 1 * 24 * 60 * 60 * 1000).toISOString(), // 1 day ago
        size: 3072000,
        uploadDate: new Date(Date.now() - 20 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc-4',
        name: 'Market Research Data.xlsx',
        category: 'general',
        usageCount: 8,
        lastUsed: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000).toISOString(), // 3 days ago
        size: 512000,
        uploadDate: new Date(Date.now() - 60 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc-5',
        name: 'HR Policy Updates.docx',
        category: 'hr',
        usageCount: 6,
        lastUsed: new Date(Date.now() - 5 * 24 * 60 * 60 * 1000).toISOString(), // 5 days ago
        size: 256000,
        uploadDate: new Date(Date.now() - 15 * 24 * 60 * 60 * 1000).toISOString()
      },
      {
        id: 'doc-6',
        name: 'Competitive Analysis Report.pdf',
        category: 'strategic',
        usageCount: 5,
        lastUsed: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000).toISOString(), // 1 week ago
        size: 1536000,
        uploadDate: new Date(Date.now() - 25 * 24 * 60 * 60 * 1000).toISOString()
      }
    ]

    // Sort by usage count (most used first) and limit results
    const sortedDocuments = topDocuments
      .sort((a, b) => b.usageCount - a.usageCount)
      .slice(0, limit)

    return NextResponse.json({
      success: true,
      data: sortedDocuments,
      total: topDocuments.length,
      limit,
      userId
    })

  } catch (error) {
    console.error('Top documents error:', error)
    return NextResponse.json(
      { 
        success: false, 
        error: 'Failed to fetch top documents',
        details: error instanceof Error ? error.message : 'Unknown error'
      },
      { status: 500 }
    )
  }
}
