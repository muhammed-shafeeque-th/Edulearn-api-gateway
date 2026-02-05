import { PayPalResolveRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/paypal';
import { z, ZodType } from 'zod';

export const resolvePaypalSchema: ZodType<PayPalResolveRequest> = z.object({
  orderId: z.string(),
});

export type ResolvePaypalSchemaType = z.infer<typeof resolvePaypalSchema>;
