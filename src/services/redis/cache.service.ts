import { config } from '@/config';
import Redis, { Cluster } from 'ioredis';
import { inject, injectable } from 'inversify';
import { CacheClient } from '@edulearn/core';
import { ILoggerService } from '../observability/interfaces';
import { LoggerService } from '../observability/implementations';

@injectable()
export class RedisService extends CacheClient {
  public isConnected = false;
  private _client: Redis;
  private _logger: ILoggerService;
  private static instance: RedisService;

  constructor() {
    super({
      host: config.redis.host,
      port: parseInt(config.redis.port || '6379'),
      db: Number(config.redis.db),
      keyPrefix: config.redis.keyPrefix,
      lazyConnect: config.redis.lazyConnect,
      maxRetriesPerRequest: parseInt(config.redis.maxRetriesPerRequest ?? '5'),
      // tls: config.redis.tls === 'true' ? {} : undefined,
      // retryStrategy: (retries: number) => {
      //   if (retries > 5) return null;
      //   return Math.max(retries * 100, 3000);
      // },
    });
    this._logger = LoggerService.getInstance();

    this._client = super.getClient();
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

  // public get client() {
  //   return this._getClient();
  // }

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
   * Remove a given key from Redis.
   */
  public async del(key: string): Promise<void> {
    try {
      await this._client.del(key);
    } catch (error) {
      this._logger.error(`Cache del failed for key ${key}`, {
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
      this._logger.error(`Cache exists failed for key ${key}`, {
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
      this._logger.error(`Redis keys command failed for pattern ${pattern}`, {
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
      this._logger.error(`Failed to delete keys for pattern ${pattern}`, {
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
      this._logger.error(`Cache incr failed for key ${key}`, {
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
      this._logger.warn('All Redis data flushed', {
        ctx: RedisService.name,
      });
    } catch (error) {
      this._logger.error(`Flushall failed`, {
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
      if (this.isConnected) return;

      await this._client.connect();
      this.isConnected = true;
      this._logger.info('Redis _client connected..');
    } catch (error) {
      this.isConnected = false;
      this._logger.error('Failed to connect to Redis', {
        error,
        ctx: RedisService.name,
      });
      throw error;
    }
  }

  /**
   * Disconnect _client gracefully.
   */
  public async disconnect(): Promise<void> {
    if (this._client) {
      await this._client.quit();
      this.isConnected = false;
      this._logger.info('Redis _client disconnected gracefully ', {
        ctx: RedisService.name,
      });
    }
  }

  /**
   * Expose internal _client if necessary.
   */
  public getClient(): Redis {
    return this._client as Redis;
  }
}
