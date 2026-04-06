import { z, ZodType } from 'zod';
import { resolveStripeSchema } from './resolve-stripe.schema';
import { resolveRazorpaySchema } from './resolve-razorpay.schema';
import { resolvePaypalSchema } from './resolve-paypal.schema2';
import { ResolvePaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { Provider } from '@/domains/service-clients/payment/proto/generated/payment/common';

export const resolvePaymentSchema: ZodType<ResolvePaymentRequest> = z.object({
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
  stripe: resolveStripeSchema.optional(),
  razorpay: resolveRazorpaySchema.optional(),
  paypal: resolvePaypalSchema.optional(),
}) as unknown as ZodType<ResolvePaymentRequest>;

export type ResolvePaymentType = z.infer<typeof resolvePaymentSchema>;
