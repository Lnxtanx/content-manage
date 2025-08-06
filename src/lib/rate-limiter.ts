import { NextRequest, NextResponse } from 'next/server';

interface RateLimitOptions {
  windowMs: number; // Time window in milliseconds
  maxRequests: number; // Maximum requests per window
  message?: string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

class RateLimiter {
  private requests: Map<string, { count: number; resetTime: number }> = new Map();
  private options: RateLimitOptions;

  constructor(options: RateLimitOptions) {
    this.options = {
      message: 'Too many requests, please try again later.',
      skipSuccessfulRequests: false,
      skipFailedRequests: false,
      ...options,
    };
  }

  private getKey(req: NextRequest): string {
    const forwarded = req.headers.get('x-forwarded-for');
    const realIp = req.headers.get('x-real-ip');
    const ip = forwarded?.split(',')[0] || realIp || 'unknown';
    return `${ip}:${req.nextUrl.pathname}`;
  }

  private cleanup(): void {
    const now = Date.now();
    const keysToDelete: string[] = [];
    
    this.requests.forEach((data, key) => {
      if (now > data.resetTime) {
        keysToDelete.push(key);
      }
    });
    
    keysToDelete.forEach(key => this.requests.delete(key));
  }

  public check(req: NextRequest): { allowed: boolean; remaining: number; resetTime: number } {
    if (process.env.NODE_ENV !== 'production') {
      return { allowed: true, remaining: this.options.maxRequests, resetTime: Date.now() + this.options.windowMs };
    }

    this.cleanup();

    const key = this.getKey(req);
    const now = Date.now();
    const resetTime = now + this.options.windowMs;

    const current = this.requests.get(key);

    if (!current || now > current.resetTime) {
      this.requests.set(key, { count: 1, resetTime });
      return { allowed: true, remaining: this.options.maxRequests - 1, resetTime };
    }

    current.count += 1;
    const remaining = Math.max(0, this.options.maxRequests - current.count);
    const allowed = current.count <= this.options.maxRequests;

    return { allowed, remaining, resetTime: current.resetTime };
  }

  public middleware() {
    return (req: NextRequest) => {
      const result = this.check(req);

      if (!result.allowed) {
        return NextResponse.json(
          { error: this.options.message },
          {
            status: 429,
            headers: {
              'X-RateLimit-Limit': this.options.maxRequests.toString(),
              'X-RateLimit-Remaining': result.remaining.toString(),
              'X-RateLimit-Reset': result.resetTime.toString(),
              'Retry-After': Math.ceil((result.resetTime - Date.now()) / 1000).toString(),
            },
          }
        );
      }

      return null; // Allow request to continue
    };
  }
}

// Pre-configured rate limiters for different endpoints
export const generalRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 100, // 100 requests per 15 minutes
});

export const authRateLimit = new RateLimiter({
  windowMs: 15 * 60 * 1000, // 15 minutes
  maxRequests: 5, // 5 auth attempts per 15 minutes
  message: 'Too many authentication attempts, please try again later.',
});

export const uploadRateLimit = new RateLimiter({
  windowMs: 60 * 60 * 1000, // 1 hour
  maxRequests: 10, // 10 uploads per hour
  message: 'Too many upload attempts, please try again later.',
});

export const apiRateLimit = new RateLimiter({
  windowMs: 60 * 1000, // 1 minute
  maxRequests: 60, // 60 requests per minute
});

// Wrapper function for applying rate limiting to API routes
export function withRateLimit(rateLimiter: RateLimiter, handler: Function) {
  return async (req: NextRequest, ...args: any[]) => {
    const rateLimitResponse = rateLimiter.middleware()(req);
    
    if (rateLimitResponse) {
      return rateLimitResponse;
    }

    return handler(req, ...args);
  };
}
