import { Router } from 'express';
import { cartRouter } from './cart.router';
import { wishlistRouter } from './wishlist.router';
import { userRouter } from './users.router';
import { walletRouter } from './wallet.router';
import { authGuard } from '@/middlewares/auth.middleware';
import { blocklistMiddleware } from '@/middlewares/blocklist.middleware';

const router = Router();

router.use(userRouter)
router.use(authGuard(), blocklistMiddleware, cartRouter)
router.use(authGuard(), blocklistMiddleware, wishlistRouter)
router.use(authGuard(), blocklistMiddleware, walletRouter)

export { router as userRouterV1 }