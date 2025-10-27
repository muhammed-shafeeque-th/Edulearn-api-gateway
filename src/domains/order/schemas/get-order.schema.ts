import { GetOrderByIdRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';

export const getOrderByIdSchema: ZodType<GetOrderByIdRequest> = z.object({
  orderId: z.string(),
  userId: z.string(),
});

export type GetOrderByIdDto = z.infer<typeof getOrderByIdSchema>;
