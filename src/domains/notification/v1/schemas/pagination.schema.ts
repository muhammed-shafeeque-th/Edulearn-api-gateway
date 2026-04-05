import { NotificationParams } from '@/domains/service-clients/notification/proto/generated/notification';
import { z, ZodType } from 'zod';

export const notificationParamsSchema: ZodType<NotificationParams> = z.object({
  page: z
    .string()
    .default('1')
    .transform(str => Number(str)),
  pageSize: z
    .string()
    .default('10')
    .transform(str => Number(str)),
  /** Filter by read status */
  isRead: z
    .string()
    .optional()
    .transform(val => (val === undefined ? undefined : val === 'true')),
  /** Filter by notification type */
  category: z.string().optional(),
}) as unknown as ZodType<NotificationParams>;

export type NotificationParamsType = z.infer<typeof notificationParamsSchema>;
