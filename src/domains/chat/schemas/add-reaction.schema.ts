import {
  AddReactionRequest,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const addReactionSchema: ZodType<AddReactionRequest> = z.object({
  conversationId: z.string().uuid(),
  /** user sending message */
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  emoji: z.string(),
});

export type EditMessagesSchema = z.infer<typeof addReactionSchema>;
