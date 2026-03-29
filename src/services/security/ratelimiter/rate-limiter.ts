import { RateLimiterRedis, RateLimiterRes } from 'rate-limiter-flexible';
import { RedisService } from '../../redis';

export interface RateLimiterConfig {
  keyPrefix?: string;
  points?: number;
  duration?: number;
  /** Seconds to block a key after it exceeds the point limit */
  blockDuration?: number;
}

export const defaultRateLimiterConfig: RateLimiterConfig = {
  keyPrefix: 'api_gateway-rate-limit',
  points: 100,
  duration: 60,
};

export class RateLimiter {
  private limiter: RateLimiterRedis;

  constructor(config: RateLimiterConfig = {}) {
    const limiterConfig = { ...defaultRateLimiterConfig, ...config };
    this.limiter = new RateLimiterRedis({
      storeClient: RedisService.getInstance().getClient(),
      keyPrefix: limiterConfig.keyPrefix!,
      points: limiterConfig.points!,
      duration: limiterConfig.duration!,
      blockDuration: limiterConfig.blockDuration,
    });
  }

  async consume(key: string): Promise<RateLimiterRes> {
    return this.limiter.consume(key).catch((e: unknown) => {
      throw e;
    });
  }
}
