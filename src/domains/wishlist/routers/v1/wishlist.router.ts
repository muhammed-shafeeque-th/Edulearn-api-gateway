import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WishlistController } from '../../controllers/v1/wishlist.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const wishlistController = new WishlistController();

//  ============================================================================
//                               WISHLIST ROUTES
//  ============================================================================

router.get(
  '/me',
  authenticate,
  asyncHandler(wishlistController.getCurrentUserWishlist.bind(wishlistController))
);

router.get(
  '/:userId',
  authenticate,
  asyncHandler(wishlistController.getUserWishlist.bind(wishlistController))
);

// router.post(
//   '/me',
//   authenticate,
//   asyncHandler(wishlistController.addToWishlist.bind(wishlistController))
// );
router.post(
  '/me',
  authenticate,
  asyncHandler(wishlistController.toggleWishlistItem.bind(wishlistController))
);

router.delete(
  '/:wishlistId/:courseId',
  authenticate,
  asyncHandler(wishlistController.removeFromWishlist.bind(wishlistController))
);


export { router as wishlistRoutes };
