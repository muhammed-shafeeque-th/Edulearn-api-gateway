import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CartController } from '../../controllers/v1/cart.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const cartController = container.get<CartController>(TYPES.CartController);

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/me',
  asyncHandler(cartController.getCurrentUserCart.bind(cartController))
);

router.get(
  '/:userId',
  asyncHandler(cartController.getUserCart.bind(cartController))
);

router.post('/me', asyncHandler(cartController.addToCart.bind(cartController)));

router.delete(
  '/',
  asyncHandler(cartController.removeFromCart.bind(cartController))
);
router.delete(
  '/me',
  asyncHandler(cartController.clearCart.bind(cartController))
);

export { router as cartRoutesV1 };
