import { config } from '@/config';
import jwt, { VerifyOptions } from 'jsonwebtoken';
import { createHash } from 'crypto';
import { CookieOptions, Response, Request } from 'express';
import { ResponseWrapper } from '@/shared/utils/response-wrapper';
import { TokenPayload, TokenVerificationResult } from './types';
import { ACCESS_TOKEN_COOKIE, REFRESH_TOKEN_COOKIE } from './constants';

export class TokenService {
  private readonly accessTokenSecret: string;
  private readonly refreshTokenSecret: string;
  private readonly issuer: string;
  private readonly audience: string;
  private readonly cookieDomain?: string;
  private readonly isProduction: boolean;
  private static instance: TokenService;

  public readonly ACCESS_TOKEN_COOKIE = ACCESS_TOKEN_COOKIE;
  public readonly REFRESH_TOKEN_COOKIE = REFRESH_TOKEN_COOKIE;

  private readonly ACCESS_TOKEN_PREFIX = 'Bearer';

  private constructor() {
    this.accessTokenSecret = config.jwt.accessTokenSecret;
    this.refreshTokenSecret = config.jwt.refreshTokenSecret;
    this.issuer = config.jwt.tokenIssuer || 'auth-service';
    this.audience = config.jwt.tokenAudience || 'api-gateway';
    this.cookieDomain = config.jwt.cookieDomain;
    this.isProduction = config.nodeEnv === 'production';

    this.validateConfiguration();
  }

  public static getInstance(): TokenService {
    if (!TokenService.instance) {
      TokenService.instance = new TokenService();
    }
    return TokenService.instance;
  }

