import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { PaymentController } from '../controllers';
import { Router } from 'express';
import { container, TYPES } from '@/services/di';

const router = Router();

const payment = container.get<PaymentController>(TYPES.PaymentController);

//  ============================================================================
//                               PAYMENT ROUTES
//  ============================================================================

router.post('/create', asyncHandler(payment.createPayment.bind(payment)));

router.post(
  '/:paymentId/session',
  asyncHandler(payment.createProviderSession.bind(payment))
);

router.patch(
  '/:provider/resolve',
  asyncHandler(payment.resolvePayment.bind(payment))
);
router.patch(
  '/:provider/cancel',
  asyncHandler(payment.cancelPayment.bind(payment))
);

router.get('/:paymentId', asyncHandler(payment.getPayment.bind(payment)));

export { router as paymentRoutesV1 };
