import { PlaceOrderRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import {  RazorpayVerifyPaymentRequest } from '@/domains/service-clients/payment/proto/generated/payment-service';
import { z, ZodType } from 'zod';


export const verifyRazorPaySchema: ZodType<RazorpayVerifyPaymentRequest> = z.object({
  razorpayPaymentId: z.string(),
  paymentId: z.string(),
  razorpayOrderId: z.string(),
  razorpaySignature: z.string(),
});

export type VerifyRazorPayType = z.infer<typeof verifyRazorPaySchema>;
