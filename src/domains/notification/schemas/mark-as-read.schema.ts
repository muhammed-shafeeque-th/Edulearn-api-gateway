import { MarkNotificationRequest } from '@/domains/service-clients/notification/proto/generated/notification';
import { z, ZodType } from 'zod';

export const markAsReadSchema: ZodType<MarkNotificationRequest> = z.object({
  notificationId: z.string(),
  userId: z.string(),
});

export type MarkAsReadSchemaType = z.infer<typeof markAsReadSchema>;
