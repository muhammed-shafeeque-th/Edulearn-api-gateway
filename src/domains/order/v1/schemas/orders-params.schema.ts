import { GetOrdersRequest } from '@/domains/service-clients/order/proto/generated/order_service';
import { z, ZodType } from 'zod';

export const ordersParamsSchema: ZodType<GetOrdersRequest['params']> = z.object(
  {
    page: z
      .string()
      .optional()
      .transform(str =>
        typeof str === 'string' && str !== '' ? Number(str) : undefined
      ),
    sortOrder: z.string().optional(),
    pageSize: z
      .string()
      .optional()
      .transform(str =>
        typeof str === 'string' && str !== '' ? Number(str) : undefined
      ),
    status: z.string().optional(),
    // .refine(
    //   val =>
    //     val === undefined ||
    //     [
    //       'created',
    //       'pending_payment',
    //       'processing',
    //       'succeeded',
    //       'failed',
    //       'cancelled',
    //       'refunded',
    //       'expired',
    //     ].includes(val),
    //   {
    //     message:
    //       "Status must be one of: 'created', 'pending_payment', 'processing', 'succeeded', 'failed', 'cancelled', 'refunded', 'expired'",
    //   }
    // ),
  }
) as ZodType<GetOrdersRequest['params']>;

export type OrdersParamsDto = z.infer<typeof ordersParamsSchema>;
