import { SendMessageRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const sendMessagesSchema: ZodType<SendMessageRequest> = z.object({
  conversationId: z.string().uuid(),
  /** user sending message */
  senderId: z.string().uuid(),
  receiverId: z.string().uuid(),
  type: z.string().optional(),
  metadata: z.record(z.string(), z.string()),
  /** required for deterministic conv creation */
  studentId: z.string(),
  instructorId: z.string(),
  content: z.string(),
});

export type SendMessagesSchema = z.infer<typeof sendMessagesSchema>;
