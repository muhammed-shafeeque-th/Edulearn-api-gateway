import {
  CreateProviderSessionRequest,
} from '@/domains/service-clients/payment/proto/generated/payment_service';
import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';
import { z, ZodType } from 'zod';


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

export type CreateProviderSessionType = z.infer<
  typeof createProviderSessionSchema
>;
