import {
  DeleteMessageRequest,
  EditMessageRequest,
} from '@/domains/service-clients/chat/proto/generated/chat_service';
import { z, ZodType } from 'zod';

export const deleteMessagesSchema: ZodType<DeleteMessageRequest> = z.object({
  conversationId: z.string().uuid(),
  /** user sending message */
  messageId: z.string().uuid(),
  userId: z.string().uuid(),
  // Accept forEveryOne from querystring as a string and convert to boolean
  forEveryOne: z
    .string()
    .default("false")
    .transform(str => str === 'true' ? true : false),
}) as unknown as ZodType<DeleteMessageRequest>;

export type EditMessagesSchema = z.infer<typeof deleteMessagesSchema>;
