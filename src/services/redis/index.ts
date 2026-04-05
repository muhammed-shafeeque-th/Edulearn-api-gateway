import { config } from '@/config';
import { LoggingService } from '@/services/observability/logging/logging.service';
import Redis, { Cluster } from 'ioredis';
import { injectable } from 'inversify';

@injectable()
export class RedisService {
  private static instance: RedisService;
  private _client: Redis | Cluster;
  private logger = LoggingService.getInstance();
  public isConnected = false;

  private constructor() {
    if (config.redis.cluster === 'true') {
      this._client = new Redis.Cluster(
        [
          {
            host: config.redis.host,
            port: parseInt(config.redis.port || '6379'),
          },
        ],
        {
          redisOptions: {
            password: config.redis.password,
            tls: config.redis.tls === 'true' ? {} : undefined,
          },
          scaleReads: 'slave',
        }
      );
    } else {
      this._client = new Redis({
        host: config.redis.host,
        port: parseInt(config.redis.port || '6379'),
        password: config.redis.password,
        lazyConnect: config.redis.lazyConnect,
        // maxRetriesPerRequest: config.redis.maxRetriesPerRequest,
        tls: config.redis.tls === 'true' ? {} : undefined,
        retryStrategy: (retries: number) => {
          if (retries > 5) return null;
          return Math.max(retries * 100, 3000);
        },
      });
    }

    this._client.on('error', error => {
      this.logger.error('Redis Client Error', {
        error,
        ctx: RedisService.name,
      });
    });

    this._client.on('connect', () => {
      this.isConnected = true;
      this.logger.info('Redis client connected successfully', {
        ctx: RedisService.name,
      });
    });

    this._client.on('end', () => {
      this.isConnected = false;
      this.logger.info('Redis client disconnected', {
        ctx: RedisService.name,
      });
    });
  }

  public static getInstance(): RedisService {
    if (!RedisService.instance) {
      RedisService.instance = new RedisService();
    }
    return RedisService.instance;
  }

  public async invalidateTag(tag: string) {
    const keys = await this._client.smembers(`tag:${tag}`);

    if (keys.length) {
      await this._client.del(...keys);
    }

    await this._client.del(`tag:${tag}`);
  }

  // For tamped protection
  public async withLock<T>(
    key: string,
    ttl: number,
    fn: () => Promise<T>
  ): Promise<T> {
    const lockKey = `lock:${key}`;

    const locked = await this._client.set(
      lockKey,
      '1',
      'NX' as any,
      'EX' as any,
      10 as any
    );

    if (!locked) {
      await new Promise(r => setTimeout(r, 100));
      return this.get<T>(key) as Promise<T>;
    }

    try {
      return await fn();
    } finally {
      await this._client.del(lockKey);
    }
  }

  async tag(key: string, tags: string[]) {
    for (const tag of tags) {
      await this._client.sadd(`tag:${tag}`, key);
    }
  }

  public get client() {
    return this._client;
  }

  async getWithSWR<T>(
    key: string,
    ttl: number,
    swr: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cache = await this._client.get(key);

    if (cache) {
      const parsed = JSON.parse(cache);

      const age = Date.now() - parsed.ts;

      // Fresh
      if (age < ttl * 1000) return parsed.data;

      // Stale -> background refresh
      if (age < (ttl + swr) * 1000) {
        this.refresh(key, ttl, fetcher);
        return parsed.data;
      }
    }

    // MISS
    return this.withLock(key, ttl, fetcher);
  }

  private async refresh<T>(key: string, ttl: number, fn: () => Promise<T>) {
    setTimeout(async () => {
      try {
        const data = await fn();

        await this._client.setex(
          key,
          ttl,
          JSON.stringify({
            data,
            ts: Date.now(),
          })
        );
      } catch {}
    }, 0);
  }

  public async getOrSet<T>(
    key: string,
    ttl: number,
    fetcher: () => Promise<T>
  ): Promise<T> {
    const cached = await this.get<T>(key);

    if (cached) return cached;

    const data = await fetcher();

    await this.set(key, data, ttl);

    return data;
  }

