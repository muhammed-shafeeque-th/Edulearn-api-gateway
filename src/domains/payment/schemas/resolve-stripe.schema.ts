import { StripeResolveRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/stripe';
import { z, ZodType } from 'zod';

export const resolveStripeSchema: ZodType<StripeResolveRequest> = z.object({
  sessionId: z.string(),
});

export type ResolvePaymentType = z.infer<typeof resolveStripeSchema>;
