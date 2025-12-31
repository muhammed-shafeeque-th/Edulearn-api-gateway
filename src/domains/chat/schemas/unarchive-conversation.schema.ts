import { ArchiveConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const unArchiveConversationSchema: ZodType<ArchiveConversationRequest> =
  z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
  });

export type UnArchiveConversationSchema = z.infer<
  typeof unArchiveConversationSchema
>;