  /**
   * Get a value from Redis and parse it as JSON.
   */
  public async get<T = any>(key: string): Promise<T | null> {
    try {
      const value = await this._client.get(key);
      if (value !== null && value !== undefined) {
        try {
          return JSON.parse(value);
        } catch (jsonErr) {
          this.logger.warn('Failed to JSON.parse redis value', {
            key,
            value,
            ctx: RedisService.name,
            jsonErr,
          });
          // Return raw value if parsing fails
          // @ts-ignore
          return value as T;
        }
      }
      return null;
    } catch (error) {
      this.logger.error('Cache get failed for key ' + key, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Set a value in Redis, stringifying as JSON. Optionally include TTL (in seconds).
   */
  public async set<T>(key: string, value: T, ttl?: number): Promise<void> {
    try {
      const stringValue = JSON.stringify(value);
      if (ttl && ttl > 0) {
        await this._client.setex(key, ttl, stringValue);
      } else {
        await this._client.set(key, stringValue);
      }
    } catch (error) {
      this.logger.error(`Cache set failed for key ${key} `, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Remove a given key from Redis.
   */
  public async del(key: string): Promise<void> {
    try {
      await this._client.del(key);
    } catch (error) {
      this.logger.error(`Cache del failed for key ${key}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Check existence of a key in Redis.
   */
  public async exists(key: string): Promise<boolean> {
    try {
      const exists = await this._client.exists(key);
      return exists === 1;
    } catch (error) {
      this.logger.error(`Cache exists failed for key ${key}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Get all keys matching a pattern (use with CAUTION).
   * @example pattern: 'user:*'
   */
  public async keys(pattern: string): Promise<string[]> {
    try {
      const keys = await this._client.keys(pattern);
      return keys;
    } catch (error) {
      this.logger.error(`Redis keys command failed for pattern ${pattern}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Delete all keys matching a pattern.
   * This can be expensive on large datasets. Prefer using SCAN in production if possible.
   */
  public async delPattern(pattern: string): Promise<number> {
    try {
      const keys = await this._client.keys(pattern);
      if (keys.length === 0) return 0;
      const deleted = await this._client.del(...keys);
      return deleted;
    } catch (error) {
      this.logger.error(`Failed to delete keys for pattern ${pattern}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Increment a key by 1, optionally set expiry if new.
   */
  public async incr(key: string, ttl?: number): Promise<number> {
    try {
      const exists = await this._client.exists(key);
      const value = await this._client.incr(key);
      if (!exists && ttl && ttl > 0) {
        await this._client.expire(key, ttl);
      }
      return value;
    } catch (error) {
      this.logger.error(`Cache incr failed for key ${key}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Set expiry for a key in seconds.
   */
  public async expire(key: string, ttl: number): Promise<void> {
    try {
      await this._client.expire(key, ttl);
    } catch (error) {
      this.logger.error(`Cache expire failed for key ${key}`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Flush all Redis data (use with extreme caution!)
   */
  public async flushAll(): Promise<void> {
    try {
      await this._client.flushall();
      this.logger.warn('All Redis data flushed', {
        ctx: RedisService.name,
      });
    } catch (error) {
      this.logger.error(`Flushall failed`, {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Properly connect (required in some deployment scenarios).
   */
  public async connect(): Promise<void> {
    try {
      await this._client.connect();
      this.isConnected = true;
      this.logger.info('Redis client connected..');
    } catch (error) {
      this.isConnected = false;
      this.logger.error('Failed to connect to Redis', {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Disconnect client gracefully.
   */
  public async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this.isConnected = false;
      this.logger.info('Redis client disconnected gracefully ', {
        ctx: RedisService.name,
      });
    }
  }

  /**
   * Expose internal client if necessary.
   */
  public getClient(): Redis {
    return this._client as Redis;
  }
}

// Graceful shutdown for process exit
process.on('SIGINT', async () => {
  const redisService = RedisService.getInstance();
  await redisService.disconnect();
  process.exit(0);
});
