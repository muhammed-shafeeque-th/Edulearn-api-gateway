import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { NotificationController } from '../controllers';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const notificationController = container.get<NotificationController>(TYPES.NotificationController);

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/',
  asyncHandler(
    notificationController.getNotifications.bind(notificationController)
  )
);

router.get(
  '/:notificationId',
  asyncHandler(
    notificationController.getNotification.bind(notificationController)
  )
);
router.delete(
  '/:notificationId',
  asyncHandler(
    notificationController.deleteNotification.bind(notificationController)
  )
);

router.patch(
  '/:notificationId/read',
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

router.patch(
  '/read-all',
  asyncHandler(
    notificationController.markAllAsRead.bind(notificationController)
  )
);

export { router as notificationRouterV1 };
