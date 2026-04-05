import {
  CreatePaymentRequest,
  CreateProviderSessionRequest,
} from '@/domains/service-clients/payment/proto/generated/payment_service';
import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';
import { z, ZodType } from 'zod';

export const createPaymentSchema: ZodType<CreatePaymentRequest> = z.object({
  orderId: z.string().uuid(),
  idempotencyKey: z.string(),
  userId: z.string().uuid(),
}) as unknown as ZodType<CreatePaymentRequest>;

export const createProviderSessionSchema: ZodType<CreateProviderSessionRequest> =
  z.object({
    paymentId: z.string().uuid(),
    provider: z
      .enum(['paypal', 'razorpay', 'stripe'])
      .transform((str): Provider => {
        switch (str) {
          case 'razorpay':
            return Provider.RAZORPAY;
          case 'stripe':
            return Provider.STRIPE;
          case 'paypal':
            return Provider.PAYPAL;
          default:
            throw new Error(
              'Invalid provider. Supported values are: razorpay, stripe, paypal'
            );
        }
      }),
    successUrl: z.string().url().optional(),
    cancelUrl: z.string().url().optional(),
  }) as unknown as ZodType<CreateProviderSessionRequest>;

export type CreatePaymentType = z.infer<typeof createPaymentSchema>;
export type CreateProviderSessionType = z.infer<
  typeof createProviderSessionSchema
>;
