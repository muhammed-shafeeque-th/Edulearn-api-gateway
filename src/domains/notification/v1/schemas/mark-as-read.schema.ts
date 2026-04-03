import { MarkNotificationRequest } from '@/domains/service-clients/notification/proto/generated/notification';
import { z, ZodType } from 'zod';

export const markAsReadSchema: ZodType<MarkNotificationRequest> = z.object({
  notificationId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type MarkAsReadSchemaType = z.infer<typeof markAsReadSchema>;
