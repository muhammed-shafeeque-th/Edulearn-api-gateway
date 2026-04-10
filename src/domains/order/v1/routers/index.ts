import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { OrderController } from '../controllers';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const orderController =  container.get<OrderController>(TYPES.OrderController);

//  ============================================================================
//                               ORDER ROUTES
//  ============================================================================

router.get(
  '/',
  asyncHandler(orderController.getOrdersByUser.bind(orderController))
);

router.get(
  '/:orderId',
  asyncHandler(orderController.getOrder.bind(orderController))
);
router.patch(
  '/:orderId/reset',
  asyncHandler(orderController.resetOrder.bind(orderController))
);
router.get(
  '/:orderId/status',
  asyncHandler(orderController.getOrderStatus.bind(orderController))
);

router.post(
  '/',
  asyncHandler(orderController.placeOrder.bind(orderController))
);

export { router as orderRoutesV1 };
