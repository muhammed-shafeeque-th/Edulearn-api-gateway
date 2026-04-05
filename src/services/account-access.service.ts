import { RedisService } from '@/services/redis';
import { inject, injectable } from 'inversify';
import { Redis } from 'ioredis';
import { TYPES } from './di';

@injectable()
export class AccountAccessService {
  private readonly redisClient: Redis;
  private static readonly BLOCKLIST_KEY_PREFIX = 'user:blocked:';
  private static readonly DEFAULT_TTL_SECONDS = 60 * 60 * 24 * 30; // 30 days
  private static instance: AccountAccessService;

  public constructor(
    @inject(TYPES.RedisService) private readonly redisService: RedisService
  ) {
    this.redisClient = redisService.getClient();
  }

  // public static getInstance(): AccountAccessService {
  //   if (!AccountAccessService.instance) {
  //     AccountAccessService.instance = new AccountAccessService();
  //   }
  //   return AccountAccessService.instance;
  // }

  /**
   * Blocks a user by their ID, optionally with a specific role and custom TTL.
   * @param userId The user's unique identifier.
   * @param ttlSeconds Optional. Time-to-live in seconds for the block. Defaults to 30 days.
   */
  public async blockAccount(
    userId: string,
    ttlSeconds: number = AccountAccessService.DEFAULT_TTL_SECONDS
  ): Promise<void> {
    await this.redisClient.set(this.getBlockKey(userId), '1', 'EX', ttlSeconds);
  }

  /**
   * Unblocks a user, removing them from the restricted users set.
   * @param userId The user's unique identifier.
   */
  public async unblockAccount(userId: string): Promise<void> {
    await this.redisClient.del(this.getBlockKey(userId));
  }
  public async blockUserRole(
    userId: string,
    role?: string,
    ttlSeconds: number = AccountAccessService.DEFAULT_TTL_SECONDS
  ): Promise<void> {
    await this.redisClient.set(this.getBlockKey(userId, role), '1', 'EX', ttlSeconds);
  }

  /**
   * Unblocks a user, removing them from the restricted users set.
   * @param userId The user's unique identifier.
   * @param role Optional. The specific role to unblock.
   */
  public async unblockUserRole(userId: string, role?: string): Promise<void> {
    await this.redisClient.del(this.getBlockKey(userId, role));
  }

  /**
   * Checks if a given user (or specific role) is currently blocked.
   * @param userId The user's unique identifier.
   * @returns True if the user/role is blocked, false otherwise.
   */
  public async isAccountBlocked(userId: string): Promise<boolean> {
    const exists = await this.redisClient.exists(this.getBlockKey(userId));
    return exists === 1;
  }
  /**
   * Checks if a given user (or specific role) is currently blocked.
   * @param userId The user's unique identifier.
   * @param role Optional. The specific role to check.
   * @returns True if the user/role is blocked, false otherwise.
   */
  public async isUserRoleBlocked(userId: string, role?: string): Promise<boolean> {
    const exists = await this.redisClient.exists(this.getBlockKey(userId, role));
    return exists === 1;
  }

  public async getAllBlockedUsers(): Promise<string[]> {
    const stream = this.redisClient.scanStream({
      match: `${AccountAccessService.BLOCKLIST_KEY_PREFIX}*`,
      count: 500,
    });

    const blockedUsers: string[] = [];
    for await (const keys of stream) {
      if (Array.isArray(keys)) {
        for (const key of keys) {
          blockedUsers.push(this.extractUserIdFromKey(key as string));
        }
      }
    }

    return blockedUsers;
  }

  private getBlockKey(userId: string, role?: string): string {
    if (role) {
      return `${AccountAccessService.BLOCKLIST_KEY_PREFIX}${role}:${userId}`;
    }
    return `${AccountAccessService.BLOCKLIST_KEY_PREFIX}${userId}`;
  }

  private extractUserIdFromKey(key: string): string {
    return key.replace(AccountAccessService.BLOCKLIST_KEY_PREFIX, '');
  }
}
