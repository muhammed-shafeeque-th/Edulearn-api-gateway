import { PlaceOrderRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';


export const placeOrderSchema: ZodType<PlaceOrderRequest> = z.object({
  userId: z.string(),
  couponCode: z.string().optional(),
  courseIds: z.array(z.string()),
});

export type PlaceOrderDto = z.infer<typeof placeOrderSchema>;
