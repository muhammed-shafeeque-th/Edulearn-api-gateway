import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CartController } from '../controllers/cart.controller';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { cartEndpoints } from './route.constants';

const router = Router();

const cartController = container.get<CartController>(TYPES.CartController);

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  cartEndpoints.myCarts,
  asyncHandler(cartController.getCurrentUserCart.bind(cartController))
);

router.get(
  cartEndpoints.userCart,
  asyncHandler(cartController.getUserCart.bind(cartController))
);

router.post(
  cartEndpoints.myCarts,
  asyncHandler(cartController.addToCart.bind(cartController))
);

router.delete(
  cartEndpoints.carts,
  asyncHandler(cartController.removeFromCart.bind(cartController))
);
router.delete(
  cartEndpoints.myCarts,
  asyncHandler(cartController.clearCart.bind(cartController))
);

export { router as cartRouter };
