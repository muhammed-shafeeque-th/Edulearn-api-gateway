import { config } from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AuthenticationError } from '@/shared/utils/errors/unauthenticate.error';
import { AuthorizationError } from '@/shared/utils/errors/unauthorize.error';
import { USER_ROLE } from '@/shared/types/user-types';

type JwtPayload = {
  username: string;
  email: string;
  userId: string;
  role: string;
  avatar?: string;
} & StandardJwtClaims;

export interface StandardJwtClaims {
  iat: number;
  iss: string;
  aud: string;
  jti: string;
  exp?: number;
  sub?: string;
}

export const authenticate = (
  req: Request,
  res: Response,
  next: NextFunction
) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    throw new AuthenticationError(
      'Authentication failed: Token is missing or invalid.'
    );
  }
  try {
  
    const decoded = jwt.verify(
      token,
      config.jwt.accessTokenSecret
    ) as JwtPayload;
    req.user = {
      userId: decoded.userId,
      username: decoded.username,
      avatar: decoded.avatar,
      role: decoded.role as USER_ROLE,
      email: decoded.email,
    };
    req.authToken = req.headers.authorization;
  } catch (error) {
    next(new AuthenticationError('Authentication failed! Invalid token.'));
  }
  next();
};

export const authorize =
  (roles: USER_ROLE[] = []) => (req: Request, res: Response, next: NextFunction) => {
    if (!req.user || !roles.includes(req.user.role)) {
      throw new AuthorizationError('Access denied for requested resource');
    }
    next();
  };

/**
   * export const authenticate = async (
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> => {
  try {
    // Extract token from Authorization header
    const token = tokenService.extractToken(req);

    if (!token) {
      throw new AuthenticationError(
        'Authentication failed: Token is missing or invalid.'
      );
    }

    // Validate token format before verification
    if (!tokenService.isValidTokenFormat(token)) {
      throw new AuthenticationError(
        'Authentication failed: Token format is invalid.'
      );
    }

    // Verify the access token
    const verification = tokenService.verifyAccessToken(token);

    if (!verification.valid || !verification.payload) {
      if (verification.expired) {
        throw new AuthenticationError(
          'Authentication failed: Token has expired.'
        );
      }
      throw new AuthenticationError(
        verification.error || 'Authentication failed: Invalid token.'
      );
    }

    const { payload } = verification;

    // Attach user data to request
    req.user = {
      userId: payload.userId,
      username: payload.username,
      email: payload.email,
      role: payload.role,
      avatar: payload.avatar,
      sessionId: payload.sessionId,
      deviceId: payload.deviceId,
    };

    // Store original token and full payload for potential use
    req.authToken = req.headers.authorization;
    // req.token = payload;

    next();
  } catch (error) {
    next(error);
  }
};
*/

/**
 * Authorization middleware factory
 * Checks if user has required role(s)
 *
 * @param roles - Array of allowed roles
 * @returns Express middleware function
 */
/*
export const authorize = (roles: string | string[]) => {
  const allowedRoles = Array.isArray(roles) ? roles : [roles];

  return (req: Request, res: Response, next: NextFunction): void => {
    try {
      if (!req.user) {
        throw new AuthenticationError(
          'Authentication required to access this resource.'
        );
      }

      if (!allowedRoles.includes(req.user.role)) {
        throw new AuthorizationError(
          `Access denied. Required role(s): ${allowedRoles.join(', ')}`
        );
      }

      next();
    } catch (error) {
      next(error);
    }
  };
};

   */
