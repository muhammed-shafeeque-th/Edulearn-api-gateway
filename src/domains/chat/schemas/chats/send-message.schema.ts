import { SendMessageRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const sendMessagesSchema: ZodType<SendMessageRequest> = z.object({
  chatId: z.string().uuid(),
  /** user sending message */
  senderId: z.string().uuid(),
  idempotencyKey: z.string(),
  content: z.string(),
});

export type SendMessagesSchema = z.infer<typeof sendMessagesSchema>;
