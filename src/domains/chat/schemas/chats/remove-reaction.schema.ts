import { RemoveReactionRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const removeReactionSchema: ZodType<RemoveReactionRequest> = z.object({
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  reactionId: z.string().uuid(),
});

export type EditMessagesSchema = z.infer<typeof removeReactionSchema>;
