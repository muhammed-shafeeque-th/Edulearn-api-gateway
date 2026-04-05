import { config } from '@/config';
import { Request, Response, NextFunction } from 'express';
import jwt, { JwtPayload } from 'jsonwebtoken';
import { AuthenticationError } from '@/shared/errors/unauthenticate.error';
import { AuthorizationError } from '@/shared/errors/unauthorize.error';
import { Permissions } from '@/shared/types';
import { AccountBlockedError } from '@/shared/errors/account-blocked.error';
import { InstructorAccessDeniedError } from '@/shared/errors/instructor-access-denied.error';

type JWTPayload = {
  username: string;
  email: string;
  userId: string;
  roles: string[];
  permissions: string[];
  avatar?: string;
} & JwtPayload;

import { TokenService } from '@/services/auth-token/token.service';
import { container, TYPES } from '@/services/di';
import { AccountAccessService } from '@/services/account-access.service';
import { USER_ROLE } from '@/domains/auth/v1/types';

interface AuthGuardOptions {
  roles?: USER_ROLE[];
  permissions?: Permissions[];
}

export const authGuard =
  (options?: AuthGuardOptions) =>
  async (req: Request, res: Response, next: NextFunction) => {
    const token = req.headers.authorization?.split(' ')[1];

    if (!token) {
      return next(
        new AuthenticationError(
          'Authentication failed: Token is missing or invalid.'
        )
      );
    }

    try {
      const tokenService = container.get<TokenService>(TYPES.TokenService);
      const accessService = container.get<AccountAccessService>(
        TYPES.AccountAccessService
      );
      const decoded = tokenService.verifyAccessToken(token) as JWTPayload;

      if (!decoded) {
        return next(
          new AuthenticationError(
            'Authentication failed: Invalid token payload.'
          )
        );
      }

      if (decoded.jti) {
        const isRevoked = await tokenService.isTokenRevoked(decoded.jti);
        if (isRevoked) {
          return next(
            new AuthenticationError('Authentication failed: Token revoked.')
          );
        }
      }

      // High-performance Redis check for global revocation (immediate blocking)
      const isUserBlocked = await accessService.isAccountBlocked(
        decoded.userId
      );
      if (isUserBlocked) {
        return next(new AccountBlockedError());
      }

      req.user = {
        userId: decoded.userId,
        username: decoded.username,
        avatar: decoded.avatar,
        roles: (decoded.roles || [decoded.role]) as USER_ROLE[],
        email: decoded.email,
        permissions: decoded.permissions || [],
      };
      req.authToken = req.headers.authorization;

      // RBAC & ABAC Enforcement check
      if (options?.roles && options.roles.length > 0) {
        const hasRole = options.roles.some(r => req.user!.roles.includes(r));
        if (!hasRole) {
          return next(
            new AuthorizationError('Access denied for requested resource')
          );
        }
        const roleChecks = await Promise.all(
          options.roles.map(async r => {
            // Check Redis for real-time revocation
            const isRoleBlocked = await accessService.isUserRoleBlocked(
              req.user!.userId,
              r
            );
            return !isRoleBlocked;
          })
        );

        const hasActiveMatchedRole = roleChecks.every(active => active);

        if (!hasActiveMatchedRole) {
          // If the route specifically required instructor and it's failing due to a block
          if (options.roles.includes('instructor' as USER_ROLE)) {
            return next(new InstructorAccessDeniedError());
          }

          return next(
            new AuthorizationError(
              'Access denied: Matching role(s) have been blocked.'
            )
          );
        }
      }

      if (options?.permissions && options.permissions.length > 0) {
        const hasPerm = options.permissions.every(p =>
          req.user!.permissions?.includes(p)
        );
        if (!hasPerm) {
          return next(
            new AuthorizationError('Access denied: Insufficient Permissions')
          );
        }
      }

      next();
    } catch (error) {
      next(new AuthenticationError('Authentication failed! Invalid token.'));
    }
  };

export const authenticate = authGuard();

export const authorize = (roles: USER_ROLE[] = []) => {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return next(
        new AuthorizationError('Access denied for requested resource')
      );
    }

    const hasRole = roles.some(r => req.user!.roles.includes(r));
    if (!hasRole) {
      return next(
        new AuthorizationError('Access denied for requested resource')
      );
    }

    // Since this is the legacy wrapper, it doesn't await Redis checks.
    // The authGuard middleware already handles the real-time Redis checks above.
    next();
  };
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
