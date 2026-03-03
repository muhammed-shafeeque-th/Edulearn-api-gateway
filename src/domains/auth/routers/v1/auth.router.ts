import { asyncHandler } from '@/shared/utils/async-handler';
import { Router } from 'express';
import { AuthController } from '@/domains/auth/controllers/v1/auth.controller';
import { authenticate } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';
import { container, TYPES } from '@/services/di';


const router = Router();

const authController = container.get<AuthController>(TYPES.AuthController);

router.post(
  '/register',
  asyncHandler(authController.registerUser.bind(authController))
);

router.post(
  '/oauth',
  asyncHandler(authController.oauthSign.bind(authController))
);

router.get(
  '/email-check',
  asyncHandler(authController.checkEmailAvailability.bind(authController))
);

router.post(
  '/login',
  asyncHandler(authController.loginUser.bind(authController))
);

router.post(
  '/logout',
  authenticate,
  asyncHandler(authController.logoutUser.bind(authController))
);

router.post(
  '/refresh',
  asyncHandler(authController.refreshToken.bind(authController))
);

router.post(
  '/verify',
  asyncHandler(authController.verifyUser.bind(authController))
);

router.post(
  '/resend-otp',
  asyncHandler(authController.resendOtp.bind(authController))
);

router.post(
  '/reset-password',
  asyncHandler(authController.resetPassword.bind(authController))
);

router.post(
  '/change-password',
  authenticate,
  blocklistMiddleware,
  asyncHandler(authController.changePassword.bind(authController))
);

router.post(
  '/forgot-password',
  asyncHandler(authController.forgotPassword.bind(authController))
);
export { router as authRoutesV1 };
