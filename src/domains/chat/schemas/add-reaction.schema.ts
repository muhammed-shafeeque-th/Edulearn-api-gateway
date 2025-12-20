import {
  AddReactionRequest,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const addReactionSchema: ZodType<AddReactionRequest> = z.object({
  conversationId: z.string(),
  /** user sending message */
  messageId: z.string(),
  userId: z.string(),
  emoji: z.string(),
});

export type EditMessagesSchema = z.infer<typeof addReactionSchema>;
