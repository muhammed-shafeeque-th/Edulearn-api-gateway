import { RazorpayVerifyRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/razorpay';
import { z, ZodType } from 'zod';

export const verifyRazorpaySchema: ZodType<RazorpayVerifyRequest> = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type VerifyPaymentType = z.infer<typeof verifyRazorpaySchema>;
