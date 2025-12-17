import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { NotificationController } from '../../controllers/v1/notification.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const notificationController = new NotificationController();

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/',
  authenticate,
  asyncHandler(
    notificationController.getNotifications.bind(notificationController)
  )
);

router.get(
  '/:notificationId',
  authenticate,
  asyncHandler(
    notificationController.getNotification.bind(notificationController)
  )
);
router.delete(
  '/:notificationId',
  authenticate,
  asyncHandler(
    notificationController.deleteNotification.bind(notificationController)
  )
);

router.patch(
  '/:notificationId/read',
  authenticate,
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

router.patch(
  '/all-read',
  authenticate,
  asyncHandler(
    notificationController.markAllAsRead.bind(notificationController)
  )
);

export { router as notificationRoutesV1 };
