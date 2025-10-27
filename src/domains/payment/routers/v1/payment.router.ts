import { asyncHandler } from '@/shared/utils/async-handler';
import { cacheMiddleware } from '@/middlewares/cache.middleware';
import { PaymentController } from '../../controllers/v1/payment.controller';
import { Router } from 'express';
import { authenticate } from '@/middlewares/auth.middleware';

const router = Router();

const payment = new PaymentController();

//  ============================================================================
//                               PAYMENT ROUTES
//  ============================================================================

router.post(
  '/:provider/create',
  authenticate,
  asyncHandler(payment.createPayment.bind(payment))
);
router.get(
  '/:provider/status/:id',
  authenticate,
  // asyncHandler(payment.getOrdersByUser.bind(payment))
);

router.post(
  '/razorpay/verify',
  authenticate,
  asyncHandler(payment.verifyRazorPayPayment.bind(payment))
);


router.post(
  '/paypal/capture',
  asyncHandler(payment.capturePaypalPayment.bind(payment))
);



export { router as paymentRoutesV1 };
