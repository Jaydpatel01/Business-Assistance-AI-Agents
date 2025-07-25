import * as Sentry from '@sentry/nextjs';
import { analytics } from './analytics-service';

interface APICallOptions extends RequestInit {
  timeout?: number;
  retries?: number;
  retryDelay?: number;
  trackAnalytics?: boolean;
  cacheKey?: string;
  cacheTTL?: number;
}

interface APIResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
  duration: number;
  cached?: boolean;
  retryCount?: number;
}

interface CacheEntry<T = unknown> {
  data: T;
  expiry: number;
}

interface HealthCheckDetail {
  name: string;
  status: 'healthy' | 'degraded' | 'unhealthy';
  duration?: number;
  error?: string;
  hitRate?: number;
  entries?: number;
}

class APIMonitor {
  private cache = new Map<string, CacheEntry>();
  private activeRequests = new Map<string, Promise<APIResponse<unknown>>>();
  private cleanupInterval: NodeJS.Timeout;

  constructor() {
    // Clean up expired cache entries every 5 minutes
    this.cleanupInterval = setInterval(() => {
      this.cleanupExpiredCache();
    }, 5 * 60 * 1000);
  }

  private cleanupExpiredCache(): void {
    const now = Date.now();
    this.cache.forEach((value, key) => {
      if (value.expiry < now) {
        this.cache.delete(key);
      }
    });
  }

  // Cleanup method for graceful shutdown
  destroy(): void {
    if (this.cleanupInterval) {
      clearInterval(this.cleanupInterval);
    }
    this.cache.clear();
    this.activeRequests.clear();
  }

  async call<T = unknown>(
    url: string,
    options: RequestInit & APICallOptions = {}
  ): Promise<APIResponse<T>> {
    const startTime = performance.now();
    const requestId = this.generateRequestId(url, options);
    
    const {
      timeout = 10000,
      retries = 3,
      retryDelay = 1000,
      trackAnalytics = true,
      cacheKey,
      cacheTTL = 300000, // 5 minutes default
      ...fetchOptions
    } = options;

    // Check cache first
    if (cacheKey && this.isValidCache(cacheKey)) {
      const cached = this.cache.get(cacheKey)!;
      const duration = performance.now() - startTime;
      
      if (trackAnalytics) {
        analytics.track('api_call', {
          url,
          method: fetchOptions.method || 'GET',
          cached: true,
          duration,
          status: 200,
        });
      }

      return {
        data: cached.data as T,
        status: 200,
        duration,
        cached: true,
      };
    }

    // Deduplicate concurrent requests
    if (this.activeRequests.has(requestId)) {
      return this.activeRequests.get(requestId) as Promise<APIResponse<T>>;
    }

    const requestPromise = this.executeRequest<T>(
      url,
      fetchOptions,
      timeout,
      retries,
      retryDelay,
      startTime,
      trackAnalytics,
      cacheKey,
      cacheTTL
    );

    this.activeRequests.set(requestId, requestPromise);

    try {
      const result = await requestPromise;
      return result;
    } finally {
      this.activeRequests.delete(requestId);
    }
  }

  private async executeRequest<T>(
    url: string,
    options: RequestInit,
    timeout: number,
    retries: number,
    retryDelay: number,
    startTime: number,
    trackAnalytics: boolean,
    cacheKey?: string,
    cacheTTL?: number
  ): Promise<APIResponse<T>> {
    let lastError: Error | null = null;
    let retryCount = 0;

    for (let attempt = 0; attempt <= retries; attempt++) {
      try {
        // Add timeout
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), timeout);

        const response = await fetch(url, {
          ...options,
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        const duration = performance.now() - startTime;
        const success = response.ok;

        // Parse response
        let data: T | undefined;
        try {
          const text = await response.text();
          data = text ? JSON.parse(text) : undefined;
        } catch (parseError) {
          console.warn('Failed to parse response as JSON:', parseError);
        }

        // Cache successful responses
        if (success && cacheKey && data) {
          this.cache.set(cacheKey, {
            data,
            expiry: Date.now() + (cacheTTL || 300000),
          });
        }

        // Track analytics
        if (trackAnalytics) {
          analytics.track('api_call', {
            url,
            method: options.method || 'GET',
            status: response.status,
            success,
            duration,
            retryCount,
            cached: false,
          });

          // Track performance
          analytics.trackPerformance(`api_${this.sanitizeUrl(url)}`, duration);
        }

        // Add breadcrumb for monitoring
        try {
          Sentry.addBreadcrumb({
            message: `API Call: ${options.method || 'GET'} ${url}`,
            category: 'http',
            data: {
              url,
              method: options.method || 'GET',
              status_code: response.status,
              duration,
              success,
            },
            level: success ? 'info' : 'error',
          });

          // Set Sentry measurements
          Sentry.setMeasurement(`api_response_time`, duration, 'millisecond');
          Sentry.setTag('last_api_status', response.status.toString());
        } catch (sentryError) {
          // Silently fail if Sentry is not available
          console.debug('Sentry monitoring not available:', sentryError);
        }

        if (!success) {
          const error = new Error(`API request failed: ${response.status} ${response.statusText}`);
          
          // Don't retry client errors (4xx)
          if (response.status >= 400 && response.status < 500) {
            throw error;
          }
          
          lastError = error;
          if (attempt < retries) {
            await this.delay(retryDelay * Math.pow(2, attempt)); // Exponential backoff
            retryCount++;
            continue;
          }
          throw error;
        }

        return {
          data,
          status: response.status,
          duration,
          retryCount,
        };

      } catch (error) {
        const duration = performance.now() - startTime;
        lastError = error as Error;

        // Track error
        if (trackAnalytics) {
          analytics.trackError(lastError, {
            url,
            method: options.method || 'GET',
            attempt: attempt + 1,
            duration,
          });
        }

        // Add error breadcrumb
        try {
          Sentry.addBreadcrumb({
            message: `API Error: ${options.method || 'GET'} ${url}`,
            category: 'http',
            data: {
              url,
              method: options.method || 'GET',
              error: lastError.message,
              attempt: attempt + 1,
              duration,
            },
            level: 'error',
          });
        } catch (sentryError) {
          // Silently fail if Sentry is not available
          console.debug('Sentry monitoring not available:', sentryError);
        }

        if (attempt < retries && !this.isAbortError(lastError) && this.isNetworkError(lastError)) {
          await this.delay(retryDelay * Math.pow(2, attempt));
          retryCount++;
          continue;
        }

        // Final attempt failed
        return {
          error: lastError.message,
          status: 0,
          duration,
          retryCount,
        };
      }
    }

    // This should never be reached, but just in case
    return {
      error: lastError?.message || 'Unknown error',
      status: 0,
      duration: performance.now() - startTime,
      retryCount,
    };
  }

