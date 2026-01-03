import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';
import { ListUserConversationsRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const getConversationsSchema: ZodType<ListUserConversationsRequest> =
  z.object({
    userId: z.string().uuid(),
    pagination: paginationSchema
  });

export type GetConversationsSchemaType = z.infer<typeof getConversationsSchema>;
