import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { WishlistController } from '../controllers/wishlist.controller';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { wishlistEndpoints } from './route.constants';

const router = Router();

const wishlistController = container.get<WishlistController>(
  TYPES.WishlistController
);

//  ============================================================================
//                               WISHLIST ROUTES
//  ============================================================================

router.get(
  wishlistEndpoints.myWishlist,
  asyncHandler(
    wishlistController.getCurrentUserWishlist.bind(wishlistController)
  )
);

router.get(
  wishlistEndpoints.userWishlist,
  asyncHandler(wishlistController.getUserWishlist.bind(wishlistController))
);

// router.post(
//   wishlistEndpoints. me',
//   asyncHandler(wishlistController.addToWishlist.bind(wishlistController))
// );
router.post(
  wishlistEndpoints.myWishlist,
  asyncHandler(wishlistController.toggleWishlistItem.bind(wishlistController))
);

router.delete(
  wishlistEndpoints.myWishlist,
  asyncHandler(wishlistController.removeFromWishlist.bind(wishlistController))
);

export { router as wishlistRouter };
