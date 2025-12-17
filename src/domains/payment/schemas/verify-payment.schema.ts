import { z, ZodType } from 'zod';
import { verifyStripeSchema } from './verify-stripe.schema';
import { verifyRazorpaySchema } from './verify-razorpay.schema';
import { verifyPaypalSchema } from './verify-paypal.schema2';
import { VerifyPaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';

export const verifyPaymentSchema: ZodType<VerifyPaymentRequest> = z.object({
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
  stripe: verifyStripeSchema.optional(),
  razorpay: verifyRazorpaySchema.optional(),
  paypal: verifyPaypalSchema.optional(),
}) as unknown as ZodType<VerifyPaymentRequest>;

export type VerifyPaymentType = z.infer<typeof verifyPaymentSchema>;
