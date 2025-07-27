import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth/config';
import marketService from '@/lib/market/market-service';

export async function GET(request: NextRequest) {
  try {
    // Check authentication for market data access
    const session = await getServerSession(authOptions);
    if (!session) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    // Determine if user is in demo mode
    const isDemo = !!(session.user?.role === 'demo' || 
                     (session.user?.email && [
                       "demo@businessai.com",
                       "test@example.com", 
                       "guest@demo.com"
                     ].includes(session.user.email)));

    const { searchParams } = new URL(request.url);
    const endpoint = searchParams.get('endpoint') || 'overview';
    const symbols = searchParams.get('symbols')?.split(',') || ['AAPL', 'GOOGL', 'MSFT', 'TSLA', 'NVDA'];

    switch (endpoint) {
      case 'overview':
        const marketIntelligence = await marketService.getMarketIntelligence(symbols, isDemo);
        return NextResponse.json({
          success: true,
          data: marketIntelligence,
          timestamp: new Date().toISOString()
        });

      case 'stocks':
        if (isDemo) {
          // For demo users, return demo stock data
          const demoData = await marketService.getMarketIntelligence(symbols, true);
          return NextResponse.json({
            success: true,
            data: demoData.stocks,
            timestamp: new Date().toISOString()
          });
        } else {
          // For real users, get real stock data or fail
          const stocks = await marketService.getMultipleStocks(symbols);
          return NextResponse.json({
            success: true,
            data: stocks,
            timestamp: new Date().toISOString()
          });
        }

      case 'indices':
        if (isDemo) {
          const demoData = await marketService.getMarketIntelligence([], true);
          return NextResponse.json({
            success: true,
            data: demoData.indices,
            timestamp: new Date().toISOString()
          });
        } else {
          const indices = await marketService.getMarketIndicators();
          return NextResponse.json({
            success: true,
            data: indices,
            timestamp: new Date().toISOString()
          });
        }

      case 'news':
        if (isDemo) {
          const demoData = await marketService.getMarketIntelligence([], true);
          return NextResponse.json({
            success: true,
            data: demoData.news,
            timestamp: new Date().toISOString()
          });
        } else {
          const query = searchParams.get('query') || 'financial markets';
          const limit = parseInt(searchParams.get('limit') || '10');
          const news = await marketService.getFinancialNews(query, limit);
          return NextResponse.json({
            success: true,
            data: news,
            timestamp: new Date().toISOString()
          });
        }

      case 'sectors':
        if (isDemo) {
          const demoData = await marketService.getMarketIntelligence([], true);
          return NextResponse.json({
            success: true,
            data: demoData.sectorPerformance,
            timestamp: new Date().toISOString()
          });
        } else {
          const sectors = await marketService.getSectorPerformance();
          return NextResponse.json({
            success: true,
            data: sectors,
            timestamp: new Date().toISOString()
          });
        }

      case 'health':
        const health = await marketService.healthCheck();
        return NextResponse.json({
          success: true,
          data: health,
          timestamp: new Date().toISOString()
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid endpoint. Available: overview, stocks, indices, news, sectors, health'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Market intelligence API error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { action, symbols, query } = body;

    switch (action) {
      case 'analyze_portfolio':
        if (!symbols || !Array.isArray(symbols)) {
          return NextResponse.json({
            success: false,
            error: 'Symbols array is required for portfolio analysis'
          }, { status: 400 });
        }

        const portfolioData = await marketService.getMultipleStocks(symbols);
        const indices = await marketService.getMarketIndicators();
        
        // Calculate portfolio performance
        const totalValue = portfolioData.reduce((sum, stock) => sum + stock.price, 0);
        const totalChange = portfolioData.reduce((sum, stock) => sum + stock.change, 0);
        const avgChangePercent = portfolioData.reduce((sum, stock) => sum + stock.changePercent, 0) / portfolioData.length;

        return NextResponse.json({
          success: true,
          data: {
            portfolio: portfolioData,
            summary: {
              totalValue,
              totalChange,
              avgChangePercent,
              symbolCount: portfolioData.length
            },
            marketContext: indices,
            timestamp: new Date().toISOString()
          }
        });

      case 'market_sentiment':
        const newsQuery = query || 'stock market financial earnings recession inflation';
        const sentimentNews = await marketService.getFinancialNews(newsQuery, 20);
        
        // Calculate sentiment scores
        const sentimentCounts = sentimentNews.reduce((counts, news) => {
          counts[news.sentiment || 'neutral']++;
          return counts;
        }, { positive: 0, negative: 0, neutral: 0 });

        const totalNews = sentimentNews.length;
        const sentimentScore = totalNews > 0 
          ? (sentimentCounts.positive - sentimentCounts.negative) / totalNews 
          : 0;

        return NextResponse.json({
          success: true,
          data: {
            sentimentScore,
            sentimentCounts,
            news: sentimentNews,
            marketMood: sentimentScore > 0.1 ? 'bullish' : sentimentScore < -0.1 ? 'bearish' : 'neutral',
            timestamp: new Date().toISOString()
          }
        });

      default:
        return NextResponse.json({
          success: false,
          error: 'Invalid action. Available: analyze_portfolio, market_sentiment'
        }, { status: 400 });
    }
  } catch (error) {
    console.error('Market intelligence POST error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
