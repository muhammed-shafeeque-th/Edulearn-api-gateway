import { z, ZodType } from 'zod';
import { GetNotificationsRequest } from '@/domains/service-clients/notification/proto/generated/notification';
import { notificationParamsSchema } from './pagination.schema';

export const getNotificationsSchema: ZodType<GetNotificationsRequest> =
  z.object({
    userId: z.string(),
    params: notificationParamsSchema,
  });

export type GetNotificationsSchemaType = z.infer<typeof getNotificationsSchema>;
