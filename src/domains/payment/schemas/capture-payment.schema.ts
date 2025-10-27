import { CapturePaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment-service';
import { z, ZodType } from 'zod';

export const capturePaypalPaySchema: ZodType<CapturePaymentRequest> = z.object({
  userId: z.string(),
  paymentId: z.string(),
  providerOrderId: z.string(),
});

export type CapturePaypalPayType = z.infer<typeof capturePaypalPaySchema>;
