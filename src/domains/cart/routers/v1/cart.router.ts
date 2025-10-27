import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { CartController } from '../../controllers/v1/cart.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const cartController = new CartController();

//  ============================================================================
//                               CART ROUTES
//  ============================================================================

router.get(
  '/me',
  authenticate,
  asyncHandler(cartController.getCurrentUserCart.bind(cartController))
);

router.get(
  '/:userId',
  authenticate,
  asyncHandler(cartController.getUserCart.bind(cartController))
);

router.post(
  '/me',
  authenticate,
  asyncHandler(cartController.addToCart.bind(cartController))
);

router.delete(
  '/:cartId/:courseId',
  authenticate,
  asyncHandler(cartController.removeFromCart.bind(cartController))
);


export { router as cartRoutes };
