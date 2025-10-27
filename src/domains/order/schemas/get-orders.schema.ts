import { GetOrderByUserIdRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';

export const getOrdersByUserSchema: ZodType<GetOrderByUserIdRequest> = z.object({
  userId: z.string(),
});

export type GetOrdersByUserDto = z.infer<typeof getOrdersByUserSchema>;
