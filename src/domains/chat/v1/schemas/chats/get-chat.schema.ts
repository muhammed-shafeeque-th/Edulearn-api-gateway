import { z, ZodType } from 'zod';
import { GetChatRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const getChatSchema: ZodType<GetChatRequest> = z.object({
  chatId: z.string().uuid(),
  userId: z.string().uuid(),
});

export type GetChatSchemaType = z.infer<typeof getChatSchema>;
