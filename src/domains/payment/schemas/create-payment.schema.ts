import { PlaceOrderRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { CreatePaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment-service';
import { z, ZodType } from 'zod';

export const createPaymentSchema: ZodType<CreatePaymentRequest> = z.object({
  orderId: z.string(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  amount: z.object({ amount: z.number(), currency: z.string() }),
  paymentGateway: z.enum(['paypal', 'razorpay', 'stripe']),
  /** For ensuring idempotency */
  idempotencyKey: z.string(),
  userId: z.string(),
});

export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
