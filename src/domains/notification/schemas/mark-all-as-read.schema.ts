import { MarkAllNotificationsRequest } from '@/domains/service-clients/notification/proto/generated/notification';
import { z, ZodType } from 'zod';

export const markAllAsReadSchema: ZodType<MarkAllNotificationsRequest> =
  z.object({
    userId: z.string(),
  });

export type MarkAllAsReadSchemaType = z.infer<typeof markAllAsReadSchema>;
