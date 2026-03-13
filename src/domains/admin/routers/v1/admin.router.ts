import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { AdminController } from '../../controllers/v1/admin.controller';
import { Router } from 'express';
import { authenticate, authorize } from '@/middlewares/auth.middleware';
import { RESPONSE_CACHE_KEYS } from '@/services/redis/cache-keys';
import { container, TYPES } from '@/services/di';

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
  authenticate,
  authorize(['admin']),
  cacheMiddleware(
    30,
    req =>
      RESPONSE_CACHE_KEYS.userService.listUsers(
        {
          page: Number(req.query.page),
        pageSize: Number(req.query.size)
      }
      ),

    () => ['users:list']
  ),
  asyncHandler(userController.getUsers.bind(userController))
);
router.get(
  '/instructors',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getAllInstructors.bind(userController))
);

router.delete(
  '/users/:userId',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.blockUser.bind(userController))
);

router.patch(
  '/users/:userId/unblock',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.unBlockUser.bind(userController))
);

router.patch(
  '/users/:userId/block',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.blockUser.bind(userController))
);

router.get(
  '/system-overview',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getSystemOverview.bind(userController))
);
router.get(
  '/revenue-stats',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getRevenuesStats.bind(userController))
);
router.get(
  '/enrollment-trend',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getEnrollmentTrend.bind(userController))
);
router.get(
  '/user-growth-trend',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getUserGrowthTrend.bind(userController))
);
router.get(
  '/instructor-growth-trend',
  authenticate,
  authorize(['admin']),
  asyncHandler(userController.getInstructorGrowthTrend.bind(userController))
);

export { router as adminRoutesV1 };
