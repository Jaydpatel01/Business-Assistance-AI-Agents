import Redis from 'ioredis';

// Common cache data types
export interface AgentResponseData {
  response: string;
  timestamp: number;
  agentType: string;
  metadata?: Record<string, unknown>;
}

export interface AnalyticsData {
  userId: string;
  sessionCount: number;
  decisionCount: number;
  lastActivity: string;
  metrics?: Record<string, number>;
}

export interface BoardroomSessionData {
  id: string;
  name: string;
  status: string;
  participantCount: number;
  lastUpdate: string;
}

// In-memory cache fallback
interface CacheEntry<T = unknown> {
  value: T;
  expiry: number;
}

class MemoryCache {
  private cache = new Map<string, CacheEntry>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      const now = Date.now();
      this.cache.forEach((entry, key) => {
        if (entry.expiry < now) {
          this.cache.delete(key);
        }
      });
    }, 5 * 60 * 1000);
  }

  get<T = unknown>(key: string): T | null {
    const entry = this.cache.get(key);
    if (!entry) return null;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return null;
    }
    
    return entry.value as T;
  }

  set<T = unknown>(key: string, value: T, ttlSeconds: number): void {
    this.cache.set(key, {
      value,
      expiry: Date.now() + (ttlSeconds * 1000)
    });
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  exists(key: string): boolean {
    const entry = this.cache.get(key);
    if (!entry) return false;
    
    if (entry.expiry < Date.now()) {
      this.cache.delete(key);
      return false;
    }
    
    return true;
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    clearInterval(this.cleanupInterval);
    this.cache.clear();
  }
}

// Redis configuration
const getRedisConfig = () => {
  if (process.env.REDIS_URL) {
    return {
      url: process.env.REDIS_URL,
      retryDelayOnFailover: 100,
      enableReadyCheck: false,
      maxRetriesPerRequest: 3,
      connectTimeout: 5000,
      lazyConnect: true,
    };
  }
  
  // Local development Redis configuration
  return {
    host: process.env.REDIS_HOST || 'localhost',
    port: parseInt(process.env.REDIS_PORT || '6379'),
    password: process.env.REDIS_PASSWORD || undefined,
    db: parseInt(process.env.REDIS_DB || '0'),
    retryDelayOnFailover: 100,
    enableReadyCheck: false,
    maxRetriesPerRequest: 3,
    connectTimeout: 5000,
    lazyConnect: true,
  };
};

// Create Redis client with fallback
let redis: Redis | null = null;
let redisAvailable = false;
const memoryCache = new MemoryCache();

export const getRedisClient = () => {
  if (!redis) {
    try {
      // Skip Redis in development if REDIS_URL is not explicitly set
      if (process.env.NODE_ENV === 'development' && !process.env.REDIS_URL) {
        console.log('Redis skipped in development (no REDIS_URL configured), using memory cache');
        redisAvailable = false;
        return null;
      }

      redis = new Redis(getRedisConfig());
      
      redis.on('error', (error) => {
        console.error('Redis connection error:', error);
        redisAvailable = false;
      });
      
      redis.on('connect', () => {
        console.log('Redis connected successfully');
        redisAvailable = true;
      });
      
      redis.on('reconnecting', () => {
        console.log('Redis reconnecting...');
        redisAvailable = false;
      });

      redis.on('close', () => {
        console.log('Redis connection closed');
        redisAvailable = false;
      });
      
    } catch (error) {
      console.error('Failed to create Redis client:', error);
      redisAvailable = false;
      return null;
    }
  }
  return redis;
};

export const isRedisAvailable = () => redisAvailable;

// Cache utilities with fallback
export class CacheService {
  private redis: Redis | null;
  
  constructor() {
    this.redis = getRedisClient();
  }
  
  async get<T>(key: string): Promise<T | null> {
    // Try Redis first
    if (this.redis && redisAvailable) {
      try {
        const value = await this.redis.get(key);
        return value ? JSON.parse(value) : null;
      } catch (error) {
        console.error('Redis get error, falling back to memory cache:', error);
        redisAvailable = false;
      }
    }
    
    // Fall back to memory cache
    try {
      return memoryCache.get(key);
    } catch (error) {
      console.error('Memory cache get error:', error);
      return null;
    }
  }
  
  async set<T = unknown>(key: string, value: T, ttlSeconds = 3600): Promise<boolean> {
    let redisSuccess = false;
    
    // Try Redis first
    if (this.redis && redisAvailable) {
      try {
        await this.redis.setex(key, ttlSeconds, JSON.stringify(value));
        redisSuccess = true;
      } catch (error) {
        console.error('Redis set error, falling back to memory cache:', error);
        redisAvailable = false;
      }
    }
    
    // Always set in memory cache as backup
    try {
      memoryCache.set(key, value, ttlSeconds);
      return true;
    } catch (error) {
      console.error('Memory cache set error:', error);
      return redisSuccess;
    }
  }
  