  private generateRequestId(url: string, options: RequestInit): string {
    return `${options.method || 'GET'}_${url}_${JSON.stringify(options.body || '')}`;
  }

  private isValidCache(cacheKey: string): boolean {
    const cached = this.cache.get(cacheKey);
    return cached ? cached.expiry > Date.now() : false;
  }

  private sanitizeUrl(url: string): string {
    return url.replace(/[^a-zA-Z0-9]/g, '_').toLowerCase();
  }

  private delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private isAbortError(error: Error): boolean {
    return error.name === 'AbortError' || 
           error.message.includes('aborted') ||
           error.message.includes('The operation was aborted');
  }

  private isNetworkError(error: Error): boolean {
    return error.message.includes('fetch') ||
           error.message.includes('network') ||
           error.message.includes('ECONNREFUSED') ||
           error.message.includes('ENOTFOUND') ||
           error.name === 'TypeError';
  }

  // Cache management
  clearCache(pattern?: string) {
    if (pattern) {
      const regex = new RegExp(pattern);
      const keysToDelete: string[] = [];
      this.cache.forEach((_, key) => {
        if (regex.test(key)) {
          keysToDelete.push(key);
        }
      });
      keysToDelete.forEach(key => this.cache.delete(key));
    } else {
      this.cache.clear();
    }
  }

  getCacheStats() {
    const now = Date.now();
    let validEntries = 0;
    let expiredEntries = 0;

    this.cache.forEach((value) => {
      if (value.expiry > now) {
        validEntries++;
      } else {
        expiredEntries++;
      }
    });

    return {
      totalEntries: this.cache.size,
      validEntries,
      expiredEntries,
      hitRate: validEntries / (validEntries + expiredEntries) * 100 || 0,
    };
  }

  // Health check
  async healthCheck(): Promise<{ status: 'healthy' | 'degraded' | 'unhealthy'; details: HealthCheckDetail[] }> {
    const checks: HealthCheckDetail[] = [];

    // Check API endpoints
    try {
      const response = await this.call('/api/health', { 
        timeout: 5000, 
        retries: 1,
        trackAnalytics: false 
      });
      checks.push({
        name: 'api_health',
        status: response.status === 200 ? 'healthy' : 'unhealthy',
        duration: response.duration,
      });
    } catch (error) {
      checks.push({
        name: 'api_health',
        status: 'unhealthy',
        error: (error as Error).message,
      });
    }

    // Check cache performance
    const cacheStats = this.getCacheStats();
    checks.push({
      name: 'cache_health',
      status: cacheStats.hitRate > 70 ? 'healthy' : cacheStats.hitRate > 50 ? 'degraded' : 'unhealthy',
      hitRate: cacheStats.hitRate,
      entries: cacheStats.validEntries,
    });

    const healthyChecks = checks.filter(c => c.status === 'healthy').length;
    const overallStatus = 
      healthyChecks === checks.length ? 'healthy' :
      healthyChecks > 0 ? 'degraded' : 'unhealthy';

    return {
      status: overallStatus,
      details: checks,
    };
  }
}

// Create singleton instance
export const apiMonitor = new APIMonitor();

// Convenience methods for common HTTP methods
export const api = {
  get: <T = unknown>(url: string, options?: APICallOptions) => 
    apiMonitor.call<T>(url, { ...options, method: 'GET' }),
  
  post: <T = unknown>(url: string, data?: unknown, options?: APICallOptions) => 
    apiMonitor.call<T>(url, { 
      ...options, 
      method: 'POST',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(data),
    }),
  
  put: <T = unknown>(url: string, data?: unknown, options?: APICallOptions) => 
    apiMonitor.call<T>(url, { 
      ...options, 
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      body: JSON.stringify(data),
    }),
  
  delete: <T = unknown>(url: string, options?: APICallOptions) => 
    apiMonitor.call<T>(url, { ...options, method: 'DELETE' }),
};

export default apiMonitor;
