import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CartController } from '../controllers/cart.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const cartController = container.get<CartController>(TYPES.CartController);

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/me/carts',
  asyncHandler(cartController.getCurrentUserCart.bind(cartController))
);

router.get(
  '/:userId/carts',
  asyncHandler(cartController.getUserCart.bind(cartController))
);

router.post('/me/carts', asyncHandler(cartController.addToCart.bind(cartController)));

router.delete(
  '/carts',
  asyncHandler(cartController.removeFromCart.bind(cartController))
);
router.delete(
  '/me/carts',
  asyncHandler(cartController.clearCart.bind(cartController))
);




export { router as cartRouter };