  async del(key: string): Promise<boolean> {
    let redisSuccess = false;
    
    // Try Redis first
    if (this.redis && redisAvailable) {
      try {
        await this.redis.del(key);
        redisSuccess = true;
      } catch (error) {
        console.error('Redis delete error:', error);
        redisAvailable = false;
      }
    }
    
    // Delete from memory cache
    try {
      memoryCache.delete(key);
      return true;
    } catch (error) {
      console.error('Memory cache delete error:', error);
      return redisSuccess;
    }
  }
  
  async exists(key: string): Promise<boolean> {
    // Try Redis first
    if (this.redis && redisAvailable) {
      try {
        const result = await this.redis.exists(key);
        return result === 1;
      } catch (error) {
        console.error('Redis exists error, checking memory cache:', error);
        redisAvailable = false;
      }
    }
    
    // Check memory cache
    try {
      return memoryCache.exists(key);
    } catch (error) {
      console.error('Memory cache exists error:', error);
      return false;
    }
  }
  
  async flushAll(): Promise<boolean> {
    let redisSuccess = false;
    
    // Try Redis first
    if (this.redis && redisAvailable) {
      try {
        await this.redis.flushall();
        redisSuccess = true;
      } catch (error) {
        console.error('Redis flush error:', error);
        redisAvailable = false;
      }
    }
    
    // Clear memory cache
    try {
      memoryCache.clear();
      return true;
    } catch (error) {
      console.error('Memory cache clear error:', error);
      return redisSuccess;
    }
  }

  // Health check method
  async healthCheck(): Promise<{ status: string; provider: string; latency?: number; error?: string }> {
    if (this.redis && redisAvailable) {
      try {
        const start = Date.now();
        await this.redis.ping();
        const latency = Date.now() - start;
        return { status: 'healthy', provider: 'redis', latency };
      } catch (error) {
        redisAvailable = false;
        return { 
          status: 'unhealthy', 
          provider: 'redis', 
          error: error instanceof Error ? error.message : 'Redis connection failed'
        };
      }
    }
    
    // Test memory cache
    try {
      const testKey = `health-check-${Date.now()}`;
      const testValue = 'test';
      memoryCache.set(testKey, testValue, 10);
      const retrieved = memoryCache.get(testKey);
      memoryCache.delete(testKey);
      
      return { 
        status: retrieved === testValue ? 'healthy' : 'degraded', 
        provider: 'memory' 
      };
    } catch (error) {
      return { 
        status: 'unhealthy', 
        provider: 'memory', 
        error: error instanceof Error ? error.message : 'Memory cache failed'
      };
    }
  }
  
  // Cache with prefix for different data types
  async cacheAgentResponse(agentType: string, scenario: string, context: string, response: AgentResponseData, ttl = 1800) {
    const key = `agent:${agentType}:${this.hashKey(scenario + context)}`;
    return this.set(key, response, ttl);
  }
  
  async getCachedAgentResponse(agentType: string, scenario: string, context: string): Promise<AgentResponseData | null> {
    const key = `agent:${agentType}:${this.hashKey(scenario + context)}`;
    return this.get<AgentResponseData>(key);
  }
  
  async cacheAnalytics(userId: string, data: AnalyticsData, ttl = 300) {
    const key = `analytics:${userId}`;
    return this.set(key, data, ttl);
  }
  
  async getCachedAnalytics(userId: string): Promise<AnalyticsData | null> {
    const key = `analytics:${userId}`;
    return this.get<AnalyticsData>(key);
  }

  async cacheBoardroomSession(sessionId: string, data: BoardroomSessionData, ttl = 900) {
    const key = `boardroom:session:${sessionId}`;
    return this.set(key, data, ttl);
  }
  
  async getCachedBoardroomSession(sessionId: string): Promise<BoardroomSessionData | null> {
    const key = `boardroom:session:${sessionId}`;
    return this.get<BoardroomSessionData>(key);
  }
  
  private hashKey(input: string): string {
    // Simple hash function for cache keys
    let hash = 0;
    for (let i = 0; i < input.length; i++) {
      const char = input.charCodeAt(i);
      hash = ((hash << 5) - hash) + char;
      hash = hash & hash; // Convert to 32-bit integer
    }
    return Math.abs(hash).toString(36);
  }
}

// Singleton cache service
export const cacheService = new CacheService();

// Cleanup function for graceful shutdown
export const cleanupCache = async (): Promise<void> => {
  try {
    if (redis) {
      await redis.quit();
      redis = null;
    }
    memoryCache.cleanup();
    console.log('Cache cleanup completed');
  } catch (error) {
    console.error('Error during cache cleanup:', error);
  }
};

// Cache key generators
export const CacheKeys = {
  agentResponse: (agentType: string, scenarioId: string) => `agent:response:${agentType}:${scenarioId}`,
  boardroomSession: (sessionId: string) => `boardroom:session:${sessionId}`,
  userAnalytics: (userId: string) => `analytics:user:${userId}`,
  systemMetrics: () => 'system:metrics',
  documentEmbeddings: (documentId: string) => `embeddings:doc:${documentId}`,
  scenarioList: (userId: string) => `scenarios:user:${userId}`,
  sessionList: (userId: string) => `sessions:user:${userId}`,
} as const;
