import { NextFunction, Request, Response } from 'express';
import { LoggerService } from '../observability/implementations/logging/logger.service';
import { RedisService } from '../redis';
import crypto from 'crypto';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { HttpStatus } from '@/shared/constants/http-status';
import { TYPES } from '../di';
import { container } from '../di/di.config';
import { ILoggerService } from '../observability/interfaces';

export interface CacheConfig {
  ttl: number;
  key?: (req: any) => string;
  tags?: (req: Request) => string[];
  condition?: (req: any, res: any) => boolean;
  skipCache?: (req: any) => boolean;
}

const logger = container.get<ILoggerService>(TYPES.LoggerService);
const redis = container.get<RedisService>(TYPES.CacheService);

export function Cache(config: CacheConfig) {
  return function (
    target: any,
    propertyName: string,
    descriptor: PropertyDescriptor
  ) {
    const original = descriptor.value;

    descriptor.value = async function (
      req: Request,
      res: Response,
      next: NextFunction
    ) {
      try {
        // Skip if needed
        if (config.skipCache?.(req)) {
          return original.call(this, req, res, next);
        }

        const key = generateCacheKey(req, config.key);

        /* 
                    CACHE HIT
                 */
        const cached = await redis.get<any>(key);

        if (cached) {
          logger.debug('Cache HIT', { key });

          if (!res.headersSent) {
            res.set({
              'X-Cache': 'HIT',
              'X-Cache-Key': key,
            });

            return res
              .status(cached.status)
              .set(cached.headers)
              .json(cached.body);
          }

          return;
        }

        /* 
                    CACHE MISS → INTERCEPT
                 */
        logger.debug('Cache MISS', { key });

        const originalJson = res.json.bind(res);
        const originalStatus = res.status.bind(res);
        const originalSet = res.set.bind(res);

        let body: any;
        let status = 200;
        let headers: any = {};

        // Intercept status
        res.status = function (code: number) {
          status = code;
          return originalStatus(code);
        };

        // Intercept headers
        res.set = function (field: any, value?: any) {
          if (typeof field === 'object') {
            headers = { ...headers, ...field };
          } else {
            headers[field] = value;
          }

          return originalSet(field, value);
        };

        // Intercept body
        res.json = function (data: any) {
          body = data;
          return originalJson(data);
        };

        /* 
                    EXECUTE CONTROLLER
                 */
        await original.call(this, req, res, next);

        /* 
                    SAVE CACHE
                 */
        if (!res.headersSent || !body) return;

        const cacheData = {
          status,
          headers,
          body,
          ts: Date.now(),
        };

        await redis.set(key, cacheData, config.ttl);

        // Tags
        if (config.tags) {
          for (const tag of config.tags(req)) {
            await redis.getClient().sadd(`tag:${tag}`, key);
          }
        }

        res.set('X-Cache', 'MISS');
        res.set('X-Cache-Key', key);
      } catch (error) {
        logger.error('Cache error', { error });
        return original.call(this, req, res, next);
      }
    };
  };
}

function generateCacheKey(req: Request, key?: (req: any) => string): string {
  if (key) {
    return `cache:${key(req)}`;
  }

  // Default cache key generation
  const original = req.method;
  const path = req.originalUrl;
  const query = JSON.stringify(req.query);
  const body = req.method !== 'GET' ? JSON.stringify(req.body) : '';
  const userId = req.user?.userId || '';

  const keyString = `${original}:${path}:${query}:${body}:${userId}`;
  const hash = crypto.createHash('md5').update(keyString).digest('hex');

  return `cache:${hash}`;
}
