import { z, ZodSchema } from 'zod';
import { SendDiscussionMessageRequest } from '@/domains/service-clients/chat/proto/generated/chat_service';

export const sendDiscussionMessageSchema: ZodSchema<SendDiscussionMessageRequest> = z.object({
  roomId: z.string().uuid(),
  senderId: z.string().uuid(),
  senderRole: z.enum(['student', 'instructor']),
  content: z.string(),
  idempotencyKey: z.string(),
});

export type SendDiscussionMessageDto = z.infer<typeof sendDiscussionMessageSchema>;
