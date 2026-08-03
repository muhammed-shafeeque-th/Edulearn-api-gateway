import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { NotificationController } from '../controllers';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { notificationEndpoints } from './route.constants';

const router = Router();

const notificationController = container.get<NotificationController>(
  TYPES.NotificationController
);

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  notificationEndpoints.base,
  asyncHandler(
    notificationController.getNotifications.bind(notificationController)
  )
);

router.get(
  notificationEndpoints.notification,
  asyncHandler(
    notificationController.getNotification.bind(notificationController)
  )
);
router.delete(
  notificationEndpoints.notification,
  asyncHandler(
    notificationController.deleteNotification.bind(notificationController)
  )
);

router.patch(
  notificationEndpoints.read,
  asyncHandler(notificationController.markAsRead.bind(notificationController))
);

router.patch(
  notificationEndpoints.readAll,
  asyncHandler(
    notificationController.markAllAsRead.bind(notificationController)
  )
);

export { router as notificationRouterV1 };
