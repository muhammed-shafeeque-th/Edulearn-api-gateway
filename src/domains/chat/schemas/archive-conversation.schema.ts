import { ArchiveConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const archiveConversationSchema: ZodType<ArchiveConversationRequest> =
  z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
  });

export type ArchiveConversationSchema = z.infer<
  typeof archiveConversationSchema
>;
