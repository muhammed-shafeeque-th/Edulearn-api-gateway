import {
  ArchiveConversationRequest,
  GetMessagesRequest,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';

export const getMessagesSchema: ZodType<GetMessagesRequest> = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
  pagination: paginationSchema.default({
    page: 1,
    pageSize: 10,
  }),
}) as ZodType<GetMessagesRequest>;

export type ArchiveConversationSchema = z.infer<typeof getMessagesSchema>;
