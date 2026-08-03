import { BloomFilter } from 'bloom-filters';
import { BloomFilterConfig } from './bloom-filter.config';
import { IBloomFilterStrategy } from './bloom-filter.interface';
import { LoggerService } from '../observability/implementations/logging/logger.service';
import { MetricService } from '../observability/implementations/metrics/metrics.service';
import { RedisService } from '@/services/redis';
import { container } from '../di/di.config';
import { TYPES } from '../di';
import { MetricsEngine } from '../observability/implementations/metrics/setup';

export abstract class BaseBloomFilterStrategy implements IBloomFilterStrategy {
  protected bloomFilter: BloomFilter;
  protected redis: RedisService;
  protected config: BloomFilterConfig;
  protected logger = LoggerService.getInstance();
  protected metricsEngine = container.get<MetricsEngine>(TYPES.MetricsEngine);

  constructor(redis: RedisService, config: BloomFilterConfig) {
    this.redis = redis;
    this.config = config;
    this.bloomFilter = new BloomFilter(this.config.size, this.config.hashes);
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info(
        `Bloom filter initializing for ${this.getFilterType()}...`,
        {
          ctx: this.constructor.name,
        }
      );

      const serializedFilter = await this.redis.get<any>(this.config.redisKey);
      if (serializedFilter) {
        this.bloomFilter = BloomFilter.fromJSON(serializedFilter);
        this.logger.debug(
          `Bloom filter loaded from cache for ${this.getFilterType()}`,
          {
            ctx: this.constructor.name,
          }
        );
      } else {
        await this.seedFromDatabase();
      }
    } catch (error) {
      this.metricsEngine.bloomFilterErrors.inc();
      this.logger.error(
        `Bloom filter initialization failed for ${this.getFilterType()}:`,
        {
          error,
          ctx: this.constructor.name,
        }
      );
      // throw new Error(`Bloom filter initialization failed for ${this.getFilterType()}: ${error}`);
    }
  }

  public async isAvailable(item: string): Promise<boolean> {
    const startTime = Date.now();
    try {
      if (!this.bloomFilter.has(item)) {
        this.metricsEngine.bloomFilterQueries
          .labels({ result: 'negative', type: this.getFilterType() })
          .inc();
        this.metricsEngine.bloomFilterResponseTimes
          .labels({ stage: 'bloom_filter', type: this.getFilterType() })
          .observe(Date.now() - startTime);
        return true;
      }

      this.metricsEngine.bloomFilterQueries
        .labels({ result: 'positive', type: this.getFilterType() })
        .inc();
      const existsInDb = await this.checkInDatabase(item);

      this.logger.debug(
        `After bloom filter query from db for ${this.getFilterType()}`,
        {
          ctx: this.constructor.name,
        }
      );

      this.metricsEngine.bloomFilterResponseTimes
        .labels({ stage: 'database', type: this.getFilterType() })
        .observe(Date.now() - startTime);

      return !existsInDb;
    } catch (error) {
      this.metricsEngine.bloomFilterErrors.inc();
      this.logger.error(
        `Error checking ${this.getFilterType()} availability:`,
        {
          error,
          ctx: this.constructor.name,
        }
      );
      throw error;
    }
  }

  public async add(item: string): Promise<void> {
    try {
      this.bloomFilter.add(item);
      await this.persistFilter();
      this.metricsEngine.bloomFilterQueries
        .labels({ result: 'added', type: this.getFilterType() })
        .inc();

      this.logger.debug(
        `Added ${this.getFilterType()} to bloom filter: ${item}`,
        {
          ctx: this.constructor.name,
        }
      );
    } catch (error) {
      this.metricsEngine.bloomFilterErrors.inc();
      this.logger.error(
        `Error adding ${this.getFilterType()} to Bloom filter:`,
        {
          error,
          ctx: this.constructor.name,
        }
      );
      throw error;
    }
  }

  public async getStatistics(): Promise<{
    size: number;
    falsePositiveRate: number;
  }> {
    return {
      size: this.bloomFilter.size,
      falsePositiveRate: this.config.falsePositiveRate,
    };
  }

  protected async persistFilter(): Promise<void> {
    try {
      await this.redis.set(
        this.config.redisKey,
        JSON.stringify(this.bloomFilter.saveAsJSON())
      );
      this.metricsEngine.bloomFilterQueries
        .labels({ result: 'persisted', type: this.getFilterType() })
        .inc();
    } catch (error) {
      this.metricsEngine.bloomFilterErrors.inc();
      this.logger.error(
        `Error persisting Bloom filter to Redis for ${this.getFilterType()}:`,
        {
          error,
          ctx: this.constructor.name,
        }
      );
      throw error;
    }
  }

  protected abstract getFilterType(): string;
  protected abstract seedFromDatabase(): Promise<void>;
  protected abstract checkInDatabase(item: string): Promise<boolean>;
}
