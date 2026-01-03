import { z, ZodType } from 'zod';
import { GetNotificationRequest } from '@/domains/service-clients/notification/proto/generated/notification';

export const getNotificationSchema: ZodType<GetNotificationRequest> = z.object({
  userId: z.string(),
  notificationId: z.string(),
});

export type GetNotificationSchemaType = z.infer<typeof getNotificationSchema>;
