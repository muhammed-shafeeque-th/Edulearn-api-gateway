import { PinChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const pinChatSchema: ZodType<PinChatRequest> = z.object({
  userId: z.string().uuid(),
  chatId: z.string().uuid(),
});

export type UpdateQuizDto = z.infer<typeof pinChatSchema>;
