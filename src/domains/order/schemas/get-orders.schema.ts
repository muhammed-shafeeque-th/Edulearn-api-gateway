import { GetOrdersRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';
import { ordersParamsSchema } from './orders-params.schema';

export const getOrdersByUserSchema: ZodType<GetOrdersRequest> = z.object({
  userId: z.string().uuid(),
  params: ordersParamsSchema
    .default({
      page: 1,
      pageSize: 12,
      sortOrder: 'desc',
      status: undefined,
    })
    .transform(val => ({
      ...val,
      status: val.status ?? undefined,
    })),
}) as ZodType<GetOrdersRequest>;

export type GetOrdersByUserDto = z.infer<typeof getOrdersByUserSchema>;
