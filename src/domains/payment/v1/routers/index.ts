import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { PaymentController } from '../controllers';
import { Router } from 'express';
import { container } from '@/services/di/di.config';
import { TYPES } from '@/services/di';
import { paymentEndpoints } from './route.constants';

const router = Router();

const payment = container.get<PaymentController>(TYPES.PaymentController);

//  ============================================================================
//                               PAYMENT ROUTES
//  ============================================================================

router.post(
  paymentEndpoints.create,
  asyncHandler(payment.createPayment.bind(payment))
);

router.post(
  paymentEndpoints.providerSession,
  asyncHandler(payment.createProviderSession.bind(payment))
);

router.patch(
  paymentEndpoints.resolve,
  asyncHandler(payment.resolvePayment.bind(payment))
);
router.patch(
  paymentEndpoints.cancel,
  asyncHandler(payment.cancelPayment.bind(payment))
);

router.get(
  paymentEndpoints.payment,
  asyncHandler(payment.getPayment.bind(payment))
);

export { router as paymentRoutesV1 };
