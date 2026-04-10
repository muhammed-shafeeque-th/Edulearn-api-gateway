import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@/services/redis';
import { container, TYPES } from '@/services/di';

const redis = container.get<RedisService>(TYPES.RedisService);

/**
 * Middleware to invalidate cache tags after a successful response.
 * @param tags function that returns an array of tags to invalidate based on the request
 */
export function invalidateCacheMiddleware(tags: (req: Request) => string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    // We hook into the response 'finish' event to invalidate cache
    // only if the request was successful (2xx or 3xx status)
    res.on('finish', async () => {
      if (res.statusCode >= 200 && res.statusCode < 400) {
        try {
          const tagsToInvalidate = tags(req);
          if (tagsToInvalidate && tagsToInvalidate.length > 0) {
            await Promise.all(
              tagsToInvalidate.map(tag => redis.invalidateTag(tag))
            );
          }
        } catch (error) {
          console.error('Failed to invalidate cache tags', error);
        }
      }
    });

    next();
  };
}
