import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { OrderController } from '../../controllers/v1/order.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const orderController = new OrderController();

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/',
  authenticate,
  asyncHandler(orderController.getOrdersByUser.bind(orderController))
);

router.get(
  '/:orderId',
  authenticate,
  asyncHandler(orderController.getOrder.bind(orderController))
);


router.post(
  '/',
  authenticate,
  asyncHandler(orderController.placeOrder.bind(orderController))
);



export { router as orderRoutesV1 };
