import yahooFinance from 'yahoo-finance2';
import axios from 'axios';

// Suppress Yahoo Finance survey notice
yahooFinance.suppressNotices(['yahooSurvey']);

// Types for market data
export interface StockData {
  symbol: string;
  price: number;
  change: number;
  changePercent: number;
  volume: number;
  marketCap?: number;
  pe?: number;
  timestamp: string;
}

export interface MarketNews {
  title: string;
  description: string;
  url: string;
  source: string;
  publishedAt: string;
  sentiment?: 'positive' | 'negative' | 'neutral';
}

export interface MarketIndicators {
  sp500: StockData;
  nasdaq: StockData;
  dow: StockData;
  vix: StockData;
}

export interface MarketIntelligence {
  stocks: StockData[];
  indices: MarketIndicators;
  news: MarketNews[];
  sectorPerformance: Record<string, number>;
  timestamp: string;
  isDemo?: boolean;
}

class MarketService {
  private newsApiKey?: string;

  constructor() {
    this.newsApiKey = process.env.NEWS_API_KEY;
    
    // Suppress Yahoo Finance survey notices
    yahooFinance.suppressNotices(['yahooSurvey']);
  }

  /**
   * Get comprehensive market intelligence
   * @param symbols Array of stock symbols to include
   * @param isDemo Whether to use demo data only
   */
  async getMarketIntelligence(symbols: string[] = [], isDemo: boolean = false): Promise<MarketIntelligence> {
    if (isDemo) {
      return this.getDemoMarketData(symbols);
    }

    try {
      const [stocks, indices, news, sectorPerf] = await Promise.all([
        this.getMultipleStocks(symbols),
        this.getMarketIndicators(),
        this.getFinancialNews('stock market financial earnings', 15),
        this.getSectorPerformance()
      ]);

      return {
        stocks,
        indices,
        news,
        sectorPerformance: sectorPerf,
        timestamp: new Date().toISOString(),
        isDemo: false
      };
    } catch (error) {
      console.error('Failed to get real market data:', error);
      // For real users, throw the error instead of falling back to demo data
      throw new Error('Market data service unavailable. Please try again later.');
    }
  }

  /**
   * Get demo market data for testing purposes
   */
  private getDemoMarketData(symbols: string[] = []): MarketIntelligence {
    const demoStocks: StockData[] = [
      { symbol: 'AAPL', price: 185.43, change: 2.15, changePercent: 1.17, volume: 45234567, timestamp: new Date().toISOString() },
      { symbol: 'GOOGL', price: 142.56, change: -1.23, changePercent: -0.86, volume: 23456789, timestamp: new Date().toISOString() },
      { symbol: 'MSFT', price: 378.85, change: 4.32, changePercent: 1.15, volume: 34567890, timestamp: new Date().toISOString() },
      { symbol: 'TSLA', price: 248.42, change: -5.67, changePercent: -2.23, volume: 56789012, timestamp: new Date().toISOString() },
      { symbol: 'NVDA', price: 875.28, change: 12.45, changePercent: 1.44, volume: 67890123, timestamp: new Date().toISOString() }
    ];

    const demoIndices: MarketIndicators = {
      sp500: { symbol: 'SPX', price: 4785.32, change: 15.23, changePercent: 0.32, volume: 0, timestamp: new Date().toISOString() },
      nasdaq: { symbol: 'IXIC', price: 15234.67, change: -23.45, changePercent: -0.15, volume: 0, timestamp: new Date().toISOString() },
      dow: { symbol: 'DJI', price: 37856.43, change: 45.67, changePercent: 0.12, volume: 0, timestamp: new Date().toISOString() },
      vix: { symbol: 'VIX', price: 18.45, change: -0.23, changePercent: -1.23, volume: 0, timestamp: new Date().toISOString() }
    };

    const demoNews: MarketNews[] = [
      {
        title: "Demo Market Update: Technology Sector Shows Strong Performance",
        description: "This is demonstration market news. In a real environment, this would show actual financial news and market analysis.",
        url: "#",
        source: "Demo Financial News",
        publishedAt: new Date().toISOString(),
        sentiment: 'positive'
      },
      {
        title: "Demo Analysis: Market Volatility Remains Low",
        description: "Sample market analysis for demonstration purposes. Real users would see current market intelligence and news.",
        url: "#",
        source: "Demo Market Analysis",
        publishedAt: new Date().toISOString(),
        sentiment: 'neutral'
      }
    ];

    return {
      stocks: symbols.length > 0 ? demoStocks.filter(s => symbols.includes(s.symbol)) : demoStocks,
      indices: demoIndices,
      news: demoNews,
      sectorPerformance: {
        'Technology': 1.25,
        'Healthcare': 0.87,
        'Finance': -0.23,
        'Energy': 2.14,
        'Consumer': 0.56
      },
      timestamp: new Date().toISOString(),
      isDemo: true
    };
  }

  /**
   * Get stock data for a symbol
   */
  async getStockData(symbol: string): Promise<StockData | null> {
    try {
      const quote = await yahooFinance.quote(symbol);
      
      return {
        symbol: quote.symbol || symbol,
        price: quote.regularMarketPrice || 0,
        change: quote.regularMarketChange || 0,
        changePercent: quote.regularMarketChangePercent || 0,
        volume: quote.regularMarketVolume || 0,
        marketCap: quote.marketCap,
        pe: quote.trailingPE,
        timestamp: new Date().toISOString()
      };
    } catch (error) {
      console.error(`Error fetching stock data for ${symbol}:`, error);
      return null;
    }
  }

