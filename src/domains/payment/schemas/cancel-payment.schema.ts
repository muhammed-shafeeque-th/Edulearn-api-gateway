import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';
import { CancelPaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { z, ZodType } from 'zod';

export const cancelPaymentSchema: ZodType<CancelPaymentRequest> = z.object({
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
  providerOrderId: z.string(),
}) as unknown as  ZodType<CancelPaymentRequest>;

export type CancelPaymentSchemaType = z.infer<typeof cancelPaymentSchema>;
