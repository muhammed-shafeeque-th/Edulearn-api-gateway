import { StripeVerifyRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/stripe';
import { z, ZodType } from 'zod';

export const verifyStripeSchema: ZodType<StripeVerifyRequest> = z.object({
  sessionId: z.string(),
});

export type VerifyPaymentType = z.infer<typeof verifyStripeSchema>;
