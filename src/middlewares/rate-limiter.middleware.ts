import { Request, Response, NextFunction } from 'express';
import { RateLimiter } from '@/services/security/ratelimiter/rate-limiter';
import { RateLimiterRes } from 'rate-limiter-flexible';

export interface RateLimiterMiddlewareOptions {
  /** Max requests allowed within the window */
  points?: number;
  /** Window size in seconds */
  duration?: number;
  /** Redis key prefix (should be unique per route) */
  keyPrefix?: string;
  /** Seconds to block key after points exhausted (optional) */
  blockDuration?: number;
  /** Custom key extractor — defaults to req.user?.userId ?? req.ip */
  getKey?: (req: Request) => string | undefined;
}

export function rateLimiter(options: RateLimiterMiddlewareOptions = {}) {
  const limiter = new RateLimiter({
    points: options.points,
    duration: options.duration,
    keyPrefix: options.keyPrefix,
    blockDuration: options.blockDuration,
  });

  const defaultGetKey = (req: Request): string =>
    req.user?.userId ?? req.ip ?? 'unknown';

  const getKey = options.getKey ?? defaultGetKey;

  return async (req: Request, res: Response, next: NextFunction): Promise<void> => {
    const key = getKey(req) ?? 'unknown';

    try {
      const result: RateLimiterRes = await limiter.consume(key);
      const limit = options.points ?? 100;

      res.setHeader('X-RateLimit-Limit', limit);
      res.setHeader('X-RateLimit-Remaining', result.remainingPoints);
      // msBeforeNext is how long until the window resets, convert to seconds
      res.setHeader('X-RateLimit-Reset', Math.ceil(result.msBeforeNext / 1000));

      next();
    } catch (err: unknown) {
      const rateLimitErr = err as RateLimiterRes;
      const retryAfterSecs = rateLimitErr?.msBeforeNext
        ? Math.ceil(rateLimitErr.msBeforeNext / 1000)
        : (options.duration ?? 60);

      res.setHeader('Retry-After', retryAfterSecs);
      res.setHeader('X-RateLimit-Limit', options.points ?? 100);
      res.setHeader('X-RateLimit-Remaining', 0);

      res.status(429).json({
        success: false,
        message: 'Too many requests. Please try again later.',
        error: {
          code: 'TOO_MANY_REQUESTS',
          message: 'Too many requests. Please try again later.',
          retryAfter: retryAfterSecs,
        },
      });
    }
  };
}
