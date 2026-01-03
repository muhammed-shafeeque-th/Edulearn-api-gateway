import { z, ZodType } from 'zod';
import { ClearUserNotificationsRequest } from '@/domains/service-clients/notification/proto/generated/notification';

export const clearNotificationsSchema: ZodType<ClearUserNotificationsRequest> =
  z.object({
    userId: z.string(),
  });

export type ClearNotificationsSchemaType = z.infer<
  typeof clearNotificationsSchema
>;
