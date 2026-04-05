import { Request, Response, NextFunction } from 'express';
import { RedisService } from '@/services/redis';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { container, TYPES } from '@/services/di';

const redis = container.get<RedisService>(TYPES.RedisService);

export function cacheMiddleware(
  ttl: number,
  keyGen: (req: Request) => string,
  tags?: (req: Request) => string[]
) {
  return async (req: Request, res: Response, next: NextFunction) => {
    const key = keyGen(req);

    const cached = await redis.get<any>(key);

    if (cached) {
      if (!res.headersSent) {
        res.set('X-Cache', 'HIT');
        res.set('X-Cache-Key', key);

        return new ResponseWrapper(res)
          .status(cached.status)
          .set(cached.headers)
          .success(cached.body);
      }

      return;
    }
    const originalJson = res.json.bind(res);
    const originalStatus = res.status.bind(res);
    const originalSet = res.set.bind(res);

    let body: any;
    let status = 200;
    let headers: any = {};

    res.status = (code: number) => {
      status = code;
      return originalStatus(code);
    };

    // We need to type 'field' broadly to accept both string and object
    res.set = function (field: any, value?: any) {
      // 1. Handle object case: res.set({ 'Content-Type': '...' })
      if (typeof field === 'object' && field !== null) {
        headers = { ...headers, ...field };
        return originalSet.call(this, field);
      }

      // 2. Handle key-value case: res.set('Content-Type', '...')
      headers[field] = value;
      return originalSet.call(this, field, value);
    };

    res.json = (data: any) => {
      body = data;
      return originalJson(data);
    };

    res.on('finish', async () => {
      if (!body) return;

      const cacheData = {
        status,
        headers,
        body,
        ts: Date.now(),
      };

      await redis.set(key, cacheData, ttl);

      if (tags) {
        for (const tag of tags(req)) {
          await redis.getClient().sadd(`tag:${tag}`, key);
        }
      }
    });

    next();
  };
}
