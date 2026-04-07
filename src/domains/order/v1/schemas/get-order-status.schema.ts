import {  GetOrderStatusRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';

export const getOrderStatusSchema: ZodType<GetOrderStatusRequest> = z.object({
  orderId: z.string().uuid(),
});

export type GetOrderByIdDto = z.infer<typeof getOrderStatusSchema>;
