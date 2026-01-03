import { PayPalVerifyRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/paypal';
import { z, ZodType } from 'zod';

export const verifyPaypalSchema: ZodType<PayPalVerifyRequest> = z.object({
  orderId: z.string(),
});

export type VerifyPaypalSchemaType = z.infer<typeof verifyPaypalSchema>;
