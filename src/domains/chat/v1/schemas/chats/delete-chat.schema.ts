import { DeleteChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const deleteChatSchema: ZodType<DeleteChatRequest> =
  z.object({
    userId: z.string().uuid(),
    chatId: z.string().uuid(),
  });

export type DeleteChatSchema = z.infer<typeof deleteChatSchema>;
