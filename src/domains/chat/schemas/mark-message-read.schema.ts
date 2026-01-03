import { MarkMessagesReadRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const markMessageReadSchema: ZodType<MarkMessagesReadRequest> = z.object(
  {
    conversationId: z.string().uuid(),
    messageId: z.string().uuid(),
    userId: z.string().uuid(),
  }
);

export type EditMessagesSchema = z.infer<typeof markMessageReadSchema>;
