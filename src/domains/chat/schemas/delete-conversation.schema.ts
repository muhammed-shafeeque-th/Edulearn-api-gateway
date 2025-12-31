import { DeleteConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const deleteConversationSchema: ZodType<DeleteConversationRequest> =
  z.object({
    userId: z.string().uuid(),
    conversationId: z.string().uuid(),
  });

export type DeleteConversationSchema = z.infer<typeof deleteConversationSchema>;
