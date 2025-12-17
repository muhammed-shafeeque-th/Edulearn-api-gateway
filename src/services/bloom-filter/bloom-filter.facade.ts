import { IBloomFilterService } from './bloom-filter.interface';
import {
  BloomFilterServiceConfig,
  getBloomFilterConfig,
} from './bloom-filter.config';
import { EmailAvailabilityStrategy } from './email-availability.strategy';
import { CourseNameAvailabilityStrategy } from './course-name-availability.strategy';
import { RedisService } from '@/services/redis';
import { LoggingService } from '../observability/logging/logging.service';
import { MetricsService } from '../observability/metrics/metrics.service';

export class BloomFilterFacade implements IBloomFilterService {
  private emailStrategy: EmailAvailabilityStrategy;
  private courseNameStrategy: CourseNameAvailabilityStrategy;
  private redis: RedisService;
  private config: BloomFilterServiceConfig;
  private logger = LoggingService.getInstance();
  private metrics = MetricsService.getInstance();
  private static instance: BloomFilterFacade;

  private constructor(redis: RedisService, config: BloomFilterServiceConfig) {
    this.redis = redis;
    this.config = config;
    this.emailStrategy = new EmailAvailabilityStrategy(redis, config.email);
    this.courseNameStrategy = new CourseNameAvailabilityStrategy(
      redis,
      config.courseName
    );
  }

  public static getInstance(
    redis?: RedisService,
    config?: BloomFilterServiceConfig
  ): BloomFilterFacade {
    if (!BloomFilterFacade.instance) {
      if (!redis) {
        throw new Error(
          'Redis service is required for BloomFilterFacade initialization'
        );
      }

      BloomFilterFacade.instance = new BloomFilterFacade(
        redis!,
        config || getBloomFilterConfig()
      );
    }
    return BloomFilterFacade.instance;
  }

  public async initialize(): Promise<void> {
    try {
      this.logger.info('Initializing Bloom Filter Facade...', {
        ctx: BloomFilterFacade.name,
      });

      // Initialize both strategies in parallel
      await Promise.all([
        this.emailStrategy.initialize(),
        this.courseNameStrategy.initialize(),
      ]);

      this.logger.info('Bloom Filter Facade initialized successfully', {
        ctx: BloomFilterFacade.name,
      });
    } catch (error) {
      this.logger.error('Failed to initialize Bloom Filter Facade:', {
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async isEmailAvailable(email: string): Promise<boolean> {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email provided');
      }

      const normalizedEmail = email.toLowerCase().trim();
      return await this.emailStrategy.isAvailable(normalizedEmail);
    } catch (error) {
      this.logger.error('Error checking email availability:', {
        error,
        email,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async isCourseNameAvailable(courseName: string): Promise<boolean> {
    try {
      if (!courseName || typeof courseName !== 'string') {
        throw new Error('Invalid course name provided');
      }

      const normalizedCourseName = courseName.toLowerCase().trim();
      return await this.courseNameStrategy.isAvailable(normalizedCourseName);
    } catch (error) {
      this.logger.error('Error checking course name availability:', {
        error,
        courseName,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async addEmail(email: string): Promise<void> {
    try {
      if (!email || typeof email !== 'string') {
        throw new Error('Invalid email provided');
      }

      const normalizedEmail = email.toLowerCase().trim();
      await this.emailStrategy.add(normalizedEmail);

      this.logger.info('Email added to bloom filter successfully', {
        email: normalizedEmail,
        ctx: BloomFilterFacade.name,
      });
    } catch (error) {
      this.logger.error('Error adding email to bloom filter:', {
        error,
        email,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async addCourseName(courseName: string): Promise<void> {
    try {
      if (!courseName || typeof courseName !== 'string') {
        throw new Error('Invalid course name provided');
      }

      const normalizedCourseName = courseName.toLowerCase().trim();
      await this.courseNameStrategy.add(normalizedCourseName);

      this.logger.info('Course name added to bloom filter successfully', {
        courseName: normalizedCourseName,
        ctx: BloomFilterFacade.name,
      });
    } catch (error) {
      this.logger.error('Error adding course name to bloom filter:', {
        error,
        courseName,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async getStatistics(): Promise<{
    emailFilterSize: number;
    courseNameFilterSize: number;
    emailFalsePositiveRate: number;
    courseNameFalsePositiveRate: number;
  }> {
    try {
      const [emailStats, courseNameStats] = await Promise.all([
        this.emailStrategy.getStatistics(),
        this.courseNameStrategy.getStatistics(),
      ]);

      return {
        emailFilterSize: emailStats.size,
        courseNameFilterSize: courseNameStats.size,
        emailFalsePositiveRate: emailStats.falsePositiveRate,
        courseNameFalsePositiveRate: courseNameStats.falsePositiveRate,
      };
    } catch (error) {
      this.logger.error('Error getting bloom filter statistics:', {
        error,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  /**
   * Batch operations for better performance
   */
  public async addEmails(emails: string[]): Promise<void> {
    try {
      if (!Array.isArray(emails)) {
        throw new Error('Emails must be an array');
      }

      const normalizedEmails = emails
        .filter(email => email && typeof email === 'string')
        .map(email => email.toLowerCase().trim());

      await Promise.all(
        normalizedEmails.map(email => this.emailStrategy.add(email))
      );

      this.logger.info(
        `Added ${normalizedEmails.length} emails to bloom filter`,
        {
          ctx: BloomFilterFacade.name,
        }
      );
    } catch (error) {
      this.logger.error('Error adding emails to bloom filter:', {
        error,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  public async addCourseNames(courseNames: string[]): Promise<void> {
    try {
      if (!Array.isArray(courseNames)) {
        throw new Error('Course names must be an array');
      }

      const normalizedCourseNames = courseNames
        .filter(name => name && typeof name === 'string')
        .map(name => name.toLowerCase().trim());

      await Promise.all(
        normalizedCourseNames.map(name => this.courseNameStrategy.add(name))
      );

      this.logger.info(
        `Added ${normalizedCourseNames.length} course names to bloom filter`,
        {
          ctx: BloomFilterFacade.name,
        }
      );
    } catch (error) {
      this.logger.error('Error adding course names to bloom filter:', {
        error,
        ctx: BloomFilterFacade.name,
      });
      throw error;
    }
  }

  /**
   * Gracefully shutdown the bloom filter service (disconnect Redis, cleanup resources)
   */
  public async gracefulShutdown(): Promise<void> {
    try {
      this.logger.info('Gracefully shutting down Bloom Filter Facade...', {
        ctx: BloomFilterFacade.name,
      });
      if (this.redis && typeof this.redis.disconnect === 'function') {
        await this.redis.disconnect();
        this.logger.info('Redis disconnected successfully.', {
          ctx: BloomFilterFacade.name,
        });
      }
    } catch (error) {
      this.logger.error(
        'Error during graceful shutdown of Bloom Filter Facade:',
        {
          error,
          ctx: BloomFilterFacade.name,
        }
      );
      throw error;
    }
  }
}
