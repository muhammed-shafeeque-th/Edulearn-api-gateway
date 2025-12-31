import { PinConversationRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const pinConversationSchema: ZodType<PinConversationRequest> = z.object({
  userId: z.string().uuid(),
  conversationId: z.string().uuid(),
});

export type UpdateQuizDto = z.infer<typeof pinConversationSchema>;
