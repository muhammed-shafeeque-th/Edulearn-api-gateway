import { RazorpayResolveRequest } from '@/domains/service-clients/payment/proto/generated/payment/types/razorpay';
import { z, ZodType } from 'zod';

export const resolveRazorpaySchema: ZodType<RazorpayResolveRequest> = z.object({
  razorpayOrderId: z.string(),
  razorpayPaymentId: z.string(),
  razorpaySignature: z.string(),
});

export type ResolvePaymentType = z.infer<typeof resolveRazorpaySchema>;
