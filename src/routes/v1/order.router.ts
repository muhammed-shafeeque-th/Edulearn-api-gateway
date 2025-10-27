import { blocklistMiddleware } from '../../middlewares/blocklist.middleware';
import { orderRoutesV1 } from '../../domains/order/routers/v1/order.router';
import { Router } from 'express';

const router = Router();
router.use('/orders', orderRoutesV1);

export { router as orderRoutesV1 };
