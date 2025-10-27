import { blocklistMiddleware } from '../../middlewares/blocklist.middleware';
import { paymentRoutesV1 } from '../../domains/payment/routers/v1/payment.router';
import { Router } from 'express';

const router = Router();
router.use('/payments', paymentRoutesV1);

export { router as paymentRoutesV1 };
