import { BaseBloomFilterStrategy } from './base-bloom-filter.strategy';
import { BloomFilterConfig } from './bloom-filter.config';
import { RedisService } from '@/services/redis';
import { UserService } from '@/domains/service-clients/user';

export class EmailAvailabilityStrategy extends BaseBloomFilterStrategy {
  private userServiceClient = UserService.getInstance();

  constructor(redis: RedisService, config: BloomFilterConfig) {
    super(redis, config);
  }

  protected getFilterType(): string {
    return 'email';
  }

  protected async seedFromDatabase(): Promise<void> {
    try {
      this.logger.info('Seeding email bloom filter from database...', {
        ctx: EmailAvailabilityStrategy.name,
      });

      const { success } = await this.userServiceClient.getUserEmails({});

      console.log(
        'Available emails in EmailAvailabilityStrategy ' +
          JSON.stringify(success, null, 2)
      );

      if (!success || !success.email) {
        throw new Error('Failed to fetch user emails from server');
      }

      const emails = Array.isArray(success.email)
        ? success.email
        : [success.email];

      this.logger.info(`Seeding ${emails.length} emails to bloom filter`, {
        ctx: EmailAvailabilityStrategy.name,
      });

      emails.forEach(email => {
        if (email && typeof email === 'string') {
          this.bloomFilter.add(email.toLowerCase().trim());
        }
      });

      await this.persistFilter();

      this.logger.info('Email bloom filter seeded successfully', {
        ctx: EmailAvailabilityStrategy.name,
        count: emails.length,
      });
    } catch (error) {
      this.logger.error('Error seeding email bloom filter from database:', {
        error,
        ctx: EmailAvailabilityStrategy.name,
      });
      throw error;
    }
  }

  protected async checkInDatabase(email: string): Promise<boolean> {
    try {
      const { response } = await this.userServiceClient.checkUserEmailExists({
        email: email.toLowerCase().trim(),
      });
      return !!response;
    } catch (error) {
      this.logger.error('Error checking email in database:', {
        error,
        email,
        ctx: EmailAvailabilityStrategy.name,
      });
      throw error;
    }
  }
}
