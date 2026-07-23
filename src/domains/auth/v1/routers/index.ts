import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { AuthController } from '../controllers';
import { authGuard } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import {
  loginRateLimiter,
  registerRateLimiter,
  otpRateLimiter,
  forgotPasswordRateLimiter,
  emailCheckRateLimiter,
} from '@/services/security/ratelimiter';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { authEndpoints } from './route.constants';

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.get(
  authEndpoints.csrfToken,
  authController.generateCsrfToken.bind(authController)
);

router.post(
  authEndpoints.register,
  registerRateLimiter,
  asyncHandler(authController.registerUser.bind(authController))
);

router.post(
  authEndpoints.oauth,
  asyncHandler(authController.oauthSign.bind(authController))
);

router.get(
  authEndpoints.emailCheck,
  emailCheckRateLimiter,
  asyncHandler(authController.checkEmailAvailability.bind(authController))
);

router.post(
  authEndpoints.login,
  loginRateLimiter,
  asyncHandler(authController.loginUser.bind(authController))
);

router.post(
  authEndpoints.logout,
  authGuard(),
  asyncHandler(authController.logoutUser.bind(authController))
);

router.post(
  authEndpoints.refresh,
  asyncHandler(authController.refreshToken.bind(authController))
);

router.post(
  authEndpoints.verify,
  otpRateLimiter,
  asyncHandler(authController.verifyUser.bind(authController))
);

router.post(
  authEndpoints.resendOtp,
  otpRateLimiter,
  asyncHandler(authController.resendOtp.bind(authController))
);

router.post(
  authEndpoints.resetPassword,
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  authEndpoints.changePassword,
  authGuard(),
  blocklistMiddleware,
  asyncHandler(authController.changePassword.bind(authController))
);

router.post(
  authEndpoints.forgotPassword,
  forgotPasswordRateLimiter,
  asyncHandler(authController.forgotPassword.bind(authController))
);

export { router as authRoutesV1 };
