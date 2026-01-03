import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/shared/utils/errors/unauthenticate.error';
import { UserAccessService } from '@/services/user-blocklist.service';
import { UserProhibitedError } from '@/shared/utils/errors/user-prohibited.error';

/**
 * Middleware to check if the current authenticated user is blocked.
 * Throws UserProhibitedError if the user is blocked.
 */
export async function blocklistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    if (!user?.userId) {
      // No authenticated user found in request
      return next(new AuthenticationError());
    }

    const blocklistService = UserAccessService.getInstance();
    const isBlocked = await blocklistService.isUserBlocked(user.userId);

    if (isBlocked) {
      // User is prohibited from accessing the resource
      return next(new UserProhibitedError('Your account has been blocked. Please contact support for further assistance.'));
    }

    return next();
  } catch (err) {
    // Pass any unexpected errors to the global error handler
    return next(err);
  }
}
