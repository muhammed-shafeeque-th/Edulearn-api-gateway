import { z, ZodType } from 'zod';
import { DeleteNotificationRequest } from '@/domains/service-clients/notification/proto/generated/notification';

export const deleteNotificationSchema: ZodType<DeleteNotificationRequest> =
  z.object({
    userId: z.string().uuid(),
    notificationId: z.string().uuid(),
  });

export type GetNotificationSchemaType = z.infer<
  typeof deleteNotificationSchema
>;
