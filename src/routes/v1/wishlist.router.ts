import { blocklistMiddleware } from '../../middlewares/blocklist.middleware';
import { wishlistRoutes } from '../../domains/wishlist/routers/v1/wishlist.router';
import { Router } from 'express';

const router = Router();
router.use('/wishlists', wishlistRoutes);

export { router as wishlistRoutesV1 };
