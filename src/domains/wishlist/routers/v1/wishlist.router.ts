import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WishlistController } from '../../controllers/v1/wishlist.controller';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const wishlistController = container.get<WishlistController>(TYPES.WishlistController);

//  ============================================================================
//                               WISHLIST ROUTES
//  ============================================================================

router.get(
  '/me',
  asyncHandler(
    wishlistController.getCurrentUserWishlist.bind(wishlistController)
  )
);

router.get(
  '/:userId',
  asyncHandler(wishlistController.getUserWishlist.bind(wishlistController))
);

// router.post(
//   '/me',
//   asyncHandler(wishlistController.addToWishlist.bind(wishlistController))
// );
router.post(
  '/me',
  asyncHandler(wishlistController.toggleWishlistItem.bind(wishlistController))
);

router.delete(
  '/',
  asyncHandler(wishlistController.removeFromWishlist.bind(wishlistController))
);

export { router as wishlistRoutesV1 };
