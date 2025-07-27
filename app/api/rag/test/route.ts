/**
 * RAG System Test API Endpoint
 * GET /api/rag/test - Test the RAG system functionality
 */

import { NextResponse } from 'next/server';
import { ragTester } from '@/lib/rag/test-suite';

export async function GET() {
  try {
    console.log('🧪 Starting RAG System Test...');
    
    const results = await ragTester.runAllTests();
    
    const passed = results.filter(r => r.status === 'PASS').length;
    const failed = results.filter(r => r.status === 'FAIL').length;
    const skipped = results.filter(r => r.status === 'SKIP').length;
    
    const summary = {
      total: results.length,
      passed,
      failed,
      skipped,
      success: failed === 0
    };

    return NextResponse.json({
      success: true,
      summary,
      results,
      message: failed === 0 
        ? '🎉 All RAG system tests passed! The implementation is ready for production.'
        : `⚠️ ${failed} test(s) failed. Please review the results.`,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('RAG test API error:', error);
    return NextResponse.json(
      {
        success: false,
        error: 'Failed to run RAG system tests',
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}
