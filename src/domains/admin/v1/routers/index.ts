import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { AdminController } from '../controllers';
import { Router } from 'express';
import { authGuard } from '@/middlewares/auth.middleware';
import { Permissions } from '@/shared/types';
import { RESPONSE_CACHE_KEYS } from '@/services/redis/cache-keys';
import { container, TYPES } from '@/services/di';
import { adminRateLimiter } from '@/services/security/ratelimiter';

const router = Router();

const userController = container.get<AdminController>(TYPES.AdminController);

router.post(
  '/auth/login',
  asyncHandler(userController.adminLogin.bind(userController))
);
router.post(
  '/auth/refresh',
  asyncHandler(userController.adminRefresh.bind(userController))
);
router.post(
  '/auth/logout',
  asyncHandler(userController.adminLogout.bind(userController))
);
router.get(
  '/users',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_MANAGE] }),
  adminRateLimiter,
  cacheMiddleware(
    30,
    req =>
      RESPONSE_CACHE_KEYS.userService.listUsers({
        page: Number(req.query.page),
        pageSize: Number(req.query.size),
      }),

    () => ['users:list']
  ),
  asyncHandler(userController.getUsers.bind(userController))
);
router.get(
  '/instructors',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_MANAGE] }),
  asyncHandler(userController.getAllInstructors.bind(userController))
);

router.delete(
  '/users/:userId',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_BLOCK] }),
  asyncHandler(userController.blockAccount.bind(userController))
);

router.patch(
  '/users/:userId/unblock-account',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_BLOCK] }),
  asyncHandler(userController.unblockAccount.bind(userController))
);

router.patch(
  '/users/:userId/block-account',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_BLOCK] }),
  asyncHandler(userController.blockAccount.bind(userController))
);

router.patch(
  '/instructors/:instructorId/unblock',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_BLOCK] }),
  asyncHandler(userController.unblockInstructor.bind(userController))
);

router.patch(
  '/instructors/:instructorId/block',
  authGuard({ roles: ['admin'], permissions: [Permissions.USER_BLOCK] }),
  asyncHandler(userController.blockInstructor.bind(userController))
);

router.get(
  '/system-overview',
  authGuard({ roles: ['admin'], permissions: [Permissions.ANALYTICS_VIEW] }),
  asyncHandler(userController.getSystemOverview.bind(userController))
);
router.get(
  '/revenue-stats',
  authGuard({ roles: ['admin'], permissions: [Permissions.ANALYTICS_VIEW] }),
  asyncHandler(userController.getRevenuesStats.bind(userController))
);
router.get(
  '/enrollment-trend',
  authGuard({ roles: ['admin'], permissions: [Permissions.ANALYTICS_VIEW] }),
  asyncHandler(userController.getEnrollmentTrend.bind(userController))
);
router.get(
  '/user-growth-trend',
  authGuard({ roles: ['admin'], permissions: [Permissions.ANALYTICS_VIEW] }),
  asyncHandler(userController.getUserGrowthTrend.bind(userController))
);
router.get(
  '/instructor-growth-trend',
  authGuard({ roles: ['admin'], permissions: [Permissions.ANALYTICS_VIEW] }),
  asyncHandler(userController.getInstructorGrowthTrend.bind(userController))
);

export { router as adminRoutesV1 };
