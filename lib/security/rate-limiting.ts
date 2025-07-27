/**
 * Rate Limiting and API Security Middleware
 * Phase 5.2: Enterprise Security & Integration
 */

import { NextRequest, NextResponse } from 'next/server';

interface RateLimitConfig {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
}

interface RateLimitStore {
  [key: string]: {
    requests: number;
    windowStart: number;
  };
}

class RateLimiter {
  private store: RateLimitStore = {};
  private config: RateLimitConfig;

  constructor(config: RateLimitConfig) {
    this.config = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      ...config
    };
  }

  async isAllowed(identifier: string): Promise<{ allowed: boolean; remaining: number; resetTime: number }> {
    const now = Date.now();
    const key = identifier;

    // Clean up expired entries
    this.cleanup(now);

    const record = this.store[key];
    const windowStart = Math.floor(now / this.config.windowMs) * this.config.windowMs;

    if (!record || record.windowStart !== windowStart) {
      // New window or first request
      this.store[key] = {
        requests: 1,
        windowStart
      };
      return {
        allowed: true,
        remaining: this.config.maxRequests - 1,
        resetTime: windowStart + this.config.windowMs
      };
    }

    if (record.requests >= this.config.maxRequests) {
      return {
        allowed: false,
        remaining: 0,
        resetTime: windowStart + this.config.windowMs
      };
    }

    record.requests++;
    return {
      allowed: true,
      remaining: this.config.maxRequests - record.requests,
      resetTime: windowStart + this.config.windowMs
    };
  }

  private cleanup(now: number) {
    Object.keys(this.store).forEach(key => {
      const record = this.store[key];
      if (now - record.windowStart >= this.config.windowMs) {
        delete this.store[key];
      }
    });
  }
}

// Rate limiting configurations for different API endpoints
const rateLimiters = {
  // General API rate limiting
  general: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 1000 // 1000 requests per 15 minutes
  }),

  // Authentication endpoints (stricter limits)
  auth: new RateLimiter({
    windowMs: 15 * 60 * 1000, // 15 minutes
    maxRequests: 5 // 5 login attempts per 15 minutes
  }),

  // AI API endpoints (moderate limits)
  ai: new RateLimiter({
    windowMs: 60 * 1000, // 1 minute
    maxRequests: 60 // 60 AI requests per minute
  }),

  // Security-sensitive endpoints (very strict)
  security: new RateLimiter({
    windowMs: 60 * 60 * 1000, // 1 hour
    maxRequests: 10 // 10 security operations per hour
  })
};

export function getClientIdentifier(request: NextRequest): string {
  // Get client IP
  const forwarded = request.headers.get('x-forwarded-for');
  const realIP = request.headers.get('x-real-ip');
  const ip = forwarded?.split(',')[0].trim() || realIP || 'unknown';

  // Get user ID from headers (if authenticated)
  const userAgent = request.headers.get('user-agent') || 'unknown';
  
  // Create unique identifier combining IP and user agent hash
  const identifier = `${ip}:${Buffer.from(userAgent).toString('base64').slice(0, 8)}`;
  
  return identifier;
}

export function getRateLimiterForPath(pathname: string): RateLimiter {
  if (pathname.includes('/api/auth') || pathname.includes('/login')) {
    return rateLimiters.auth;
  }
  
  if (pathname.includes('/api/security') || pathname.includes('/api/rbac') || pathname.includes('/api/audit')) {
    return rateLimiters.security;
  }
  
  if (pathname.includes('/api/boardroom') || pathname.includes('/api/agents') || pathname.includes('/api/ai')) {
    return rateLimiters.ai;
  }
  
  return rateLimiters.general;
}

export async function applyRateLimit(request: NextRequest): Promise<NextResponse | null> {
  const identifier = getClientIdentifier(request);
  const rateLimiter = getRateLimiterForPath(request.nextUrl.pathname);
  
  const result = await rateLimiter.isAllowed(identifier);
  
  if (!result.allowed) {
    console.log(`🚫 Rate limit exceeded for ${identifier} on ${request.nextUrl.pathname}`);
    
    return new NextResponse(
      JSON.stringify({
        error: 'Rate limit exceeded',
        message: 'Too many requests, please try again later.',
        retryAfter: Math.ceil((result.resetTime - Date.now()) / 1000)
      }),
      {
        status: 429,
        headers: {
          'Content-Type': 'application/json',
          'X-RateLimit-Limit': rateLimiter['config'].maxRequests.toString(),
          'X-RateLimit-Remaining': result.remaining.toString(),
          'X-RateLimit-Reset': result.resetTime.toString(),
          'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString()
        }
      }
    );
  }

  // Add rate limit headers to successful responses
  const response = NextResponse.next();
  response.headers.set('X-RateLimit-Limit', rateLimiter['config'].maxRequests.toString());
  response.headers.set('X-RateLimit-Remaining', result.remaining.toString());
  response.headers.set('X-RateLimit-Reset', result.resetTime.toString());
  
  return null; // Continue processing
}

// Security headers middleware
export function applySecurityHeaders(response: NextResponse): NextResponse {
  // Content Security Policy
  response.headers.set(
    'Content-Security-Policy',
    "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; connect-src 'self' https:; font-src 'self' data:;"
  );

  // Security headers
  response.headers.set('X-Content-Type-Options', 'nosniff');
  response.headers.set('X-Frame-Options', 'DENY');
  response.headers.set('X-XSS-Protection', '1; mode=block');
  response.headers.set('Referrer-Policy', 'strict-origin-when-cross-origin');
  response.headers.set('Permissions-Policy', 'camera=(), microphone=(), geolocation=()');
  
  // Prevent caching of sensitive responses
  if (response.url.includes('/api/')) {
    response.headers.set('Cache-Control', 'no-store, no-cache, must-revalidate, private');
    response.headers.set('Pragma', 'no-cache');
    response.headers.set('Expires', '0');
  }

  return response;
}

// Input validation helpers
export function validateAPIKey(apiKey: string): boolean {
  // Validate API key format and authenticity
  if (!apiKey || typeof apiKey !== 'string') {
    return false;
  }

  // Check API key format (example: 32 character hex string)
  const apiKeyRegex = /^[a-f0-9]{32}$/i;
  if (!apiKeyRegex.test(apiKey)) {
    return false;
  }

  // In production, validate against database or key management service
  return true;
}

export function sanitizeInput(input: unknown): unknown {
  if (typeof input === 'string') {
    // Remove potentially dangerous characters
    return input
      .replace(/[<>\"']/g, '') // Remove HTML/script injection chars
      .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove control characters
      .trim();
  }
  
  if (Array.isArray(input)) {
    return input.map(sanitizeInput);
  }
  
  if (typeof input === 'object' && input !== null) {
    const sanitized: Record<string, unknown> = {};
    for (const [key, value] of Object.entries(input)) {
      sanitized[sanitizeInput(key) as string] = sanitizeInput(value);
    }
    return sanitized;
  }
  
  return input;
}

// IP whitelist validation
export function isIPWhitelisted(ip: string, whitelist: string[] = []): boolean {
  if (whitelist.length === 0) {
    return true; // No whitelist configured, allow all
  }
  
  return whitelist.some(allowedIP => {
    if (allowedIP.includes('/')) {
      // CIDR notation support would go here
      return false;
    }
    return ip === allowedIP;
  });
}

export {
  RateLimiter,
  rateLimiters
};
