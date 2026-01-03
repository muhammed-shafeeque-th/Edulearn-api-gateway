import { EditMessageRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const editMessagesSchema: ZodType<EditMessageRequest> = z.object({
  conversationId: z.string().uuid(),
  /** user sending message */
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  content: z.string(),
});

export type EditMessagesSchema = z.infer<typeof editMessagesSchema>;
