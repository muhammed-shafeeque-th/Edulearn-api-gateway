import { Request, Response, NextFunction } from 'express';
import { AuthenticationError } from '@/shared/errors/unauthenticate.error';
import { AccountAccessService } from '@/services/account-access.service';
import { UserProhibitedError } from '@/shared/errors/user-prohibited.error';
import { container, TYPES } from '@/services/di';

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

    const accountAccessService = container.get<AccountAccessService>(TYPES.AccountAccessService);
    const isBlocked = await accountAccessService.isAccountBlocked(user.userId);

    if (isBlocked) {
      return next(new UserProhibitedError('Your account has been blocked. Please contact support for further assistance.'));
    }

    return next();
  } catch (err) {
    return next(err);
  }
}
