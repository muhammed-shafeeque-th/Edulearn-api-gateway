import { inject, injectable } from 'inversify';
import { RedisService } from '../redis';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { config } from '@/config';
import { TYPES } from '../di';

@injectable()
export class TokenService {
  constructor(@inject(TYPES.RedisService) private redisService: RedisService) {}

  public async isTokenRevoked(jti: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const isRevoked = await client.get(`revoked_token:${jti}`);
    return !!isRevoked;
  }


  public async isUserBlocked(userId: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const isBlocked = await client.get(`user:blocked:${userId}`);
    return !!isBlocked;
  }

  public async isRoleBlocked(userId: string, role: string): Promise<boolean> {
    const client = this.redisService.getClient();
    const isBlocked = await client.get(`user:blocked:${role}:${userId}`);
    return !!isBlocked;
  }

  public verifyAccessToken(token: string): JwtPayload | string {
    // Validate issuer + audience to prevent token confusion attacks
    return jwt.verify(token, config.jwt.accessTokenSecret, {
      ...(config.jwt.tokenIssuer && { issuer: config.jwt.tokenIssuer }),
      ...(config.jwt.tokenAudience && { audience: config.jwt.tokenAudience }),
    });
  }
}

