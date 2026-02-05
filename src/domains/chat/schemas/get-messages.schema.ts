import {
  ArchiveChatRequest,
  GetMessagesRequest,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';
import { paginationSchema } from './pagination.schema';

export const getMessagesSchema: ZodType<GetMessagesRequest> = z.object({
  userId: z.string().uuid(),
  chatId: z.string().uuid(),
  pagination: paginationSchema.default({
    page: 1,
    pageSize: 10,
  }),
}) as ZodType<GetMessagesRequest>;

export type ArchiveChatSchema = z.infer<typeof getMessagesSchema>;