  private validateConfiguration(): void {
    // if (!this.accessTokenSecret || this.accessTokenSecret.length < 32) {
    //   throw new Error('Access token secret must be at least 32 characters');
    // }
    // if (!this.refreshTokenSecret || this.refreshTokenSecret.length < 32) {
    //   throw new Error('Refresh token secret must be at least 32 characters');
    // }
  }

  
  public verifyAccessToken(token: string, allowExpired?: boolean): TokenVerificationResult {
    try {
      const verifyOptions: VerifyOptions = {
        issuer: this.issuer,
        audience: this.audience,
        ignoreExpiration: !!allowExpired
      };
      const payload = jwt.verify(
        token,
        config.jwt.accessTokenSecret,
        verifyOptions
      ) as TokenPayload;

      if (payload.tokenType !== 'access') {
        return {
          valid: false,
          error: 'Invalid token type - expected access token',
        };
      }

      return {
        valid: true,
        payload,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          expired: true,
          error: 'Token has expired',
        };
      }

      if (error.name === 'JsonWebTokenError') {
        return {
          valid: false,
          error: 'Invalid token signature or structure',
        };
      }

      if (error.name === 'NotBeforeError') {
        return {
          valid: false,
          error: 'Token not yet valid',
        };
      }

      return {
        valid: false,
        error: error.message || 'Token verification failed',
      };
    }
  }


  public verifyRefreshToken(token: string): TokenVerificationResult {
    try {
      const verifyOptions: VerifyOptions = {
        issuer: this.issuer,
        audience: this.audience,
      };

      const payload = jwt.verify(
        token,
        this.refreshTokenSecret,
        verifyOptions
      ) as TokenPayload;

      if (payload.tokenType !== 'refresh') {
        return {
          valid: false,
          error: 'Invalid token type - expected refresh token',
        };
      }

      return {
        valid: true,
        payload,
      };
    } catch (error: any) {
      if (error.name === 'TokenExpiredError') {
        return {
          valid: false,
          expired: true,
          error: 'Refresh token has expired',
        };
      }

      return {
        valid: false,
        error: error.message || 'Refresh token verification failed',
      };
    }
  }

  public decodeToken(token: string): TokenPayload | null {
    try {
      const decoded = jwt.decode(token) as TokenPayload;
      return decoded;
    } catch {
      return null;
    }
  }

  public extractTokenFromHeader(authHeader?: string): string | null {
    if (!authHeader) {
      return null;
    }

    const parts = authHeader.split(' ');
    if (parts.length !== 2 || parts[0] !== this.ACCESS_TOKEN_PREFIX) {
      return null;
    }

    return parts[1] ?? null;
  }

  public extractToken(request: Request): string | null {
    const headerToken = this.extractTokenFromHeader(
      request.headers.authorization
    );
    if (headerToken) {
      return headerToken;
    }

    const cookieToken = request.cookies?.[this.ACCESS_TOKEN_COOKIE];
    if (cookieToken) {
      return cookieToken;
    }

    const queryToken = request.query.token as string;
    if (queryToken) {
      return queryToken;
    }

    return null;
  }

 
  public getAccessTokenCookieOptions(token?: string): CookieOptions {
    let expiresAt: Date | undefined;
    let maxAge: number | undefined;

    if (token) {
      const payload = this.decodeToken(token);
      if (payload && payload.exp && payload.iat) {
        expiresAt = new Date(payload.exp * 1000);
        maxAge = (payload.exp - payload.iat) * 1000;
      }
    }

    return {
      expires: expiresAt,
      httpOnly: true,
      maxAge,
      sameSite: this.isProduction ? 'lax' : 'lax',
      secure: this.isProduction,
      path: '/',
      domain: this.cookieDomain,
    };
  }

  /**
   * Get refresh token cookie options
   */
  public getRefreshTokenCookieOptions(token?: string): CookieOptions {
    let expiresAt: Date | undefined;
    let maxAge: number | undefined;

    if (token) {
      const payload = this.decodeToken(token);
      if (payload && payload.exp && payload.iat) {
        expiresAt = new Date(payload.exp * 1000);
        maxAge = (payload.exp - payload.iat) * 1000;
      }
    }

    return {
      expires: expiresAt,
      httpOnly: true,
      maxAge,
      sameSite: this.isProduction ? 'strict' : 'lax',
      secure: this.isProduction,
      path: '/',
      domain: this.cookieDomain,
    };
  }

  /**
   * Attach authentication cookies to response
   * Used when forwarding tokens from Auth Service
   */
  public attachAuthCookies(
    res: Response | ResponseWrapper,
    accessToken: string,
    refreshToken: string
  ): void {
    res.cookie(
      this.ACCESS_TOKEN_COOKIE,
      accessToken,
      this.getAccessTokenCookieOptions(accessToken)
    );

    res.cookie(
      this.REFRESH_TOKEN_COOKIE,
      refreshToken,
      this.getRefreshTokenCookieOptions(refreshToken)
    );
  }

  /**
   * Clear authentication cookies
   */
  public clearAuthCookies(res: Response | ResponseWrapper): void {
    res.clearCookie(
      this.ACCESS_TOKEN_COOKIE,
      this.getAccessTokenCookieOptions()
    );

    res.clearCookie(
      this.REFRESH_TOKEN_COOKIE,
      this.getRefreshTokenCookieOptions()
    );
  }

  /**
   * Hash token for storage/comparison
   * Useful for token blacklisting
   */
  public hashToken(token: string): string {
    return createHash('sha256').update(token).digest('hex');
  }

  /**
   * Check if token is expired without full verification
   */
  public isTokenExpired(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp) {
      return true;
    }

    return Date.now() >= payload.exp * 1000;
  }

  /**
   * Get token expiry time in seconds (Unix timestamp)
   */
  public getTokenExpiryTime(token: string): number | null {
    const payload = this.decodeToken(token);
    return payload?.exp || null;
  }

  /**
   * Get remaining token lifetime in milliseconds
   */
  public getRemainingLifetime(token: string): number {
    const expiryTime = this.getTokenExpiryTime(token);
    if (!expiryTime) {
      return 0;
    }

    const remaining = expiryTime * 1000 - Date.now();
    return Math.max(0, remaining);
  }

  /**
   * Check if token should be refreshed (less than 20% lifetime remaining)
   */
  public shouldRefreshToken(token: string): boolean {
    const payload = this.decodeToken(token);
    if (!payload || !payload.exp || !payload.iat) {
      return true;
    }

    const totalLifetime = (payload.exp - payload.iat) * 1000;
    const remaining = this.getRemainingLifetime(token);

    return remaining < totalLifetime * 0.2;
  }

  /**
   * Validate token format without verification
   * Quick check before attempting verification
   */
  public isValidTokenFormat(token: string): boolean {
    if (!token || typeof token !== 'string') {
      return false;
    }

    // JWT format: header.payload.signature
    const parts = token.split('.');
    if (parts.length !== 3) {
      return false;
    }

    // Check if parts are base64url encoded
    const base64UrlPattern = /^[A-Za-z0-9_-]+$/;
    return parts.every(part => part.length > 0 && base64UrlPattern.test(part));
  }

  /**
   * Create authorization header value
   */
  public createAuthorizationHeader(accessToken: string): string {
    return `${this.ACCESS_TOKEN_PREFIX} ${accessToken}`;
  }

  /**
 * Validates JWT token and returns payload
 *
 * @param token - JWT token to validate
 * @param allowExpired - Whether to allow expired tokens
 * @returns JWT payload or null
 */
  public validateToken(token: string, allowExpired: boolean = false): {
    valid: boolean;
    user?: {
      userId: string;
      username: string;
      email: string;
      role: string;
      avatar?: string;
      
    };
    error?: string;
  } {
    const result = this.verifyAccessToken(token, allowExpired);

    if (!result.valid || !result.payload) {
      return {
        valid: false,
        error: result.error,
      };
    }

    return {
      valid: true,
      user: {
        userId: result.payload.userId,
        username: result.payload.username,
        email: result.payload.email,
        role: result.payload.role,
        avatar: result.payload.avatar,
      },
    };
  }
}

// Export singleton instance
export const tokenService = TokenService.getInstance();
