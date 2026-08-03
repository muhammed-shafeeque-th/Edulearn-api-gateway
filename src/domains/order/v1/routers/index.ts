import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { OrderController } from '../controllers';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { orderEndpoints } from './route.constants';

const router = Router();

const orderController = container.get<OrderController>(TYPES.OrderController);

//  ============================================================================
//                               ORDER ROUTES
//  ============================================================================

router.get(
  orderEndpoints.base,
  asyncHandler(orderController.getOrdersByUser.bind(orderController))
);

router.get(
  orderEndpoints.order,
  asyncHandler(orderController.getOrder.bind(orderController))
);
router.patch(
  orderEndpoints.orderReset,
  asyncHandler(orderController.resetOrder.bind(orderController))
);
router.get(
  orderEndpoints.status,
  asyncHandler(orderController.getOrderStatus.bind(orderController))
);

router.post(
  orderEndpoints.base,
  asyncHandler(orderController.placeOrder.bind(orderController))
);

export { router as orderRoutesV1 };
