import { BloomFilter } from 'bloom-filters';
import { BloomFilterConfig } from './bloom-filter.config';
import { IBloomFilterStrategy } from './bloom-filter.interface';
import { LoggingService } from '../observability/logging/logging.service';
import { MetricsService } from '../observability/metrics/metrics.service';
import { RedisService } from '@/services/redis';
import {
  bloomFilterErrors,
  bloomFilterQueries,
  bloomFilterResponseTimes,
} from '../observability/metrics/setup';

export abstract class BaseBloomFilterStrategy implements IBloomFilterStrategy {
  protected bloomFilter: BloomFilter;
  protected redis: RedisService;
  protected config: BloomFilterConfig;
  protected logger = LoggingService.getInstance();
  protected metrics = MetricsService.getInstance();

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
        this.logger.info(
          `Bloom filter loaded from cache for ${this.getFilterType()}`,
          {
            ctx: this.constructor.name,
          }
        );
      } else {
        await this.seedFromDatabase();
      }
    } catch (error) {
      bloomFilterErrors.inc();
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
        bloomFilterQueries
          .labels({ result: 'negative', type: this.getFilterType() })
          .inc();
        bloomFilterResponseTimes
          .labels({ stage: 'bloom_filter', type: this.getFilterType() })
          .observe(Date.now() - startTime);
        return true;
      }

      bloomFilterQueries
        .labels({ result: 'positive', type: this.getFilterType() })
        .inc();
      const existsInDb = await this.checkInDatabase(item);

      this.logger.info(
        `After bloom filter query from db for ${this.getFilterType()}`,
        {
          ctx: this.constructor.name,
        }
      );

      bloomFilterResponseTimes
        .labels({ stage: 'database', type: this.getFilterType() })
        .observe(Date.now() - startTime);

      return !existsInDb;
    } catch (error) {
      bloomFilterErrors.inc();
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
      bloomFilterQueries
        .labels({ result: 'added', type: this.getFilterType() })
        .inc();

      this.logger.info(
        `Added ${this.getFilterType()} to bloom filter: ${item}`,
        {
          ctx: this.constructor.name,
        }
      );
    } catch (error) {
      bloomFilterErrors.inc();
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
      bloomFilterQueries
        .labels({ result: 'persisted', type: this.getFilterType() })
        .inc();
    } catch (error) {
      bloomFilterErrors.inc();
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
