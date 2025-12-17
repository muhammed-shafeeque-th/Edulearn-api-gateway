import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';
import { CreatePaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { z, ZodType } from 'zod';

export const createPaymentSchema: ZodType<CreatePaymentRequest> = z.object({
  orderId: z.string(),
  successUrl: z.string().optional(),
  cancelUrl: z.string().optional(),
  provider: z
    .enum(['paypal', 'razorpay', 'stripe'])
    .transform((str): Provider => {
      switch (str) {
        case 'paypal':
          return Provider.PAYPAL;
        case 'razorpay':
          return Provider.RAZORPAY;
        case 'stripe':
          return Provider.STRIPE;
        default:
          throw new Error(
            'Invalid provider. Supported values are: paypal, razorpay, stripe'
          );
      }
    }),
  /** For ensuring idempotency */
  idempotencyKey: z.string(),
  userId: z.string(),
}) as unknown as ZodType<CreatePaymentRequest>;

export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
