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
import { container, TYPES } from '@/services/di';

const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.get('/csrf-token', authController.generateCsrfToken.bind(authController));

router.post(
  '/register',
  registerRateLimiter,
  asyncHandler(authController.registerUser.bind(authController))
);

router.post(
  '/oauth',
  asyncHandler(authController.oauthSign.bind(authController))
);

router.get(
  '/email-check',
  emailCheckRateLimiter,
  asyncHandler(authController.checkEmailAvailability.bind(authController))
);

router.post(
  '/login',
  loginRateLimiter,
  asyncHandler(authController.loginUser.bind(authController))
);

router.post(
  '/logout',
  authGuard(),
  asyncHandler(authController.logoutUser.bind(authController))
);

router.post(
  '/refresh',
  asyncHandler(authController.refreshToken.bind(authController))
);

router.post(
  '/verify',
  otpRateLimiter,
  asyncHandler(authController.verifyUser.bind(authController))
);

router.post(
  '/resend-otp',
  otpRateLimiter,
  asyncHandler(authController.resendOtp.bind(authController))
);

router.post(
  '/reset-password',
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  '/change-password',
  authGuard(),
  blocklistMiddleware,
  asyncHandler(authController.changePassword.bind(authController))
);

router.post(
  '/forgot-password',
  forgotPasswordRateLimiter,
  asyncHandler(authController.forgotPassword.bind(authController))
);

export { router as authRoutesV1 };

