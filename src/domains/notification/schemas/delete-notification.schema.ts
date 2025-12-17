import { z, ZodType } from 'zod';
import { DeleteNotificationRequest } from '@/domains/service-clients/notification/proto/generated/notification';

export const deleteNotificationSchema: ZodType<DeleteNotificationRequest> =
  z.object({
    userId: z.string(),
    notificationId: z.string(),
  });

export type GetNotificationSchemaType = z.infer<
  typeof deleteNotificationSchema
>;
