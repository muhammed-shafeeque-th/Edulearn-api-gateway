import { JwtPayload as StandardJwtPayload } from 'jsonwebtoken';
/**
 * Custom JWT Payload extending standard claims
 */
export interface TokenPayload extends StandardJwtPayload {
  userId: string;
  username: string;
  email: string;
  role: string;
  avatar?: string;
  tokenType: 'access' | 'refresh';
  sessionId?: string;
  deviceId?: string;
  permissions?: string[];
}

/**
 * Cookie options interface
 */
export interface CookieOptions {
  expires?: Date;
  httpOnly?: boolean;
  maxAge?: number;
  sameSite?: 'strict' | 'lax' | 'none' | boolean;
  secure?: boolean;
  path?: string;
  domain?: string;
}

/**
 * Token verification result
 */
export interface TokenVerificationResult {
  valid: boolean;
  payload?: TokenPayload;
  expired?: boolean;
  error?: string;
}

export interface TokenPair {
  accessToken: string;
  refreshToken: string;
}

export interface ITokenOptions {
  expires?: Date;
  maxAge?: number;
  httpOnly: boolean;
  sameSite: 'lax' | 'strict' | 'none' | undefined;
  secure?: boolean;
  path?: string;
  domain?: string;
}
