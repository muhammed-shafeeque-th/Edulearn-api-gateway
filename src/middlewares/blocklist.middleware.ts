import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/shared/utils/errors/unauthenticate.error';
import { UserAccessService } from '@/services/user-blocklist.service';
import { UserProhibitedError } from '@/shared/utils/errors/user-prohibited.error';

export async function blocklistMiddleware(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const user = req.user;
    if (!user?.userId) {
      return next(new AuthenticationError());
    }

    const blocklistService = UserAccessService.getInstance();
    const isBlocked = await blocklistService.isUserBlocked(user.userId);

    if (isBlocked) {
      return next(new UserProhibitedError('Your account has been blocked. Please contact support for further assistance.'));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
