import { blocklistMiddleware } from '../../middlewares/blocklist.middleware';
import { cartRoutes } from '../../domains/cart/routers/v1/cart.router';
import { Router } from 'express';

const router = Router();
router.use('/carts', cartRoutes);

export { router as cartRoutesV1 };