  /**
   * Get multiple stock quotes
   */
  async getMultipleStocks(symbols: string[]): Promise<StockData[]> {
    const stocks: StockData[] = [];
    
    for (const symbol of symbols) {
      const stock = await this.getStockData(symbol);
      if (stock) {
        stocks.push(stock);
      }
    }
    
    return stocks;
  }

  /**
   * Get major market indices
   */
  async getMarketIndicators(): Promise<MarketIndicators> {
    const [sp500, nasdaq, dow, vix] = await Promise.all([
      this.getStockData('^GSPC'), // S&P 500
      this.getStockData('^IXIC'), // NASDAQ
      this.getStockData('^DJI'),  // Dow Jones
      this.getStockData('^VIX')   // VIX Volatility Index
    ]);

    return {
      sp500: sp500 || this.createFallbackStock('^GSPC'),
      nasdaq: nasdaq || this.createFallbackStock('^IXIC'),
      dow: dow || this.createFallbackStock('^DJI'),
      vix: vix || this.createFallbackStock('^VIX')
    };
  }

  /**
   * Get financial news
   */
  async getFinancialNews(query: string = 'financial markets', limit: number = 10): Promise<MarketNews[]> {
    if (!this.newsApiKey) {
      console.warn('No NEWS_API_KEY provided, returning mock news data');
      return this.getMockNews();
    }

    try {
      const response = await axios.get('https://newsapi.org/v2/everything', {
        params: {
          q: query,
          language: 'en',
          sortBy: 'publishedAt',
          pageSize: limit,
          apiKey: this.newsApiKey
        }
      });

      interface NewsArticle {
        title: string;
        description?: string;
        url: string;
        source: { name: string };
        publishedAt: string;
      }

      return response.data.articles.map((article: NewsArticle): MarketNews => ({
        title: article.title,
        description: article.description || '',
        url: article.url,
        source: article.source.name,
        publishedAt: article.publishedAt,
        sentiment: this.analyzeSentiment(article.title + ' ' + (article.description || ''))
      }));
    } catch (error) {
      console.error('Error fetching financial news:', error);
      return this.getMockNews();
    }
  }

  /**
   * Get sector performance data
   */
  async getSectorPerformance(): Promise<Record<string, number>> {
    const sectorETFs = {
      'Technology': 'XLK',
      'Healthcare': 'XLV',
      'Financial': 'XLF',
      'Energy': 'XLE',
      'Consumer Discretionary': 'XLY',
      'Industrials': 'XLI',
      'Consumer Staples': 'XLP',
      'Utilities': 'XLU',
      'Real Estate': 'XLRE'
    };

    const performance: Record<string, number> = {};

    for (const [sector, etf] of Object.entries(sectorETFs)) {
      const data = await this.getStockData(etf);
      if (data) {
        performance[sector] = data.changePercent;
      }
    }

    return performance;
  }

  /**
   * Simple sentiment analysis (basic implementation)
   */
  private analyzeSentiment(text: string): 'positive' | 'negative' | 'neutral' {
    const positiveWords = ['rise', 'up', 'gain', 'growth', 'bull', 'surge', 'rally', 'strong', 'beat', 'exceed'];
    const negativeWords = ['fall', 'down', 'loss', 'decline', 'bear', 'crash', 'drop', 'weak', 'miss', 'disappoint'];
    
    const lowerText = text.toLowerCase();
    const positiveCount = positiveWords.filter(word => lowerText.includes(word)).length;
    const negativeCount = negativeWords.filter(word => lowerText.includes(word)).length;
    
    if (positiveCount > negativeCount) return 'positive';
    if (negativeCount > positiveCount) return 'negative';
    return 'neutral';
  }

  /**
   * Create fallback stock data when API fails
   */
  private createFallbackStock(symbol: string): StockData {
    return {
      symbol,
      price: 0,
      change: 0,
      changePercent: 0,
      volume: 0,
      timestamp: new Date().toISOString()
    };
  }

  /**
   * Mock news data for fallback
   */
  private getMockNews(): MarketNews[] {
    return [
      {
        title: "Market Intelligence Demo - Real Data Unavailable",
        description: "This is a demonstration of market intelligence integration. In production, real financial news would be displayed here.",
        url: "#",
        source: "Demo Source",
        publishedAt: new Date().toISOString(),
        sentiment: 'neutral'
      }
    ];
  }

  /**
   * Health check for market data services
   */
  async healthCheck(): Promise<{ yahoo: boolean; news: boolean; timestamp: string }> {
    let yahooHealthy = false;
    let newsHealthy = false;

    try {
      const testStock = await this.getStockData('AAPL');
      yahooHealthy = testStock !== null;
    } catch (error) {
      console.error('Yahoo Finance health check failed:', error);
    }

    try {
      if (this.newsApiKey) {
        const testNews = await this.getFinancialNews('test', 1);
        newsHealthy = testNews.length > 0;
      }
    } catch (error) {
      console.error('News API health check failed:', error);
    }

    return {
      yahoo: yahooHealthy,
      news: newsHealthy,
      timestamp: new Date().toISOString()
    };
  }
}

export const marketService = new MarketService();
export default marketService;
