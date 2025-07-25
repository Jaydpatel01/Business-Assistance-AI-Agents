import { createHash } from 'crypto';

interface CachedResponse {
  id: string;
  agentType: string;
  content: string;
  reasoning?: string;
  timestamp: string;
  context: string;
  scenario: string;
}

class AgentResponseCache {
  private cache = new Map<string, CachedResponse>();
  private maxCacheSize = 100;
  private cacheTimeout = 1000 * 60 * 30; // 30 minutes

  private generateCacheKey(agentType: string, context: string, scenario: string): string {
    const input = `${agentType}:${context}:${scenario}`;
    return createHash('sha256').update(input).digest('hex');
  }

  public get(agentType: string, context: string, scenario: string): CachedResponse | null {
    const key = this.generateCacheKey(agentType, context, scenario);
    const cached = this.cache.get(key);

    if (!cached) {
      return null;
    }

    // Check if cache entry has expired
    const age = Date.now() - new Date(cached.timestamp).getTime();
    if (age > this.cacheTimeout) {
      this.cache.delete(key);
      return null;
    }

    return cached;
  }

  public set(
    agentType: string, 
    context: string, 
    scenario: string, 
    response: {
      content: string;
      reasoning?: string;
    }
  ): void {
    const key = this.generateCacheKey(agentType, context, scenario);
    
    const cachedResponse: CachedResponse = {
      id: `cached-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      agentType,
      content: response.content,
      reasoning: response.reasoning,
      timestamp: new Date().toISOString(),
      context,
      scenario,
    };

    // Implement LRU-style cache by removing oldest entries
    if (this.cache.size >= this.maxCacheSize) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey) {
        this.cache.delete(oldestKey);
      }
    }

    this.cache.set(key, cachedResponse);
  }

  public clear(): void {
    this.cache.clear();
  }

  public getStats(): {
    size: number;
    maxSize: number;
    entries: Array<{
      agentType: string;
      timestamp: string;
      age: number;
    }>;
  } {
    const entries = Array.from(this.cache.values()).map(cached => ({
      agentType: cached.agentType,
      timestamp: cached.timestamp,
      age: Date.now() - new Date(cached.timestamp).getTime(),
    }));

    return {
      size: this.cache.size,
      maxSize: this.maxCacheSize,
      entries,
    };
  }

  public cleanup(): void {
    const now = Date.now();
    for (const [key, cached] of this.cache.entries()) {
      const age = now - new Date(cached.timestamp).getTime();
      if (age > this.cacheTimeout) {
        this.cache.delete(key);
      }
    }
  }
}

// Export singleton instance
export const agentResponseCache = new AgentResponseCache();

// Auto-cleanup every 10 minutes
if (typeof window !== 'undefined') {
  setInterval(() => {
    agentResponseCache.cleanup();
  }, 1000 * 60 * 10);
}
