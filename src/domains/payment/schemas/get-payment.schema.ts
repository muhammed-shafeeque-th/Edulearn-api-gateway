import { GetPaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment_service';
import { z, ZodType } from 'zod';

export const getPaymentSchema: ZodType<GetPaymentRequest> = z.object({
  paymentId: z.string(),
});

export type GetPaymentSchemaType = z.infer<typeof getPaymentSchema>;
