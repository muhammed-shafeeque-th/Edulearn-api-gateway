import { Request, Response, NextFunction } from 'express';
import { promisify } from 'util';
import { RedisService } from '@/services/redis';
import zlib from 'zlib';
import { LoggingService } from '../services/observability/logging/logging.service';
import { container, TYPES } from '@/services/di';

const compress = promisify(zlib.gzip);
const decompress = promisify(zlib.gunzip);

const logger = container.get<LoggingService>(TYPES.LoggingService);
const redisService = container.get<RedisService>(TYPES.RedisService);

interface CacheOptions {
  duration: number;
  sizeThreshold: number;
  keyPrefix?: string;
  includeQueryParams?: boolean;
}

export const cacheMiddleware = (options: CacheOptions) => {
  const {
    duration,
    sizeThreshold,
    keyPrefix = 'cache',
    includeQueryParams = true,
  } = options;

  return async (
    req: Request,
    res: Response,
    next: NextFunction
  ): Promise<any> => {
    const redisClient = redisService.getClient();

    const baseKey = `${keyPrefix}:${req.method}:${req.originalUrl}`;
    const queryString =
      includeQueryParams && req.query ? JSON.stringify(req.query) : '';
    const key = queryString
      ? `${baseKey}:${Buffer.from(queryString).toString('base64')}`
      : baseKey;

    try {
      if (req.method === 'GET') {
        const cached = await redisClient.get(key);
        if (cached) {
          try {
            const decompressed = await decompress(
              Buffer.from(cached, 'base64')
            );
            const parsed = JSON.parse(decompressed.toString());

            logger.debug(`Cache hit for key: ${key}`, {
              key,
              method: req.method,
              url: req.originalUrl,
            });

            return res.json(parsed);
          } catch (decompressError) {
            logger.warn(`Failed to decompress cached data for key: ${key}`, {
              error: decompressError,
              key,
            });
          }
        }
      }

      if (['PUT', 'PATCH', 'DELETE'].includes(req.method)) {
        const resourceKey = `${keyPrefix}:GET:${req.originalUrl}`;

        if (req.method === 'DELETE') {
          // Evict cache entry for DELETE
          await redisClient.del(resourceKey);
          logger.debug(`Cache evicted for key: ${resourceKey}`, {
            key: resourceKey,
          });
        } else {
          const originalSend = res.send;
          res.send = function (body?: any) {
            const bodyString = JSON.stringify(body);
            const bodySize = Buffer.byteLength(bodyString, 'utf-8');

            // Async cache update without blocking response
            (async () => {
              try {
                if (bodySize > sizeThreshold) {
                  const compressed = await compress(
                    Buffer.from(bodyString, 'utf-8')
                  );
                  await redisClient.setex(
                    resourceKey,
                    duration,
                    compressed.toString('base64')
                  );
                  logger.debug(`Cache revalidated and compressed`, {
                    key: resourceKey,
                    size: bodySize,
                    compressed: true,
                  });
                } else {
                  await redisClient.setex(resourceKey, duration, bodyString);
                  logger.debug(`Cache revalidated without compression`, {
                    key: resourceKey,
                    size: bodySize,
                    compressed: false,
                  });
                }
              } catch (cacheError) {
                logger.error(`Failed to update cache for key: ${resourceKey}`, {
                  error: cacheError,
                  key: resourceKey,
                });
              }
            })();

            return originalSend.call(this, body);
          };
        }
      }

      if (req.method === 'GET') {
        const originalJson = res.json;
        res.json = function (body?: any) {
          const bodyString = JSON.stringify(body);
          const bodySize = Buffer.byteLength(bodyString, 'utf-8');

          // Async cache storage without blocking response
          (async () => {
            try {
              if (bodySize > sizeThreshold) {
                const compressed = await compress(
                  Buffer.from(bodyString, 'utf-8')
                );
                await redisClient.setex(
                  key,
                  duration,
                  compressed.toString('base64')
                );
                logger.debug(`Response cached and compressed`, {
                  key,
                  size: bodySize,
                  compressed: true,
                });
              } else {
                await redisClient.setex(key, duration, bodyString);
                logger.debug(`Response cached without compression`, {
                  key,
                  size: bodySize,
                  compressed: false,
                });
              }
            } catch (cacheError) {
              logger.error(`Failed to cache response for key: ${key}`, {
                error: cacheError,
                key,
              });
            }
          })();

          return originalJson.call(this, body);
        };
      }

      next();
    } catch (error) {
      logger.error(`Cache middleware error for key: ${key}`, {
        error,
        key,
        method: req.method,
        url: req.originalUrl,
      });
      // Continue without caching if Redis fails
      next();
    }
  };
};
