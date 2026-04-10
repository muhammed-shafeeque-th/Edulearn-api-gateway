import { GetOrderByIdRequest, RestoreOrderRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';

export const restoreOrderSchema: ZodType<RestoreOrderRequest> = z.object({
  orderId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type GetOrderByIdDto = z.infer<typeof restoreOrderSchema>;
